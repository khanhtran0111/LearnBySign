"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, StopCircle, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

declare global {
  interface Window {
    Hands?: any;
    drawConnectors?: any;
    drawLandmarks?: any;
    HAND_CONNECTIONS?: any;
  }
}

interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

interface PredictionResult {
  label: string;
  confidence: number;
  finalLabel?: string | null;
  isStable?: boolean;
}

interface SignCameraProps {
  targetSign: string;
  onCorrectSign: () => void;
  onIncorrectSign?: () => void;
  sessionId?: string;
  autoAdvance?: boolean;
  showSuccessAnimation?: boolean;
}

export function SignCamera({
  targetSign,
  onCorrectSign,
  onIncorrectSign,
  sessionId = "default",
  autoAdvance = true,
  showSuccessAnimation = true,
}: SignCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string>("");
  const [handDetected, setHandDetected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastPredictionTime = useRef<number>(0);
  const isProcessingCorrect = useRef<boolean>(false);
  const targetSignRef = useRef<string>(targetSign);
  const PREDICTION_INTERVAL = 200;

  // Update targetSignRef when targetSign changes
  useEffect(() => {
    targetSignRef.current = targetSign;
    isProcessingCorrect.current = false;
    setCurrentPrediction(null);
    setShowSuccess(false);

  }, [targetSign, sessionId]);

  useEffect(() => {
    const loadMediaPipe = async () => {
      if (typeof window === "undefined") return;

      if (window.Hands) {
        setIsLoading(false);
        return;
      }

      try {
        const script1 = document.createElement("script");
        script1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
        script1.crossOrigin = "anonymous";
        document.body.appendChild(script1);

        const script2 = document.createElement("script");
        script2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";
        script2.crossOrigin = "anonymous";
        document.body.appendChild(script2);

        await new Promise((resolve) => {
          script2.onload = resolve;
        });

        setIsLoading(false);
      } catch (err) {
        setError("Failed to load MediaPipe library");
        console.error(err);
      }
    };

    loadMediaPipe();
  }, []);

  const startCamera = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !window.Hands) return;

    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      const hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      setIsRunning(true);
    } catch (err) {
      setError("Cannot access camera. Please allow camera permissions.");
      console.error(err);
    }
  }, []);

  const onResults = useCallback(
    async (results: any) => {
      if (!canvasRef.current) return;

      const canvasCtx = canvasRef.current.getContext("2d");
      if (!canvasCtx || !videoRef.current) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {

        setHandDetected(true);

        for (const landmarks of results.multiHandLandmarks) {
          if (window.drawConnectors && window.drawLandmarks && window.HAND_CONNECTIONS) {
            window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 2,
            });
            window.drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 1 });
          }
        }

        if (!isProcessingCorrect.current) {
          const now = Date.now();
          if (now - lastPredictionTime.current > PREDICTION_INTERVAL) {
            lastPredictionTime.current = now;
            await predictSign(results.multiHandLandmarks[0], results.multiHandedness[0]);
          }
        }
      } else {
        if (handDetected) {
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          console.log("❌ MẤT TAY - Không detect được");
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        }
        setHandDetected(false);
      }

      canvasCtx.restore();
    },
    [] // Empty deps - use refs for dynamic values
  );

  // Send prediction request
  const predictSign = async (landmarks: any[], handedness: any) => {
    try {
      const handed = handedness?.displayName || "Right";
      const currentSession = sessionId; // sessionId from props is fine

      // Convert landmarks to API format
      const landmarkPoints: LandmarkPoint[] = landmarks.map((lm: any) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
      }));

      // Call NestJS API with smoothing
      const response = await fetch(
        `http://localhost:3001/api/sign/predict/smooth?sessionId=${currentSession}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handed,
            landmarks: landmarkPoints,
          }),
        }
      );

      if (!response.ok) {
        console.error("❌ API Error:", response.status, response.statusText);
        throw new Error("Prediction failed");
      }

      const result: PredictionResult = await response.json();
      
      const currentTarget = targetSignRef.current;
      
      setCurrentPrediction(result);

      const useLabel = result.finalLabel || result.label;
      const highConfidence = result.confidence >= 0.85;
      
      if (useLabel && currentTarget && highConfidence && !isProcessingCorrect.current) {
        if (useLabel === currentTarget) {
          isProcessingCorrect.current = true;
          
          if (showSuccessAnimation) {
            setShowSuccess(true);
            setCurrentPrediction(null);
            setTimeout(() => {
              setShowSuccess(false);
              if (autoAdvance) {
                onCorrectSign();
              }
            }, 1000);
          } else {
            setCurrentPrediction(null);
            if (autoAdvance) {
              onCorrectSign();
            }
          }
        }
      }
    } catch (err) {
      console.error("Prediction error:", err);
    }
  };

  useEffect(() => {
    if (!isRunning || !handsRef.current || !videoRef.current) return;

    const detectHands = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        await handsRef.current.send({ image: videoRef.current });
      }
      animationRef.current = requestAnimationFrame(detectHands);
    };

    detectHands();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
    setIsRunning(false);
    setHandDetected(false);
    setCurrentPrediction(null);
  }, []);

  // Reset session
  const resetSession = async () => {
    try {
      await fetch(`http://localhost:3001/api/sign/session/${sessionId}`, {
        method: "DELETE",
      });
      setCurrentPrediction(null);
    } catch (err) {
      console.error("Reset session error:", err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Camera nhận diện cử chỉ</h3>
            <p className="text-sm text-muted-foreground">
              Hiển thị ký hiệu: <span className="font-bold text-2xl">{targetSign}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {!isRunning ? (
              <Button onClick={startCamera} disabled={isLoading}>
                <Camera className="w-4 h-4 mr-2" />
                Bật camera
              </Button>
            ) : (
              <>
                <Button onClick={resetSession} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button onClick={stopCamera} variant="destructive" size="sm">
                  <StopCircle className="w-4 h-4 mr-2" />
                  Dừng
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Video/Canvas container */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Status overlay */}
          {isRunning && (
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <Badge variant={handDetected ? "default" : "secondary"}>
                {handDetected ? "✓ Phát hiện tay" : "Không thấy tay"}
              </Badge>
              {currentPrediction && currentPrediction.finalLabel && (
                <Badge
                  variant={
                    currentPrediction.finalLabel === targetSign
                      ? "default"
                      : "destructive"
                  }
                  className="text-lg px-4 py-2"
                >
                  {currentPrediction.finalLabel} ({Math.round(currentPrediction.confidence * 100)}%)
                </Badge>
              )}
            </div>
          )}

          {/* Success Animation Overlay */}
          {showSuccess && (
            <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center animate-in fade-in zoom-in duration-300">
              <div className="text-center text-white">
                <div className="text-8xl mb-4">✓</div>
                <div className="text-4xl font-bold mb-2">CHÍNH XÁC!</div>
                <div className="text-xl">Đang chuyển sang cử chỉ tiếp theo...</div>
              </div>
            </div>
          )}
        </div>

        {/* Prediction info */}
        {currentPrediction && (
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Dự đoán hiện tại: </span>
              <span className="font-semibold">{currentPrediction.label}</span>
              <span className="text-muted-foreground ml-2">
                ({Math.round(currentPrediction.confidence * 100)}%)
              </span>
            </div>
            {currentPrediction.isStable && (
              <Badge variant="outline" className="text-green-600">
                Ổn định
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
