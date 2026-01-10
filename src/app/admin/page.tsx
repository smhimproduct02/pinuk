"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users, Play, Copy, Settings2, Plus, Minus, Moon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
    const { t } = useLanguage();
    const [gameId, setGameId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [errorInput, setErrorInput] = useState("");

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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "068538") {
            setIsAuthenticated(true);
        } else {
            setErrorInput("Invalid password");
        }
    };

    useEffect(() => {
        const savedId = localStorage.getItem("werewolf_game_id");
        if (savedId) setGameId(savedId);
    }, []);

    const createGame = async () => {
        setIsCreating(true);
        try {
            const res = await fetch("/api/admin/create", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setGameId(data.gameId);
                localStorage.setItem("werewolf_game_id", data.gameId);
            }
        } catch (error) {
            console.error("Failed to create game", error);
        } finally {
            setIsCreating(false);
        }
    };

    const { data, error, mutate } = useSWR(
        isAuthenticated && gameId ? `/api/game?gameId=${gameId}` : null,
        fetcher,
        { refreshInterval: 2000 }
    );

    // Helper logic for config
    const players = data?.players || [];
    const game = data?.game;
    const totalConfigured = Object.values(roleConfig).reduce((a, b) => a + b, 0);
    const playerCount = players.length;
    // Validation: Total must be >= Player Count (excess = center cards)
    const isValidConfig = totalConfigured >= playerCount;
    const centerCardsCount = Math.max(0, totalConfigured - playerCount);

    const updateConfig = (role: keyof typeof roleConfig, delta: number) => {
        setRoleConfig(prev => {
            const newVal = Math.max(0, prev[role] + delta);
            return { ...prev, [role]: newVal };
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-zinc-50 font-sans">
                <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Admin Access</CardTitle>
                        <CardDescription>Enter the passcode to manage the village.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="******"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-zinc-950/50 border-zinc-700 text-center text-2xl tracking-widest"
                                    autoFocus
                                />
                            </div>
                            {errorInput && <p className="text-red-400 text-sm text-center">{errorInput}</p>}
                            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold">
                                Unlock
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!gameId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-zinc-50 font-sans">
                <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle>Admin Dashboard</CardTitle>
                        <CardDescription>Start a new game session to begin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={createGame}
                            disabled={isCreating}
                            className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        >
                            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start New Game"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) return <div className="p-4 text-red-500 text-center mt-10">Failed to load game</div>;
    if (!data) return <div className="flex items-center justify-center h-screen bg-zinc-950"><Loader2 className="w-10 h-10 animate-spin text-zinc-500" /></div>;

    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 pb-32 font-sans">
            <header className="p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight">{t('admin_panel')}</h1>
                    <div className="flex items-center space-x-2">
                        {game.phase === 'night' && <Moon className="w-4 h-4 text-indigo-400" />}
                        {game.phase === 'day' && <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>}
                        <span className={`px-2 py-0.5 rounded-full text-xs border uppercase font-bold tracking-wider ${game.status === 'waiting' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-zinc-500 text-zinc-400'}`}>
                            {game.status}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-6">

                {/* Game ID / Share Section */}
                <Card className="bg-zinc-900/40 border-zinc-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs text-zinc-500 tracking-widest uppercase">{t('game_id')}</p>
                            <code className="text-lg font-mono text-indigo-400 select-all font-bold">{game.id.slice(0, 8)}...</code>
                        </div>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={() => navigator.clipboard.writeText(game.id)}>
                            <Copy className="w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Players List */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <Users className="w-4 h-4" /> {t('players')} ({players.length})
                    </h2>

                    <div className="grid gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {players.length === 0 ? (
                            <div className="text-center p-8 border border-dashed border-zinc-800 rounded-lg text-zinc-500 italic">
                                Waiting for players to join...
                            </div>
                        ) : (
                            players.map((player: any) => (
                                <div key={player.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800/50">
                                    <div className="flex items-center space-x-3">
                                        <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
                                            {player.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="font-medium text-zinc-200">{player.name}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 h-7 px-2 text-xs uppercase font-bold tracking-wider"
                                        onClick={async () => {
                                            if (confirm(`Kick ${player.name}?`)) {
                                                await fetch("/api/admin/kick", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ playerId: player.id }),
                                                });
                                                mutate();
                                            }
                                        }}
                                    >
                                        {t('kick')}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Game Configuration (Only in Waiting Phase) */}
                {game.status === 'waiting' && (
                    <Card className="bg-zinc-900/40 border-zinc-800">
                        <CardHeader className="pb-2 border-b border-white/5">
                            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                                <Settings2 className="w-4 h-4" /> {t('game_config')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {/* Distribution Status */}
                            <div className="flex justify-between items-center text-xs bg-zinc-950/50 p-3 rounded-lg border border-white/5">
                                <span className="text-zinc-500 uppercase tracking-wide">{t('total_players')}</span>
                                <span className={`${isValidConfig ? 'text-green-400' : 'text-red-400'} font-bold flex items-center gap-2`}>
                                    {totalConfigured} Roles ({centerCardsCount} Center) / {playerCount} Players
                                </span>
                            </div>

                            {/* Role Config */}
                            <div className="space-y-2">
                                {Object.entries(roleConfig).map(([role, count]) => (
                                    <div key={role} className="flex items-center justify-between bg-zinc-900/50 p-2 rounded border border-white/5">
                                        <span className="capitalize text-zinc-300 font-medium text-sm">{role}</span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline" size="icon" className="h-7 w-7 rounded-sm border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                                                onClick={() => updateConfig(role as any, -1)}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="w-6 text-center font-bold text-sm tabular-nums">{count}</span>
                                            <Button
                                                variant="outline" size="icon" className="h-7 w-7 rounded-sm border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                                                onClick={() => updateConfig(role as any, 1)}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/90 border-t border-zinc-800 pb-safe backdrop-blur z-20 mb-16">
                <div className="max-w-md mx-auto">
                    {game.status === 'waiting' ? (
                        <>
                            {!isValidConfig && players.length > 0 && (
                                <p className="text-red-400 text-xs text-center mb-2 font-medium bg-red-900/10 py-1 rounded">
                                    Config error: Must have at least {playerCount} roles (currently {totalConfigured})
                                </p>
                            )}
                            <Button
                                className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider transition-all active:scale-[0.98]"
                                disabled={players.length < 1 || !isValidConfig}
                                onClick={async () => {
                                    try {
                                        await fetch("/api/admin/start", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ gameId: game.id, roleConfig }),
                                        });
                                        mutate();
                                    } catch (e) {
                                        console.error("Failed to start", e);
                                    }
                                }}
                            >
                                <Play className="w-5 h-5 mr-2 fill-current" />
                                {t('start_game')}
                            </Button>
                        </>
                    ) : (
                        <Button
                            className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 uppercase tracking-wider transition-all active:scale-[0.98]"
                            onClick={async () => {
                                const nextPhase = game.phase === 'night' ? 'day' : 'night';
                                try {
                                    await fetch("/api/admin/phase", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ gameId: game.id, nextPhase }),
                                    });
                                    mutate();
                                } catch (e) {
                                    console.error("Failed to advance", e);
                                }
                            }}
                        >
                            {t('next_phase')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
