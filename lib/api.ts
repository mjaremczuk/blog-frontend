// API Client for Ktor local backend communication

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface CreatePostRequest {
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string;
  isPrivate: boolean;
}

export interface PostDto {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string;
  isPrivate: boolean;
  createdAt: string;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://blog-backend-hwz2crveta-ew.a.run.app";

// Helper function to set JWT token in cookies (client-side)
function setTokenCookie(token: string, days = 7) {
  if (typeof window === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // Using SameSite=Strict and Secure for cookie security
  document.cookie = `token=${encodeURIComponent(token)};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Helper to handle Ktor error responses gracefully
async function handleResponseError(response: Response): Promise<never> {
  let errorMessage = `Błąd serwera (kod: ${response.status})`;
  try {
    const errorData = await response.json();
    if (errorData && typeof errorData.message === "string") {
      errorMessage = errorData.message;
    } else if (errorData && typeof errorData.error === "string") {
      errorMessage = errorData.error;
    }
  } catch {
    // Fallback if response is not JSON
    try {
      const text = await response.text();
      if (text) errorMessage = text;
    } catch {}
  }
  throw new ApiError(errorMessage, response.status);
}

/**
 * Loguje użytkownika i zapisuje token JWT w plikach cookies.
 * @param credentials Dane logowania użytkownika
 * @returns Token JWT
 */
export async function login(credentials: LoginRequest): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      await handleResponseError(res);
    }

    const data: LoginResponse = await res.json();
    
    // Zapisz token w cookies
    setTokenCookie(data.token);

    return data.token;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Wystąpił nieoczekiwany błąd podczas logowania.");
  }
}

/**
 * Rejestruje nowego użytkownika w systemie Ktor backend.
 * @param credentials Dane rejestracji (email, password)
 */
export async function register(credentials: LoginRequest): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      await handleResponseError(res);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Wystąpił nieoczekiwany błąd podczas rejestracji.");
  }
}


/**
 * Pobiera listę wszystkich artykułów z Ktor backend.
 * Obsługuje opcjonalny nagłówek autoryzacji w celu pobrania również prywatnych wpisów.
 * @param token Opcjonalny token JWT
 */
export async function getAllPosts(token?: string): Promise<PostDto[]> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/posts`, {
      method: "GET",
      headers,
      // Używamy dynamicznego wyboru pamięci podręcznej w zależności od obecności tokenu autoryzacji
      cache: token ? "no-store" : "force-cache",
      next: token ? undefined : { revalidate: 60 }, // rewalidacja co 60 sekund dla publicznych
    });

    if (!res.ok) {
      await handleResponseError(res);
    }

    return await res.json();
  } catch (error) {
    // Jeśli token autoryzacyjny był niepoprawny/wygasły (401), ponawiamy zapytanie bez tokenu,
    // aby użytkownik mógł chociaż zobaczyć publiczne artykuły bez błędu serwera.
    if (token && error instanceof ApiError && error.status === 401) {
      console.warn("Invalid token (401) when fetching all posts, retrying without authorization...");
      return getAllPosts();
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Nie udało się pobrać artykułów.");
  }
}

/**
 * Pobiera pojedynczy artykuł na podstawie sluga.
 * Obsługuje opcjonalną autoryzację w celu odczytu prywatnego artykułu.
 * @param slug Unikalny identyfikator artykułu
 * @param token Opcjonalny token JWT
 */
export async function getPostBySlug(slug: string, token?: string): Promise<PostDto> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/posts/${slug}`, {
      method: "GET",
      headers,
      cache: token ? "no-store" : "force-cache",
      next: token ? undefined : { revalidate: 60 },
    });

    if (!res.ok) {
      await handleResponseError(res);
    }

    return await res.json();
  } catch (error) {
    // Jeśli token autoryzacyjny był niepoprawny/wygasły (401), ponawiamy zapytanie bez tokenu,
    // aby użytkownik mógł chociaż zobaczyć publiczny artykuł.
    if (token && error instanceof ApiError && error.status === 401) {
      console.warn(`Invalid token (401) when fetching post ${slug}, retrying without authorization...`);
      return getPostBySlug(slug);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Nie udało się pobrać artykułu o identyfikatorze: ${slug}`);
  }
}

/**
 * Tworzy nowy artykuł w bazie danych Ktor (wymaga autoryzacji).
 * @param postData Dane nowego artykułu
 * @param token Token JWT administratora
 */
export async function createPost(postData: CreatePostRequest, token: string): Promise<PostDto> {
  if (!token) {
    throw new Error("Brak tokenu autoryzacyjnego. Zaloguj się ponownie.");
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!res.ok) {
      await handleResponseError(res);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Nie udało się utworzyć nowego artykułu.");
  }
}
