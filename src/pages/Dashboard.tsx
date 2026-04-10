import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Shield, Send, History, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const path = "reports";
    const q = query(collection(db, path), where("reporterUid", "==", auth.currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => doc.data());
      setStats({
        total: reports.length,
        pending: reports.filter(r => r.status === "Laporan Diterima").length,
        completed: reports.filter(r => r.status === "Selesai").length,
      });
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Halo, {auth.currentUser?.displayName || "Siswa"}! 👋</h1>
          <p className="text-gray-500">Selamat datang di Sistem Pelaporan Bullying Sekolah.</p>
        </div>
        <Link to="/app/lapor">
          <Button size="lg" className="shadow-lg shadow-primary/20 h-12 px-6 font-bold">
            <Send className="mr-2" size={18} /> Buat Laporan Baru
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Laporanmu" 
          value={stats.total.toString()} 
          icon={<History className="text-blue-600" size={24} />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="Sedang Diproses" 
          value={stats.pending.toString()} 
          icon={<AlertCircle className="text-amber-600" size={24} />} 
          color="bg-amber-50"
        />
        <StatCard 
          title="Selesai" 
          value={stats.completed.toString()} 
          icon={<Shield className="text-green-600" size={24} />} 
          color="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link to="/app/lapor">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Send size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Laporkan Kejadian</h3>
                  <p className="text-sm text-gray-500">Kirim laporan baru secara aman dan rahasia.</p>
                </div>
              </div>
            </Link>
            <Link to="/app/riwayat">
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-primary group-hover:text-white transition-all">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Lihat Riwayat</h3>
                  <p className="text-sm text-gray-500">Pantau status laporan yang telah kamu kirim.</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-none bg-primary text-white shadow-xl shadow-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Shield size={160} />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Tahukah Kamu?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <p className="text-blue-100 leading-relaxed">
              Bullying bukan hanya kekerasan fisik. Kata-kata kasar, pengucilan, dan ejekan di media sosial juga termasuk bullying.
            </p>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <h4 className="font-bold mb-1 flex items-center gap-2">
                <AlertCircle size={18} /> Ingat!
              </h4>
              <p className="text-sm text-blue-50">Identitasmu dilindungi 100%. Jangan takut untuk bersuara demi kebaikan bersama.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
