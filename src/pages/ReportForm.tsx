import * as React from "react";
import { useState } from "react";
import { motion } from "motion/react";
import { Send, Camera, Calendar as CalendarIcon, MapPin, User, UserX, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ReportForm() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const victimName = formData.get("victimName") as string;
    const perpetratorName = formData.get("perpetratorName") as string;
    const location = formData.get("location") as string;
    const date = formData.get("date") as string;
    const description = formData.get("description") as string;
    const reporterName = formData.get("reporterName") as string;

    try {
      const path = "reports";
      await addDoc(collection(db, path), {
        reporterUid: isAnonymous ? null : auth.currentUser?.uid,
        reporterName: isAnonymous ? "Anonim" : (reporterName || auth.currentUser?.displayName),
        isAnonymous,
        victimName,
        perpetratorName: perpetratorName || "Tidak Diketahui",
        location,
        date,
        description,
        status: "Laporan Diterima",
        priority: "Sedang",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Laporan berhasil dikirim. Guru BK akan segera meninjau.");
      navigate("/app/riwayat");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "reports");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Buat Laporan Bullying</h1>
          <p className="text-gray-500">Sampaikan kejadian yang kamu alami atau lihat dengan jujur dan detail.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User size={20} className="text-primary" />
                Informasi Pelapor
              </CardTitle>
              <CardDescription>
                Identitasmu akan dilindungi. Kamu bisa memilih untuk melapor secara anonim.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Checkbox 
                  id="anonymous" 
                  checked={isAnonymous} 
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                />
                <label
                  htmlFor="anonymous"
                  className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary flex items-center gap-2 cursor-pointer"
                >
                  <UserX size={16} />
                  Lapor secara Anonim (Sembunyikan namaku)
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid gap-2">
                  <Label htmlFor="reporterName">Nama Lengkap</Label>
                  <Input id="reporterName" name="reporterName" placeholder="Masukkan nama lengkapmu" defaultValue={auth.currentUser?.displayName || ""} required />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info size={20} className="text-primary" />
                Detail Kejadian
              </CardTitle>
              <CardDescription>
                Berikan informasi sedetail mungkin untuk memudahkan proses tindak lanjut.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="victimName">Nama Korban</Label>
                  <Input id="victimName" name="victimName" placeholder="Siapa yang menjadi korban?" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="perpetratorName">Nama Pelaku (Jika diketahui)</Label>
                  <Input id="perpetratorName" name="perpetratorName" placeholder="Siapa pelakunya?" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Lokasi Kejadian</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <Input id="location" name="location" className="pl-10" placeholder="Contoh: Kantin, Lapangan" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Tanggal Kejadian</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                    <Input id="date" name="date" type="date" className="pl-10" required />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi Kejadian</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Ceritakan apa yang terjadi secara detail..." 
                  className="min-h-[150px] resize-none"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Unggah Bukti (Foto / Screenshot)</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <Camera size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">Klik untuk unggah atau seret file ke sini</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" size="lg" className="px-8" onClick={() => navigate("/app")}>Batal</Button>
            <Button type="submit" size="lg" className="px-8 shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? "Mengirim..." : (
                <>
                  Kirim Laporan <Send className="ml-2" size={18} />
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

