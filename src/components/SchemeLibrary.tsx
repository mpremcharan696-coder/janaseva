/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Filter, ArrowRight, ExternalLink, Info, CheckCircle2, FileText, Clock, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { useState, useEffect } from "react";
import { Scheme, Language, LocalizedScheme, DbScheme } from "../types";
import { MOCK_SCHEMES } from "../constants";

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
            id: db.id,
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

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

