import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, UserPlus, MoreVertical, Edit2, Trash2, Shield, User, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "bk" | "siswa";
  status: "Aktif" | "Nonaktif";
  createdAt: any;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const path = "users";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  const toggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const userRef = doc(db, "users", userId);
      const newStatus = currentStatus === "Aktif" ? "Nonaktif" : "Aktif";
      await updateDoc(userRef, { status: newStatus });
      toast.success(`Status user berhasil diubah menjadi ${newStatus}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      toast.success("User berhasil dihapus");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500">Kelola akses dan data pengguna sistem StopBully.</p>
        </div>
        <Button className="shadow-lg shadow-primary/20 h-12 px-6 font-bold">
          <UserPlus className="mr-2" size={18} /> Tambah User Baru
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold">Semua Pengguna</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <Input 
                placeholder="Cari nama atau email..." 
                className="pl-10 bg-gray-50 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Memuat data...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Tidak ada user ditemukan.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-gray-100">
                            <AvatarImage src={`https://picsum.photos/seed/${user.id}/200`} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={user.status === 'Aktif' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900">
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-gray-100 shadow-xl">
                            <DropdownMenuItem className="flex gap-2 py-2.5">
                              <Edit2 size={16} /> Edit Data
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toggleStatus(user.id, user.status)}
                              className="flex gap-2 py-2.5"
                            >
                              {user.status === 'Aktif' ? <UserX size={16} /> : <UserCheck size={16} />}
                              {user.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => deleteUser(user.id)}
                              className="flex gap-2 py-2.5 text-destructive"
                            >
                              <Trash2 size={16} /> Hapus User
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

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "admin":
      return (
        <Badge className="bg-purple-50 text-purple-700 border-purple-100 flex w-fit gap-1.5 px-3 py-1">
          <Shield size={14} /> Admin
        </Badge>
      );
    case "bk":
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-100 flex w-fit gap-1.5 px-3 py-1">
          <UserCheck size={14} /> Guru BK
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-50 text-gray-700 border-gray-100 flex w-fit gap-1.5 px-3 py-1">
          <User size={14} /> Siswa
        </Badge>
      );
  }
}
