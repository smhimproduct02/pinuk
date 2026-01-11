"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Loader2, Play, Settings2, Plus, Minus, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LobbyPage() {
    const { t } = useLanguage();
    const [gameId, setGameId] = useState<string | null>(null);
    const [isLoadingStart, setIsLoadingStart] = useState(false);

    // Role Config State
    const [roleConfig, setRoleConfig] = useState({
        werewolf: 1,
        villager: 1,
        seer: 1,
        robber: 0,
        troublemaker: 0,
        minion: 0,
        tanner: 0,
        drunk: 0,
        insomniac: 0
    });

    const router = useRouter();

    useEffect(() => {
        const savedId = localStorage.getItem("werewolf_game_id");
        if (!savedId) {
            router.push("/join");
        } else {
            setGameId(savedId);
        }
    }, [router]);

    const { data, error, mutate } = useSWR(
        gameId ? `/api/game?gameId=${gameId}` : null,
        fetcher,
        { refreshInterval: 1000 }
    );

    useEffect(() => {
        if (data?.game?.status === "playing") {
            router.push("/game");
        }
    }, [data, router]);

    if (!gameId) return null;
    if (!data) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-50 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-zinc-500 font-medium tracking-wide">{t('enter_village')}</p>
        </div>
    );
    if (error || data.error) return <div className="p-4 text-center text-red-500 bg-zinc-950 min-h-screen pt-20">{t('game_not_found')}</div>;

    const game = data?.game;
    // Guard: data exists but game might be missing (e.g. deleted or sync issue)
    if (!game) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-50 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-zinc-500 font-medium tracking-wide">Syncing...</p>
        </div>
    );

    const players = data?.players || [];

    // [FIX] Hydration Safety: Fetch ID only on client side
    const [myId, setMyId] = useState<string | null>(null);
    useEffect(() => {
        setMyId(localStorage.getItem("werewolf_player_id"));
    }, []);

    const me = players.find((p: any) => p.id === myId);
    const isHost = me?.isHost;

    // Config Logic
    const playerCount = players.length;

    // Auto-Config: Update roleConfig when playerCount changes
    // Auto-Config: Update roleConfig when playerCount changes
    useEffect(() => {
        if (isHost && playerCount > 0) {
            // Avoid infinite loop by checking if config already matches
            // We only re-calc if total config != playerCount OR we want to rebalance on change
            const currentTotal = Object.values(roleConfig).reduce((a, b) => a + b, 0);
            if (currentTotal === playerCount) return; // Already balanced, user might have customized it. Wait, if player count changes, we SHOULD rebalance.

            // Actually, we should only auto-rebalance if the host hasn't manually touched it? 
            // For now, let's just ensure it sums up correctly to prevent "Start" button lockout.

            setRoleConfig(prev => {
                const newConfig = { ...prev };
                // Reset roles for standard distribution
                newConfig.werewolf = playerCount >= 15 ? 4 : (playerCount >= 8 ? 3 : 2);
                newConfig.seer = 1;
                newConfig.robber = 1;
                newConfig.troublemaker = 1;
                newConfig.minion = playerCount >= 10 ? 1 : 0;
                newConfig.drunk = playerCount >= 12 ? 1 : 0;
                newConfig.insomniac = playerCount >= 12 ? 1 : 0;
                newConfig.tanner = playerCount >= 15 ? 1 : 0;

                // Basics
                const specials = newConfig.werewolf + newConfig.seer + newConfig.robber + newConfig.troublemaker + newConfig.minion + newConfig.drunk + newConfig.insomniac + newConfig.tanner;
                const villagersNeeded = Math.max(0, playerCount - specials);
                newConfig.villager = villagersNeeded;

                // Final adjustment to match exact count (if negative villagers, reduce specials)
                // This shouldn't happen with 30 players but for small games:
                const total = specials + villagersNeeded;
                if (total > playerCount) {
                    // Too many specials, reduce Wolves first? No, reduce simpler ones.
                    // For simplicity, just reset to all villagers if < 3?
                    if (playerCount < 3) return prev; // Let them handle it
                }

                return newConfig;
            });
        }
    }, [playerCount, isHost, roleConfig]);

    const totalConfigured = Object.values(roleConfig).reduce((a, b) => a + b, 0);
    const isValidConfig = totalConfigured === playerCount;

    const updateConfig = (role: keyof typeof roleConfig, delta: number) => {
        setRoleConfig(prev => {
            const newVal = Math.max(0, prev[role] + delta);
            return { ...prev, [role]: newVal };
        });
    };

    const startGame = async () => {
        if (!isHost || !isValidConfig) return;
        setIsLoadingStart(true);
        try {
            await fetch("/api/admin/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameId, roleConfig }),
            });
            // Redirect handled by useEffect
        } catch (e) {
            console.error(e);
            setIsLoadingStart(false);
        }
    };

    const resetGame = async () => {
        if (!isHost) return;
        if (confirm(t('confirm_reset'))) {
            await fetch("/api/admin/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameId }),
            });
            mutate();
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950 text-zinc-50 p-6 pb-24 font-sans">

            {/* Header */}
            <div className="text-center space-y-2 mb-10 mt-6 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -z-10"></div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-sm">
                    {t('lobby_title')}
                </h1>
                <p className="text-zinc-400 font-light tracking-widest text-sm uppercase">
                    Code: <span className="text-white font-bold bg-white/10 px-2 py-1 rounded ml-2">{gameId.slice(0, 4).toUpperCase()}</span>
                </p>
            </div>

            <div className={`max-w-6xl mx-auto grid gap-8 ${isHost ? 'lg:grid-cols-2' : 'max-w-lg'}`}>

                {/* Player List Card */}
                <Card className="bg-zinc-900/60 border-zinc-800/60 backdrop-blur-xl shadow-xl overflow-hidden h-fit">
                    <CardHeader className="pb-4 border-b border-white/5">
                        <CardTitle className="text-sm font-medium text-zinc-400 flex justify-between items-center uppercase tracking-widest">
                            <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {t('players')}</span>
                            <span className="bg-zinc-800 text-white px-3 py-1 rounded-full text-xs font-bold">{players.length}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {players.map((player: any) => (
                            <div
                                key={player.id}
                                className={`flex items-center p-3 rounded-xl border transition-all duration-300 ${player.id === myId
                                    ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                    : 'bg-zinc-800/30 border-white/5'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-4 shadow-inner ${player.id === myId ? 'bg-indigo-500 text-white' : 'bg-zinc-700 text-zinc-300'}`}>
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <span className={`font-medium text-lg ${player.id === myId ? 'text-indigo-200' : 'text-zinc-300'}`}>
                                        {player.name}
                                    </span>
                                    {player.isHost && (
                                        <span className="ml-3 text-[10px] uppercase font-bold bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20">
                                            {t('host')}
                                        </span>
                                    )}
                                </div>
                                {player.id === myId && <span className="text-xs text-indigo-400/50 italic mr-2">You</span>}
                            </div>
                        ))}
                        {players.length === 0 && <div className="text-center text-zinc-600 py-8 italic">{t('waiting_players')}</div>}
                    </CardContent>
                </Card>

                {/* Host Controls (If Host) or Waiting Status */}
                {isHost ? (
                    <div className="space-y-6">
                        <Card className="bg-zinc-900/60 border-zinc-800/60 backdrop-blur-xl shadow-xl h-fit">
                            <CardHeader className="pb-4 border-b border-white/5">
                                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                                    <Settings2 className="w-4 h-4" /> {t('game_config')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Distribution Status */}
                                <div className="flex justify-between items-center text-sm mb-4 bg-zinc-950/50 p-4 rounded-xl border border-white/5">
                                    <span className="text-zinc-400">{t('total_players')}: <strong className="text-white text-base ml-1">{playerCount}</strong></span>
                                    <span className={`${isValidConfig ? 'text-green-400' : 'text-red-400'} font-medium flex items-center gap-2`}>
                                        {t('assigned')}: <strong className="text-base">{totalConfigured}</strong>
                                        {!isValidConfig && (
                                            <span className="text-[10px] bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                                {playerCount - totalConfigured > 0 ? `+${playerCount - totalConfigured} ${t('needed')}` : `${totalConfigured - playerCount} ${t('too_many')}`}
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {/* Role Config */}
                                <div className="space-y-2">
                                    {Object.entries(roleConfig).map(([role, count]) => (
                                        <div key={role} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                                            <span className="capitalize text-zinc-300 font-medium">{role}</span>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline" size="icon" className="h-9 w-9 rounded-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 hover:text-white transition-colors"
                                                    onClick={() => updateConfig(role as any, -1)}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <span className="w-8 text-center font-bold text-lg tabular-nums">{count}</span>
                                                <Button
                                                    variant="outline" size="icon" className="h-9 w-9 rounded-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700 hover:text-white transition-colors"
                                                    onClick={() => updateConfig(role as any, 1)}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-7 text-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl mt-4"
                                    disabled={!isValidConfig || isLoadingStart || playerCount < 1}
                                    onClick={startGame}
                                >
                                    {isLoadingStart ? <Loader2 className="animate-spin w-6 h-6" /> : (
                                        <div className="flex items-center gap-2">
                                            {t('start_game')} <Play className="w-5 h-5 fill-current" />
                                        </div>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Reset Option */}
                        {game.status === "finished" && (
                            <div className="text-center">
                                <Button variant="ghost" className="text-zinc-500 hover:text-white hover:bg-white/5 transition-colors" onClick={resetGame}>
                                    <RefreshCcw className="w-4 h-4 mr-2" /> {t('reset_lobby')}
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center p-12 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm flex flex-col items-center justify-center h-full min-h-[300px]">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
                            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin relative z-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{t('waiting_host')}</h3>
                        <p className="text-zinc-400">{t('host_configuring')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
