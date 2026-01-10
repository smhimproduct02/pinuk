import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const { name } = await request.json();

        if (!name || typeof name !== "string") {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Find the latest 'waiting' game
        const activeGames = await db
            .select()
            .from(games)
            .where(eq(games.status, "waiting"))
            .orderBy(desc(games.createdAt))
            .limit(1);

        let gameId;

        if (activeGames.length === 0) {
            // Option A: Auto-create game on first join (simplest for MVP)
            // Option B: Error and tell them to wait for admin.
            // Let's go with Error for now as per "Admin starts game" flow.
            return NextResponse.json({ error: "No active game found. Ask the host to open the lobby." }, { status: 404 });
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
