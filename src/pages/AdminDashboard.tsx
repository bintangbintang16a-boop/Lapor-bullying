import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BarChart3, 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  MapPin,
  Clock,
  Shield,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalReports: 0,
    activeCases: 0,
    totalUsers: 0,
    completionRate: 0,
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportsPath = "reports";
    const usersPath = "users";

    const unsubReports = onSnapshot(collection(db, reportsPath), (snapshot) => {
      const reports = snapshot.docs.map(doc => doc.data());
      const total = reports.length;
      const active = reports.filter(r => r.status !== "Selesai").length;
      const completed = reports.filter(r => r.status === "Selesai").length;
      
      setStats(prev => ({
        ...prev,
        totalReports: total,
        activeCases: active,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      }));

      setRecentReports(snapshot.docs.slice(0, 5).map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, reportsPath);
    });

    const unsubUsers = onSnapshot(collection(db, usersPath), (snapshot) => {
      setStats(prev => ({
        ...prev,
        totalUsers: snapshot.size,
      }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, usersPath);
    });

    return () => {
      unsubReports();
      unsubUsers();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Admin</h1>
          <p className="text-gray-500">Statistik dan monitoring sistem pelaporan bullying.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Calendar size={18} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-700">April 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Laporan" 
          value={stats.totalReports.toString()} 
          trend="+12%" 
          trendUp={true}
          icon={<FileText className="text-blue-600" size={24} />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="Kasus Aktif" 
          value={stats.activeCases.toString()} 
          trend="-5%" 
          trendUp={false}
          icon={<AlertTriangle className="text-amber-600" size={24} />} 
          color="bg-amber-50"
        />
        <StatCard 
          title="Total Pengguna" 
          value={stats.totalUsers.toString()} 
          trend="+3" 
          trendUp={true}
          icon={<Users className="text-purple-600" size={24} />} 
          color="bg-purple-50"
        />
        <StatCard 
          title="Tingkat Selesai" 
          value={`${stats.completionRate}%`} 
          trend="+4%" 
          trendUp={true}
          icon={<TrendingUp className="text-green-600" size={24} />} 
          color="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Laporan Terbaru</CardTitle>
            <CardDescription>Daftar laporan yang baru saja masuk ke sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center py-8 text-gray-500">Memuat data...</p>
              ) : recentReports.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Belum ada laporan masuk.</p>
              ) : (
                recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Shield className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{report.victimName}</p>
                        <p className="text-xs text-gray-500">{report.location} • {report.date}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white border-gray-100">{report.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Lokasi Rawan</CardTitle>
            <CardDescription>Lokasi dengan frekuensi laporan tertinggi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LocationItem name="Kantin Sekolah" count={12} percentage={45} />
            <LocationItem name="Lapangan Basket" count={8} percentage={30} />
            <LocationItem name="Belakang Sekolah" count={5} percentage={15} />
            <LocationItem name="Toilet Lantai 2" count={3} percentage={10} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, icon, color }: any) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </div>
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      </CardContent>
    </Card>
  );
}

function LocationItem({ name, count, percentage }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-700">{name}</span>
        </div>
        <span className="text-xs font-bold text-gray-400">{count} Kasus</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1 }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </div>
  );
}
