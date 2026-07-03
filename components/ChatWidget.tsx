"use client";

import React, { useState, useRef, useEffect } from "react";

const renderMarkdown = (text: string) => {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  
  let currentListType: "ul" | "ol" | null = null;
  let currentListItems: React.ReactNode[] = [];

  const flushList = (key: string | number) => {
    if (currentListItems.length > 0) {
      if (currentListType === "ul") {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 my-2 space-y-1">
            {currentListItems}
          </ul>
        );
      } else if (currentListType === "ol") {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-5 my-2 space-y-1">
            {currentListItems}
          </ol>
        );
      }
      currentListItems = [];
      currentListType = null;
    }
  };

  const parseInline = (lineText: string) => {
    const parts = [];
    let currentIdx = 0;
    const regex = /(\*\*|`)(.*?)\1/g;
    let match;
    let key = 0;
    
    while ((match = regex.exec(lineText)) !== null) {
      const matchIdx = match.index;
      if (matchIdx > currentIdx) {
        parts.push(lineText.slice(currentIdx, matchIdx));
      }
      
      const type = match[1];
      const content = match[2];
      
      if (type === "**") {
        parts.push(<strong key={key++} className="font-bold text-neutral-100">{content}</strong>);
      } else if (type === "`") {
        parts.push(
          <code key={key++} className="px-1.5 py-0.5 bg-neutral-900 text-neutral-200 rounded text-xs font-mono border border-neutral-700">
            {content}
          </code>
        );
      }
      
      currentIdx = regex.lastIndex;
    }
    
    if (currentIdx < lineText.length) {
      parts.push(lineText.slice(currentIdx));
    }
    
    return parts.length > 0 ? parts : lineText;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for unordered list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (currentListType !== "ul") {
        flushList(index);
        currentListType = "ul";
      }
      const content = trimmed.slice(2);
      currentListItems.push(
        <li key={`li-${index}`} className="text-sm font-light text-neutral-300 leading-relaxed">
          {parseInline(content)}
        </li>
      );
    } 
    // Check for ordered list
    else if (/^\d+\.\s+/.test(trimmed)) {
      if (currentListType !== "ol") {
        flushList(index);
        currentListType = "ol";
      }
      const content = trimmed.replace(/^\d+\.\s+/, "");
      currentListItems.push(
        <li key={`li-${index}`} className="text-sm font-light text-neutral-300 leading-relaxed">
          {parseInline(content)}
        </li>
      );
    } 
    // Regular paragraph
    else {
      flushList(index);
      if (trimmed === "") {
        elements.push(<div key={`space-${index}`} className="h-2" />);
      } else {
        elements.push(
          <p key={`p-${index}`} className="text-sm font-light text-neutral-300 leading-relaxed my-1">
            {parseInline(line)}
          </p>
        );
      }
    }
  });

  flushList("end");
  return elements;
};

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
}

interface ChatWidgetProps {
  postSlug?: string; // Jeśli puste, działamy w trybie globalnym
  postTitle?: string;
}

export default function ChatWidget({ postSlug, postTitle }: ChatWidgetProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Jeśli jesteśmy na stronie posta, domyślnie pytamy o "ten artykuł" (mode: 'post'), inaczej o 'global'
  const [chatMode, setChatMode] = useState<"post" | "global">(postSlug ? "post" : "global");
  const [conversationId, setConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Zabezpieczenie przed błędem hydratacji w Next.js
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Zresetuj konwersację przy zmianie trybu
  const handleModeChange = (mode: "post" | "global") => {
    setChatMode(mode);
    setConversationId(null);
    setMessages([]);
  };

  // Automatyczne przewijanie do najnowszych wiadomości
  useEffect(() => {
    if (isMounted) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isMounted]);

  if (!isMounted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    setInput("");
    setIsLoading(true);

    // Dodanie wiadomości użytkownika
    const userMsgId = Math.random().toString(36).slice(2);
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: textToSend }]);

    // Przygotowanie pustej wiadomości agenta, którą będziemy strumieniować
    const agentMsgId = Math.random().toString(36).slice(2);
    setMessages((prev) => [...prev, { id: agentMsgId, sender: "agent", text: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          slug: chatMode === "post" ? postSlug : "global",
          conversationId,
        }),
      });

      if (!response.ok) throw new Error("Błąd sieci podczas pobierania odpowiedzi.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Nie udało się odczytać strumienia.");

      let fullText = "";
      let buffer = "";
      let conversationIdSet = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        if (!conversationIdSet) {
          buffer += chunk;
          const newlineIndex = buffer.indexOf("\n");
          if (newlineIndex !== -1) {
            const firstLine = buffer.slice(0, newlineIndex);
            if (firstLine.startsWith("__CONVERSATION_ID__:")) {
              const id = firstLine.replace("__CONVERSATION_ID__:", "").trim();
              setConversationId(id !== "None" ? id : null);
            }
            const rest = buffer.slice(newlineIndex + 1);
            fullText += rest;
            conversationIdSet = true;
            if (rest) {
              setMessages((prev) =>
                prev.map((msg) => (msg.id === agentMsgId ? { ...msg, text: fullText } : msg))
              );
            }
          }
        } else {
          fullText += chunk;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === agentMsgId ? { ...msg, text: fullText } : msg))
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMsgId
            ? { ...msg, text: "Przepraszam, wystąpił problem techniczny podczas generowania odpowiedzi. Spróbuj ponownie za chwilę." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    handleSubmit(null as any, suggestionText);
  };

  // Podpowiedzi w zależności od trybu chatu
  const suggestions = chatMode === "post" 
    ? [
        { label: "Streść ten artykuł", text: "Przygotuj zwięzłe streszczenie tego wpisu w punktach." },
        { label: "Główne wnioski", text: "Jakie są najważniejsze wnioski płynące z tego artykułu?" }
      ]
    : [
        { label: "Wpisy z 2026 roku", text: "Jakie artykuły opublikowałeś w 2026 roku?" },
        { label: "Porównaj wpisy rok do roku", text: "Zrób porównanie tematów poruszanych na blogu rok do roku (np. 2025 vs 2026)." },
        { label: "Pokaż listę artykułów", text: "Wypisz wszystkie opublikowane artykuły na blogu wraz z datami." }
      ];

  return (
    <div style={{ marginTop: '48px', borderTop: '1px solid #27272a', paddingTop: '40px' }}>
      <div 
        style={{
          border: '1px solid #27272a',
          borderRadius: '16px',
          backgroundColor: '#18181b',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        
        {/* Nagłówek i przełącznik chatu */}
        <div 
          style={{ 
            backgroundColor: '#1c1c1f', 
            borderBottom: '1px solid #27272a',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            height: 'auto',
            minHeight: '60px',
            opacity: 1,
            visibility: 'visible',
            borderTopLeftRadius: '15px',
            borderTopRightRadius: '15px'
          }}
        >
          <div
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsOpen(!isOpen);
              }
            }}
            role="button"
            tabIndex={0}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              cursor: 'pointer',
              outline: 'none',
              backgroundColor: 'transparent',
              border: 'none',
              textAlign: 'left',
              opacity: 1,
              visibility: 'visible'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', opacity: 1, visibility: 'visible' }}>
              <span style={{ display: 'flex', position: 'relative', width: '12px', height: '12px', opacity: 1, visibility: 'visible' }}>
                <span className="animate-ping" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '9999px', backgroundColor: isLoading ? '#f59e0b' : '#3b82f6', opacity: 0.75 }}></span>
                <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '9999px', height: '12px', width: '12px', backgroundColor: isLoading ? '#f59e0b' : '#3b82f6' }}></span>
              </span>
              <div style={{ opacity: 1, visibility: 'visible' }}>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', opacity: 1, visibility: 'visible' }}>
                  Asystent AI Bloga
                  <span style={{ fontSize: '11px', fontWeight: 400, color: '#a1a1aa', opacity: 1, visibility: 'visible' }}>(Gemini Agent)</span>
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#a1a1aa', fontWeight: 300, opacity: 1, visibility: 'visible' }}>
                  {chatMode === "post" ? `Zadajesz pytania do wpisu: "${postTitle || 'Aktualny post'}"` : "Rozmawiasz o całej zawartości bloga"}
                </p>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              style={{
                width: '18px',
                height: '18px',
                color: '#a1a1aa',
                transition: 'transform 300ms ease-in-out',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                opacity: 1,
                visibility: 'visible'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {/* Przełącznik trybu (tylko na stronie wpisu) */}
          {postSlug && (
            <div style={{ display: 'flex', backgroundColor: '#09090b', padding: '4px', borderRadius: '12px', border: '1px solid #27272a', gap: '4px', opacity: 1, visibility: 'visible' }}>
              <button
                onClick={() => handleModeChange("post")}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  color: chatMode === "post" ? '#f4f4f5' : '#a1a1aa',
                  backgroundColor: chatMode === "post" ? '#27272a' : 'transparent',
                  transition: 'all 200ms',
                  opacity: 1,
                  visibility: 'visible'
                }}
              >
                Ten artykuł
              </button>
              <button
                onClick={() => handleModeChange("global")}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  color: chatMode === "global" ? '#f4f4f5' : '#a1a1aa',
                  backgroundColor: chatMode === "global" ? '#27272a' : 'transparent',
                  transition: 'all 200ms',
                  opacity: 1,
                  visibility: 'visible'
                }}
              >
                Cały blog
              </button>
            </div>
          )}
        </div>

        {/* Ciało chatu */}
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[550px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
          style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}
        >
          <div className="flex flex-col h-[400px]" style={{ backgroundColor: '#0e0e11' }}>
            
            {/* Lista Wiadomości */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                  <div 
                    className="w-12 h-12 rounded-full border flex items-center justify-center text-muted-foreground shadow-inner"
                    style={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01H18.75m-16.5 0c0-1.293.76-2.47 1.962-3.033A11.908 11.908 0 0 1 12 4.5c1.83 0 3.53.413 5.038 1.147 1.203.564 1.962 1.74 1.962 3.033v3.31c0 1.293-.76 2.47-1.962 3.033-1.5.734-3.208 1.147-5.038 1.147-1.83 0-3.53-.413-5.038-1.147-1.202-.563-1.962-1.74-1.962-3.033v-3.31Z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      W czym mogę Ci pomóc?
                    </p>
                    <p className="text-xs text-muted-foreground font-light max-w-sm mx-auto leading-relaxed">
                      {chatMode === "post" 
                        ? "Zadaj mi dowolne pytanie dotyczące bieżącego wpisu." 
                        : "Możesz mnie zapytać o całą treść bloga, wykaz artykułów z danych lat, a także poprosić o analizę porównawczą."}
                    </p>
                  </div>

                  {/* Szybkie sugestie pytań */}
                  <div className="flex flex-wrap gap-2 justify-center pt-2 max-w-lg">
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(sug.text)}
                        className="px-3.5 py-1.5 text-muted-foreground hover:text-foreground border border-border text-xs rounded-full transition-all cursor-pointer shadow-sm hover:border-neutral-700"
                        style={{ backgroundColor: '#18181b' }}
                      >
                        {sug.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-accent text-white rounded-br-none shadow-md font-medium"
                          : "text-foreground border rounded-bl-none font-light shadow-sm"
                      }`}
                      style={msg.sender !== "user" ? { backgroundColor: '#18181b', borderColor: '#27272a' } : undefined}
                    >
                      {msg.text ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          {renderMarkdown(msg.text)}
                        </div>
                      ) : (
                        <div className="flex space-x-1.5 items-center py-2 px-2.5">
                          <span className="block w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="block w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="block w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Formularz chatu */}
            <div className="p-4 border-t border-border space-y-3" style={{ backgroundColor: '#09090b' }}>
              {messages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(sug.text)}
                      className="px-2.5 py-1 text-muted-foreground hover:text-foreground border border-border text-[10px] rounded-full transition-all cursor-pointer"
                      style={{ backgroundColor: '#18181b' }}
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={(e) => handleSubmit(e)} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder={chatMode === "post" ? "Zapytaj o ten artykuł..." : "Zapytaj o blog, wyszukaj lub porównaj posty..."}
                  className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-neutral-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#1c1c1f' }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 disabled:opacity-40 disabled:hover:bg-neutral-100 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
