import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import WhyUsSection from "@/components/WhyUsSection";
import TeamSection from "@/components/TeamSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import EmergencySection from "@/components/EmergencySection";
import ReservationSection from "@/components/ReservationSection";
import ChatbotWidget from "@/components/ChatbotWidget";
import Footer from "@/components/Footer";

const singleSections = ["emergency"];

const Index = () => {
  const [showSection, setShowSection] = useState<string | null>(null);
  const [scrollToId, setScrollToId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const isSingle = singleSections.includes(hash);
      setShowSection(isSingle ? hash : null);
      if (!isSingle && hash) setScrollToId(hash);
      else if (!hash) setScrollToId(null);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (scrollToId) {
      setTimeout(() => {
        const el = document.getElementById(scrollToId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [scrollToId]);

  if (showSection === "emergency") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <EmergencySection />
        <ChatbotWidget />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <BeforeAfterSection />
      <WhyUsSection />
      <TeamSection />
      <TestimonialsSection />
      <ReservationSection />
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default Index;
