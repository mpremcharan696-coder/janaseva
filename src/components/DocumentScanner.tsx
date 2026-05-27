/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from "react";
import { Camera, Upload, ShieldCheck, AlertCircle, Loader2, Sparkles, X, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { Progress } from "@/src/components/ui/progress";
import { Message, Language } from "../types";
import { translations } from "../lib/i18n";

interface DocumentScannerProps {
  language: Language;
}

export default function DocumentScanner({ language }: DocumentScannerProps) {
  const t = translations[language];
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setReport(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/gemini/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: image, schemeName: "General Scheme Application", language })
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
      setReport(data.text);
    } catch (error: any) {
      console.error("OCR error:", error);
      setReport(`### Error Verifying Document\n\nFailed to scan or verify the document: ${error.message || "Unknown Error"}. Please ensure the image is clear and try again.`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-indigo-950 flex items-center gap-2">
            <ShieldCheck className="size-8 text-indigo-600" /> {t.vault.title}
          </h2>
          <p className="text-slate-500">Scan and pre-verify your identity documents for faster processing.</p>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 py-1 px-3">
          <Sparkles className="size-3 mr-1" /> AI-Powered OCR
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload/Camera Section */}
        <div className="space-y-6">
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 overflow-hidden relative group">
            <CardContent className="p-0">
              {image ? (
                <div className="relative aspect-[4/3]">
                  <img src={image} alt="Uploaded document" className="w-full h-full object-contain" />
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="absolute top-2 right-2 rounded-full size-8"
                    onClick={() => { setImage(null); setReport(null); }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center p-12 space-y-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="size-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                    <Camera className="size-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-700">{t.vault.scan_new}</p>
                    <p className="text-xs text-slate-400">Supports JPG, PNG (Max 5MB)</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload} 
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="rounded-xl h-12"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 size-4" /> Choose File
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12 shadow-lg shadow-indigo-100"
              disabled={!image || analyzing}
              onClick={handleVerify}
            >
              {analyzing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ShieldCheck className="mr-2 size-4" />}
              Verify Now
            </Button>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex gap-3">
              <AlertCircle className="size-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-900 leading-none mb-1">Upload Guide</p>
                <ul className="text-xs text-amber-800/70 list-disc list-inside space-y-1">
                  <li>Ensure the document is well-lit and not blurry.</li>
                  <li>Avoid glare from your camera flash.</li>
                  <li>Place the document on a dark, flat surface.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <Card className="h-full min-h-[400px] border-indigo-100">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                Verification Report
              </CardTitle>
              <CardDescription>AI analysis of your document</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!report && !analyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 text-slate-400">
                  <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <Loader2 className="size-10 opacity-20" />
                  </div>
                  <p className="max-w-[200px] text-sm">Upload a document to see the AI verification report here.</p>
                </div>
              ) : analyzing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-indigo-600">
                      <span>Scanning Text...</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-1.5" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-4 bg-slate-100 rounded-full animate-pulse w-full" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm prose-indigo max-w-none">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="size-5" /> Verification Successful
                  </div>
                  <ReactMarkdown>{report || ""}</ReactMarkdown>
                </div>
              )}
            </CardContent>
            {report && (
              <CardFooter className="bg-slate-50 border-t p-4 flex justify-end">
                <Button variant="ghost" size="sm" className="text-indigo-600 font-bold rounded-lg">
                  Integrate with Profile
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
