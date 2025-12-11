"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardHeader } from '@/app/components/DashboardHeader';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Trophy, Timer, Target, Play, ArrowLeft } from 'lucide-react';
import { toVietnamese } from '@/app/utils/vietnameseMapping';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SESSION_DURATION = 120; // 2 phút

interface User {
  fullName: string;
  email: string;
  avatarUrl?: string;
}

interface GameQuestion {
  id: string;
  level: string;
  question: string;
  gifUrl: string;
  options: string[];
  correctAnswer: string;
}

type GameLevel = 'newbie' | 'basic' | 'advanced';

export default function GamePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);

  const scoreRef = useRef(0);
  const correctCountRef = useRef(0);

  // Load user profile
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        router.push('/login');
      }
    };

    loadProfile();
  }, [router]);

  // Start game
  const handleStartGame = async (level: GameLevel) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${BACKEND_URL}/game/questions?level=${level}&count=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuestions(response.data);
      setSelectedLevel(level);
      setIsStarted(true);
      setTimeRemaining(SESSION_DURATION);
      setScore(0);
      setCorrectCount(0);
      setAnswers([]);
      setCurrentIndex(0);
      scoreRef.current = 0;
      correctCountRef.current = 0;
      setSelectedAnswer(null);
      setShowFeedback(false);
    } catch (error) {
      console.error('Error loading game questions:', error);
      alert('Không thể tải câu hỏi. Vui lòng thử lại!');
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!isStarted || isCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isCompleted]);

  // Handle answer selection
  const handleSelectAnswer = (option: string) => {
    if (showFeedback) return; // Đã chọn rồi, không cho chọn lại

    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion.correctAnswer;

    setSelectedAnswer(option);
    setShowFeedback(true);

    // Update score nếu đúng
    if (isCorrect) {
      const pointsEarned = 5;
      scoreRef.current += pointsEarned;
      correctCountRef.current += 1;
      setScore(scoreRef.current);
      setCorrectCount(correctCountRef.current);
    }

    // Lưu answer
    const newAnswer = {
      questionId: currentQuestion.id,
      questionLabel: currentQuestion.question,
      selectedAnswer: option,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
    };
    setAnswers(prev => [...prev, newAnswer]);

    // Auto next sau 1.5 giây
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        handleComplete();
      }
    }, 1500);
  };

  // Complete game
  const handleComplete = async () => {
    setIsCompleted(true);
    setIsStarted(false);

    const finalScore = scoreRef.current;
    const finalCorrect = correctCountRef.current;
    const duration = SESSION_DURATION - timeRemaining;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${BACKEND_URL}/game/submit`, {
        level: selectedLevel,
        score: finalScore,
        correctAnswers: finalCorrect,
        totalQuestions: answers.length,
        duration,
        answers,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error submitting game:', error);
    }
  };

  // Exit
  const handleExit = () => {
    router.push('/dashboard');
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleViewProfile = () => router.push("/profile");
  const handleSettings = () => router.push("/settings");
  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  // Level selection screen
  if (!isStarted && !isCompleted) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardHeader
          userName={user.fullName}
          userEmail={user.email}
          userAvatar={user.avatarUrl}
          onViewProfile={handleViewProfile}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
          onMenuClick={() => {}}
        />
        
        <div className="flex-1 p-8 bg-gradient-to-b from-white to-blue-50/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold mb-4">🎮 Chế Độ Game</h1>
              <p className="text-xl text-muted-foreground">
                Chọn mức độ và thách thức bản thân!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Newbie */}
              <Card 
                className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-green-400"
                onClick={() => handleStartGame('newbie')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🌱</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Newbie</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chữ cái A-Z và số 0-9
                  </p>
                  <Badge className="bg-green-500">Dễ</Badge>
                </div>
              </Card>

              {/* Basic */}
              <Card 
                className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-400"
                onClick={() => handleStartGame('basic')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Basic</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Từ vựng thông dụng
                  </p>
                  <Badge className="bg-blue-500">Trung bình</Badge>
                </div>
              </Card>

              {/* Advanced */}
              <Card 
                className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-purple-400"
                onClick={() => handleStartGame('advanced')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Advanced</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Câu giao tiếp phức tạp
                  </p>
                  <Badge className="bg-purple-500">Khó</Badge>
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50">
              <h3 className="font-semibold mb-3 text-center">📋 Quy tắc chơi:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm max-w-2xl mx-auto">
                <li>Thời gian: <strong>2 phút</strong></li>
                <li>Xem GIF ký hiệu và chọn đáp án đúng trong <strong>4 lựa chọn</strong></li>
                <li>Mỗi câu đúng: <strong>+5 điểm</strong></li>
                <li>Điểm sẽ được lưu vào lịch sử của bạn</li>
              </ul>
            </Card>

            <div className="text-center mt-6">
              <Button onClick={handleExit} variant="outline" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  if (isStarted && currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardHeader
          userName={user.fullName}
          userEmail={user.email}
          userAvatar={user.avatarUrl}
          onViewProfile={handleViewProfile}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
          onMenuClick={() => {}}
        />
        
        <div className="flex-1 flex flex-col p-4 bg-gradient-to-b from-white to-blue-50/30">
          {/* Stats bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold capitalize">🎮 Game - Level {selectedLevel}</h1>
              <Button onClick={handleExit} variant="outline" size="sm">
                Thoát
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Card className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <div>
                    <p className="text-xs opacity-90">Điểm</p>
                    <p className="text-2xl font-bold">{score}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <div>
                    <p className="text-xs opacity-90">Đúng</p>
                    <p className="text-2xl font-bold">{correctCount}</p>
                  </div>
                </div>
              </Card>

              <Card className={`p-3 ${timeRemaining <= 30 ? 'bg-gradient-to-br from-orange-500 to-red-600 animate-pulse' : 'bg-gradient-to-br from-purple-500 to-purple-600'} text-white`}>
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  <div>
                    <p className="text-xs opacity-90">Thời gian</p>
                    <p className="text-2xl font-bold">{formatTime(timeRemaining)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                <div>
                  <p className="text-xs opacity-90">Câu hỏi</p>
                  <p className="text-2xl font-bold">{currentIndex + 1}/{questions.length}</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Question area */}
          <div className="flex-1 max-w-4xl mx-auto w-full">
            <Card className="p-6 h-full flex flex-col">
              <div className="text-center mb-4">
                <Badge className="mb-2 capitalize">
                  {selectedLevel === 'newbie' ? '🌱 Newbie' : selectedLevel === 'basic' ? '📚 Basic' : '🚀 Advanced'}
                </Badge>
                <h2 className="text-xl font-semibold">Dấu hiệu này có nghĩa là gì?</h2>
              </div>

              {/* GIF Display */}
              <div className="flex-1 flex items-center justify-center mb-6">
                <div className="relative">
                  <img 
                    src={currentQuestion.gifUrl}
                    alt="Sign language"
                    className="max-w-md w-full h-auto rounded-lg border-4 border-blue-200 shadow-lg"
                  />
                  {showFeedback && (
                    <div className={`absolute inset-0 flex items-center justify-center ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-500/80' : 'bg-red-500/80'} rounded-lg`}>
                      <div className="text-white text-6xl">
                        {selectedAnswer === currentQuestion.correctAnswer ? '✅' : '❌'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const showCorrect = showFeedback && isCorrect;
                  const showWrong = showFeedback && isSelected && !isCorrect;

                  return (
                    <Button
                      key={idx}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={showFeedback}
                      size="lg"
                      className={`h-16 text-lg ${
                        showCorrect ? 'bg-green-500 hover:bg-green-600 border-2 border-green-700' :
                        showWrong ? 'bg-red-500 hover:bg-red-600 border-2 border-red-700' :
                        isSelected ? 'bg-blue-600' :
                        'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {toVietnamese(option)}
                      {showCorrect && ' ✓'}
                      {showWrong && ' ✗'}
                    </Button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (isCompleted) {
    const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

    return (
      <div className="min-h-screen flex flex-col">
        <DashboardHeader
          userName={user.fullName}
          userEmail={user.email}
          userAvatar={user.avatarUrl}
          onViewProfile={handleViewProfile}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
          onMenuClick={() => {}}
        />
        
        <div className="flex-1 p-8 bg-gradient-to-b from-white to-blue-50/30">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                  <Trophy className="w-16 h-16 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-2">🎮 Game Over!</h1>
                <p className="text-xl text-muted-foreground capitalize">Level: {selectedLevel}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                  <p className="text-sm text-muted-foreground mb-1">Tổng điểm</p>
                  <p className="text-5xl font-bold text-blue-600">{score}</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
                  <p className="text-sm text-muted-foreground mb-1">Số câu đúng</p>
                  <p className="text-5xl font-bold text-green-600">{correctCount}/{answers.length}</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
                  <p className="text-sm text-muted-foreground mb-1">Độ chính xác</p>
                  <p className="text-5xl font-bold text-purple-600">{accuracy}%</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
                  <p className="text-sm text-muted-foreground mb-1">Thời gian</p>
                  <p className="text-5xl font-bold text-orange-600">{formatTime(SESSION_DURATION - timeRemaining)}</p>
                </Card>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => handleStartGame(selectedLevel!)} size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Chơi lại
                </Button>
                <Button onClick={() => {setIsCompleted(false); setSelectedLevel(null);}} variant="outline" size="lg">
                  Chọn level khác
                </Button>
                <Button onClick={handleExit} variant="outline" size="lg">
                  Quay lại Dashboard
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
