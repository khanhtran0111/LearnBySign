"use client";


import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, PlayCircle, X, CheckCircle, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/app/components/DashboardHeader";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";


const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";


interface User {
 _id: string; // MongoDB ID
 id?: string;
 fullName: string;
 email: string;
 avatarUrl?: string;
}


interface LessonContent {
 label: string;
 description: string;
 videoUrl: string;
 order?: number;
}


interface LessonData {
 _id: string;
 id?: string;
 customId: string;
 title: string;
 description: string;
 contents: LessonContent[];
 letters?: any[]; // Fallback cho cấu trúc cũ nếu có
}


export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const slug = params.slug as string;
  const [lesson, setLesson] = useState<any>(null);
  const customId = slug.split("-")[0];

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('accessToken');
        }
        router.push('/login');
      }
    };

    loadProfile();
  }, [router]);

  useEffect(() => {
  const loadLesson = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/lessons/by-custom-id/${customId}`);
      console.log('[LessonPage] Loaded lesson:', response.data);
      console.log('[LessonPage] Contents:', response.data.contents);
      setLesson(response.data);
    } catch (error) {
      console.error("Error loading lesson:", error);
    }
  };

  loadLesson();
}, [slug]);

  const handleClose = () => {
    router.push('/dashboard');
  };

  const handleNext = () => {
    if (!lesson || currentIndex === null) return;
    const nextIndex = currentIndex + 1;

    if (nextIndex < lesson.contents.length) {
      setCurrentIndex(nextIndex);
      setSelectedLetter(lesson.contents[nextIndex]);
    } else {
      // Return to beginning
      setCurrentIndex(0);
      setSelectedLetter(lesson.contents[0]);
    }
  };

  const handlePrev = () => {
    if (!lesson || currentIndex === null) return;
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      setSelectedLetter(lesson.contents[prevIndex]);
    } else {
      // Go to last
      const last = lesson.contents.length - 1;
      setCurrentIndex(last);
      setSelectedLetter(lesson.contents[last]);
    }
  };

  const handleCompleteLesson = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !user) return;

    try {
      // Lấy userId
      const userResponse = await axios.get(`${BACKEND_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const userId = userResponse.data._id || userResponse.data.id;
      const questionCount = lesson.letters?.length || 1;

      // Gọi API mark progress với customId trực tiếp
      // Backend sẽ tự động xử lý việc tìm hoặc tạo lesson
      await axios.post(`${BACKEND_URL}/progress/mark`, {
        idUser: userId,
        idLesson: lesson.id, // Dùng customId (n1, n2, etc.)
        type: 'lesson',
        completed: true,
        questionCount: lesson.contents.length
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Chúc mừng! Bạn đã hoàn thành bài học và nhận được ${questionCount * 10} điểm!`);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error marking progress:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
      alert('Có lỗi xảy ra khi lưu tiến độ. Vui lòng kiểm tra console log và đảm bảo backend đang chạy.');
    }
  };

  const handleViewProfile = () => router.push("/profile");
  const handleSettings = () => router.push("/settings");
  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  if (!user || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50/30">
      <DashboardHeader
        userName={user.fullName}
        userEmail={user.email}
        userAvatar={user.avatarUrl}
        onViewProfile={() => router.push("/profile")}
        onSettings={() => router.push("/settings")}
        onSignOut={() => {
          localStorage.removeItem("accessToken");
          router.push("/login");
        }}
        onMenuClick={() => {}}
      />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Button variant="ghost" onClick={handleClose} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Dashboard
          </Button>

          <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">
            {lesson.description}
          </p>

          <div className="flex gap-2 mb-8">
            <Badge variant="secondary" className="text-sm">
              📚 {lesson.contents?.length} nội dung
            </Badge>
          </div>

          {/* Instructions */}
          <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
            <div className="flex items-center gap-3">
              <PlayCircle className="w-6 h-6 text-blue-600" />
              <p className="text-sm text-muted-foreground">
                💡 Click để xem video/hình và điều hướng giữa các nội dung
              </p>
            </div>
          </Card>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lesson.contents?.map((item: any, index: number) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 cursor-pointer hover:scale-105"
                onClick={() => {
                  console.log('[LessonPage] Selected item:', item);
                  console.log('[LessonPage] VideoUrl:', item.videoUrl);
                  setSelectedLetter(item);
                  setCurrentIndex(index);
                }}
              >
                <div className="text-center mb-4">
                  <h3 className="text-3xl font-bold text-blue-600 mb-2">
                    {item.label}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Complete Lesson */}
          <div className="mt-8 text-center">
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold">Hoàn thành bài học</h3>
                  <p className="text-sm text-muted-foreground">
                    Đánh dấu hoàn thành sau khi luyện tập xong
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleCompleteLesson}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Hoàn thành
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedLetter && currentIndex !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div>
                <h2 className="text-2xl font-bold">{selectedLetter.label}</h2>
                <p className="text-sm opacity-90">{selectedLetter.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLetter(null)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Media */}
            <div className="aspect-video bg-black flex items-center justify-center">
              {selectedLetter.videoUrl?.endsWith(".gif") ? (
                <img
                  src={`${selectedLetter.videoUrl}?t=${Date.now()}`}
                  alt={selectedLetter.label}
                  className="max-h-full max-w-full object-contain"
                />
              ) : selectedLetter.videoUrl?.endsWith(".mp4") ? (
                <video
                  src={selectedLetter.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedLetter.videoUrl}
                  allowFullScreen
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-4 bg-white border-t">

              <Button
                onClick={handlePrev}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                ⬅️ Trước
              </Button>

              <p className="text-sm">
                {currentIndex + 1} / {lesson.contents.length}
              </p>

              <Button
                onClick={handleNext}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Tiếp ➡️
              </Button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface LessonItem {
 id: string;
 title: string;
 description: string;
 videoUrl?: string;
 thumbnailUrl: string;
 duration: string;
 isCompleted: boolean;
 isLocked: boolean;
 type: 'lesson' | 'practice';
}


export interface LessonGroup {
 groupTitle: string;
 lessons: LessonItem[];
}


// Mock data cho lessons theo từng cấp độ
export const lessonsData = {
 newbie: [
   // Phần 1: A-H
   {
     groupTitle: "Phần 1: Chữ cái A-H",
     lessons: [
       {
         id: "n1",
         title: "Bài 1: Chữ cái A-H",
         description: "Học ký hiệu của 8 chữ cái đầu tiên trong bảng chữ cái",
         videoUrl: "https://www.youtube.com/watch?v=7QJ-N-AQJYc",
         thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
         duration: "8:00",
         isCompleted: true,
         isLocked: false,
         type: 'lesson' as const,
       },
       {
         id: "p1",
         title: "Luyện tập bảng chữ cái A-H",
         description: "Kiểm tra kiến thức về chữ cái A-H",
         thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwcmFjdGljZSUyMHF1aXp8ZW58MXx8fHwxNzYwMTMzMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
         duration: "3 phút",
         isCompleted: true,
         isLocked: false,
         type: 'practice' as const,
       },
     ],
   },
  
   // Phần 2: I-P
   {
     groupTitle: "Phần 2: Chữ cái I-P",
     lessons: [
       {
         id: "n2",
         title: "Bài 2: Chữ cái I-P",
         description: "Tiếp tục học ký hiệu cho chữ cái I đến P",
         videoUrl: "https://www.youtube.com/watch?v=7QJ-N-AQJYc",
         thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
         duration: "8:00",
         isCompleted: false,
         isLocked: false,
         type: 'lesson' as const,
       },
       {
         id: "p2",
         title: "Luyện tập bảng chữ cái I-P",
         description: "Kiểm tra kiến thức về chữ cái I-P",
         thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwcmFjdGljZSUyMHF1aXp8ZW58MXx8fHwxNzYwMTMzMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
         duration: "3 phút",
         isCompleted: false,
         isLocked: false,
         type: 'practice' as const,
       },
     ],
   },
  
   // Phần 3: Q-Z
   {
     groupTitle: "Phần 3: Chữ cái Q-Z",
     lessons: [
       {
         id: "n3",
         title: "Bài 3: Chữ cái Q-Z",
         description: "Hoàn thành bảng chữ cái với các ký hiệu cuối cùng",
         videoUrl: "https://www.youtube.com/watch?v=7QJ-N-AQJYc",
         thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
         duration: "10:00",
         isCompleted: false,
         isLocked: true,
         type: 'lesson' as const,
       },
       {
         id: "p3",
         title: "Luyện tập bảng chữ cái Q-Z",
         description: "Kiểm tra kiến thức Q-Z",
         thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwcmFjdGljZSUyMHF1aXp8ZW58MXx8fHwxNzYwMTMzMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
         duration: "3 phút",
         isCompleted: false,
         isLocked: true,
         type: 'practice' as const,
       },
     ],
   },
  
   // Phần 4: Số 0-9
   {
     groupTitle: "Phần 4: Số 0-9",
     lessons: [
       {
         id: "n4",
         title: "Bài 4: Số 0-9",
         description: "Học ký hiệu cho các số từ 0 đến 9",
         videoUrl: "https://www.youtube.com/watch?v=7QJ-N-AQJYc",
         thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
         duration: "6:00",
         isCompleted: false,
         isLocked: true,
         type: 'lesson' as const,
       },
       {
         id: "p4",
         title: "Luyện tập số 0-9",
         description: "Thực hành ký hiệu các con số",
         thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxwcmFjdGljZSUyMHF1aXp8ZW58MXx8fHwxNzYwMTMzMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
         duration: "3 phút",
         isCompleted: false,
         isLocked: true,
         type: 'practice' as const,
       },
     ],
   },
 ],
  basic: [
   {
     groupTitle: "Từ vựng cơ bản",
     lessons: [
       {
         id: "b1",
         title: "Bài 1: Động vật",
         description: "Học từ vựng về các loài động vật",
         thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
         duration: "8:00",
         isCompleted: true,
         isLocked: false,
         type: 'lesson' as const,
       },
     ],
   },
 ],
  advanced: [
   {
     groupTitle: "Giao tiếp nâng cao",
     lessons: [
       {
         id: "a1",
         title: "Bài 1: Chào hỏi",
         description: "Các câu chào hỏi và giới thiệu",
         thumbnailUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWduJTIwbGFuZ3VhZ2UlMjBhbHBoYWJldHxlbnwxfHx8fDE3NjAxMzMzODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
         duration: "10:00",
         isCompleted: false,
         isLocked: false,
         type: 'lesson' as const,
       },
     ],
   },
 ],
};
