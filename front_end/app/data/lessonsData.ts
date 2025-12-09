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
      groupTitle: "Chủ đề 1: Đời sống & Màu sắc",
      lessons: [
        {
          id: "b1",
          title: "Bài 1: Động vật - Animals",
          description: "Học từ vựng về các loài động vật",
          videoUrl: "/videos/b1.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1080",
          duration: "10:00",
          isCompleted: true,
          isLocked: false,
          type: 'lesson' as const,
        },
        {
          id: "b2",
          title: "Bài 2: Màu sắc - Colors",
          description: "Ký hiệu cho các màu sắc cơ bản",
          videoUrl: "/videos/b2.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&q=80&w=1080",
          duration: "8:00",
          isCompleted: false,
          isLocked: false,
          type: 'lesson' as const,
        },
      ],
    },
    {
      groupTitle: "Chủ đề 2: Gia đình & Ẩm thực",
      lessons: [
        {
          id: "b3",
          title: "Bài 3: Gia đình - Family",
          description: "Từ vựng về các thành viên trong gia đình",
          videoUrl: "/videos/b3.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1080",
          duration: "12:00",
          isCompleted: false,
          isLocked: true,
          type: 'lesson' as const,
        },
        {
          id: "b4",
          title: "Bài 4: Thức ăn - Food",
          description: "Học từ vựng về đồ ăn và thức uống",
          videoUrl: "/videos/b4.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1080",
          duration: "15:00",
          isCompleted: false,
          isLocked: true,
          type: 'lesson' as const,
        },
      ],
    },
  ],
  advanced: [
    {
      groupTitle: "Kỹ năng giao tiếp xã hội",
      lessons: [
        {
          id: "a1",
          title: "Bài 1: Chào hỏi cơ bản",
          description: "Các câu chào hỏi và giới thiệu bản thân",
          videoUrl: "/videos/a1.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=1080",
          duration: "10:00",
          isCompleted: false,
          isLocked: false,
          type: 'lesson' as const,
        },
        {
          id: "a2",
          title: "Bài 2: Hỏi đáp thông tin",
          description: "Cách hỏi và trả lời các câu hỏi",
          videoUrl: "/videos/a2.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1080",
          duration: "12:00",
          isCompleted: false,
          isLocked: true,
          type: 'lesson' as const,
        },
        {
          id: "a3",
          title: "Bài 3: Giao tiếp hàng ngày",
          description: "Các câu giao tiếp trong sinh hoạt hàng ngày",
          videoUrl: "/videos/a3.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1080",
          duration: "15:00",
          isCompleted: false,
          isLocked: true,
          type: 'lesson' as const,
        },
      ],
    },
  ],
};


