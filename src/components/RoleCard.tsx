"use client";

import { useState, useEffect } from "react";
import { Eye, Moon, Sun, Shield, Skull, Zap, Ghost, HelpCircle, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type RoleType = "werewolf" | "villager" | "seer" | "robber" | "troublemaker" | "minion" | "mason" | "tanner" | "drunk" | "insomniac" | "hunter" | "doppelganger";

interface RoleCardProps {
    role: RoleType;
    initialRole: RoleType;
    phase: string;
}

const ROLE_INFO: Record<RoleType, { icon: any; color: string; ability: string; goal: string }> = {
    werewolf: {
        icon: Moon,
        color: "text-red-500",
        ability: "Wake up at night to find other werewolves.",
        goal: "Eliminate all villagers.",
    },
    villager: {
        icon: Sun,
        color: "text-yellow-500",
        ability: "You have no special abilities. Use your wits!",
        goal: "Find and eliminate the werewolves.",
    },
    seer: {
        icon: Eye,
        color: "text-indigo-400",
        ability: "Wake up to inspect one player's card or two center cards.",
        goal: "Find the werewolves.",
    },
    robber: {
        icon: Ghost,
        color: "text-zinc-400",
        ability: "Steal a card from another player and view your new role.",
        goal: "Win with your NEW role's team.",
    },
    troublemaker: {
        icon: Zap,
        color: "text-orange-500",
        ability: "Swap cards between two other players without looking.",
        goal: "Create chaos and find the werewolves.",
    },
    minion: {
        icon: Skull,
        color: "text-purple-500",
        ability: "Wake up to see who the werewolves are.",
        goal: "Help the werewolves win (even if you die).",
    },
    mason: {
        icon: Shield,
        color: "text-blue-500",
        ability: "Wake up to recognize other Masons.",
        goal: "Find the werewolves.",
    },
    tanner: {
        icon: Trophy,
        color: "text-amber-700",
        ability: "You hate your job.",
        goal: "Get yourself eliminated to win.",
    },
    drunk: {
        icon: HelpCircle,
        color: "text-green-500",
        ability: "Exchange your card with a center card without looking.",
        goal: "Win with your NEW role's team.",
    },
    insomniac: {
        icon: Moon,
        color: "text-indigo-300",
        ability: "Wake up last to check your own card.",
        goal: "Find the werewolves.",
    },
    hunter: {
        icon: Shield,
        color: "text-orange-700",
        ability: "If you die, the person you voted for also dies.",
        goal: "Find the werewolves.",
    },
    doppelganger: {
        icon: HelpCircle,
        color: "text-fuchsia-500",
        ability: "Look at another player's card and become that role.",
        goal: "Win with your COPIED role's team.",
    },
};

export default function RoleCard({ role, initialRole, phase }: RoleCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasSeenIntro, setHasSeenIntro] = useState(false);

    // Show intro reveal on mount if night phase and haven't seen it
    useEffect(() => {
        if (phase === "night" && !hasSeenIntro) {
            setIsOpen(true);
            const timer = setTimeout(() => {
                setIsOpen(false);
                setHasSeenIntro(true);
            }, 5000); // Auto-close after 5s
            return () => clearTimeout(timer);
        }
    }, [phase, hasSeenIntro]);

    const info = ROLE_INFO[initialRole] || ROLE_INFO.villager;
    const Icon = info.icon;

    if (!role) return null;

    return (
        <>
            {/* Expanded Modal / Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                >
                    <Card className="w-full max-w-md bg-zinc-900 border-2 border-indigo-500/50 shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
                        <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                            <h2 className="text-xl font-bold text-zinc-400 uppercase tracking-widest">You are the</h2>

                            <div className={`p-6 rounded-full bg-zinc-950 border-4 border-white/10 ${info.color}`}>
                                <Icon className="w-16 h-16" />
                            </div>

                            <div className="space-y-2">
                                <h1 className={`text-5xl font-black uppercase ${info.color}`}>{initialRole}</h1>

                                <div className="pt-4 space-y-4">
                                    <div className="bg-white/5 p-4 rounded-xl">
                                        <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Ability</p>
                                        <p className="text-lg font-medium text-white leading-tight">{info.ability}</p>
                                    </div>

                                    <div className="bg-white/5 p-4 rounded-xl">
                                        <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Goal</p>
                                        <p className="text-lg font-medium text-white leading-tight">{info.goal}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-zinc-600 animate-pulse mt-4">Tap anywhere to dismiss</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Persistent HUD Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 left-4 z-40 bg-zinc-900/90 border border-white/10 p-3 rounded-full shadow-lg backdrop-blur-md active:scale-95 transition-all text-zinc-400 hover:text-white"
            >
                <div className="flex items-center gap-2">
                    <Icon className={`w-6 h-6 ${info.color}`} />
                    <span className="text-xs font-bold uppercase hidden sm:block">{initialRole}</span>
                </div>
            </button>
        </>
    );
}
