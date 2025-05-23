//Placeholder types based on plan.mdc - will be expanded and refined

export interface Card {
  suit: string; // e.g., 'spades', 'hearts', 'diamonds', 'clubs' or simply 'set1', 'set2' if suits are just for differentiation
  number: number; // 1-10
}

export type HandRank = 
  | "four-of-a-kind"
  | "full-house"
  | "straight"
  | "three-of-a-kind"
  | "two-pair"
  | "one-pair"
  | "high-card";

export interface DeclaredSnipe {
  hand_rank: HandRank;
  highest_card_number: number;
}

export interface ActualHandResult {
  hand_rank: HandRank;
  rank_determining_cards: number[]; // Cards that make the rank, e.g., [7] for four of a kind 7s, [7, 2] for full house 7s over 2s
  kickers: number[]; // Sorted high to low
  private_cards_for_tiebreak: [number, number]; // [high, low]
}

// Forward declaration for Player and Game, will be filled out more once Supabase types are available
export interface Player {
  id: string; // UUID
  user_id?: string; // UUID from auth.users, optional if player can be guest
  game_id: string; // UUID
  nickname: string;
  chips: number;
  private_cards?: Card[];
  turn_order?: number;
  is_survived?: boolean;
  current_round_bet?: number;
  is_folded?: boolean;
  declared_snipe?: DeclaredSnipe | null;
  actual_hand_result?: ActualHandResult | null;
  is_in_game?: boolean;
  last_game_action?: string | null; // 'bet', 'call', 'fold', 'raise', 'check'
}

export interface Game {
  id: string;
  name: string;
  status: 'waiting' | 'playing' | 'finished';
  max_players: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  betting_pot: number;
  shared_cards: Card[] | null;
  round_number: number;
  dealer_player_id: string | null;
  current_turn_player_id: string | null;
  last_bet_amount: number | null;
  game_phase: 'waiting' | 'first_betting' | 'second_betting' | 'sniping' | 'showdown' | 'finished' | null;
  phase_started_at: string | null;
  snipe_deadline: string | null;
  game_winner_player_id: string | null;
  side_pots?: Array<{
    amount: number;
    max_contribution: number;
    eligible_players: number;
  }> | null;
}

export interface GameRoom {
  id: string;
  name: string;
  current_players: number; // Field from Supabase (count of related players)
  max_players: number; // Assuming this will be a field in the 'games' table
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
}
