'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameRoom } from '@/types/game';
import { supabase } from '@/utils/supabaseClient';

// Define a type for a game room - this might come from src/types/game.ts or supabase.ts later
// interface GameRoom {  <-- Remove this local definition
//   id: string;
//   name: string;
//   currentPlayers: number;
//   maxPlayers: number;
//   status: string; // 'waiting', 'playing', 'finished' - consider using an enum or union type from game.ts
// }

interface GameRoomListProps {
  rooms: GameRoom[];
}

export default function GameRoomList({ rooms }: GameRoomListProps) {
  const router = useRouter();
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleJoinRoom = async (roomId: string) => {
    if (!supabase) {
      setErrorMessage('Supabase client is not available.');
      return;
    }
    setJoiningRoomId(roomId);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.rpc('join_game_room', { target_game_id: roomId });

      if (error) {
        console.error('Error calling join_game_room:', error);
        setErrorMessage(error.message || 'Failed to join room due to RPC error.');
        return;
      }

      if (data && data.success) {
        router.push(`/game/${data.game_id}`);
      } else {
        console.error('Failed to join room:', data?.message);
        setErrorMessage(data?.message || 'Failed to join room. Please try again.');
      }
    } catch (e: unknown) {
      console.error('Exception when trying to join room:', e);
      if (e instanceof Error) {
        setErrorMessage(e.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setJoiningRoomId(null);
    }
  };

  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-500">No game rooms available at the moment.</p>
        <p className="mt-2">Why not create one?</p>
        {errorMessage && <p className="mt-2 text-sm text-error">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {errorMessage && 
        <div role="alert" className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Error: {errorMessage}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setErrorMessage(null)}>Dismiss</button>
        </div>
      }
      <table className="table w-full">
        <thead>
          <tr>
            <th>Room Name</th>
            <th>Players</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id} className="hover">
              <td>
                <div className="font-bold">{room.name}</div>
              </td>
              <td>{room.current_players}/{room.max_players}</td>
              <td>
                <span 
                  className={`badge ${ 
                    room.status === 'waiting' ? 'badge-success' : 
                    room.status === 'playing' ? 'badge-warning' : 'badge-ghost'
                  }`}
                >
                  {room.status}
                </span>
              </td>
              <td>
                {room.status === 'waiting' && room.current_players < room.max_players ? (
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={joiningRoomId === room.id}
                  >
                    {joiningRoomId === room.id && <span className="loading loading-spinner loading-xs"></span>}
                    Join Room
                  </button>
                ) : room.status === 'playing' ? (
                  <button className="btn btn-sm btn-disabled">In Progress</button>
                ) : (
                  <button className="btn btn-sm btn-disabled">Full / Closed</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 