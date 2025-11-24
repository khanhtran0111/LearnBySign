"use client";
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Trophy, Star, Clock, Gamepad2, X, Check } from "lucide-react";

interface FillBlankQuestion {
  id: string;
  sentence: string;
  correctAnswer: string;
  hint?: string;
  sign?: string;
}

interface FillInBlankProps {
  questions: FillBlankQuestion[];
  onComplete: (score: number) => void;
  onExit: () => void;
  timePerQuestion?: number;
}

export function FillInBlank({ questions, onComplete, onExit, timePerQuestion = 15 }: FillInBlankProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [userAnswer, setUserAnswer] = useState("");
  const [gameState, setGameState] = useState<"playing" | "correct" | "wrong" | "finished">("playing");
  const [attempts, setAttempts] = useState(0);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === "playing") {
      handleWrongAnswer();
    }
  }, [timeLeft, gameState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrect = question.correctAnswer.trim().toLowerCase();

    if (normalizedAnswer === normalizedCorrect) {
      setGameState("correct");
      const bonusPoints = timeLeft + (3 - attempts) * 5;
      setScore(score + 10 + bonusPoints);
      setTimeout(() => nextQuestion(), 1500);
    } else {
      setAttempts(attempts + 1);
      if (attempts >= 2) {
        handleWrongAnswer();
      } else {
        // Shake animation or feedback
        setUserAnswer("");
      }
    }
  };

  const handleWrongAnswer = () => {
    setGameState("wrong");
    setTimeout(() => nextQuestion(), 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= questions.length) {
      setGameState("finished");
      onComplete(score);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(timePerQuestion);
      setGameState("playing");
      setUserAnswer("");
      setAttempts(0);
    }
  };

  const handleSkip = () => {
    handleWrongAnswer();
  };

  if (gameState === "finished") {
    const correctAnswers = Math.round((score / (questions.length * 10)) * questions.length);
    const accuracy = Math.round((correctAnswers / questions.length) * 100);

    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-green-50/30 flex items-center justify-center p-8">
        <Card className="p-12 max-w-md text-center border-2 border-green-200">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <h1 className="mb-4 text-green-600">Hoàn thành!</h1>
          <p className="text-muted-foreground mb-6">Kết quả bài tập của bạn</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
              <span className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Điểm số
              </span>
              <span className="font-bold text-xl">{score}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Độ chính xác
              </span>
              <span className="font-bold text-xl">{accuracy}%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-blue-600" />
                Đúng/Tổng
              </span>
              <span className="font-bold text-xl">{correctAnswers}/{questions.length}</span>
            </div>
          </div>

          <div className="mb-6">
            {accuracy >= 80 && (
              <Badge className="bg-green-500 text-white text-sm py-2 px-4">
                ⭐ Xuất sắc!
              </Badge>
            )}
            {accuracy >= 60 && accuracy < 80 && (
              <Badge className="bg-blue-500 text-white text-sm py-2 px-4">
                👍 Khá tốt!
              </Badge>
            )}
            {accuracy < 60 && (
              <Badge variant="secondary" className="text-sm py-2 px-4">
                💪 Cố gắng hơn!
              </Badge>
            )}
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

  const sentenceParts = question.sentence.split("___");

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-green-50/30">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white mb-3">
              <Gamepad2 className="w-4 h-4" />
              <span className="text-sm">Điền từ</span>
            </div>
            <h1 className="mb-2">Hoàn thành câu</h1>
            <p className="text-muted-foreground">
              Điền từ thích hợp vào chỗ trống
            </p>
          </div>
          <Button onClick={onExit} variant="outline" size="sm">
            <X className="w-4 h-4 mr-2" />
            Thoát
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
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
              <Gamepad2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Câu hỏi</p>
                <p className="text-xl">{currentQuestion + 1}/{questions.length}</p>
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

        {/* Question Area */}
        <div className="max-w-3xl mx-auto">
          <Card className="p-12 border-2 mb-8 relative overflow-hidden">
            {gameState === "correct" && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-2xl text-green-600">Chính xác!</p>
                  <p className="text-sm text-muted-foreground mt-2">+{10 + timeLeft + (3 - attempts) * 5} điểm</p>
                </div>
              </div>
            )}
            {gameState === "wrong" && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="text-6xl mb-4">❌</div>
                  <p className="text-2xl text-red-600">Hết giờ!</p>
                  <p className="text-sm text-muted-foreground mt-2">Đáp án: {question.correctAnswer}</p>
                </div>
              </div>
            )}
            
            <div className="text-center mb-8">
              {question.sign && (
                <div className="text-8xl mb-6">{question.sign}</div>
              )}
            </div>

            {/* Sentence with Blank */}
            <div className="text-2xl text-center mb-8 flex flex-wrap items-center justify-center gap-3">
              <span>{sentenceParts[0]}</span>
              <div className="inline-block min-w-[200px]">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(e);
                    }
                  }}
                  disabled={gameState !== "playing"}
                  className="text-2xl text-center border-2 border-green-400 focus:border-green-600 h-14"
                  placeholder="___"
                  autoFocus
                />
              </div>
              <span>{sentenceParts[1]}</span>
            </div>

            {/* Hint */}
            {question.hint && attempts > 0 && gameState === "playing" && (
              <div className="text-center">
                <Badge variant="secondary" className="text-sm">
                  💡 Gợi ý: {question.hint}
                </Badge>
              </div>
            )}

            {/* Attempts indicator */}
            {gameState === "playing" && attempts > 0 && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                Bạn còn {3 - attempts} lần thử
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleSubmit}
              disabled={gameState !== "playing" || !userAnswer.trim()}
              className="h-16 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Check className="w-5 h-5 mr-2" />
              Kiểm tra
            </Button>
            <Button
              onClick={handleSkip}
              disabled={gameState !== "playing"}
              variant="outline"
              className="h-16 text-lg"
            >
              <X className="w-5 h-5 mr-2" />
              Bỏ qua
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
