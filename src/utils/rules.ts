// src/utils/rules.ts

/**
 * Game-specific constants and rules.
 */

// Player and Chip Rules
export const INITIAL_CHIPS = 60; // Initial chips for each player
export const SURVIVAL_CHIP_GOAL = 75; // Number of chips required to be eligible for survival
export const SURVIVAL_CHIP_COST = 75; // Chips paid by a player to confirm survival
export const BASE_BET_AMOUNT = 1; // Base bet amount at the start of each betting round (antes)

// Game Structure Rules
export const DEFAULT_MAX_PLAYERS = 6; // Default maximum number of players in a game room
export const MIN_PLAYERS_TO_START = 2; // Minimum number of players required to start a game

// Card Dealing Rules
export const PRIVATE_CARDS_COUNT = 2;    // Number of private cards dealt to each player
export const SHARED_CARDS_DEAL_1_COUNT = 2; // Number of shared cards revealed in the first community card deal
export const SHARED_CARDS_DEAL_2_COUNT = 2; // Number of shared cards revealed in the second community card deal
export const TOTAL_SHARED_CARDS_COUNT = SHARED_CARDS_DEAL_1_COUNT + SHARED_CARDS_DEAL_2_COUNT; // Total community cards

// Hand Ranks (Order from highest to lowest is important for evaluation)
// This can also be an enum or a more structured object if needed elsewhere for logic.
export const HAND_RANKS_ORDER = [
  "four-of-a-kind",
  "full-house",
  "straight",
  "three-of-a-kind", // Referred to as Triple in plan.mdc
  "two-pair",
  "one-pair",
  "high-card",
] as const; // `as const` makes it a readonly tuple with literal types

// You can add more game-specific rules or constants here as needed.
// For example, betting limits, minimum raise amounts, etc.

// Example: Minimum raise could be defined relative to the last bet or a fixed value.
// export const MINIMUM_RAISE_AMOUNT = 1; // Or make it dynamic based on game state 