"use client";


import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toVietnamese } from "@/app/utils/vietnameseMapping";
import { ArrowLeft, PlayCircle, X, CheckCircle, Loader2, BookCheck } from "lucide-react";
import { DashboardHeader } from "@/app/components/DashboardHeader";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Progress as ProgressBar } from "@/app/components/ui/progress";


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
  const [learnedContents, setLearnedContents] = useState<Set<string>>(new Set());
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

      // Load learned contents
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const learnedResponse = await axios.get(
            `${BACKEND_URL}/progress/learned-contents/${customId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setLearnedContents(new Set(learnedResponse.data || []));
          console.log('[LessonPage] Learned contents:', learnedResponse.data);
        } catch (err) {
          console.error('[LessonPage] Error loading learned contents:', err);
        }
      }
    } catch (error) {
      console.error("Error loading lesson:", error);
    }
  };

  loadLesson();
}, [slug]);

  const handleClose = () => {
    // Xác định level từ customId
    let level = 'newbie';
    if (customId.startsWith('b') || customId === 'p5' || customId === 'p6' || customId === 'p7' || customId === 'p9') {
      level = 'basic';
    } else if (customId.startsWith('a') || customId === 'p8') {
      level = 'advanced';
    }
    router.push(`/dashboard/${level}`);
  };

  const findNextUnlearnedContent = (fromIndex: number, learned: Set<string>) => {
    if (!lesson || !lesson.contents) return null;

    // Tìm từ tiếp theo chưa học
    for (let i = fromIndex + 1; i < lesson.contents.length; i++) {
      if (!learned.has(lesson.contents[i].label)) {
        return i;
      }
    }

    // Nếu không có từ tiếp theo chưa học, tìm ngược lại từ đầu
    for (let i = 0; i < fromIndex; i++) {
      if (!learned.has(lesson.contents[i].label)) {
        return i;
      }
    }

    return null;
  };

  const handleMarkContentLearned = async (contentLabel: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token || !user || currentIndex === null) return;

    try {
      await axios.post(
        `${BACKEND_URL}/progress/mark-content`,
        {
          idUser: user._id || user.id,
          idLesson: customId,
          contentLabel: contentLabel,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Cập nhật local state
      const updatedLearned = new Set([...learnedContents, contentLabel]);
      setLearnedContents(updatedLearned);
      console.log('[LessonPage] Marked content learned:', contentLabel);

      // Tìm content chưa học gần nhất
      const nextUnlearnedIndex = findNextUnlearnedContent(currentIndex, updatedLearned);
      
      if (nextUnlearnedIndex !== null) {
        // Chuyển sang content chưa học gần nhất
        setCurrentIndex(nextUnlearnedIndex);
        setSelectedLetter(lesson.contents[nextUnlearnedIndex]);
      } else {
        // Tất cả đã học, đóng modal
        setSelectedLetter(null);
      }
    } catch (error) {
      console.error('[LessonPage] Error marking content learned:', error);
    }
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
      
      // Tính điểm cho lesson: mỗi content được xem = 10 điểm
      const totalScore = (lesson.contents?.length || 1) * 10;

      console.log('[LessonPage] Marking progress:', {
        idUser: userId,
        idLesson: customId,
        score: totalScore,
        completed: true
      });

      // Gọi API mark progress với customId
      await axios.post(`${BACKEND_URL}/progress/mark`, {
        idUser: userId,
        idLesson: customId, // Dùng customId (n1, n2, etc.)
        completed: true,
        score: totalScore
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Chúc mừng! Bạn đã hoàn thành bài học và nhận được ${totalScore} điểm!`);
      
      // Xác định level và redirect về đúng route
      let level = 'newbie';
      if (customId.startsWith('b') || customId === 'p5' || customId === 'p6' || customId === 'p7' || customId === 'p9') {
        level = 'basic';
      } else if (customId.startsWith('a') || customId === 'p8') {
        level = 'advanced';
      }
      router.push(`/dashboard/${level}?refresh=` + Date.now());
    } catch (error) {
      console.error('[LessonPage] Error marking progress:', error);
      if (axios.isAxiosError(error)) {
        console.error('[LessonPage] Response:', error.response?.data);
        console.error('[LessonPage] Status:', error.response?.status);
      }
      alert('Có lỗi xảy ra khi lưu tiến độ. Vui lòng thử lại.');
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
            <Badge variant="secondary" className="text-sm bg-green-100 text-green-700">
              ✅ {learnedContents.size}/{lesson.contents?.length} đã học
            </Badge>
          </div>

          {/* Progress Bar */}
          <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Tiến độ học tập</span>
              <span className="text-sm font-bold text-blue-600">
                {lesson.contents?.length > 0 
                  ? Math.round((learnedContents.size / lesson.contents.length) * 100)
                  : 0}%
              </span>
            </div>
            <ProgressBar 
              value={lesson.contents?.length > 0 
                ? (learnedContents.size / lesson.contents.length) * 100 
                : 0
              } 
              className="h-3"
            />
          </Card>

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
            {lesson.contents?.map((item: any, index: number) => {
              const isLearned = learnedContents.has(item.label);
              return (
              <Card
                key={index}
                className={`p-6 transition-all duration-300 border-2 relative ${
                  isLearned 
                    ? 'bg-green-50 border-green-400 shadow-md' 
                    : 'hover:shadow-xl hover:border-blue-400 cursor-pointer hover:scale-105'
                }`}
              >
                {/* Badge "Đã học" */}
                {isLearned && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500 text-white text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Đã học
                    </Badge>
                  </div>
                )}

                <div 
                  className="text-center mb-4 cursor-pointer"
                  onClick={() => {
                    console.log('[LessonPage] Selected item:', item);
                    console.log('[LessonPage] VideoUrl:', item.videoUrl);
                    setSelectedLetter(item);
                    setCurrentIndex(index);
                  }}
                >
                  <h3 className="text-3xl font-bold text-blue-600 mb-2">
                    {toVietnamese(item.label)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {customId.startsWith('n') || customId.startsWith('p1') || customId.startsWith('p2') || customId.startsWith('p3') || customId.startsWith('p4') 
                      ? item.description 
                      : toVietnamese(item.label)}
                  </p>
                </div>
              </Card>
            )})}
          </div>

          {/* Complete Lesson */}
          <div className="mt-8 text-center">
            <Card className={`p-6 transition-all ${
              learnedContents.size === lesson.contents?.length 
                ? 'bg-gradient-to-r from-green-50 to-blue-50' 
                : 'bg-gradient-to-r from-gray-50 to-gray-100 opacity-60'
            }`}>
              <div className="flex items-center justify-center gap-4">
                <CheckCircle className={`w-8 h-8 ${
                  learnedContents.size === lesson.contents?.length 
                    ? 'text-green-600' 
                    : 'text-gray-400'
                }`} />
                <div className="text-left">
                  <h3 className="text-xl font-semibold">Hoàn thành bài học</h3>
                  <p className="text-sm text-muted-foreground">
                    {learnedContents.size === lesson.contents?.length 
                      ? 'Bạn đã học hết tất cả từ, hãy bấm hoàn thành'
                      : `Bạn cần học hết ${lesson.contents?.length - learnedContents.size} từ nữa`
                    }
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleCompleteLesson}
                  disabled={learnedContents.size !== lesson.contents?.length}
                  className={`${
                    learnedContents.size === lesson.contents?.length
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
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
                  src={selectedLetter.videoUrl}
                  alt={selectedLetter.label}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    console.error('[LessonPage] Failed to load image:', selectedLetter.videoUrl);
                    // Fallback: hiển thị text thay vì placeholder
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'text-white text-center p-8';
                    fallback.innerHTML = `<p class="text-2xl mb-2">${selectedLetter.label}</p><p class="text-sm opacity-70">Không thể tải hình ảnh</p>`;
                    e.currentTarget.parentElement?.appendChild(fallback);
                  }}
                />
              ) : selectedLetter.videoUrl?.endsWith(".mp4") ? (
                <video
                  src={selectedLetter.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('[LessonPage] Failed to load video:', selectedLetter.videoUrl);
                  }}
                >
                  <div className="text-white text-center p-8">
                    <p className="text-2xl mb-2">{selectedLetter.label}</p>
                    <p className="text-sm opacity-70">Trình duyệt không hỗ trợ video này</p>
                  </div>
                </video>
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedLetter.videoUrl}
                  allowFullScreen
                  title={selectedLetter.label}
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
                onClick={() => handleMarkContentLearned(selectedLetter.label)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Đã hiểu bài ✓
              </Button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
