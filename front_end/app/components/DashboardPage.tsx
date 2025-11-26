"use client";
import { useState, useEffect } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar, StudyLevel, LessonType } from "./DashboardSidebar";
import { DashboardContent } from "./DashboardContent";
import { VideoPlayer } from "./VideoPlayer";
import { PracticeMode } from "./PracticeMode";
import { GameMode } from "./GameMode";
import { Lesson } from "./LessonCard";
import { useRouter } from 'next/navigation'; 
import axios from 'axios';
import { lessonsData } from '@/app/data/lessonsData';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface User {
    fullName: string;
    email: string;
    birthDate: string;
    avatarUrl?: string;
}

interface DashboardPageProps {
  onSignOut?: () => void;
}

const fetchUserProfile = async (token: string): Promise<User> => {
    try {
        const response = await axios.get(`${BACKEND_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`, 
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem('accessToken'); // Xóa token hết hạn
        }
        throw error;
    }
};

// Mock data for lessons
const mockLessons = {
  newbie: [
    // Phần 1: Chữ cái A-H
    {
      id: "n1",
      title: "Bài 1: Chữ cái A-H",
      description: "Học ký hiệu của 8 chữ cái đầu tiên trong bảng chữ cái",
      videoUrl: "https://example.com/video1",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "8:00",
      isCompleted: true,
      isLocked: false,
    },
    {
      id: "p1",
      title: "Ghép chữ cái A-H",
      description: "Luyện tập ghép các chữ cái vừa học với ký hiệu",
      videoUrl: "https://example.com/practice1",
      thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwcmFjdGljZSUyMHF1aXp8ZW58MXx8fHwxNzYwMTMzMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "3 phút",
      isCompleted: true,
      isLocked: false,
    },
    
    // Phần 2: Chữ cái I-P
    {
      id: "n2",
      title: "Bài 2: Chữ cái I-P",
      description: "Tiếp tục học ký hiệu cho chữ cái I đến P",
      videoUrl: "https://example.com/video2",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "8:00",
      isCompleted: false,
      isLocked: false,
    },
    {
      id: "p2",
      title: "Trắc nghiệm chữ cái I-P",
      description: "Kiểm tra kiến thức về chữ cái I-P",
      videoUrl: "https://example.com/practice2",
      thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwcmFjdGljZSUyMHF1aXp8ZW58MXx8fHwxNzYwMTMzMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "3 phút",
      isCompleted: false,
      isLocked: false,
    },
    
    // Phần 3: Chữ cái Q-Z
    {
      id: "n3",
      title: "Bài 3: Chữ cái Q-Z",
      description: "Hoàn thành bảng chữ cái với các ký hiệu cuối cùng",
      videoUrl: "https://example.com/video3",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "10:00",
      isCompleted: false,
      isLocked: true,
    },
    {
      id: "p3",
      title: "Điền chữ vào câu Q-Z",
      description: "Hoàn thành câu với chữ cái phù hợp",
      videoUrl: "https://example.com/practice3",
      thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwcmFjdGljZSUyMHF1aXp8ZW58MXx8fHwxNzYwMTMzMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "3 phút",
      isCompleted: false,
      isLocked: true,
    },
    
    // Phần 4: Số 0-9
    {
      id: "n4",
      title: "Bài 4: Số 0-9",
      description: "Học ký hiệu cho các số từ 0 đến 9",
      videoUrl: "https://example.com/video4",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "6:00",
      isCompleted: false,
      isLocked: true,
    },
    {
      id: "p4",
      title: "Luyện tập số 0-9",
      description: "Thực hành ký hiệu các con số",
      videoUrl: "https://example.com/practice4",
      thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwcmFjdGljZSUyMHF1aXp8ZW58MXx8fHwxNzYwMTMzMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "3 phút",
      isCompleted: false,
      isLocked: true,
    },
  ],
  basic: [
    {
      id: "b1",
      title: "Bài 1: Động vật - Animals",
      description: "Học từ vựng về các loài động vật thông qua ký hiệu",
      videoUrl: "https://example.com/video7",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "8:00",
      isCompleted: true,
      isLocked: false,
    },
    {
      id: "b2",
      title: "Bài 2: Màu sắc - Colors",
      description: "Ký hiệu cho các màu sắc cơ bản",
      videoUrl: "https://example.com/video8",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "6:30",
      isCompleted: true,
      isLocked: false,
    },
    {
      id: "b3",
      title: "Bài 3: Gia đình - Family",
      description: "Từ vựng về các thành viên trong gia đình",
      videoUrl: "https://example.com/video9",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "7:15",
      isCompleted: false,
      isLocked: false,
    },
    {
      id: "b4",
      title: "Bài 4: Thức ăn - Food",
      description: "Học từ vựng về đồ ăn và thức uống",
      videoUrl: "https://example.com/video10",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "7:45",
      isCompleted: false,
      isLocked: true,
    },
  ],
  advanced: [
    {
      id: "a1",
      title: "Bài 1: Chào hỏi cơ bản",
      description: "Các câu chào hỏi và giới thiệu bản thân",
      videoUrl: "https://example.com/video11",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "10:00",
      isCompleted: true,
      isLocked: false,
    },
    {
      id: "a2",
      title: "Bài 2: Hỏi đáp thông tin",
      description: "Cách hỏi và trả lời các câu hỏi về thông tin cá nhân",
      videoUrl: "https://example.com/video12",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "12:30",
      isCompleted: false,
      isLocked: false,
    },
    {
      id: "a3",
      title: "Bài 3: Giao tiếp hàng ngày",
      description: "Các câu giao tiếp trong sinh hoạt hàng ngày",
      videoUrl: "https://example.com/video13",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "11:15",
      isCompleted: false,
      isLocked: true,
    },
  ],
};

export function DashboardPage({ onSignOut }: DashboardPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Thêm state cho dữ liệu người dùng và trạng thái tải
  const [activeTab, setActiveTab] = useState<LessonType>("study");
  const [activeLevel, setActiveLevel] = useState<StudyLevel>("newbie");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentLessons = lessonsData[activeLevel] || [];

  const handleViewProfile = () => {
    router.push("/profile");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    if (onSignOut) {
      onSignOut();
    }
    router.push('/');
  };

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

  const handleCloseVideo = () => {
    setSelectedLesson(null);
  };

  const handleCompleteLesson = () => {
    alert("Bài học đã hoàn thành! Điểm số của bạn sẽ được cập nhật.");
    setSelectedLesson(null);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  }  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const profileData = await fetchUserProfile(token);
        setUser(profileData);
      } catch (err) {
        router.push('/login'); 
      } finally {
        setIsLoading(false); // Luôn thoát khỏi trạng thái tải
      }
    };

    loadProfile();
  }, [router]);
  
  if (isLoading || !user) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Đang tải dữ liệu người dùng...</p> 
        </div>
    );
  }

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
        />
        {activeTab === "study" ? (
          <DashboardContent
            level={activeLevel}
            lessonGroups={currentLessons}
            onPlayLesson={handlePlayLesson}
          />
        ) : activeTab === "practice" ? (
          <PracticeMode />
        ) : (
          <GameMode />
        )}
      </div>

      {selectedLesson && selectedLesson.videoUrl && (
        <VideoPlayer
          videoUrl={selectedLesson.videoUrl}
          title={selectedLesson.title}
          onClose={handleCloseVideo}
          onComplete={handleCompleteLesson}
        />
      )}
    </div>
  );
}
