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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Save,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TermsSection = {
  id: string;
  section: string;
  title: string;
  order_index: number;
  content: {
    paragraphs?: string[];
    lists?: {
      title?: string;
      items: string[];
    }[];
    prices?: {
      name: string;
      value: string;
    }[];
  };
};

export default function Page() {
  const router = useRouter();
  const [sections, setSections] = useState<TermsSection[]>([]);
  const [editingSection, setEditingSection] = useState<TermsSection | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    loadUserAndSections();
  }, []);

  const loadUserAndSections = async () => {
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

    if (profile) setProfile(profile);

    const { data, error } = await supabase
      .from("terms_content")
      .select("*")
      .order("order_index");

    if (error) {
      toast.error(`Ошибка загрузки: ${error.message}`);
      console.error("Error loading sections:", error);
      return;
    }

    if (data) {
      const parsed = data.map((s) => {
        let content;
        try {
          content =
            typeof s.content === "string" ? JSON.parse(s.content) : s.content;
        } catch (err) {
          console.error("Error parsing content:", err);
          content = {};
        }
        return {
          ...s,
          content,
        };
      }) as TermsSection[];
      setSections(parsed);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const formData = new FormData(e.currentTarget);

    const contentStr = formData.get("content") as string;
    let parsedContent;

    try {
      parsedContent = JSON.parse(contentStr);
    } catch (err: any) {
      toast.error(`Неверный формат JSON: ${err.message}`);
      setLoading(false);
      return;
    }

    const payload = {
      title: formData.get("title") as string,
      section: formData.get("section") as string,
      content: JSON.stringify(parsedContent),
      order_index:
        editingSection?.order_index ||
        (sections.length > 0
          ? Math.max(...sections.map((s) => s.order_index)) + 1
          : 1),
    };

    try {
      if (editingSection) {
        const { error } = await supabase
          .from("terms_content")
          .update(payload)
          .eq("id", editingSection.id);

        if (error) throw error;
        toast.success("Раздел успешно обновлен");
      } else {
        const { error } = await supabase
          .from("terms_content")
          .insert([payload]);

        if (error) throw error;
        toast.success("Раздел успешно создан");
      }
    } catch (err: any) {
      toast.error(err.message || "Ошибка при сохранении");
      console.error("Save error:", err);
    } finally {
      setIsDialogOpen(false);
      setEditingSection(null);
      setLoading(false);
      loadUserAndSections();
    }
  };

  const handleDelete = async () => {
    if (!sectionToDelete) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("terms_content")
      .delete()
      .eq("id", sectionToDelete);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Раздел успешно удален");
    }

    setIsDeleteDialogOpen(false);
    setSectionToDelete(null);
    setLoading(false);
    loadUserAndSections();
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    if (direction === "up" && index > 0) {
      [newSections[index], newSections[index - 1]] = [
        newSections[index - 1],
        newSections[index],
      ];
    } else if (direction === "down" && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];
    }

    // Обновляем order_index
    const updatedSections = newSections.map((section, idx) => ({
      ...section,
      order_index: idx + 1,
    }));

    setSections(updatedSections);
  };

  const saveOrder = async () => {
    setIsSavingOrder(true);
    const supabase = createClient();

    try {
      // Подготовка обновлений для всех секций
      const updates = sections.map((section, index) => ({
        id: section.id,
        order_index: index + 1,
      }));

      // Обновляем все секции
      for (const update of updates) {
        const { error } = await supabase
          .from("terms_content")
          .update({ order_index: update.order_index })
          .eq("id", update.id);

        if (error) throw error;
      }

      toast.success("Порядок разделов сохранен");
    } catch (err: any) {
      toast.error(err.message || "Ошибка при сохранении порядка");
      console.error("Save order error:", err);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const getSectionTypeName = (sectionType: string) => {
    const types: Record<string, string> = {
      services: "Услуги",
      partnership: "Партнерство",
      nuances: "Нюансы",
      prices: "Цены",
      important: "Примечание",
    };
    return types[sectionType] || sectionType;
  };

  const getSectionColor = (sectionType: string) => {
    const colors: Record<string, string> = {
      services: "bg-blue-100 text-blue-800",
      partnership: "bg-green-100 text-green-800",
      nuances: "bg-yellow-100 text-yellow-800",
      prices: "bg-purple-100 text-purple-800",
      important: "bg-red-100 text-red-800",
    };
    return colors[sectionType] || "bg-gray-100 text-gray-800";
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Управление условиями</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Редактирование разделов "Условия и соглашения"
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={saveOrder}
            disabled={isSavingOrder}
          >
            {isSavingOrder ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Сохранить порядок
          </Button>

          <Button
            onClick={() => {
              setEditingSection(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить раздел
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{sections.length}</div>
            <div className="text-sm text-muted-foreground">Всего разделов</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {sections.filter((s) => s.section === "services").length}
            </div>
            <div className="text-sm text-muted-foreground">Услуги</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {sections.filter((s) => s.section === "prices").length}
            </div>
            <div className="text-sm text-muted-foreground">Цены</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {sections.filter((s) => s.section === "important").length}
            </div>
            <div className="text-sm text-muted-foreground">Примечания</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Порядок</TableHead>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Название раздела</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead className="w-48">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Разделы не найдены
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSection(null);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Создать первый раздел
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sections.map((section, index) => (
                  <TableRow key={section.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => moveSection(index, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => moveSection(index, "down")}
                          disabled={index === sections.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {section.order_index}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-md">
                          {section.content.paragraphs?.[0]?.substring(0, 100) ||
                            "Нет описания"}
                          ...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSectionColor(section.section)}>
                        {getSectionTypeName(section.section)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingSection(section);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Изменить
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSectionToDelete(section.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Диалог редактирования/создания */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection
                ? "Редактирование раздела"
                : "Создание нового раздела"}
            </DialogTitle>
            <DialogDescription>
              {editingSection
                ? "Измените информацию о разделе"
                : "Заполните информацию для нового раздела"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название раздела *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingSection?.title || ""}
                  placeholder="Например: Общие положения"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Тип раздела *</Label>
                <select
                  id="section"
                  name="section"
                  defaultValue={editingSection?.section || "services"}
                  className="w-full h-10 border rounded-md px-3 bg-background"
                  required
                >
                  <option value="services">Услуги</option>
                  <option value="partnership">Партнерство</option>
                  <option value="nuances">Нюансы</option>
                  <option value="prices">Цены</option>
                  <option value="important">Примечание</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Содержимое раздела (JSON) *</Label>
                <div className="text-xs text-muted-foreground">
                  Используйте JSON формат
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 text-sm font-medium">
                  Структура JSON:
                </div>
                <Textarea
                  id="content"
                  name="content"
                  className="h-64 font-mono text-sm"
                  defaultValue={JSON.stringify(
                    editingSection?.content || {
                      paragraphs: [
                        "Введите текст первого параграфа здесь.",
                        "Введите текст второго параграфа здесь.",
                      ],
                      lists: [
                        {
                          title: "Заголовок списка (опционально)",
                          items: ["Пункт 1", "Пункт 2", "Пункт 3"],
                        },
                      ],
                      prices: [
                        {
                          name: "Название услуги",
                          value: "Стоимость",
                        },
                      ],
                    },
                    null,
                    2
                  )}
                  required
                  spellCheck="false"
                />
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Примеры использования:</p>
                <pre className="text-xs bg-muted p-2 rounded">
                  {`// Только параграфы:
{
  "paragraphs": ["Текст параграфа 1", "Текст параграфа 2"]
}

// Списки:
{
  "lists": [{
    "title": "Основные правила",
    "items": ["Правило 1", "Правило 2"]
  }]
}

// Цены:
{
  "prices": [{
    "name": "Услуга 1",
    "value": "1000 ₽"
  }]
}`}
                </pre>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingSection ? "Сохранить изменения" : "Создать раздел"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить раздел?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот раздел? Это действие нельзя
              будет отменить.
              <div className="mt-2 p-2 bg-muted rounded">
                <span className="font-medium">Название:</span>{" "}
                {sections.find((s) => s.id === sectionToDelete)?.title}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
