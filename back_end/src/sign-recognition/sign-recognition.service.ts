import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  PredictFromLandmarksDto,
  PredictFromFeaturesDto,
  PredictionResult,
  SmoothedPredictionResult,
} from './dto/sign-recognition.dto';

interface PredictionHistory {
  classIndices: number[];
  lastUpdated: number;
}

@Injectable()
export class SignRecognitionService {
  private readonly logger = new Logger(SignRecognitionService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly historyMap = new Map<string, PredictionHistory>();
  
  // Constants
  private readonly HIST_SIZE = 7;
  private readonly CONF_THR = 0.60;
  private readonly MIN_HIST_LENGTH = 3;
  private readonly SESSION_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private configService: ConfigService) {
    const pythonServiceUrl = this.configService.get<string>(
      'PYTHON_INFER_BASE_URL',
      'http://localhost:8000',
    );
    
    this.axiosInstance = axios.create({
      baseURL: pythonServiceUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log(`Python inference service URL: ${pythonServiceUrl}`);
    
    // Clean up stale sessions every minute
    setInterval(() => this.cleanupStaleSessions(), 60000);
  }

  /**
   * Health check for Python inference service
   */
  async healthCheck(): Promise<{ status: string; classes: string[] }> {
    try {
      const response = await this.axiosInstance.get('/health');
      return {
        status: response.data.status,
        classes: response.data.available_classes,
      };
    } catch (error) {
      this.logger.error('Python service health check failed', error);
      throw new HttpException(
        'Python inference service is unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Predict from raw landmarks (21 points)
   */
  async predictFromLandmarks(
    dto: PredictFromLandmarksDto,
  ): Promise<PredictionResult> {
    try {
      const response = await this.axiosInstance.post('/predict/landmarks', {
        handed: dto.handed,
        landmarks: dto.landmarks,
      });
      
      return response.data;
    } catch (error) {
      this.handlePredictionError(error);
    }
  }

  /**
   * Predict from pre-computed features (63 floats)
   */
  async predictFromFeatures(
    dto: PredictFromFeaturesDto,
  ): Promise<PredictionResult> {
    try {
      const response = await this.axiosInstance.post('/predict/features', {
        features: dto.features,
      });
      
      return response.data;
    } catch (error) {
      this.handlePredictionError(error);
    }
  }

  /**
   * Predict with smoothing (stateful per session)
   */
  async predictWithSmoothing(
    sessionId: string,
    dto: PredictFromLandmarksDto | PredictFromFeaturesDto,
  ): Promise<SmoothedPredictionResult> {
    // Get raw prediction
    let prediction: PredictionResult;
    
    if ('landmarks' in dto) {
      prediction = await this.predictFromLandmarks(dto);
    } else {
      prediction = await this.predictFromFeatures(dto);
    }

    // Get or create session history
    let history = this.historyMap.get(sessionId);
    if (!history) {
      history = { classIndices: [], lastUpdated: Date.now() };
      this.historyMap.set(sessionId, history);
    }

    // Update history
    history.classIndices.push(prediction.class_index);
    if (history.classIndices.length > this.HIST_SIZE) {
      history.classIndices.shift();
    }
    history.lastUpdated = Date.now();

    // Determine if prediction is stable
    let finalLabel: string | null = null;
    let isStable = false;

    if (
      prediction.confidence >= this.CONF_THR &&
      history.classIndices.length >= this.MIN_HIST_LENGTH
    ) {
      const mostCommonClass = this.getMostCommonClass(history.classIndices);
      
      if (mostCommonClass === prediction.class_index) {
        finalLabel = prediction.label.toUpperCase(); // Normalize to uppercase
        isStable = true;
      }
    }

    return {
      ...prediction,
      label: prediction.label.toUpperCase(), // Normalize all labels to uppercase
      finalLabel,
      isStable,
      historyLength: history.classIndices.length,
    };
  }

  /**
   * Reset prediction history for a session
   */
  resetSession(sessionId: string): void {
    this.historyMap.delete(sessionId);
    this.logger.debug(`Session ${sessionId} history reset`);
  }

  /**
   * Get most common class from history using Counter logic
   */
  private getMostCommonClass(indices: number[]): number {
    const counts = new Map<number, number>();
    
    for (const idx of indices) {
      counts.set(idx, (counts.get(idx) || 0) + 1);
    }

    let mostCommon = indices[0];
    let maxCount = 0;

    for (const [idx, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = idx;
      }
    }

    return mostCommon;
  }

  /**
   * Clean up sessions that haven't been updated recently
   */
  private cleanupStaleSessions(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, history] of this.historyMap.entries()) {
      if (now - history.lastUpdated > this.SESSION_TTL) {
        this.historyMap.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} stale sessions`);
    }
  }

  /**
   * Handle prediction errors
   */
  private handlePredictionError(error: any): never {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.detail || error.message;
        
        if (status === 400) {
          throw new HttpException(
            `Invalid input: ${message}`,
            HttpStatus.BAD_REQUEST,
          );
        } else if (status >= 500) {
          throw new HttpException(
            'Python inference service error',
            HttpStatus.BAD_GATEWAY,
          );
        }
      } else if (error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'Cannot connect to Python inference service',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }

    this.logger.error('Prediction error', error);
    throw new HttpException(
      'Prediction failed',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
