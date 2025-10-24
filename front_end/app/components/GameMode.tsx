import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Trophy, Star, Zap, Heart, Clock } from "lucide-react";
import { Progress } from "./ui/progress";

const gameWords = [
  { word: "Cat", sign: "🐱", options: ["Dog", "Cat", "Bird", "Fish"] },
  { word: "Happy", sign: "😊", options: ["Sad", "Happy", "Angry", "Tired"] },
  { word: "Red", sign: "🔴", options: ["Blue", "Green", "Red", "Yellow"] },
  { word: "Apple", sign: "🍎", options: ["Banana", "Orange", "Apple", "Grape"] },
  { word: "Sun", sign: "☀️", options: ["Moon", "Star", "Sun", "Cloud"] },
  { word: "Water", sign: "💧", options: ["Fire", "Water", "Earth", "Air"] },
  { word: "Heart", sign: "❤️", options: ["Star", "Heart", "Circle", "Square"] },
  { word: "Tree", sign: "🌳", options: ["Flower", "Tree", "Grass", "Bush"] },
];

export function GameMode() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameState, setGameState] = useState<"playing" | "correct" | "wrong" | "finished">("playing");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentWord = gameWords[currentQuestion];

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
    if (answer === currentWord.word) {
      setGameState("correct");
      setScore(score + 10 + timeLeft);
      setTimeout(() => nextQuestion(), 1500);
    } else {
      handleWrongAnswer();
    }
  };

  const handleWrongAnswer = () => {
    setGameState("wrong");
    setLives(lives - 1);
    if (lives - 1 <= 0) {
      setTimeout(() => setGameState("finished"), 1500);
    } else {
      setTimeout(() => nextQuestion(), 1500);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= gameWords.length) {
      setGameState("finished");
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(15);
      setGameState("playing");
      setSelectedAnswer(null);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setLives(3);
    setTimeLeft(15);
    setGameState("playing");
    setSelectedAnswer(null);
  };

  if (gameState === "finished") {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-purple-50/30 flex items-center justify-center">
        <Card className="p-12 max-w-md text-center border-2">
          <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-500" />
          <h1 className="mb-4">Game kết thúc!</h1>
          <div className="mb-8">
            <p className="text-muted-foreground mb-4">Điểm số của bạn:</p>
            <p className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {score}
            </p>
          </div>
          <div className="flex gap-2 mb-6 justify-center">
            {score >= 100 && <Badge className="bg-yellow-500">⭐ Xuất sắc!</Badge>}
            {score >= 50 && score < 100 && <Badge className="bg-blue-500">👍 Tốt lắm!</Badge>}
            {score < 50 && <Badge variant="secondary">💪 Cố lên!</Badge>}
          </div>
          <Button
            onClick={restartGame}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Chơi lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-purple-50/30">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full text-white mb-4">
            <Trophy className="w-4 h-4" />
            <span className="text-sm">Game luyện tập</span>
          </div>
          <h1 className="mb-2">Đoán ký hiệu</h1>
          <p className="text-muted-foreground">
            Chọn đáp án đúng cho ký hiệu được hiển thị
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 border-2 bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Điểm</p>
                <p className="text-2xl font-bold">{score}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 bg-gradient-to-br from-red-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-6 h-6 ${
                      i < lives ? "text-red-500 fill-red-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mạng</p>
                <p className="text-2xl font-bold">{lives}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Thời gian</p>
                <p className="text-2xl font-bold">{timeLeft}s</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Câu hỏi {currentQuestion + 1}/{gameWords.length}</span>
            <span>{Math.round(((currentQuestion) / gameWords.length) * 100)}%</span>
          </div>
          <Progress value={((currentQuestion) / gameWords.length) * 100} />
        </div>

        {/* Game Area */}
        <div className="max-w-3xl mx-auto">
          <Card className="p-12 border-2 mb-8 relative overflow-hidden">
            {gameState === "correct" && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-2xl font-bold text-green-600">Chính xác!</p>
                </div>
              </div>
            )}
            {gameState === "wrong" && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="text-6xl mb-4">❌</div>
                  <p className="text-2xl font-bold text-red-600">Sai rồi!</p>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-muted-foreground mb-6">Ký hiệu này nghĩa là gì?</p>
              <div className="text-9xl mb-8">{currentWord.sign}</div>
            </div>
          </Card>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4">
            {currentWord.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={gameState !== "playing"}
                className={`h-20 text-xl transition-all ${
                  selectedAnswer === option
                    ? option === currentWord.word
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                }`}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
