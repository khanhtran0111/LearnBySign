import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Play, CheckCircle2, Lock, Target } from "lucide-react";
import { ImageWithFallback } from "./fallback/ImageWithFallback";


export interface Lesson {
 id: string;
 title: string;
 description: string;
 videoUrl?: string;
 thumbnailUrl: string;
 duration: string;
 isCompleted: boolean;
 isLocked: boolean;
 type?: 'lesson' | 'practice';
}


interface LessonCardProps {
 lesson: Lesson;
 onPlay: (lesson: Lesson) => void;
}


export function LessonCard({ lesson, onPlay }: LessonCardProps) {
 const isPractice = lesson.type === 'practice';
 const badgeColor = isPractice ? 'bg-pink-500' : 'bg-blue-500';
 const badgeText = isPractice ? '' : '';
  return (
   <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
     <div className="relative aspect-video bg-gray-100">
       <ImageWithFallback
         src={lesson.thumbnailUrl}
         alt={lesson.title}
         className="w-full h-full object-cover"
       />
       {lesson.isLocked && (
         <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
           <div className="text-center text-white">
             <Lock className="w-5 h-5 mx-auto mb-1" />
             <p className="text-xs">Hoàn thành bài trước</p>
           </div>
         </div>
       )}
       {lesson.isCompleted && !lesson.isLocked && (
         <div className="absolute top-1.5 right-1.5">
           <Badge className="bg-green-500 text-white text-xs py-0.5 px-1.5">
             <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
             Hoàn thành
           </Badge>
         </div>
       )}
       {!lesson.isLocked && !lesson.isCompleted && isPractice && (
         <div className="absolute top-1.5 left-1.5">
           <Badge className={badgeColor + " text-white text-xs py-0.5 px-1.5"}>
             {badgeText}
           </Badge>
         </div>
       )}
       {!lesson.isLocked && !lesson.isCompleted && (
         <button
           onClick={() => onPlay(lesson)}
           className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group"
         >
           <div className={`w-10 h-10 rounded-full ${isPractice ? 'bg-pink-500/90' : 'bg-white/90'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
             {isPractice ? (
               <Target className="w-a5 h-5 text-white ml-0" />
             ) : (
               <Play className="w-5 h-5 text-blue-600 ml-0.5" />
             )}
           </div>
         </button>
       )}
       <Badge variant="secondary" className="absolute bottom-1.5 right-1.5 text-xs py-0.5 px-1.5">
         {lesson.duration}
       </Badge>
       {isPractice && !lesson.isLocked && (
         <Badge className="absolute bottom-1.5 left-1.5 bg-green-600 text-white text-xs py-0.5 px-1.5">
           {lesson.isCompleted ? '' : '⚡ Dễ'}
         </Badge>
       )}
     </div>
     <div className="p-2.5">
       <h4 className="mb-0.5 text-sm font-semibold line-clamp-1">{lesson.title}</h4>
       <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
         {lesson.description}
       </p>
       <Button
         onClick={() => onPlay(lesson)}
         disabled={lesson.isLocked}
         size="sm"
         className={`w-full text-xs h-7 ${
           isPractice
             ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700'
             : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
         }`}
       >
         {lesson.isCompleted ? "Xem lại" : isPractice ? "Luyện tập" : "Bắt đầu"}
       </Button>
     </div>
   </Card>
 );
}
