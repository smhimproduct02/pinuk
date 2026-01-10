"use client";

import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Moon, Sun, Ghost, Check, Eye, HelpCircle, Shuffle, UserMinus, Skull, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSound } from "@/contexts/SoundContext";

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

    // Track previous phase to trigger sounds
    const prevPhaseRef = useRef<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        setGameId(localStorage.getItem("werewolf_game_id"));
        setPlayerId(localStorage.getItem("werewolf_player_id"));
    }, []);

    const { data, error, mutate } = useSWR(
        gameId ? `/api/game?gameId=${gameId}` : null,
        fetcher,
        { refreshInterval: 2000 }
    );

    // Audio Triggers
    useEffect(() => {
        if (data?.game?.phase) {
            const currentPhase = data.game.phase;
            if (prevPhaseRef.current !== currentPhase) {
                if (currentPhase === "night") {
                    playSound("night_start");
                    setShowInitialRole(true); // Reset for new night
                }
                if (currentPhase === "day") playSound("day_start");
                if (data.game.status === "finished") {
                    // Check win
                    // Need to wait for render logic or just check data.game.winner
                    if (data.game.winner) playSound(data.game.winner === "villager" ? "win" : "lose"); // Simplify
                }
                prevPhaseRef.current = currentPhase;
            }
        }
    }, [data?.game?.phase, data?.game?.status, playSound]);


    if (error) return <div>Error loading game</div>;
    if (!data) return <div className="text-center p-10">Loading...</div>;

    const { game, players } = data;
    const myPlayer = players.find((p: any) => p.id === playerId);

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
            <div className={`min-h-screen flex flex-col items-center justify-center p-10 text-center ${isWinner ? 'bg-green-950 text-green-200' : 'bg-red-950 text-red-200'} animate-in fade-in duration-1000`}>
                <h1 className="text-5xl font-bold mb-4">{isWinner ? t('victory') : t('defeat')}</h1>
                <p className="text-2xl mb-8 font-light tracking-wide">
                    {game.winner === "villager" && "Village Wins!"}
                    {game.winner === "werewolf" && "Werewolves Win!"}
                    {game.winner === "tanner" && "The Tanner Wins!"}
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
                            ? "Use this info to help the wolves win!"
                            : "Close your eyes and wait for morning."}
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
                                {wolves.length === 0 && <span className="text-zinc-500 text-sm">No wolves found.</span>}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Active Roles
        let instructions = "Choose a player.";
        if (myRole === "werewolf") instructions = t('choose_victim');
        if (myRole === "seer") instructions = "View 1 Player OR 2 Center Cards.";
        if (myRole === "robber") instructions = t('choose_steal');
        if (myRole === "troublemaker") instructions = t('choose_swap');
        if (myRole === "drunk") instructions = "Choose a center card to swap with.";
        if (myRole === "insomniac") instructions = "Wait to see your final role.";

        // Insomniac special button
        if (myRole === "insomniac") {
            return (
                <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
                    <Eye className="w-16 h-16 text-emerald-400 mb-4" />
                    <h1 className="text-2xl font-bold text-zinc-200">Insomniac</h1>
                    <p className="text-zinc-500 mt-2 mb-8">Check your role at the end of the night.</p>
                    {!hasActed && (
                        <Button onClick={submitAction} className="bg-emerald-600 hover:bg-emerald-700 text-lg py-6 px-12">
                            Wake Up & Check Role
                        </Button>
                    )}
                    {hasActed && <div className="text-2xl font-bold text-white mt-4">{revealedInfo}</div>}
                </div>
            )
        }

        return (
            <div className="min-h-screen bg-zinc-950 p-4 pb-24 relative overflow-hidden">
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
                                    <p className="mt-8 text-indigo-300 font-bold tracking-tighter text-lg">TAP TO REVEAL</p>
                                </div>

                                {/* Back (The Role) */}
                                <div className="absolute inset-0 w-full h-full bg-zinc-900 rounded-2xl border-4 border-white shadow-[0_0_50px_rgba(99,102,241,0.3)] flex flex-col items-center justify-center rotate-y-180 backface-hidden p-6 text-center">
                                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">{myRole}</h3>
                                    <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                        {myRole === "werewolf" ? <UserMinus className="w-12 h-12 text-white" /> : <Eye className="w-12 h-12 text-white" />}
                                    </div>
                                    <Button className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white border-white/10" onClick={(e) => { e.stopPropagation(); setShowInitialRole(false); }}>
                                        Continue
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <p className="mt-12 text-zinc-600 text-sm font-medium animate-bounce">Click the card to flip</p>
                    </div>
                )}
                <div className="flex justify-between items-center max-w-6xl mx-auto pt-2">
                    <Button variant="ghost" size="icon" onClick={toggleMute} className="text-zinc-500">
                        {isMuted ? <VolumeX /> : <Volume2 />}
                    </Button>
                </div>

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
                                    <span className="text-[10px] text-red-500 uppercase font-bold mt-1">Found Wolf</span>
                                )}
                                {/* Minion sees wolves? Wait, Minion doesn't ACT, so Minion is in passive screen. Wolves see wolves? Yes. */}
                                {myRole === "werewolf" && players.find((x: any) => x.id === p.id && x.role === "werewolf") && (
                                    <span className="text-[10px] text-red-500 uppercase font-bold mt-1">(Teammate)</span>
                                )}
                            </Button>
                        ))}
                </div>

                {/* CENTER CARDS GRID (Seer / Drunk) */}
                {(myRole === "seer" || myRole === "drunk") && (
                    <div className="max-w-xl mx-auto">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="h-[1px] bg-zinc-800 flex-1"></div>
                            <span className="text-xs uppercase text-zinc-600 font-bold tracking-widest">Center Cards</span>
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
            <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 p-4 pb-24 text-zinc-900 dark:text-zinc-50">
                <div className="flex justify-between items-center max-w-6xl mx-auto pt-2 mb-4">
                    <Button variant="ghost" size="icon" onClick={toggleMute} className="text-zinc-400">
                        {isMuted ? <VolumeX /> : <Volume2 />}
                    </Button>
                </div>

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
