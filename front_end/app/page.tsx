"use client";
import "./globals.css";
import { useState } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { DashboardPage } from "./components/DashboardPage";

type Page = "home" | "login" | "register" | "dashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const handleLoginClick = () => {
    setCurrentPage("login");
  };

  const handleRegisterClick = () => {
    setCurrentPage("register");
  };

  const handleGetStarted = () => {
    setCurrentPage("register");
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
  };

  const handleSwitchToLogin = () => {
    setCurrentPage("login");
  };

  const handleSwitchToRegister = () => {
    setCurrentPage("register");
  };

  const handleLoginSuccess = () => {
    setCurrentPage("dashboard");
  };

  const handleRegisterSuccess = () => {
           setCurrentPage("login");
  };

  const handleSignOut = () => {
    setCurrentPage("home");
  };

  if (currentPage === "dashboard") {
    return <DashboardPage onSignOut={handleSignOut} />;
  }

  if (currentPage === "login") {
    return (
      <LoginPage
        onBackToHome={handleBackToHome}
        onSwitchToRegister={handleSwitchToRegister}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <RegisterPage
        onBackToHome={handleBackToHome}
        onSwitchToLogin={handleSwitchToLogin}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

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
