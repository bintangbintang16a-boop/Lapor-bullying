import * as React from "react";
import { motion } from "motion/react";
import { Shield, Lock, Clock, CheckCircle, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Shield size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">StopBully</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="font-medium">Masuk</Button>
          </Link>
          <Link to="/login">
            <Button className="font-medium shadow-lg shadow-primary/20">Lapor Sekarang</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-primary text-sm font-semibold mb-6">
            <AlertTriangle size={16} />
            <span>Lindungi Diri & Temanmu</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.1]">
            Suarakan Kebenaran,<br />
            <span className="text-primary">Hentikan Bullying.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sistem pelaporan bullying sekolah yang aman, rahasia, dan terpercaya. 
            Bantu kami menciptakan lingkungan sekolah yang aman untuk semua siswa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-xl shadow-primary/25">
                Mulai Melapor <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Menggunakan StopBully?</h2>
            <p className="text-gray-600">Kami berkomitmen untuk memberikan perlindungan terbaik bagi setiap pelapor.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Lock className="text-primary" size={32} />}
              title="100% Rahasia"
              description="Identitas pelapor dilindungi sepenuhnya. Kamu bisa memilih untuk melapor secara anonim."
            />
            <FeatureCard 
              icon={<Clock className="text-primary" size={32} />}
              title="Penanganan Cepat"
              description="Laporan langsung diterima oleh Guru BK dan Admin untuk segera ditindaklanjuti."
            />
            <FeatureCard 
              icon={<CheckCircle className="text-primary" size={32} />}
              title="Terpantau"
              description="Pantau status laporanmu secara real-time hingga kasus benar-benar terselesaikan."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="text-primary" size={24} />
            <span className="text-lg font-bold text-gray-900">StopBully</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Sistem Pelaporan Bullying Sekolah. Semua hak dilindungi.</p>
          <div className="flex gap-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-primary transition-colors">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all"
    >
      <div className="mb-6 p-3 bg-blue-50 w-fit rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
