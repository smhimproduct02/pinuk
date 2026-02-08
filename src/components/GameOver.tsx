\"use client\";

import { useEffect, useState } from \"react\";
import { Trophy, Skull, Moon, Users, Target } from \"lucide-react\";
import { Button } from \"@/components/ui/button\";
import { Card, CardContent } from \"@/components/ui/card\";
import ParticleEffect from \"@/components/ParticleEffect\";

interface GameOverProps {
    winner: \"villager\" | \"werewolf\" | \"tanner\";
    players: any[];
    myPlayerId: string;
    onPlayAgain?: () => void;
}

export default function GameOver({ winner, players, myPlayerId, onPlayAgain }: GameOverProps) {
    const [showRoles, setShowRoles] = useState(false);
    const myPlayer = players.find((p: any) => p.id === myPlayerId);
    const didIWin =
        (winner === \"villager\" && ![\"werewolf\", \"minion\"].includes(myPlayer?.role)) ||
            (winner === \"werewolf\" && [\"werewolf\", \"minion\"].includes(myPlayer?.role)) ||
                (winner === \"tanner\" && myPlayer?.role === \"tanner\");

    useEffect(() => {
                    const timer = setTimeout(() => setShowRoles(true), 3000);
                    return () => clearTimeout(timer);
                }, []);

    const winnerText = winner === \"villager\" ? \"Villagers Win!\" : winner === \"werewolf\" ? \"Werewolves Win!\" : \"Tanner Wins!";
    const winnerColor = winner === \"villager\" ? \"text-green-400\" : winner === \"werewolf\" ? \"text-red-500\" : \"text-amber-500\";
    const WinnerIcon = winner === \"villager\" ? Users : winner === \"werewolf\" ? Moon : Trophy;

    return (
        <div className=\"min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden\">
    {
        didIWin && <ParticleEffect type=\"sparkles\" count={50} />}

        {/* Background Effects */ }
        <div className=\"absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]\" />

            < div className =\"max-w-4xl w-full space-y-8 relative z-10\">
        {/* Winner Announcement */ }
        <div className=\"text-center space-y-6 animate-in zoom-in-95 duration-500\">
            < div className = {`inline-flex p-8 rounded-full bg-white/5 border-4 ${winner === \"villager\" ? \"border-green-400\" : winner === \"werewolf\" ? \"border-red-500\" : \"border-amber-500\"} animate-bounce`}>
                < WinnerIcon className = {`w-24 h-24 ${winnerColor}`
    } />
                    </div >
                    
                    <h1 className={`text-6xl font-black uppercase tracking-tight ${winnerColor} drop-shadow-[0_0_30px_currentColor]`}>
                        {winnerText}
                    </h1>

                    <p className=\"text-2xl text-zinc-400\">
    {
        didIWin ? (
            <span className=\"text-green-400 font-bold\">🎉 You Won! 🎉</span>
                        ) : (
            <span className=\"text-red-400\">You Lost</span>
                        )
    }
                    </p >
                </div >

        {/* Role Reveals */ }
    {
        showRoles && (
            <Card className=\"bg-zinc-900/50 border-zinc-800 backdrop-blur-sm animate-in slide-in-from-bottom duration-700\">
                < CardContent className =\"p-6 space-y-4\">
                    < h2 className =\"text-xl font-bold text-zinc-300 uppercase tracking-widest text-center border-b border-zinc-800 pb-4\">
                                Final Roles
                            </h2 >

            <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-3\">
        {
            players
                .sort((a: any, b: any) => {
                    // Sort: alive first, then by team
                    if (a.isAlive !== b.isAlive) return a.isAlive ? -1 : 1;
                    return 0;
                })
            .map((player: any, i: number) => {
                const isWolf = [\"werewolf\", \"minion\"].includes(player.role);
                                        const isTanner = player.role === \"tanner\";
                const roleColor = isWolf ?\"text-red-400\" : isTanner ? \"text-amber-400\" : \"text-green-400\";
                const borderColor = isWolf ?\"border-red-900/30\" : isTanner ? \"border-amber-900/30\" : \"border-green-900/30\";
                const wasMe = player.id === myPlayerId;

                return (
                    <div
                        key={player.id}
                        className={`flex items-center justify-between p-3 rounded-lg bg-zinc-950/50 border ${borderColor} ${wasMe ?\"ring-2 ring-blue-500\" : \"\"} animate-in slide-in-from-left duration-300`}
                style = {{ animationDelay: `${i * 50}ms` }
            }
                                            >
                <div className=\"flex items-center gap-3\">
                                                    {!player.isAlive && <Skull className=\"w-4 h-4 text-zinc-600\" />}
            < span className =\"text-white font-bold\">
                                                        { player.name }
                                                        { wasMe && <span className=\"text-blue-400 text-xs ml-1\">(You)</span>}
                                                    </span >
                                                </div >
                <div className=\"flex items-center gap-2\">
                                                    {
                    player.initialRole !== player.role && (
                        <>
                            <span className=\"text-xs text-zinc-600 line-through\">{player.initialRole}</span>
                <span className=\"text-zinc-600\">→</span>
                                                        </>
                                                    )
        }
        <span className={`text-sm font-black uppercase ${roleColor}`}>
            {player.role}
        </span>
                                                </div >
                                            </div >
                                        );
    })
}
                            </div >
                        </CardContent >
                    </Card >
                )}

{/* Action Buttons */ }
<div className=\"flex gap-4 justify-center animate-in slide-in-from-bottom duration-1000\">
    < Button
onClick = {() => window.location.href = \"/\"}
variant =\"outline\"
className =\"px-8 py-6 text-lg border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600\"
    >
    Exit to Lobby
                    </Button >

    { onPlayAgain && (
        <Button
            onClick={onPlayAgain}
            className=\"px-8 py-6 text-lg bg-indigo-600 hover:bg-indigo-700 font-bold\"
                >
                Play Again
                        </Button >
                    )}
                </div >
            </div >
        </div >
    );
}
