import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Camera, RefreshCw, CheckCircle2, XCircle, Video, VideoOff } from "lucide-react";
import { Progress } from "./ui/progress";

const practiceWords = [
  { word: "Hello", sign: "Vẫy tay chào", level: "newbie" },
  { word: "Thank you", sign: "Tay chạm vào cằm rồi đưa ra phía trước", level: "basic" },
  { word: "I love you", sign: "Ngón cái, trỏ và út dang ra", level: "basic" },
  { word: "Please", sign: "Tay xoay tròn trên ngực", level: "basic" },
  { word: "Yes", sign: "Nắm tay gật lên xuống", level: "newbie" },
  { word: "No", sign: "Ngón trỏ và ngón giữa khép lại", level: "newbie" },
  { word: "Water", sign: "Chữ W chạm vào miệng", level: "basic" },
  { word: "Help", sign: "Tay nắm đấm nâng lên", level: "basic" },
  { word: "Family", sign: "Chữ F xoay thành vòng tròn", level: "advanced" },
  { word: "Friend", sign: "Móc ngón trỏ vào nhau", level: "basic" },
];

export function PracticeMode() {
  const [currentWord, setCurrentWord] = useState(practiceWords[0]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * practiceWords.length);
    setCurrentWord(practiceWords[randomIndex]);
    setResult(null);
  };

  const toggleCamera = async () => {
    if (!isCameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      } catch (err) {
        alert("Không thể truy cập camera. Vui lòng cho phép quyền camera.");
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraOn(false);
    }
  };

  const checkSign = async () => {
    setIsChecking(true);
    setResult(null);
    
    // Simulate AI checking (random result for demo)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isCorrect = Math.random() > 0.3; // 70% success rate for demo
    setResult(isCorrect ? "correct" : "incorrect");
    setTotal(total + 1);
    if (isCorrect) {
      setScore(score + 1);
    }
    setIsChecking(false);
  };

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-blue-50/30">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-full text-white mb-4">
            <Camera className="w-4 h-4" />
            <span className="text-sm">Chế độ luyện tập với AI</span>
          </div>
          <h1 className="mb-2">Luyện tập ký hiệu</h1>
          <p className="text-muted-foreground">
            Sử dụng camera và AI để kiểm tra ký hiệu của bạn
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 border-2">
            <p className="text-sm text-muted-foreground mb-1">Độ chính xác</p>
            <p className="text-2xl">{accuracy}%</p>
            <Progress value={accuracy} className="mt-2" />
          </Card>
          <Card className="p-4 border-2">
            <p className="text-sm text-muted-foreground mb-1">Đúng</p>
            <p className="text-2xl text-green-600">{score}</p>
          </Card>
          <Card className="p-4 border-2">
            <p className="text-sm text-muted-foreground mb-1">Tổng số</p>
            <p className="text-2xl text-blue-600">{total}</p>
          </Card>
        </div>

        {/* Main Practice Area */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Word to practice */}
          <Card className="p-8 border-2">
            <div className="text-center space-y-6">
              <Badge className="mb-4">{currentWord.level}</Badge>
              <div>
                <h2 className="mb-4">Hãy thực hiện ký hiệu cho:</h2>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {currentWord.word}
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">Hướng dẫn:</p>
                <p className="text-lg">{currentWord.sign}</p>
              </div>

              <Button
                onClick={getRandomWord}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Từ khác
              </Button>
            </div>
          </Card>

          {/* Right: Camera and Check */}
          <Card className="p-8 border-2">
            <div className="space-y-4">
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <VideoOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Camera chưa được bật</p>
                    </div>
                  </div>
                )}
                
                {result && (
                  <div className={`absolute inset-0 flex items-center justify-center ${
                    result === "correct" ? "bg-green-500/20" : "bg-red-500/20"
                  }`}>
                    <div className="text-center text-white">
                      {result === "correct" ? (
                        <>
                          <CheckCircle2 className="w-16 h-16 mx-auto mb-2 text-green-500" />
                          <p className="text-2xl font-bold text-green-500">Chính xác!</p>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-16 h-16 mx-auto mb-2 text-red-500" />
                          <p className="text-2xl font-bold text-red-500">Chưa đúng, thử lại!</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={toggleCamera}
                  variant={isCameraOn ? "destructive" : "default"}
                  className="flex-1"
                >
                  {isCameraOn ? (
                    <>
                      <VideoOff className="w-4 h-4 mr-2" />
                      Tắt Camera
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Bật Camera
                    </>
                  )}
                </Button>
                <Button
                  onClick={checkSign}
                  disabled={!isCameraOn || isChecking}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Kiểm tra
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                * AI sẽ phân tích ký hiệu của bạn qua camera và đưa ra kết quả
              </p>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
