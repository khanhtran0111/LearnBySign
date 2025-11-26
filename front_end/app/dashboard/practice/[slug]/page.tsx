"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { DashboardHeader } from '@/app/components/DashboardHeader';
import { MatchingGame } from '@/app/components/exercises/MatchingGame';
import { QuickQuiz } from '@/app/components/exercises/QuickQuiz';
import { FillInBlank } from '@/app/components/exercises/FillInBlank';
import { SignCamera } from '@/app/components/SignCamera';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Trophy, Timer, CheckCircle, BookOpen, ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface User {
  fullName: string;
  email: string;
  avatarUrl?: string;
}

const mockExercises: Record<string, any> = {
  // Phần 1: A-H
  "p1-ghep-chu-cai-a-h": {
    id: "p1",
    title: "Ghép chữ cái A-H",
    description: "Luyện tập ghép các chữ cái A-H với ký hiệu",
    exerciseType: "matching",
    difficulty: "easy",
    points: 50,
  },
  
  // Phần 2: I-P
  "p2-trac-nghiem-chu-cai-i-p": {
    id: "p2",
    title: "Trắc nghiệm chữ cái I-P",
    description: "Kiểm tra kiến thức về chữ cái I-P",
    exerciseType: "quiz",
    difficulty: "easy",
    points: 40,
  },
  
  // Phần 3: Q-Z
  "p3-dien-chu-vao-cau-q-z": {
    id: "p3",
    title: "Điền chữ vào câu Q-Z",
    description: "Hoàn thành câu với chữ cái phù hợp",
    exerciseType: "fill-blank",
    difficulty: "easy",
    points: 60,
  },
  
  // Phần 4: Số 0-9
  "p4-luyen-tap-so-0-9": {
    id: "p4",
    title: "Luyện tập số 0-9",
    description: "Thực hành ký hiệu các con số",
    exerciseType: "matching",
    difficulty: "easy",
    points: 50,
  },
};

const matchingData = [
  { id: "1", sign: "👋", word: "Hello" },
  { id: "2", sign: "❤️", word: "Love" },
  { id: "3", sign: "⭐", word: "Star" },
  { id: "4", sign: "🌙", word: "Moon" },
  { id: "5", sign: "☀️", word: "Sun" },
];

const quizData = [
  {
    id: "1",
    sign: "🐱",
    question: "Ký hiệu này đại diện cho con gì?",
    options: ["Dog", "Cat", "Bird", "Fish"],
    correctAnswer: "Cat",
  },
  {
    id: "2",
    sign: "🍎",
    question: "Đây là ký hiệu của trái gì?",
    options: ["Orange", "Banana", "Apple", "Grape"],
    correctAnswer: "Apple",
  },
  {
    id: "3",
    sign: "🔴",
    question: "Đây là màu gì?",
    options: ["Blue", "Green", "Red", "Yellow"],
    correctAnswer: "Red",
  },
  {
    id: "4",
    sign: "😊",
    question: "Đây là cảm xúc gì?",
    options: ["Sad", "Angry", "Happy", "Tired"],
    correctAnswer: "Happy",
  },
];

const fillBlankData = [
  {
    id: "1",
    sentence: "I have a ___.",
    correctAnswer: "cat",
    hint: "Một con vật nuôi phổ biến",
    sign: "🐱",
  },
  {
    id: "2",
    sentence: "The ___ is shining.",
    correctAnswer: "sun",
    hint: "Nguồn ánh sáng tự nhiên",
    sign: "☀️",
  },
];

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const slug = params.slug as string;
  const exercise = mockExercises[slug];

  const [isDoingSignPractice, setIsDoingSignPractice] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);
  const [currentSign, setCurrentSign] = useState<string>('A');
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [sessionId, setSessionId] = useState<string>(`practice_${Date.now()}`);
  const processingRef = useRef(false); // Prevent duplicate calls

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
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('accessToken');
        }
        router.push('/login');
      }
    };

    loadProfile();
  }, [router]);

  useEffect(() => {
    if (exercise?.exerciseType === "matching") {
      startSignPractice();
    }
  }, [exercise]);



  useEffect(() => {
    if (!isDoingSignPractice || practiceCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPracticeCompleted(true);
          setIsDoingSignPractice(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDoingSignPractice, practiceCompleted]);

  const startSignPractice = () => {
    // Xác định danh sách chữ cái dựa trên exercise
    let signs: string[] = [];
    if (exercise.id === 'p1') {
      signs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    } else if (exercise.id === 'p2') {
      signs = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    } else if (exercise.id === 'p3') {
      signs = ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    } else if (exercise.id === 'p4') {
      signs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    } else {
      signs = ['A', 'B', 'C', 'D', 'E']; // fallback
    }
    
    const randomIndex = Math.floor(Math.random() * signs.length);
    setCurrentSign(signs[randomIndex]);
    setPracticeScore(0);
    setTimeRemaining(120);
    setCorrectAttempts(0);
    setPracticeCompleted(false);
    setSessionId(`practice_${Date.now()}_0`);
    setIsDoingSignPractice(true);
    processingRef.current = false; // Reset processing flag
  };

  const handleCorrectSign = () => {
    // Prevent duplicate calls
    if (processingRef.current) {
      console.log('⚠️ Already processing, ignoring duplicate call');
      return;
    }
    
    processingRef.current = true;
    console.log('✅ Processing correct sign:', currentSign);
    
    const pointsEarned = 10;
    setPracticeScore((prev) => prev + pointsEarned);
    setCorrectAttempts((prev) => prev + 1);
    
    // Xác định danh sách chữ cái dựa trên exercise
    let signs: string[] = [];
    if (exercise.id === 'p1') {
      signs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    } else if (exercise.id === 'p2') {
      signs = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    } else if (exercise.id === 'p3') {
      signs = ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    } else if (exercise.id === 'p4') {
      signs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    } else {
      signs = ['A', 'B', 'C', 'D', 'E']; // fallback
    }
    
    // Chuyển sang ký hiệu ngẫu nhiên tiếp theo (đảm bảo khác ký hiệu hiện tại)
    const availableSigns = signs.filter(sign => sign !== currentSign);
    const randomIndex = Math.floor(Math.random() * availableSigns.length);
    const newSign = availableSigns[randomIndex];
    
    console.log(`🔄 Chuyển từ ${currentSign} sang ${newSign}`);
    
    // Update sign và sessionId NGAY LẬP TỨC để SignCamera reset
    setCurrentSign(newSign);
    setSessionId(`practice_${Date.now()}_${newSign}`);
    
    // Giảm thời gian block xuống 1000ms (khớp với animation 1500ms trong SignCamera)
    setTimeout(() => {
      processingRef.current = false;
      console.log('🔓 Ready for next sign');
    }, 1000);
  };

  const handleSkipSign = () => {
    // Xác định danh sách chữ cái dựa trên exercise
    let signs: string[] = [];
    if (exercise.id === 'p1') {
      signs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    } else if (exercise.id === 'p2') {
      signs = ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    } else if (exercise.id === 'p3') {
      signs = ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    } else if (exercise.id === 'p4') {
      signs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    } else {
      signs = ['A', 'B', 'C', 'D', 'E']; // fallback
    }
    
    const availableSigns = signs.filter(sign => sign !== currentSign);
    const randomIndex = Math.floor(Math.random() * availableSigns.length);
    const newSign = availableSigns[randomIndex];
    console.log(`⏭️ Bỏ qua ${currentSign}, chuyển sang ${newSign}`);
    setCurrentSign(newSign);
    setSessionId(`practice_${Date.now()}_${randomIndex}`);
  };

  const endPractice = () => {
    setPracticeCompleted(true);
    setIsDoingSignPractice(false);
  };

  const exitSignPractice = () => {
    router.push('/dashboard');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = (score: number) => {
    alert(`Hoàn thành bài tập! Điểm: ${score}`);
    router.push('/dashboard');
  };

  const handleExit = () => {
    router.push('/dashboard');
  };

  const handleViewProfile = () => router.push("/profile");
  const handleSettings = () => router.push("/settings");
  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  if (!user || !exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  // Sign Practice UI
  if (isDoingSignPractice) {

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
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold">📚 {exercise.title}</h1>
              <Button onClick={exitSignPractice} variant="outline" size="sm">
                Thoát
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <Card className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <div>
                    <p className="text-xs opacity-90">Điểm</p>
                    <p className="text-lg font-bold">{practiceScore}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-2 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <div>
                    <p className="text-xs opacity-90">Số câu đúng</p>
                    <p className="text-lg font-bold">{correctAttempts}</p>
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
            </div>


          </div>

          <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 flex flex-col justify-center">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Thực hiện cử chỉ:</p>
                <p className="text-7xl font-bold text-blue-600 mb-2">{currentSign}</p>
                <Button 
                  variant="outline" 
                  onClick={handleSkipSign}
                  size="sm"
                >
                  <ArrowRight className="w-3 h-3 mr-1" />
                  Bỏ qua
                </Button>
              </div>
            </Card>

            <div className="min-h-0">
              <SignCamera
                targetSign={currentSign}
                onCorrectSign={handleCorrectSign}
                sessionId={sessionId}
                autoAdvance={true}
                showSuccessAnimation={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Practice Completed
  if (practiceCompleted) {

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
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold mb-2">🎉 Hoàn thành xuất sắc!</h1>
                <p className="text-muted-foreground">Bạn đã hoàn thành bài tập</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-blue-50">
                  <p className="text-sm text-muted-foreground mb-1">Tổng điểm</p>
                  <p className="text-3xl font-bold text-blue-600">{practiceScore}</p>
                </Card>
                <Card className="p-4 bg-green-50">
                  <p className="text-sm text-muted-foreground mb-1">Số câu đúng</p>
                  <p className="text-3xl font-bold text-green-600">{correctAttempts}</p>
                </Card>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={startSignPractice} size="lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Luyện lại
                </Button>
                <Button onClick={exitSignPractice} variant="outline" size="lg">
                  Quay lại Dashboard
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Other exercise types
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
      
      {exercise.exerciseType === "quiz" && (
        <QuickQuiz
          questions={quizData}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}
      
      {exercise.exerciseType === "fill-blank" && (
        <FillInBlank
          questions={fillBlankData}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
