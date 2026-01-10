import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players, centerCards } from "@/db/schema";
import { eq } from "drizzle-orm";

const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export async function POST(request: Request) {
    try {
        const { gameId, roleConfig } = await request.json();

        if (!gameId) {
            return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
        }

        // 1. Fetch all players and clear existing center cards
        const currentPlayers = await db
            .select()
            .from(players)
            .where(eq(players.gameId, gameId));

        await db.delete(centerCards).where(eq(centerCards.gameId, gameId));

        if (currentPlayers.length === 0) {
            return NextResponse.json({ error: "No players in game" }, { status: 400 });
        }

        // 2. Validate & Prepare Role Pool
        let rolePool: string[] = [];
        // Standard game: 3 cards in center usually.
        // We will assume that roleConfig includes ALL cards including center ones?
        // OR we enforce roleConfig Sum = Players + 3.
        // Let's stick to simple: specific roles + random villagers to fill?
        // Or better: Let the Host decide total counts.
        // If Host provides roleConfig, we check if Total >= Players.
        // If Total > Players, the excess goes to center.
        // If Total < Players, error.

        // Logic Change: roleConfig count must be exactly Players + 3 (standard One Night Ultimate rule) OR just handle excess as center.
        // Let's handle excess as center.

        let centerAndPlayersPool: string[] = [];

        if (roleConfig) {
            Object.entries(roleConfig).forEach(([role, count]) => {
                for (let i = 0; i < (count as number); i++) {
                    centerAndPlayersPool.push(role);
                }
            });

            // Ensure we have enough roles for players
            if (centerAndPlayersPool.length < currentPlayers.length) {
                // If not enough, fill with villagers? Or Error?
                // Let's autofill villagers to meet Player count + 3 (for standard vibe)
                const needed = (currentPlayers.length + 3) - centerAndPlayersPool.length;
                if (needed > 0) {
                    for (let i = 0; i < needed; i++) centerAndPlayersPool.push("villager");
                }
            }
        } else {
            // Fallback default
            // ...
            return NextResponse.json({ error: "Config required for this version" }, { status: 400 });
        }

        // Shuffle all
        centerAndPlayersPool = shuffleArray(centerAndPlayersPool);

        // Assign to Players
        for (let i = 0; i < currentPlayers.length; i++) {
            const role = centerAndPlayersPool[i];
            await db
                .update(players)
                .set({
                    role: role as any,
                    initialRole: role as any,
                    isAlive: true,
                    actionTarget: null,
                    actionTargetSecondary: null
                })
                .where(eq(players.id, currentPlayers[i].id));
        }

        // Assign remaining to Center Cards
        const centerRoles = centerAndPlayersPool.slice(currentPlayers.length);
        // We typically have 3 center cards. If more, we just store them. If less, we store what we have.

        for (let i = 0; i < centerRoles.length; i++) {
            await db.insert(centerCards).values({
                gameId,
                role: centerRoles[i] as any,
                position: `center_${i}`
            });
        }

        // 3. Update Game Status -> playing, Phase -> night
        await db
            .update(games)
            .set({
                status: "playing",
                phase: "night",
                winner: null,
                phaseStartedAt: new Date()
            })
            .where(eq(games.id, gameId));

        return NextResponse.json({ success: true, centerCount: centerRoles.length });

    } catch (error) {
        console.error("Start game error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
