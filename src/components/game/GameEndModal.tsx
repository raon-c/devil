import React from 'react';
import { Player } from '@/types/game';

interface GameEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  winners: Player[];
  eliminatedPlayers: Player[];
  gameStats: {
    totalRounds: number;
    totalGameTime: string;
    finalPot: number;
  };
  onReturnToLobby: () => void;
  onNewGame?: () => void;
}

export const GameEndModal: React.FC<GameEndModalProps> = ({
  isOpen,
  onClose,
  winners,
  eliminatedPlayers,
  gameStats,
  onReturnToLobby,
  onNewGame
}) => {
  if (!isOpen) return null;

  const hasSingleWinner = winners.length === 1;
  const hasMultipleWinners = winners.length > 1;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        
        {/* 게임 종료 헤더 */}
        <div className="text-center mb-6">
          <h3 className="font-bold text-3xl mb-2 text-gray-900 dark:text-gray-100">
            🎉 게임 종료!
          </h3>
          <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* 승자 발표 */}
        <div className="mb-6">
          {hasSingleWinner && (
            <div className="text-center p-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <div className="text-6xl mb-4">👑</div>
              <h4 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                최종 승자
              </h4>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                {winners[0].nickname}
              </p>
              <div className="mt-3 space-y-1 text-yellow-700 dark:text-yellow-300">
                <p>최종 보유 칩: <span className="font-bold">{winners[0].chips}개</span></p>
                {winners[0].is_survived && (
                  <p className="text-sm">✨ 생존 확정으로 승리</p>
                )}
              </div>
            </div>
          )}

          {hasMultipleWinners && (
            <div className="text-center p-6 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg border border-green-200 dark:border-green-700">
              <div className="text-4xl mb-4">🏆</div>
              <h4 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4">
                공동 승자
              </h4>
              <div className="space-y-2">
                {winners.map((winner, _index) => (
                  <div key={winner.id} className="flex items-center space-x-3">
                    <span className="text-2xl">🥇</span>
                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {winner.nickname}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 탈락자 명단 */}
        {eliminatedPlayers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">
              📊 최종 순위
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="space-y-2">
                {/* 승자들 먼저 표시 */}
                {winners.map((winner, _index) => (
                  <div key={`winner-${winner.id}`} className="flex items-center justify-between p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-yellow-600 dark:text-yellow-400">
                        #{_index + 1}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {winner.nickname}
                      </span>
                      <span className="badge badge-warning badge-sm">승리</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {winner.chips}칩
                    </span>
                  </div>
                ))}
                
                {/* 탈락자들 */}
                {eliminatedPlayers
                  .sort((a, b) => (b.chips || 0) - (a.chips || 0))
                  .map((player, _index) => (
                  <div key={`eliminated-${player.id}`} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-gray-500 dark:text-gray-400">
                        #{winners.length + _index + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {player.nickname}
                      </span>
                      <span className="badge badge-ghost badge-sm">탈락</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {player.chips || 0}칩
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 게임 통계 */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">
            📈 게임 통계
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center border border-blue-200 dark:border-blue-700">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gameStats.totalRounds}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">총 라운드</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center border border-green-200 dark:border-green-700">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {gameStats.totalGameTime}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">게임 시간</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center border border-purple-200 dark:border-purple-700">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {gameStats.finalPot}
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">최종 팟</p>
            </div>
          </div>
        </div>

        {/* 행동 버튼들 */}
        <div className="modal-action">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button 
              className="btn btn-primary btn-lg flex-1" 
              onClick={onReturnToLobby}
            >
              🏠 로비로 돌아가기
            </button>
            {onNewGame && (
              <button 
                className="btn btn-outline btn-lg flex-1" 
                onClick={onNewGame}
              >
                🎮 새 게임 시작
              </button>
            )}
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 