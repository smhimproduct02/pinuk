import { NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const { playerId } = await request.json();

        if (!playerId) {
            return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
        }

        await db.delete(players).where(eq(players.id, playerId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Kick error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
