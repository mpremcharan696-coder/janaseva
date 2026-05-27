import React, { useState } from "react";
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

interface LoginPortalProps {
  onLoginSuccess: (email: string, profile: any, applications: any[], uid: string) => void;
  onNewUser: (email: string, uid: string) => void;
  language: string;
}

export default function LoginPortal({ onLoginSuccess, onNewUser, language }: LoginPortalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    en: {
      title: "Welcome to SchemeSetu",
      subtitle: "Your secure gateway to unified government schemes and AI matching.",
      emailLabel: "Enter your Email Address",
      passwordLabel: "Enter your Password",
      emailPlaceholder: "name@example.com",
      emailBtnLogin: "Sign In with Email",
      emailBtnSignUp: "Create Account",
      googleBtn: "Sign in with Google",
      or: "or use your credentials",
      loading: "Connecting to SchemeSetu Core...",
      mockGoogleSubtitle: "Choose an account to continue to SchemeSetu",
    },
    hi: {
      title: "SchemeSetu में आपका स्वागत है",
      subtitle: "एकीकृत सरकारी योजनाओं और एआई मिलान के लिए आपका सुरक्षित पोर्टल।",
      emailLabel: "अपना ईमेल पता दर्ज करें",
      passwordLabel: "अपना पासवर्ड दर्ज करें",
      emailPlaceholder: "name@example.com",
      emailBtnLogin: "ईमेल के साथ साइन इन करें",
      emailBtnSignUp: "खाता बनाएं",
      googleBtn: "गूगल के साथ साइन इन करें",
      or: "या अपने क्रेडेंशियल्स का उपयोग करें",
      loading: "SchemeSetu कोर से जुड़ रहा है...",
      mockGoogleSubtitle: "SchemeSetu में जारी रखने के लिए एक खाता चुनें",
    }
  }[language as "en" | "hi"] || {
    title: "Welcome to SchemeSetu",
    subtitle: "Your secure gateway to unified government schemes and AI matching.",
    emailLabel: "Enter your Email Address",
    passwordLabel: "Enter your Password",
    emailPlaceholder: "name@example.com",
    emailBtnLogin: "Sign In with Email",
    emailBtnSignUp: "Create Account",
    googleBtn: "Sign in with Google",
    or: "or use your credentials",
    loading: "Connecting to SchemeSetu Core...",
    mockGoogleSubtitle: "Choose an account to continue to SchemeSetu",
  };

  const handleBackendAuth = async (userEmail: string, uid: string, isSignUpRequest: boolean) => {
    // For signup, always show the onboarding profile form
    if (isSignUpRequest) {
      onNewUser(userEmail, uid);
      return;
    }

    // For login, try to fetch existing profile from backend
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, uid }),
      });

      if (!res.ok) throw new Error("Auth request failed");

      const data = await res.json();
      if (data.exists) {
        onLoginSuccess(userEmail, data.profile, data.applications, uid);
      } else {
        // User exists in Firebase but no profile in DB — show onboarding
        onLoginSuccess(userEmail, null, [], uid);
      }
    } catch (err) {
      console.error(err);
      // Backend unreachable — let them in with no profile (onboarding will show)
      onLoginSuccess(userEmail, null, [], uid);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@") || !password) return;

    setIsLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const user = userCredential.user;
      await handleBackendAuth(user.email || email, user.uid, isSignUp);
    } catch (err: any) {
      console.error(err);
      const errorCode = err?.code || "";
      if (errorCode === "auth/user-not-found" || errorCode === "auth/invalid-credential") {
        // No account with this email — prompt to sign up
        setIsSignUp(true);
        alert("No account found with this email. Please create a new account.");
      } else if (errorCode === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else if (errorCode === "auth/email-already-in-use") {
        setIsSignUp(false);
        alert("An account with this email already exists. Please sign in instead.");
      } else if (errorCode === "auth/weak-password") {
        alert("Password is too weak. Please use at least 6 characters.");
      } else {
        alert("Authentication failed. Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await handleBackendAuth(user.email || "", user.uid, isSignUp);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-800/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Sparkles className="size-6" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">SchemeSetu</span>
        </div>

        <Card className="border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden relative">
          <CardHeader className="text-center pt-8 px-6 pb-4">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              {t.title}
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium text-xs mt-2 px-4 leading-relaxed">
              {t.subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="size-10 text-indigo-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-300">{t.loading}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Google Sign-in */}
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full py-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm flex items-center justify-center gap-3 transition-all active:scale-98 font-bold text-sm"
                >
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.62 14.98 1 12 1 7.35 1 3.39 3.67 1.41 7.56l3.89 3.02c.92-2.77 3.52-4.54 6.7-4.54z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.54h6.48c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.69-4.91 3.69-8.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.88c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.41 7.28C.51 9.08 0 11.08 0 13s.51 3.92 1.41 5.72l3.89-3.84z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.12.75-2.55 1.2-4.26 1.2-3.18 0-5.78-1.77-6.7-4.54l-3.89 3.02C3.39 20.33 7.35 23 12 23z"
                    />
                  </svg>
                  {t.googleBtn}
                </Button>

                {/* Divider */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    {t.or}
                  </span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">
                      {t.emailLabel}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 size-5 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-950/40 border border-slate-800/80 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">
                      {t.passwordLabel}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 size-5 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-950/40 border border-slate-800/80 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all active:scale-98 flex items-center justify-center gap-2 group"
                  >
                    {isSignUp ? t.emailBtnSignUp : t.emailBtnLogin}
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <div className="text-center mt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      {isSignUp ? "Already have an account? Sign in" : "Need an account? Create one"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>


    </div>
  );
}
