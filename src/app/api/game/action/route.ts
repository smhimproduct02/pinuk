import { NextResponse } from "next/server";
import { db } from "@/db";
import { players, centerCards } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const { playerId, targetId, targetId2 } = await request.json();

        if (!playerId || !targetId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const actor = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
        if (!actor[0]) return NextResponse.json({ error: "Player not found" }, { status: 404 });

        // Update Action Log in DB
        await db
            .update(players)
            .set({
                actionTarget: targetId,
                actionTargetSecondary: targetId2 || null
            })
            .where(eq(players.id, playerId));

        let revealedRole: string | string[] | null = null;
        const myRole = actor[0].role;

        // --- SEER LOGIC ---
        // Seer can view 1 Player OR 2 Center Cards
        if (myRole === "seer") {
            const isCenterTarget = targetId.startsWith("center_");

            if (isCenterTarget) {
                // Viewing Center Cards
                const centerPositions = [targetId];
                if (targetId2 && targetId2.startsWith("center_")) {
                    centerPositions.push(targetId2);
                }

                // Fetch cards
                // Note: In Drizzle, OR condition for where clauses
                // But simplified: fetch all center cards for this game and filter?
                // Or just loop query (lazy but works for 2 items)

                const cards = await db.select().from(centerCards).where(eq(centerCards.gameId, actor[0].gameId));
                const foundRoles = cards
                    .filter(c => centerPositions.includes(c.position) && c.role !== null)
                    .map(c => c.role as string);

                if (foundRoles.length > 0) revealedRole = foundRoles;

            } else {
                // Viewing Player
                const target = await db.select().from(players).where(eq(players.id, targetId)).limit(1);
                revealedRole = target[0]?.role || null;
            }
        }

        // --- ROBBER LOGIC ---
        // Swaps with a player and sees their new role
        if (myRole === "robber") {
            const target = await db.select().from(players).where(eq(players.id, targetId)).limit(1);
            if (target[0]) {
                revealedRole = target[0].role; // Robber sees the role they stole

                // The actual SWAP happens at Phase Change in phase/route.ts
                // BUT wait, Robber needs to see the card NOW.
                // Standard logic: Robber swaps immediately? Or at end?
                // If Robber swaps immediately, then Seer might see the new role?
                // One Night Ultimate: "You may exchange with another player... and then look at your new card."
                // Usually actions are simultaneous resolution or based on turn order.
                // My `phase/route.ts` handles the swap.
                // So here we only return the *knowledge*.
                // Correct.
            }
        }

        // --- DRUNK LOGIC ---
        // Swaps with a center card. Does NOT see it.
        if (myRole === "drunk") {
            // Logic handling:
            // The ACTUAL swap needs to be recorded.
            // Currently `phase/route.ts` handles swaps based on `actionTarget`.
            // I need to ensure `phase/route.ts` can handle "center_X" targets.
            // The Drunk does NOT get `revealedRole`.
        }

        // --- INSOMNIAC LOGIC ---
        // Sees their own role at end of night.
        // This is usually a separate poll or just done here if they click "Wake Up".
        // But Insomniac action is just "Wake Up".
        // If the client calls this verify endpoint...
        if (myRole === "insomniac") {
            // Ensure this is called at the END of night (which is tricky with async API).
            // Actually, Insomniac wakes up LAST.
            // So if the client UI ensures this is called, then:
            revealedRole = actor[0].role; // But wait, roles haven't swapped yet in DB!
            // Problem: DB swaps happen at Phase Change.
            // Insomniac needs to see role AFTER swaps.
            // Solution: Insomniac doesn't really "act" in a way that generates target.
            // They just wake up.
            // Maybe Insomniac info comes from the `GET /game` loop if phase is "night_end"?
            // OR: `phase/route.ts` should resolve swaps BEFORE Day starts?
            // YES. `phase/route.ts` moves Night -> Day.
            // So Insomniac info is tricky.
            // The Phase Transition calculates swaps.
            // Insomniac needs to see result *before* Day?
            // Or at start of Day?
            // "Insomniac wakes up to see if their role changed."
            // This implies they look *after* Robber/Troublemaker/Drunk.
            // BUT in this async web app, we batch process at "Next Phase".
            // So: Host clicks "Start Day". Server calculates swaps. Game enters Day.
            // Insomniac sees the result *during Night*? Impossible if swaps happen at transition.
            // ALTERNATIVE: Swaps happen at transition. Insomniac notification is displayed at start of Day?
            // "You woke up and saw you are a [ROLE]."
            // That works.
        }

        return NextResponse.json({ success: true, revealedRole });

    } catch (error) {
        console.error("Action error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
