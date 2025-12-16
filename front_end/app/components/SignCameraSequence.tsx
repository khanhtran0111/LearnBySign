"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, StopCircle, RotateCcw, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

// MediaPipe Hands types (will be loaded dynamically)
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

interface SequencePredictionResult {
  label: string;
  confidence: number;
  success: boolean;
}

interface SignCameraSequenceProps {
  targetSign: string;
  targetGifUrl?: string;
  onCorrectSign: () => void;
  onIncorrectSign?: () => void;
  sessionId?: string;
  showSuccessAnimation?: boolean;
  autoAdvanceImmediate?: boolean; // Tự động advance ngay khi phát hiện đúng
}

const VSL_API_URL = process.env.NEXT_PUBLIC_VSL_API_URL || "http://localhost:8000";
const SEQ_LEN = 60; // Số frame cần thu
const PRESENCE_START_FRAMES = 5; // Cần thấy tay liên tục bấy nhiêu frame để bắt đầu ghi
const ABSENCE_END_FRAMES = 10; // Cần MẤT tay liên tục bấy nhiêu frame để reset

type RecordingState = "idle" | "recording" | "predicting" | "wait_absence";

export function SignCameraSequence({
  targetSign,
  targetGifUrl,
  onCorrectSign,
  onIncorrectSign,
  sessionId = "default",
  showSuccessAnimation = true,
  autoAdvanceImmediate = false, // Tự động advance ngay khi phát hiện đúng
}: SignCameraSequenceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string>("");
  const [handDetected, setHandDetected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Sequence recording state
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [frameCount, setFrameCount] = useState(0);
  const [prediction, setPrediction] = useState<SequencePredictionResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("Đưa tay vào khung hình để bắt đầu");

  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const animationRef = useRef<number | undefined>(undefined);
  
  // Sequence recording refs
  const sequenceRef = useRef<any[]>([]);
  const presenceCountRef = useRef(0);
  const absenceCountRef = useRef(0);
  const recordingStateRef = useRef<RecordingState>("idle");
  const isProcessingRef = useRef(false);
  
  // Frame throttling để giới hạn ~30 FPS giống Model.py
  const lastFrameTimeRef = useRef<number>(0);
  const TARGET_FPS = 30;
  const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~33ms

  // Sync state với ref
  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  // Reset khi target thay đổi
  useEffect(() => {
    resetRecording();
    console.log(`🔄 TARGET CHANGED TO: ${targetSign}`);
  }, [targetSign, sessionId]);

  const resetRecording = () => {
    sequenceRef.current = [];
    presenceCountRef.current = 0;
    absenceCountRef.current = 0;
    setFrameCount(0);
    setRecordingState("idle");
    recordingStateRef.current = "idle";
    setPrediction(null);
    setShowSuccess(false);
    setStatusMessage("Đưa tay vào khung hình để bắt đầu");
    isProcessingRef.current = false;
  };

  // Load MediaPipe scripts
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

  // Extract keypoints từ landmarks (giống Model.py)
  const extractKeypoints = (leftHand: LandmarkPoint[] | null, rightHand: LandmarkPoint[] | null) => {
    let lh: number[];
    let rh: number[];

    if (leftHand && leftHand.length === 21) {
      lh = leftHand.flatMap(lm => [lm.x, lm.y, lm.z]);
    } else {
      lh = new Array(21 * 3).fill(0);
    }

    if (rightHand && rightHand.length === 21) {
      rh = rightHand.flatMap(lm => [lm.x, lm.y, lm.z]);
    } else {
      rh = new Array(21 * 3).fill(0);
    }

    return [...lh, ...rh]; // 126 features
  };

  // Gọi API để dự đoán
  const predictSequence = async (frames: number[][]) => {
    try {
      setRecordingState("predicting");
      setStatusMessage("Đang phân tích...");

      const response = await fetch(`${VSL_API_URL}/sequence/predict-raw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const result = await response.json();
      console.log("🎯 Prediction result:", result);

      setPrediction({
        label: result.label,
        confidence: result.confidence,
        success: result.success,
      });

      if (result.success && result.label) {
        // Tự động coi là đúng khi phát hiện được hành động
        setShowSuccess(true);
        setStatusMessage(`✅ Đúng!`);
        
        // Delay 2 giây trước khi chuyển câu tiếp theo
        setTimeout(() => {
          setShowSuccess(false);
          onCorrectSign();
        }, 2000);
      } else {
        setStatusMessage("Không nhận diện được. Vui lòng thử lại!");
      }

      // Chuyển sang trạng thái chờ hạ tay
      setRecordingState("wait_absence");
      recordingStateRef.current = "wait_absence";
      absenceCountRef.current = 0;

    } catch (err) {
      console.error("Prediction error:", err);
      setStatusMessage("Lỗi khi phân tích. Vui lòng thử lại!");
      setRecordingState("wait_absence");
      recordingStateRef.current = "wait_absence";
    }
  };

  // Process results từ MediaPipe
  const onResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Draw video frame
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    const hasHands = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
    setHandDetected(hasHands);

    // Draw hand landmarks
    if (hasHands && window.drawConnectors && window.drawLandmarks && window.HAND_CONNECTIONS) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness?.[i]?.label || "Right";

        window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
          color: handedness === "Left" ? "#FF0000" : "#00FF00",
          lineWidth: 3,
        });
        window.drawLandmarks(ctx, landmarks, {
          color: handedness === "Left" ? "#FF6666" : "#66FF66",
          lineWidth: 1,
          radius: 4,
        });
      }
    }

    ctx.restore();

    // State machine giống Model.py
    const state = recordingStateRef.current;

    if (state === "idle") {
      sequenceRef.current = [];
      absenceCountRef.current = 0;

      if (hasHands) {
        presenceCountRef.current += 1;
      } else {
        presenceCountRef.current = 0;
      }

      if (presenceCountRef.current >= PRESENCE_START_FRAMES) {
        // Bắt đầu thu
        setRecordingState("recording");
        recordingStateRef.current = "recording";
        presenceCountRef.current = 0;
        setStatusMessage("🔴 Đang ghi... Thực hiện ký hiệu!");
      }
    } else if (state === "recording") {
      // Luôn ghi đủ 60 frame (kể cả khi tay mất)
      let leftHand: LandmarkPoint[] | null = null;
      let rightHand: LandmarkPoint[] | null = null;

      if (hasHands) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const landmarks = results.multiHandLandmarks[i];
          const handedness = results.multiHandedness?.[i]?.label || "Right";
          
          const points: LandmarkPoint[] = landmarks.map((lm: any) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
          }));

          if (handedness === "Left") {
            leftHand = points;
          } else {
            rightHand = points;
          }
        }
      }

      const keypoints = extractKeypoints(leftHand, rightHand);
      sequenceRef.current.push(keypoints);
      setFrameCount(sequenceRef.current.length);

      if (sequenceRef.current.length >= SEQ_LEN) {
        // Đủ 60 frame, dự đoán
        const framesToPredict = [...sequenceRef.current];
        sequenceRef.current = [];
        predictSequence(framesToPredict);
      }
    } else if (state === "wait_absence") {
      // Chờ hạ tay để reset
      if (hasHands) {
        absenceCountRef.current = 0;
      } else {
        absenceCountRef.current += 1;
        if (absenceCountRef.current >= ABSENCE_END_FRAMES) {
          resetRecording();
        }
      }
    }
  }, [targetSign, onCorrectSign, onIncorrectSign]);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !window.Hands) return;

    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      const hands = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 2, // Cho phép 2 tay
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      await videoRef.current.play();
      setIsRunning(true);

      // Start detection loop với frame rate throttling ~30 FPS
      const detectFrame = async () => {
        if (videoRef.current && handsRef.current && streamRef.current) {
          const now = Date.now();
          const elapsed = now - lastFrameTimeRef.current;
          
          // Chỉ xử lý khi đã đủ thời gian (throttle về ~30 FPS)
          if (elapsed >= FRAME_INTERVAL) {
            lastFrameTimeRef.current = now;
            await handsRef.current.send({ image: videoRef.current });
          }
          
          animationRef.current = requestAnimationFrame(detectFrame);
        }
      };
      detectFrame();
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Camera bị từ chối. Vui lòng cấp quyền camera.");
      } else {
        setError("Không thể truy cập camera");
      }
      console.error(err);
    }
  }, [onResults]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRunning(false);
    resetRecording();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Get progress percentage
  const progressPercent = (frameCount / SEQ_LEN) * 100;

  // Get status color
  const getStatusColor = () => {
    switch (recordingState) {
      case "recording": return "bg-red-500";
      case "predicting": return "bg-yellow-500";
      case "wait_absence": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thư viện nhận diện...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-2 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${recordingState === "recording" ? "animate-pulse" : ""}`}></div>
          <span className="text-sm font-medium">
            {recordingState === "idle" && "Chờ sẵn sàng"}
            {recordingState === "recording" && `Đang ghi: ${frameCount}/${SEQ_LEN}`}
            {recordingState === "predicting" && "Đang phân tích..."}
            {recordingState === "wait_absence" && "Hạ tay để tiếp tục"}
          </span>
        </div>
        <Badge variant={handDetected ? "default" : "secondary"}>
          {handDetected ? "✋ Phát hiện tay" : "Không có tay"}
        </Badge>
      </div>

      {/* Progress bar khi đang ghi */}
      {recordingState === "recording" && (
        <div className="px-2 py-1 bg-red-50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600 font-medium min-w-[60px]">
              {frameCount}/{SEQ_LEN}
            </span>
            <Progress value={progressPercent} className="h-3 flex-1" />
            <span className="text-xs text-red-600 font-medium">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>
      )}

      {/* Video/Canvas */}
      <div className="flex-1 relative bg-black min-h-0">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Overlay khi chưa bật camera */}
        {!isRunning && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <Button onClick={startCamera} size="lg" className="gap-2">
              <Camera className="w-5 h-5" />
              Bật Camera
            </Button>
          </div>
        )}

        {/* Success animation */}
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/90 backdrop-blur-sm z-10">
            <div className="text-center text-white">
              <div className="text-8xl mb-4 animate-bounce">✅</div>
              <p className="text-4xl font-bold">Đúng!</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/80">
            <div className="text-center text-white p-4">
              <p className="mb-4">{error}</p>
              <Button onClick={startCamera} variant="secondary">
                Thử lại
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status message */}
      <div className="p-2 border-t bg-gray-50">
        <p className="text-center text-sm text-gray-700">{statusMessage}</p>
        
        {/* Prediction result */}
        {prediction && (
          <div className={`mt-2 p-2 rounded text-center ${prediction.success ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
            <p className="font-medium">
              {prediction.label || "Không nhận diện được"}
            </p>
            <p className="text-xs">
              Độ tin cậy: {(prediction.confidence * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-2 border-t flex justify-center gap-2">
        {isRunning ? (
          <>
            <Button onClick={resetRecording} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button onClick={stopCamera} variant="destructive" size="sm">
              <StopCircle className="w-4 h-4 mr-1" />
              Tắt Camera
            </Button>
          </>
        ) : (
          <Button onClick={startCamera} size="sm">
            <Play className="w-4 h-4 mr-1" />
            Bật Camera
          </Button>
        )}
      </div>
    </Card>
  );
}
