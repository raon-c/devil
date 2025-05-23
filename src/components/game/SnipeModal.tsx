import React, { useState } from 'react';
import { HandRank } from '@/types/game';

interface SnipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSnipe: (handRank: HandRank, highestCard: number) => void;
  onPass: () => void;
}

const HAND_RANKS: { value: HandRank; label: string }[] = [
  { value: 'four-of-a-kind', label: '포카드' },
  { value: 'full-house', label: '풀하우스' },
  { value: 'straight', label: '스트레이트' },
  { value: 'three-of-a-kind', label: '트리플' },
  { value: 'two-pair', label: '투페어' },
  { value: 'one-pair', label: '원페어' },
  { value: 'high-card', label: '하이카드' }
];

export const SnipeModal: React.FC<SnipeModalProps> = ({
  isOpen,
  onClose,
  onSnipe,
  onPass
}) => {
  const [selectedRank, setSelectedRank] = useState<HandRank>('straight');
  const [highestCard, setHighestCard] = useState<number>(10);

  const handleSnipe = () => {
    onSnipe(selectedRank, highestCard);
    onClose();
  };

  const handlePass = () => {
    onPass();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">저격 선언</h3>
        
        <div className="space-y-4">
          {/* 족보 선택 */}
          <div>
            <label className="label">
              <span className="label-text font-semibold text-gray-700 dark:text-gray-300">저격할 족보</span>
            </label>
            <select 
              className="select select-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value as HandRank)}
            >
              {HAND_RANKS.map(rank => (
                <option key={rank.value} value={rank.value}>
                  {rank.label}
                </option>
              ))}
            </select>
          </div>

          {/* 최고 카드 선택 */}
          <div>
            <label className="label">
              <span className="label-text font-semibold text-gray-700 dark:text-gray-300">
                {selectedRank === 'full-house' ? '트리플 카드 숫자' : '가장 높은 카드 숫자'}
              </span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              value={highestCard}
              onChange={(e) => setHighestCard(parseInt(e.target.value) || 1)}
            />
            <div className="label">
              <span className="label-text-alt text-gray-500 dark:text-gray-400">
                1-10 사이의 숫자를 입력하세요
              </span>
            </div>
          </div>

          {/* 예시 설명 */}
          <div className="alert alert-info bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p><strong>예시:</strong></p>
              <p>&ldquo;스트레이트 7&rdquo;을 선언하면 상대방이 7 이상의 스트레이트를 만들어야 저격에 실패합니다.</p>
              <p>&ldquo;플러시 9&rdquo;를 선언하면 상대방이 9 이상의 플러시를 만들어야 저격에 실패합니다.</p>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button 
            className="btn btn-warning" 
            onClick={handleSnipe}
          >
            🎯 저격 선언
          </button>
          <button 
            className="btn btn-ghost" 
            onClick={handlePass}
          >
            패스
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