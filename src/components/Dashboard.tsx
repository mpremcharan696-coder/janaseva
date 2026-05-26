/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plus, Search, ExternalLink, Clock, CheckCircle2, AlertCircle, FileText, ArrowRight, Sparkles, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { UserProfile, ApplicationStatus, Language, Scheme, DbScheme } from "../types";
import { useState, useEffect } from "react";
import { translations } from "../lib/i18n";
import { MOCK_SCHEMES } from "../constants";

interface DashboardProps {
  userProfile: UserProfile | null;
  applications: ApplicationStatus[];
  onCheckEligibility: () => void;
  onOpenChat: () => void;
  onViewSchemeDetails: (scheme: Scheme) => void;
  language: Language;
}

export default function Dashboard({ userProfile, applications, onCheckEligibility, onOpenChat, onViewSchemeDetails, language }: DashboardProps) {
  const t = translations[language];
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
        const res = await fetch(`${apiUrl}/api/schemes`);
        
        let dbSchemes: Scheme[] = [];
        
        if (res.ok) {
          const data: DbScheme[] = await res.json();
          console.log("Fetched DB schemes:", data);
          
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
        }
        
        // Merge DB schemes with MOCK_SCHEMES temporarily for development fallback
        setSchemes([...dbSchemes, ...MOCK_SCHEMES]);
        
      } catch (err) {
        console.error("Error fetching schemes:", err);
        // Fallback entirely to mock data if DB is unreachable
        setSchemes([...MOCK_SCHEMES]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const getRecommendedSchemes = () => {
    if (!userProfile) {
      return schemes.slice(0, 2).map(s => ({ 
         scheme: s, 
         score: 0, 
         matchPercentage: 90 
      }));
    }

    const occupation = userProfile.occupation.toLowerCase();
    const gender = userProfile.gender;
    
    // Extract our specific demographic booleans
    const {
      isFarmer,
      isStudent,
      isSeniorCitizen,
      isStartupFounder,
      isUnemployed,
      isFemaleStudent,
      isWorkingFemale,
      isPregnantWoman,
      isWidow,
      isSingleMother,
      isOtherProfession
    } = userProfile.demographics;

    const isFemale = gender === "Female" || isFemaleStudent || isWorkingFemale || isPregnantWoman || isWidow || isSingleMother;

    // STRICT FILTERING: Only recommend if the user matches the target audience
    const strictFiltered = schemes.filter(scheme => {
      const e = scheme.eligibility; // Array of keys from JSONB
      
      // If there are no specific eligibility rules, it's open to everyone
      if (!e || e.length === 0) return true;
      
      // 1. Farmer Schemes
      if (scheme.category === "Agriculture" && isFarmer) return true;
      
      // 2. Student / Education Schemes
      if (scheme.category === "Education" && (isStudent || isFemaleStudent)) return true;
      
      // 3. Startup Founder Schemes
      if (e.includes("profession") && isStartupFounder) return true;
      
      // 4. Unemployed Schemes
      if (e.includes("is_employed") && isUnemployed) return true;
      
      // 5. Women-Specific Schemes
      if (e.includes("is_single_mother") && isSingleMother) return true;
      if (e.includes("is_widow") && isWidow) return true;
      
      // 6. Other Professions / Laborers
      if (e.includes("sector") && isOtherProfession) return true;
      
      // 7. Senior Citizens
      if (isSeniorCitizen && scheme.category === "Healthcare") return true;

      // If it doesn't match their exact persona, hide it
      return false;
    });

    // Score the remaining eligible schemes
    const scored = strictFiltered.map(scheme => {
      let score = 80; // Baseline for passing the strict filter
      
      // Boost score if it's a highly targeted female scheme
      if (isFemale && scheme.category === "Social Welfare") score += 10;
      if (isStartupFounder && scheme.category === "Employment") score += 15;

      const idStr = String(scheme.id);
      const matchPercentage = Math.min(99, score + (idStr.charCodeAt(idStr.length - 1) % 10));

      return { scheme, score, matchPercentage };
    });

    // Sort and return top 2
    return scored.sort((a, b) => b.score - a.score).slice(0, 2);
  };

  const recommendations = getRecommendedSchemes();

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Full Width Column: Recommendations */}
      <div className="col-span-1 flex flex-col gap-8">
        {/* Main Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-indigo-950 p-8 text-white shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold">{t.dashboard.welcome_back.replace('{name}', userProfile?.name || "Ramesh")}</h2>
              <p className="text-indigo-200 text-lg max-w-md">
                {t.dashboard.tagline} {t.dashboard.found_matches.replace('{count}', recommendations.length.toString())}
              </p>
              <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                <Button onClick={onCheckEligibility} className="bg-white text-indigo-950 hover:bg-indigo-50 rounded-xl px-6 py-6 h-auto font-bold border-none shadow-xl transition-transform hover:-translate-y-1">
                  {t.dashboard.check_new} <Plus className="ml-2 size-5" />
                </Button>
                <Button onClick={onOpenChat} variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-xl px-6 py-6 h-auto font-bold backdrop-blur-md">
                  {t.dashboard.talk_assistant} <ArrowRight className="ml-2 size-5" />
                </Button>
              </div>
            </div>
            <div className="hidden xl:block">
              <div className="size-44 bg-white/10 rounded-3xl p-4 backdrop-blur-xl border border-white/20 rotate-3">
                <div className="size-full bg-indigo-500/20 rounded-2xl flex items-center justify-center animate-pulse">
                  <CheckCircle2 className="size-20 text-indigo-400" />
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 size-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -bottom-12 -left-12 size-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </section>

        {/* Recommended Schemes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="size-5 text-indigo-600" /> {t.dashboard.recommended}
            </h3>
            <Button variant="link" className="text-indigo-600 font-bold p-0">View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-2 py-8 text-center text-slate-500 font-medium">Loading recommendations...</div>
            ) : recommendations.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-slate-500 font-medium">No active schemes currently available.</div>
            ) : recommendations.map((item, idx) => {
              const { scheme, matchPercentage } = item;
              if (!scheme) return null;

              const localized = (scheme.translations?.[language] as any) || {
                name: scheme.name,
                shortDescription: scheme.shortDescription,
              };

              return (
                <Card key={scheme.id} className="relative overflow-hidden border-indigo-100/50 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 group">
                  <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl ${idx === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {matchPercentage}% Match
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-lg font-bold group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{localized.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-2">
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{localized.shortDescription}</p>
                  </CardContent>
                  <CardFooter className="px-6 py-6 pt-2 flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg px-4 h-9"
                      onClick={() => onViewSchemeDetails(scheme)}
                    >
                      Apply Now
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs font-bold rounded-lg px-4 h-9 border-slate-200"
                      onClick={() => onViewSchemeDetails(scheme)}
                    >
                      Details
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

