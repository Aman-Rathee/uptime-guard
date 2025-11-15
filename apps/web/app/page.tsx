import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import Footer from "@/components/footer";


export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0C0F] text-gray-200">
      <Navbar />
      <HeroSection />
      <Footer />
    </main>
  );
}
