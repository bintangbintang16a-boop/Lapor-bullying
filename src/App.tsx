import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, createContext, useContext, useEffect, ReactNode } from "react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BKReports from "./pages/BKReports";
import ReportForm from "./pages/ReportForm";
import ReportHistory from "./pages/ReportHistory";
import AdminUserManagement from "./pages/AdminUserManagement";
import Sidebar from "./components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Shield, LogOut, User, Bell, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth, db, FirebaseUser } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

type Role = "admin" | "bk" | "siswa";

interface AuthContextType {
  role: Role;
  user: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<Role>("siswa");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Listen to user document for role
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setRole(docSnap.data().role as Role);
          } else {
            // Default role if doc doesn't exist yet
            setRole("siswa");
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setRole("siswa");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ role, user, loading, logout }}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const { role, user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/app") return "Dashboard";
    if (path === "/app/lapor") return "Buat Laporan";
    if (path === "/app/riwayat") return "Riwayat Laporan";
    if (path === "/app/laporan") return "Daftar Laporan";
    if (path === "/app/users") return "User Management";
    return "Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{getPageTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
            </Button>
            
            <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-4 h-12 rounded-xl hover:bg-gray-50">
                  <Avatar className="h-8 w-8 border border-gray-100">
                    <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${role}/200`} />
                    <AvatarFallback>{user?.displayName?.[0] || role[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-bold text-gray-900 leading-none capitalize">{user?.displayName || (role === 'bk' ? 'Guru BK' : role)}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-xl border-gray-100 shadow-xl">
                <DropdownMenuLabel className="font-bold">Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg py-2 font-medium">
                  <User className="mr-2 h-4 w-4" /> Profil
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={logout}
                  className="rounded-lg py-2 font-medium text-destructive hover:text-destructive hover:bg-destructive/5"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={
              role === "admin" ? <AdminDashboard /> : 
              role === "bk" ? <BKReports /> : 
              <Dashboard />
            } />
            {role === "siswa" && (
              <>
                <Route path="/lapor" element={<ReportForm />} />
                <Route path="/riwayat" element={<ReportHistory />} />
              </>
            )}
            {role === "bk" && (
              <>
                <Route path="/laporan" element={<BKReports />} />
                <Route path="/tindak-lanjut" element={<div>Tindak Lanjut Content</div>} />
                <Route path="/rekap" element={<div>Rekap Laporan Content</div>} />
              </>
            )}
            {role === "admin" && (
              <>
                <Route path="/laporan" element={<BKReports />} />
                <Route path="/users" element={<AdminUserManagement />} />
                <Route path="/siswa" element={<div>Data Siswa Content</div>} />
                <Route path="/rekap" element={<div>Rekap Laporan Content</div>} />
                <Route path="/kategori" element={<div>Kategori Bullying Content</div>} />
              </>
            )}
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}




