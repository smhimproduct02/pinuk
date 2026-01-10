import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const { name, roomCode } = await request.json();

        if (!name || typeof name !== "string") {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        if (!roomCode || typeof roomCode !== "string") {
            return NextResponse.json({ error: "Room Code is required" }, { status: 400 });
        }

        // Find the specific game by room code
        const activeGames = await db
            .select()
            .from(games)
            .where(and(
                eq(games.shortId, roomCode.toUpperCase()),
                eq(games.status, "waiting")
            ))
            .limit(1);

        let gameId;

        if (activeGames.length === 0) {
            return NextResponse.json({ error: "Invalid Room Code or game already started." }, { status: 404 });
        } else {
            gameId = activeGames[0].id;
        }

        // Add player
        const [newPlayer] = await db
            .insert(players)
            .values({
                gameId,
                name,
                role: "villager", // Default, will change later
                isHost: false, // Only admin is host? Or maybe this flow is just for players.
            })
            .returning();

        return NextResponse.json({
            success: true,
            playerId: newPlayer.id,
            gameId: newPlayer.gameId
        });

    } catch (error) {
        console.error("Join error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
