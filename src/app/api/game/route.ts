import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const gameId = searchParams.get("gameId");

        if (!gameId) {
            return NextResponse.json({ error: "Game ID required" }, { status: 400 });
        }

        const game = await db.select().from(games).where(eq(games.id, gameId)).limit(1);

        if (!game.length) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        const gamePlayers = await db.select().from(players).where(eq(players.gameId, gameId));

        return NextResponse.json({
            game: game[0],
            players: gamePlayers
        });

    } catch (error) {
        console.error("Get game error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
