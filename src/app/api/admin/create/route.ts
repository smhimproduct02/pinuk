import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq } from "drizzle-orm";

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: Request) {
    try {
        const shortId = generateRoomCode();
        // Create new game
        const [newGame] = await db
            .insert(games)
            .values({
                shortId,
                status: "waiting",
            })
            .returning();

        return NextResponse.json({
            success: true,
            gameId: newGame.id,
            roomCode: newGame.shortId
        });

    } catch (error) {
        console.error("Create game error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
