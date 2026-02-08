"use client";

import { useEffect, useState } from "react";
import { Skull, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MorningReportProps {
    phase: string;
    deaths: string[]; // Names of players who died
    onDismiss: () => void;
}

export default function MorningReport({ phase, deaths, onDismiss }: MorningReportProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Show when phase changes to morning or day, if there are deaths to report
    useEffect(() => {
        if (phase === "day" || phase === "morning") {
            setIsOpen(true);
            const timer = setTimeout(() => {
                setIsOpen(false);
                onDismiss();
            }, 8000); // Show for 8 seconds
            return () => clearTimeout(timer);
        }
    }, [phase]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
            <Card className="w-full max-w-lg bg-zinc-900 border-4 border-red-500/50 shadow-2xl scale-125 animate-in zoom-in-90 duration-500">
                <CardContent className="p-10 flex flex-col items-center text-center space-y-8">

                    {deaths.length > 0 ? (
                        <>
                            <Skull className="w-32 h-32 text-red-600 animate-bounce" />
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">TRAGEDY STRIKES!</h2>
                            <div className="space-y-4">
                                <p className="text-xl text-zinc-400">The village wakes to find...</p>
                                {deaths.map((name, i) => (
                                    <div key={i} className="text-4xl font-black text-red-500 uppercase bg-black/50 px-6 py-3 rounded-xl border border-red-900/50">
                                        {name}
                                    </div>
                                ))}
                                <p className="text-xl text-zinc-400">...has been killed.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Sun className="w-32 h-32 text-orange-500 animate-spin-slow" />
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">PEACEFUL NIGHT</h2>
                            <p className="text-xl text-zinc-400">The village wakes. Everyone survived the night.</p>
                        </>
                    )}

                    <button
                        onClick={() => { setIsOpen(false); onDismiss(); }}
                        className="mt-8 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:bg-zinc-200 active:scale-95 transition-all"
                    >
                        Begin Discussion
                    </button>
                </CardContent>
            </Card>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
            `}</style>
        </div>
    );
}
