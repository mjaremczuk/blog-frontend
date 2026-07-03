import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { message, slug, conversationId } = await req.json();

    // Pobranie URL backendu agenta ze zmiennej środowiskowej
    const agentApiUrl = process.env.AGENT_API_URL || "https://blog-agent-528508526838.europe-west1.run.app/api/chat";

    const response = await fetch(agentApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        slug,
        conversation_id: conversationId || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    // Przekazanie strumienia odpowiedzi bezpośrednio do klienta
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Błąd serwera Next.js w Route Proxy:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Błąd wewnętrzny serwera proxy" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
