import Link from "next/link";
import { cookies } from "next/headers";
import { getPostBySlug } from "@/lib/api";
import { Button } from "@/components/Button";
import GalleryBlock from "@/components/GalleryBlock";
import ChatWidget from "@/components/ChatWidget";

// Ensure page is evaluated dynamically since it reads cookies at request time
export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

interface EditorJsBlock {
  id?: string;
  type: string;
  data: any;
}

interface EditorJsData {
  time?: number;
  blocks: EditorJsBlock[];
  version?: string;
}

// SOLID-compliant block renderer
function renderBlock(block: EditorJsBlock) {
  switch (block.type) {
    case "paragraph":
      return (
        <p
          key={block.id}
          className="text-neutral-300 text-base md:text-lg leading-relaxed mb-6 font-light"
          dangerouslySetInnerHTML={{ __html: block.data.text }}
        />
      );
    case "header": {
      const level = block.data.level || 2;
      const Tag = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";
      const classes: Record<number, string> = {
        2: "text-2xl md:text-3xl font-extrabold text-neutral-100 tracking-tight mt-10 mb-4 first:mt-0",
        3: "text-xl md:text-2xl font-bold text-neutral-200 tracking-tight mt-8 mb-3",
        4: "text-lg md:text-xl font-semibold text-neutral-350 tracking-tight mt-6 mb-2",
      };
      return (
        <Tag
          key={block.id}
          className={classes[level] || classes[2]}
          dangerouslySetInnerHTML={{ __html: block.data.text }}
        />
      );
    }
    case "list": {
      const isOrdered = block.data.style === "ordered";
      const Tag = isOrdered ? "ol" : "ul";
      const listClass = isOrdered
        ? "list-decimal pl-6 space-y-2 mb-6 text-neutral-300"
        : "list-disc pl-6 space-y-2 mb-6 text-neutral-300";
      return (
        <Tag key={block.id} className={listClass}>
          {block.data.items.map((item: string, idx: number) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </Tag>
      );
    }
    case "image": {
      const url = block.data.file?.url || "";
      const caption = block.data.caption || "";
      if (!url) return null;
      return (
        <figure key={block.id} className="my-8 flex flex-col items-center">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-neutral-900 shadow-md max-w-full">
            <img
              src={url}
              alt={caption || "Zdjęcie w artykule"}
              className="max-h-[550px] w-auto object-contain mx-auto"
            />
          </div>
          {caption && (
            <figcaption className="text-xs text-muted-foreground mt-3 text-center italic max-w-md">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case "gallery":
      return <GalleryBlock key={block.id} urls={block.data.urls} />;
    default:
      console.warn(`Unknown block type: ${block.type}`);
      return null;
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let post = null;
  let errorMsg = "";

  try {
    post = await getPostBySlug(slug, token);
  } catch (err) {
    console.error(`Failed to load post ${slug}:`, err);
    errorMsg = err instanceof Error ? err.message : "Błąd podczas pobierania wpisu.";
  }

  // Fallback cover image URL if post has none
  const defaultCoverUrl = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80";

  // Clean 404 component if post doesn't exist or loading failed
  if (!post) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">404</h1>
          <h2 className="text-xl font-semibold text-neutral-200">Artykuł niedostępny</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Post nie istnieje lub nie masz uprawnień do jego wyświetlenia. 
            Zaloguj się jako administrator, aby zobaczyć prywatne wpisy.
          </p>
        </div>
        {errorMsg && (
          <div className="text-xs font-mono bg-neutral-950 p-3 rounded-lg border border-border text-neutral-400 max-w-full overflow-auto">
            Błąd: {errorMsg}
          </div>
        )}
        <Link href="/">
          <Button variant="primary">Wróć do strony głównej</Button>
        </Link>
      </div>
    );
  }

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Nieznana data";

  // Parse block-editor content or fallback to raw text (for backwards compatibility)
  let parsedContent: React.ReactNode;
  try {
    const rawJson = JSON.parse(post.content) as EditorJsData;
    if (rawJson && Array.isArray(rawJson.blocks)) {
      parsedContent = (
        <div className="space-y-4">
          {rawJson.blocks.map((block) => renderBlock(block))}
        </div>
      );
    } else {
      throw new Error("Invalid structure");
    }
  } catch {
    // If not JSON, render as plain text paragraphs
    parsedContent = (
      <div className="whitespace-pre-line text-neutral-300 text-base leading-relaxed sm:text-lg">
        {post.content}
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
          Powrót do listy artykułów
        </Link>
      </div>

      {/* Cover Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-neutral-900 shadow-sm">
        <img
          src={post.coverImageUrl || defaultCoverUrl}
          alt={`Okładka artykułu: ${post.title}`}
          className="w-full h-full object-cover"
        />
        {post.isPrivate && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-950/90 backdrop-blur-sm border border-neutral-800 text-xs font-bold text-accent tracking-wider uppercase">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 text-accent"
            >
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                clipRule="evenodd"
              />
            </svg>
            Prywatny wpis
          </div>
        )}
      </div>

      {/* Post Header */}
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Opublikowano: <time dateTime={post.createdAt}>{formattedDate}</time>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-100 leading-tight">
          {post.title}
        </h1>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Dynamic Content Rendering */}
      <div className="prose prose-invert max-w-none">
        {parsedContent}
      </div>

      {/* Global AI Assistant Chat Widget */}
      <ChatWidget postSlug={slug} postTitle={post.title} />
    </article>
  );
}
