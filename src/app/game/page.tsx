"use client";

import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Moon, Sun, Ghost, Check, Eye, HelpCircle, Shuffle, UserMinus, Skull, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSound } from "@/contexts/SoundContext";
import { useSound } from "@/contexts/SoundContext";
import ParticleEffect from "@/components/ParticleEffect";
import RoleCard from "@/components/RoleCard";
import MorningReport from "@/components/MorningReport";
import { useHaptic } from "@/hooks/useHaptic";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GamePage() {
    const { t } = useLanguage();
    const { playSound, toggleMute, isMuted } = useSound();
    const { triggerHaptic } = useHaptic();
    const [gameId, setGameId] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
    const [hasActed, setHasActed] = useState(false);
    const [revealedInfo, setRevealedInfo] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [showMenu, setShowMenu] = useState(false);
    const [morningDeaths, setMorningDeaths] = useState<string[]>([]);
    const [showMorningReport, setShowMorningReport] = useState(false);
    const [phaseTransition, setPhaseTransition] = useState<{ active: boolean; type: "night" | "day" | null }>({
        active: false,
        type: null
    });
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

    const addRipple = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples(prev => [...prev, { id, x, y }]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);
    };
    // Track previous phase to trigger sounds
    const prevPhaseRef = useRef<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        setGameId(sessionStorage.getItem("werewolf_game_id"));
        setPlayerId(sessionStorage.getItem("werewolf_player_id"));
    }, []);

    const { data, error, mutate } = useSWR(
        gameId ? `/api/game?gameId=${gameId}` : null,
        fetcher,
        { refreshInterval: 2000 }
    );

    const game = data?.game;
    const players = data?.players || [];
    const myPlayer = players?.find((p: any) => p.id === playerId);

    // Audio Triggers
    useEffect(() => {
        if (game?.phase) {
            const currentPhase = game.phase;
            if (prevPhaseRef.current !== currentPhase) {
                // Trigger Phase Transition Overlay
                if (prevPhaseRef.current !== null) {
                    setPhaseTransition({
                        active: true,
                        type: currentPhase === "night" ? "night" : "day"
                    });
                    setTimeout(() => setPhaseTransition({ active: false, type: null }), 3000);
                }

                if (currentPhase === "night") {
                    playSound("night_start");
                    setShowInitialRole(true); // Reset for new night
                }
                if (currentPhase === "day") playSound("day_start");
                if (game.status === "finished") {
                    if (game.winner) playSound(game.winner === "villager" ? "win" : "lose");
                }
                prevPhaseRef.current = currentPhase;
            }
        }
    }, [game?.phase, game?.status, game?.winner, playSound]);

    // Timer Logic
    useEffect(() => {
        if (!game?.phaseStartedAt || game.status !== "playing") return;

        const interval = setInterval(() => {
            const start = new Date(game.phaseStartedAt).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((now - start) / 1000);
            const remaining = Math.max(0, 60 - diff);
            // Faster timer for morning phase (10s)
            const phaseDuration = game.phase === "morning" ? 10 : 60;
            const timeLeftCalc = Math.max(0, phaseDuration - diff);

            setTimeLeft(timeLeftCalc);

            if (timeLeftCalc === 0 && myPlayer?.isHost) {
                let nextPhase = "night";
                if (game.phase === "night") nextPhase = "morning";
                if (game.phase === "morning") nextPhase = "day";

                fetch("/api/admin/phase", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ gameId, nextPhase }),
                }).then(() => mutate());
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [game?.phaseStartedAt, game?.status, game?.phase, myPlayer?.isHost, gameId, mutate]);
    if (error) return <div>Error loading game</div>;
    if (!data) return <div className="text-center p-10">Loading...</div>;

    if (!myPlayer) return <div>Player not found</div>;

    const myRole = myPlayer.role;
    const isNight = game.phase === "night";
    const myRole = myPlayer.role;
    const isNight = game.phase === "night";
    const isDay = game.phase === "day";
    const isMorning = game.phase === "morning";

    // Detect Morning Phase to show Report
    useEffect(() => {
        if (isMorning) {
            const dead = players.filter((p: any) => !p.isAlive).map((p: any) => p.name);
            setMorningDeaths(dead);
            setShowMorningReport(true);
        } else {
            setShowMorningReport(false);
        }
    }, [isMorning, players]);

    // --- GAME OVER ---

    const [morningDeaths, setMorningDeaths] = useState<string[]>([]);

    // Import new components
    // Note: We need to import them at the top, but this tool only replaces a chunk. 
    // I will add the imports in a separate call or use a multi-replace if possible. 
    // Wait, I can't add imports with this tool if they are at the top and I'm editing the body.
    // I will use multi_replace for this file to do it cleaner.

    // SKIPPING THIS TOOL CALL TO USE MULTI_REPLACE INSTEAD


    // --- DEAD VIEW ---
    if (!myPlayer.isAlive) {
        // Determine cause of death context
        // If it's day now, they likely died last night (Werewolf)
        // If it's night now, they likely died today (Vote)
        // This is a heuristic. Ideally we store cause of death.
        // But for now:
        // isNight = they died by Vote (Day just ended)
        // isDay = they died by Wolf (Night just ended)

        // Actually, let's look at the previous phase logic or just simple inference.
        // If I am dead and it is Day -> I died at Night (Wolf)
        // If I am dead and it is Night -> I died at Day (Vote)
        // Exceptions: Hunter kill (immediate), Tanner (immediate win).

        const deathMessage = isDay ? t('death_wolf') : t('death_vote');
        const DeathIcon = isDay ? Skull : Ghost;

        return (
            <div className="min-h-screen bg-red-950/20 flex flex-col items-center justify-center text-red-500 p-6 text-center animate-in fade-in duration-1000">
                <DeathIcon className="w-24 h-24 mb-6 animate-pulse opacity-50" />
                <h1 className="text-4xl font-black uppercase tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">{t('you_died')}</h1>
                <p className="text-xl text-red-200/80 max-w-md font-serif italic mb-8 border-l-4 border-red-900/50 pl-4">
                    "{deathMessage}"
                </p>
                <div className="bg-black/40 p-4 rounded-xl border border-red-500/10">
                    <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest">{t('spectating')}</p>
                </div>
            </div>
        );
    }

    // --- TARGET SELECTION LOGIC ---
    const toggleTarget = (targetId: string, e: React.MouseEvent<HTMLElement>) => {
        if (hasActed) return;
        addRipple(e);
        playSound("click");
        triggerHaptic("light");

        // Logic branching based on Role
        if (myRole === "troublemaker") {
            // Must select 2 Players
            // Cannot select Center
            if (targetId.startsWith("center_")) return; // Troublemaker only swaps players?
            // Actually ONUW troublemaker swaps 2 players.

            if (selectedTargets.includes(targetId)) {
                setSelectedTargets(prev => prev.filter(id => id !== targetId));
            } else {
                if (selectedTargets.length < 2) setSelectedTargets(prev => [...prev, targetId]);
            }
        }
        else if (myRole === "seer") {
            // Logic: 1 Player OR 2 Center Cards.
            // If user selects a Player, clear center cards.
            // If user selects Center, clear Players.

            const isCenter = targetId.startsWith("center_");
            const hasCenterAlready = selectedTargets.some(id => id.startsWith("center_"));
            const hasPlayerAlready = selectedTargets.some(id => !id.startsWith("center_"));

            if (isCenter) {
                if (hasPlayerAlready) setSelectedTargets([targetId]); // Switch to center mode
                else {
                    // Toggle logic for center (max 2)
                    if (selectedTargets.includes(targetId)) setSelectedTargets(prev => prev.filter(id => id !== targetId));
                    else if (selectedTargets.length < 2) setSelectedTargets(prev => [...prev, targetId]);
                }
            } else {
                // Clicking a player
                // Always single selection for player
                setSelectedTargets([targetId]);
            }
        }
        else if (myRole === "drunk") {
            // Must select 1 Center Card
            if (!targetId.startsWith("center_")) return;
            setSelectedTargets([targetId]);
        }
        else {
            // Standard single target (Werewolf, Robber, Day Vote)
            if (targetId.startsWith("center_")) return; // Only Seer/Drunk touch center
            setSelectedTargets([targetId]);
        }
    };

    // --- CINEMATIC OVERLAY COMPONENT ---
    const PhaseOverlay = () => {
        if (!phaseTransition.active) return null;

        const isNightTrans = phaseTransition.type === "night";

        return (
            <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 bg-black/90 backdrop-blur-md`}>
                <div className="relative">
                    {isNightTrans ? (
                        <Moon className="w-32 h-32 text-indigo-500 mb-8 animate-[spin-slow_10s_linear_infinite]" />
                    ) : (
                        <Sun className="w-32 h-32 text-orange-400 mb-8 animate-[spin-slow_10s_linear_infinite]" />
                    )}
                    <div className="absolute inset-0 blur-2xl bg-current opacity-20 animate-pulse"></div>
                </div>
                <h2 className={`text-6xl font-black uppercase tracking-widest ${isNightTrans ? 'text-indigo-400' : 'text-orange-400'} animate-[slide-up_0.5s_ease-out]`}>
                    {isNightTrans ? t('night_phase') : t('day_phase')}
                </h2>
                <div className={`mt-4 h-1 w-64 bg-gradient-to-r from-transparent ${isNightTrans ? 'via-indigo-500' : 'via-orange-500'} to-transparent animate-[shimmer_2s_infinite]`}></div>
            </div>
        );
    };

    // --- SUBMIT ACTION ---
    const submitAction = async () => {
        if (selectedTargets.length === 0 && myRole !== "insomniac") return; // Allow Insomniac to submit with 0
        playSound("click");
        triggerHaptic("medium");

        // Validation
        if (myRole === "troublemaker" && selectedTargets.length !== 2) return;
        if (myRole === "seer" && selectedTargets[0].startsWith("center_") && selectedTargets.length !== 2) return;
        if (myRole === "drunk" && selectedTargets.length !== 1) return;
        // Insomniac has 0 targets, disallowed by default check? No, length 0 return.
        if (myRole !== "insomniac" && selectedTargets.length === 0) return; // Seer needs 2 center cards? Standard rule says "look at 2".

        try {
            const res = await fetch("/api/game/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerId,
                    targetId: selectedTargets[0],
                    targetId2: selectedTargets[1]
                }),
            });

            const actionData = await res.json();

            // Handle Info Reveal
            if (actionData.revealedRole) {
                const r = actionData.revealedRole;
                if (Array.isArray(r)) {
                    setRevealedInfo(`Center Cards: ${r.join(", ").toUpperCase()}`);
                } else {
                    if (myRole === "robber") {
                        setRevealedInfo(`You stole the ${r.toUpperCase()} role!`);
                    } else if (myRole === "insomniac") {
                        setRevealedInfo(`You woke up as a ${r.toUpperCase()}.`);
                    } else {
                        setRevealedInfo(`That player is a ${r.toUpperCase()}.`);
                    }
                }
            } else if (myRole === "drunk") {
                setRevealedInfo("You blindly swapped with a center card.");
            } else {
                setRevealedInfo("Action submitted.");
            }

            setHasActed(true);
            mutate();
        } catch (e) {
            console.error(e);
        }
    };


    // --- RENDER HELPERS ---

    // 1. NIGHT PHASE
    if (isNight) {
        // Roles with NO night action: Villager, Tanner, Minion targets nothing (just info)
        const passiveRoles = ["villager", "tanner", "minion"];
        if (passiveRoles.includes(myRole)) {
            // Minion Special View: See Wolves
            const wolves = players.filter((p: any) => p.role === "werewolf" && p.id !== myPlayer.id);

            return (
                <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                    {/* INITIAL ROLE REVEAL OVERLAY (PASSIVE) */}
                    {showInitialRole && (
                        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
                            <Moon className="w-12 h-12 text-indigo-500 mb-8 animate-pulse" />
                            <h2 className="text-xl font-bold text-zinc-400 uppercase tracking-widest mb-12">Your Secret Role</h2>

                            <div className="perspective-1000 group cursor-pointer" onClick={() => setShowInitialRole(false)}>
                                <div className="relative w-64 h-96 transition-all duration-1000 transform-style-3d hover:rotate-y-180">
                                    <div className="absolute inset-0 w-full h-full bg-zinc-800 rounded-2xl border-4 border-zinc-700 shadow-2xl flex flex-col items-center justify-center backface-hidden">
                                        <Shuffle className="w-16 h-16 text-zinc-500" />
                                        <p className="mt-8 text-zinc-500 font-bold tracking-tighter text-lg">TAP TO REVEAL</p>
                                    </div>
                                    <div className="absolute inset-0 w-full h-full bg-zinc-900 rounded-2xl border-4 border-white shadow-2xl flex flex-col items-center justify-center rotate-y-180 backface-hidden p-6 text-center">
                                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">{myRole}</h3>
                                        <div className="w-24 h-24 bg-zinc-700 rounded-full flex items-center justify-center mb-6">
                                            <Moon className="w-12 h-12 text-white" />
                                        </div>
                                        <Button className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white border-white/10" onClick={(e) => { e.stopPropagation(); setShowInitialRole(false); }}>
                                            Continue
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <Moon className="w-16 h-16 text-indigo-400 mb-4 animate-pulse" />
                    <h1 className="text-2xl font-bold text-zinc-200">{t('night_phase')}</h1>
                    <p className="text-zinc-500 mt-2 mb-8">
                        {myRole === "minion"
                            ? t('help_wolves')
                            : t('close_eyes')}
                    </p>

                    {myRole === "minion" && (
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                            <h2 className="text-red-400 uppercase tracking-widest text-xs font-bold mb-2">Werewolves</h2>
                            <div className="flex gap-4">
                                {wolves.map((w: any) => (
                                    <div key={w.id} className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">W</div>
                                        <span className="text-xs mt-1 text-red-200">{w.name}</span>
                                    </div>
                                ))}
                                {wolves.length === 0 && <span className="text-zinc-500 text-sm">{t('no_wolves')}</span>}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Active Roles
        let instructions = t('inst_default');
        if (myRole === "werewolf") instructions = t('choose_victim');
        if (myRole === "seer") instructions = t('inst_seer');
        if (myRole === "robber") instructions = t('choose_steal');
        if (myRole === "troublemaker") instructions = t('choose_swap');
        if (myRole === "drunk") instructions = t('inst_drunk');
        if (myRole === "insomniac") instructions = t('inst_insomniac');

        // Insomniac special button
        if (myRole === "insomniac") {
            return (
                <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
                    <Eye className="w-16 h-16 text-emerald-400 mb-4" />
                    <h1 className="text-2xl font-bold text-zinc-200">{t('insomniac_role')}</h1>
                    <p className="text-zinc-500 mt-2 mb-8">{t('check_end_night')}</p>
                    {!hasActed && (
                        <Button onClick={submitAction} className="bg-emerald-600 hover:bg-emerald-700 text-lg py-6 px-12">
                            {t('wake_check')}
                        </Button>
                    )}
                    {hasActed && <div className="text-2xl font-bold text-white mt-4">{revealedInfo}</div>}
                </div>
            )
        }

        return (
            <div className={`min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black p-4 pb-24 relative overflow-hidden ${(isDay && timeLeft < 10) ? 'shake-intense' : ''}`}>
                <PhaseOverlay />
                <RoleCard role={myRole} initialRole={myRole} phase={game.phase} />
                {/* Animated Starry Sky Background */}
                <ParticleEffect type="stars" count={100} />

                {/* Moonlight Glow */}
                <div className="fixed top-10 right-10 w-40 h-40 bg-blue-300/10 rounded-full blur-3xl animate-[breathe_4s_ease-in-out_infinite]" />

                {/* INITIAL ROLE REVEAL OVERLAY - REPLACED BY ROLE CARD COMPONENT */}
                {/* But keeping the manual one for now if needed, or removing it? 
                    RoleCard has its own modal. I should remove this block.
                */}

                {/* HEADER / TIMER / ROOM CODE */}
                <div className="flex justify-between items-center max-w-6xl mx-auto pt-2 relative z-20">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)} className="text-zinc-500">
                            <HelpCircle className="w-6 h-6" />
                        </Button>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none">{t('game_id')}</span>
                            <span className="text-xl font-mono font-black text-indigo-400 leading-none">{game.shortId}</span>
                        </div>
                    </div>

                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-500 ${timeLeft < 10 ? 'border-red-500 text-red-500 animate-pulse pulse-urgency scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'border-indigo-500/30 text-indigo-400'}`}>
                        <span className="text-2xl font-black">{timeLeft}</span>
                        <span className="text-[8px] uppercase font-bold tracking-tighter -mt-1">{t('seconds')}</span>
                    </div>

                    <Button variant="ghost" size="icon" onClick={toggleMute} className="text-zinc-500">
                        {isMuted ? <VolumeX /> : <Volume2 />}
                    </Button>
                </div>

                {/* NON-VOTER LIST (Real-time Transparency) */}
                <div className="max-w-6xl mx-auto mt-6 px-2">
                    {players.filter((p: any) => !p.actionTarget && p.isAlive).length > 0 && (
                        <div className="bg-zinc-900/40 border border-white/5 p-3 rounded-2xl flex items-center gap-3 overflow-x-auto custom-scrollbar">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 whitespace-nowrap">{t('waiting_for')}</span>
                            <div className="flex gap-2">
                                {players.filter((p: any) => !p.actionTarget && p.isAlive).map((p: any) => (
                                    <span key={p.id} className="text-xs font-bold text-zinc-400 bg-zinc-800/80 px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap">
                                        {p.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* PLAYER MENU OVERLAY */}
                {showMenu && (
                    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-start justify-start p-4 animate-in slide-in-from-left duration-300">
                        <Card className="w-64 bg-zinc-900 border-zinc-800 shadow-2xl">
                            <CardContent className="p-0">
                                <div className="p-6 border-b border-zinc-800">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">{t('player_menu')}</h3>
                                    <div className="space-y-1">
                                        <p className="text-xs text-zinc-600 uppercase font-bold tracking-tighter leading-none">{t('your_role')}</p>
                                        <p className="text-lg font-black text-white uppercase">{myRole}</p>
                                    </div>
                                </div>
                                <div className="p-2 space-y-1">
                                    <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => setShowMenu(false)}>
                                        {t('resume_game')}
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => router.push("/")}>
                                        {t('exit_menu')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex-1 h-full" onClick={() => setShowMenu(false)}></div>
                    </div>
                )}

                <div className="text-center mb-8 mt-4">
                    <Moon className="w-10 h-10 mx-auto text-indigo-500 mb-2" />
                    <h1 className="text-xl font-bold text-indigo-200 uppercase tracking-widest">{myRole} Phase</h1>
                    <p className="text-zinc-400 text-sm">{instructions}</p>
                </div>

                {/* PLAYERS GRID - Mobile Optimized */}
                <div className="grid grid-cols-2 gap-3 max-w-6xl mx-auto mb-24 touch-manipulation">
                    {players
                        .filter((p: any) => p.id !== myPlayer.id && p.isAlive)
                        .map((p: any) => (
                            <Button
                                key={p.id}
                                variant={selectedTargets.includes(p.id) ? "default" : "outline"}
                                className={`h-32 flex flex-col items-center justify-center border-zinc-800 transition-all ${selectedTargets.includes(p.id) ? 'bg-indigo-600 border-indigo-500' : 'bg-zinc-900/50'
                                    } ${myRole === "drunk" ? 'opacity-30 pointer-events-none' : ''}`} // Drunk can't pick players
                                onClick={(e) => toggleTarget(p.id, e)}
                            >
                                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
                                    {ripples.map(r => (
                                        <span key={r.id} className="absolute bg-white/30 rounded-full animate-ripple" style={{ left: r.x, top: r.y, width: 20, height: 20, transform: 'translate(-50%, -50%)' }} />
                                    ))}
                                </div>
                                <span className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-base md:text-lg mb-2 md:mb-3 shadow-lg ${selectedTargets.includes(p.id) ? 'bg-white text-indigo-600' : 'bg-zinc-800 text-zinc-300'}`}>
                                    {p.name.charAt(0).toUpperCase()}
                                </span>
                                <span className="font-semibold text-sm md:text-lg tracking-wide truncate max-w-[90%]">{p.name}</span>
                                {myRole === "werewolf" && p.role === "werewolf" && (
                                    <span className="text-[10px] text-red-500 uppercase font-bold mt-1">{t('found_wolf')}</span>
                                )}
                                {/* Minion sees wolves? Wait, Minion doesn't ACT, so Minion is in passive screen. Wolves see wolves? Yes. */}
                                {myRole === "werewolf" && players.find((x: any) => x.id === p.id && x.role === "werewolf") && (
                                    <>
                                        <span className="text-[10px] text-red-500 uppercase font-bold mt-1">{t('teammate')}</span>
                                        <div className="absolute inset-0 border-2 border-red-500/50 rounded-xl glow-werewolf pointer-events-none" />
                                    </>
                                )}
                            </Button>
                        ))}
                </div>

                {/* CENTER CARDS GRID (Seer / Drunk) */}
                {(myRole === "seer" || myRole === "drunk") && (
                    <div className="max-w-xl mx-auto">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="h-[1px] bg-zinc-800 flex-1"></div>
                            <span className="text-xs uppercase text-zinc-600 font-bold tracking-widest">{t('center_cards')}</span>
                            <div className="h-[1px] bg-zinc-800 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {["center_0", "center_1", "center_2"].map((cid) => (
                                <Button
                                    key={cid}
                                    variant="outline"
                                    className={`h-24 border-dashed border-2 ${selectedTargets.includes(cid) ? 'border-indigo-500 bg-indigo-500/20' : 'border-zinc-700 bg-transparent text-zinc-500'}`}
                                    onClick={(e) => toggleTarget(cid, e)}
                                >
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-sm">
                                        {ripples.map(r => (
                                            <span key={r.id} className="absolute bg-white/20 rounded-full animate-ripple" style={{ left: r.x, top: r.y, width: 20, height: 20, transform: 'translate(-50%, -50%)' }} />
                                        ))}
                                    </div>
                                    <HelpCircle className="w-8 h-8" />
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirm Button - Safe Area Aware */}
                {!hasActed && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-gradient-to-t from-black to-transparent z-40">
                        <Button
                            className="w-full max-w-sm mx-auto bg-indigo-500 hover:bg-indigo-600 font-bold py-6 text-lg shadow-xl active:scale-95 transition-all"
                            disabled={selectedTargets.length === 0 && myRole !== "insomniac"} // Insomniac has no targets
                            onClick={submitAction}
                        >
                            {t('confirm_action')}
                        </Button>
                    </div>
                )}

                {hasActed && (
                    { hasActed && (
                    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">

                        {/* GAME STATUS VISIBILITY FOR ACTED PLAYERS */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center max-w-6xl mx-auto w-full z-10">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none">{t('game_id')}</span>
                                <span className="text-xl font-mono font-black text-zinc-700 leading-none">{game.shortId}</span>
                            </div>
                             <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 border-zinc-800 text-zinc-600 transition-all duration-500 ${timeLeft < 10 ? 'border-red-900/50 text-red-900 animate-pulse' : ''}`}>
                                <span className="text-2xl font-black">{timeLeft}</span>
                                <span className="text-[8px] uppercase font-bold tracking-tighter -mt-1">{t('seconds')}</span>
                             </div>
                        </div>

                        {revealedInfo ? (
                             <div className="flex flex-col items-center gap-6 max-w-md text-center mt-10">
                                <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest animate-[slide-up_0.5s_ease-out]">{t('revealed_info')}</h2>

                                <div className="perspective-1000 group">
                                    <div className="relative w-64 h-96 transition-all duration-700 transform-style-3d group-hover:rotate-y-180 rotate-y-180 animate-[fade-in-scale_0.6s_ease-out_0.2s_both]">
                                        <div className="absolute inset-0 w-full h-full bg-indigo-900 rounded-xl border-4 border-indigo-500 backface-hidden flex items-center justify-center">
                                            <Moon className="w-20 h-20 text-indigo-400 opacity-50" />
                                        </div>
                                        <div className="absolute inset-0 w-full h-full bg-zinc-900 rounded-xl border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 text-center glow-seer">
                                            <ParticleEffect type="sparkles" count={20} />
                                            <Eye className="w-16 h-16 text-emerald-400 mb-6 animate-pulse" />
                                            <p className="text-xl font-bold text-white leading-snug">{revealedInfo}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <Button variant="outline" className="mt-8 border-white/20 text-white hover:bg-white/10" onClick={() => setHasActed(true)}>
                                    {/* Actually we are IN hasActed=true. This button does nothing essentially if it sets true again. 
                                        Maybe we want to "Minimize" this view? Or just leave it.
                                        User asked to see "who doesnt vote yet".
                                        So we should show that list here.
                                    */}
                                    {t('action_submitted')}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center animate-in zoom-in duration-300 gap-8 mt-10 w-full max-w-lg">
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                                        <Check className="w-10 h-10 text-white" />
                                    </div>
                                    <span className="text-2xl font-bold text-white tracking-wide">{t('action_submitted')}</span>
                                    <p className="text-zinc-500 mt-2">{t('waiting_for_others')}</p>
                                </div>

                                {/* Waiting List Integration */}
                                {players.filter((p: any) => !p.actionTarget && p.isAlive).length > 0 && (
                                     <div className="w-full bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50 backdrop-blur-sm">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-700 pb-2">{t('waiting_for')}</h3>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {players.filter((p: any) => !p.actionTarget && p.isAlive).map((p: any) => (
                                                <div key={p.id} className="flex items-center gap-2 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-700">
                                                     <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                                     <span className="text-sm font-bold text-zinc-300">{p.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                     </div>
                                )}
                            </div>
                        )}
                                    {t('action_submitted')}
                                </span>
                                <p className="text-zinc-400 mt-2">Wait for day...</p>
                            </div>
        )
    }
                    </div >
                )
}
            </div >
        );
    }

// 2. DAY VIEW (Voting) & MORNING
if (isDay || isMorning) {
    return (
        <div className={`min-h-screen bg-gradient-to-b from-orange-200 via-yellow-100 to-orange-50 p-4 pb-24 text-zinc-900 relative overflow-hidden ${timeLeft < 10 ? 'shake-intense' : ''}`}>
            <PhaseOverlay />
            <RoleCard role={myRole} initialRole={myRole} phase={game.phase} />
            <MorningReport phase={game.phase} deaths={morningDeaths} onDismiss={() => setShowMorningReport(false)} />

            {/* Animated Sun and Sun Rays */}
            <div className="fixed top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-40 animate-[breathe_3s_ease-in-out_infinite]" />
            <div className="fixed top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-yellow-400 rounded-full opacity-60 animate-[pulse-glow_2s_ease-in-out_infinite]" />

            {/* HEADER / TIMER / ROOM CODE */}
            <div className="flex justify-between items-center max-w-6xl mx-auto pt-2 relative z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)} className="text-zinc-500">
                        <HelpCircle className="w-6 h-6" />
                    </Button>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none">Code</span>
                        <span className="text-xl font-mono font-black text-indigo-400 leading-none">{game.shortId}</span>
                    </div>
                </div>

                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-500 ${timeLeft < 10 ? 'border-red-500 text-red-500 animate-pulse pulse-urgency scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'border-indigo-500/30 text-indigo-400'}`}>
                    <span className="text-2xl font-black">{timeLeft}</span>
                    <span className="text-[8px] uppercase font-bold tracking-tighter -mt-1">SEC</span>
                </div>

                <Button variant="ghost" size="icon" onClick={toggleMute} className="text-zinc-500">
                    {isMuted ? <VolumeX /> : <Volume2 />}
                </Button>
            </div>

            {/* NON-VOTER LIST */}
            <div className="max-w-6xl mx-auto mt-6 px-2">
                {players.filter((p: any) => !p.actionTarget && p.isAlive).length > 0 && (
                    <div className="bg-zinc-900/40 border border-white/5 p-3 rounded-2xl flex items-center gap-3 overflow-x-auto custom-scrollbar">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 whitespace-nowrap">Waiting for:</span>
                        <div className="flex gap-2">
                            {players.filter((p: any) => !p.actionTarget && p.isAlive).map((p: any) => (
                                <span key={p.id} className="text-xs font-bold text-zinc-400 bg-zinc-800/80 px-3 py-1.5 rounded-full border border-white/5 whitespace-nowrap">
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* PLAYER MENU */}
            {showMenu && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-start justify-start p-4 animate-in slide-in-from-left duration-300">
                    <Card className="w-64 bg-zinc-900 border-zinc-800 shadow-2xl">
                        <CardContent className="p-0">
                            <div className="p-6 border-b border-zinc-800">
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">Player Menu</h3>
                                <div className="space-y-1">
                                    <p className="text-xs text-zinc-600 uppercase font-bold tracking-tighter leading-none">Your Role</p>
                                    <p className="text-lg font-black text-white uppercase">{myRole}</p>
                                </div>
                            </div>
                            <div className="p-2 space-y-1">
                                <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => setShowMenu(false)}>
                                    Resume Game
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => router.push("/")}>
                                    Exit to Menu
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex-1 h-full" onClick={() => setShowMenu(false)}></div>
                </div>
            )}

            <div className="text-center mb-8">
                <Sun className="w-12 h-12 mx-auto text-orange-400 mb-2 animate-spin-slow" />
                <h1 className="text-xl font-bold uppercase tracking-widest">{t('day_phase')}</h1>
                <p className="text-zinc-500 text-sm">{t('choose_victim')}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {players
                    .filter((p: any) => p.isAlive)
                    .map((p: any) => (
                        <div
                            key={p.id}
                            onClick={(e) => { if (!hasActed) { toggleTarget(p.id, e); } }}
                            className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer h-24 ${selectedTargets.includes(p.id)
                                ? 'bg-red-900/30 border-red-500 ring-1 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                : 'bg-zinc-800/40 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-lg shadow-inner text-zinc-200">
                                    {p.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-lg text-zinc-200">{p.name}</span>
                                    {p.id === myPlayer.id && <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">(You)</span>}
                                </div>
                            </div>
                            {selectedTargets.includes(p.id) && (
                                <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                                    <Check className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    ))}
            </div>

            {!hasActed && (
                <div className="fixed bottom-0 left-0 right-0 px-4 flex justify-center mb-20 pb-safe">
                    <Button
                        className="w-full max-w-sm bg-red-600 hover:bg-red-700 font-bold py-6 text-lg"
                        disabled={selectedTargets.length === 0}
                        onClick={submitAction}
                    >
                        {t('vote_eliminate')}
                    </Button>
                </div>
            )}
            {hasActed && (
                <div className="fixed bottom-0 left-0 right-0 px-4 flex justify-center mb-20 pb-safe">
                    <span className="bg-zinc-800 text-zinc-400 px-6 py-3 rounded-full font-medium">
                        {t('vote_cast')}
                    </span>
                </div>
            )}
        </div>
    );
}

return <div>Loading...</div>;
}
