/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles, Languages, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { Message, Language } from "../types";

interface ChatAssistantProps {
  language: Language;
  userId: string;
}

export default function ChatAssistant({ language, userId }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update greeting when language changes
  useEffect(() => {
    const greetings: Record<Language, string> = {
      en: `Hello ${userId}! I am JanaSeva, your government scheme assistant. I can help you find schemes, check eligibility, and guide you through applications.`,
      hi: `नमस्ते ${userId}! मैं जनसेवा हूँ, आपकी सरकारी योजना सहायक। मैं योजनाओं को खोजने, पात्रता की जांच करने और आवेदन में आपकी मदद कर सकता हूँ।`,
      te: `నమస్కారం ${userId}! నేను జనసేవ, మీ ప్రభుత్వ పథకాల సహాయకుడిని. పథకాలను కనుగొనడంలో, అర్హతను తనిఖీ చేయడంలో మరియు దరఖాస్తు చేయడంలో నేను మీకు సహాయం చేస్తాను.`,
      ta: `வணக்கம் ${userId}! நான் JanaSeva, உங்கள் அரசு திட்ட உதவியாளர். திட்டங்களைக் கண்டறியவும், தகுதியைச் சரிபார்க்கவும், விண்ணப்பிக்கவும் நான் உங்களுக்கு உதவுவேன்.`,
      bn: `নমস্কার ${userId}! আমি জনসেবা, আপনার সরকারি স্কিম সহকারী। আমি আপনাকে স্কিম খুঁজে পেতে, যোগ্যতা যাচাই করতে এবং আবেদনের নির্দেশিকা দিতে সাহায্য করতে পারি।`,
      kn: `ನಮಸ್ಕಾರ ${userId}! ನಾನು ಜನಸೇವೆ, ನಿಮ್ಮ ಸರ್ಕಾರಿ ಯೋಜನಾ ಸಹಾಯಕ. ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು, ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.`
    };

    setMessages([
      {
        role: "assistant",
        content: greetings[language],
        timestamp: new Date().toISOString(),
        language: language
      }
    ]);
  }, [language, userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      language: language
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || "http://localhost:5000") : "";
      const res = await fetch(`${apiUrl}/api/gemini/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: messages, userInput: input, language })
      });
      if (!res.ok) {
        const text = await res.text();
        let errorMessage = `Server error (${res.status})`;
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch { /* response was not JSON */ }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      const response = data.text;

      const assistantMsg: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
        language: language
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      const assistantMsg: Message = {
        role: "assistant",
        content: `Chat Error: ${error.message || "Failed to communicate with assistant. Please try again."}`,
        timestamp: new Date().toISOString(),
        language: language
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col gap-3 py-2">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Bot className="size-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">JanaSeva AI</h2>
            <div className="flex items-center gap-2">
              <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Online & Multilingual</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-600" onClick={() => setMessages([messages[0]])}>
            <Trash2 className="size-5" />
          </Button>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 flex gap-2 py-1.5 px-3">
            <Languages className="size-3" /> Multi-Language Support Active
          </Badge>
        </div>
      </div>

      <Card className="flex-1 min-h-0 flex flex-col border-indigo-100 shadow-xl overflow-hidden bg-white/50 backdrop-blur-xl">
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full px-6 py-8" ref={scrollRef}>
            <div className="space-y-8">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className={`size-10 rounded-xl shadow-sm border ${msg.role === 'user' ? 'bg-white border-slate-100' : 'bg-indigo-600 border-indigo-500'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="size-full flex items-center justify-center text-white">
                        <Sparkles className="size-5" />
                      </div>
                    ) : (
                      <div className="size-full flex items-center justify-center text-indigo-600 bg-white">
                        <User className="size-5" />
                      </div>
                    )}
                  </Avatar>
                  <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-indigo-50 text-slate-800 rounded-tl-none'
                    }`}>
                      <div className="prose prose-sm prose-inherit max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <Avatar className="size-10 rounded-xl bg-indigo-600 border-indigo-500 flex items-center justify-center text-white shadow-sm">
                    <Sparkles className="size-5 animate-pulse" />
                  </Avatar>
                  <div className="bg-white border border-indigo-50 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <div className="size-1.5 bg-indigo-200 rounded-full animate-bounce" />
                    <div className="size-1.5 bg-indigo-400 rounded-full animate-bounce animation-delay-200" />
                    <div className="size-1.5 bg-indigo-600 rounded-full animate-bounce animation-delay-400" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 bg-white border-t border-indigo-50">
          <div className="relative w-full flex items-center gap-2">
            <Input 
              className="flex-1 rounded-full border-indigo-50 bg-slate-50 focus-visible:ring-indigo-600 h-12 pl-6 pr-14"
              placeholder="Ask anything about government schemes..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <Button 
              size="icon" 
              className="absolute right-1 size-10 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              <Send className="size-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <div className="flex flex-wrap gap-2 shrink-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-full mb-0">Try asking:</p>
        {[
          "What is FSI scheme?",
          "Check documentation for health card",
          "Education loan requirements",
          "Pension eligibility for seniors"
        ].map(suggestion => (
          <button
            key={suggestion}
            onClick={() => setInput(suggestion)}
            className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 hover:bg-indigo-100 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
