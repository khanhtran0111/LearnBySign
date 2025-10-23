import { FeatureCard } from "./FeatureCard";
import { Image, Hand, Gamepad2, BookOpen, Award, Users } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Image,
      title: "Học qua hình ảnh",
      description: "Sử dụng hình ảnh sinh động, màu sắc tươi sáng giúp trẻ dễ dàng ghi nhớ từ vựng và cấu trúc câu.",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: Hand,
      title: "Ký hiệu trực quan",
      description: "Kết hợp ngôn ngữ ký hiệu với học ngoại ngữ, giúp trẻ khiếm thính tiếp cận kiến thức một cách tự nhiên.",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      icon: Gamepad2,
      title: "Học qua trò chơi",
      description: "Các trò chơi tương tác vui nhộn giúp trẻ học mà không cảm thấy nhàm chán, luôn hứng thú với bài học.",
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      icon: BookOpen,
      title: "Bài học đa dạng",
      description: "Chương trình học được thiết kế phù hợp với từng độ tuổi và trình độ của trẻ em.",
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      icon: Award,
      title: "Theo dõi tiến trình",
      description: "Phụ huynh và giáo viên có thể theo dõi quá trình học tập của trẻ một cách chi tiết.",
      color: "bg-gradient-to-br from-pink-500 to-pink-600"
    },
    {
      icon: Users,
      title: "Cộng đồng hỗ trợ",
      description: "Kết nối với cộng đồng phụ huynh và giáo viên, chia sẻ kinh nghiệm và hỗ trợ lẫn nhau.",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <section className="container mx-auto px-4 py-16 bg-gradient-to-b from-white to-blue-50/30">
      <div className="text-center mb-12">
        <h2 className="mb-4">Tính năng nổi bật</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          LearnBySign cung cấp những công cụ và phương pháp học tập hiện đại, 
          được thiết kế đặc biệt cho trẻ em khiếm thính
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            color={feature.color}
          />
        ))}
      </div>
    </section>
  );
}
