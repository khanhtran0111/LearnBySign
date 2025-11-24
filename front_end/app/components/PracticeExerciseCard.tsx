import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Play, CheckCircle2, Lock, Gamepad2, Target, Zap } from "lucide-react";

export type ExerciseType = "matching" | "quiz" | "fill-blank";

export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  exerciseType: ExerciseType;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  isCompleted: boolean;
  isLocked: boolean;
  points: number;
}

interface PracticeExerciseCardProps {
  exercise: PracticeExercise;
  onStart: (exercise: PracticeExercise) => void;
}

const exerciseTypeConfig = {
  matching: {
    icon: Target,
    label: "Ghép cặp",
    gradient: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  quiz: {
    icon: Zap,
    label: "Trắc nghiệm",
    gradient: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  "fill-blank": {
    icon: Gamepad2,
    label: "Điền từ",
    gradient: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
};

const difficultyConfig = {
  easy: { label: "Dễ", color: "bg-green-500" },
  medium: { label: "Trung bình", color: "bg-yellow-500" },
  hard: { label: "Khó", color: "bg-red-500" },
};

export function PracticeExerciseCard({ exercise, onStart }: PracticeExerciseCardProps) {
  const config = exerciseTypeConfig[exercise.exerciseType];
  const Icon = config.icon;
  const diffConfig = difficultyConfig[exercise.difficulty];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all border-2 hover:border-purple-200 hover:scale-105">
      <div className={`relative aspect-square ${config.bgColor} flex items-center justify-center`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)`,
          }} />
        </div>

        {/* Icon */}
        <div className={`relative z-10 w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center ${exercise.isLocked ? 'opacity-50' : ''}`}>
          <Icon className={`w-12 h-12 ${config.iconColor}`} />
        </div>

        {/* Lock Overlay */}
        {exercise.isLocked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="text-center text-white">
              <Lock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Hoàn thành bài trước</p>
            </div>
          </div>
        )}

        {/* Completed Badge */}
        {exercise.isCompleted && !exercise.isLocked && (
          <div className="absolute top-2 right-2 z-20">
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Hoàn thành
            </Badge>
          </div>
        )}

        {/* Play Button Overlay */}
        {!exercise.isLocked && !exercise.isCompleted && (
          <button
            onClick={() => onStart(exercise)}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 transition-colors group z-20"
          >
            <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-8 h-8 text-purple-600 ml-1" />
            </div>
          </button>
        )}

        {/* Time Badge */}
        <Badge variant="secondary" className="absolute bottom-2 left-2">
          {exercise.estimatedTime}
        </Badge>

        {/* Difficulty Badge */}
        <Badge className={`absolute bottom-2 right-2 ${diffConfig.color} text-white`}>
          {diffConfig.label}
        </Badge>
      </div>

      <div className="p-3">
        {/* Exercise Type Badge */}
        <Badge className={`bg-gradient-to-r ${config.gradient} text-white mb-2 text-xs`}>
          {config.label}
        </Badge>

        <h4 className="mb-1 text-sm line-clamp-1">{exercise.title}</h4>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {exercise.description}
        </p>

        {/* Points Display */}
        <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
          <Zap className="w-3 h-3 text-yellow-500" />
          <span>{exercise.points} điểm</span>
        </div>

        <Button
          onClick={() => onStart(exercise)}
          disabled={exercise.isLocked}
          size="sm"
          className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 text-xs`}
        >
          {exercise.isCompleted ? "Luyện lại" : "Bắt đầu"}
        </Button>
      </div>
    </Card>
  );
}
