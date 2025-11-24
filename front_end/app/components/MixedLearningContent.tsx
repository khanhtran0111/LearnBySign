import { useState } from "react";
import { LessonCard, Lesson } from "./LessonCard";
import { PracticeExerciseCard, PracticeExercise } from "./PracticeExerciseCard";
import { MatchingGame } from "./exercises/MatchingGame";
import { QuickQuiz } from "./exercises/QuickQuiz";
import { FillInBlank } from "./exercises/FillInBlank";
import { Badge } from "./ui/badge";
import { Trophy, Target, Flame, BookOpen, Dumbbell } from "lucide-react";
import { Card } from "./ui/card";
import { StudyLevel } from "./DashboardSidebar";

type LearningItem = 
  | ({ type: 'lesson' } & Lesson)
  | ({ type: 'practice' } & PracticeExercise);

interface MixedLearningContentProps {
  level: StudyLevel;
  items: LearningItem[];
  onPlayLesson: (lesson: Lesson) => void;
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

export function MixedLearningContent({ level, items, onPlayLesson }: MixedLearningContentProps) {
  const [currentExercise, setCurrentExercise] = useState<PracticeExercise | null>(null);
  const [learningItems, setLearningItems] = useState(items);

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
      setCurrentExercise(exercise);
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

  // Render specific exercise type
  if (currentExercise) {
    switch (currentExercise.exerciseType) {
      case "matching":
        return (
          <MatchingGame
            pairs={matchingData}
            onComplete={handleCompleteExercise}
            onExit={handleExitExercise}
          />
        );
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
