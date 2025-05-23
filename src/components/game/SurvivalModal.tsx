import React, { useState, useEffect } from 'react';
import { Player } from '@/types/game';

interface SurvivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player;
  otherPlayers: Player[];
  onSurvive: (chipDistribution: Record<string, number>) => void;
}

export const SurvivalModal: React.FC<SurvivalModalProps> = ({
  isOpen,
  onClose,
  currentPlayer,
  otherPlayers,
  onSurvive
}) => {
  const [chipDistribution, setChipDistribution] = useState<Record<string, number>>({});
  
  const survivingPlayers = otherPlayers.filter(p => !p.is_survived && p.is_in_game);
  const chipsAfterSurvival = currentPlayer.chips - 75;
  const totalDistributed = Object.values(chipDistribution).reduce((sum, chips) => sum + chips, 0);
  const remainingChips = chipsAfterSurvival - totalDistributed;

  // 초기 분배 설정 (0칩 플레이어에게 최소 1칩)
  useEffect(() => {
    if (isOpen && survivingPlayers.length > 0) {
      const initialDistribution: Record<string, number> = {};
      
      // 0칩 플레이어들에게 먼저 1칩씩 분배
      const zeroChipPlayers = survivingPlayers.filter(p => p.chips === 0);
      zeroChipPlayers.forEach(player => {
        initialDistribution[player.id] = 1;
      });

      // 나머지 플레이어들은 0으로 시작
      survivingPlayers.forEach(player => {
        if (!initialDistribution[player.id]) {
          initialDistribution[player.id] = 0;
        }
      });

      setChipDistribution(initialDistribution);
    }
  }, [isOpen, survivingPlayers]);

  const handleChipChange = (playerId: string, chips: number) => {
    const player = survivingPlayers.find(p => p.id === playerId);
    if (!player) return;

    // 0칩 플레이어는 최소 1칩 필요
    const minChips = player.chips === 0 ? 1 : 0;
    const adjustedChips = Math.max(minChips, chips);

    setChipDistribution(prev => ({
      ...prev,
      [playerId]: adjustedChips
    }));
  };

  const handleSurvive = () => {
    if (remainingChips >= 0) {
      onSurvive(chipDistribution);
      onClose();
    }
  };

  const canSurvive = currentPlayer.chips >= 75 && remainingChips >= 0;

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-2xl mb-6 text-center text-gray-900 dark:text-gray-100">생존 확정</h3>
        
        {/* 생존 확정 안내 */}
        <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">🛡️ 생존 확정 조건</h4>
          <p className="text-yellow-700 dark:text-yellow-300 mb-2">
            75칩을 지불하여 게임에서 생존을 확정할 수 있습니다.
          </p>
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p>• 현재 보유 칩: <span className="font-bold">{currentPlayer.chips}개</span></p>
            <p>• 생존 비용: <span className="font-bold">75개</span></p>
            <p>• 생존 후 보유 칩: <span className="font-bold">{currentPlayer.chips - 75}개</span></p>
          </div>
        </div>

        {/* 칩 분배 */}
        {chipsAfterSurvival > 0 && survivingPlayers.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">남은 칩 분배</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              생존 확정 후 남은 {chipsAfterSurvival}개의 칩을 다른 플레이어들에게 분배해주세요.
            </p>
            
            <div className="space-y-3">
              {survivingPlayers.map(player => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{player.nickname}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      현재 칩: {player.chips}개
                      {player.chips === 0 && (
                        <span className="text-red-500 dark:text-red-400 ml-2">(최소 1칩 필요)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={player.chips === 0 ? 1 : 0}
                      max={chipsAfterSurvival}
                      value={chipDistribution[player.id] || 0}
                      onChange={(e) => handleChipChange(player.id, parseInt(e.target.value) || 0)}
                      className="input input-bordered input-sm w-20 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">칩</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 분배 요약 */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex justify-between text-sm text-blue-800 dark:text-blue-200">
                <span>분배 가능한 칩:</span>
                <span className="font-bold">{chipsAfterSurvival}개</span>
              </div>
              <div className="flex justify-between text-sm text-blue-800 dark:text-blue-200">
                <span>분배한 칩:</span>
                <span className="font-bold">{totalDistributed}개</span>
              </div>
              <div className="flex justify-between text-sm border-t border-blue-200 dark:border-blue-600 pt-2 mt-2 text-blue-900 dark:text-blue-100">
                <span>남은 칩:</span>
                <span className={`font-bold ${remainingChips < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {remainingChips}개
                </span>
              </div>
            </div>
            
            {remainingChips < 0 && (
              <div className="alert alert-error mt-3 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700">
                <span className="text-red-800 dark:text-red-200">분배 칩이 보유 칩을 초과했습니다!</span>
              </div>
            )}
          </div>
        )}

        {/* 생존 불가 안내 */}
        {currentPlayer.chips < 75 && (
          <div className="alert alert-warning mb-6 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700">
            <span className="text-orange-800 dark:text-orange-200">칩이 부족하여 생존 확정을 할 수 없습니다. (필요: 75칩)</span>
          </div>
        )}

        {/* 생존 불가 플레이어 없음 */}
        {chipsAfterSurvival > 0 && survivingPlayers.length === 0 && (
          <div className="alert alert-info mb-6 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
            <span className="text-blue-800 dark:text-blue-200">분배할 수 있는 다른 플레이어가 없습니다.</span>
          </div>
        )}

        {/* 버튼 */}
        <div className="modal-action">
          <button 
            className="btn btn-success btn-lg" 
            onClick={handleSurvive}
            disabled={!canSurvive}
          >
            {chipsAfterSurvival > 0 ? '분배 완료 및 생존' : '생존 확정'}
          </button>
          <button 
            className="btn btn-outline" 
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}; 