"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/contexts/LanguageContext";

export default function JoinPage() {
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !roomCode.trim()) return;

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, roomCode }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to join");
            }

            const data = await res.json();
            // Store player info in session storage for tab isolation
            sessionStorage.setItem("werewolf_player_id", data.playerId);
            sessionStorage.setItem("werewolf_game_id", data.gameId);

            router.push("/lobby");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-zinc-50 relative overflow-hidden">
            {/* Background ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-900/10 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            <div className="w-full max-w-md absolute top-6 left-6 z-20">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
            </div>

            <div className="z-10 w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">{t('join_title')}</h1>
                    <p className="text-zinc-400">Choose your identity wisely.</p>
                </div>

                <Card className="bg-zinc-900/60 border-white/5 backdrop-blur-xl shadow-2xl">
                    <CardContent className="pt-6">
                        <form onSubmit={handleJoin} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="roomCode" className="uppercase text-xs font-bold tracking-widest text-zinc-500">Room Code</Label>
                                <Input
                                    id="roomCode"
                                    placeholder="e.g. AB12XY"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    className="bg-black/20 border-white/10 h-14 text-lg focus:ring-indigo-500/50 focus:border-indigo-500 transition-all rounded-xl uppercase tracking-widest text-center font-mono"
                                    maxLength={6}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="name" className="uppercase text-xs font-bold tracking-widest text-zinc-500">{t('display_name')}</Label>
                                <Input
                                    id="name"
                                    placeholder={t('enter_name')}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-black/20 border-white/10 h-14 text-lg focus:ring-indigo-500/50 focus:border-indigo-500 transition-all rounded-xl"
                                    maxLength={12}
                                />
                                <p className="text-xs text-zinc-500 text-right">{name.length}/12</p>
                            </div>

                            {error && (
                                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-center font-medium">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-900/20 font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                                disabled={isLoading || !name.trim()}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('join_btn')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
