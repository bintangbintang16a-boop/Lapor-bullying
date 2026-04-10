import * as React from "react";
import { motion } from "motion/react";
import { Shield, User, UserCheck, Shield as ShieldIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { auth, db, googleProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

type Role = "admin" | "bk" | "siswa";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (selectedRole: Role) => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user with selected role for demo purposes
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: selectedRole,
          status: "Aktif",
          createdAt: serverTimestamp(),
        });
      }

      toast.success(`Berhasil masuk sebagai ${selectedRole === 'bk' ? 'Guru BK' : selectedRole}`);
      navigate("/app");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Gagal masuk. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-4">
            <Shield size={36} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">StopBully</h1>
          <p className="text-gray-500 font-medium">Sistem Pelaporan Bullying Sekolah</p>
        </div>

        <Card className="border-none shadow-2xl shadow-gray-200/50 overflow-hidden">
          <CardHeader className="space-y-1 pb-8 text-center bg-white">
            <CardTitle className="text-2xl font-bold">Selamat Datang</CardTitle>
            <CardDescription className="text-gray-500">
              Pilih peran Anda untuk masuk dengan Google
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-6">
            <Button 
              disabled={loading}
              onClick={() => handleLogin("siswa")}
              variant="outline" 
              className="h-14 text-base font-bold border-gray-100 hover:border-primary/50 hover:bg-primary/5 transition-all flex justify-start gap-4 px-6 rounded-xl group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <User size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Masuk sebagai Siswa</p>
                <p className="text-xs text-gray-500 font-medium">Melapor & pantau status</p>
              </div>
            </Button>

            <Button 
              disabled={loading}
              onClick={() => handleLogin("bk")}
              variant="outline" 
              className="h-14 text-base font-bold border-gray-100 hover:border-primary/50 hover:bg-primary/5 transition-all flex justify-start gap-4 px-6 rounded-xl group"
            >
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <UserCheck size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Masuk sebagai Guru BK</p>
                <p className="text-xs text-gray-500 font-medium">Kelola & tindak lanjut laporan</p>
              </div>
            </Button>

            <Button 
              disabled={loading}
              onClick={() => handleLogin("admin")}
              variant="outline" 
              className="h-14 text-base font-bold border-gray-100 hover:border-primary/50 hover:bg-primary/5 transition-all flex justify-start gap-4 px-6 rounded-xl group"
            >
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <ShieldIcon size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Masuk sebagai Admin</p>
                <p className="text-xs text-gray-500 font-medium">Monitoring & user management</p>
              </div>
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8">
            <p className="text-xs text-center text-gray-400 px-8">
              Gunakan email institusi sekolah untuk login resmi.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
