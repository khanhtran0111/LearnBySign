import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Play, CheckCircle2, Lock } from "lucide-react";
import { ImageWithFallback } from "./fallback/ImageWithFallback";

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface LessonCardProps {
  lesson: Lesson;
  onPlay: (lesson: Lesson) => void;
}

export function LessonCard({ lesson, onPlay }: LessonCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
      <div className="relative aspect-square bg-gray-100">
        <ImageWithFallback
          src={lesson.thumbnailUrl}
          alt={lesson.title}
          className="w-full h-full object-cover"
        />
        {lesson.isLocked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <Lock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Hoàn thành bài trước</p>
            </div>
          </div>
        )}
        {lesson.isCompleted && !lesson.isLocked && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Hoàn thành
            </Badge>
          </div>
        )}
        {!lesson.isLocked && !lesson.isCompleted && (
          <button
            onClick={() => onPlay(lesson)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-blue-600 ml-1" />
            </div>
          </button>
        )}
        <Badge variant="secondary" className="absolute bottom-2 right-2">
          {lesson.duration}
        </Badge>
      </div>
      <div className="p-3">
        <h4 className="mb-1 text-sm line-clamp-1">{lesson.title}</h4>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {lesson.description}
        </p>
        <Button
          onClick={() => onPlay(lesson)}
          disabled={lesson.isLocked}
          size="sm"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs"
        >
          {lesson.isCompleted ? "Xem lại" : "Bắt đầu"}
        </Button>
      </div>
    </Card>
  );
}
