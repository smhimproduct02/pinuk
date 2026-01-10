import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const { gameId } = await request.json();

        if (!gameId) {
            return NextResponse.json({ error: "Missing gameId" }, { status: 400 });
        }

        // Reset Players
        await db
            .update(players)
            .set({
                role: null,
                initialRole: null,
                isAlive: true,
                actionTarget: null,
                actionTargetSecondary: null
            })
            .where(eq(players.gameId, gameId));

        // Reset Game
        await db
            .update(games)
            .set({
                status: "waiting",
                phase: "lobby",
                winner: null
            })
            .where(eq(games.id, gameId));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Reset error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
