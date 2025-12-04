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
