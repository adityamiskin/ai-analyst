"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, MessageCircle, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Response } from "../ai-elements/response";
import {
  useUIMessages,
  useSmoothText,
  optimisticallySendMessage,
  type UIMessage,
} from "@convex-dev/agent/react";

function MessageItem({
  message,
  isUser,
  showThinking,
}: {
  message: UIMessage;
  isUser: boolean;
  showThinking: boolean;
}) {
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  });

  return (
    <div className={isUser ? "text-right" : "text-left"}>
      {showThinking ? (
        // Show thinking indicator instead of empty message
        <div className="inline-block rounded-lg px-3 py-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        </div>
      ) : (
        // Show actual message content
        <div
          className={
            isUser
              ? "inline-block rounded-lg bg-blue-600 text-white px-3 py-2 text-sm max-w-xs"
              : "inline-block rounded-lg px-3 py-2 text-sm"
          }
        >
          <Response>{visibleText}</Response>
        </div>
      )}
    </div>
  );
}

export function FloatingChatWidget({
  companyId,
}: {
  companyId?: Id<"founderApplications">;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Use useUIMessages hook for streaming messages
  const { results, status } = useUIMessages(
    api.vc_chat.listThreadMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true }
  );

  const ensureThread = useAction(api.vc_chat.ensureThread);
  const sendMessage = useMutation(api.vc_chat.sendMessage).withOptimisticUpdate(
    (store, args) => {
      optimisticallySendMessage(api.vc_chat.listThreadMessages)(store, {
        threadId: args.threadId,
        prompt: args.question,
      });
    }
  );

  // Consolidate all thinking logic in one place
  const messagesWithThinking = useMemo(() => {
    if (!results || results.length === 0) return [];

    return results.map((message) => {
      let showThinking = false;

      // Show thinking only on assistant messages that are streaming and empty
      if (
        message.role === "assistant" &&
        message.status === "streaming" &&
        (!message.text || message.text.trim() === "")
      ) {
        showThinking = true;
      }

      return {
        ...message,
        showThinking,
      };
    });
  }, [results]);

  const canSend = useMemo(
    () => companyId && input.trim().length > 0 && !loading,
    [companyId, input, loading]
  );

  async function onSend() {
    if (!canSend || !companyId) return;
    const q = input.trim();
    setInput("");
    setLoading(true);

    try {
      // Ensure thread exists first
      let currentThreadId = threadId;
      if (!currentThreadId) {
        const threadResult = await ensureThread({
          companyId,
          threadId: undefined,
        });
        currentThreadId = threadResult.threadId;
        setThreadId(currentThreadId);
      }

      // Send message with optimistic update
      await sendMessage({
        threadId: currentThreadId,
        question: q,
        companyId,
      });
    } catch (e) {
      console.error("Error sending message:", e);
    } finally {
      setLoading(false);
    }
  }

  // Auto-scroll when messages change
  useEffect(() => {
    if (results && results.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [results]);

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
          {results && results.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {results.length}
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
                {(!results || results.length === 0) && (
                  <div className="text-sm text-muted-foreground">
                    Ask anything about the founder application, market,
                    traction, or the latest AI analysis.
                  </div>
                )}
                {messagesWithThinking.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <MessageItem
                      key={message.key}
                      message={message}
                      isUser={isUser}
                      showThinking={message.showThinking}
                    />
                  );
                })}
                {results && results.length > 0 && <div ref={messagesEndRef} />}
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
