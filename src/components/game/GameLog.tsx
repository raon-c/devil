import React, { useEffect, useRef } from 'react';

export interface GameEvent {
  id: string;
  timestamp: Date;
  type: 'game_start' | 'round_start' | 'player_action' | 'card_reveal' | 'round_end' | 'player_eliminate' | 'player_survive' | 'snipe_declare' | 'snipe_result';
  playerId?: string;
  playerName?: string;
  message: string;
  details?: Record<string, unknown>;
}

interface GameLogProps {
  events: GameEvent[];
  className?: string;
  maxHeight?: string;
}

const EVENT_ICONS: Record<GameEvent['type'], string> = {
  game_start: '🎮',
  round_start: '🔄',
  player_action: '🎯',
  card_reveal: '🃏',
  round_end: '🏁',
  player_eliminate: '💀',
  player_survive: '🛡️',
  snipe_declare: '🎯',
  snipe_result: '💥'
};

const EVENT_COLORS: Record<GameEvent['type'], string> = {
  game_start: 'text-blue-600',
  round_start: 'text-green-600',
  player_action: 'text-purple-600',
  card_reveal: 'text-orange-600',
  round_end: 'text-red-600',
  player_eliminate: 'text-red-700',
  player_survive: 'text-green-700',
  snipe_declare: 'text-yellow-600',
  snipe_result: 'text-pink-600'
};

export const GameLog: React.FC<GameLogProps> = ({ 
  events, 
  className = '',
  maxHeight = 'max-h-96'
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  // 새 이벤트가 추가될 때 자동 스크롤
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="font-bold text-lg flex items-center text-gray-900 dark:text-gray-100">
          📝 게임 로그
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal">
            ({events.length}개 이벤트)
          </span>
        </h3>
      </div>
      
      <div className={`${maxHeight} overflow-y-auto`}>
        {events.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            아직 게임 이벤트가 없습니다.
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {events.map((event) => (
              <div 
                key={event.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {/* 이벤트 아이콘 */}
                <div className="flex-shrink-0 text-lg">
                  {EVENT_ICONS[event.type]}
                </div>
                
                {/* 이벤트 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-medium ${EVENT_COLORS[event.type]}`}>
                      {event.playerName && (
                        <span className="font-bold">{event.playerName}: </span>
                      )}
                      {event.message}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  
                  {/* 상세 정보 */}
                  {event.details && Object.keys(event.details).length > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded p-2 mt-1">
                      {Object.entries(event.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
      
      {/* 로그 요약 */}
      {events.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>첫 이벤트: {formatTime(events[0].timestamp)}</span>
            <span>마지막 이벤트: {formatTime(events[events.length - 1].timestamp)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 유틸리티 함수들
export const createGameEvent = (
  type: GameEvent['type'],
  message: string,
  playerId?: string,
  playerName?: string,
  details?: Record<string, unknown>
): GameEvent => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date(),
  type,
  message,
  playerId,
  playerName,
  details
});

export const gameEventTemplates = {
  gameStart: (playerCount: number) => 
    createGameEvent('game_start', `게임이 시작되었습니다. (플레이어 ${playerCount}명)`),
  
  roundStart: (roundNumber: number) => 
    createGameEvent('round_start', `라운드 ${roundNumber} 시작`),
  
  playerAction: (playerName: string, action: string, amount?: number) => 
    createGameEvent('player_action', 
      `${action}${amount ? ` (${amount}칩)` : ''}`, 
      undefined, playerName),
  
  cardReveal: (phase: string, cardCount: number) => 
    createGameEvent('card_reveal', `${phase} - 카드 ${cardCount}장 공개`),
  
  roundEnd: (winnerName: string, chipsWon: number) => 
    createGameEvent('round_end', `라운드 종료`, undefined, winnerName, { 
      chipsWon, 
      result: '승리' 
    }),
  
  playerEliminate: (playerName: string) => 
    createGameEvent('player_eliminate', '게임에서 탈락했습니다', undefined, playerName),
  
  playerSurvive: (playerName: string) => 
    createGameEvent('player_survive', '생존을 확정했습니다', undefined, playerName),
  
  snipeDeclare: (sniperName: string, targetName: string, handRank: string, highCard: number) => 
    createGameEvent('snipe_declare', 
      `${targetName}을(를) ${handRank} ${highCard}로 저격 선언`, 
      undefined, sniperName),
  
  snipeResult: (sniperName: string, targetName: string, success: boolean) => 
    createGameEvent('snipe_result', 
      `${targetName} 저격 ${success ? '성공' : '실패'}`, 
      undefined, sniperName, { success })
}; 