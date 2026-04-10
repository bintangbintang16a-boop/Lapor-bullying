import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Filter, MoreVertical, Eye, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

type ReportStatus = "Laporan Diterima" | "Sedang Diproses" | "Selesai";

interface Report {
  id: string;
  date: string;
  victimName: string;
  location: string;
  status: ReportStatus;
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

export default function ReportHistory() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const path = "reports";
    const q = query(
      collection(db, path),
      where("reporterUid", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

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

  const filteredReports = reports.filter(report => 
    report.victimName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Riwayat Laporan</h1>
            <p className="text-gray-500">Pantau perkembangan laporan yang telah kamu kirimkan.</p>
          </div>
          <Button onClick={() => navigate("/app/lapor")} className="shadow-lg shadow-primary/20">Buat Laporan Baru</Button>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-white">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <Input 
                  placeholder="Cari laporan..." 
                  className="pl-10 bg-gray-50 border-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex gap-2">
                  <Filter size={18} /> Filter
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                    <th className="px-6 py-4">ID Laporan</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Korban</th>
                    <th className="px-6 py-4">Lokasi</th>
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
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Belum ada riwayat laporan.</td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-gray-900 text-xs font-mono">#{report.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{report.date}</td>
                        <td className="px-6 py-4 text-gray-900 font-medium">{report.victimName}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{report.location}</td>
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
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem className="flex gap-2">
                                <Eye size={16} /> Lihat Detail
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
      </motion.div>
    </div>
  );
}
