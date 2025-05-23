'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CreateGameRoomModal from "@/components/lobby/CreateGameRoomModal";
import GameRoomList from "@/components/lobby/GameRoomList";
import Link from "next/link";
import { supabase } from '@/utils/supabaseClient';
import { GameRoom } from '@/types/game';
// import { Database } from '@/types/supabase'; // Assuming you have this from Supabase CLI

// type GameRow = Database['public']['Tables']['games']['Row'];

interface FetchedGameData {
  id: string;
  name: string;
  status: 'waiting' | 'playing' | 'finished';
  max_players: number;
  created_at: string;
  players: { count: number }[] | { count: number }; // Adjust based on how Supabase returns count
}

export default function LobbyPage() {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGameRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Supabase client is not initialized. Check environment variables.");
      setLoading(false);
      return;
    }

    try {
      // Fetch games and count of players in each game
      // This assumes you have a way to count players, e.g., a 'players' table related to 'games'
      // Or a function in Supabase to get this count.
      // For simplicity, let's assume 'games' table has 'name', 'status', 'max_players', and 'id'
      // And we'll need to adjust how 'current_players' is obtained.
      // A common way is to have a view or a function in Supabase, or count on the client after fetching related players.

      // Option 1: Fetch games and then count players for each (less efficient for many rooms)
      // Option 2: Use a Supabase View or RPC that returns games with player counts.

      // Let's assume for now the 'games' table might get a 'current_players' count somehow,
      // or we might adjust this later. For the UI, we need it.
      // If your 'games' table from `supabase.ts` (Database type) has these fields, it's simpler.
      // Let's assume 'games' table includes 'name', 'status', 'max_players', 'id', 'created_at'
      // And we need a way to get 'current_players'.

      // For this example, I'll simulate a simplified fetch.
      // You'll need to replace this with your actual Supabase query.
      // This might involve a join if 'players' are in a separate table and linked to 'games'.
      // Or using an RPC function in Supabase: supabase.rpc('get_games_with_player_counts')

      const { data, error: fetchError } = await supabase
        .from('games')
        .select('id, name, status, max_players, created_at, players!players_game_id_fkey(count)') // Specify relationship
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error("Supabase fetch error:", fetchError);
        throw fetchError;
      }

      if (data) {
        // Transform data to match GameRoom type, especially for current_players
        const transformedRooms: GameRoom[] = data.map((game: FetchedGameData) => ({
          id: game.id,
          name: game.name,
          status: game.status,
          max_players: game.max_players,
          created_at: game.created_at,
          current_players: Array.isArray(game.players) && game.players.length > 0 ? game.players[0].count : ((typeof game.players === 'object' && game.players !== null && 'count' in game.players) ? (game.players as { count: number }).count : 0),
        }));
        setGameRooms(transformedRooms);
      }
    } catch (e: unknown) {
      console.error("Error fetching game rooms (outer catch):", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred while fetching game rooms.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGameRooms();
    
    if (!supabase) return; // Don't set up subscription if supabase is not available
    
    // Optional: Set up a real-time subscription to game room changes
    const channel = supabase
      .channel('lobby-games')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        (payload) => {
          console.log('Change received!', payload);
          // Refetch or update game rooms based on payload
          // This can be complex depending on how you want to handle inserts, updates, deletes
          fetchGameRooms(); // Simplest way is to refetch
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [fetchGameRooms]);

  // Callback for when a new room is created by the modal
  const handleRoomCreated = () => {
    fetchGameRooms(); // Refetch the list of game rooms
     // Also, ensure the modal closes itself upon successful creation
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <span className="loading loading-lg loading-spinner text-primary"></span>
        <p>Loading game rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-error">Error loading game rooms: {error}</p>
        <button onClick={fetchGameRooms} className="btn btn-primary mt-4">Try Again</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Game Lobby</h1>
        {/* Pass the callback to the modal */}
        <CreateGameRoomModal onRoomCreated={handleRoomCreated} />
      </div>

      <GameRoomList rooms={gameRooms} />

      <div className="mt-8 text-center">
        <Link href="/" className="btn btn-outline">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 