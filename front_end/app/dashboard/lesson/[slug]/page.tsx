"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { DashboardHeader } from '@/app/components/DashboardHeader';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { PlayCircle, X, BookOpen, CheckCircle, ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface User {
  fullName: string;
  email: string;
  avatarUrl?: string;
}

const mockLessons: Record<string, any> = {
  // Phần 1: A-H
  "n1-chu-cai-a-h": {
    id: "n1",
    title: "Bài 1: Chữ cái A-H",
    description: "Học ký hiệu của 8 chữ cái đầu tiên trong bảng chữ cái",
    duration: "8:00",
    letters: [
      { letter: "A", image: "👆", description: "Nắm tay, ngón cái dựng thẳng", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "B", image: "✋", description: "Bàn tay mở, ngón cái khép vào lòng bàn tay", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "C", image: "🤏", description: "Bàn tay cong như hình chữ C", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "D", image: "☝️", description: "Ngón trỏ dựng lên, các ngón khác chạm ngón cái", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "E", image: "✊", description: "Nắm tay, các ngón cong xuống", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "F", image: "👌", description: "Ngón trỏ và ngón cái chạm nhau, ba ngón còn lại dựng lên", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "G", image: "👈", description: "Ngón trỏ và ngón cái dạng sang ngang", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "H", image: "✌️", description: "Ngón trỏ và ngón giữa duỗi ngang", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    ],
  },
  
  // Phần 2: I-P
  "n2-chu-cai-i-p": {
    id: "n2",
    title: "Bài 2: Chữ cái I-P",
    description: "Tiếp tục học ký hiệu cho chữ cái I đến P",
    duration: "8:00",
    letters: [
      { letter: "I", image: "🤙", description: "Chỉ ngón út dựng lên", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "J", image: "🤙", description: "Giống I nhưng vẽ hình chữ J", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "K", image: "✌️", description: "Ngón trỏ và ngón giữa tạo hình chữ V", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "L", image: "👍", description: "Ngón cái và ngón trỏ tạo góc vuông", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "M", image: "✊", description: "Nắm tay với 3 ngón đè lên ngón cái", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "N", image: "✊", description: "Nắm tay với 2 ngón đè lên ngón cái", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "O", image: "👌", description: "Các ngón tạo thành hình tròn", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "P", image: "☝️", description: "Ngón trỏ chỉ xuống, ngón giữa chạm ngón cái", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    ],
  },
  
  // Phần 3: Q-Z
  "n3-chu-cai-q-z": {
    id: "n3",
    title: "Bài 3: Chữ cái Q-Z",
    description: "Hoàn thành bảng chữ cái với các ký hiệu cuối cùng",
    duration: "10:00",
    letters: [
      { letter: "Q", image: "👇", description: "Ngón trỏ và ngón cái chỉ xuống", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "R", image: "🤞", description: "Ngón trỏ và ngón giữa chéo nhau", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "S", image: "✊", description: "Nắm tay, ngón cái bên ngoài", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "T", image: "👊", description: "Ngón cái giữa ngón trỏ và ngón giữa", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "U", image: "✌️", description: "Ngón trỏ và ngón giữa dựng lên", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "V", image: "✌️", description: "Giống U nhưng tách rộng hơn", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "W", image: "🤟", description: "Ba ngón giữa dựng lên", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "X", image: "☝️", description: "Ngón trỏ cong như móc", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "Y", image: "🤙", description: "Ngón cái và ngón út dựng ra", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "Z", image: "☝️", description: "Ngón trỏ vẽ hình chữ Z", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    ],
  },
  
  // Phần 4: Số 0-9
  "n4-so-0-9": {
    id: "n4",
    title: "Bài 4: Số 0-9",
    description: "Học ký hiệu cho các số từ 0 đến 9",
    duration: "6:00",
    letters: [
      { letter: "0", image: "⭕", description: "Tạo hình tròn bằng ngón cái và trỏ", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "1", image: "☝️", description: "Chỉ ngón trỏ dựng lên", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "2", image: "✌️", description: "Ngón trỏ và ngón giữa dựng lên", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "3", image: "🤟", description: "Ngón cái, trỏ và giữa dựng lên", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "4", image: "🖖", description: "Bốn ngón (trừ ngón cái) dựng lên", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "5", image: "🖐️", description: "Năm ngón duỗi ra", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "6", image: "🤙", description: "Ngón cái và ngón út chạm nhau", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "7", image: "🤘", description: "Ngón út và ngón cái chạm, ba ngón giữa dựng", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "8", image: "🤟", description: "Ngón cái và trỏ chạm, ba ngón còn lại dựng", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "9", image: "👌", description: "Ngón cái và trỏ tạo vòng tròn, các ngón còn lại khép", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    ],
  },
  
  // Giữ lại các bài cũ cho tương thích
  "b1-dong-vat-animals": {
    id: "b1",
    title: "Bài 1: Động vật - Animals",
    description: "Học từ vựng về các loài động vật",
    duration: "8:00",
    letters: [
      { letter: "Dog", image: "🐕", description: "Vỗ đùi và búng ngón tay", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "Cat", image: "🐱", description: "Vuốt hai ngón từ má ra ngoài (râu mèo)", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "Bird", image: "🐦", description: "Hai ngón mở đóng trước miệng (mỏ chim)", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      { letter: "Fish", image: "🐟", description: "Bàn tay lắc lư như cá bơi", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    ],
  },
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const slug = params.slug as string;
  const lesson = mockLessons[slug];

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

  const handleClose = () => {
    router.push('/dashboard');
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
        onViewProfile={handleViewProfile}
        onSettings={handleSettings}
        onSignOut={handleSignOut}
        onMenuClick={() => {}}
      />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Dashboard
            </Button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
                <p className="text-lg text-muted-foreground mb-4">{lesson.description}</p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-sm">
                    📚 {lesson.letters?.length || 0} nội dung
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    ⏱️ {lesson.duration}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <PlayCircle className="w-6 h-6 text-blue-600" />
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Hướng dẫn:</strong> Click vào từng ô chữ cái để xem video/hình ảnh minh họa chi tiết
                </p>
              </div>
            </Card>
          </div>

          {/* Letters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lesson.letters?.map((item: any, index: number) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 cursor-pointer hover:scale-105"
                onClick={() => setSelectedLetter(item)}
              >
                <div className="text-center mb-4">
                  <div className="text-8xl mb-4">{item.image}</div>
                  <h3 className="text-3xl font-bold text-blue-600 mb-2">
                    {item.letter}
                  </h3>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <PlayCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold">Click để xem video</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Completion Button */}
          <div className="mt-8 text-center">
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold">Hoàn thành bài học</h3>
                  <p className="text-sm text-muted-foreground">
                    Đã nắm vững kiến thức? Đánh dấu hoàn thành để tiếp tục!
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleClose}
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

      {/* Video Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{selectedLetter.image}</div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedLetter.letter}</h2>
                  <p className="text-sm opacity-90">{selectedLetter.description}</p>
                </div>
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
            
            <div className="aspect-video bg-black">
              {selectedLetter.gifUrl ? (
                // Hiển thị GIF nếu có
                <img 
                  src={selectedLetter.gifUrl} 
                  alt={selectedLetter.letter}
                  className="w-full h-full object-contain"
                />
              ) : (
                // Hiển thị video YouTube
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedLetter.videoUrl}
                  title={selectedLetter.letter}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
            
            <div className="p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Hướng dẫn thực hiện:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLetter.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
