// src/components/TaskForm.tsx
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { taskFormSchema, type TaskFormData, type Task } from "@shared/schema"; // Şema ve tipler
import { apiRequest } from "@/lib/queryClient"; // apiRequest'i kullanıyoruz
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast"; // Toast bildirimleri
import { Save } from "lucide-react";

interface TaskFormProps {
  task?: Task; // Düzenlenecek görev (opsiyonel)
  onSuccess?: () => void; // İşlem başarılı olduğunda çağrılacak callback
}

export default function TaskForm({ task, onSuccess }: TaskFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "open",
      priority: task?.priority || "medium",
      dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
    },
  });

  // Düzenleme modunda formun varsayılan değerlerini güncellemek için useEffect
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "open",
        priority: task.priority || "medium",
        // dueDate'i Date objesine çevirerek veya undefined olarak ayarla
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      });
    } else {
      // Yeni görev formu için sıfırla
      form.reset({
        title: "",
        description: "",
        status: "open",
        priority: "medium",
        dueDate: undefined,
      });
    }
  }, [task, form]); // task veya form referansı değiştiğinde tetikle

  // Yeni görev oluşturma mutation'ı
  const createMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      // Apps Script'e gönderilecek payload'ı oluştur
      const payload = {
        title: data.title,
        description: data.description,
        isCompleted: false, // Yeni görev varsayılan olarak tamamlanmamış
        dueDate: data.dueDate ? data.dueDate.toISOString().split('T')[0] : '', // YYYY-MM-DD formatında gönder
        status: data.status,
        priority: data.priority,
      };

      const response = await apiRequest("POST", "/", payload); // POST ile yeni görev ekle
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] }); // Görev listesini yeniden çek
      queryClient.invalidateQueries({ queryKey: ["tasks", "stats"] }); // İstatistikleri de güncelleyebiliriz
      toast({
        title: "Başarılı",
        description: "İş başarıyla oluşturuldu.",
      });
      onSuccess?.(); // Üst bileşene bildirim gönder (genellikle dialogu kapatır)
      form.reset(); // Formu sıfırla
    },
    onError: (err) => {
        console.error("İş oluşturulurken hata:", err);
        toast({
          title: "Hata",
          description: err instanceof Error ? err.message : "İş oluşturulurken bir hata oluştu.",
          variant: "destructive",
        });
    },
  });

  // Mevcut görev güncelleme mutation'ı
  const updateMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      if (!task || !task.id) {
        throw new Error("Güncellenecek işin ID'si bulunamadı.");
      }

      // Apps Script'e gönderilecek payload'ı oluştur
      const payload = {
        id: task.id, // Görevin ID'si güncellenirken zorunlu
        title: data.title,
        description: data.description,
        isCompleted: task.isCompleted, // isCompleted alanı formda olmadığı için mevcut değeri koru
        dueDate: data.dueDate ? data.dueDate.toISOString().split('T')[0] : '', // YYYY-MM-DD formatında gönder
        status: data.status,
        priority: data.priority,
      };

      const response = await apiRequest("POST", "/", payload); // Güncelleme için de POST kullanıyoruz
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] }); // Görev listesini yeniden çek
      queryClient.invalidateQueries({ queryKey: ["tasks", "stats"] }); // İstatistikleri de güncelleyebiliriz
      toast({
        title: "Başarılı",
        description: "İş başarıyla güncellendi.",
      });
      onSuccess?.(); // Üst bileşene bildirim gönder
    },
    onError: (err) => {
        console.error("İş güncellenirken hata:", err);
        toast({
          title: "Hata",
          description: err instanceof Error ? err.message : "İş güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
    },
  });

  // Form gönderim fonksiyonu
  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      if (task) { // Eğer 'task' prop'u varsa, güncelleme modu
        await updateMutation.mutateAsync(data);
      } else { // Yoksa, yeni görev ekleme modu
        await createMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false); // Gönderim durumunu sıfırla
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İş Başlığı *</FormLabel>
              <FormControl>
                <Input placeholder="İş başlığını girin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İş Açıklaması</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="İş açıklamasını girin"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Öncelik</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Öncelik seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durum</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Açık</SelectItem>
                    <SelectItem value="progress">Devam Eden</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bitiş Tarihi</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  // Date objesini YYYY-MM-DD formatına çevir
                  value={field.value ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    // Input'tan gelen string'i Date objesine çevir
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    field.onChange(date);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-blue-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}