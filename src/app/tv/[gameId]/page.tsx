"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Moon, Sun, Ghost, Timer, Users, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TVPage() {
    const params = useParams();
    const gameId = params?.gameId as string;
    const [timeLeft, setTimeLeft] = useState(30);

    const { data, error } = useSWR(
        gameId ? `/api/game?gameId=${gameId}` : null,
        fetcher,
        { refreshInterval: 2000 }
    );

    useEffect(() => {
        if (!data?.game?.phaseStartedAt || data.game.status !== "playing") return;

        const interval = setInterval(() => {
            const start = new Date(data.game.phaseStartedAt).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((now - start) / 1000);
            const remaining = Math.max(0, 30 - diff);
            setTimeLeft(remaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [data?.game?.phaseStartedAt, data?.game?.status]);

    if (error) return (
        <div className="min-h-screen bg-black text-red-500 flex items-center justify-center text-5xl font-black">
            ERROR: GAME NOT FOUND
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8">
            <Timer className="w-24 h-24 animate-spin text-indigo-500" />
            <h1 className="text-6xl font-black tracking-tighter italic">CONNECTING TO VILLAGE...</h1>
        </div>
    );

    const { game, players } = data;
    const isNight = game.phase === "night";
    const isDay = game.phase === "day";

    // GAME OVER VIEW
    if (game.status === "finished") {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-20 overflow-hidden relative">
                <div className="absolute inset-0 bg-indigo-600/10 blur-[200px] animate-pulse"></div>

                <Trophy className="w-48 h-48 text-yellow-500 mb-8 animate-bounce" />
                <h1 className="text-9xl font-black uppercase tracking-tighter mb-4 z-10">GAME OVER</h1>
                <p className="text-6xl font-bold text-indigo-400 z-10 mb-16 italic">
                    {game.winner === "villager" && "VILLAGE VICTORIOUS"}
                    {game.winner === "werewolf" && "WEREWOLVES TRIUMPHANT"}
                    {game.winner === "tanner" && "THE TANNER WON!"}
                </p>

                <div className="grid grid-cols-4 gap-8 w-full max-w-7xl z-10">
                    {players.map((p: any) => (
                        <div key={p.id} className="bg-zinc-900/80 border-4 border-white/10 p-6 rounded-3xl flex flex-col items-center gap-2">
                            <span className="text-4xl font-black text-white">{p.name}</span>
                            <span className="text-2xl font-bold uppercase text-indigo-500">{p.role}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col p-12 transition-colors duration-1000 ${isNight ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-950'}`}>
            {/* Background Ambience */}
            <div className={`fixed inset-0 pointer-events-none opacity-20 filter blur-[150px] transition-all duration-1000 ${isNight ? 'bg-indigo-900' : 'bg-orange-500'}`}></div>

            {/* Top Bar: Room Code & Status */}
            <div className="flex justify-between items-start z-10 mb-20">
                <div className="flex flex-col gap-2">
                    <span className="text-3xl font-black uppercase tracking-widest opacity-50">Room Code</span>
                    <span className={`text-9xl font-mono font-black ${isNight ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {game.shortId}
                    </span>
                </div>

                <div className="flex flex-col items-end gap-4">
                    <div className={`flex items-center gap-6 px-12 py-6 rounded-full border-8 ${isNight ? 'border-indigo-500/30' : 'border-indigo-600/30'}`}>
                        {isNight ? <Moon className="w-16 h-16 text-indigo-400" /> : <Sun className="w-16 h-16 text-orange-500 animate-spin-slow" />}
                        <span className="text-7xl font-black uppercase tracking-tighter">
                            {isNight ? "Night Phase" : "Day Phase"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle: Timer */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 mb-20">
                <div className={`relative w-[600px] h-[600px] rounded-full flex items-center justify-center border-[20px] transition-all duration-500 ${timeLeft < 10 ? 'border-red-600 animate-pulse scale-110' : (isNight ? 'border-indigo-500/50' : 'border-zinc-200')}`}>
                    <div className="flex flex-col items-center">
                        <span className={`text-[250px] font-black leading-none ${timeLeft < 10 ? 'text-red-500' : ''}`}>
                            {timeLeft}
                        </span>
                        <span className="text-5xl font-black uppercase tracking-widest opacity-50 -mt-10">Seconds</span>
                    </div>
                </div>
            </div>

            {/* Bottom: Players Grid */}
            <div className="z-10 bg-zinc-900/10 backdrop-blur-md rounded-[60px] p-12 border-8 border-white/5">
                <div className="flex items-center gap-6 mb-10">
                    <Users className="w-16 h-16 opacity-50" />
                    <h2 className="text-5xl font-black uppercase tracking-widest opacity-50">Villagers ({players.length})</h2>
                </div>

                <div className="grid grid-cols-6 gap-8">
                    {players.map((p: any) => (
                        <div key={p.id} className={`p-8 rounded-[40px] flex flex-col items-center justify-center gap-4 transition-all duration-500 ${p.isAlive ? (isNight ? 'bg-zinc-900 border-4 border-indigo-500/20' : 'bg-zinc-100 border-4 border-zinc-200') : 'opacity-30 bg-red-950/20 border-4 border-red-500/50'}`}>
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black shadow-2xl ${p.isAlive ? (isNight ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white') : 'bg-red-900 text-zinc-400'}`}>
                                {p.isAlive ? p.name.charAt(0).toUpperCase() : <Skull className="w-12 h-12" />}
                            </div>
                            <span className="text-4xl font-black truncate w-full text-center">{p.name}</span>
                            {!p.isAlive && <span className="text-2xl font-bold uppercase tracking-widest text-red-500">Eliminated</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
            `}</style>
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
