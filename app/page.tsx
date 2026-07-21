import Link from "next/link";
import { cookies } from "next/headers";
import { getAllPosts, PostDto, API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/Button";
import ChatWidget from "@/components/ChatWidget";

// Set page as dynamic since it reads cookies at request time
export const dynamic = "force-dynamic";

// Helper function to extract a clean text preview from Editor.js JSON or plain text content
function getPostExcerpt(content: string, maxLength = 100): string {
  try {
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.blocks)) {
      // Find the first paragraph block
      const firstParagraph = parsed.blocks.find((b: any) => b.type === "paragraph");
      
      if (firstParagraph && firstParagraph.data && typeof firstParagraph.data.text === "string") {
        // Remove HTML tags (like <b>, <i>, etc.) from Editor.js text block
        const cleanText = firstParagraph.data.text.replace(/<[^>]*>/g, "");
        return cleanText.length > maxLength 
          ? cleanText.slice(0, maxLength).trim() + "..." 
          : cleanText;
      }
      
      // Fallback: search for any block with text content (like a header or list)
      for (const block of parsed.blocks) {
        if (block.data && typeof block.data.text === "string") {
          const cleanText = block.data.text.replace(/<[^>]*>/g, "");
          if (cleanText) {
            return cleanText.length > maxLength 
              ? cleanText.slice(0, maxLength).trim() + "..." 
              : cleanText;
          }
        }
      }

      // Fallback if there are only image/gallery blocks
      const hasGallery = parsed.blocks.some((b: any) => b.type === "gallery");
      const hasImage = parsed.blocks.some((b: any) => b.type === "image");
      if (hasGallery) return "[Galeria zdjęć]";
      if (hasImage) return "[Zdjęcie]";
    }
  } catch {
    // Fallback: it's not JSON, so it's legacy text. Clean HTML tags just in case and truncate
    const cleanText = content.replace(/<[^>]*>/g, "");
    return cleanText.length > maxLength 
      ? cleanText.slice(0, maxLength).trim() + "..." 
      : cleanText;
  }
  return "";
}

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let posts: PostDto[] = [];
  let errorMsg = "";

  try {
    posts = await getAllPosts(token);
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    errorMsg = err instanceof Error ? err.message : "Nie udało się nawiązać połączenia z serwerem Ktor.";
  }

  // Placeholder cover image URL if post has none
  const defaultCoverUrl = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Witaj w moim <span className="text-accent">miejscu w sieci</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Piszę o wszystkim, co mnie pasjonuje. Znajdziesz tu przemyślenia z codziennego życia, 
          tematy zawodowe i programistyczne, a także moje sportowe zmagania – od biegania, 
          pływania i roweru, po wyzwania triathlonowe.
        </p>
        <div className="flex gap-3 pt-2">
          {token ? (
            <>
              <Link href="/admin">
                <Button variant="primary">Stwórz nowy wpis</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline">O mnie</Button>
              </Link>
            </>
          ) : (
            <Link href="/about">
              <Button variant="primary">O mnie</Button>
            </Link>
          )}
        </div>
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Recent Posts Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Artykuły</h2>
          <span className="text-sm text-muted-foreground">
            {errorMsg ? "Błąd połączenia" : `Wszystkie wpisy (${posts.length})`}
          </span>
        </div>

        {errorMsg ? (
          <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-8 text-center">
            <h3 className="text-lg font-semibold text-amber-500 mb-2">Brak połączenia z serwerem</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upewnij się, że serwer działa pod adresem{" "}
              <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-300 font-mono text-xs">
                {API_BASE_URL}
              </code>
              .
            </p>
            <div className="text-xs text-muted-foreground bg-neutral-950 p-4 rounded-lg max-w-lg mx-auto overflow-auto font-mono text-left border border-border">
              Szczegóły błędu: {errorMsg}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground text-sm">Nie opublikowano jeszcze żadnych artykułów.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => {
              // Get clean user-friendly excerpt
              const excerpt = getPostExcerpt(post.content);

              // Format date
              const formattedDate = post.createdAt
                ? new Date(post.createdAt).toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Nieznana data";

              return (
                <article
                  key={post.id}
                  className="group flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden hover:bg-neutral-900/40 hover:border-neutral-800 hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                >
                  <Link href={`/posts/${post.slug}`} className="flex flex-col h-full">
                    {/* Cover Image Container */}
                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                      <img
                        src={post.coverImageUrl || defaultCoverUrl}
                        alt={`Okładka artykułu: ${post.title}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {post.isPrivate && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-950/85 backdrop-blur-sm border border-neutral-800 text-[10px] font-bold text-accent tracking-wider uppercase">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3 h-3 text-accent"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Prywatny
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-col flex-1 p-5 space-y-3">
                      <time className="text-xs text-muted-foreground block">
                        {formattedDate}
                      </time>
                      <h3 className="text-lg font-bold tracking-tight group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-grow">
                        {excerpt}
                      </p>
                      <span className="text-xs font-semibold text-accent group-hover:underline inline-flex items-center gap-1 pt-2 mt-auto">
                        Czytaj artykuł 
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
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Global AI Assistant Chat Widget */}
      <ChatWidget />
    </div>
  );
}
