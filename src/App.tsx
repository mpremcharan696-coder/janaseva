/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Bot, Info, AlertCircle, Loader2, Sparkles, UserCircle, LogOut } from "lucide-react";
import { Toaster } from "@/src/components/ui/sonner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";

import Dashboard from "./components/Dashboard";
import EligibilityForm from "./components/EligibilityForm";
import ChatAssistant from "./components/ChatAssistant";
import SchemeLibrary from "./components/SchemeLibrary";
import UserProfileForm from "./components/UserProfileForm";
import LoginPortal from "./components/LoginPortal";

import { UserProfile, ApplicationStatus, Language, Scheme } from "./types";
import { translations } from "./lib/i18n";
import SchemeDetailsDialog from "./components/SchemeDetailsDialog";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
const defaultDemographics: UserProfile["demographics"] = {
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
  familySize: 1,
};

const normalizeProfile = (profile: Partial<UserProfile> | null | undefined): UserProfile | null => {
  if (!profile) return null;

  return {
    ...profile,
    name: profile.name || "",
    age: Number(profile.age) || 0,
    income: Number(profile.income) || 0,
    occupation: profile.occupation || "",
    location: profile.location || "",
    gender: profile.gender || "",
    demographics: {
      ...defaultDemographics,
      ...(profile.demographics || {}),
    },
  };
};

const createDefaultProfile = (email: string | null, uid: string): UserProfile => {
  const nameFromEmail = email ? email.split("@")[0] : "Citizen";
  const citizenId = `JS-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    id: uid,
    name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
    age: 30,
    income: 0,
    occupation: "Other",
    location: "Other",
    gender: "Other",
    email: email || "",
    jana_seva_id: citizenId,
    demographics: defaultDemographics,
  };
};

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];

  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [isSchemeDialogOpen, setIsSchemeDialogOpen] = useState(false);

  const handleOpenSchemeDetails = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setIsSchemeDialogOpen(true);
  };

  // Ref to track if user just signed up — prevents onAuthStateChanged from overriding the onboarding flow
  const isNewSignUpRef = useRef(false);

  const [sessionEmail, setSessionEmail] = useState<string | null>(() => localStorage.getItem("sessionEmail"));
  const [sessionUid, setSessionUid] = useState<string | null>(() => localStorage.getItem("sessionUid"));
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const cachedUid = localStorage.getItem("sessionUid");
    if (cachedUid) {
      const cached = localStorage.getItem(`userProfile_${cachedUid}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error("Failed to parse cached user profile", e);
        }
      }
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session from Firebase and backend database on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setSessionEmail(user.email || "");
        setSessionUid(user.uid);
        localStorage.setItem("sessionEmail", user.email || "");
        localStorage.setItem("sessionUid", user.uid);

        // If this is a fresh signup triggered by LoginPortal, skip auto-profile creation
        // and let the onboarding form handle it
        if (isNewSignUpRef.current) {
          isNewSignUpRef.current = false;
          setShowOnboarding(true);
          setUserProfile(null);
          setAuthLoading(false);
          return;
        }

        // Load local cache immediately so the user doesn't see a blank screen
        const cachedProfileStr = localStorage.getItem(`userProfile_${user.uid}`);
        if (cachedProfileStr) {
          try {
            const cachedProfile = JSON.parse(cachedProfileStr);
            setUserProfile(cachedProfile);
            setShowOnboarding(false);
          } catch (e) {
            console.error("Failed to parse cached profile", e);
          }
        }

        const cachedAppsStr = localStorage.getItem(`userApplications_${user.uid}`);
        if (cachedAppsStr) {
          try {
            setActiveApplications(JSON.parse(cachedAppsStr));
          } catch (e) {
            console.error("Failed to parse cached applications", e);
          }
        }

        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const res = await fetch(`${apiUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, uid: user.uid }),
          });
          if (res.ok) {
            const data = await res.json();
            const profile = normalizeProfile(data.profile);
            if (data.exists && profile) {
              setUserProfile(profile);
              localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(profile));
              if (data.applications && data.applications.length > 0) {
                setActiveApplications(data.applications);
                localStorage.setItem(`userApplications_${user.uid}`, JSON.stringify(data.applications));
              }
              setShowOnboarding(false);
            } else {
              // No profile in backend — for existing login, create a default profile
              if (cachedProfileStr) {
                setShowOnboarding(false);
              } else {
                const defaultProf = createDefaultProfile(user.email, user.uid);
                setUserProfile(defaultProf);
                localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(defaultProf));
                setShowOnboarding(false);

                // Auto-save to database so it exists
                fetch(`${apiUrl}/api/auth/register`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: user.email, uid: user.uid, profile: defaultProf }),
                }).catch(err => console.error("Auto-registration on refresh failed:", err));
              }
            }
          } else {
            console.warn("Backend auth request failed, using cached session.");
            if (cachedProfileStr) {
              setShowOnboarding(false);
            } else {
              const defaultProf = createDefaultProfile(user.email, user.uid);
              setUserProfile(defaultProf);
              localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(defaultProf));
              setShowOnboarding(false);
            }
          }
        } catch (err) {
          console.error("Failed to sync session from database, running offline/cached:", err);
          if (cachedProfileStr) {
            setShowOnboarding(false);
          } else {
            const defaultProf = createDefaultProfile(user.email, user.uid);
            setUserProfile(defaultProf);
            localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(defaultProf));
            setShowOnboarding(false);
          }
        } finally {
          setAuthLoading(false);
        }
      } else {
        setSessionEmail(null);
        setSessionUid(null);
        setUserProfile(null);
        setShowOnboarding(false);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (email: string, profile: any, applications: any[], uid: string) => {
    const normalizedProfile = normalizeProfile(profile);
    setSessionEmail(email);
    setSessionUid(uid);
    localStorage.setItem("sessionEmail", email);
    localStorage.setItem("sessionUid", uid);

    if (!normalizedProfile) {
      // No profile from backend — create a default for existing login users
      const defaultProf = createDefaultProfile(email, uid);
      setUserProfile(defaultProf);
      localStorage.setItem(`userProfile_${uid}`, JSON.stringify(defaultProf));
      setShowOnboarding(false);

      // Auto-save to database
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        fetch(`${apiUrl}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, uid, profile: defaultProf }),
        }).catch(err => console.error("Auto-registration on login failed:", err));
      } catch (err) {
        console.error("Auto-registration fetch on login failed:", err);
      }
      return;
    }

    setUserProfile(normalizedProfile);
    localStorage.setItem(`userProfile_${uid}`, JSON.stringify(normalizedProfile));
    setShowOnboarding(false);
    
    if (applications && applications.length > 0) {
      setActiveApplications(applications);
      localStorage.setItem(`userApplications_${uid}`, JSON.stringify(applications));
    }
  };

  const handleNewUser = (email: string, uid: string) => {
    // Set the ref BEFORE Firebase auth triggers onAuthStateChanged
    isNewSignUpRef.current = true;

    // Clear any old stored data for this user so they start fresh
    localStorage.removeItem(`userProfile_${uid}`);
    localStorage.removeItem(`userApplications_${uid}`);

    setSessionEmail(email);
    setSessionUid(uid);
    localStorage.setItem("sessionEmail", email);
    localStorage.setItem("sessionUid", uid);
    setUserProfile(null);
    setShowOnboarding(true);
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out of Firebase:", error);
    } finally {
      // Clear session identifiers, but retain cached profile data for future logins
      localStorage.removeItem("sessionEmail");
      localStorage.removeItem("sessionUid");
      setSessionEmail(null);
      setSessionUid(null);
      setUserProfile(null);
      setShowOnboarding(false);
      toast.success("Signed out successfully");
    }
  };
  const [activeApplications, setActiveApplications] = useState<ApplicationStatus[]>(() => {
    const cachedUid = localStorage.getItem("sessionUid");
    if (cachedUid) {
      const cached = localStorage.getItem(`userApplications_${cachedUid}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error("Failed to parse cached user applications", e);
        }
      }
    }
    return [
      {
        id: "app_1",
        schemeId: "scheme_1",
        schemeName: "Farmer Support Initiative (FSI)",
        status: "In Review",
        appliedDate: "2026-04-15",
        lastUpdated: "2026-04-20",
        nextStep: "Verification by Block Officer"
      },
      {
        id: "app_2",
        schemeId: "scheme_2",
        schemeName: "Unified Education Scholarship",
        status: "Approved",
        appliedDate: "2026-03-10",
        lastUpdated: "2026-04-25",
        nextStep: "Grant Disbursement"
      }
    ];
  });
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleSaveProfile = async (profile: UserProfile) => {
    const occupation = (profile.occupation || "").toLowerCase();
    const inferredProfile = {
      ...profile,
      demographics: {
        ...defaultDemographics,
        ...profile.demographics,
        isFarmer: profile.demographics?.isFarmer || occupation.includes("farm") || occupation.includes("kisan") || occupation.includes("agri"),
        isStudent: profile.demographics?.isStudent || occupation.includes("student") || occupation.includes("study") || occupation.includes("college") || occupation.includes("school"),
        isSeniorCitizen: profile.demographics?.isSeniorCitizen || profile.age >= 60,
      }
    };

    // Save locally first
    setUserProfile(inferredProfile);
    if (sessionUid) {
      localStorage.setItem(`userProfile_${sessionUid}`, JSON.stringify(inferredProfile));
    }
    setShowOnboarding(false);
    setActiveTab("dashboard");

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (sessionEmail && sessionUid) {
        const res = await fetch(`${apiUrl}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sessionEmail, uid: sessionUid, profile: inferredProfile }),
        });
        if (res.ok) {
          const data = await res.json();
          const savedProfile = normalizeProfile(data.profile) || inferredProfile;
          setUserProfile(savedProfile);
          if (sessionUid) {
            localStorage.setItem(`userProfile_${sessionUid}`, JSON.stringify(savedProfile));
          }
          toast.success("Profile created and saved successfully!");
          return;
        }
      }
    } catch (err) {
      console.error("Failed to register profile on database:", err);
    }
  };

  const navItems = [
    { id: "dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { id: "chat", label: t.nav.schemesetu_ai, icon: Bot },
    { id: "library", label: t.nav.library, icon: Info },
    { id: "settings", label: t.nav.settings, icon: UserCircle },
  ];

  const langs = [
    { code: "en", label: "EN" },
    { code: "hi", label: "हि" },
    { code: "te", label: "తె" },
    { code: "ta", label: "த" },
    { code: "bn", label: "ব" },
    { code: "kn", label: "ಕ" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="size-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-2xl animate-pulse">
          <Sparkles className="size-8" />
        </div>
        <p className="text-slate-400 text-sm font-medium animate-pulse">Loading SchemeSetu...</p>
      </div>
    );
  }

  if (!sessionEmail) {
    return (
      <LoginPortal 
        onLoginSuccess={handleLoginSuccess}
        onNewUser={handleNewUser}
        language={language}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-white font-sans text-slate-900 overflow-hidden">
      <Toaster position="top-right" />
      
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-4 overflow-auto">
          <div className="max-w-4xl w-full py-12">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <div className="size-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-2xl">
                  <Sparkles className="size-8" />
                </div>
                <h1 className="text-4xl font-black text-indigo-950 tracking-tighter">SchemeSetu</h1>
              </motion.div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">{t.profile.onboarding_title}</h2>
              <p className="text-slate-500 font-medium">{t.profile.onboarding_subtitle}</p>
              
              <div className="flex justify-center gap-2 mt-6">
                {langs.map((l) => (
                  <Button
                    key={l.code}
                    variant={language === l.code ? "default" : "outline"}
                    onClick={() => setLanguage(l.code as Language)}
                    className="rounded-full px-4 h-8 text-[10px] uppercase font-black tracking-widest"
                  >
                    {l.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <UserProfileForm 
              initialProfile={null} 
              onSave={handleSaveProfile} 
              language={language} 
            />
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 bg-slate-900 flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-indigo-500 rounded-md flex items-center justify-center">
              <Sparkles className="size-4 text-white" />
            </div>
            <h1 className="text-white font-bold text-xl tracking-tight">SchemeSetu</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold opacity-60">{t.subtitle}</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full p-3 rounded-xl flex items-center gap-3 font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="size-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-indigo-900/40 border border-indigo-500/20 rounded-2xl p-4">
            <p className="text-white font-bold text-sm">Need Assistance?</p>
            <p className="text-indigo-300 text-[10px] mt-1 leading-relaxed">
              24/7 AI Multilingual Voice & Text Support is active.
            </p>
            <Button 
              onClick={() => setActiveTab("chat")}
              size="sm" 
              className="w-full mt-3 bg-white text-indigo-950 hover:bg-indigo-50 rounded-lg h-8 text-[11px] font-bold"
            >
              Open Support
            </Button>
          </div>

          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full mt-4 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400 rounded-xl h-10 text-xs font-bold"
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 
              Live: {userProfile?.name || "Ramesh Kumar"}
            </span>
            {userProfile?.jana_seva_id && (
              <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 font-bold">
                ID: {userProfile.jana_seva_id}
              </span>
            )}
            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="hidden md:inline">Income: ₹{userProfile?.income?.toLocaleString() || "4,50,000"}</span>
            <span className="text-slate-300 hidden lg:inline">|</span>
            <span className="hidden lg:inline">Location: {userProfile?.location || "Haryana"}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex bg-slate-100 rounded-full p-1 text-[10px] font-bold">
              {langs.map((l) => (
                <button 
                  key={l.code}
                  onClick={() => setLanguage(l.code as Language)}
                  className={`px-3 py-1.5 transition-all rounded-full ${
                    language === l.code 
                      ? "bg-white shadow-sm text-indigo-600" 
                      : "text-slate-500 hover:text-indigo-600"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-3 border-l border-slate-100 pl-6 cursor-pointer text-left hover:opacity-85 select-none focus:outline-none"
              >
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-slate-900 leading-none">Citizen Profile</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">Verified Account</p>
                </div>
                <div className="size-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 shadow-sm overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.name || 'Ramesh'}`} alt="Avatar" />
                </div>
              </button>

              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{userProfile?.name}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{sessionEmail}</p>
                      {userProfile?.jana_seva_id && (
                        <p className="text-[9px] text-indigo-600 font-mono mt-1 bg-indigo-50 px-1.5 py-0.5 rounded inline-block">
                          ID: {userProfile.jana_seva_id}
                        </p>
                      )}
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setActiveTab("settings");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors focus:outline-none cursor-pointer"
                      >
                        <UserCircle className="size-4 text-slate-500" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleSignOut();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors focus:outline-none cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8 pb-32 lg:pb-8 max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="dashboard" className="mt-0">
                    <Dashboard 
                      userProfile={userProfile} 
                      applications={activeApplications} 
                      onCheckEligibility={() => setActiveTab("eligibility")}
                      onOpenChat={() => setActiveTab("chat")}
                      onViewSchemeDetails={handleOpenSchemeDetails}
                      language={language}
                    />
                  </TabsContent>

                  <TabsContent value="eligibility" className="mt-0">
                    <EligibilityForm 
                      onComplete={handleSaveProfile} 
                    />
                  </TabsContent>

                  <TabsContent value="chat" className="mt-0">
                    <ChatAssistant language={language} userId={userProfile?.id || ""} userName={userProfile?.name || "Citizen"} />
                  </TabsContent>

                  <TabsContent value="library" className="mt-0">
                    <SchemeLibrary onViewDetails={handleOpenSchemeDetails} language={language} userProfile={userProfile} />
                  </TabsContent>

                  <TabsContent value="settings" className="mt-0">
                    <UserProfileForm 
                      initialProfile={userProfile} 
                      onSave={handleSaveProfile} 
                      language={language} 
                    />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>



        {/* Bottom Mobile Nav (Labels removed for polish) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:hidden w-[90%]">
          <div className="h-16 rounded-3xl bg-slate-900 backdrop-blur-xl border border-white/10 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex justify-around items-center">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`rounded-2xl p-3 transition-all ${
                  activeTab === item.id ? "bg-indigo-600 text-white" : "text-slate-400"
                }`}
              >
                <item.icon className="size-6" />
              </button>
            ))}
          </div>
        </div>

        <SchemeDetailsDialog 
          scheme={selectedScheme}
          isOpen={isSchemeDialogOpen}
          onClose={() => setIsSchemeDialogOpen(false)}
          language={language}
        />
      </main>
    </div>
  );
}


