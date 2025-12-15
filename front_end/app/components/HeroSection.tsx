import { Button } from "./ui/button";
import { ImageWithFallback } from "./fallback/ImageWithFallback";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">Học ngôn ngữ qua ký hiệu</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Học ngôn ngữ thú vị cho{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              trẻ em khiếm thính
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            LearnBySign là nền tảng học ngôn ngữ đặc biệt dành cho trẻ em khiếm thính tại Việt Nam. 
            Chúng tôi sử dụng hình ảnh sinh động, ký hiệu trực quan và phương pháp giảng dạy tương tác 
            để giúp các em học tập hiệu quả và vui vẻ.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Bắt đầu ngay
            </Button>
            <Button size="lg" variant="outline">
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden">
            <ImageWithFallback
              src="/images/herosection.png"
              alt="Trẻ em học ngôn ngữ ký hiệu"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
