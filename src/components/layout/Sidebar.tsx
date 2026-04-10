import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Send, 
  History, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Shield,
  BarChart3,
  UserCog,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role: "admin" | "bk" | "siswa";
}

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();

  const menuItems = {
    siswa: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/app" },
      { icon: Send, label: "Buat Laporan", path: "/app/lapor" },
      { icon: History, label: "Riwayat Laporan", path: "/app/riwayat" },
    ],
    bk: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/app" },
      { icon: FileText, label: "Laporan Bullying", path: "/app/laporan" },
      { icon: MessageSquare, label: "Tindak Lanjut", path: "/app/tindak-lanjut" },
      { icon: BarChart3, label: "Rekap Laporan", path: "/app/rekap" },
    ],
    admin: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/app" },
      { icon: FileText, label: "Laporan Bullying", path: "/app/laporan" },
      { icon: BarChart3, label: "Rekap Laporan", path: "/app/rekap" },
      { icon: Users, label: "Data Siswa", path: "/app/siswa" },
      { icon: UserCog, label: "User Management", path: "/app/users" },
      { icon: Settings, label: "Kategori", path: "/app/kategori" },
    ],
  };

  const currentMenu = menuItems[role];

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Shield size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">StopBully</span>
        </div>

        <nav className="space-y-1">
          {currentMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                location.pathname === item.path
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-50">
        <div className="p-4 bg-gray-50 rounded-2xl mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Role Anda</p>
          <p className="text-sm font-bold text-gray-900 capitalize">{role === 'bk' ? 'Guru BK' : role}</p>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/5 font-bold h-12 rounded-xl"
        >
          <LogOut size={20} />
          Keluar
        </Button>
      </div>
    </div>
  );
}
