/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Filter, ArrowRight, ExternalLink, Info, CheckCircle2, FileText, Clock, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { useState, useEffect } from "react";
import { Scheme, Language, LocalizedScheme, DbScheme } from "../types";
import { MOCK_SCHEMES } from "../constants";
import ReactMarkdown from "react-markdown";

interface SchemeLibraryProps {
  onViewDetails: (scheme: Scheme) => void;
  language: Language;
}

export default function SchemeLibrary({ onViewDetails, language }: SchemeLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState("");

  const categories = ["All", "Agriculture", "Education", "Healthcare", "Employment", "Social Welfare"];

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
        const res = await fetch(`${apiUrl}/api/schemes`);
        
        let dbSchemes: Scheme[] = [];
        
        if (res.ok) {
          const data: DbScheme[] = await res.json();
          console.log("Fetched DB Schemes:", data);
          
          dbSchemes = data.map(db => ({
            id: String(db.id),
            name: db.title,
            category: db.category as Scheme['category'],
            description: db.benefits || "No detailed description available.",
            shortDescription: (db.benefits || "").substring(0, 100) + "...",
            eligibility: db.eligibility_criteria ? Object.keys(db.eligibility_criteria) : [],
            benefits: [db.benefits || ""],
            documentation: db.documents_required || [],
            procedures: db.application_process ? [db.application_process] : [],
            estimatedProcessingTime: "15 Days",
            translations: {}
          }));
        } else {
          console.warn("Failed to fetch schemes, falling back to mock data");
        }
        
        setSchemes([...dbSchemes, ...MOCK_SCHEMES]);
        
      } catch (err) {
        console.error("Error fetching DB schemes:", err);
        // Fallback to mock schemes if DB is totally unreachable
        setSchemes([...MOCK_SCHEMES]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const filteredSchemes = schemes.filter(scheme => {
    const localized = (scheme.translations?.[language] as LocalizedScheme) || {
      name: scheme.name,
      description: scheme.description,
      shortDescription: scheme.shortDescription,
      procedures: scheme.procedures
    };
    const matchesSearch = localized.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         localized.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });


  const handleSearchSubmit = async () => {
    const query = searchTerm.trim();
    if (!query) return;

    if (filteredSchemes.length > 0) {
      setAiAnswer(null);
      return;
    }

    setSearchedTerm(query);
    setAiLoading(true);
    setAiAnswer(null);
    setAiError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
      const res = await fetch(`${apiUrl}/api/gemini/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: [],
          userInput: `Provide a detailed explanation of the government scheme: "${query}". Please structure it with: 1. Eligibility Criteria, 2. Benefits, 3. Eligible Regions, 4. Required Documents, and 5. Application Roadmap.`,
          language
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.text || "";
        // Detect error responses that would crash ReactMarkdown
        if (text.startsWith("Chat error:") || text.startsWith("Error") || text.includes("API key")) {
          setAiError("AI service is temporarily unavailable. Please try again later.");
        } else if (text) {
          setAiAnswer(text);
        } else {
          setAiError("No details found for this scheme.");
        }
      } else {
        setAiError("Failed to retrieve scheme details from AI. Please try again later.");
      }
    } catch (err) {
      console.error("AI Scheme Library Search Error:", err);
      setAiError("Error connecting to the AI service. Please check your connection.");
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-slate-600 font-medium">Loading government schemes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
        <AlertCircle className="size-5" />
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">Scheme Library</h2>
            <p className="text-slate-500 text-lg">Browse & explore all active government initiatives nationwide.</p>
          </div>
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input 
              placeholder="Search by name, keyword, or benefit..." 
              className="pl-12 h-14 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-indigo-600"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (aiAnswer || aiError) {
                  setAiAnswer(null);
                  setAiError(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                }
              }}
            />
          </div>
        </div>

        {aiLoading && (
          <Card className="border-indigo-100 shadow-md bg-white rounded-3xl overflow-hidden animate-pulse">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-indigo-500 animate-spin" />
                <span className="font-bold text-slate-700">JanaSeva AI is searching details for "{searchedTerm}"...</span>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        )}

        {aiError && filteredSchemes.length === 0 && (
          <Card className="border-amber-200/50 shadow-lg bg-gradient-to-br from-amber-50/40 via-white to-white rounded-3xl overflow-hidden transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">Could not fetch AI details</p>
                <p className="text-slate-500 text-xs mt-1">{aiError}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setAiError(null)} 
                className="text-slate-400 hover:text-amber-600 rounded-xl px-3 py-1 font-bold text-xs shrink-0"
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {aiAnswer && filteredSchemes.length === 0 && (
          <Card className="border-indigo-200/50 shadow-xl bg-gradient-to-br from-indigo-50/40 via-white to-white rounded-3xl overflow-hidden transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-indigo-100/30 p-6 border-b border-indigo-100/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-indigo-950">JanaSeva AI Insights</CardTitle>
                  <CardDescription className="text-xs font-semibold text-indigo-600/80 uppercase tracking-widest">Detailed AI Breakdown for "{searchedTerm}"</CardDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setAiAnswer(null)} 
                className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl px-4 py-2 font-bold text-xs"
              >
                Dismiss
              </Button>
            </CardHeader>
            <CardContent className="p-8 prose prose-slate max-w-none prose-sm prose-headings:text-indigo-950 prose-a:text-indigo-600">
              <div className="space-y-4 text-slate-700 leading-relaxed font-normal">
                <ReactMarkdown>{aiAnswer}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                selectedCategory === cat 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSchemes.map((scheme) => {
          const localized = (scheme.translations?.[language] as LocalizedScheme) || {
            name: scheme.name,
            description: scheme.description,
            shortDescription: scheme.shortDescription,
            procedures: scheme.procedures
          };

          return (
            <Card key={scheme.id} className="border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 rounded-3xl group overflow-hidden bg-white flex flex-col">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
                    {scheme.category}
                  </Badge>
                  <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors">
                    <FileText className="size-6" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{localized.name}</CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500 line-clamp-2 mt-2 leading-relaxed">{localized.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1">
                <Accordion className="w-full">
                  <AccordionItem value="details" className="border-none">
                    <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:no-underline py-4">View Full Procedures</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4 text-sm text-slate-600 border-t border-slate-50">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-xs">
                          {localized.description}
                        </div>
                        <div className="space-y-3">
                          <p className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                            <CheckCircle2 className="size-4 text-emerald-500" /> Key Steps
                          </p>
                          <ul className="space-y-3 pl-2">
                            {localized.procedures.map((step, i) => (
                              <li key={i} className="flex gap-3 text-[11px] leading-relaxed">
                                <span className="font-bold text-indigo-600">{i+1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="p-8 pt-0 bg-slate-50/50 border-t border-slate-100 mt-auto flex gap-3">
                <Button 
                  onClick={() => onViewDetails(scheme)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold py-6 text-xs h-auto shadow-lg shadow-indigo-100"
                >
                  Apply Now <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button 
                  onClick={() => onViewDetails(scheme)}
                  variant="outline" 
                  size="icon" 
                  className="size-12 rounded-xl border-slate-200"
                >
                  <Info className="size-4 text-slate-400 font-bold" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {filteredSchemes.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Search className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No schemes found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search keywords or category filters.</p>
          <Button variant="link" onClick={() => {setSearchTerm(""); setSelectedCategory("All");}} className="text-indigo-600 mt-4 font-bold">Clear all filters</Button>
        </div>
      )}
    </div>
  );
}

