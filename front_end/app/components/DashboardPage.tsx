"use client";
import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar, StudyLevel, LessonType } from "./DashboardSidebar";
import { DashboardContent } from "./DashboardContent";
import { PracticeMode } from "./PracticeMode";
import { GameMode } from "./GameMode";
import { Lesson } from "./LessonCard";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { lessonsData } from '@/app/data/lessonsData';
import { Button } from "./ui/button";


const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";


//Interfaces
interface User {
   fullName: string;
   email: string;
   birthDate: string;
   avatarUrl?: string;
}


export interface LevelStats {
 completed: number;
 total: number;
 percent: number;
}


export interface DashboardStats {
 streak: number;
 totalScore: number;
 totalCompleted: number;
 overallProgress: number;
 levels: {
   newbie: LevelStats;
   basic: LevelStats;
   advanced: LevelStats;
 };
}


interface DashboardPageProps {
 onSignOut?: () => void;
}


const fetchUserProfile = async (token: string): Promise<User> => {
   try {
       const response = await axios.get(`${BACKEND_URL}/users/me`, {
           headers: { Authorization: `Bearer ${token}` },
       });
       return response.data;
   } catch (error) {
       if (axios.isAxiosError(error) && error.response?.status === 401) {
           localStorage.removeItem('accessToken');
       }
       throw error;
   }
};


export function DashboardPage({ onSignOut }: DashboardPageProps) {
 const router = useRouter();
 const [user, setUser] = useState<User | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
 const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
 const [loadError, setLoadError] = useState<string | null>(null);
 const [activeTab, setActiveTab] = useState<LessonType>("study");
 const [activeLevel, setActiveLevel] = useState<StudyLevel>("newbie");
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentLessons = lessonsData[activeLevel] || [];


 // Mapping slug
 const lessonSlugById: Record<string, string> = {
   n1: 'n1-chu-cai-a-h', n2: 'n2-chu-cai-i-p', n3: 'n3-chu-cai-q-z', n4: 'n4-so-0-9',
   b1: 'b1-dong-vat-animals', b2: 'b2-mau-sac-colors', b3: 'b3-gia-dinh-family', b4: 'b4-thuc-an-food',
   a1: 'a1-chao-hoi-co-ban', a2: 'a2-hoi-dap-thong-tin', a3: 'a3-giao-tiep-hang-ngay',
 };


 const practiceSlugById: Record<string, string> = {
   p1: 'p1-ghep-chu-cai-a-h', p2: 'p2-trac-nghiem-chu-cai-i-p',
   p3: 'p3-dien-chu-vao-cau-q-z', p4: 'p4-luyen-tap-so-0-9',
 };


 //  Hàm Load Data (Stats + List đã học)
 const loadDashboardData = useCallback(async () => {
   const token = localStorage.getItem('accessToken');
   if (!token) return;


   try {
     const [statsRes, progressRes] = await Promise.all([
       axios.get(`${BACKEND_URL}/progress/dashboard-stats`, {
           headers: { Authorization: `Bearer ${token}` },
       }),
       axios.get(`${BACKEND_URL}/progress`, {
           headers: { Authorization: `Bearer ${token}` },
       })
     ]);


     // Cập nhật Stats
     if (statsRes.data) {
       setDashboardStats(statsRes.data);
     }


     // Cập nhật (Completed List)
     if (progressRes.data) {
       const completed = new Set<string>(
         progressRes.data
           .filter((p: any) => p.completed) // Lọc bài đã completed
           .map((p: any) => {
               return String(p.idLesson?.customId || p.idLesson?._id || p.idLesson || p.lessonId);
           })
       );
       setCompletedLessons(completed);
     }


   } catch (err) {
     console.error("[DashboardPage] Refresh data error:", err);
   }
 }, []);


 // --- Xử lý chuyển trang ---
 const handlePlayLesson = (lesson: Lesson) => {
   if (lesson.isLocked) return;
  
   // Luôn chuyển trang chi tiết, không mở Modal
   if (lesson.type === 'practice') {
     const slug = practiceSlugById[lesson.id] ?? lesson.id;
     router.push(`/dashboard/practice/${slug}`);
   } else {
     const slug = lessonSlugById[lesson.id] ?? lesson.id;
     router.push(`/dashboard/lesson/${slug}`);
   }
 };


 const handleViewProfile = () => router.push("/profile");
 const handleSettings = () => router.push("/settings");
  const handleSignOut = () => {
   localStorage.removeItem('accessToken');
   if (onSignOut) onSignOut();
   router.push('/');
 };


 const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
 const handleCloseSidebar = () => setIsSidebarOpen(false);


 // --- useEffect khởi tạo ---
 useEffect(() => {
   const token = localStorage.getItem('accessToken');
  
   if (!token) {
     router.replace('/login');
     return;
   }


   const initData = async () => {
     try {
       setIsLoading(true);
       // Load user info
       const profileData = await fetchUserProfile(token);
       setUser(profileData);
      
       // Load stats & progress
       await loadDashboardData();
      
       setIsLoading(false);
     } catch (err) {
       if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
           localStorage.removeItem('accessToken');
           router.replace('/login');
           return;
         }
       }
       setLoadError('Không thể tải dữ liệu từ máy chủ.');
       setIsLoading(false);
     }
   };


   initData();
 }, [router, loadDashboardData]);
  if (isLoading) return (
   <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
   </div>
 );


 if (loadError) {
   return (
     <div className="min-h-screen flex flex-col items-center justify-center p-4">
       <p className="text-red-600 mb-4">{loadError}</p>
       <Button onClick={() => window.location.reload()}>Thử lại</Button>
     </div>
   );
 }


 if (!user) return null;


 //  Mở khóa tuần tự
 let isNextLessonUnlocked = true;


 const updatedLessons = currentLessons.map(group => ({
   ...group,
   lessons: group.lessons.map(lesson => {
     const isCompleted = completedLessons.has(lesson.id);
    
     const isLocked = !isNextLessonUnlocked;
     isNextLessonUnlocked = isCompleted;


     return {
       ...lesson,
       isCompleted,
       isLocked
     };
   })
 }));


 return (
   <div className="min-h-screen flex flex-col">
     <DashboardHeader
       userName={user.fullName}
       userEmail={user.email}
       userAvatar={user.avatarUrl}
       onViewProfile={handleViewProfile}
       onSettings={handleSettings}
       onSignOut={handleSignOut}
       onMenuClick={handleToggleSidebar}
     />
     <div className="flex flex-1 overflow-hidden">
       <DashboardSidebar
         activeTab={activeTab}
         activeLevel={activeLevel}
         onTabChange={setActiveTab}
         onLevelChange={setActiveLevel}
         isOpen={isSidebarOpen}
         onClose={handleCloseSidebar}
         // Truyền stats vào sidebar
         levelStats={dashboardStats?.levels}
       />
       {activeTab === "study" ? (
         <DashboardContent
           level={activeLevel}
           lessonGroups={updatedLessons} // Dùng list đã tính toán khóa
           onPlayLesson={handlePlayLesson}
           // Truyền stats vào content
           stats={dashboardStats || undefined}
         />
       ) : activeTab === "practice" ? (
         <PracticeMode />
       ) : (
         <GameMode />
       )}
     </div>
   </div>
 );
}
