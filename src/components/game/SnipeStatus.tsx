import React from 'react';
import { Player } from '@/types/game';

interface SnipeStatusProps {
  players: Player[];
  gamePhase: string;
  className?: string;
}

const HAND_RANK_KOREAN: Record<string, string> = {
  'four-of-a-kind': '포카드',
  'full-house': '풀하우스',
  'straight': '스트레이트',
  'three-of-a-kind': '트리플',
  'two-pair': '투페어',
  'one-pair': '원페어',
  'high-card': '하이카드'
};

export const SnipeStatus: React.FC<SnipeStatusProps> = ({
  players,
  gamePhase,
  className = ''
}) => {
  // 저격 페이즈가 아니면 표시하지 않음
  if (gamePhase !== 'sniping') return null;

  const playersWithSnipes = players.filter(p => p.declared_snipe && p.is_in_game);
  const playersWithoutSnipes = players.filter(p => !p.declared_snipe && p.is_in_game && !p.is_folded);

  return (
    <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 ${className}`}>
      <h3 className="font-bold text-lg mb-3 text-yellow-800 dark:text-yellow-200 flex items-center">
        🎯 저격 현황
      </h3>
      
      <div className="space-y-4">
        {/* 저격 선언한 플레이어들 */}
        {playersWithSnipes.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-yellow-700 dark:text-yellow-300 mb-2">
              저격 선언 완료 ({playersWithSnipes.length}명)
            </h4>
            <div className="space-y-2">
              {playersWithSnipes.map(player => (
                <div key={player.id} className="bg-white dark:bg-gray-700 p-2 rounded border border-yellow-100 dark:border-yellow-600">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {player.nickname}
                    </span>
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">
                      {player.declared_snipe && (
                        <>
                          {HAND_RANK_KOREAN[player.declared_snipe.hand_rank] || player.declared_snipe.hand_rank}{' '}
                          {player.declared_snipe.highest_card_number}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 아직 저격 선언하지 않은 플레이어들 */}
        {playersWithoutSnipes.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">
              저격 대기 중 ({playersWithoutSnipes.length}명)
            </h4>
            <div className="flex flex-wrap gap-2">
              {playersWithoutSnipes.map(player => (
                <div key={player.id} className="bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {player.nickname}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 진행률 표시 */}
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>저격 진행률</span>
            <span>{playersWithSnipes.length}/{players.filter(p => p.is_in_game && !p.is_folded).length}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${players.filter(p => p.is_in_game && !p.is_folded).length > 0 
                  ? (playersWithSnipes.length / players.filter(p => p.is_in_game && !p.is_folded).length) * 100 
                  : 0}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 