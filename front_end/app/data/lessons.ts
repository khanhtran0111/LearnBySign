export interface LessonData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export const lessonsData: Record<string, LessonData[]> = {
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
      title: "Luyện tập bảng chữ cái",
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
      title: "Luyện tập bảng chữ cái",
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
      title: "Luyện tập bảng chữ cái",
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
  ],
  advanced: [],
};
