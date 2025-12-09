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
      groupTitle: "Nhóm 1: Gia đình & Ẩm thực",
      lessons: [
        {
          id: "b1",
          title: "Bài 1: Người thân, gia đình",
          description: "Học từ vựng về các thành viên trong gia đình và người thân",
          thumbnailUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1080",
          duration: "15:00",
          isCompleted: false,
          isLocked: false,
          type: 'lesson' as const,
        },
        {
          id: "b2",
          title: "Bài 2: Ẩm thực",
          description: "Học từ vựng về đồ ăn, thức uống và món ăn",
          thumbnailUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1080",
          duration: "20:00",
          isCompleted: false,
          isLocked: false,
          type: 'lesson' as const,
        },
        {
          id: "p5",
          title: "Luyện tập: Gia đình & Ẩm thực",
          description: "Thực hành từ vựng về gia đình và ẩm thực",
          thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1080",
          duration: "10 phút",
          isCompleted: false,
          isLocked: false,
          type: 'practice' as const,
        },
      ],
    },
    {
      groupTitle: "Nhóm 2: Quốc gia & Động vật",
      lessons: [
        {
          id: "b3",
          title: "Bài 3: Các quốc gia trên thế giới",
          description: "Học từ vựng về các quốc gia và địa danh",
          thumbnailUrl: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1080",
          duration: "15:00",
          isCompleted: false,
          isLocked: true,
          type: 'lesson' as const,
        },
        {
          id: "b4",
          title: "Bài 4: Động vật",
          description: "Học từ vựng về các loài động vật",
          thumbnailUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1080",
          duration: "12:00",
          isCompleted: false,
          isLocked: true,
          type: 'lesson' as const,
        },
        {
          id: "p6",
          title: "Luyện tập: Quốc gia & Động vật",
          description: "Thực hành từ vựng về quốc gia và động vật",
          thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1080",
          duration: "10 phút",
          isCompleted: false,
          isLocked: true,
          type: 'practice' as const,
        },
      ],
    },
    {
      groupTitle: "Nhóm 3: Phương tiện & Hành động",
      lessons: [
        {
          id: "b5",
          title: "Bài 5: Phương tiện",
          description: "Học từ vựng về các phương tiện giao thông",
          thumbnailUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1080",
          duration: "10:00",
          isCompleted: false,
          isLocked: true,
          type: 'lesson' as const,
        },
        {
          id: "b6",
          title: "Bài 6: Hành động",
          description: "Học từ vựng về các hành động thường ngày",
          thumbnailUrl: "https://images.unsplash.com/photo-1485081669829-bacb8c7bb1f3?auto=format&fit=crop&q=80&w=1080",
          duration: "18:00",
          isCompleted: false,
          isLocked: true,
          type: 'lesson' as const,
        },
        {
          id: "p7",
          title: "Luyện tập: Phương tiện & Hành động",
          description: "Thực hành từ vựng về phương tiện và hành động",
          thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1080",
          duration: "10 phút",
          isCompleted: false,
          isLocked: true,
          type: 'practice' as const,
        },
      ],
    },
    {
      groupTitle: "Nhóm 4: Các từ khác",
      lessons: [
        {
          id: "b7",
          title: "Bài 7: Các từ khác",
          description: "Học các từ vựng phổ biến khác",
          thumbnailUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1080",
          duration: "20:00",
          isCompleted: false,
          isLocked: true,
          type: 'lesson' as const,
        },
        {
          id: "p9",
          title: "Luyện tập: Các từ khác",
          description: "Thực hành từ vựng từ Bài 7",
          thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1080",
          duration: "10 phút",
          isCompleted: false,
          isLocked: true,
          type: 'practice' as const,
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
          title: "Bài 1: Các câu nói cơ bản và nâng cao",
          description: "Học các câu giao tiếp, cụm từ phức tạp trong cuộc sống hàng ngày",
          thumbnailUrl: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=1080",
          duration: "30:00",
          isCompleted: false,
          isLocked: false,
          type: 'lesson' as const,
        },
        {
          id: "p8",
          title: "Luyện tập: Giao tiếp nâng cao",
          description: "Thực hành các câu giao tiếp và cụm từ phức tạp",
          thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1080",
          duration: "15 phút",
          isCompleted: false,
          isLocked: false,
          type: 'practice' as const,
        },
      ],
    },
  ],
};


