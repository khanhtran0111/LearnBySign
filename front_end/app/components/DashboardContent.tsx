import { LessonCard, Lesson } from "./LessonCard";
import { Badge } from "./ui/badge";
import { Trophy, Target, Flame } from "lucide-react";
import { Card } from "./ui/card";
import { StudyLevel } from "./DashboardSidebar";
import { LessonGroup } from "@/app/data/lessonsData";

interface UserStats {
  currentStreak?: number;
  lessonPoints?: number;
  practicePoints?: number;
}

interface DashboardContentProps {
  level: StudyLevel;
  lessonGroups: LessonGroup[];
  onPlayLesson: (lesson: Lesson) => void;
  userStats?: UserStats;
}

export function DashboardContent({ level, lessonGroups, onPlayLesson, userStats }: DashboardContentProps) {
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
  
  // Tính tổng số bài học từ tất cả các groups
  const allLessons = lessonGroups.flatMap(group => group.lessons);
  const completedLessons = allLessons.filter((l) => l.isCompleted).length;
  const totalLessons = allLessons.length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
                <p className="text-2xl">{userStats?.currentStreak || 0} ngày</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Lessons Grid */}
        <div className="mb-4">
          <h2 className="mb-4">Lộ trình học tập</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Bài học và bài luyện tập được xếp theo từng phần để dễ dàng theo dõi
          </p>
        </div>

        {/* Lesson Groups */}
        <div className="space-y-8">
          {lessonGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                  {groupIndex + 1}
                </span>
                {group.groupTitle}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onPlay={onPlayLesson}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
