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

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface User {
    fullName: string;
    email: string;
    birthDate: string;
}

interface DashboardPageProps {
  onSignOut: () => void;
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
    {
      id: "n1",
      title: "Bài 1: Chữ cái A-E",
      description: "Học ký hiệu của 5 chữ cái đầu tiên trong bảng chữ cái",
      videoUrl: "https://example.com/video1",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "5:30",
      isCompleted: true,
      isLocked: false,
    },
    {
      id: "n2",
      title: "Bài 2: Chữ cái F-J",
      description: "Tiếp tục học ký hiệu 5 chữ cái tiếp theo",
      videoUrl: "https://example.com/video2",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "6:00",
      isCompleted: true,
      isLocked: false,
    },
    {
      id: "n3",
      title: "Bài 3: Chữ cái K-O",
      description: "Học ký hiệu cho nhóm chữ cái K đến O",
      videoUrl: "https://example.com/video3",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "5:45",
      isCompleted: false,
      isLocked: false,
    },
    {
      id: "n4",
      title: "Bài 4: Chữ cái P-T",
      description: "Ký hiệu cho các chữ cái P, Q, R, S, T",
      videoUrl: "https://example.com/video4",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "6:15",
      isCompleted: false,
      isLocked: true,
    },
    {
      id: "n5",
      title: "Bài 5: Chữ cái U-Z",
      description: "Hoàn thành bảng chữ cái với các ký hiệu cuối cùng",
      videoUrl: "https://example.com/video5",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "5:50",
      isCompleted: false,
      isLocked: true,
    },
    {
      id: "n6",
      title: "Bài 6: Số 0-5",
      description: "Học ký hiệu cho các số từ 0 đến 5",
      videoUrl: "https://example.com/video6",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: "4:30",
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

  const currentLessons = mockLessons[activeLevel] || [];

  const handleViewProfile = () => {
    alert("Tính năng xem hồ sơ sẽ được phát triển");
  };

  const handleSettings = () => {
    alert("Tính năng cài đặt sẽ được phát triển");
  };

  const handlePlayLesson = (lesson: Lesson) => {
    if (!lesson.isLocked) {
      setSelectedLesson(lesson);
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
        userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwYXZhdGFyJTIwcHJvZmlsZXxlbnwxfHx8fDE3NjAxMzM0MTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        onViewProfile={handleViewProfile}
        onSettings={handleSettings}
        onSignOut={onSignOut}
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
            lessons={currentLessons}
            onPlayLesson={handlePlayLesson}
          />
        ) : activeTab === "practice" ? (
          <PracticeMode />
        ) : (
          <GameMode />
        )}
      </div>

      {selectedLesson && (
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
