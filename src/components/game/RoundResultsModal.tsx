import React from 'react';
import { Player, HandRank } from '@/types/game';
import { Card as CardComponent } from './Card';

interface RoundResult {
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
}

interface RoundResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundResult: RoundResult | null;
  onNextRound: () => void;
}

const HAND_RANK_LABELS: Record<HandRank, string> = {
  'four-of-a-kind': '포카드',
  'full-house': '풀하우스',
  'straight': '스트레이트',
  'three-of-a-kind': '트리플',
  'two-pair': '투페어',
  'one-pair': '원페어',
  'high-card': '하이카드'
};

export const RoundResultsModal: React.FC<RoundResultsModalProps> = ({
  isOpen,
  onClose,
  roundResult,
  onNextRound
}) => {
  if (!isOpen || !roundResult) return null;

  const handleNextRound = () => {
    onNextRound();
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-2xl mb-6 text-center text-gray-900 dark:text-gray-100">라운드 결과</h3>
        
        {/* 승자 정보 */}
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center border border-green-200 dark:border-green-700">
          <h4 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">🎉 승자</h4>
          <p className="text-lg font-semibold text-green-900 dark:text-green-100">{roundResult.winner.nickname}</p>
          <p className="text-md text-green-700 dark:text-green-300">
            {HAND_RANK_LABELS[roundResult.winningHand]} - {roundResult.chipsWon}칩 획득
          </p>
        </div>

        {/* 모든 플레이어의 최종 패 */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">모든 플레이어 최종 패</h4>
          <div className="space-y-3">
            {roundResult.finalCards.map((playerResult, index) => (
              <div 
                key={index}
                className={`
                  p-4 rounded-lg border-2 
                  ${playerResult.player.id === roundResult.winner.id 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' 
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {playerResult.player.nickname}
                    </span>
                    {playerResult.player.id === roundResult.winner.id && (
                      <span className="badge badge-success">승리</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {HAND_RANK_LABELS[playerResult.handRank]}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {playerResult.handDescription}
                    </p>
                  </div>
                </div>
                
                {/* 플레이어 카드 표시 */}
                <div className="flex space-x-2">
                  {playerResult.player.private_cards?.map((card, cardIndex) => (
                    <CardComponent
                      key={cardIndex}
                      card={card}
                      isRevealed={true}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 저격 결과 */}
        {roundResult.snipeResults.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">저격 결과</h4>
            <div className="space-y-3">
              {roundResult.snipeResults.map((snipeResult, index) => (
                <div 
                  key={index}
                  className={`
                    p-4 rounded-lg border-2 
                    ${snipeResult.success 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600' 
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {snipeResult.sniper.nickname} → {snipeResult.target.nickname}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        선언: {HAND_RANK_LABELS[snipeResult.declaredRank]} {snipeResult.declaredHighCard}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        실제: {HAND_RANK_LABELS[snipeResult.actualRank]}
                      </p>
                    </div>
                    <div className={`
                      badge badge-lg 
                      ${snipeResult.success ? 'badge-error' : 'badge-info'}
                    `}>
                      {snipeResult.success ? '저격 성공' : '저격 실패'}
                    </div>
                  </div>
                  {snipeResult.success && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      🎯 {snipeResult.target.nickname}의 족보가 최하위로 변경됩니다!
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="modal-action">
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleNextRound}
          >
            다음 라운드로
          </button>
          <button 
            className="btn btn-outline" 
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}; 