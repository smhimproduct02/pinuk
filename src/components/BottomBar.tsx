"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Settings } from "lucide-react";

export function BottomBar() {
    const pathname = usePathname();

    // Only show on non-home pages if needed, or always.
    // For this app, maybe only inside the game/lobby?
    // Let's keep it simple for now and render if not on root, 
    // or render always but with different options.

    // Actually, user requested "Join as Player" or "Enter as Admin" on entry.
    // We might not need the bar on the very first screen.

    if (pathname === "/" || pathname === "/lobby") return null;

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-lg pb-safe">
            <div className="flex items-center justify-around h-16">
                <Link
                    href="/lobby"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/lobby') ? 'text-primary' : 'text-zinc-500'}`}
                >
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Lobby</span>
                </Link>
                <Link
                    href="/game"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/game') ? 'text-primary' : 'text-zinc-500'}`}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Game</span>
                </Link>
                <Link
                    href="/admin"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/admin') ? 'text-primary' : 'text-zinc-500'}`}
                >
                    <Settings className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Admin</span>
                </Link>
            </div>
        </div>
    );
}
