"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Hand, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "../components/fallback/ImageWithFallback";
import axios from "axios";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Kiểm tra nếu đã đăng nhập
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('accessToken');
      console.log('[LoginPage] Checking existing auth, token:', token ? 'exists' : 'none');
      
      if (token) {
        try {
          console.log('[LoginPage] Verifying token with backend...');
          const response = await axios.get(`${BACKEND_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          console.log('[LoginPage] Token valid, user:', response.data.email);
          router.replace('/dashboard');
          return;
        } catch (error) {
          console.log('[LoginPage] Token invalid or backend error:', error);
          if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
            console.log('[LoginPage] Backend is not running');
            setApiError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend đang chạy.');
            setIsCheckingAuth(false);
            return;
          }
          localStorage.removeItem('accessToken');
        }
      }
      
      console.log('[LoginPage] Showing login form');
      setIsCheckingAuth(false);
    };

    checkExistingAuth();
  }, [router]);

  const onSubmit = async (formData: LoginFormValues) => {
    setApiError(null);
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      const token = response.data?.access_token || response.data?.token;

      if (token) {
        console.log('[LoginPage] Login successful, saving token');
        localStorage.setItem('accessToken', token);
        
        // Verify token bằng cách gọi API user profile
        try {
          console.log('[LoginPage] Verifying new token...');
          await axios.get(`${BACKEND_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          // Token hợp lệ, chuyển đến dashboard
          console.log('[LoginPage] Token verified, redirecting to dashboard');
          router.replace('/dashboard');
        } catch (verifyError) {
          console.error("[LoginPage] Token verification failed:", verifyError);
          localStorage.removeItem('accessToken');
          setApiError("Xác thực thất bại. Vui lòng thử lại.");
        }
      } else {
        setApiError("Đăng nhập thành công nhưng không nhận được token xác thực.");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK' || !error.response) {
          setApiError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend đang chạy.");
        } else if (error.response) {
          const errorMessage = error.response.data?.message || "Email hoặc mật khẩu không đúng.";
          
          if (Array.isArray(errorMessage)) {
            setApiError(errorMessage.join('; '));
          } else {
            setApiError(errorMessage);
          }
        }
      } else {
        setApiError("Có lỗi xảy ra khi đăng nhập.");
      }
    }
  };

  // Hiển thị loading trong khi kiểm tra authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <p className="text-lg">Đang kiểm tra xác thực...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-12">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-3xl blur-3xl opacity-30"></div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGxlYXJuaW5nJTIwc2lnbiUyMGxhbmd1YWdlfGVufDF8fHx8MTc2MDEzMjE0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Học tập"
                className="w-full h-auto rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>

        <Card className="p-8 shadow-xl border-2">
          <div className="mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Hand className="w-6 h-6 text-white" />
              </div>
              <h2 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LearnBySign
              </h2>
            </button>
            <h1 className="mb-2">Đăng nhập</h1>
            <p className="text-muted-foreground">
              Chào mừng bạn quay trở lại! Vui lòng đăng nhập để tiếp tục.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="text-blue-600 hover:underline"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
