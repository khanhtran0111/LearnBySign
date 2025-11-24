"use client";
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Trophy, Star, Clock, Target, X } from "lucide-react";

interface MatchingPair {
  id: string;
  sign: string;
  word: string;
}

interface MatchingGameProps {
  pairs: MatchingPair[];
  onComplete: (score: number) => void;
  onExit: () => void;
  timeLimit?: number;
}

export function MatchingGame({ pairs, onComplete, onExit, timeLimit = 60 }: MatchingGameProps) {
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameState, setGameState] = useState<"playing" | "success" | "failed">("playing");
  const [score, setScore] = useState(0);

  // Shuffle arrays
  const [shuffledSigns] = useState(() => [...pairs].sort(() => Math.random() - 0.5));
  const [shuffledWords] = useState(() => [...pairs].sort(() => Math.random() - 0.5));

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("failed");
    }
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (selectedSign && selectedWord) {
      const signPair = pairs.find((p) => p.id === selectedSign);
      const wordPair = pairs.find((p) => p.id === selectedWord);

      if (signPair && wordPair && signPair.id === wordPair.id) {
        // Correct match
        setMatchedPairs([...matchedPairs, signPair.id]);
        const bonusPoints = Math.floor(timeLeft / 2);
        setScore(score + 10 + bonusPoints);
        
        // Check if game is complete
        if (matchedPairs.length + 1 === pairs.length) {
          setTimeout(() => {
            setGameState("success");
            onComplete(score + 10 + bonusPoints);
          }, 500);
        }
      } else {
        // Wrong match
        setWrongAttempts(wrongAttempts + 1);
        setTimeout(() => {
          setSelectedSign(null);
          setSelectedWord(null);
        }, 800);
        return;
      }

      setSelectedSign(null);
      setSelectedWord(null);
    }
  }, [selectedSign, selectedWord]);

  const progress = (matchedPairs.length / pairs.length) * 100;

  if (gameState === "success") {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-green-50/30 flex items-center justify-center p-8">
        <Card className="p-12 max-w-md text-center border-2 border-green-200">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <h1 className="mb-4 text-green-600">Xuất sắc!</h1>
          <p className="text-muted-foreground mb-6">Bạn đã hoàn thành bài luyện tập</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
              <span className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Điểm số
              </span>
              <span className="font-bold text-xl">{score}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Thời gian còn lại
              </span>
              <span className="font-bold text-xl">{timeLeft}s</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-600" />
                Sai
              </span>
              <span className="font-bold text-xl">{wrongAttempts}</span>
            </div>
          </div>

          <Button
            onClick={onExit}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Hoàn thành
          </Button>
        </Card>
      </div>
    );
  }

  if (gameState === "failed") {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-red-50/30 flex items-center justify-center p-8">
        <Card className="p-12 max-w-md text-center border-2 border-red-200">
          <div className="text-6xl mb-6">⏰</div>
          <h1 className="mb-4 text-red-600">Hết giờ!</h1>
          <p className="text-muted-foreground mb-8">
            Bạn đã ghép được {matchedPairs.length}/{pairs.length} cặp
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Thử lại
            </Button>
            <Button
              onClick={onExit}
              variant="outline"
              className="w-full"
            >
              Thoát
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-pink-50/30">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white mb-3">
              <Target className="w-4 h-4" />
              <span className="text-sm">Ghép cặp</span>
            </div>
            <h1 className="mb-2">Ghép ký hiệu với từ</h1>
            <p className="text-muted-foreground">
              Chọn một ký hiệu và ghép với từ tương ứng
            </p>
          </div>
          <Button onClick={onExit} variant="outline" size="sm">
            <X className="w-4 h-4 mr-2" />
            Thoát
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-2 bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">Điểm</p>
                <p className="text-xl">{score}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Thời gian</p>
                <p className="text-xl">{timeLeft}s</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Đã ghép</p>
                <p className="text-xl">{matchedPairs.length}/{pairs.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 bg-gradient-to-br from-red-50 to-pink-50">
            <div className="flex items-center gap-3">
              <X className="w-6 h-6 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Sai</p>
                <p className="text-xl">{wrongAttempts}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Tiến độ</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Signs Column */}
          <div className="space-y-3">
            <h3 className="text-center mb-4 text-pink-600">Ký hiệu</h3>
            {shuffledSigns.map((pair) => (
              <button
                key={`sign-${pair.id}`}
                onClick={() => !matchedPairs.includes(pair.id) && setSelectedSign(pair.id)}
                disabled={matchedPairs.includes(pair.id)}
                className={`w-full p-6 rounded-xl border-2 transition-all ${
                  matchedPairs.includes(pair.id)
                    ? "bg-green-50 border-green-200 opacity-50 cursor-not-allowed"
                    : selectedSign === pair.id
                    ? "bg-pink-100 border-pink-500 shadow-lg scale-105"
                    : "bg-white border-gray-200 hover:border-pink-300 hover:shadow-md hover:scale-102"
                }`}
              >
                <div className="flex items-center justify-center">
                  <span className="text-5xl">{pair.sign}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Words Column */}
          <div className="space-y-3">
            <h3 className="text-center mb-4 text-rose-600">Từ vựng</h3>
            {shuffledWords.map((pair) => (
              <button
                key={`word-${pair.id}`}
                onClick={() => !matchedPairs.includes(pair.id) && setSelectedWord(pair.id)}
                disabled={matchedPairs.includes(pair.id)}
                className={`w-full p-6 rounded-xl border-2 transition-all ${
                  matchedPairs.includes(pair.id)
                    ? "bg-green-50 border-green-200 opacity-50 cursor-not-allowed"
                    : selectedWord === pair.id
                    ? "bg-rose-100 border-rose-500 shadow-lg scale-105"
                    : "bg-white border-gray-200 hover:border-rose-300 hover:shadow-md hover:scale-102"
                }`}
              >
                <div className="flex items-center justify-center">
                  <span className="text-2xl">{pair.word}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
