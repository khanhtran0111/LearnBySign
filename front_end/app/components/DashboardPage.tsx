"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation'; 
import axios from 'axios';
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar, StudyLevel, LessonType } from "./DashboardSidebar";
import { DashboardContent } from "./DashboardContent";
import { PracticeMode } from "./PracticeMode";
import { GameMode } from "./GameMode";
import { Lesson } from "./LessonCard";
import { Button } from "./ui/button";
import { lessonsData } from '@/app/data/lessonsData';


const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
 defaultLevel?: StudyLevel;
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

// Function tính toán stats từ completed lessons
const calculateDashboardStats = (completedLessons: Set<string>): DashboardStats => {
  const newbieLessons = lessonsData.newbie.flatMap(g => g.lessons.filter(l => l.type === 'lesson'));
  const basicLessons = lessonsData.basic.flatMap(g => g.lessons.filter(l => l.type === 'lesson'));
  const advancedLessons = lessonsData.advanced.flatMap(g => g.lessons.filter(l => l.type === 'lesson'));

  const newbieCompleted = newbieLessons.filter(l => completedLessons.has(l.id)).length;
  const basicCompleted = basicLessons.filter(l => completedLessons.has(l.id)).length;
  const advancedCompleted = advancedLessons.filter(l => completedLessons.has(l.id)).length;

  const newbieTotal = newbieLessons.length;
  const basicTotal = basicLessons.length;
  const advancedTotal = advancedLessons.length;

  const totalCompleted = newbieCompleted + basicCompleted + advancedCompleted;
  const totalLessons = newbieTotal + basicTotal + advancedTotal;
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return {
    streak: 0,
    totalScore: totalCompleted * 10,
    totalCompleted,
    overallProgress,
    levels: {
      newbie: {
        completed: newbieCompleted,
        total: newbieTotal,
        percent: newbieTotal > 0 ? Math.round((newbieCompleted / newbieTotal) * 100) : 0,
      },
      basic: {
        completed: basicCompleted,
        total: basicTotal,
        percent: basicTotal > 0 ? Math.round((basicCompleted / basicTotal) * 100) : 0,
      },
      advanced: {
        completed: advancedCompleted,
        total: advancedTotal,
        percent: advancedTotal > 0 ? Math.round((advancedCompleted / advancedTotal) * 100) : 0,
      },
    },
  };
};


export function DashboardPage({ onSignOut, defaultLevel }: DashboardPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [lessonsFromAPI, setLessonsFromAPI] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LessonType>("study");
  const [activeLevel, setActiveLevel] = useState<StudyLevel>(defaultLevel || "newbie");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const currentLessons = lessonsData[activeLevel] || [];

  const lessonSlugById: Record<string, string> = {
    n1: 'n1-chu-cai-a-h',
    n2: 'n2-chu-cai-i-p',
    n3: 'n3-chu-cai-q-z',
    n4: 'n4-so-0-9',
    b1: 'b1-nguoi-than-gia-dinh',
    b2: 'b2-am-thuc',
    b3: 'b3-cac-quoc-gia',
    b4: 'b4-dong-vat',
    b5: 'b5-phuong-tien',
    b6: 'b6-hanh-dong',
    b7: 'b7-cac-tu-khac',
    a1: 'a1-cau-noi-co-ban-nang-cao',
  };

  const practiceSlugById: Record<string, string> = {
    p1: 'p1-ghep-chu-cai-a-h',
    p2: 'p2-trac-nghiem-chu-cai-i-p',
    p3: 'p3-dien-chu-vao-cau-q-z',
    p4: 'p4-luyen-tap-so-0-9',
    p5: 'p5-gia-dinh-am-thuc',
    p6: 'p6-quoc-gia-dong-vat',
    p7: 'p7-phuong-tien-hanh-dong',
    p8: 'p8-giao-tiep-nang-cao',
    p9: 'p9-cac-tu-khac',
  };

  const handlePlayLesson = (lesson: Lesson) => {
    if (lesson.isLocked) {
      const message = activeLevel === 'basic' 
        ? '🔒 Bài học này chưa mở khóa!\n\nĐể học Basic, bạn cần hoàn thành TẤT CẢ các bài Newbie (n1-n4) trước.'
        : activeLevel === 'advanced'
        ? '🔒 Bài học này chưa mở khóa!\n\nĐể học Advanced, bạn cần hoàn thành TẤT CẢ các bài Basic (b1-b7) trước.'
        : '🔒 Bài học này chưa mở khóa!\n\nVui lòng hoàn thành bài học trước đó.';
      
      alert(message);
      return;
    }
    
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
    if (onSignOut) {
      onSignOut();
    }
    router.push('/');
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLevelChange = (level: StudyLevel) => {
    setActiveLevel(level);
    router.push(`/dashboard/${level}`);
  };
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      router.replace('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const profileResponse = await axios.get(`${BACKEND_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = profileResponse.data;
        setUser(profileData);
        
        const userIdFromProfile = profileResponse.data._id || profileResponse.data.id;
        setUserId(userIdFromProfile);

        const progressResponse = await axios.get(`${BACKEND_URL}/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (progressResponse.data) {
          const completed = new Set<string>(
            progressResponse.data
              .filter((p: any) => p.completed)
              .map((p: any) => String(p.idLesson?.customId || p.idLesson?._id || p.idLesson))
          );
          setCompletedLessons(completed);

          const stats = calculateDashboardStats(completed);
          setDashboardStats(stats);
        }

        // Gọi API mới để lấy lessons kèm trạng thái locked
        console.log('[DashboardPage] Loading lessons with lock status...');
        const lessonsResponse = await axios.get(`${BACKEND_URL}/lessons/with-progress/${userIdFromProfile}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLessonsFromAPI(lessonsResponse.data || []);
        console.log('[DashboardPage] Lessons with lock status loaded:', lessonsResponse.data?.length);
        
        console.log('[DashboardPage] All data loaded successfully');
        setIsLoading(false);
      } catch (err) {
        console.error('[DashboardPage] Error loading dashboard data:', err);
        if (axios.isAxiosError(err)) {

          if (err.response?.status === 401) {
            localStorage.removeItem('accessToken');
            setIsLoading(false);
            router.replace('/login');
            return;
          }
          
          if (err.code === 'ERR_NETWORK' || !err.response) {
            setLoadError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend đang chạy.');
          } else {
            setLoadError(`Lỗi tải dữ liệu: ${err.response?.status || 'Unknown error'}`);
          }
        } else {
          setLoadError('Có lỗi xảy ra khi tải dữ liệu.');
        }
        
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router, searchParams]); // Thêm searchParams để reload khi có query param thay đổi
  
  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Đang tải dữ liệu người dùng...</p> 
        </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Lỗi kết nối</h2>
          <p className="text-red-600 mb-4">{loadError}</p>
          <div className="space-y-2">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Thử lại
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Không tìm thấy thông tin người dùng...</p> 
        </div>
    );
  }

  const updatedLessons = currentLessons.map(group => ({
    ...group,
    lessons: group.lessons.map((lesson) => {
      // Tìm lesson tương ứng từ API response
      const apiLesson = lessonsFromAPI.find(l => l.customId === lesson.id);
      
      // Nếu có từ API, dùng isLocked và isCompleted từ API
      // Nếu không, giữ nguyên logic cũ
      const isCompleted = apiLesson ? apiLesson.isCompleted : completedLessons.has(lesson.id);
      const isLocked = apiLesson ? apiLesson.isLocked : lesson.isLocked;

      return {
        ...lesson,
        isCompleted,
        isLocked,
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
          onLevelChange={handleLevelChange}
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
          levelStats={dashboardStats?.levels}
        />
        {activeTab === "study" ? (
          <DashboardContent
            level={activeLevel}
            lessonGroups={updatedLessons}
            onPlayLesson={handlePlayLesson}
            stats={dashboardStats ?? undefined}
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
