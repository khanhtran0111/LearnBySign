import { BookOpen, Gamepad2, Star, Award, CircleDot, X, Trophy, Target, Lock } from "lucide-react";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { LevelStats } from "./DashboardPage";
import { useRouter } from "next/navigation";


export type StudyLevel = "newbie" | "basic" | "advanced";
export type LessonType = "study" | "practice" | "game";


interface DashboardSidebarProps {
 activeTab: LessonType;
 activeLevel?: StudyLevel;
 onTabChange: (tab: LessonType) => void;
 onLevelChange: (level: StudyLevel) => void;
 isOpen: boolean;
 onClose: () => void;
 levelStats?: {
   newbie: LevelStats;
   basic: LevelStats;
   advanced: LevelStats;
 };
}


export function DashboardSidebar({
 activeTab,
 activeLevel,
 onTabChange,
 onLevelChange,
 isOpen,
 onClose,
 levelStats,
}: DashboardSidebarProps) {
  const router = useRouter();
  
  const studyLevelsConfig = [
   {
     id: "newbie" as StudyLevel,
     name: "Newbie",
     description: "Học chữ, số và ký hiệu cơ bản",
     icon: CircleDot,
     color: "text-green-600",
     bgColor: "bg-green-100",
   },
   {
     id: "basic" as StudyLevel,
     name: "Basic",
     description: "Học từ vựng cơ bản",
     icon: Star,
     color: "text-blue-600",
     bgColor: "bg-blue-100",
   },
   {
     id: "advanced" as StudyLevel,
     name: "Advanced",
     description: "Học câu và giao tiếp",
     icon: Award,
     color: "text-purple-600",
     bgColor: "bg-purple-100",
   },
 ];


 return (
   <>
     {isOpen && (
       <div
         className="fixed inset-0 bg-black/50 z-40 lg:hidden"
         onClick={onClose}
       />
     )}
    
     <aside
       className={cn(
         "fixed lg:static inset-y-0 left-0 z-50 w-80 border-r border-border bg-white flex flex-col transition-transform duration-300",
         !isOpen && "-translate-x-full lg:translate-x-0"
       )}
     >
       <div className="p-6 border-b border-border flex items-center justify-between">
           <h3>Danh mục học tập</h3>
           <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
           <X className="w-5 h-5" />
           </Button>
       </div>
    
       <div className="px-6 pt-6 border-b border-border pb-6">
           <div className="grid grid-cols-3 gap-2 mb-4">
               <button
                   onClick={() => onTabChange("study")}
                   className={cn(
                   "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                   activeTab === "study"
                       ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                       : "bg-gray-100 hover:bg-gray-200"
                   )}
               >
                   <BookOpen className="w-5 h-5" />
                   <span className="text-xs">Học tập</span>
               </button>
               <button
                   onClick={() => router.push('/dashboard/practice-test')}
                   className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors bg-gray-100 hover:bg-gray-200"
               >
                   <Target className="w-5 h-5" />
                   <span className="text-xs">Luyện tập</span>
               </button>
               <button
                   onClick={() => router.push('/dashboard/game')}
                   className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors bg-gray-100 hover:bg-gray-200"
               >
                   <Trophy className="w-5 h-5" />
                   <span className="text-xs">Game</span>
               </button>
           </div>
       </div>
    
       <ScrollArea className="flex-1">
           <div className="p-6 space-y-4">
           {activeTab === "study" ? (
               <>
               <h4 className="text-sm text-muted-foreground mb-4">Chọn cấp độ</h4>
               {studyLevelsConfig.map((levelConfig) => {
                   const Icon = levelConfig.icon;
                  
                   // Lấy dữ liệu từ props levelStats
                   const stats = levelStats ? levelStats[levelConfig.id] : { completed: 0, total: 0, percent: 0 };
                  
                   // Logic unlock cho level
                   let isLevelLocked = false;
                   let lockMessage = '';
                   
                   if (levelConfig.id === 'basic' && levelStats) {
                     // Basic cần hoàn thành TẤT CẢ Newbie
                     const newbieStats = levelStats.newbie;
                     isLevelLocked = newbieStats.completed < newbieStats.total;
                     lockMessage = `Hoàn thành ${newbieStats.total - newbieStats.completed} bài Newbie còn lại để mở khóa`;
                   } else if (levelConfig.id === 'advanced' && levelStats) {
                     // Advanced cần hoàn thành TẤT CẢ Basic
                     const basicStats = levelStats.basic;
                     isLevelLocked = basicStats.completed < basicStats.total;
                     lockMessage = `Hoàn thành ${basicStats.total - basicStats.completed} bài Basic còn lại để mở khóa`;
                   }
                  
                   return (
                   <button
                       key={levelConfig.id}
                       onClick={() => {
                         if (isLevelLocked) {
                           alert(`🔒 Level ${levelConfig.name} chưa mở khóa!\n\n${lockMessage}`);
                         } else {
                           onLevelChange(levelConfig.id);
                         }
                       }}
                       className={cn(
                       "w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md",
                       activeLevel === levelConfig.id
                           ? "border-blue-500 bg-blue-50"
                           : isLevelLocked
                           ? "border-gray-200 opacity-60 cursor-not-allowed"
                           : "border-gray-200 hover:border-gray-300"
                       )}
                       disabled={isLevelLocked}
                   >
                       <div className="flex items-start gap-3">
                       <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", levelConfig.bgColor)}>
                           {isLevelLocked ? (
                             <Lock className="w-5 h-5 text-gray-500" />
                           ) : (
                             <Icon className={cn("w-5 h-5", levelConfig.color)} />
                           )}
                       </div>
                       <div className="flex-1">
                           <div className="flex items-center justify-between mb-1">
                           <h4>{levelConfig.name}</h4>
                           {isLevelLocked ? (
                             <Badge variant="secondary" className="text-xs bg-gray-300">
                               🔒 Locked
                             </Badge>
                           ) : (
                             <Badge variant="secondary" className="text-xs">
                               {stats.completed}/{stats.total}
                             </Badge>
                           )}
                           </div>
                           <p className="text-sm text-muted-foreground mb-2">
                           {levelConfig.description}
                           </p>
                           <div className="w-full bg-gray-200 rounded-full h-2">
                           <div
                               className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                               style={{ width: `${stats.percent}%` }}
                           />
                           </div>
                       </div>
                       </div>
                   </button>
                   );
               })}
               </>
           ) : activeTab === "practice" ? (
               <div className="text-center py-12">
               <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-blue-500" />
               <h4 className="mb-2">Chế độ luyện tập</h4>
               <p className="text-sm text-muted-foreground mb-4">
                   Luyện tập ký hiệu với AI và Camera
               </p>
               <div className="space-y-2">
                   <Badge variant="secondary" className="mr-2">AI Check</Badge>
                   <Badge variant="secondary">Camera</Badge>
               </div>
               </div>
           ) : (
               <div className="text-center py-12">
               <Trophy className="w-12 h-12 mx-auto mb-4 text-orange-500" />
               <h4 className="mb-2">Chế độ Game</h4>
               <p className="text-sm text-muted-foreground">
                   Game luyện tập thú vị
               </p>
               </div>
           )}
           </div>
       </ScrollArea>
     </aside>
   </>
 );
}
