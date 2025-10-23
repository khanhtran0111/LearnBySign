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
            <span className="text-sm text-blue-700">Học ngoại ngữ qua ký hiệu</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Học ngoại ngữ thú vị cho{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              trẻ em khiếm thính
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            LearnBySign là nền tảng học ngoại ngữ đặc biệt dành cho trẻ em khiếm thính tại Việt Nam. 
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-3xl blur-3xl opacity-30"></div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGxlYXJuaW5nJTIwc2lnbiUyMGxhbmd1YWdlfGVufDF8fHx8MTc2MDEzMjE0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Trẻ em học ngôn ngữ ký hiệu"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
