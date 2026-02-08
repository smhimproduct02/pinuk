import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players, centerCards } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const { gameId, nextPhase } = await request.json();

        if (!gameId || !nextPhase) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const game = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
        const currentPhase = game[0]?.phase;

        // LOGIC: Transitioning FROM Night TO Day
        if (currentPhase === "night" && nextPhase === "morning") {

            // 0. Resolve Role Swaps (Robber & Troublemaker & Drunk)
            const allPlayers = await db.select().from(players).where(eq(players.gameId, gameId));

            // Robber Action
            const robber = allPlayers.find(p => p.role === "robber" && p.isAlive && p.actionTarget);
            if (robber?.actionTarget) {
                const target = allPlayers.find(p => p.id === robber.actionTarget);
                if (target) {
                    await db.update(players).set({ role: target.role }).where(eq(players.id, robber.id));
                    await db.update(players).set({ role: "robber" }).where(eq(players.id, target.id));
                }
            }

            // Drunk Action
            const drunk = allPlayers.find(p => p.role === "drunk" && p.isAlive && p.actionTarget?.startsWith("center_"));
            if (drunk?.actionTarget) {
                const centerCard = await db.select().from(centerCards).where(and(eq(centerCards.gameId, gameId), eq(centerCards.position, drunk.actionTarget))).limit(1);
                if (centerCard[0]) {
                    await db.update(players).set({ role: centerCard[0].role }).where(eq(players.id, drunk.id));
                    await db.update(centerCards).set({ role: "drunk" }).where(eq(centerCards.id, centerCard[0].id));
                }
            }

            // Troublemaker Action
            const troublemaker = allPlayers.find(p => p.role === "troublemaker" && p.isAlive && p.actionTarget && p.actionTargetSecondary);
            if (troublemaker?.actionTarget && troublemaker.actionTargetSecondary) {
                const t1 = await db.select().from(players).where(eq(players.id, troublemaker.actionTarget)).limit(1);
                const t2 = await db.select().from(players).where(eq(players.id, troublemaker.actionTargetSecondary)).limit(1);
                if (t1[0] && t2[0]) {
                    await db.update(players).set({ role: t2[0].role }).where(eq(players.id, t1[0].id));
                    await db.update(players).set({ role: t1[0].role }).where(eq(players.id, t2[0].id));
                }
            }

            // 1. Calculate Werewolf Kill
            const werewolves = await db.select().from(players).where(and(eq(players.gameId, gameId), eq(players.role, "werewolf"), eq(players.isAlive, true)));
            const votes: Record<string, number> = {};
            werewolves.forEach(w => {
                if (w.actionTarget && !w.actionTarget.startsWith("center_")) {
                    votes[w.actionTarget] = (votes[w.actionTarget] || 0) + 1;
                }
            });

            let victimId = null;
            let maxVotes = 0;
            for (const [target, count] of Object.entries(votes)) {
                if (count > maxVotes) {
                    maxVotes = count;
                    victimId = target;
                }
            }

            // KILL VICTIM NOW
            if (victimId) {
                await db.update(players).set({ isAlive: false }).where(eq(players.id, victimId));
            }

            // Reset actions
            await db.update(players).set({ actionTarget: null, actionTargetSecondary: null }).where(eq(players.gameId, gameId));

            // Update Phase to MORNING
            await db.update(games).set({ phase: "morning", phaseStartedAt: new Date() }).where(eq(games.id, gameId));

            return NextResponse.json({ success: true, victimId });
        }

        // Transition from Morning to Day (Just a timer/manual click thing)
        if (currentPhase === "morning" && nextPhase === "day") {
            await db.update(games).set({ phase: "day", phaseStartedAt: new Date() }).where(eq(games.id, gameId));
            return NextResponse.json({ success: true });
        }


        // LOGIC: Transitioning FROM Day TO Night (Voting execution)
        if (currentPhase === "day" && nextPhase === "night") {
            // 1. Calculate Village Vote
            const allPlayers = await db.select().from(players).where(and(eq(players.gameId, gameId), eq(players.isAlive, true)));
            const votes: Record<string, number> = {};
            allPlayers.forEach(p => {
                if (p.actionTarget) {
                    votes[p.actionTarget] = (votes[p.actionTarget] || 0) + 1;
                }
            });

            let victimId = null;
            let maxVotes = 0;
            Object.entries(votes).forEach(([target, count]) => {
                if (count > maxVotes) {
                    maxVotes = count;
                    victimId = target;
                }
            });

            // Kill voted player
            let deadRole = null;
            if (victimId) {
                const victim = await db.select().from(players).where(eq(players.id, victimId)).limit(1);
                if (victim[0]) {
                    deadRole = victim[0].role;
                    await db.update(players).set({ isAlive: false }).where(eq(players.id, victimId));
                }
            }

            // 2. CHECK WIN CONDITIONS

            // Condition 1: Tanner Wins if he dies
            if (deadRole === "tanner") {
                await db.update(games).set({ status: "finished", winner: "tanner" }).where(eq(games.id, gameId));
                return NextResponse.json({ success: true, winner: "tanner" });
            }

            // Re-fetch living players
            const livingPlayers = await db.select().from(players).where(and(eq(players.gameId, gameId), eq(players.isAlive, true)));
            const livingWolves = livingPlayers.filter(p => p.role === "werewolf").length;
            const livingVillagers = livingPlayers.length - livingWolves;

            if (livingWolves === 0) {
                // Village Wins
                await db.update(games).set({ status: "finished", winner: "villager" }).where(eq(games.id, gameId));
                return NextResponse.json({ success: true, winner: "villager" });
            }

            if (livingWolves >= livingVillagers) {
                // Werewolves Win (Parity)
                await db.update(games).set({ status: "finished", winner: "werewolf" }).where(eq(games.id, gameId));
                return NextResponse.json({ success: true, winner: "werewolf" });
            }
        }

        // Reset all actions for next phase
        await db
            .update(players)
            .set({ actionTarget: null, actionTargetSecondary: null })
            .where(eq(players.gameId, gameId));

        // Update Phase
        await db
            .update(games)
            .set({
                phase: nextPhase,
                phaseStartedAt: new Date()
            })
            .where(eq(games.id, gameId));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Phase error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
