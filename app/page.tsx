import Link from "next/link";
import { Button } from "@/components/Button";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

const mockPosts: Post[] = [
  {
    id: "wstep-do-ktor",
    title: "Wstęp do Ktor i Kotlin - budowa nowoczesnego backendu API",
    excerpt:
      "Jak zacząć pracę z frameworkiem Ktor w języku Kotlin? W tym artykule stworzymy proste REST API, które docelowo połączymy z naszym frontendem Next.js.",
    date: "25 czerwca 2026",
    readTime: "5 min czytania",
    category: "Backend",
  },
  {
    id: "tailwind-v4-rewolucja",
    title: "Dlaczego Tailwind CSS v4 to rewolucja w stylowaniu",
    excerpt:
      "Przegląd najważniejszych nowości w Tailwind CSS v4. Nowy kompilator, rezygnacja z pliku konfiguracyjnego JavaScript na rzecz natywnego CSS i niesamowita wydajność.",
    date: "12 czerwca 2026",
    readTime: "4 min czytania",
    category: "CSS",
  },
  {
    id: "nextjs-app-router-best-practices",
    title: "Next.js App Router - najlepsze praktyki w 2026 roku",
    excerpt:
      "Podsumowanie wzorców projektowych przy użyciu App Routera w Next.js. Server Components, optymalizacja renderowania, obsługa stanów ładowania i SEO.",
    date: "1 czerwca 2026",
    readTime: "8 min czytania",
    category: "Next.js",
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Witaj na moim <span className="text-accent">Blogu Osobistym</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Piszę o nowoczesnym web developmencie, frontendzie w Next.js, backendzie w Ktorze 
          oraz architekturze oprogramowania. Czyste podejście do kodu i projektowania.
        </p>
        <div className="flex gap-3 pt-2">
          <Link href="/login">
            <Button variant="primary">Zaloguj się do panelu</Button>
          </Link>
          <Button variant="outline">O mnie</Button>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Recent Posts Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Ostatnie artykuły</h2>
          <span className="text-sm text-muted-foreground">Wszystkie wpisy ({mockPosts.length})</span>
        </div>

        <div className="grid gap-6">
          {mockPosts.map((post) => (
            <article
              key={post.id}
              className="group relative flex flex-col items-start p-6 rounded-2xl border border-border bg-card hover:bg-neutral-900/50 hover:border-neutral-800 transition-all duration-300 shadow-sm"
            >
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-medium">
                  {post.category}
                </span>
                <span>•</span>
                <time dateTime="2026-06-25">{post.date}</time>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight group-hover:text-accent transition-colors mb-2">
                <Link href={`#`}>
                  <span className="absolute -inset-y-0 -inset-x-0 z-20 rounded-2xl" />
                  {post.title}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <span className="text-xs font-semibold text-accent group-hover:underline flex items-center gap-1">
                Czytaj dalej 
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 0 1 .75-.75h10.63l-3.01-3.01a.75.75 0 1 1 1.06-1.06l4.28 4.28a.75.75 0 0 1 0 1.06l-4.28 4.28a.75.75 0 1 1-1.06-1.06l3.01-3.01H3.75A.75.75 0 0 1 3 10Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
