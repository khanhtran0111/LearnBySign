import { LessonCard, Lesson } from "./LessonCard";
import { Badge } from "./ui/badge";
import { Trophy, Target, Flame } from "lucide-react";
import { Card } from "./ui/card";
import { StudyLevel } from "./DashboardSidebar";

interface DashboardContentProps {
  level: StudyLevel;
  lessons: Lesson[];
  onPlayLesson: (lesson: Lesson) => void;
}

export function DashboardContent({ level, lessons, onPlayLesson }: DashboardContentProps) {
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
  const completedLessons = lessons.filter((l) => l.isCompleted).length;
  const totalLessons = lessons.length;
  const progress = Math.round((completedLessons / totalLessons) * 100);

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
            Hoàn thành {completedLessons}/{totalLessons} bài học ({progress}%)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 border-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiến độ</p>
                <p className="text-2xl">{progress}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoàn thành</p>
                <p className="text-2xl">{completedLessons}</p>
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

        {/* Lessons Grid */}
        <div className="mb-4">
          <h2 className="mb-4">Danh sách bài học</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onPlay={onPlayLesson}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
