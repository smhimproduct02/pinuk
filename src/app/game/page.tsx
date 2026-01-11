"use client";

import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Moon, Sun, Ghost, Check, Eye, HelpCircle, Shuffle, UserMinus, Skull, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSound } from "@/contexts/SoundContext";
import ParticleEffect from "@/components/ParticleEffect";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GamePage() {
    const { t } = useLanguage();
    const { playSound, toggleMute, isMuted } = useSound();
    const [gameId, setGameId] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
    const [hasActed, setHasActed] = useState(false);
    const [revealedInfo, setRevealedInfo] = useState<string | null>(null);
    const [showInitialRole, setShowInitialRole] = useState(true);
    const [timeLeft, setTimeLeft] = useState(60);
    const [showMenu, setShowMenu] = useState(false);

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
            setTimeLeft(remaining);

            if (remaining === 0 && myPlayer?.isHost) {
                const nextPhase = game.phase === "night" ? "day" : "night";
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
    const isDay = game.phase === "day";

    // --- GAME OVER ---
    if (game.status === "finished") {
        let isWinner = false;
        if (game.winner === "villager" && (myRole === "villager" || myRole === "seer" || myRole === "robber" || myRole === "troublemaker" || myRole === "drunk" || myRole === "insomniac")) isWinner = true;
        if (game.winner === "werewolf" && (myRole === "werewolf" || myRole === "minion")) isWinner = true;
        if (game.winner === "tanner" && myRole === "tanner") isWinner = true;

        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-10 text-center relative overflow-hidden ${isWinner ? 'bg-gradient-to-b from-green-900 via-emerald-950 to-black text-green-200' : 'bg-gradient-to-b from-red-900 via-rose-950 to-black text-red-200'} animate-in fade-in duration-1000`}>
                {/* Confetti for Winners */}
                {isWinner && <ParticleEffect type="confetti" count={80} />}

                {/* Glowing Background */}
                <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${isWinner ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-full blur-3xl animate-[pulse-glow_3s_ease-in-out_infinite]`} />

                <h1 className="text-5xl font-black mb-4 relative z-10 animate-[slide-up_0.6s_ease-out]">{isWinner ? t('victory') : t('defeat')}</h1>
                <p className="text-xl opacity-70 mb-8 relative z-10 animate-[fade-in-scale_0.8s_ease-out_0.2s_both]">
                    {game.winner === "villager" && t('win_villager')}
                    {game.winner === "werewolf" && t('win_werewolf')}
                    {game.winner === "tanner" && t('win_tanner')}
                </p>

                {/* Reveal Roles Grid */}
                <div className="grid grid-cols-3 gap-2 mb-8 w-full max-w-md">
                    {players.map((p: any) => (
                        <div key={p.id} className="bg-black/20 p-2 rounded flex flex-col items-center">
                            <span className="font-bold">{p.name}</span>
                            <span className="text-xs uppercase opacity-70">{p.role}</span>
                        </div>
                    ))}
                </div>

                <Button onClick={() => router.push("/")} variant="outline" className="border-white/20 hover:bg-white/10 text-white">
                    {t('back_home')}
                </Button>
            </div>
        )
    }

    // --- DEAD VIEW ---
    if (!myPlayer.isAlive) {
        return (
            <div className="min-h-screen bg-red-950/20 flex flex-col items-center justify-center text-red-500">
                <Ghost className="w-20 h-20 mb-4 animate-bounce" />
                <h1 className="text-3xl font-bold">{t('you_died')}</h1>
                <p className="mt-2 text-zinc-400">You are haunting the village.</p>
            </div>
        );
    }

    // --- TARGET SELECTION LOGIC ---
    const toggleTarget = (targetId: string) => {
        if (hasActed) return;
        playSound("click");

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

    // --- SUBMIT ACTION ---
    const submitAction = async () => {
        if (selectedTargets.length === 0) return;
        playSound("click");

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
            <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black p-4 pb-24 relative overflow-hidden">
                {/* Animated Starry Sky Background */}
                <ParticleEffect type="stars" count={100} />

                {/* Moonlight Glow */}
                <div className="fixed top-10 right-10 w-40 h-40 bg-blue-300/10 rounded-full blur-3xl animate-[breathe_4s_ease-in-out_infinite]" />

                {/* INITIAL ROLE REVEAL OVERLAY */}
                {showInitialRole && (
                    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
                        <Moon className="w-12 h-12 text-indigo-500 mb-8 animate-pulse" />
                        <h2 className="text-xl font-bold text-zinc-400 uppercase tracking-widest mb-12">Your Secret Role</h2>

                        <div className="perspective-1000 group cursor-pointer" onClick={() => setShowInitialRole(false)}>
                            <div className="relative w-64 h-96 transition-all duration-1000 transform-style-3d hover:rotate-y-180">
                                {/* Front (Card Back) */}
                                <div className="absolute inset-0 w-full h-full bg-indigo-900 rounded-2xl border-4 border-indigo-500 shadow-2xl flex flex-col items-center justify-center backface-hidden">
                                    <div className="w-32 h-32 rounded-full bg-indigo-800/50 flex items-center justify-center border border-indigo-400/30">
                                        <Shuffle className="w-16 h-16 text-indigo-300" />
                                    </div>
                                    <p className="mt-8 text-indigo-300 font-bold tracking-tighter text-lg">{t('tap_to_reveal')}</p>
                                </div>

                                {/* Back (The Role) */}
                                <div className="absolute inset-0 w-full h-full bg-zinc-900 rounded-2xl border-4 border-white shadow-[0_0_50px_rgba(99,102,241,0.3)] flex flex-col items-center justify-center rotate-y-180 backface-hidden p-6 text-center">
                                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">{myRole}</h3>
                                    <p className="text-zinc-300 text-sm font-medium mb-4 max-w-[200px] mx-auto leading-snug shadow-black drop-shadow-md">
                                        {t(`desc_${myRole}` as any)}
                                    </p>
                                    <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                        {myRole === "werewolf" ? <UserMinus className="w-12 h-12 text-white" /> : <Eye className="w-12 h-12 text-white" />}
                                    </div>

                                    {/* Simple Instructions */}
                                    <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-lg mb-4 text-left max-w-[250px]">
                                        <h4 className="text-xs font-black text-indigo-300 uppercase mb-2">📋 How to Play:</h4>
                                        <ul className="text-[10px] text-zinc-300 space-y-1 leading-tight">
                                            {myRole === "werewolf" && (
                                                <>
                                                    <li>• Find other werewolves</li>
                                                    <li>• Pretend to be villager</li>
                                                    <li>• Vote to eliminate a villager</li>
                                                </>
                                            )}
                                            {myRole === "villager" && (
                                                <>
                                                    <li>• No special action at night</li>
                                                    <li>• Discuss and find werewolves</li>
                                                    <li>• Vote to eliminate werewolf</li>
                                                </>
                                            )}
                                            {myRole === "seer" && (
                                                <>
                                                    <li>• Look at 1 player's card OR 2 center cards</li>
                                                    <li>• Use this info to find werewolves</li>
                                                    <li>• Don't reveal yourself too early!</li>
                                                </>
                                            )}
                                            {myRole === "robber" && (
                                                <>
                                                    <li>• Swap cards with another player</li>
                                                    <li>• You become their role</li>
                                                    <li>• Use info wisely in discussion</li>
                                                </>
                                            )}
                                            {myRole === "troublemaker" && (
                                                <>
                                                    <li>• Swap 2 other players' cards</li>
                                                    <li>• They don't know they swapped</li>
                                                    <li>• Create chaos!</li>
                                                </>
                                            )}
                                            {myRole === "drunk" && (
                                                <>
                                                    <li>• Must swap with center card</li>
                                                    <li>• Don't look at new role</li>
                                                    <li>• You don't know what you are!</li>
                                                </>
                                            )}
                                            {myRole === "minion" && (
                                                <>
                                                    <li>• Help werewolves win</li>
                                                    <li>• You see who werewolves are</li>
                                                    <li>• Protect them at all costs!</li>
                                                </>
                                            )}
                                            {myRole === "tanner" && (
                                                <>
                                                    <li>• You want to be eliminated!</li>
                                                    <li>• Act suspicious</li>
                                                    <li>• If you die, you win alone</li>
                                                </>
                                            )}
                                            {myRole === "insomniac" && (
                                                <>
                                                    <li>• Check your card at end of night</li>
                                                    <li>• See if someone swapped you</li>
                                                    <li>• You'll know your final role</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>

                                    <Button className="mt-2 bg-zinc-800 hover:bg-zinc-700 text-white border-white/10" onClick={(e) => { e.stopPropagation(); setShowInitialRole(false); }}>
                                        {t('continue')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <p className="mt-12 text-zinc-600 text-sm font-medium animate-bounce">{t('click_to_flip')}</p>
                    </div>
                )}

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

                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-500 ${timeLeft < 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-indigo-500/30 text-indigo-400'}`}>
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

                {/* PLAYERS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
                    {players
                        .filter((p: any) => p.id !== myPlayer.id && p.isAlive)
                        .map((p: any) => (
                            <Button
                                key={p.id}
                                variant={selectedTargets.includes(p.id) ? "default" : "outline"}
                                className={`h-32 flex flex-col items-center justify-center border-zinc-800 transition-all ${selectedTargets.includes(p.id) ? 'bg-indigo-600 border-indigo-500' : 'bg-zinc-900/50'
                                    } ${myRole === "drunk" ? 'opacity-30 pointer-events-none' : ''}`} // Drunk can't pick players
                                onClick={() => toggleTarget(p.id)}
                            >
                                <span className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-3 shadow-lg ${selectedTargets.includes(p.id) ? 'bg-white text-indigo-600' : 'bg-zinc-800 text-zinc-300'}`}>
                                    {p.name.charAt(0).toUpperCase()}
                                </span>
                                <span className="font-semibold text-lg tracking-wide">{p.name}</span>
                                {myRole === "werewolf" && p.role === "werewolf" && (
                                    <span className="text-[10px] text-red-500 uppercase font-bold mt-1">{t('found_wolf')}</span>
                                )}
                                {/* Minion sees wolves? Wait, Minion doesn't ACT, so Minion is in passive screen. Wolves see wolves? Yes. */}
                                {myRole === "werewolf" && players.find((x: any) => x.id === p.id && x.role === "werewolf") && (
                                    <span className="text-[10px] text-red-500 uppercase font-bold mt-1">{t('teammate')}</span>
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
                                    onClick={() => toggleTarget(cid)}
                                >
                                    <HelpCircle className="w-8 h-8" />
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirm Button */}
                {!hasActed && (
                    <div className="fixed bottom-0 left-0 right-0 px-4 flex justify-center mb-20 pb-safe">
                        <Button
                            className="w-full max-w-sm bg-indigo-500 hover:bg-indigo-600 font-bold py-6 text-lg"
                            disabled={selectedTargets.length === 0 && myRole !== "insomniac"} // Insomniac has no targets
                            onClick={submitAction}
                        >
                            {t('confirm_action')}
                        </Button>
                    </div>
                )}

                {hasActed && (
                    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">

                        {revealedInfo ? (
                            <div className="flex flex-col items-center gap-6">
                                <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">{t('revealed_info')}</h2>

                                <div className="flex flex-wrapjustify-center gap-4">
                                    {/* We need to parse revealedInfo or store raw roles. 
                                         Ideally we refactor to store raw roles. 
                                         For now, let's just show the Card Flip for the text if we can, or just a cool card.
                                         The current revealedInfo is text. 
                                         Let's render a "Mystery Card" that is already flipped?
                                         Or just style the results nicely.
                                     */}
                                    <div className="perspective-1000 group">
                                        <div className="relative w-64 h-96 transition-all duration-700 transform-style-3d group-hover:rotate-y-180 rotate-y-180">
                                            {/* Front (Hidden - logic inverted because we want it revealed) */}
                                            {/* Actually, let's just show the REVEALED side. 
                                                If we want animation: Start rot-0 (Back), then set rot-180 (Front) on mount?
                                             */}
                                            <div className="absolute inset-0 w-full h-full bg-indigo-900 rounded-xl border-4 border-indigo-500 backface-hidden flex items-center justify-center">
                                                <Moon className="w-20 h-20 text-indigo-400 opacity-50" />
                                            </div>

                                            {/* Back (Revealed Content) */}
                                            <div className="absolute inset-0 w-full h-full bg-zinc-900 rounded-xl border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 text-center">
                                                <Eye className="w-16 h-16 text-emerald-400 mb-6" />
                                                <p className="text-xl font-bold text-white leading-snug">{revealedInfo}</p>
                                                <p className="text-sm text-zinc-400 mt-4">Tap anywhere to close</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="outline" className="mt-8 border-white/20 text-white hover:bg-white/10" onClick={() => setHasActed(true)}>
                                    Close View
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                                    <Check className="w-10 h-10 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white tracking-wide">
                                    {t('action_submitted')}
                                </span>
                                <p className="text-zinc-400 mt-2">Wait for day...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // 2. DAY VIEW (Voting)
    if (isDay) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-orange-200 via-yellow-100 to-orange-50 p-4 pb-24 text-zinc-900 relative overflow-hidden">
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

                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-500 ${timeLeft < 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-indigo-500/30 text-indigo-400'}`}>
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
                                onClick={() => { if (!hasActed) { toggleTarget(p.id); } }}
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
