/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, User, Briefcase, MapPin, Calculator, Sparkles, Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Progress } from "@/src/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import ReactMarkdown from "react-markdown";
import { UserProfile } from "../types";
import { MOCK_SCHEMES } from "../constants";
import { cn } from "@/src/lib/utils";

interface EligibilityFormProps {
  onComplete: (profile: UserProfile) => void;
}

export default function EligibilityForm({ onComplete }: EligibilityFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: 0,
    income: 0,
    occupation: "",
    location: "",
    gender: "",
    demographics: {
      isFarmer: false,
      isStudent: false,
      isSeniorCitizen: false,
      isDifferentlyAbled: false,
      isStartupFounder: false,
      isUnemployed: false,
      isFemaleStudent: false,
      isWorkingFemale: false,
      isPregnantWoman: false,
      isWidow: false,
      isSingleMother: false,
      isOtherProfession: false,
      familySize: 1
    }
  });

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/gemini/eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, schemes: MOCK_SCHEMES })
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
      setResult(data.text);
    } catch (error: any) {
      console.error("Eligibility reasoning error:", error);
      setResult(`### Error Analyzing Eligibility\n\nFailed to calculate eligibility results: ${error.message || "Unknown Error"}. Please try again later.`);
    } finally {
      setLoading(false);
      onComplete(profile);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-indigo-100 shadow-2xl overflow-hidden rounded-3xl">
          <div className="bg-indigo-950 p-10 text-white text-center relative">
            <div className="size-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20 rotate-3">
              <Sparkles className="size-10 text-indigo-300" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Your Eligibility Report</h2>
            <p className="text-indigo-200 mt-2 font-medium opacity-80 italic">Curated by SchemeSetu Engine for {profile.name}</p>
            
            {/* Background blur blobs */}
            <div className="absolute top-0 right-0 size-32 bg-indigo-500/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 size-32 bg-purple-500/20 blur-3xl rounded-full" />
          </div>
          <CardContent className="p-10 bg-white">
            <div className="prose prose-slate max-w-none prose-h3:text-indigo-950 prose-strong:text-indigo-700 prose-p:text-slate-600 prose-p:leading-relaxed">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Button variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100" onClick={() => setResult(null)}>
              Modify Profile Details
            </Button>
            <div className="flex gap-4 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none border-slate-200">Download PDF</Button>
              <Button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 px-8">
                Start Applications
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest border border-indigo-100 mb-2">
          <Calculator className="size-3" /> Step-by-Step Analysis
        </div>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Intelligent Eligibility Engine</h2>
        <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">Our AI analyzes your profile against {MOCK_SCHEMES.length}+ schemes to find direct matches and benefits.</p>
        <div className="pt-8 max-w-xs mx-auto">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
            <span>Progress</span>
            <span>{Math.round((step / 2) * 100)}%</span>
          </div>
          <Progress value={(step / 2) * 100} className="h-2 bg-slate-100" />
        </div>
      </div>

      <Card className="border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-10 md:p-14">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="grid gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Full Name as per Aadhaar</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      id="name" 
                      placeholder="e.g. Ramesh Kumar" 
                      className="pl-12 h-14 rounded-2xl border-slate-200 focus-visible:ring-indigo-600 bg-slate-50/50" 
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="age" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Current Age</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      placeholder="e.g. 45" 
                      className="h-14 rounded-2xl border-slate-200 focus-visible:ring-indigo-600 bg-slate-50/50" 
                      value={profile.age || ""}
                      onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Gender</Label>
                    <div className="flex gap-3">
                      {["Male", "Female", "Other"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setProfile({ ...profile, gender: g as any })}
                          className={cn(
                            "flex-1 h-12 rounded-2xl border font-bold text-sm transition-all",
                            profile.gender === g
                              ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-100"
                              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 sm:col-span-2">
                    <Label htmlFor="familySize" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Total Family Members</Label>
                    <Input 
                      id="familySize" 
                      type="number" 
                      placeholder="e.g. 4"
                      className="h-14 rounded-2xl border-slate-200 focus-visible:ring-indigo-600 bg-slate-50/50" 
                      value={profile.demographics.familySize || ""}
                      onChange={e => setProfile({
                        ...profile, 
                        demographics: {...profile.demographics, familySize: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="grid gap-8">
                <div className="space-y-3">
                  <Label htmlFor="occupation" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Primary Occupation</Label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      id="occupation" 
                      placeholder="e.g. Small-scale Farming" 
                      className="pl-12 h-14 rounded-2xl border-slate-200 focus-visible:ring-indigo-600 bg-slate-50/50"
                      value={profile.occupation}
                      onChange={e => setProfile({...profile, occupation: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="income" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Annual Household Income (₹)</Label>
                  <div className="relative group">
                    <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      id="income" 
                      type="number" 
                      placeholder="e.g. 250000" 
                      className="pl-12 h-14 rounded-2xl border-slate-200 focus-visible:ring-indigo-600 bg-slate-50/50"
                      value={profile.income || ""}
                      onChange={e => setProfile({...profile, income: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Current Residential Location</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                      id="location" 
                      placeholder="e.g. Bhiwani, Haryana" 
                      className="pl-12 h-14 rounded-2xl border-slate-200 focus-visible:ring-indigo-600 bg-slate-50/50"
                      value={profile.location}
                      onChange={e => setProfile({...profile, location: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="p-10 md:p-14 pt-0 flex justify-between items-center bg-white">
          <Button 
            variant="ghost" 
            disabled={step === 1} 
            onClick={prevStep}
            className="rounded-xl px-6 h-12 text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft className="mr-2 size-4" /> Go Back
          </Button>
          
          <div className="flex gap-4">
            {step < 2 ? (
              <Button onClick={nextStep} className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-10 h-12 font-bold shadow-lg shadow-slate-200">
                Continue <ArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-12 h-14 font-bold shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95"
              >
                {loading ? <><Loader2 className="mr-2 size-5 animate-spin" /> Processing Profile...</> : <><Sparkles className="mr-2 size-5" /> Analyze Eligibility</>}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100/50 flex gap-5 items-center shadow-sm">
        <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 flex-shrink-0">
          <ShieldCheck className="size-7" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-950">Secure & Confidential</p>
          <p className="text-xs text-emerald-800/70 font-medium">Your data is processed using end-to-end encryption. We never share your personal profile with third-party vendors without explicit consent.</p>
        </div>
      </div>
    </div>
  );
}
