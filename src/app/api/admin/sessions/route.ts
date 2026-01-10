import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const allGames = await db
            .select()
            .from(games)
            .orderBy(desc(games.createdAt))
            .limit(20);

        // For each game, get player count
        const gamesWithCount = await Promise.all(allGames.map(async (game) => {
            const p = await db.select().from(players).where(eq(players.gameId, game.id));
            return {
                ...game,
                playerCount: p.length
            };
        }));

        return NextResponse.json({ success: true, sessions: gamesWithCount });
    } catch (error) {
        console.error("Sessions fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { gameId } = await request.json();
        if (!gameId) return NextResponse.json({ error: "Missing gameId" }, { status: 400 });

        // Logic: Delete players first then game (or cascade if set up, but let's be explicit)
        await db.delete(players).where(eq(players.gameId, gameId));
        await db.delete(games).where(eq(games.id, gameId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Session delete error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
