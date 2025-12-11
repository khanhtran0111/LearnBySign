"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardHeader } from '@/app/components/DashboardHeader';
import { SignCamera } from '@/app/components/SignCamera';
import { SignCameraSequence } from '@/app/components/SignCameraSequence';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Trophy, Timer, CheckCircle, XCircle, ArrowRight, Play } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SESSION_DURATION = 120; // 2 phút = 120 giây

interface User {
  fullName: string;
  email: string;
  avatarUrl?: string;
}

interface Question {
  id: string;
  type: 'asl' | 'vsl';
  label: string;
  modelType: string;
}

interface Answer {
  questionId: string;
  questionLabel: string;
  userAnswer: string;
  isCorrect: boolean;
  modelType: string;
}

export default function PracticeTestPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [sessionId, setSessionId] = useState<string>('');

  const processingRef = useRef(false);
  const correctCountRef = useRef(0);
  const scoreRef = useRef(0);

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

  // Load questions khi start
  const handleStart = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${BACKEND_URL}/practice-test/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQuestions(response.data);
      setIsStarted(true);
      setSessionId(`practice_test_${Date.now()}`);
      setTimeRemaining(SESSION_DURATION);
      setScore(0);
      setCorrectCount(0);
      setAnswers([]);
      setCurrentIndex(0);
      scoreRef.current = 0;
      correctCountRef.current = 0;
    } catch (error) {
      console.error('Error loading questions:', error);
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

  // Handle correct answer
  const handleCorrectSign = () => {
    if (processingRef.current) return;
    processingRef.current = true;

    const currentQuestion = questions[currentIndex];
    const pointsEarned = 15;

    // Update score và correct count
    scoreRef.current += pointsEarned;
    correctCountRef.current += 1;
    setScore(scoreRef.current);
    setCorrectCount(correctCountRef.current);

    // Lưu answer
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      questionLabel: currentQuestion.label,
      userAnswer: currentQuestion.label,
      isCorrect: true,
      modelType: currentQuestion.modelType,
    };
    setAnswers(prev => [...prev, newAnswer]);

    // Next question
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSessionId(`practice_test_${Date.now()}_${currentIndex + 1}`);
      } else {
        handleComplete();
      }
      processingRef.current = false;
    }, 1000);
  };

  // Handle skip
  const handleSkip = () => {
    const currentQuestion = questions[currentIndex];

    // Lưu answer sai
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      questionLabel: currentQuestion.label,
      userAnswer: '',
      isCorrect: false,
      modelType: currentQuestion.modelType,
    };
    setAnswers(prev => [...prev, newAnswer]);

    // Next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSessionId(`practice_test_${Date.now()}_${currentIndex + 1}`);
    } else {
      handleComplete();
    }
  };

  // Complete session
  const handleComplete = async () => {
    setIsCompleted(true);
    setIsStarted(false);

    const finalScore = scoreRef.current;
    const finalCorrect = correctCountRef.current;
    const duration = SESSION_DURATION - timeRemaining;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${BACKEND_URL}/practice-test/submit`, {
        score: finalScore,
        correctAnswers: finalCorrect,
        totalQuestions: answers.length,
        duration,
        answers,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error submitting practice test:', error);
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

  // Welcome screen
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
        
        <div className="flex-1 p-8 bg-gradient-to-b from-white to-blue-50/30 flex items-center justify-center">
          <Card className="max-w-2xl w-full p-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold mb-4">🎯 Luyện Tập Tổng Hợp</h1>
              <p className="text-lg text-muted-foreground">
                Kiểm tra khả năng nhận diện của bạn trong 2 phút!
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <Card className="p-4 bg-blue-50">
                <h3 className="font-semibold mb-2">📚 Nội dung:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Level Newbie: Chữ cái A-Z, Số 0-9</li>
                  <li>Level Basic: Từ vựng cơ bản</li>
                  <li>Level Advanced: Câu giao tiếp nâng cao</li>
                </ul>
              </Card>

              <Card className="p-4 bg-green-50">
                <h3 className="font-semibold mb-2">⏱️ Quy tắc:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Thời gian: 2 phút</li>
                  <li>Mỗi câu đúng: +15 điểm</li>
                  <li>Có thể bỏ qua câu khó</li>
                  <li>Hệ thống tự chấm điểm bằng AI</li>
                </ul>
              </Card>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={handleStart} size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Bắt đầu
              </Button>
              <Button onClick={handleExit} variant="outline" size="lg">
                Quay lại
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Practice screen
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
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold">🎯 Luyện tập tổng hợp</h1>
              <Button onClick={handleExit} variant="outline" size="sm">
                Thoát
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              <Card className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <div>
                    <p className="text-xs opacity-90">Điểm</p>
                    <p className="text-lg font-bold">{score}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-2 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <div>
                    <p className="text-xs opacity-90">Đúng</p>
                    <p className="text-lg font-bold">{correctCount}</p>
                  </div>
                </div>
              </Card>

              <Card className={`p-2 ${timeRemaining <= 30 ? 'bg-gradient-to-br from-orange-500 to-red-600 animate-pulse' : 'bg-gradient-to-br from-purple-500 to-purple-600'} text-white`}>
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <div>
                    <p className="text-xs opacity-90">Thời gian</p>
                    <p className="text-lg font-bold">{formatTime(timeRemaining)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                <div className="flex items-center gap-1">
                  <div className="text-xs opacity-90">Câu</div>
                  <p className="text-lg font-bold">{currentIndex + 1}/{questions.length}</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Question area */}
          <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 flex flex-col justify-center">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Thực hiện cử chỉ:</p>
                  
                  {/* ASL: chữ/số lớn */}
                  {currentQuestion.type === 'asl' && (
                    <p className="text-7xl font-bold text-blue-600">{currentQuestion.label}</p>
                  )}
                  
                  {/* VSL: tên câu tiếng Việt */}
                  {currentQuestion.type === 'vsl' && (
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-blue-600 capitalize">
                        {currentQuestion.label.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-500 italic">
                        Thực hiện ký hiệu theo yêu cầu
                      </p>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleSkip}
                  size="sm"
                  className="mx-auto"
                >
                  <ArrowRight className="w-3 h-3 mr-1" />
                  Bỏ qua
                </Button>
              </div>
            </Card>

            <div className="min-h-0">
              {/* VSL: dùng SignCameraSequence (60 frames) */}
              {currentQuestion.type === 'vsl' ? (
                <SignCameraSequence
                  targetSign={currentQuestion.label}
                  onCorrectSign={handleCorrectSign}
                  onIncorrectSign={() => {}}
                  sessionId={sessionId}
                />
              ) : (
                /* ASL: dùng SignCamera (real-time) */
                <SignCamera
                  targetSign={currentQuestion.label}
                  onCorrectSign={handleCorrectSign}
                  sessionId={sessionId}
                  autoAdvance={true}
                  showSuccessAnimation={true}
                />
              )}
            </div>
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
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <Trophy className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold mb-2">🎉 Hoàn thành!</h1>
                <p className="text-muted-foreground">Kết quả luyện tập của bạn</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-blue-50">
                  <p className="text-sm text-muted-foreground mb-1">Tổng điểm</p>
                  <p className="text-4xl font-bold text-blue-600">{score}</p>
                </Card>
                <Card className="p-4 bg-green-50">
                  <p className="text-sm text-muted-foreground mb-1">Số câu đúng</p>
                  <p className="text-4xl font-bold text-green-600">{correctCount}/{answers.length}</p>
                </Card>
                <Card className="p-4 bg-purple-50">
                  <p className="text-sm text-muted-foreground mb-1">Độ chính xác</p>
                  <p className="text-4xl font-bold text-purple-600">{accuracy}%</p>
                </Card>
                <Card className="p-4 bg-orange-50">
                  <p className="text-sm text-muted-foreground mb-1">Thời gian</p>
                  <p className="text-4xl font-bold text-orange-600">{formatTime(SESSION_DURATION - timeRemaining)}</p>
                </Card>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={handleStart} size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Luyện lại
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
