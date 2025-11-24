"use client";
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Trophy, Star, Clock, Zap, X, Check } from "lucide-react";

interface QuizQuestion {
  id: string;
  sign: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuickQuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onExit: () => void;
  timePerQuestion?: number;
}

export function QuickQuiz({ questions, onComplete, onExit, timePerQuestion = 10 }: QuickQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameState, setGameState] = useState<"playing" | "correct" | "wrong" | "finished">("playing");

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

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === question.correctAnswer) {
      setGameState("correct");
      const bonusPoints = timeLeft * 2;
      setScore(score + 10 + bonusPoints);
      setTimeout(() => nextQuestion(), 1500);
    } else {
      handleWrongAnswer();
    }
  };

  const handleWrongAnswer = () => {
    setGameState("wrong");
    setTimeout(() => nextQuestion(), 1500);
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= questions.length) {
      setGameState("finished");
      onComplete(score);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(timePerQuestion);
      setGameState("playing");
      setSelectedAnswer(null);
    }
  };

  if (gameState === "finished") {
    const correctAnswers = Math.round((score / (questions.length * 10)) * questions.length);
    const accuracy = Math.round((correctAnswers / questions.length) * 100);

    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-yellow-50/30 flex items-center justify-center p-8">
        <Card className="p-12 max-w-md text-center border-2 border-yellow-200">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <h1 className="mb-4 text-yellow-600">Hoàn thành!</h1>
          <p className="text-muted-foreground mb-6">Kết quả trắc nghiệm của bạn</p>
          
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
                <Zap className="w-5 h-5 text-blue-600" />
                Đúng/Tổng
              </span>
              <span className="font-bold text-xl">{correctAnswers}/{questions.length}</span>
            </div>
          </div>

          <div className="space-y-3">
            {accuracy >= 80 && (
              <Badge className="bg-yellow-500 text-white text-sm py-2 px-4">
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
            className="w-full mt-8 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
          >
            Hoàn thành
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-yellow-50/30">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white mb-3">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Trắc nghiệm nhanh</span>
            </div>
            <h1 className="mb-2">Kiểm tra kiến thức</h1>
            <p className="text-muted-foreground">
              Chọn đáp án đúng cho từng câu hỏi
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

          <Card className="p-4 border-2 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-600" />
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
                  <p className="text-sm text-muted-foreground mt-2">+{10 + timeLeft * 2} điểm</p>
                </div>
              </div>
            )}
            {gameState === "wrong" && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="text-6xl mb-4">❌</div>
                  <p className="text-2xl text-red-600">Sai rồi!</p>
                  <p className="text-sm text-muted-foreground mt-2">Đáp án: {question.correctAnswer}</p>
                </div>
              </div>
            )}
            
            <div className="text-center">
              {question.sign && (
                <div className="text-8xl mb-6">{question.sign}</div>
              )}
              <p className="text-xl mb-4">{question.question}</p>
            </div>
          </Card>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.correctAnswer;
              const showCorrect = gameState !== "playing" && isCorrect;
              const showWrong = gameState !== "playing" && isSelected && !isCorrect;

              return (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={gameState !== "playing"}
                  className={`h-20 text-lg transition-all ${
                    showCorrect
                      ? "bg-green-500 hover:bg-green-600"
                      : showWrong
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {showCorrect && <Check className="w-5 h-5" />}
                    {showWrong && <X className="w-5 h-5" />}
                    {option}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Skip Button */}
          {gameState === "playing" && (
            <Button
              onClick={handleWrongAnswer}
              variant="ghost"
              className="w-full mt-4 text-muted-foreground"
            >
              Bỏ qua câu này
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
