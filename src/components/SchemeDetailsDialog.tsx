
import { Scheme, Language, LocalizedScheme } from "../types";
import { translations } from "../lib/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle2, FileText, ArrowRight, Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface SchemeDetailsDialogProps {
  scheme: Scheme | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function SchemeDetailsDialog({ scheme, isOpen, onClose, language }: SchemeDetailsDialogProps) {
  if (!scheme) return null;
  const t = translations[language];

  // Get localized content if available, fallback to default English content
  const localized = (scheme.translations?.[language] as LocalizedScheme) || {
    name: scheme.name,
    description: scheme.description,
    shortDescription: scheme.shortDescription,
    procedures: scheme.procedures
  };

  const sd = t.scheme_details;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none bg-white shadow-2xl">
        <div className="relative">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-br from-indigo-600 to-violet-700 w-full rounded-t-3xl" />
          
          <div className="px-8 pb-8 -mt-12 relative z-10">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  {scheme.category}
                </Badge>
                <Badge variant="outline" className="text-slate-500 border-slate-200 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  {scheme.estimatedProcessingTime}
                </Badge>
              </div>
              
              <DialogTitle className="text-3xl font-black text-slate-900 leading-tight">
                {localized.name}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-2 text-base leading-relaxed">
                {localized.description}
              </DialogDescription>
            </div>

            {/* Procedures Section */}
            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{sd.procedure_title}</h3>
              </div>
              
              <div className="space-y-4 relative before:content-[''] before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-100">
                {localized.procedures.map((step, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="flex gap-6 pl-2"
                  >
                    <div className="relative z-10 flex-shrink-0 size-6 rounded-full bg-indigo-600 border-4 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 flex-1 border border-slate-100 hover:border-indigo-100 transition-colors">
                      <p className="text-slate-700 font-medium leading-relaxed">{step}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <FileText className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{sd.docs_title}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scheme.documentation.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="size-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                      <FileText className="size-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 bg-slate-50 border-t border-slate-100 sticky bottom-0">
          <Button onClick={onClose} variant="ghost" className="rounded-xl font-bold h-12 px-6">
            {sd.close}
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold h-12 px-8 shadow-lg shadow-indigo-100">
            {sd.apply_portal} <ArrowRight className="ml-2 size-5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
