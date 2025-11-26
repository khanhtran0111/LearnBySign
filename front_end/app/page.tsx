"use client";

import "./globals.css";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleRegisterClick = () => {
    router.push("/register");
  };

  const handleGetStarted = () => {
    router.push("/register");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      <main className="flex-1">
        <HeroSection onGetStarted={handleGetStarted} />
        <FeaturesSection />
        <CTASection onGetStarted={handleGetStarted} />
      </main>
      <Footer />
    </div>
  );
}
