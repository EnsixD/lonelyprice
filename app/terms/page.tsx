import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileNav } from "@/components/mobile-nav";
import myImage from "@/public/logo.png";
import { createClient } from "@/lib/supabase/server";
import AnimatedBackground from "@/components/animated-background";

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

// Функция для парсинга ссылок в тексте
const parseLinksInText = (text: string) => {
  if (!text) return text;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  let cartCount = 0;
  if (user?.id) {
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    cartCount = count || 0;
  }

  const { data: termsData, error: termsError } = await supabase
    .from("terms_content")
    .select("*")
    .order("order_index");

  const terms: TermsSection[] = termsData
    ? termsData.map((item) => ({
        ...item,
        content:
          typeof item.content === "string"
            ? JSON.parse(item.content)
            : item.content,
      }))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <AnimatedBackground />

      {/* HEADER */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MobileNav user={user} cartCount={cartCount} />
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Image
                    src={myImage}
                    alt="Lonely Price"
                    width={40}
                    height={40}
                    priority
                    className="rounded-full"
                  />
                </div>
                <span className="font-bold">Lonely PRICE</span>
              </Link>
            </div>

            <Button asChild variant="ghost" size="sm">
              <Link href="/services">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        <div className="mb-8 flex items-center gap-3">
          <FileText className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold">Условия и соглашения</h1>
        </div>

        {termsError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <p>Ошибка загрузки данных: {termsError.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {terms.length === 0 && !termsError && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Разделы условий еще не добавлены.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {terms.map((section: TermsSection) => (
            <Card
              key={section.id}
              className="bg-card/50 backdrop-blur-sm border-border/50"
            >
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-sm sm:text-base">
                {/* PARAGRAPHS */}
                {section.content?.paragraphs?.map((p, i) => (
                  <p key={i} className="text-muted-foreground">
                    {parseLinksInText(p)}
                  </p>
                ))}

                {/* LISTS */}
                {section.content?.lists?.map((list, i) => (
                  <div key={i}>
                    {list.title && (
                      <h3 className="font-semibold mb-2">{list.title}</h3>
                    )}
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {list.items.map((item, j) => (
                        <li key={j}>{parseLinksInText(item)}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* PRICES */}
                {section.content?.prices && (
                  <div className="grid gap-2">
                    {section.content.prices.map((p, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <span className="text-muted-foreground">{p.name}</span>
                        <span className="font-semibold">{p.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg">
            <Link href="/services">Перейти к услугам</Link>
          </Button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-border/40 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex justify-between items-center">
          <span className="text-sm">Lonely PRICE</span>
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}
