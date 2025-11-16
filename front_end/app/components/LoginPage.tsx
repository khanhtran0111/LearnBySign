"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Hand, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./fallback/ImageWithFallback";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginPageProps {
  onBackToHome: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export function LoginPage({ onBackToHome, onSwitchToRegister, onLoginSuccess }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (formData: LoginFormValues) => {
    // Simulate API call
    setApiError(null);
    try {
      // Gọi API POST đến endpoint đăng nhập của Nest.js
      const response = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      // Nest.js thường trả về JWT trong trường access_token hoặc token
      const token = response.data?.access_token || response.data?.token;

      if (token) {
        // 3. Lưu Token vào localStorage hoặc Cookies
        localStorage.setItem('accessToken', token); 
        console.log("Đăng nhập thành công, Token đã lưu:", token);
        onLoginSuccess(); // Chuyển hướng
      } else {
        // Xử lý nếu API thành công nhưng không trả về token (trường hợp hiếm)
        setApiError("Đăng nhập thành công nhưng không nhận được token xác thực.");
      }

    } catch (error) {
      // 4. Xử lý lỗi từ API
      console.error("Lỗi đăng nhập:", error);

      if (axios.isAxiosError(error) && error.response) {
        // Lỗi 401 Unauthorized (sai email/mật khẩu)
        const errorMessage = error.response.data?.message || "Email hoặc mật khẩu không đúng.";
        
        if (Array.isArray(errorMessage)) {
           setApiError(errorMessage.join('; '));
        } else {
           setApiError(errorMessage);
        }
        
      } else {
        setApiError("Không thể kết nối đến máy chủ.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-12">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Illustration */}
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

        {/* Right side - Login Form */}
        <Card className="p-8 shadow-xl border-2">
          <div className="mb-8">
            <button
              onClick={onBackToHome}
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
                  onClick={onSwitchToRegister}
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
