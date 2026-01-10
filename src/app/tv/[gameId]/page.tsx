"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Moon, Sun, Ghost, Timer, Users, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TVPage() {
    const { t } = useLanguage();
    const params = useParams();
    const gameId = params?.gameId as string;
    const [timeLeft, setTimeLeft] = useState(60);

    const { data, error } = useSWR(
        gameId ? `/api/game?gameId=${gameId}` : null,
        fetcher,
        { refreshInterval: 2000 }
    );

    const game = data?.game;
    const players = data?.players || [];

    // Calculate Role Counts
    const roleCounts = players.reduce((acc: any, p: any) => {
        acc[p.role] = (acc[p.role] || 0) + 1;
        return acc;
    }, {});

    useEffect(() => {
        if (!game?.phaseStartedAt || game?.status !== "playing") return;

        const interval = setInterval(() => {
            const start = new Date(game.phaseStartedAt).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((now - start) / 1000);
            const remaining = Math.max(0, 60 - diff);
            setTimeLeft(remaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [game?.phaseStartedAt, game?.status]);

    if (error) return (
        <div className="min-h-screen bg-black text-red-600 flex items-center justify-center text-5xl font-black uppercase tracking-widest">
            {t('game_id')} NOT FOUND
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                <Timer className="w-32 h-32 animate-spin-slow text-indigo-500 relative z-10" />
            </div>
            <h1 className="text-4xl font-black tracking-[1em] text-zinc-500 animate-pulse">LOADING...</h1>
        </div>
    );

    const isNight = game.phase === "night";

    // --- GAME OVER ---
    if (game.status === "finished") {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-20 overflow-hidden relative font-sans">
                {/* Background FX */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 to-black z-0"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

                <div className="z-10 flex flex-col items-center animate-in zoom-in duration-700">
                    <Trophy className="w-64 h-64 text-yellow-500 mb-12 drop-shadow-[0_0_50px_rgba(234,179,8,0.5)] animate-bounce" />
                    <h1 className="text-[12rem] font-black uppercase tracking-tighter leading-none mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-600">
                        {game.winner === "villager" && t('victory')}
                        {game.winner === "werewolf" && t('win_werewolf')}
                        {game.winner === "tanner" && t('win_tanner')}
                    </h1>
                    <p className="text-4xl font-bold text-indigo-400 tracking-[0.5em] uppercase mb-24">
                        {game.winner === "villager" ? t('village_safe') : t('village_destroyed')}
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-8 w-full max-w-[1600px] z-10">
                    {players.map((p: any) => (
                        <div key={p.id} className="relative group perspective-1000">
                            <div className="relative bg-zinc-900/80 border border-white/10 p-8 rounded-[2rem] flex flex-col items-center gap-6 backdrop-blur-md transition-all duration-500 hover:scale-105 hover:bg-zinc-800 hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-2xl relative">
                                    <img
                                        src={`/assets/roles/${p.role}.png`}
                                        alt={p.role}
                                        className="w-full h-full object-cover scale-110"
                                    />
                                </div>
                                <div className="text-center">
                                    <span className="block text-3xl font-black text-white mb-2">{p.name}</span>
                                    <span className="block text-xl font-bold uppercase tracking-widest text-indigo-400">{p.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- PLAYING ---
    return (
        <div className={`min-h-screen flex flex-col p-16 transition-colors duration-1000 font-sans overflow-hidden relative ${isNight ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-950'}`}>

            {/* Dynamic Background */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isNight ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-black to-black"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('/assets/noise.svg')]"></div>
            </div>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isNight ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-100 via-zinc-100 to-zinc-200"></div>
            </div>

            {/* Header: Status Bar */}
            <div className="flex justify-between items-start z-10 mb-12">
                <div className="flex flex-col">
                    <span className="text-2xl font-bold uppercase tracking-[0.2em] opacity-50 mb-2">{t('game_id')}</span>
                    <span className={`text-[8rem] leading-none font-black font-mono tracking-tighter ${isNight ? 'text-white' : 'text-black'}`}>
                        {game.shortId}
                    </span>
                </div>

                <div className={`flex items-center gap-8 px-12 py-6 rounded-full border backdrop-blur-xl transition-all duration-500 ${isNight ? 'bg-zinc-900/50 border-white/10' : 'bg-white/50 border-black/5 shadow-xl'}`}>
                    {isNight ? (
                        <Moon className="w-16 h-16 text-indigo-400 animate-pulse" />
                    ) : (
                        <Sun className="w-16 h-16 text-orange-500 animate-spin-slow" />
                    )}
                    <span className="text-6xl font-black uppercase tracking-tight">
                        {isNight ? t('night_phase') : t('day_phase')}
                    </span>
                </div>
            </div>

            {/* Main Content: Timer & Grid */}
            <div className="flex-1 flex gap-16 z-10">

                {/* Left: Enhanced Timer */}
                <div className="w-1/3 flex flex-col justify-center items-center">
                    <div className="relative w-[500px] h-[500px]">
                        {/* Rings */}
                        <div className={`absolute inset-0 rounded-full border-[30px] opacity-20 ${isNight ? 'border-indigo-500' : 'border-orange-400'}`}></div>
                        <div
                            className={`absolute inset-0 rounded-full border-[30px] border-t-transparent transition-all duration-1000 ${isNight ? 'border-indigo-500' : 'border-orange-500'}`}
                            style={{ transform: `rotate(${((60 - timeLeft) / 60) * 360}deg)` }}
                        ></div>

                        {/* Center Counter */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-[12rem] font-black tabular-nums tracking-tighter transition-colors duration-300 ${timeLeft <= 5 ? 'text-red-500 scale-110 animate-pulse' : (isNight ? 'text-white' : 'text-zinc-900')}`}>
                                {timeLeft}
                            </span>
                            <span className="text-3xl font-bold uppercase tracking-[0.5em] opacity-50">{t('seconds')}</span>
                        </div>
                    </div>
                </div>

                {/* Role Counts Dashboard */}
                <div className={`flex-1 rounded-3xl p-6 backdrop-blur-md border ${isNight ? 'bg-zinc-900/50 border-white/10' : 'bg-white/50 border-black/5'}`}>
                    <h3 className="text-2xl font-black uppercase tracking-widest mb-6 opacity-70 border-b pb-4 border-white/10">{t('role_distribution')}</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {Object.entries(roleCounts).map(([role, count]: [string, any]) => (
                            <div key={role} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${isNight ? 'border-indigo-500/50' : 'border-orange-500/50'}`}>
                                        <img src={`/assets/roles/${role}.png`} alt={role} className="w-full h-full object-cover scale-125" />
                                    </div>
                                    <span className="text-xl font-bold capitalize">{role}</span>
                                </div>
                                <span className={`text-2xl font-black ${isNight ? 'text-indigo-400' : 'text-orange-500'}`}>x{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* removed */}

                {/* Right: Premium Player Grid */}
                <div className="flex-1 grid grid-cols-4 gap-6 content-start">
                    {players.map((p: any) => (
                        <div key={p.id} className={`relative group h-64 rounded-[2rem] p-6 flex flex-col items-center justify-between transition-all duration-500 ${p.isAlive
                            ? (isNight
                                ? 'bg-zinc-900 border border-white/10 shadow-2xl shadow-indigo-900/20'
                                : 'bg-white border border-zinc-200 shadow-xl shadow-zinc-200/50')
                            : 'bg-red-950/30 border border-red-900/30 opacity-60 grayscale'
                            }`}>
                            {/* Avatar / Role Icon */}
                            <div className="relative flex-1 w-full flex items-center justify-center">
                                {!p.isAlive ? (
                                    <Skull className="w-24 h-24 text-red-500 opacity-80" />
                                ) : (
                                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg flex items-center justify-center text-4xl font-black ${isNight ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-orange-500 border-orange-300 text-white'}`}>
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Name Badge */}
                            <div className={`w-full py-3 rounded-xl text-center backdrop-blur-md ${isNight ? 'bg-white/5' : 'bg-black/5'}`}>
                                <span className={`text-2xl font-black truncate px-2 block ${isNight ? 'text-white' : 'text-zinc-900'}`}>
                                    {p.name}
                                </span>
                            </div>

                            {/* Elimination Overlay */}
                            {!p.isAlive && (
                                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black uppercase px-3 py-1 rounded-full tracking-widest">
                                    Eliminated
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {/* removed */}


                <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
            `}</style>
            </div >
        </div>
    );
}

function Skull({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12.5 17-.5-1-.5 1h1z" /><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1h6Z" /><path d="M10 12h.01" /><path d="M14 12h.01" /><path d="M12 2a8 8 0 0 0-8 8c0 2.1 1.7 3.9 3.5 4.7.2.1.4.1.5.3l.5 1a1 1 0 0 0 2 0l.5-1c.1-.2.3-.2.5-.3 1.8-.8 3.5-2.6 3.5-4.7a8 8 0 0 0-8-8Z" />
        </svg>
    );
}
