'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
// import { Database } from '@/types/supabase'; // Assuming you have this

// type GameInsert = Database['public']['Tables']['games']['Insert'];

interface CreateGameRoomModalProps {
  onRoomCreated: () => void;
}

export default function CreateGameRoomModal({ onRoomCreated }: CreateGameRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6); // Default max players
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null); 

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(null);

    if (!roomName.trim()) {
      setError('Room name cannot be empty.');
      setLoading(false);
      return;
    }

    if (!supabase) {
      setError('Supabase client is not available. Check configuration.');
      setLoading(false);
      return;
    }

    try {
      // const newGame: GameInsert = {
      //   name: roomName,
      //   max_players: maxPlayers,
      //   status: 'waiting',
      //   // created_at will be set by default by Supabase
      //   // current_players will be 0 initially or handled by a trigger/view
      // };
      
      // Call the RPC function to create game and add creator
      const { data, error: rpcError } = await supabase
        .rpc('create_game_room_and_add_creator', {
          room_name: roomName,
          max_players_count: maxPlayers
        });

      if (rpcError) {
        throw rpcError;
      }

      // 'data' will now contain the new_game_id returned by the function.
      if (data) {
        console.log('Room created with ID:', data); // data is the new_game_id
        setMessage('Room created successfully!');
        setRoomName(''); // Clear room name
        // Max players can be reset or kept as is for next creation
        onRoomCreated(); // Call the callback to refresh the lobby list
        
        // Close the modal
        const modal = document.getElementById('create_room_modal') as HTMLDialogElement;
        if (modal) {
          modal.close();
        }
      }
    } catch (e: unknown) {
      console.error('Error creating game room:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred while creating the room.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button to trigger the modal */}
      <button 
        className="btn btn-primary"
        onClick={() => {
          setMessage(''); // Clear previous messages
          setError('');   // Clear previous errors
          const modal = document.getElementById('create_room_modal') as HTMLDialogElement;
          if (modal) {
            modal.showModal();
          }
        }}
      >
        Create Game Room
      </button>

      {/* Modal structure using DaisyUI dialog */}
      <dialog id="create_room_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Create New Game Room</h3>
          <form onSubmit={handleCreateRoom}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Room Name</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter room name" 
                className="input input-bordered w-full" 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Max Players</span>
              </label>
              <select 
                className="select select-bordered w-full"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))}
              >
                <option value={2}>2</option> {/* Simpler display */} 
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
              </select>
            </div>

            {message && <p className="mt-4 text-sm text-success">{message}</p>}
            {error && <p className="mt-4 text-sm text-error">{error}</p>}

            <div className="modal-action mt-6">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading && <span className="loading loading-spinner"></span>}
                Create Room
              </button>
              <button type="button" className="btn" onClick={() => {
                 const modal = document.getElementById('create_room_modal') as HTMLDialogElement;
                 if (modal) {
                    modal.close();
                 }
              }}>Close</button>
            </div>
          </form>
        </div>
        {/* Closes the modal when clicking outside */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
} 