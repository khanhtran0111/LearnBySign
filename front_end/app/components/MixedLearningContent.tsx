"use client";

import { useState, useEffect, useMemo } from "react";
import { LessonCard, Lesson } from "./LessonCard";
import { PracticeExerciseCard, PracticeExercise } from "./PracticeExerciseCard";
import { MatchingGame } from "./exercises/MatchingGame";
import { QuickQuiz } from "./exercises/QuickQuiz";
import { FillInBlank } from "./exercises/FillInBlank";
import { Badge } from "./ui/badge";
import { Trophy, Target, Flame, BookOpen, Dumbbell, Timer, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Card } from "./ui/card";
import { StudyLevel } from "./DashboardSidebar";
import { SignCamera } from "./SignCamera";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

type LearningItem = 
  | ({ type: 'lesson' } & Lesson)
  | ({ type: 'practice' } & PracticeExercise);

interface MixedLearningContentProps {
  level: StudyLevel;
  items: LearningItem[];
  onPlayLesson: (lesson: Lesson) => void;
  onStartExercise?: (exercise: PracticeExercise) => void;
}

// Mock data for exercises
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
  {
    id: "3",
    sentence: "I love eating ___.",
    correctAnswer: "apple",
    hint: "Một loại trái cây màu đỏ",
    sign: "🍎",
  },
  {
    id: "4",
    sentence: "Say ___ to your friend.",
    correctAnswer: "hello",
    hint: "Lời chào khi gặp mặt",
    sign: "👋",
  },
];

export function MixedLearningContent({ level, items, onPlayLesson, onStartExercise }: MixedLearningContentProps) {
  const [currentExercise, setCurrentExercise] = useState<PracticeExercise | null>(null);
  const [learningItems, setLearningItems] = useState(items);
  const [isDoingSignPractice, setIsDoingSignPractice] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes
  const [practiceSequence, setPracticeSequence] = useState<string[]>([]);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [signStatus, setSignStatus] = useState<('pending' | 'correct' | 'skipped')[]>([]);
  const [sessionId, setSessionId] = useState<string>(`practice_${Date.now()}`);
  const generatePracticeSequence = () => {
    const signs = ['A', 'B', 'C', 'D', 'E'];
    const sequence: string[] = [];
    const count = 10; 
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * signs.length);
      sequence.push(signs[randomIndex]);
    }
    
    return sequence;
  };

  const startSignPractice = () => {
    const sequence = generatePracticeSequence();
    setPracticeSequence(sequence);
    setSignStatus(new Array(sequence.length).fill('pending'));
    setCurrentSignIndex(0);
    setPracticeScore(0);
    setTimeRemaining(120);
    setCorrectAttempts(0);
    setPracticeCompleted(false);
    setSessionId(`practice_${Date.now()}_0`); 
    setIsDoingSignPractice(true);
  };

  useEffect(() => {
    if (!isDoingSignPractice || practiceCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endPractice();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDoingSignPractice, practiceCompleted]);

  // Handle correct sign
  const handleCorrectSign = () => {
    console.log('handleCorrectSign called for index:', currentSignIndex);
    setSignStatus(prev => {
      const newStatus = [...prev];
      newStatus[currentSignIndex] = 'correct';
      return newStatus;
    });
    
    const pointsEarned = 10;
    setPracticeScore((prev) => prev + pointsEarned);
    setCorrectAttempts((prev) => prev + 1);
    setTimeout(() => {
      if (currentSignIndex < practiceSequence.length - 1) {
        setCurrentSignIndex((prev) => prev + 1);
        setSessionId(`practice_${Date.now()}_${currentSignIndex + 1}`);
      } else {
        setPracticeCompleted(true);
        endPractice();
      }
    }, 100);
  };

  const handleSkipSign = () => {
    console.log('⏭️ handleSkipSign called for index:', currentSignIndex);
    setSignStatus(prev => {
      const newStatus = [...prev];
      newStatus[currentSignIndex] = 'skipped';
      return newStatus;
    });
    
    if (currentSignIndex < practiceSequence.length - 1) {
      setCurrentSignIndex((prev) => prev + 1);
      setSessionId(`practice_${Date.now()}_${currentSignIndex + 1}`);
    } else {
      setPracticeCompleted(true);
      endPractice();
    }
  };

  const endPractice = () => {
    setPracticeCompleted(true);
    setIsDoingSignPractice(false);
  };

  const exitSignPractice = () => {
    setIsDoingSignPractice(false);
    setPracticeCompleted(false);
    setPracticeSequence([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const levelInfo = {
    newbie: {
      title: "Cấp độ Newbie",
      subtitle: "Học chữ cái, số và ký hiệu cơ bản",
      color: "from-green-500 to-green-600",
    },
    basic: {
      title: "Cấp độ Basic",
      subtitle: "Học từ vựng tiếng Anh cơ bản",
      color: "from-blue-500 to-blue-600",
    },
    advanced: {
      title: "Cấp độ Advanced",
      subtitle: "Học câu và giao tiếp hoàn chỉnh",
      color: "from-purple-500 to-purple-600",
    },
  };

  const info = levelInfo[level];
  
  const lessons = learningItems.filter((item): item is ({ type: 'lesson' } & Lesson) => item.type === 'lesson');
  const practices = learningItems.filter((item): item is ({ type: 'practice' } & PracticeExercise) => item.type === 'practice');
  
  const completedLessons = lessons.filter((l) => l.isCompleted).length;
  const completedPractices = practices.filter((p) => p.isCompleted).length;
  const totalItems = learningItems.length;
  const completedItems = completedLessons + completedPractices;
  const progress = Math.round((completedItems / totalItems) * 100);

  const handleStartExercise = (exercise: PracticeExercise) => {
    if (!exercise.isLocked) {
      if (onStartExercise) {
        onStartExercise(exercise);
      } else {
        if (exercise.exerciseType === "matching") {
          startSignPractice();
        } else {
          setCurrentExercise(exercise);
        }
      }
    }
  };

  const handleCompleteExercise = (score: number) => {
    if (currentExercise) {
      setLearningItems(
        learningItems.map((item) =>
          item.type === 'practice' && item.id === currentExercise.id 
            ? { ...item, isCompleted: true } 
            : item
        )
      );
      setCurrentExercise(null);
    }
  };

  const handleExitExercise = () => {
    setCurrentExercise(null);
  };

  if (currentExercise) {
    switch (currentExercise.exerciseType) {
      case "quiz":
        return (
          <QuickQuiz
            questions={quizData}
            onComplete={handleCompleteExercise}
            onExit={handleExitExercise}
          />
        );
      case "fill-blank":
        return (
          <FillInBlank
            questions={fillBlankData}
            onComplete={handleCompleteExercise}
            onExit={handleExitExercise}
          />
        );
    }
  }

  // Render Sign Recognition Practice
  if (isDoingSignPractice && practiceSequence.length > 0) {
    const currentSign = practiceSequence[currentSignIndex];
    const progress = ((currentSignIndex + 1) / practiceSequence.length) * 100;

    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-b from-white to-blue-50/30">
        <div className="flex-1 flex flex-col p-4 max-h-screen">
          {/* Compact Practice Header */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-xl font-bold">📚 Luyện tập nhận diện cử chỉ A-E</h1>
              </div>
              <Button onClick={exitSignPractice} variant="outline" size="sm">
                Thoát
              </Button>
            </div>

            {/* Compact Stats Bar */}
            <div className="grid grid-cols-4 gap-2 mb-3">
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
                    <p className="text-xs opacity-90">Đúng</p>
                    <p className="text-lg font-bold">{correctAttempts}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <div>
                    <p className="text-xs opacity-90">Tiến độ</p>
                    <p className="text-lg font-bold">{currentSignIndex + 1}/{practiceSequence.length}</p>
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

            {/* Compact Progress with color indicators */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">
                  {currentSignIndex + 1}/{practiceSequence.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="flex gap-1">
                {practiceSequence.map((sign, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-1.5 rounded ${
                      signStatus[idx] === 'correct'
                        ? 'bg-green-500'
                        : signStatus[idx] === 'skipped'
                        ? 'bg-red-500'
                        : idx === currentSignIndex
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`}
                    title={`${sign} - ${signStatus[idx] || 'pending'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area - 2 columns */}
          <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
            {/* Left: Target Sign */}
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

            {/* Right: Camera Component */}
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

          {/* Sequence Preview */}
          <Card className="mt-6 p-4">
            <h3 className="text-sm font-semibold mb-3">Trình tự cử chỉ:</h3>
            <div className="flex gap-2 flex-wrap">
              {practiceSequence.map((sign, idx) => (
                <Badge
                  key={idx}
                  variant={idx < currentSignIndex ? "default" : idx === currentSignIndex ? "secondary" : "outline"}
                  className={`text-lg px-3 py-1 ${
                    idx < currentSignIndex 
                      ? "bg-green-500 text-white" 
                      : idx === currentSignIndex 
                      ? "bg-yellow-500 text-white animate-pulse" 
                      : ""
                  }`}
                >
                  {sign}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Render Practice Completed Screen
  if (practiceCompleted) {
    const accuracy = practiceSequence.length > 0
      ? Math.round((correctAttempts / practiceSequence.length) * 100) 
      : 0;

    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-blue-50/30">
        <div className="p-8 max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold mb-2">
                {practiceScore >= 80 ? "🎉 Hoàn thành xuất sắc!" : practiceScore >= 50 ? "👏 Làm tốt lắm!" : "💪 Tiếp tục luyện tập!"}
              </h1>
              <p className="text-muted-foreground">
                {practiceScore >= 80 
                  ? "Bạn đã nắm vững các cử chỉ!" 
                  : practiceScore >= 50 
                  ? "Bạn đã làm rất tốt!" 
                  : "Hãy luyện tập thêm để thành thạo hơn!"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-4 bg-blue-50">
                <p className="text-sm text-muted-foreground mb-1">Tổng điểm</p>
                <p className="text-3xl font-bold text-blue-600">{practiceScore}</p>
              </Card>
              <Card className="p-4 bg-green-50">
                <p className="text-sm text-muted-foreground mb-1">Độ chính xác</p>
                <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
              </Card>
              <Card className="p-4 bg-purple-50">
                <p className="text-sm text-muted-foreground mb-1">Đúng</p>
                <p className="text-3xl font-bold text-purple-600">{correctAttempts}</p>
              </Card>
              <Card className="p-4 bg-blue-50">
                <p className="text-sm text-muted-foreground mb-1">Tổng số câu</p>
                <p className="text-3xl font-bold text-blue-600">{practiceSequence.length}</p>
              </Card>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={startSignPractice} size="lg">
                <BookOpen className="w-5 h-5 mr-2" />
                Luyện lại
              </Button>
              <Button onClick={exitSignPractice} variant="outline" size="lg">
                Quay lại
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-blue-50/30">
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${info.color} rounded-full text-white mb-4`}>
            <Trophy className="w-4 h-4" />
            <span className="text-sm">{info.title}</span>
          </div>
          <h1 className="mb-2">{info.subtitle}</h1>
          <p className="text-muted-foreground">
            Hoàn thành {completedItems}/{totalItems} bài ({progress}%)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiến độ tổng</p>
                <p className="text-2xl">{progress}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bài học</p>
                <p className="text-2xl">{completedLessons}/{lessons.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Luyện tập</p>
                <p className="text-2xl">{completedPractices}/{practices.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chuỗi ngày học</p>
                <p className="text-2xl">7 ngày</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Learning Path - Mixed Content */}
        <div className="mb-4">
          <h2 className="mb-4 flex items-center gap-2">
            <span>Lộ trình học tập</span>
            <Badge variant="secondary" className="text-xs">
              {totalItems} mục
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bài học và bài luyện tập được xếp xen kẽ để tối ưu hóa việc học
          </p>
        </div>

        {/* Mixed Grid of Lessons and Exercises */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {learningItems.map((item) => {
            if (item.type === 'lesson') {
              return (
                <LessonCard
                  key={`lesson-${item.id}`}
                  lesson={item}
                  onPlay={onPlayLesson}
                />
              );
            } else {
              return (
                <PracticeExerciseCard
                  key={`practice-${item.id}`}
                  exercise={item}
                  onStart={handleStartExercise}
                />
              );
            }
          })}
        </div>

        {/* Tips Section */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-blue-900">💡 Mẹo học tập hiệu quả</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Học bài học trước, sau đó làm bài tập để củng cố kiến thức</li>
                <li>• Hoàn thành tất cả bài luyện tập để mở khóa cấp độ tiếp theo</li>
                <li>• Xem lại bài học và bài tập đã hoàn thành để ghi nhớ lâu hơn</li>
              </ul>
            </div>
          </div>
        </Card>


      </div>
    </div>
  );
}
