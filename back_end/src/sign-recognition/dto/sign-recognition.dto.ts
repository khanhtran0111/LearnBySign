export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export class PredictFromLandmarksDto {
  handed: 'Left' | 'Right';
  landmarks: LandmarkPoint[];
}

export class PredictFromFeaturesDto {
  features: number[]; // length 63
}

export interface PredictionResult {
  label: string;
  confidence: number;
  class_index: number;
  raw_proba: number[];
}

export interface SmoothedPredictionResult extends PredictionResult {
  finalLabel: string | null;
  isStable: boolean;
  historyLength: number;
}
