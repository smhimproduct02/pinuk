"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Moon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-zinc-50 relative overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Background ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[128px] animate-pulse delay-700"></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 max-w-6xl w-full z-10 items-center">
        {/* Left Column: Hero Text (Desktop) / Top (Mobile) */}
        <div className="text-center lg:text-left space-y-6">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-zinc-900/50 ring-1 ring-white/10 backdrop-blur-xl">
            <Moon className="w-8 h-8 text-indigo-400 mr-3" />
            <span className="text-xl font-bold tracking-tight">{t('app_title')}</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 pb-2">
            Deceive. <br />
            Deduce. <br />
            Survive.
          </h1>
          <p className="text-lg lg:text-xl text-zinc-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            The ultimate social deduction game. Join the village, find the impostors, or hide among the shadows.
          </p>
        </div>

        {/* Right Column: Actions */}
        <Card className="w-full max-w-md mx-auto bg-zinc-900/50 border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">{t('join_title')}</CardTitle>
            <CardDescription>Enter the village to begin</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-6 relative z-10">
            <Link href="/join" className="block w-full">
              <Button size="lg" className="w-full h-16 text-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all rounded-xl shadow-lg shadow-indigo-900/20 hover:scale-[1.02] active:scale-[0.98]">
                {t('join_btn')}
              </Button>
            </Link>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
                <span className="bg-zinc-900/80 px-4 text-zinc-500 backdrop-blur">{t('or')}</span>
              </div>
            </div>

            <Link href="/admin" className="block w-full">
              <Button variant="outline" size="lg" className="w-full h-14 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl transition-all">
                {t('admin_btn')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-6 text-zinc-600 text-sm font-medium tracking-widest uppercase">
        v1.0 • Nightfall Edition
      </div>
    </div>
  );
}
