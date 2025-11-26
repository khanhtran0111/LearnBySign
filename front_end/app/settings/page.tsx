"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import { ImageCropper } from "../components/ImageCropper";

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  birthDate?: string;
  avatarUrl?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [croppedAvatar, setCroppedAvatar] = useState<string | null>(null);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/");
      return;
    }

    const loadUserData = async () => {
      try {
        const response = await fetch("http://localhost:3001/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user");
        const userData = await response.json();
        setUser(userData);
        setFullName(userData.fullName || "");
        setPhone(userData.phone || "");
        setBirthDate(userData.birthDate || "");
        setAvatarUrl(userData.avatarUrl || "");
        setCroppedAvatar(null);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setSaving(true);
    try {
      let finalAvatarUrl = avatarUrl;

      if (croppedAvatar) {
        const blob = await fetch(croppedAvatar).then(r => r.blob());
        const formData = new FormData();
        formData.append('file', blob, 'avatar.jpg');

        const uploadResponse = await fetch("http://localhost:3001/media/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          finalAvatarUrl = uploadData.url;
        }
      }

      const payload = {
        fullName,
        phone,
        birthDate,
        avatarUrl: finalAvatarUrl,
      };
      
      console.log("Sending update:", payload);

      const response = await fetch("http://localhost:3001/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      
      if (response.ok) {
        const updatedUser = await response.json();
        console.log("Updated user:", updatedUser);
        setUser(updatedUser);
        setFullName(updatedUser.fullName || "");
        setPhone(updatedUser.phone || "");
        setBirthDate(updatedUser.birthDate || "");
        setAvatarUrl(updatedUser.avatarUrl || "");
        setCroppedAvatar(null);
        alert("Cập nhật thông tin thành công!");
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert(`Cập nhật thất bại: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Đã xảy ra lỗi!");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (!currentPassword || !newPassword) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (newPassword.length < 8) {
      alert("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("http://localhost:3001/users/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        alert("Đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        const error = await response.json();
        alert(error.message || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Đã xảy ra lỗi!");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại Dashboard
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="mt-2 bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Ngày sinh</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="avatarUrl">Avatar</Label>
                
                <div className="mt-3 flex items-start gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={croppedAvatar || avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                      {fullName.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <ImageCropper onImageCropped={(url) => setCroppedAvatar(url)} />
                    
                    <div className="text-sm text-gray-500">
                      Hoặc nhập URL ảnh:
                    </div>
                    <Input
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => {
                        setAvatarUrl(e.target.value);
                        setCroppedAvatar(null);
                      }}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <div className="relative mt-2">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative mt-2">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={saving}
                className="w-full"
                variant="destructive"
              >
                {saving ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
