"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "ms" : "en");
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="bg-zinc-900/80 backdrop-blur border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full px-3 py-1 text-xs font-semibold shadow-lg"
            >
                <Globe className="w-3 h-3 mr-2" />
                {language === "en" ? "EN" : "MS"}
            </Button>
        </div>
    );
}
