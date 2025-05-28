// src/components/TaskList.tsx
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { type Task } from "@shared/schema"; // Task tip tanımınızın doğru olduğundan emin olun
import { apiRequest } from "@/lib/queryClient"; // Güncellenmiş apiRequest'i kullanıyoruz
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import TaskForm from "./task-form"; // TaskForm bileşeni
import { useToast } from "@/hooks/use-toast"; // Toast bildirimleri
import { Edit, Trash2 } from "lucide-react";

// TaskListProps kaldırıldı, çünkü veriyi içeride useQuery ile çekeceğiz

export default function TaskList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null); // UUID'ler string olduğu için

  // Görevleri çekmek için useQuery
  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["tasks"], // Sorgu anahtarı
    queryFn: async () => {
      const response = await apiRequest("GET", "/"); // Apps Script'ten GET isteği
      const rawTasks = await response.json(); // Gelen JSON verisi

      // Gelen veriyi Task tipine dönüştürürken Apps Script'ten gelen özel durumları işle
      return rawTasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description || '', // Açıklama boş gelebilir
        // Apps Script'ten 'TRUE'/'FALSE' stringi olarak gelebilir, boolean'a çevir
        isCompleted: String(task.isCompleted).toUpperCase() === 'TRUE',
        dueDate: task.dueDate ? new Date(task.dueDate) : null, // Tarihleri Date objesine çevir
        status: task.status || 'open', // Varsayılan durum
        priority: task.priority || 'medium', // Varsayılan öncelik
        createdAt: task.createdAt ? new Date(task.createdAt) : null,
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : null,
      })) as Task[];
    },
    // Hata durumunda yeniden deneme ayarları
    retry: 3, // 3 kez dene
    retryDelay: 1000, // 1 saniye bekle
  });

  // Görev silme işlemi için useMutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // DELETE isteğini Apps Script'e POST olarak gönderiyoruz, payload içinde id ile
      const response = await apiRequest("DELETE", "/", { id: id });
      return response.json(); // Apps Script'ten gelen yanıtı döndür
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] }); // Görev listesini yeniden çek
      queryClient.invalidateQueries({ queryKey: ["tasks", "stats"] }); // İstatistikleri de güncelleyebiliriz
      toast({
        title: "Başarılı",
        description: "İş başarıyla silindi.",
      });
      setDeletingTaskId(null); // Silme onay penceresini kapat
    },
    onError: (err) => {
      console.error("İş silinirken hata:", err);
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "İş silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Durum ve Öncelik için metin ve renk yardımcıları (varsa projenizin genelinde bunlar ayrı bir util dosyasından gelmeli)
  const getStatusText = (status: string) => {
    switch (status) {
      case "open": return "Açık";
      case "progress": return "Devam Eden";
      case "completed": return "Tamamlandı";
      default: return "Bilinmiyor";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high": return "Yüksek";
      case "medium": return "Orta";
      case "low": return "Düşük";
      default: return "Bilinmiyor";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open": return "secondary";
      case "progress": return "default";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("tr-TR"); // Yerel tarih formatı
  };

  // Yükleme durumu
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>İş Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>İş Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Veriler yüklenirken bir hata oluştu: {error.message}</p>
            <p className="text-sm text-gray-400 mt-2">Lütfen Apps Script dağıtımınızı ve URL'nizi kontrol edin.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Görev yoksa
  if (!tasks || tasks.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>İş Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Henüz iş eklenmemiş.</p>
            <p className="text-sm text-gray-400 mt-2">Yeni bir iş ekleyerek başlayın.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Görevler varsa listele
  return (
    <>
      <Card className="shadow-md overflow-hidden">
        <CardHeader>
          <CardTitle>İş Listesi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>İş</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Öncelik</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(task.status)} className="text-xs">
                        {getStatusText(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs">
                        {getPriorityText(task.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {formatDate(task.dueDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTask(task)}
                          className="text-primary hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingTaskId(task.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>İş Düzenle</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              task={editingTask}
              onSuccess={() => setEditingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <AlertDialog open={!!deletingTaskId} onOpenChange={() => setDeletingTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İşi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingTaskId) {
                  deleteMutation.mutate(deletingTaskId);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}