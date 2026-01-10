import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        // Optional: Check if admin is authenticated (skipping for MVP as per request)
        // Create new game
        const [newGame] = await db
            .insert(games)
            .values({
                status: "waiting",
            })
            .returning();

        return NextResponse.json({
            success: true,
            gameId: newGame.id
        });

    } catch (error) {
        console.error("Create game error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
