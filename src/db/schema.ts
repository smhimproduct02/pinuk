import { pgTable, serial, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
    id: uuid("id").defaultRandom().primaryKey(),
    shortId: text("short_id").notNull(), // Room Code
    status: text("status", { enum: ["waiting", "playing", "finished"] })
        .notNull()
        .default("waiting"),
    phase: text("phase", { enum: ["lobby", "night", "day", "ended"] })
        .default("lobby"),
    winner: text("winner", { enum: ["villager", "werewolf", "tanner"] }), // New Field
    phaseStartedAt: timestamp("phase_started_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const centerCards = pgTable("center_cards", {
    id: uuid("id").defaultRandom().primaryKey(),
    gameId: uuid("game_id")
        .references(() => games.id)
        .notNull(),
    role: text("role", { enum: ["villager", "werewolf", "seer", "robber", "troublemaker", "minion", "tanner", "drunk", "insomniac"] }),
    position: text("position").notNull(), // "center_1", "center_2", "center_3"
});

export const players = pgTable("players", {
    id: uuid("id").defaultRandom().primaryKey(),
    gameId: uuid("game_id")
        .references(() => games.id)
        .notNull(),
    name: text("name").notNull(),
    role: text("role", { enum: ["villager", "werewolf", "seer", "robber", "troublemaker", "minion", "tanner", "drunk", "insomniac"] }),
    initialRole: text("initial_role", { enum: ["villager", "werewolf", "seer", "robber", "troublemaker", "minion", "tanner", "drunk", "insomniac"] }), // Track original role
    isHost: boolean("is_host").default(false),
    isAlive: boolean("is_alive").default(true),
    actionTarget: text("action_target"), // Changed to text to be safe/flexible or keep uuid if we want. Let's keep uuid for target 1
    actionTargetSecondary: text("action_target_secondary"), // For Troublemaker (2nd target)
    joinedAt: timestamp("joined_at").defaultNow(),
});

export type Game = typeof games.$inferSelect;
export type Player = typeof players.$inferSelect;
