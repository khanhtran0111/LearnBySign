"use client";
import { useState, useEffect } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar, StudyLevel, LessonType } from "./DashboardSidebar";
import { MixedLearningContent } from "./MixedLearningContent";
import { VideoPlayer } from "./VideoPlayer";
import { PracticeMode } from "./PracticeMode";
import { GameMode } from "./GameMode";
import { Lesson } from "./LessonCard";
import { PracticeExercise } from "./PracticeExerciseCard";
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


interface DashboardPageWithExercisesProps {
  onSignOut: () => void;
}

// Type cho learning items (lesson hoặc practice)
type LearningItem = 
  | ({ type: 'lesson' } & Lesson)
  | ({ type: 'practice' } & PracticeExercise);

// Mock data - XEN KẼ bài học và bài luyện tập
// dữ liệu này sẽ được fetch từ backend, hiện tại chỉ demo giao diện
const mockMixedContent: Record<StudyLevel, LearningItem[]> = {
  newbie: [
    // Lesson 1
    {
      type: 'lesson',
      id: "n1",
      title: "Bài 1: Chữ cái A-E",
      description: "Học ký hiệu của 5 chữ cái đầu tiên trong bảng chữ cái",
      videoUrl: "https://example.com/video1",
      thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400",
      duration: "5:30",
      isCompleted: true,
      isLocked: false,
    },
    // Practice 1 - Ghép cặp
    {
      type: 'practice',
      id: "p1",
      title: "Ghép chữ cái A-E",
      description: "Luyện tập ghép các chữ cái vừa học với ký hiệu",
      exerciseType: "matching",
      difficulty: "easy",
      estimatedTime: "3 phút",
      isCompleted: true,
      isLocked: false,
      points: 50,
    },
    // Lesson 2
    {
      type: 'lesson',
      id: "n2",
      title: "Bài 2: Chữ cái F-J",
      description: "Tiếp tục học ký hiệu 5 chữ cái tiếp theo",
      videoUrl: "https://example.com/video2",
      thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
      duration: "6:00",
      isCompleted: true,
      isLocked: false,
    },
    // Practice 2 - Quiz
    {
      type: 'practice',
      id: "p2",
      title: "Trắc nghiệm chữ cái",
      description: "Kiểm tra kiến thức về chữ cái A-J",
      exerciseType: "quiz",
      difficulty: "easy",
      estimatedTime: "2 phút",
      isCompleted: false,
      isLocked: false,
      points: 40,
    },
    // Lesson 3
    {
      type: 'lesson',
      id: "n3",
      title: "Bài 3: Số 1-5",
      description: "Học ký hiệu cho các số từ 1 đến 5",
      videoUrl: "https://example.com/video3",
      thumbnailUrl: "https://images.unsplash.com/photo-1632571337945-d7a2f97f5e6b?w=400",
      duration: "4:30",
      isCompleted: false,
      isLocked: false,
    },
    // Practice 3 - Fill Blank
    {
      type: 'practice',
      id: "p3",
      title: "Điền số vào câu",
      description: "Hoàn thành câu với số phù hợp",
      exerciseType: "fill-blank",
      difficulty: "easy",
      estimatedTime: "4 phút",
      isCompleted: false,
      isLocked: false,
      points: 60,
    },
    // Lesson 4 - Locked
    {
      type: 'lesson',
      id: "n4",
      title: "Bài 4: Số 6-10",
      description: "Ký hiệu cho các số từ 6 đến 10",
      videoUrl: "https://example.com/video4",
      thumbnailUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400",
      duration: "4:45",
      isCompleted: false,
      isLocked: true,
    },
  ],
  basic: [
    {
      type: 'lesson',
      id: "b1",
      title: "Bài 1: Động vật - Animals",
      description: "Học từ vựng về các loài động vật",
      videoUrl: "https://example.com/video5",
      thumbnailUrl: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400",
      duration: "8:00",
      isCompleted: true,
      isLocked: false,
    },
    {
      type: 'practice',
      id: "p4",
      title: "Ghép tên động vật",
      description: "Ghép ký hiệu với tên động vật",
      exerciseType: "matching",
      difficulty: "medium",
      estimatedTime: "4 phút",
      isCompleted: true,
      isLocked: false,
      points: 70,
    },
    {
      type: 'lesson',
      id: "b2",
      title: "Bài 2: Màu sắc - Colors",
      description: "Ký hiệu cho các màu sắc cơ bản",
      videoUrl: "https://example.com/video6",
      thumbnailUrl: "https://images.unsplash.com/photo-1541411438265-4cb4687110f2?w=400",
      duration: "6:30",
      isCompleted: true,
      isLocked: false,
    },
    {
      type: 'practice',
      id: "p5",
      title: "Trắc nghiệm màu sắc",
      description: "Nhận diện các màu sắc cơ bản",
      exerciseType: "quiz",
      difficulty: "medium",
      estimatedTime: "3 phút",
      isCompleted: false,
      isLocked: false,
      points: 60,
    },
    {
      type: 'lesson',
      id: "b3",
      title: "Bài 3: Gia đình - Family",
      description: "Từ vựng về các thành viên trong gia đình",
      videoUrl: "https://example.com/video7",
      thumbnailUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400",
      duration: "7:15",
      isCompleted: false,
      isLocked: false,
    },
    {
      type: 'practice',
      id: "p6",
      title: "Điền từ về gia đình",
      description: "Hoàn thành câu với từ vựng về gia đình",
      exerciseType: "fill-blank",
      difficulty: "medium",
      estimatedTime: "5 phút",
      isCompleted: false,
      isLocked: false,
      points: 80,
    },
  ],
  advanced: [
    {
      type: 'lesson',
      id: "a1",
      title: "Bài 1: Chào hỏi cơ bản",
      description: "Các câu chào hỏi và giới thiệu bản thân",
      videoUrl: "https://example.com/video8",
      thumbnailUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400",
      duration: "10:00",
      isCompleted: true,
      isLocked: false,
    },
    {
      type: 'practice',
      id: "p7",
      title: "Ghép câu chào hỏi",
      description: "Ghép mẫu câu với ý nghĩa",
      exerciseType: "matching",
      difficulty: "hard",
      estimatedTime: "6 phút",
      isCompleted: true,
      isLocked: false,
      points: 100,
    },
    {
      type: 'lesson',
      id: "a2",
      title: "Bài 2: Hỏi đáp thông tin",
      description: "Cách hỏi và trả lời về thông tin cá nhân",
      videoUrl: "https://example.com/video9",
      thumbnailUrl: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=400",
      duration: "12:30",
      isCompleted: false,
      isLocked: false,
    },
    {
      type: 'practice',
      id: "p8",
      title: "Trắc nghiệm giao tiếp",
      description: "Kiểm tra khả năng giao tiếp cơ bản",
      exerciseType: "quiz",
      difficulty: "hard",
      estimatedTime: "5 phút",
      isCompleted: false,
      isLocked: false,
      points: 90,
    },
    {
      type: 'lesson',
      id: "a3",
      title: "Bài 3: Giao tiếp hàng ngày",
      description: "Các câu giao tiếp trong sinh hoạt",
      videoUrl: "https://example.com/video10",
      thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
      duration: "11:15",
      isCompleted: false,
      isLocked: true,
    },
  ],
};

export function DashboardPageWithExercises({ onSignOut }: DashboardPageWithExercisesProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LessonType>("study");
  const [activeLevel, setActiveLevel] = useState<StudyLevel>("newbie");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Lấy mixed content cho level hiện tại
  const currentMixedContent = mockMixedContent[activeLevel] || [];

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
    // TODO: Gọi API để cập nhật trạng thái hoàn thành
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };
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
        userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
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
        
        {/* Nội dung chính - Sử dụng MixedLearningContent cho Study mode */}
        {activeTab === "study" ? (
          <MixedLearningContent
            level={activeLevel}
            items={currentMixedContent}
            onPlayLesson={handlePlayLesson}
          />
        ) : activeTab === "practice" ? (
          <PracticeMode />
        ) : (
          <GameMode />
        )}
      </div>

      {/* Video Player Modal */}
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
