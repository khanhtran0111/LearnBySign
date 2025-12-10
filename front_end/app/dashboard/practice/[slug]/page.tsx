"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { DashboardHeader } from '@/app/components/DashboardHeader';
import { MatchingGame } from '@/app/components/exercises/MatchingGame';
import { QuickQuiz } from '@/app/components/exercises/QuickQuiz';
import { FillInBlank } from '@/app/components/exercises/FillInBlank';
import { SignCamera } from '@/app/components/SignCamera';
import { SignCameraSequence } from '@/app/components/SignCameraSequence';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Trophy, Timer, CheckCircle, BookOpen, ArrowRight } from 'lucide-react';
import { toVietnamese } from '@/app/utils/vietnameseMapping';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface User {
  fullName: string;
  email: string;
  avatarUrl?: string;
  _id?: string;
  id?: string;
}

const mockExercises: Record<string, any> = {
  // ===== NEWBIE PRACTICES =====
  "p1-ghep-chu-cai-a-h": {
    id: "p1",
    title: "Luyện tập chữ cái A-H",
    description: "Luyện tập thực hành ký hiệu các chữ cái A-H",
    exerciseType: "matching",
    difficulty: "newbie",
    points: 50,
    signs: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  },
  
  "p2-trac-nghiem-chu-cai-i-p": {
    id: "p2",
    title: "Luyện tập chữ cái I-P",
    description: "Luyện tập thực hành ký hiệu các chữ cái I-P",
    exerciseType: "matching",
    difficulty: "newbie",
    points: 40,
    signs: ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
  },
  
  "p3-dien-chu-vao-cau-q-z": {
    id: "p3",
    title: "Luyện tập chữ cái Q-Z",
    description: "Luyện tập thực hành ký hiệu các chữ cái Q-Z",
    exerciseType: "matching",
    difficulty: "newbie",
    points: 60,
    signs: ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  },
  
  "p4-luyen-tap-so-0-9": {
    id: "p4",
    title: "Luyện tập số 0-9",
    description: "Luyện tập thực hành ký hiệu các số 0-9",
    exerciseType: "matching",
    difficulty: "newbie",
    points: 50,
    signs: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },

  // ===== BASIC PRACTICES =====
  "p5-gia-dinh-am-thuc": {
    id: "p5",
    title: "Luyện tập: Gia đình & Ẩm thực",
    description: "Thực hành nhận diện từ vựng về gia đình và ẩm thực",
    exerciseType: "matching",
    difficulty: "basic",
    points: 80,
    lessonIds: ['b1', 'b2'], // Lấy từ vựng từ bài 1 và 2
  },

  "p6-quoc-gia-dong-vat": {
    id: "p6",
    title: "Luyện tập: Quốc gia & Động vật",
    description: "Thực hành nhận diện từ vựng về quốc gia và động vật",
    exerciseType: "matching",
    difficulty: "basic",
    points: 80,
    lessonIds: ['b3', 'b4'], // Lấy từ vựng từ bài 3 và 4
  },

  "p7-phuong-tien-hanh-dong": {
    id: "p7",
    title: "Luyện tập: Phương tiện & Hành động",
    description: "Thực hành nhận diện từ vựng về phương tiện và hành động",
    exerciseType: "matching",
    difficulty: "basic",
    points: 80,
    lessonIds: ['b5', 'b6'], // Lấy từ vựng từ bài 5 và 6
  },

  "p9-cac-tu-khac": {
    id: "p9",
    title: "Luyện tập: Các từ khác",
    description: "Thực hành nhận diện các từ vựng phổ biến khác",
    exerciseType: "matching",
    difficulty: "basic",
    points: 80,
    lessonIds: ['b7'], // Lấy từ vựng từ bài 7
  },

  // ===== ADVANCED PRACTICES =====
  "p8-giao-tiep-nang-cao": {
    id: "p8",
    title: "Luyện tập: Giao tiếp nâng cao",
    description: "Thực hành các câu giao tiếp và cụm từ phức tạp",
    exerciseType: "matching",
    difficulty: "advanced",
    points: 100,
    lessonIds: ['a1'], // Lấy từ vựng từ bài Advanced
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
  const [currentSignUrl, setCurrentSignUrl] = useState<string>(''); // URL của GIF hiện tại
  const [availableSigns, setAvailableSigns] = useState<{label: string, videoUrl: string}[]>([]); // Danh sách từ vựng
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [sessionId, setSessionId] = useState<string>(`practice_${Date.now()}`);
  const [isLoading, setIsLoading] = useState(true);
  const processingRef = useRef(false);
  const correctAttemptsRef = useRef(0);
  const userRef = useRef<User | null>(null);
  const availableSignsRef = useRef<{label: string, videoUrl: string}[]>([]);

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
        userRef.current = response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('accessToken');
        }
        router.push('/login');
      }
    };

    loadProfile();
  }, [router]);

  // Load vocabulary for Basic/Advanced practices
  useEffect(() => {
    const loadVocabulary = async () => {
      if (!exercise) return;
      
      // Nếu là Newbie (có sẵn signs), không cần load từ API
      if (exercise.signs) {
        setIsLoading(false);
        return;
      }

      // Nếu là Basic/Advanced, load từ vựng từ API
      if (exercise.lessonIds) {
        try {
          const token = localStorage.getItem('accessToken');
          const allContents: {label: string, videoUrl: string}[] = [];
          
          for (const lessonId of exercise.lessonIds) {
            const response = await axios.get(`${BACKEND_URL}/lessons/by-custom-id/${lessonId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.data?.contents) {
              allContents.push(...response.data.contents.map((c: any) => ({
                label: c.label,
                videoUrl: c.videoUrl,
              })));
            }
          }
          
          setAvailableSigns(allContents);
          availableSignsRef.current = allContents;
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading vocabulary:', error);
          setIsLoading(false);
        }
      }
    };

    loadVocabulary();
  }, [exercise]);

  // Start practice when data is ready
  useEffect(() => {
    if (exercise?.exerciseType === "matching" && !isLoading) {
      startSignPractice();
    }
  }, [exercise, isLoading]);



  useEffect(() => {
    if (!isDoingSignPractice || practiceCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const finalAttempts = correctAttemptsRef.current;
          const currentUser = userRef.current;
          
          setPracticeCompleted(true);
          setIsDoingSignPractice(false);
          
          if (currentUser) {
            const token = localStorage.getItem('accessToken');
            if (token) {
              axios.post(`${BACKEND_URL}/progress/mark`, {
                idUser: currentUser._id || currentUser.id,
                idLesson: exercise.id,
                type: 'practice',
                completed: true,
                correctAnswers: finalAttempts,
              }, {
                headers: { Authorization: `Bearer ${token}` },
              }).then(() => {
                alert(`Hết giờ! Điểm: ${finalAttempts * 15}`);
              }).catch(() => {
                alert('Có lỗi khi lưu điểm!');
              });
            }
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDoingSignPractice, practiceCompleted]);

  const startSignPractice = () => {
    // Newbie: dùng signs từ config (chữ cái/số)
    if (exercise.signs) {
      const signs = exercise.signs;
      const randomIndex = Math.floor(Math.random() * signs.length);
      setCurrentSign(signs[randomIndex]);
      setCurrentSignUrl('');
    } 
    // Basic/Advanced: dùng từ vựng từ API
    else if (availableSignsRef.current.length > 0) {
      const signs = availableSignsRef.current;
      const randomIndex = Math.floor(Math.random() * signs.length);
      const selected = signs[randomIndex];
      setCurrentSign(selected.label);
      setCurrentSignUrl(selected.videoUrl);
    }
    
    setPracticeScore(0);
    setTimeRemaining(120);
    setCorrectAttempts(0);
    correctAttemptsRef.current = 0;
    setPracticeCompleted(false);
    setSessionId(`practice_${Date.now()}_0`);
    setIsDoingSignPractice(true);
    processingRef.current = false;
  };

  const handleCorrectSign = () => {
    if (processingRef.current) return;
    
    processingRef.current = true;
    
    const pointsEarned = 15;
    setPracticeScore((prev) => prev + pointsEarned);
    setCorrectAttempts((prev) => {
      const newValue = prev + 1;
      correctAttemptsRef.current = newValue;
      return newValue;
    });
    
    // Newbie: dùng signs từ config
    if (exercise.signs) {
      const signs = exercise.signs;
      const filteredSigns = signs.filter((sign: string) => sign !== currentSign);
      const randomIndex = Math.floor(Math.random() * filteredSigns.length);
      const newSign = filteredSigns[randomIndex];
      setCurrentSign(newSign);
      setCurrentSignUrl('');
      setSessionId(`practice_${Date.now()}_${newSign}`);
    }
    // Basic/Advanced: dùng từ vựng từ API
    else if (availableSignsRef.current.length > 0) {
      const signs = availableSignsRef.current;
      const filteredSigns = signs.filter(s => s.label !== currentSign);
      const randomIndex = Math.floor(Math.random() * filteredSigns.length);
      const selected = filteredSigns[randomIndex] || signs[0];
      setCurrentSign(selected.label);
      setCurrentSignUrl(selected.videoUrl);
      setSessionId(`practice_${Date.now()}_${selected.label}`);
    }
    
    setTimeout(() => {
      processingRef.current = false;
    }, 1000);
  };

  const handleSkipSign = () => {
    // Newbie: dùng signs từ config
    if (exercise.signs) {
      const signs = exercise.signs;
      const filteredSigns = signs.filter((sign: string) => sign !== currentSign);
      const randomIndex = Math.floor(Math.random() * filteredSigns.length);
      const newSign = filteredSigns[randomIndex];
      setCurrentSign(newSign);
      setCurrentSignUrl('');
      setSessionId(`practice_${Date.now()}_${randomIndex}`);
    }
    // Basic/Advanced: dùng từ vựng từ API
    else if (availableSignsRef.current.length > 0) {
      const signs = availableSignsRef.current;
      const filteredSigns = signs.filter(s => s.label !== currentSign);
      const randomIndex = Math.floor(Math.random() * filteredSigns.length);
      const selected = filteredSigns[randomIndex] || signs[0];
      setCurrentSign(selected.label);
      setCurrentSignUrl(selected.videoUrl);
      setSessionId(`practice_${Date.now()}_${randomIndex}`);
    }
  };

  const endPractice = async () => {
    const finalCorrectAttempts = correctAttemptsRef.current;
    
    setPracticeCompleted(true);
    setIsDoingSignPractice(false);
    
    await markPracticeProgress(finalCorrectAttempts);
  };

  const markPracticeProgress = async (finalCorrectAttempts: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token || !user) return;

    try {
      const userResponse = await axios.get(`${BACKEND_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const userId = userResponse.data._id || userResponse.data.id;

      await axios.post(`${BACKEND_URL}/progress/mark`, {
        idUser: userId,
        idLesson: exercise.id,
        type: 'practice',
        completed: true,
        correctAnswers: finalCorrectAttempts,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Hoàn thành practice! Điểm: ${finalCorrectAttempts * 15}`);
    } catch (error) {
      alert('Có lỗi khi lưu điểm practice!');
    }
  };

  const exitSignPractice = () => {
    // Quay về đúng dashboard level dựa vào exercise difficulty
    if (exercise.difficulty === 'basic') {
      router.push('/dashboard/basic');
    } else if (exercise.difficulty === 'advanced') {
      router.push('/dashboard/advanced');
    } else {
      router.push('/dashboard/newbie');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = async (score: number) => {
    const token = localStorage.getItem('accessToken');
    if (token && user) {
      try {
        const userResponse = await axios.get(`${BACKEND_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const userId = userResponse.data._id || userResponse.data.id;
        const correctAnswers = Math.floor(score / 15);

        // Gọi API với customId trực tiếp
        await axios.post(`${BACKEND_URL}/progress/mark`, {
          idUser: userId,
          idLesson: exercise.id,
          type: 'practice',
          completed: true,
          correctAnswers: correctAnswers,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert(`Hoàn thành bài tập! Điểm: ${score}`);
      } catch (error) {
        console.error('Error marking progress:', error);
        alert(`Hoàn thành bài tập! Điểm: ${score}`);
      }
    }
    // Quay về đúng dashboard level
    if (exercise.difficulty === 'basic') {
      router.push('/dashboard/basic');
    } else if (exercise.difficulty === 'advanced') {
      router.push('/dashboard/advanced');
    } else {
      router.push('/dashboard/newbie');
    }
  };

  const handleExit = () => {
    // Quay về đúng dashboard level
    if (exercise.difficulty === 'basic') {
      router.push('/dashboard/basic');
    } else if (exercise.difficulty === 'advanced') {
      router.push('/dashboard/advanced');
    } else {
      router.push('/dashboard/newbie');
    }
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
              <div className="flex gap-2">
                <Button onClick={endPractice} variant="default" size="sm">
                  Hoàn thành
                </Button>
                <Button onClick={exitSignPractice} variant="outline" size="sm">
                  Thoát
                </Button>
              </div>
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
                
                {/* Newbie: hiển thị chữ cái/số lớn */}
                {exercise.signs && (
                  <p className="text-7xl font-bold text-blue-600 mb-2">{currentSign}</p>
                )}
                
                {/* Basic/Advanced: hiển thị GIF và label */}
                {!exercise.signs && currentSignUrl && (
                  <div className="mb-2">
                    <img 
                      src={currentSignUrl} 
                      alt={currentSign}
                      className="w-48 h-48 object-contain mx-auto rounded-lg border-2 border-blue-200 mb-2"
                    />
                    <p className="text-2xl font-bold text-blue-600 capitalize">
                      {toVietnamese(currentSign)}
                    </p>
                  </div>
                )}
                
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
              {/* Advanced: dùng SignCameraSequence (60 frames) */}
              {exercise.difficulty === 'advanced' ? (
                <SignCameraSequence
                  targetSign={currentSign}
                  targetGifUrl={currentSignUrl}
                  onCorrectSign={handleCorrectSign}
                  onIncorrectSign={() => {}}
                  sessionId={sessionId}
                />
              ) : (
                /* Newbie/Basic: dùng SignCamera (real-time) */
                <SignCamera
                  targetSign={currentSign}
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
