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
              Tham gia cùng hàng nghìn gia đình đã tin tưởng LearnBySign để giúp con em họ 
              phát triển kỹ năng ngoại ngữ một cách hiệu quả và vui vẻ.
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
              src="https://images.unsplash.com/photo-1539893867126-7ce0b48971ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGVkdWNhdGlvbiUyMGtpZHN8ZW58MXx8fHwxNzYwMDQzMTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Trẻ em học tập"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
