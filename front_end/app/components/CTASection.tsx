import { Button } from "./ui/button";
import { ImageWithFallback } from "./fallback/ImageWithFallback";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="p-8 md:p-12 text-white">
            <h2 className="text-white mb-4">
              Sẵn sàng bắt đầu hành trình học tập?
            </h2>
            <p className="text-white/90 mb-6">
              Tham gia cùng LearnBySign để giúp các em phát triển 
              kỹ năng ngôn ngữ một cách hiệu quả và vui vẻ.
            </p>
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Đăng ký ngay
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          <div className="hidden md:block h-full">
            <ImageWithFallback
              src="/images/footer.png"
              alt="Trẻ em học tập"
              className="w-full h-90 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
