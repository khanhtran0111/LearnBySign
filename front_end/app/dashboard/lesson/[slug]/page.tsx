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
 const slug = params.slug as string;
 const customId = slug?.split("-")[0];


 // State Data
 const [user, setUser] = useState<User | null>(null);
 const [lesson, setLesson] = useState<LessonData | null>(null);


 // State UI
 const [selectedContent, setSelectedContent] = useState<LessonContent | null>(null);
 const [currentIndex, setCurrentIndex] = useState<number | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [isSubmitting, setIsSubmitting] = useState(false);


 // Load Data
 useEffect(() => {
   const token = localStorage.getItem("accessToken");
   if (!token) {
     router.replace("/login");
     return;
   }


   const initData = async () => {
     try {
       setIsLoading(true);
      
       const [userRes, lessonRes] = await Promise.all([
         axios.get(`${BACKEND_URL}/users/me`, {
           headers: { Authorization: `Bearer ${token}` },
         }),
         axios.get(`${BACKEND_URL}/lessons/by-custom-id/${customId}`)
       ]);


       setUser(userRes.data);
       setLesson(lessonRes.data);
     } catch (error) {
       console.error("Lỗi tải dữ liệu:", error);
       if (axios.isAxiosError(error) && error.response?.status === 401) {
         localStorage.removeItem("accessToken");
         router.replace("/login");
       } else if (axios.isAxiosError(error) && error.response?.status === 404) {
         alert("Không tìm thấy bài học này.");
         router.push("/dashboard");
       }
     } finally {
       setIsLoading(false);
     }
   };


   if (customId) {
     initData();
   }
 }, [customId, router]);


 // Handlers
 const handleClose = () => router.push("/dashboard");


 const handleNext = useCallback(() => {
   if (!lesson || currentIndex === null) return;
   const contents = lesson.contents || [];
   const nextIndex = currentIndex + 1;


   if (nextIndex < contents.length) {
     setCurrentIndex(nextIndex);
     setSelectedContent(contents[nextIndex]);
   } else {
     // Loop về đầu
     setCurrentIndex(0);
     setSelectedContent(contents[0]);
   }
 }, [lesson, currentIndex]);


 const handlePrev = useCallback(() => {
   if (!lesson || currentIndex === null) return;
   const contents = lesson.contents || [];
   const prevIndex = currentIndex - 1;


   if (prevIndex >= 0) {
     setCurrentIndex(prevIndex);
     setSelectedContent(contents[prevIndex]);
   } else {
     // Loop về cuối
     const last = contents.length - 1;
     setCurrentIndex(last);
     setSelectedContent(contents[last]);
   }
 }, [lesson, currentIndex]);


 const handleCompleteLesson = async () => {
   if (!user || !lesson) return;
  
   setIsSubmitting(true);
   const token = localStorage.getItem("accessToken");


   try {
     const userId = user._id || user.id;
     const lessonId = lesson._id || lesson.id;
     const totalItems = lesson.contents?.length || 0;
     const scoreEarned = totalItems * 10; // 10 điểm mỗi mục


     await axios.post(
       `${BACKEND_URL}/progress/mark`,
       {
         idUser: userId,
         idLesson: lessonId,
         type: "lesson",
         completed: true,
         questionCount: totalItems,
         score: scoreEarned
       },
       {
         headers: { Authorization: `Bearer ${token}` },
       }
     );


     // Hiển thị thông báo
     alert(`🎉 Chúc mừng! Bạn đã hoàn thành bài học và nhận được ${scoreEarned} điểm!`);
     router.push("/dashboard");


   } catch (error) {
     console.error("Lỗi lưu tiến độ:", error);
     alert("Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại.");
   } finally {
     setIsSubmitting(false);
   }
 };


 // Handlers cho Header
 const handleSignOut = () => {
   localStorage.removeItem("accessToken");
   router.push("/login");
 };


 // Render
 if (isLoading) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-white">
       <div className="flex flex-col items-center gap-2">
           <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
           <p className="text-muted-foreground">Đang tải bài học...</p>
       </div>
     </div>
   );
 }


 if (!user || !lesson) return null;


 return (
   <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50/30">
     <DashboardHeader
       userName={user.fullName}
       userEmail={user.email}
       userAvatar={user.avatarUrl}
       onViewProfile={() => router.push("/profile")}
       onSettings={() => router.push("/settings")}
       onSignOut={handleSignOut}
       onMenuClick={() => {}}
     />


     <div className="flex-1 p-4 md:p-8 overflow-y-auto">
       <div className="max-w-6xl mx-auto">
         {/* Top Bar */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
           <div>
               <Button variant="ghost" onClick={handleClose} className="mb-2 pl-0 hover:pl-2 transition-all">
                   <ArrowLeft className="w-4 h-4 mr-2" />
                   Quay lại Dashboard
               </Button>
               <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{lesson.title}</h1>
               <p className="text-lg text-muted-foreground mt-1">
                   {lesson.description}
               </p>
           </div>
           <Badge variant="outline" className="text-sm py-1 px-3 h-fit w-fit bg-white shadow-sm">
             📚 {lesson.contents?.length || 0} nội dung
           </Badge>
         </div>


         {/* Instructions Banner */}
         <Card className="p-4 bg-blue-50 border-blue-200 mb-8 flex items-start gap-3">
           <PlayCircle className="w-6 h-6 text-blue-600 mt-0.5 shrink-0" />
           <div>
               <p className="text-sm font-medium text-blue-900">Hướng dẫn học tập</p>
               <p className="text-sm text-blue-700">
                   Click vào từng thẻ bên dưới để xem video/hình ảnh hướng dẫn chi tiết.
                   Sử dụng các nút điều hướng để chuyển đổi qua lại giữa các nội dung.
               </p>
           </div>
         </Card>


         {/* Content Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
           {lesson.contents?.map((item, index) => (
             <Card
               key={index}
               className="group p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 cursor-pointer bg-white relative overflow-hidden"
               onClick={() => {
                 setSelectedContent(item);
                 setCurrentIndex(index);
               }}
             >
               <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <PlayCircle className="w-6 h-6 text-blue-500" />
               </div>
               <div className="text-center mb-4 pt-2">
                 <h3 className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                   {item.label}
                 </h3>
               </div>
               <p className="text-sm text-muted-foreground text-center line-clamp-2">
                 {item.description}
               </p>
             </Card>
           ))}
         </div>


         {/* Footer / Completion Area */}
         <div className="flex justify-center pb-8">
           <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 max-w-2xl w-full">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                   <CheckCircle className="w-6 h-6 text-green-600" />
                 </div>
                 <div className="text-center sm:text-left">
                   <h3 className="text-lg font-semibold text-green-900">Đã học xong?</h3>
                   <p className="text-sm text-green-700">
                     Xác nhận hoàn thành để lưu kết quả và nhận điểm thưởng
                   </p>
                 </div>
               </div>


               <Button
                 size="lg"
                 onClick={handleCompleteLesson}
                 disabled={isSubmitting}
                 className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
               >
                 {isSubmitting ? (
                   <>
                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                       Đang lưu...
                   </>
                 ) : (
                   <>
                       <CheckCircle className="w-5 h-5 mr-2" />
                       Hoàn thành bài học
                   </>
                 )}
               </Button>
             </div>
           </Card>
         </div>
       </div>
     </div>


     {/* Modal View Content */}
     {selectedContent && currentIndex !== null && (
       <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
         <div className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          
           {/* Modal Header */}
           <div className="flex items-center justify-between p-4 border-b bg-white shrink-0">
             <div>
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <span className="text-blue-600 text-2xl">#{currentIndex + 1}</span>
                   {selectedContent.label}
               </h2>
               <p className="text-sm text-muted-foreground line-clamp-1">{selectedContent.description}</p>
             </div>
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setSelectedContent(null)}
               className="rounded-full hover:bg-gray-100"
             >
               <X className="w-6 h-6 text-gray-500" />
             </Button>
           </div>


           {/* Modal Body (Media) */}
           <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
               {/* Xử lý hiển thị Video hoặc Ảnh */}
             {selectedContent.videoUrl?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
               <img
                 src={selectedContent.videoUrl}
                 alt={selectedContent.label}
                 className="max-h-full max-w-full object-contain"
               />
             ) : (
               <video
                   key={selectedContent.videoUrl}
                   src={selectedContent.videoUrl}
                   controls
                   autoPlay
                   className="w-full h-full max-h-[70vh] object-contain"
               />
             )}
           </div>


           {/* Modal Footer (Navigation) */}
           <div className="p-4 border-t bg-gray-50 flex items-center justify-between shrink-0">
             <Button
               variant="outline"
               onClick={handlePrev}
               className="w-32 hover:bg-white hover:border-blue-300 transition-all"
             >
               ⬅️ Trước
             </Button>


             <span className="text-sm font-medium text-gray-500 hidden sm:block">
               Nội dung {currentIndex + 1} / {lesson.contents?.length || 0}
             </span>


             <Button
               onClick={handleNext}
               className="w-32 bg-blue-600 hover:bg-blue-700 text-white transition-all"
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
