import { useState } from "react";
import { UserProfile, Language } from "../types";
import { translations } from "../lib/i18n";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { User, MapPin, Briefcase, Wallet, Calendar, Users, Save } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface UserProfileFormProps {
  initialProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  language: Language;
}

export default function UserProfileForm({ initialProfile, onSave, language }: UserProfileFormProps) {
  const t = translations[language];
  const p = t.profile;

  const [formData, setFormData] = useState<UserProfile>(initialProfile || {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleFamilySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setFormData(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        familySize: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const occ = formData.occupation;
    const gen = formData.gender;
    const age = formData.age;

    // Automatically derive specific boolean flags based on dropdown selections
    const finalProfile: UserProfile = {
      ...formData,
      demographics: {
        ...formData.demographics,
        isFarmer: occ === "Farmer",
        isStudent: occ === "Student",
        isStartupFounder: occ === "Startup Founder",
        isUnemployed: occ === "Unemployed",
        isSeniorCitizen: age >= 60 || occ === "Retired/Senior",
        isFemaleStudent: gen === "Female" && occ === "Student",
        isWorkingFemale: gen === "Female" && (occ === "Working Professional" || occ === "Business/Self-Employed" || occ === "Startup Founder"),
        isOtherProfession: occ === "Other" || occ === "Working Professional" || occ === "Business/Self-Employed",
        isPregnantWoman: false,
        isWidow: false,
        isSingleMother: false,
      }
    };

    onSave(finalProfile);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-8"
    >
      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200 shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 bg-indigo-600 text-white">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <User className="size-8" /> {p.title}
            </CardTitle>
            <CardDescription className="text-indigo-100">
              {p.onboarding_subtitle}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <User className="size-3" /> {p.name}
                </Label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="rounded-xl border-slate-200 h-12 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Calendar className="size-3" /> {p.age}
                </Label>
                <Input 
                  name="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={handleChange}
                  placeholder="25"
                  className="rounded-xl border-slate-200 h-12 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Wallet className="size-3" /> {p.income}
                </Label>
                <select
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-200 h-12 focus:ring-indigo-500 px-3 border bg-white text-slate-700"
                  required
                >
                  <option value={0} disabled>Select Income Range</option>
                  <option value={50000}>Below ₹50,000</option>
                  <option value={100000}>₹50,000 - ₹1,00,000</option>
                  <option value={250000}>₹1,00,000 - ₹2,50,000</option>
                  <option value={500000}>₹2,50,000 - ₹5,00,000</option>
                  <option value={1000000}>₹5,00,000 - ₹10,00,000</option>
                  <option value={2000000}>Above ₹10,00,000</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <User className="size-3" /> {p.gender}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "Male", label: p.gender_male },
                    { val: "Female", label: p.gender_female },
                    { val: "Other", label: p.gender_other }
                  ].map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: g.val as any }))}
                      className={cn(
                        "h-12 rounded-xl border text-sm font-bold transition-all",
                        formData.gender === g.val
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Briefcase className="size-3" /> {p.occupation}
                </Label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-200 h-12 focus:ring-indigo-500 px-3 border bg-white text-slate-700"
                  required
                >
                  <option value="" disabled>Select Occupation</option>
                  <option value="Student">Student</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Startup Founder">Startup Founder</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Business/Self-Employed">Business / Self-Employed</option>
                  <option value="Retired/Senior">Retired / Senior Citizen</option>
                  <option value="Other">Other Profession</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <MapPin className="size-3" /> {p.location}
                </Label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-xl border-slate-200 h-12 focus:ring-indigo-500 px-3 border bg-white text-slate-700"
                  required
                >
                  <option value="" disabled>Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Users className="size-3" /> {p.family_size}
                </Label>
                <Input 
                  name="familySize"
                  type="number"
                  value={formData.demographics.familySize}
                  onChange={handleFamilySizeChange}
                  className="rounded-xl border-slate-200 h-12 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-12 py-6 font-bold text-lg h-auto shadow-lg shadow-indigo-100">
              <Save className="mr-2 size-5" /> {initialProfile ? p.save : p.get_started}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  );
}
