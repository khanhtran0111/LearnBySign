"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  BookOpen, 
  TrendingUp, 
  ArrowLeft,
  Phone,
  Cake,
  Target
} from "lucide-react";

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  birthDate?: string;
  avatarUrl?: string;
  createdAt: string;
  level: string;
}

interface UserStats {
  level: string;
  lessonPoints: number;
  practicePoints: number;
  totalPoints: number;
  currentStreak: number;
  lastStudyDate?: string;
  lessonsCompleted: number;
}

interface UserProgress {
  totalLessonsCompleted: number;
  totalLessons: number;
  completionRate: number;
  streak: number;
  newbieCompleted: number;
  basicCompleted: number;
  advancedCompleted: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/");
      return;
    }

    const loadProfileData = async () => {
      try {
        const userResponse = await fetch("http://localhost:3001/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) throw new Error("Failed to fetch profile");
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user stats
        const statsResponse = await fetch("http://localhost:3001/users/me/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let statsData = null;
        if (statsResponse.ok) {
          statsData = await statsResponse.json();
          setStats(statsData);
        }

        const progressResponse = await fetch("http://localhost:3001/progress", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          
          // Phân loại lessons đã hoàn thành theo level
          let newbieCompleted = 0;
          let basicCompleted = 0;
          let advancedCompleted = 0;
          
          progressData.forEach((p: any) => {
            if (!p.completed) return;
            
            // Lấy customId từ idLesson
            const customId = p.idLesson?.customId || p.idLesson;
            
            if (typeof customId === 'string') {
              // Newbie: n1, n2, n3, n4
              if (customId.startsWith('n')) {
                newbieCompleted++;
              }
              // Basic: b1-b7
              else if (customId.startsWith('b')) {
                basicCompleted++;
              }
              // Advanced: a1
              else if (customId.startsWith('a')) {
                advancedCompleted++;
              }
            }
          });
          
          const totalCompleted = newbieCompleted + basicCompleted + advancedCompleted;
          const totalLessons = 12; // 4 Newbie + 7 Basic + 1 Advanced
          
          setProgress({
            totalLessonsCompleted: totalCompleted,
            totalLessons,
            completionRate: (totalCompleted / totalLessons) * 100,
            streak: statsData?.currentStreak || 0,
            newbieCompleted,
            basicCompleted,
            advancedCompleted,
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const levelMap: Record<string, string> = {
    newbie: "Người mới",
    basic: "Cơ bản",
    advanced: "Nâng cao"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại Dashboard
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-center">Hồ sơ cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-2xl font-bold mb-2 text-center">
                  {user.fullName}
                </h2>
                <span className="text-sm text-gray-500 mb-4">
                  Cấp độ: {levelMap[user.level] || user.level}
                </span>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}

                {user.birthDate && (
                  <div className="flex items-center space-x-3">
                    <Cake className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày sinh</p>
                      <p className="font-medium">
                        {new Date(user.birthDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Tham gia</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="font-medium text-xs">{user.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="md:col-span-2 space-y-6">
            {/* Progress Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê học tập</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">
                      {stats?.lessonPoints || 0}
                    </p>
                    <p className="text-sm opacity-90">Điểm Lesson</p>
                    <p className="text-xs opacity-70 mt-1">
                      {stats?.lessonsCompleted || 0} bài hoàn thành
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">
                      {stats?.practicePoints || 0}
                    </p>
                    <p className="text-sm opacity-90">Điểm Practice</p>
                    <p className="text-xs opacity-70 mt-1">Từ bài luyện tập</p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{stats?.currentStreak || 0}</p>
                    <p className="text-sm opacity-90">Streak (ngày)</p>
                    <p className="text-xs opacity-70 mt-1">
                      {stats?.lastStudyDate 
                        ? `Học gần nhất: ${new Date(stats.lastStudyDate).toLocaleDateString('vi-VN')}`
                        : 'Chưa có hoạt động'}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">
                      {stats?.totalPoints || 0}
                    </p>
                    <p className="text-sm opacity-90">Tổng điểm</p>
                    <p className="text-xs opacity-70 mt-1">
                      Lesson + Practice
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">
                      {progress?.totalLessonsCompleted || 0}
                    </p>
                    <p className="text-sm opacity-90">Bài học hoàn thành</p>
                    <p className="text-xs opacity-70 mt-1">
                      {progress?.completionRate.toFixed(0) || 0}% hoàn thành
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">
                      {levelMap[stats?.level || 'newbie'] || 'Người mới'}
                    </p>
                    <p className="text-sm opacity-90">Cấp độ hiện tại</p>
                    <p className="text-xs opacity-70 mt-1">
                      Đang học tập
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Bar */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tiến độ tổng thể
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Main Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Khóa học tổng thể</h3>
                        <p className="text-sm text-gray-500">
                          {progress?.totalLessonsCompleted || 0} / {progress?.totalLessons || 0} bài học
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">
                          {Math.round(progress?.completionRate || 0)}%
                        </p>
                        <p className="text-xs text-gray-500">hoàn thành</p>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                        style={{
                          width: `${Math.max(progress?.completionRate || 0, 5)}%`,
                        }}
                      >
                        {(progress?.completionRate || 0) > 10 && (
                          <span className="text-xs font-bold text-white drop-shadow">
                            {Math.round(progress?.completionRate || 0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Level Progress Breakdown */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Chi tiết theo cấp độ</h3>
                    
                    {/* Newbie Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">Newbie</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {progress?.newbieCompleted || 0}/4
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, ((progress?.newbieCompleted || 0) / 4) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Basic Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium">Basic</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {progress?.basicCompleted || 0}/7
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, ((progress?.basicCompleted || 0) / 7) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Advanced Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span className="text-sm font-medium">Advanced</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {progress?.advancedCompleted || 0}/1
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, ((progress?.advancedCompleted || 0) / 1) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Achievements & Milestones */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      Thành tích & Mốc quan trọng
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg border-2 transition-all ${(stats?.lessonsCompleted || 0) >= 1 ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${(stats?.lessonsCompleted || 0) >= 1 ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                            {(stats?.lessonsCompleted || 0) >= 1 ? '✓' : ''}
                          </div>
                          <span className="text-sm font-medium">Bước đầu</span>
                        </div>
                        <p className="text-xs text-gray-600">Hoàn thành bài học đầu tiên</p>
                      </div>

                      <div className={`p-3 rounded-lg border-2 transition-all ${(stats?.currentStreak || 0) >= 3 ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${(stats?.currentStreak || 0) >= 3 ? 'bg-orange-400' : 'bg-gray-300'}`}>
                            {(stats?.currentStreak || 0) >= 3 ? '✓' : ''}
                          </div>
                          <span className="text-sm font-medium">Kiên trì</span>
                        </div>
                        <p className="text-xs text-gray-600">Học liên tục 3 ngày</p>
                      </div>

                      <div className={`p-3 rounded-lg border-2 transition-all ${(stats?.lessonsCompleted || 0) >= 5 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${(stats?.lessonsCompleted || 0) >= 5 ? 'bg-green-400' : 'bg-gray-300'}`}>
                            {(stats?.lessonsCompleted || 0) >= 5 ? '✓' : ''}
                          </div>
                          <span className="text-sm font-medium">Tích cực</span>
                        </div>
                        <p className="text-xs text-gray-600">Hoàn thành 5 bài học</p>
                      </div>

                      <div className={`p-3 rounded-lg border-2 transition-all ${(stats?.totalPoints || 0) >= 100 ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${(stats?.totalPoints || 0) >= 100 ? 'bg-blue-400' : 'bg-gray-300'}`}>
                            {(stats?.totalPoints || 0) >= 100 ? '✓' : ''}
                          </div>
                          <span className="text-sm font-medium">Điểm cao</span>
                        </div>
                        <p className="text-xs text-gray-600">Đạt 100 điểm</p>
                      </div>
                    </div>
                  </div>

                  {/* Next Goal */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">Mục tiêu tiếp theo</h4>
                        <p className="text-sm text-gray-600">
                          {(progress?.completionRate || 0) < 33 
                            ? 'Hoàn thành 4 bài học Newbie để mở khóa cấp độ Basic'
                            : (progress?.completionRate || 0) < 92
                            ? 'Hoàn thành 11 bài học để mở khóa cấp độ Advanced'
                            : (progress?.completionRate || 0) < 100
                            ? 'Hoàn thành toàn bộ 12 bài học để nhận chứng chỉ'
                            : 'Chúc mừng! Bạn đã hoàn thành khóa học! 🎉'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Hoàn thành bài học</p>
                      <p className="text-sm text-gray-500">Hôm nay</p>
                    </div>
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Thực hành ký hiệu</p>
                      <p className="text-sm text-gray-500">Hôm qua</p>
                    </div>
                    <BookOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Cập nhật hồ sơ</p>
                      <p className="text-sm text-gray-500">3 ngày trước</p>
                    </div>
                    <User className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
