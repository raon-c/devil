'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { Game, Player, Card, HandRank } from '@/types/game';
import { Card as CardComponent } from '@/components/game/Card';
import { SnipeModal } from '@/components/game/SnipeModal';
import { RoundResultsModal } from '@/components/game/RoundResultsModal';
import { SurvivalModal } from '@/components/game/SurvivalModal';
import { GameRulesModal } from '@/components/game/GameRulesModal';
import { GameLog, GameEvent, gameEventTemplates } from '@/components/game/GameLog';
import { GameEndModal } from '@/components/game/GameEndModal';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import { ErrorAlert } from '@/components/layout/ErrorAlert';
import { calculateBettingLimit } from '@/utils/rules';
import { SnipeResultsModal } from '@/components/game/SnipeResultsModal';
import { SnipeStatus } from '@/components/game/SnipeStatus';

const PlayerDisplay = ({ player, isCurrentUser, isCurrentTurn, game }: { 
  player: Player; 
  isCurrentUser: boolean;
  isCurrentTurn: boolean;
  game: Game;
}) => (
  <div className={`
    border-2 p-3 m-2 rounded-xl shadow-lg transition-all duration-300
    ${isCurrentUser 
      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500' 
      : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
    }
    ${isCurrentTurn ? 'ring-4 ring-yellow-400 ring-opacity-75 border-yellow-500' : ''}
    ${player.is_folded ? 'opacity-60 grayscale' : ''}
  `}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
          {player.nickname}
          {isCurrentUser && <span className="text-blue-600 dark:text-blue-400 ml-1">(나)</span>}
        </h3>
        {isCurrentTurn && (
          <div className="badge badge-warning badge-sm">
            차례
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {player.is_survived && (
          <div className="badge badge-success badge-sm">생존확정</div>
        )}
        {player.is_folded && (
          <div className="badge badge-error badge-sm">폴드</div>
        )}
        {player.chips === 0 && !player.is_folded && player.is_in_game && (
          <div className="badge badge-warning badge-sm">올인</div>
        )}
        {player.chips > 0 && player.current_round_bet && player.current_round_bet >= player.chips && (
          <div className="badge badge-warning badge-sm">올인</div>
        )}
        {game.dealer_player_id === player.id && (
          <div className="badge badge-info badge-sm">딜러</div>
        )}
      </div>
    </div>
    
    <div className="mb-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">보유 칩</p>
      <p className="text-xl font-bold text-green-600 dark:text-green-400">{player.chips}개</p>
      {player.current_round_bet && player.current_round_bet > 0 && (
        <p className="text-sm text-blue-600 dark:text-blue-400">이번 라운드 베팅: {player.current_round_bet}개</p>
      )}
    </div>
    
    {/* 카드 표시 - 수정된 로직 */}
    {player.private_cards && player.private_cards.length > 0 && (
      <div className="mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">개인 카드</p>
        <div className="flex space-x-2">
          {player.private_cards.map((card, index) => (
            <CardComponent
              key={index}
              card={card}
              isRevealed={isCurrentUser || game.game_phase === 'showdown'}
              size="sm"
            />
          ))}
        </div>
        {!isCurrentUser && game.game_phase !== 'showdown' && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            🃏 상대방의 카드 (뒷면)
          </p>
        )}
      </div>
    )}

    {/* 저격 선언 정보 */}
    {player.declared_snipe && (
      <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
        <p className="text-xs text-orange-800 dark:text-orange-200">
          저격 선언: {player.declared_snipe.hand_rank} ({player.declared_snipe.highest_card_number})
        </p>
      </div>
    )}

    {/* 마지막 액션 */}
    {player.last_game_action && (
      <div className="mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          마지막 액션: {player.last_game_action}
        </span>
      </div>
    )}
  </div>
);

const SharedCardsDisplay = ({ cards, gamePhase }: { cards: Card[] | null | undefined; gamePhase: string }) => (
  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 my-4 rounded-xl bg-green-50 dark:bg-green-900/20 min-h-[120px]">
    <h3 className="font-bold mb-4 text-center text-lg text-gray-700 dark:text-gray-300">
      공유 카드 (2장)
    </h3>
    {gamePhase === 'first_betting' ? (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="flex justify-center space-x-3 mb-3">
            <div className="w-16 h-20 bg-blue-900 rounded-lg border-2 border-blue-700 flex items-center justify-center">
              <span className="text-white text-2xl">🃏</span>
            </div>
            <div className="w-16 h-20 bg-blue-900 rounded-lg border-2 border-blue-700 flex items-center justify-center">
              <span className="text-white text-2xl">🃏</span>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            1차 베팅 완료 후 공개됩니다
          </p>
        </div>
      </div>
    ) : cards && cards.length > 0 ? (
      <div className="flex justify-center items-center space-x-3">
        {cards.map((card, index) => (
          <CardComponent
            key={index}
            card={card}
            isRevealed={true}
            size="lg"
            className="hover:scale-105 transition-transform"
          />
        ))}
      </div>
    ) : (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          아직 공유 카드가 공개되지 않았습니다.
        </p>
      </div>
    )}
    <div className="mt-2 text-center">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        💡 저격 홀덤: 개인 카드 2장 + 공유 카드 2장 = 총 4장으로 족보 완성
      </p>
    </div>
  </div>
);

const PotDisplay = ({ pot, sidePots }: { pot: number; sidePots?: Array<{amount: number; max_contribution: number; eligible_players: number}> }) => (
  <div className="my-4 text-center">
    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
      메인 팟: {pot} chips
    </h3>
    {sidePots && sidePots.length > 0 && (
      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-600">
        <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">사이드 팟</h4>
        <div className="space-y-2">
          {sidePots.map((sidePot, index) => (
            <div key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
              사이드 팟 {index + 1}: {sidePot.amount}칩 (최대 기여: {sidePot.max_contribution}칩, 참여자: {sidePot.eligible_players}명)
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const BettingControls = ({ onCall, onRaise, onFold, onCheck, onAllIn, canCheck, currentBet, playerChips, bettingLimit }: { 
  onCall: () => void; 
  onRaise: (amount: number) => void; 
  onFold: () => void; 
  onCheck: () => void;
  onAllIn: () => void;
  canCheck: boolean;
  currentBet: number;
  playerChips: number;
  bettingLimit: number;
}) => {
  const [raiseAmount, setRaiseAmount] = useState(currentBet * 2 || 10);

  const handleRaise = () => {
    if (raiseAmount > playerChips) {
      alert("보유 칩보다 많이 베팅할 수 없습니다.");
      return;
    }
    if (raiseAmount > bettingLimit) {
      alert(`베팅 한도(${bettingLimit}칩)를 초과할 수 없습니다.`);
      return;
    }
    if (raiseAmount <= currentBet && currentBet > 0) {
      alert("레이즈 금액은 현재 베팅액보다 커야 합니다.");
      return;
    }
    onRaise(raiseAmount);
  };

  const effectiveMaxBet = Math.min(playerChips, bettingLimit);
  const canAllIn = playerChips > 0;

  return (
    <div className="space-y-4 my-4 p-4 border-2 border-blue-200 dark:border-blue-700 rounded-xl shadow-lg bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200">베팅 액션</h3>
      
      {/* 기본 액션 버튼들 */}
      <div className="grid grid-cols-2 gap-3">
        {canCheck && (
          <button 
            onClick={onCheck} 
            className="btn btn-outline btn-info col-span-2 text-lg"
          >
            체크
          </button>
        )}
        <button 
          onClick={onCall} 
          className="btn btn-primary" 
          disabled={currentBet === 0}
        >
          {currentBet > 0 ? `콜 (${currentBet}칩)` : '콜'}
        </button>
        <button 
          onClick={onFold} 
          className="btn btn-error"
        >
          폴드
        </button>
      </div>

      {/* 올인 버튼 */}
      {canAllIn && (
        <button 
          onClick={onAllIn} 
          className="btn btn-warning btn-block btn-lg"
        >
          🎲 올인 ({playerChips}칩)
        </button>
      )}
      
      {/* 레이즈 섹션 */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <label className="label">
          <span className="label-text font-semibold text-gray-700 dark:text-gray-300">레이즈 금액</span>
        </label>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            placeholder="레이즈 금액" 
            className="input input-bordered flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(parseInt(e.target.value, 10) || 0)}
            min={currentBet > 0 ? currentBet + 1 : 1}
            max={effectiveMaxBet}
          />
          <button 
            onClick={handleRaise} 
            className="btn btn-accent min-w-[80px]"
          >
            레이즈
          </button>
        </div>
        
        {/* 베팅 정보 */}
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <p><span className="font-semibold">보유 칩:</span> {playerChips}개</p>
            <p><span className="font-semibold">현재 콜 금액:</span> {currentBet}개</p>
            <p><span className="font-semibold">베팅 한도:</span> {bettingLimit}개</p>
            <p><span className="font-semibold">최대 베팅:</span> {effectiveMaxBet}개</p>
            {currentBet > 0 && (
              <p><span className="font-semibold">최소 레이즈:</span> {currentBet + 1}개</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserPlayer, setCurrentUserPlayer] = useState<Player | null>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);
  
  // Modal states
  const [showSnipeModal, setShowSnipeModal] = useState(false);
  const [showSnipeResultsModal, setShowSnipeResultsModal] = useState(false);
  const [showRoundResultsModal, setShowRoundResultsModal] = useState(false);
  const [showSurvivalModal, setShowSurvivalModal] = useState(false);
  const [showGameRulesModal, setShowGameRulesModal] = useState(false);
  const [showGameLog, setShowGameLog] = useState(false);
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  
  // Game events for logging
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  
  // 저격 결과 데이터
  const [snipeResults, setSnipeResults] = useState<Array<{
    sniper_id: string;
    sniper_name: string;
    declared_rank: string;
    declared_card: number;
    success: boolean;
  }>>([]);
  
  // Mock round result data (in real implementation, this would come from backend)
  const [roundResult, setRoundResult] = useState<{
    winner: Player;
    winningHand: HandRank;
    chipsWon: number;
    finalCards: Array<{
      player: Player;
      handRank: HandRank;
      handDescription: string;
    }>;
    snipeResults: Array<{
      sniper: Player;
      target: Player;
      declaredRank: HandRank;
      declaredHighCard: number;
      actualRank: HandRank;
      success: boolean;
    }>;
  } | null>(null);

  // Mock game end data (in real implementation, this would come from backend)
  const [gameEndData, setGameEndData] = useState<{
    winners: Player[];
    eliminatedPlayers: Player[];
    gameStats: {
      totalRounds: number;
      totalGameTime: string;
      finalPot: number;
    };
  } | null>(null);

  const fetchGameData = useCallback(async () => {
    if (!gameId || !supabase) {
      setError('Game ID or Supabase client is not available.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error("Error fetching game:", gameError);
        throw gameError;
      }
      if (!gameData) throw new Error('Game not found.');
      setGame(gameData as Game);

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('turn_order', { ascending: true });

      if (playersError) {
        console.error("Error fetching players:", playersError);
        throw playersError;
      }
      setPlayers(playersData as Player[]);

      const { data: { user } } = await supabase.auth.getUser();
      if (user && playersData) {
        const currentPlayer = playersData.find(p => p.user_id === user.id);
        setCurrentUserPlayer(currentPlayer || null);
        if (!currentPlayer) {
          console.warn('Current user is not a player in this game.');
        }
      }

    } catch (e: unknown) {
      console.error('Error fetching game data (outer catch):', e);
      if (e instanceof Error) setError(e.message);
      else setError('An unknown error occurred while fetching game data.');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  useEffect(() => {
    if (!gameId || !supabase) return;

    // console.log(`[REALTIME] Setting up subscriptions for game: ${gameId}`);

    // Game channel with more robust subscription handling
    const gameChannel = supabase
      .channel(`game-${gameId}`, {
        config: {
          broadcast: { self: false }
        }
      })
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'games', 
          filter: `id=eq.${gameId}` 
        },
        (payload) => {
          // console.log('[REALTIME] Game update received:', payload);
          // console.log('[REALTIME] Event type:', payload.eventType);
          // console.log('[REALTIME] Old data:', payload.old);
          // console.log('[REALTIME] New data:', payload.new);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            setGame(prevGame => {
              // console.log('[REALTIME] Updating game state from:', prevGame, 'to:', payload.new);
              const updatedGame = { ...prevGame, ...payload.new } as Game;
              // console.log('[REALTIME] Final updated game:', updatedGame);
              return updatedGame;
            });
          } else if (payload.eventType === 'INSERT' && payload.new) {
            // console.log('[REALTIME] Setting new game state:', payload.new);
            setGame(payload.new as Game);
          } else if (payload.eventType === 'DELETE') {
            // console.log('[REALTIME] Game deleted, redirecting to lobby');
            setError('The game has been deleted. Redirecting to lobby...');
            setTimeout(() => router.push('/lobby'), 3000);
          }
        }
      )
      .subscribe((status, err) => {
        // console.log(`[REALTIME] Game channel subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          // console.log(`✅ Successfully subscribed to game channel: game-${gameId}`);
        }
        if (err) {
          // console.error(`❌ Error subscribing to game channel: game-${gameId}`, err);
        }
      });

    // Players channel with more robust subscription handling
    const playerChannel = supabase
      .channel(`game-players-${gameId}`, {
        config: {
          broadcast: { self: false }
        }
      })
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'players', 
          filter: `game_id=eq.${gameId}` 
        },
        (payload) => {
          // console.log('[REALTIME] Players update received:', payload);
          // console.log('[REALTIME] Event type:', payload.eventType);
          // console.log('[REALTIME] Old data:', payload.old);
          // console.log('[REALTIME] New data:', payload.new);

          if (payload.eventType === 'INSERT' && payload.new) {
            setPlayers(prevPlayers => {
              // console.log('[REALTIME] Adding new player. Previous players:', prevPlayers);
              const newPlayers = [...prevPlayers, payload.new as Player];
              // console.log('[REALTIME] Updated players list:', newPlayers);
              return newPlayers;
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setPlayers(prevPlayers => {
              // console.log('[REALTIME] Updating player. Previous players:', prevPlayers);
              const updatedPlayers = prevPlayers.map(p => 
                p.id === (payload.new as Player).id ? { ...p, ...payload.new } as Player : p
              );
              // console.log('[REALTIME] Updated players list:', updatedPlayers);
              
              // Also update currentUserPlayer if it's the one being updated
              if (currentUserPlayer && currentUserPlayer.id === (payload.new as Player).id) {
                setCurrentUserPlayer(prev => ({ ...prev, ...payload.new } as Player));
              }
              
              return updatedPlayers;
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setPlayers(prevPlayers => {
              // console.log('[REALTIME] Removing player. Previous players:', prevPlayers);
              const filteredPlayers = prevPlayers.filter(p => p.id !== (payload.old as {id: string}).id);
              // console.log('[REALTIME] Updated players list:', filteredPlayers);
              return filteredPlayers;
            });
          }
        }
      )
      .subscribe((status, err) => {
        // console.log(`[REALTIME] Players channel subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          // console.log(`✅ Successfully subscribed to players channel: game-players-${gameId}`);
        }
        if (err) {
          // console.error(`❌ Error subscribing to players channel: game-players-${gameId}`, err);
        }
      });

    // Cleanup function
    return () => {
      // console.log(`[REALTIME] Cleaning up subscriptions for game: ${gameId}`);
      if (supabase) {
        supabase.removeChannel(gameChannel);
        supabase.removeChannel(playerChannel);
        // console.log(`[REALTIME] Channels removed for game: ${gameId}`);
      }
    };
  }, [gameId, router]);

  const handleStartGame = async () => {
    if (!supabase || !gameId || !currentUserPlayer) {
      alert("Cannot start game: missing game, player, or Supabase client.");
      return;
    }
    if (currentUserPlayer.turn_order !== 0) { 
      alert("Only the host can start the game.");
      return;
    }
    if (players.length < 2) {
        alert("Not enough players to start the game. Minimum 2 players required.");
        return;
    }

    setIsStartingGame(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('start_game', { p_game_id: gameId });

      if (rpcError) {
        throw rpcError;
      }

      if (data && data.success) {
        console.log("Game start initiated:", data.message);
        
        // 게임 시작 성공 후 즉시 데이터 새로고침
        await fetchGameData();
        
        // 성공 알림
        const startEvent = gameEventTemplates.gameStart(players.filter(p => p.is_in_game).length);
        setGameEvents(prev => [...prev, startEvent]);
      } else {
        setError(data?.message || 'Failed to start game.');
      }
    } catch (e: unknown) {
      console.error('Error starting game (outer catch):', e);
      if (e instanceof Error) setError(e.message);
      else setError('An unknown error occurred while starting the game.');
    } finally {
      setIsStartingGame(false);
    }
  };

  const handlePlayerAction = async (actionType: string, amount?: number) => {
    if (!supabase || !gameId || !currentUserPlayer) {
      alert("Cannot perform action: missing game, player, or Supabase client.");
      return;
    }
    
    setError(null);
    try {
      // console.log(`Attempting action: ${actionType}, amount: ${amount}`);
      
      // Call RPC function for player action with all-in handling
      const { data, error: rpcError } = await supabase.rpc('player_action_with_all_in', {
        p_game_id: gameId,
        p_player_id: currentUserPlayer.id,
        p_action: actionType,
        p_amount: amount || 0
      });

      if (rpcError) {
        throw rpcError;
      }

      if (data && data.success) {
        console.log("Player action successful:", data.message);
        
        // 올인 액션인 경우 특별한 이벤트 로그
        if (data.all_in) {
          const allInEvent = gameEventTemplates.playerAction(
            currentUserPlayer.nickname, 
            `올인 (${amount}칩)`,
            amount
          );
          setGameEvents(prev => [...prev, allInEvent]);
        } else {
          // 일반 액션 이벤트 로그
          const event = gameEventTemplates.playerAction(
            currentUserPlayer.nickname, 
            actionType, 
            amount
          );
          setGameEvents(prev => [...prev, event]);
        }
        
        // 올인 상황 자동 진행 처리
        if (data.all_in_check && data.all_in_check.auto_progressed) {
          console.log("Auto-progression triggered:", data.all_in_check.message);
          
          const progressEvent = gameEventTemplates.roundStart(0);
          setGameEvents(prev => [...prev, {
            ...progressEvent,
            type: 'round_start',
            message: data.all_in_check.message
          }]);
          
          // 저격 단계로 진행된 경우 UI 업데이트
          if (data.all_in_check.next_phase === 'sniping') {
            const snipeStartEvent = gameEventTemplates.roundStart(0);
            setGameEvents(prev => [...prev, {
              ...snipeStartEvent,
              type: 'round_start',
              message: '저격 페이즈가 시작되었습니다!'
            }]);
          }
        }
      } else {
        setError(data?.message || `Failed to perform ${actionType}.`);
      }
    } catch (e: unknown) {
      console.error('Error performing player action:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(`An unknown error occurred while performing ${actionType}.`);
      }
    }
  };

  // Debug function to test Realtime updates
  const handleTestRealtimeUpdate = async () => {
    if (!supabase || !gameId) {
      alert("Cannot test: missing gameId or Supabase client.");
      return;
    }
    
    try {
      // console.log("[DEBUG] Triggering test Realtime update...");
      const { error } = await supabase
        .from('games')
        .update({ 
          betting_pot: (game?.betting_pot || 0) + 1,
          round_number: game?.round_number || 1
        })
        .eq('id', gameId)
        .select();
      
      if (error) throw error;
      // console.log("[DEBUG] Test update completed:", data);
      alert("Test update sent! Check console for Realtime events.");
    } catch {
      // console.error("[DEBUG] Test update failed:", error);
      alert("Test update failed - check console.");
    }
  };

  const handleCheck = () => handlePlayerAction('check');
  const handleCall = () => handlePlayerAction('call', game?.last_bet_amount || 0);
  const handleRaise = (amount: number) => handlePlayerAction('raise', amount);
  const handleFold = () => handlePlayerAction('fold');
  const handleAllIn = () => {
    if (currentUserPlayer) {
      handlePlayerAction('raise', currentUserPlayer.chips + (currentUserPlayer.current_round_bet || 0));
    }
  };
  
  // Modal handlers
  const handleSnipe = async (handRank: HandRank, highestCard: number) => {
    if (!currentUserPlayer || !supabase) return;
    
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('declare_snipe_with_auto_check', {
        p_game_id: gameId,
        p_player_id: currentUserPlayer.id,
        p_hand_rank: handRank,
        p_highest_card: highestCard
      });

      if (rpcError) {
        throw rpcError;
      }

      if (data && data.success) {
        console.log("Snipe declared successfully:", data.message);
        const event = gameEventTemplates.snipeDeclare(
          currentUserPlayer.nickname, 
          `${handRank} ${highestCard}`,
          handRank, 
          highestCard
        );
        setGameEvents(prev => [...prev, event]);
        setShowSnipeModal(false);
        
        // 자동 완료 체크 결과 처리
        if (data.auto_check_result && data.auto_check_result.completed) {
          console.log("Snipe phase completed automatically!");
          
          // 저격 결과 표시
          if (data.auto_check_result.snipe_results && data.auto_check_result.snipe_results.results) {
            setSnipeResults(data.auto_check_result.snipe_results.results);
            setShowSnipeResultsModal(true);
          }
          
          // 완료 이벤트 로그
          const completeEvent = gameEventTemplates.roundStart(0);
          setGameEvents(prev => [...prev, {
            ...completeEvent,
            type: 'round_start',
            message: '저격 페이즈가 완료되었습니다. 카드 공개!'
          }]);
        }
      } else {
        setError(data?.message || '저격 선언에 실패했습니다.');
      }
    } catch (e: unknown) {
      console.error('Error declaring snipe:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('저격 선언 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handleSnipePass = async () => {
    if (!currentUserPlayer || !supabase) return;
    
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('pass_snipe_with_auto_check', {
        p_game_id: gameId,
        p_player_id: currentUserPlayer.id
      });

      if (rpcError) {
        throw rpcError;
      }

      if (data && data.success) {
        console.log("Snipe passed successfully:", data.message);
        const event = gameEventTemplates.playerAction(currentUserPlayer.nickname, '저격 패스');
        setGameEvents(prev => [...prev, event]);
        
        // 자동 완료 체크 결과 처리
        if (data.auto_check_result && data.auto_check_result.completed) {
          console.log("Snipe phase completed automatically after pass!");
          
          // 저격 결과 표시
          if (data.auto_check_result.snipe_results && data.auto_check_result.snipe_results.results) {
            setSnipeResults(data.auto_check_result.snipe_results.results);
            setShowSnipeResultsModal(true);
          }
          
          // 완료 이벤트 로그
          const completeEvent = gameEventTemplates.roundStart(0);
          setGameEvents(prev => [...prev, {
            ...completeEvent,
            type: 'round_start',
            message: '저격 페이즈가 완료되었습니다. 카드 공개!'
          }]);
        }
      } else {
        setError(data?.message || '저격 패스에 실패했습니다.');
      }
    } catch (e: unknown) {
      console.error('Error passing snipe:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('저격 패스 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handleSurvive = async (chipDistribution: Record<string, number>) => {
    if (!currentUserPlayer || !supabase) return;
    
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('confirm_survival', {
        p_game_id: gameId,
        p_player_id: currentUserPlayer.id,
        p_chip_distribution: chipDistribution
      });

      if (rpcError) {
        throw rpcError;
      }

      if (data && data.success) {
        console.log("Survival confirmed successfully:", data.message);
        const event = gameEventTemplates.playerSurvive(currentUserPlayer.nickname);
        setGameEvents(prev => [...prev, event]);
        setShowSurvivalModal(false);
      } else {
        setError(data?.message || '생존 확정에 실패했습니다.');
      }
    } catch (e: unknown) {
      console.error('Error confirming survival:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('생존 확정 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handleRoundResultsNext = () => {
    console.log('Moving to next round');
    const event = gameEventTemplates.roundStart((game?.round_number || 0) + 1);
    setGameEvents(prev => [...prev, event]);
  };

  // Mock round result for testing
  const createMockRoundResult = () => {
    if (!currentUserPlayer || players.length === 0) return;
    
    setRoundResult({
      winner: currentUserPlayer,
      winningHand: 'straight',
      chipsWon: 25,
      finalCards: players.filter(p => p.is_in_game).map(player => ({
        player,
        handRank: 'one-pair' as HandRank,
        handDescription: '킹 원페어'
      })),
      snipeResults: []
    });
  };

  // Mock game end for testing
  const createMockGameEnd = () => {
    if (!currentUserPlayer || players.length === 0) return;
    
    const activePlayers = players.filter(p => p.is_in_game === true);
    const mockWinners = [currentUserPlayer];
    const mockEliminated = activePlayers.filter(p => p.id !== currentUserPlayer.id);
    
    setGameEndData({
      winners: mockWinners,
      eliminatedPlayers: mockEliminated,
      gameStats: {
        totalRounds: game?.round_number || 5,
        totalGameTime: '15분 30초',
        finalPot: game?.betting_pot || 50
      }
    });
  };

  const handleGameEnd = () => {
    if (!gameEndData) return;
    console.log('Game ended:', gameEndData);
    const event = gameEventTemplates.gameStart(0); // Custom game end event
    setGameEvents(prev => [...prev, {
      ...event,
      type: 'game_start',
      message: `게임이 종료되었습니다. 승자: ${gameEndData.winners.map(w => w.nickname).join(', ')}`
    }]);
  };

  const handleReturnToLobby = () => {
    router.push('/lobby');
  };

  // Initialize game events when game starts
  useEffect(() => {
    if (game?.status === 'playing' && gameEvents.length === 0) {
      const startEvent = gameEventTemplates.gameStart(players.filter(p => p.is_in_game).length);
      setGameEvents([startEvent]);
    }
  }, [game?.status, players, gameEvents.length]);

  // Add new function to handle round ending
  const handleEndRound = async () => {
    if (!supabase || !gameId) return;
    
    setError(null);
    try {
      console.log('Ending round...');
      
      const { data, error: rpcError } = await supabase.rpc('end_round', {
        p_game_id: gameId
      });

      if (rpcError) {
        throw rpcError;
      }

      if (data && data.success) {
        console.log("Round ended successfully:", data.message);
        
        if (data.game_ended) {
          // Game has ended, show game end modal
          const winner = data.winner_id ? players.find(p => p.id === data.winner_id) : undefined;
          const gameEndData = {
            winners: winner ? [winner] : [],
            eliminatedPlayers: players.filter(p => p.id !== data.winner_id),
            gameStats: {
              totalRounds: game?.round_number || 0,
              totalGameTime: '게임 완료',
              finalPot: (data.final_pot as number) || 0
            }
          };
          setGameEndData(gameEndData);
          setShowGameEndModal(true);
        } else {
          // Round ended, continue to next round
          const event = gameEventTemplates.roundStart((game?.round_number || 0) + 1);
          setGameEvents(prev => [...prev, event]);
        }
      } else {
        setError(data?.message || '라운드 종료에 실패했습니다.');
      }
    } catch (e: unknown) {
      console.error('Error ending round:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('라운드 종료 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  // Add new function to handle starting snipe phase
  const handleStartSnipePhase = async () => {
    if (!supabase || !gameId) return;
    
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('start_snipe_phase', {
        p_game_id: gameId
      });

      if (rpcError) {
        throw rpcError;
      }

      if (data && data.success) {
        console.log("Snipe phase started successfully:", data.message);
        const event = gameEventTemplates.roundStart(0); // Custom event for snipe phase start
        setGameEvents(prev => [...prev, {
          ...event,
          type: 'round_start',
          message: '저격 페이즈가 시작되었습니다.'
        }]);
      } else {
        setError(data?.message || '저격 페이즈 시작에 실패했습니다.');
      }
    } catch (e: unknown) {
      console.error('Error starting snipe phase:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('저격 페이즈 시작 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  // Add function to handle showdown and next round
  const handleShowdownAndNextRound = async () => {
    if (!supabase || !gameId) return;
    
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('complete_round_showdown', {
        p_game_id: gameId
      });

      if (rpcError) {
        throw rpcError;
      }

      if (data && data.success) {
        console.log("Showdown processed successfully:", data);
        
        if (data.game_ended) {
          // 게임 종료 - 최종 승자 결정
          const winner = data.winner_id ? players.find(p => p.id === data.winner_id) : null;
          const gameEndData = {
            winners: winner ? [winner] : [],
            eliminatedPlayers: players.filter(p => p.id !== data.winner_id && p.is_in_game),
            gameStats: {
              totalRounds: game?.round_number || 0,
              totalGameTime: '게임 완료',
              finalPot: data.final_pot || 0
            }
          };
          setGameEndData(gameEndData);
          setShowGameEndModal(true);
          
          // 최종 승리 이벤트 로그
          const finalWinEvent = gameEventTemplates.roundEnd(data.winner_name || '알 수 없음', data.final_pot || 0);
          setGameEvents(prev => [...prev, {
            ...finalWinEvent,
            type: 'game_start',
            message: `🎉 ${data.winner_name}님이 게임에서 최종 승리했습니다!`
          }]);
          
          // showdown 결과 로그
          if (data.showdown_results) {
            data.showdown_results.forEach((result: {
              player_name: string;
              hand_result: { hand_rank: string };
              chips_after: number;
            }) => {
              const handEvent = gameEventTemplates.playerAction(
                result.player_name,
                `${result.hand_result.hand_rank} 완성`,
                0
              );
              setGameEvents(prev => [...prev, handEvent]);
            });
          }
        } else {
          // 라운드 완료 - 다음 라운드 시작
          const roundWinEvent = gameEventTemplates.roundEnd(data.round_winner_name || '알 수 없음', data.pot_won || 0);
          setGameEvents(prev => [...prev, roundWinEvent]);
          
          // showdown 결과 로그
          if (data.showdown_results) {
            data.showdown_results.forEach((result: {
              player_name: string;
              hand_result: { hand_rank: string };
              chips_after: number;
            }) => {
              const handEvent = gameEventTemplates.playerAction(
                result.player_name,
                `${result.hand_result.hand_rank} 완성`,
                0
              );
              setGameEvents(prev => [...prev, handEvent]);
            });
          }
          
          // 저격 결과 로그
          if (data.round_results) {
            data.round_results.forEach((result: {
              player_name: string;
              snipe_declared?: { hand_rank: string; highest_card_number: number };
              snipe_success?: boolean;
            }) => {
              if (result.snipe_declared) {
                const snipeResultEvent = gameEventTemplates.snipeDeclare(
                  result.player_name,
                  result.snipe_success ? '저격 성공! (+5칩)' : '저격 실패 (-3칩)',
                  result.snipe_declared.hand_rank as HandRank,
                  result.snipe_declared.highest_card_number
                );
                setGameEvents(prev => [...prev, snipeResultEvent]);
              }
            });
          }
          
          // 제거된 플레이어 로그
          if (data.eliminated_count > 0) {
            const eliminationEvent = gameEventTemplates.playerAction(
              'System',
              `${data.eliminated_count}명의 플레이어가 파산으로 제거되었습니다.`,
              0
            );
            setGameEvents(prev => [...prev, eliminationEvent]);
          }
          
          // 다음 라운드 시작 이벤트
          const nextRoundEvent = gameEventTemplates.roundStart(data.next_round || (game?.round_number || 0) + 1);
          setGameEvents(prev => [...prev, nextRoundEvent]);
        }
      } else {
        setError(data?.message || 'showdown 처리에 실패했습니다.');
      }
    } catch (e: unknown) {
      console.error('Error processing showdown:', e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('showdown 처리 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return (
    <div className="container mx-auto p-4 text-center">
      <LoadingSpinner message="게임 데이터를 불러오는 중..." size="lg" />
    </div>
  );
  
  if (error && !game) return (
    <div className="container mx-auto p-4 text-center">
      <ErrorAlert 
        message={error} 
        onDismiss={() => router.push('/lobby')}
        className="max-w-lg mx-auto"
      />
      <button onClick={() => router.push('/lobby')} className="btn btn-primary mt-4">
        Back to Lobby
      </button>
    </div>
  );
  
  if (!game) return (
    <div className="container mx-auto p-4 text-center">
      <ErrorAlert 
        message="Game not found or you might not be part of it." 
        type="warning"
        className="max-w-lg mx-auto"
      />
      <button onClick={() => router.push('/lobby')} className="btn btn-primary mt-4">
        Back to Lobby
      </button>
    </div>
  );

  const isMyTurn = currentUserPlayer && game.current_turn_player_id === currentUserPlayer.id;
  const canCheck = (game.last_bet_amount || 0) === (currentUserPlayer?.current_round_bet || 0);
  const isHost = currentUserPlayer?.turn_order === 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold truncate" title={game.name}>Game: {game.name}</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowGameRulesModal(true)} 
            className="btn btn-outline btn-info btn-sm"
          >
            📖 규칙
          </button>
          <button 
            onClick={() => setShowGameLog(!showGameLog)} 
            className="btn btn-outline btn-secondary btn-sm"
          >
            📝 로그
          </button>
          <button onClick={() => router.push('/lobby')} className="btn btn-outline btn-sm">Lobby</button>
        </div>
      </div>
      {error && (
        <div className="my-2">
          <ErrorAlert 
            message={error} 
            onDismiss={() => setError(null)}
          />
        </div>
      )}
      
      <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">게임 상태</p>
            <span className={`badge ${game.status === 'playing' ? 'badge-info' : game.status === 'waiting' ? 'badge-success' : 'badge-ghost'}`}>
              {game.status === 'playing' ? '진행중' : game.status === 'waiting' ? '대기중' : '종료'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">게임 페이즈</p>
            <span className="badge badge-primary">
              {game.game_phase === 'first_betting' ? '1차 베팅' : 
               game.game_phase === 'second_betting' ? '2차 베팅' :
               game.game_phase === 'sniping' ? '저격 단계' :
               game.game_phase === 'showdown' ? '카드 공개' : '준비'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">라운드</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{game.round_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">현재 차례</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {game.current_turn_player_id 
                ? players.find(p => p.id === game.current_turn_player_id)?.nickname || 'N/A' 
                : '없음'
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">딜러</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {game.dealer_player_id 
                ? players.find(p => p.id === game.dealer_player_id)?.nickname || 'N/A' 
                : '없음'
              }
            </p>
          </div>
        </div>
      </div>

      {(game.status === 'waiting') && isHost && (currentUserPlayer?.is_in_game === true) && (
        <div className="my-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg shadow text-center border border-blue-200 dark:border-blue-700">
          <h3 className="text-xl font-semibold mb-2 text-blue-900 dark:text-blue-100">Ready to Start?</h3>
          <p className="mb-3 text-sm text-blue-700 dark:text-blue-200">Current players: {players.filter(p => p.is_in_game === true).length} / {game.max_players}</p>
          {players.length < 2 && <p className="text-error text-sm mb-3">Minimum 2 players required to start.</p>}
          <button 
            onClick={handleStartGame} 
            className="btn btn-primary btn-lg"
            disabled={isStartingGame || players.length < 2}
          >
            {isStartingGame && <span className="loading loading-spinner"></span>}
            Start Game
          </button>
        </div>
      )}

      {/* Debug Tools - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="my-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow border border-yellow-200 dark:border-yellow-700">
          <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">🐛 Debug Tools</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleTestRealtimeUpdate} 
              className="btn btn-outline btn-warning btn-sm"
            >
              Test Realtime Update
            </button>
            <button 
              onClick={() => setShowSnipeModal(true)} 
              className="btn btn-outline btn-info btn-sm"
            >
              Test Snipe Modal
            </button>
            <button 
              onClick={() => {
                createMockRoundResult();
                setShowRoundResultsModal(true);
              }} 
              className="btn btn-outline btn-success btn-sm"
            >
              Test Round Results
            </button>
            <button 
              onClick={() => setShowSurvivalModal(true)} 
              className="btn btn-outline btn-accent btn-sm"
              disabled={!currentUserPlayer}
            >
              Test Survival Modal
            </button>
            <button 
              onClick={() => {
                createMockGameEnd();
                setShowGameEndModal(true);
              }} 
              className="btn btn-outline btn-error btn-sm"
            >
              Test Game End
            </button>
            <button 
              onClick={() => {
                // Mock snipe results for testing
                setSnipeResults([
                  { sniper_id: '1', sniper_name: '플레이어1', declared_rank: 'straight', declared_card: 7, success: true },
                  { sniper_id: '2', sniper_name: '플레이어2', declared_rank: 'two-pair', declared_card: 9, success: false }
                ]);
                setShowSnipeResultsModal(true);
              }} 
              className="btn btn-outline btn-warning btn-sm"
            >
              Test Snipe Results
            </button>
            <button 
              onClick={handleStartSnipePhase} 
              className="btn btn-outline btn-accent btn-sm"
              disabled={!currentUserPlayer || game?.status !== 'playing'}
            >
              Start Snipe Phase (Debug)
            </button>
            <button 
              onClick={handleEndRound} 
              className="btn btn-outline btn-secondary btn-sm"
              disabled={!currentUserPlayer || game?.status !== 'playing'}
            >
              End Round (Debug)
            </button>
            <button 
              onClick={handleShowdownAndNextRound} 
              className="btn btn-outline btn-primary btn-sm"
              disabled={!currentUserPlayer || game?.status !== 'playing'}
            >
              Test Showdown (Debug)
            </button>
          </div>
          <p className="text-xs mt-2 text-yellow-600 dark:text-yellow-300">
            These buttons are for testing UI components during development.
          </p>
        </div>
      )}

      {/* Game Log Panel */}
      {showGameLog && (
        <div className="my-4">
          <GameLog events={gameEvents} maxHeight="max-h-64" />
        </div>
      )}

      {/* 저격 현황 표시 */}
      <SnipeStatus 
        players={players} 
        gamePhase={game.game_phase || ''} 
        className="my-4"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-4">
        <div className="lg:col-span-2 order-2 lg:order-1 bg-base-200 dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">Game Table</h2>
          <SharedCardsDisplay cards={game.shared_cards} gamePhase={game.game_phase || ''} />
          <PotDisplay pot={game.betting_pot || 0} sidePots={game.side_pots || undefined} />
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-800 dark:text-gray-200">Other Players:</h3>
          {players.filter(p => p.user_id !== currentUserPlayer?.user_id && p.is_in_game === true).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {players.filter(p => p.user_id !== currentUserPlayer?.user_id && p.is_in_game === true).map(player => (
                <PlayerDisplay 
                  key={player.id} 
                  player={player} 
                  isCurrentUser={false} 
                  isCurrentTurn={!!(game.current_turn_player_id && game.current_turn_player_id === player.id)}
                  game={game}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No other active players.</p>
          )}
        </div>

        <div className="lg:col-span-1 order-1 lg:order-2 bg-base-200 dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          {currentUserPlayer && (currentUserPlayer.is_in_game === true) && (
            <>
              <h2 className="text-xl font-semibold mb-3 text-center text-gray-900 dark:text-gray-100">Your Area</h2>
              <PlayerDisplay player={currentUserPlayer} isCurrentUser={true} isCurrentTurn={!!isMyTurn} game={game} />
              
              {/* Survival option */}
              {currentUserPlayer.chips >= 75 && currentUserPlayer.is_survived !== true && (
                <div className="mt-3">
                  <button 
                    onClick={() => setShowSurvivalModal(true)} 
                    className="btn btn-success btn-block"
                  >
                    🛡️ 생존 확정 (75칩)
                  </button>
                </div>
              )}
              
              {isMyTurn && game.status === 'playing' && game.game_phase !== 'sniping' && (
                <BettingControls 
                  onCheck={handleCheck}
                  onCall={handleCall}
                  onRaise={handleRaise}
                  onFold={handleFold}
                  onAllIn={handleAllIn}
                  canCheck={canCheck}
                  currentBet={game.last_bet_amount || 0}
                  playerChips={currentUserPlayer.chips || 0}
                  bettingLimit={calculateBettingLimit(players)}
                />
              )}
              
              {/* 저격 페이즈에서만 저격 버튼 표시 */}
              {game.game_phase === 'sniping' && isMyTurn && !currentUserPlayer.declared_snipe && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg">
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-3 text-center">
                    🎯 당신의 저격 턴입니다
                  </h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4 text-center">
                    족보를 저격하거나 패스를 선택하세요
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <button 
                      onClick={() => setShowSnipeModal(true)} 
                      className="btn btn-warning btn-lg"
                    >
                      🎯 저격하기
                    </button>
                    <button 
                      onClick={handleSnipePass} 
                      className="btn btn-outline btn-lg"
                    >
                      패스
                    </button>
                  </div>
                </div>
              )}
              
              {game.game_phase === 'sniping' && !isMyTurn && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    다른 플레이어의 저격 턴을 기다리는 중...
                  </p>
                  {game.current_turn_player_id && (
                    <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                      현재 턴: {players.find(p => p.id === game.current_turn_player_id)?.nickname || '알 수 없음'}
                    </p>
                  )}
                </div>
              )}
              
              {!isMyTurn && game.status === 'playing' && game.game_phase !== 'sniping' && <p className="mt-4 p-3 bg-info/20 text-info-content rounded-md text-center">Waiting for other player&apos;s turn...</p>}
            </>
          )}
          {!currentUserPlayer && <p className="text-warning">You are observing. Player actions are not available.</p>} 
          {currentUserPlayer && !(currentUserPlayer.is_in_game === true) && <p className="text-error p-3 bg-error/20 rounded-md text-center">You have been eliminated from the game.</p>} 
        </div>
      </div>

      {/* Modals */}
      <SnipeModal
        isOpen={showSnipeModal}
        onClose={() => setShowSnipeModal(false)}
        onSnipe={handleSnipe}
        onPass={handleSnipePass}
      />

      <RoundResultsModal
        isOpen={showRoundResultsModal}
        onClose={() => setShowRoundResultsModal(false)}
        roundResult={roundResult}
        onNextRound={handleRoundResultsNext}
      />

      {currentUserPlayer && (
        <SurvivalModal
          isOpen={showSurvivalModal}
          onClose={() => setShowSurvivalModal(false)}
          currentPlayer={currentUserPlayer}
          otherPlayers={players.filter(p => p.id !== currentUserPlayer.id)}
          onSurvive={handleSurvive}
        />
      )}

      <GameRulesModal
        isOpen={showGameRulesModal}
        onClose={() => setShowGameRulesModal(false)}
      />

      {gameEndData && (
        <GameEndModal
          isOpen={showGameEndModal}
          onClose={() => setShowGameEndModal(false)}
          winners={gameEndData.winners}
          eliminatedPlayers={gameEndData.eliminatedPlayers}
          gameStats={gameEndData.gameStats}
          onReturnToLobby={handleReturnToLobby}
          onNewGame={() => {
            handleGameEnd();
            setShowGameEndModal(false);
          }}
        />
      )}

      <SnipeResultsModal
        isOpen={showSnipeResultsModal}
        snipeResults={snipeResults}
        onContinue={() => {
          setShowSnipeResultsModal(false);
          handleShowdownAndNextRound();
        }}
      />
    </div>
  );
} 