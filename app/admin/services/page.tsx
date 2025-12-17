"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [editingService, setEditingService] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadUserAndServices();
  }, []);

  const loadUserAndServices = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUser(user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setProfile(profile);
    }

    const { data: services } = await supabase
      .from("services")
      .select("*")
      .order("category");

    if (services) setServices(services);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = createClient();
    const formData = new FormData(e.currentTarget);

    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price") as string,
      category: formData.get("category"),
      is_active: formData.get("is_active") === "on",
    };

    if (editingService) {
      await supabase.from("services").update(data).eq("id", editingService.id);
    } else {
      await supabase.from("services").insert(data);
    }

    setIsDialogOpen(false);
    setEditingService(null);
    loadUserAndServices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены?")) return;
    const supabase = createClient();
    await supabase.from("services").delete().eq("id", id);
    loadUserAndServices();
  };

  const openEditDialog = (service: any) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Управление услугами</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              size="sm"
              className="text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Добавить услугу</span>
              <span className="sm:hidden">Добавить</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingService ? "Редактировать" : "Новая услуга"}
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {editingService
                  ? "Измените данные услуги"
                  : "Заполните форму для создания новой услуги"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-sm sm:text-base">
                  Название
                </Label>
                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={editingService?.title}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm sm:text-base">
                  Описание
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  defaultValue={editingService?.description}
                  className="text-sm sm:text-base"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-sm sm:text-base">
                  Цена
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  required
                  placeholder="Например: от 3999 ₽"
                  defaultValue={editingService?.price}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-sm sm:text-base">
                  Категория
                </Label>
                <Input
                  id="category"
                  name="category"
                  required
                  defaultValue={editingService?.category}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingService?.is_active ?? true}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="text-sm sm:text-base">
                  Активна
                </Label>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <Button type="submit" className="w-full sm:w-auto">
                  Сохранить
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Список услуг</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Название</TableHead>
                  <TableHead className="whitespace-nowrap">Категория</TableHead>
                  <TableHead className="whitespace-nowrap">Цена</TableHead>
                  <TableHead className="whitespace-nowrap">Статус</TableHead>
                  <TableHead className="whitespace-nowrap">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium max-w-[200px] sm:max-w-md">
                      <div>
                        <div className="text-sm sm:text-base">
                          {service.title}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {service.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                        {service.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-sm sm:text-base">
                      {service.price}
                    </TableCell>
                    <TableCell>
                      {service.is_active ? (
                        <Badge variant="default" className="text-xs sm:text-sm">
                          Активна
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="text-xs sm:text-sm"
                        >
                          Неактивна
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(service)}
                          className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Изменить</span>
                          <span className="sm:hidden">Изм.</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Удалить</span>
                          <span className="sm:hidden">Удал.</span>
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
    </div>
  );
}
