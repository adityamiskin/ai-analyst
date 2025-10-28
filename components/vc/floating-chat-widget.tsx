"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, MessageCircle } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Response } from "../ai-elements/response";

export function FloatingChatWidget({
  companyId,
}: {
  companyId?: Id<"founderApplications">;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    {
      role: "user" | "assistant";
      content: string;
      sources?: {
        id: number;
        title: string;
        url: string | null;
        snippet: string;
      }[];
    }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Get action - use fallback path
  const askCompanyAction =
    (api.actions as any).vc_chat?.askCompany ||
    (api as any).vc_chat?.askCompany;

  const askCompany = useAction(askCompanyAction);

  const canSend = useMemo(
    () => companyId && input.trim().length > 0 && !loading,
    [companyId, input, loading]
  );

  async function onSend() {
    if (!canSend) return;
    const q = input.trim();
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      // Filter history to only include role and content
      const filteredHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await askCompany({
        companyId,
        question: q,
        history: filteredHistory,
      });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer,
          sources: res.sources,
        },
      ]);
      setTimeout(() => {
        if (scrollRef.current)
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 50);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, I couldn't retrieve an answer right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  if (!companyId) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="fixed bottom-6 right-6 rounded-full p-4 shadow-lg transition-all bg-blue-600 hover:bg-blue-700 text-white z-40"
          title="Ask about this company"
        >
          <MessageCircle className="w-6 h-6" />
          {messages.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {messages.length}
            </div>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        className="w-[600px] p-0 mr-6 mb-2"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base">Ask about this company</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <ScrollArea className="h-[500px]">
              <div className="flex flex-col gap-3 pr-4">
                {messages.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    Ask anything about the founder application, market,
                    traction, or the latest AI analysis.
                  </div>
                )}
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={m.role === "user" ? "text-right" : "text-left"}
                  >
                    <div
                      className={
                        m.role === "user"
                          ? "inline-block rounded-lg bg-blue-600 text-white px-3 py-2 text-sm max-w-xs"
                          : "inline-block rounded-lg px-3 py-2 text-sm"
                      }
                    >
                      <Response>{m.content}</Response>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask a question..."
                className="text-sm"
              />
              <Button
                onClick={onSend}
                disabled={!canSend}
                size="sm"
                className="px-3"
              >
                {loading ? "…" : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
