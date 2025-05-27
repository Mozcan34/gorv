import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import TaskList from "@/components/task-list";
import TaskForm from "@/components/task-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, X, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface TaskStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append("search", searchQuery);
  if (statusFilter && statusFilter !== "all") queryParams.append("status", statusFilter);
  if (priorityFilter && priorityFilter !== "all") queryParams.append("priority", priorityFilter);
  const queryString = queryParams.toString();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", queryString],
  });

  const { data: stats } = useQuery<TaskStats>({
    queryKey: ["/api/tasks/stats"],
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open": return "Açık";
      case "progress": return "Devam Eden";
      case "completed": return "Tamamlandı";
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low": return "Düşük";
      case "medium": return "Orta";
      case "high": return "Yüksek";
      default: return priority;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="flex">
        <Sidebar />
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        
        <main className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">İş Listesi</h2>
                  <p className="mt-1 text-sm text-gray-600">Tüm işlerinizi buradan yönetebilirsiniz</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-blue-700 text-white shadow-lg">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni İş Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Yeni İş Ekle</DialogTitle>
                      </DialogHeader>
                      <TaskForm onSuccess={() => setIsModalOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <Card className="mb-6 shadow-md">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="İş ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm Durumlar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      <SelectItem value="open">Açık</SelectItem>
                      <SelectItem value="progress">Devam Eden</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tüm Öncelikler" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Öncelikler</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="low">Düşük</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Filtreleri Temizle
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-blue-100 rounded-lg p-3">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Toplam İş</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-orange-100 rounded-lg p-3">
                          <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Devam Eden</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-green-100 rounded-lg p-3">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-red-100 rounded-lg p-3">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Geciken</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.overdue}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Task List */}
            <TaskList 
              tasks={tasks} 
              isLoading={tasksLoading}
              getStatusText={getStatusText}
              getPriorityText={getPriorityText}
            />
          </div>
        </main>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="rounded-full w-14 h-14 bg-primary hover:bg-blue-700 shadow-lg"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni İş Ekle</DialogTitle>
            </DialogHeader>
            <TaskForm onSuccess={() => setIsModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
