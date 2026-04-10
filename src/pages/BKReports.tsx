import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, MoreVertical, Eye, CheckCircle2, Clock, AlertCircle, MessageSquare, ShieldAlert, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

type ReportStatus = "Laporan Diterima" | "Sedang Diproses" | "Selesai";

interface Report {
  id: string;
  date: string;
  victimName: string;
  location: string;
  status: ReportStatus;
  priority: string;
  reporterName: string;
  isAnonymous: boolean;
  createdAt: any;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Selesai":
      return (
        <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-100 flex w-fit gap-1.5 px-3 py-1">
          <CheckCircle2 size={14} /> {status}
        </Badge>
      );
    case "Sedang Diproses":
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 flex w-fit gap-1.5 px-3 py-1">
          <Clock size={14} /> {status}
        </Badge>
      );
    default:
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 flex w-fit gap-1.5 px-3 py-1">
          <AlertCircle size={14} /> {status}
        </Badge>
      );
  }
}

export default function BKReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const path = "reports";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (reportId: string, newStatus: ReportStatus) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`Status laporan diperbarui menjadi ${newStatus}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
    }
  };

  const filteredReports = reports.filter(report => 
    report.victimName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reporterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "Laporan Diterima").length,
    processing: reports.filter(r => r.status === "Sedang Diproses").length,
    completed: reports.filter(r => r.status === "Selesai").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Daftar Laporan Bullying</h1>
          <p className="text-gray-500">Kelola dan tindak lanjuti laporan bullying dari siswa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Laporan" value={stats.total.toString()} icon={<MessageSquare size={20} />} color="blue" />
        <StatCard title="Laporan Baru" value={stats.pending.toString()} icon={<AlertCircle size={20} />} color="amber" />
        <StatCard title="Sedang Diproses" value={stats.processing.toString()} icon={<Clock size={20} />} color="blue" />
        <StatCard title="Selesai" value={stats.completed.toString()} icon={<CheckCircle size={20} />} color="green" />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-white">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <Input 
                placeholder="Cari berdasarkan korban, pelapor, atau ID..." 
                className="pl-10 bg-gray-50 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex gap-2">
              <Filter size={18} /> Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">ID Laporan</th>
                  <th className="px-6 py-4">Pelapor</th>
                  <th className="px-6 py-4">Korban</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Memuat data...</td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Belum ada laporan masuk.</td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-900 text-xs font-mono">#{report.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${report.isAnonymous ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                            {report.isAnonymous ? '?' : report.reporterName?.[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{report.reporterName}</span>
                            {report.isAnonymous && <span className="text-[10px] text-amber-600 font-bold uppercase">Anonim</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{report.victimName}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{report.date}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900">
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-gray-100 shadow-xl">
                            <DropdownMenuItem className="flex gap-2 py-2.5">
                              <Eye size={16} /> Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => updateStatus(report.id, "Sedang Diproses")}
                              className="flex gap-2 py-2.5 text-amber-600"
                            >
                              <Clock size={16} /> Proses Laporan
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateStatus(report.id, "Selesai")}
                              className="flex gap-2 py-2.5 text-green-600"
                            >
                              <CheckCircle size={16} /> Selesaikan Laporan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex gap-2 py-2.5 text-destructive">
                              <ShieldAlert size={16} /> Tandai Mendesak
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  }[color as keyof typeof colorClasses] || "bg-gray-50 text-gray-600";

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
