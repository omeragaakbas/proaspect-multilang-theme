import React from "react";
import { Header } from "@/components/Layout/Header";
import { HeroSection } from "@/components/Hero/HeroSection";
import { Footer } from "@/components/Footer/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
