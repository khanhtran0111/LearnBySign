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

// Function tính toán stats từ completed lessons
const calculateDashboardStats = (completedLessons: Set<string>): DashboardStats => {
  // Đếm số lesson đã hoàn thành theo từng level (chỉ lesson, không tính practice)
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
    streak: 0, // TODO: Tính streak từ API nếu có
    totalScore: totalCompleted * 10, // Mỗi bài = 10 điểm
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


export function DashboardPage({ onSignOut }: DashboardPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LessonType>("study");
  const [activeLevel, setActiveLevel] = useState<StudyLevel>("newbie");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const currentLessons = lessonsData[activeLevel] || [];

  // Mapping slug cố định cho lessons
  const lessonSlugById: Record<string, string> = {
    n1: 'n1-chu-cai-a-h',
    n2: 'n2-chu-cai-i-p',
    n3: 'n3-chu-cai-q-z',
    n4: 'n4-so-0-9',
    b1: 'b1-dong-vat-animals',
    b2: 'b2-mau-sac-colors',
    b3: 'b3-gia-dinh-family',
    b4: 'b4-thuc-an-food',
    a1: 'a1-chao-hoi-co-ban',
    a2: 'a2-hoi-dap-thong-tin',
    a3: 'a3-giao-tiep-hang-ngay',
  };

  // Mapping slug cố định cho practices
  const practiceSlugById: Record<string, string> = {
    p1: 'p1-ghep-chu-cai-a-h',
    p2: 'p2-trac-nghiem-chu-cai-i-p',
    p3: 'p3-dien-chu-vao-cau-q-z',
    p4: 'p4-luyen-tap-so-0-9',
  };

  const handlePlayLesson = (lesson: Lesson) => {
    if (lesson.isLocked) return;
    
    // Xác định slug dựa trên type
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
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('[DashboardPage] Checking auth, token:', token ? 'exists' : 'none');
    
    if (!token) {
      console.log('[DashboardPage] No token, redirecting to login');
      router.replace('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        console.log('[DashboardPage] Loading user profile...');
        const profileData = await fetchUserProfile(token);
        setUser(profileData);
        console.log('[DashboardPage] User profile loaded:', profileData.email);

        console.log('[DashboardPage] Loading progress...');
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
          console.log('[DashboardPage] Progress loaded, completed lessons:', completed.size);

          // Tính toán stats từ progress data
          const stats = calculateDashboardStats(completed);
          setDashboardStats(stats);
          console.log('[DashboardPage] Stats calculated:', stats);
        }
        
        console.log('[DashboardPage] All data loaded successfully');
        setIsLoading(false);
      } catch (err) {
        console.error('[DashboardPage] Error loading dashboard data:', err);
        if (axios.isAxiosError(err)) {
          console.error('[DashboardPage] API Error:', err.response?.status, err.response?.data);
          
          // Nếu là lỗi 401 (unauthorized), redirect về login
          if (err.response?.status === 401) {
            localStorage.removeItem('accessToken');
            setIsLoading(false);
            console.log('[DashboardPage] Unauthorized, redirecting to login');
            router.replace('/login');
            return;
          }
          
          // Nếu là lỗi khác (network, 500, etc), hiển thị thông báo lỗi
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

  // Hiển thị lỗi nếu không thể tải dữ liệu
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
    lessons: group.lessons.map((lesson, index, array) => {
      const isCompleted = completedLessons.has(lesson.id);
      
      // Logic unlock: Bài đầu tiên luôn unlock
      // Các bài tiếp theo chỉ unlock nếu bài trước đã hoàn thành
      let isLocked = lesson.isLocked;
      if (index === 0) {
        isLocked = false; // Bài đầu luôn unlock
      } else {
        const previousLesson = array[index - 1];
        // Unlock nếu bài trước đã hoàn thành
        isLocked = !completedLessons.has(previousLesson.id);
      }

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
          onLevelChange={setActiveLevel}
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
