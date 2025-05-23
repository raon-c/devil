import React from 'react';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-2xl mb-6 text-center text-gray-900 dark:text-gray-100">🎯 저격 홀덤 게임 규칙</h3>
        
        {/* 게임 개요 */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-3 text-blue-600 dark:text-blue-400">📖 게임 개요</h4>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="mb-2 text-blue-900 dark:text-blue-100">
              저격 홀덤은 포커와 유사하지만 <strong>저격</strong> 시스템이 추가된 특별한 카드 게임입니다.
            </p>
            <p className="text-blue-900 dark:text-blue-100">
              목표는 칩을 모으고 마지막까지 살아남거나, 75칩을 모아 생존을 확정하는 것입니다.
            </p>
          </div>
        </div>

        {/* 기본 규칙 */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-3 text-green-600 dark:text-green-400">🎮 기본 규칙</h4>
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h5 className="font-semibold mb-2 text-green-900 dark:text-green-100">1. 게임 시작</h5>
              <ul className="list-disc list-inside text-sm space-y-1 text-green-800 dark:text-green-200">
                <li>각 플레이어는 25칩으로 시작</li>
                <li>개인 카드 2장과 공유 카드 5장을 사용</li>
                <li>총 7장 중 5장으로 최고의 패를 만듭니다</li>
              </ul>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h5 className="font-semibold mb-2 text-green-900 dark:text-green-100">2. 라운드 진행</h5>
              <ul className="list-disc list-inside text-sm space-y-1 text-green-800 dark:text-green-200">
                <li>개인 카드 2장 분배 → 베팅</li>
                <li>공유 카드 3장 공개 (플롭) → 베팅</li>
                <li>공유 카드 1장 추가 (턴) → 베팅</li>
                <li>공유 카드 1장 추가 (리버) → 베팅</li>
                <li>저격 단계 → 결과 확인</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 베팅 액션 */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-3 text-purple-600 dark:text-purple-400">💰 베팅 액션</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
              <h5 className="font-semibold text-purple-800 dark:text-purple-200">체크 (Check)</h5>
              <p className="text-sm text-purple-700 dark:text-purple-300">베팅하지 않고 다음 플레이어에게 턴 넘기기</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
              <h5 className="font-semibold text-purple-800 dark:text-purple-200">콜 (Call)</h5>
              <p className="text-sm text-purple-700 dark:text-purple-300">이전 플레이어의 베팅 금액과 같은 금액 베팅</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
              <h5 className="font-semibold text-purple-800 dark:text-purple-200">레이즈 (Raise)</h5>
              <p className="text-sm text-purple-700 dark:text-purple-300">이전 베팅보다 더 많은 금액 베팅</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
              <h5 className="font-semibold text-purple-800 dark:text-purple-200">폴드 (Fold)</h5>
              <p className="text-sm text-purple-700 dark:text-purple-300">게임에서 포기하고 베팅한 칩 포기</p>
            </div>
          </div>
        </div>

        {/* 족보 */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-3 text-orange-600 dark:text-orange-400">🃏 포커 족보 (높은 순서)</h4>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-orange-800 dark:text-orange-200">
              <div><strong>1. 포카드</strong> - 같은 숫자 4장</div>
              <div><strong>2. 풀하우스</strong> - 트리플 + 원페어</div>
              <div><strong>3. 스트레이트</strong> - 연속된 숫자 5장</div>
              <div><strong>4. 트리플</strong> - 같은 숫자 3장</div>
              <div><strong>5. 투페어</strong> - 같은 숫자 2장이 2개</div>
              <div><strong>6. 원페어</strong> - 같은 숫자 2장</div>
              <div><strong>7. 하이카드</strong> - 가장 높은 카드</div>
            </div>
          </div>
        </div>

        {/* 저격 시스템 */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-3 text-red-600 dark:text-red-400">🎯 저격 시스템</h4>
          <div className="space-y-3">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
              <h5 className="font-semibold mb-2 text-red-800 dark:text-red-200">저격 선언</h5>
              <ul className="list-disc list-inside text-sm space-y-1 text-red-700 dark:text-red-300">
                <li>마지막 베팅 라운드 후 저격 단계 진행</li>
                <li>다른 플레이어의 족보를 예상해서 선언</li>
                <li>예: &ldquo;스트레이트 7&rdquo; = 상대가 7 이상의 스트레이트를 만들어야 함</li>
              </ul>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
              <h5 className="font-semibold mb-2 text-red-800 dark:text-red-200">저격 결과</h5>
              <ul className="list-disc list-inside text-sm space-y-1 text-red-700 dark:text-red-300">
                <li><strong>저격 성공:</strong> 타겟의 족보가 선언보다 낮음 → 타겟의 족보가 최하위로 변경</li>
                <li><strong>저격 실패:</strong> 타겟의 족보가 선언 이상 → 아무 일 없음</li>
                <li>저격은 선택사항이며, 패스할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 승리 조건 */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-3 text-yellow-600 dark:text-yellow-400">🏆 승리 조건</h4>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg space-y-3 border border-yellow-200 dark:border-yellow-700">
            <div>
              <h5 className="font-semibold text-yellow-800 dark:text-yellow-200">생존 확정</h5>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">75칩을 모으면 생존을 확정할 수 있습니다. 남은 칩은 다른 플레이어에게 분배됩니다.</p>
            </div>
            <div>
              <h5 className="font-semibold text-yellow-800 dark:text-yellow-200">게임 승리</h5>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">마지막까지 남은 플레이어가 최종 승자가 됩니다.</p>
            </div>
            <div>
              <h5 className="font-semibold text-yellow-800 dark:text-yellow-200">탈락 조건</h5>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">칩이 0개가 되면 게임에서 탈락합니다.</p>
            </div>
          </div>
        </div>

        {/* 팁 */}
        <div className="mb-6">
          <h4 className="text-lg font-bold mb-3 text-indigo-600 dark:text-indigo-400">💡 게임 팁</h4>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700">
            <ul className="list-disc list-inside text-sm space-y-1 text-indigo-800 dark:text-indigo-200">
              <li>상대방의 베팅 패턴을 관찰하여 족보를 예상해보세요</li>
              <li>저격은 강력한 도구이지만 신중하게 사용하세요</li>
              <li>75칩 모으기와 끝까지 버티기 중 상황에 맞는 전략을 선택하세요</li>
              <li>폴드 타이밍을 잘 판단하여 칩을 보존하세요</li>
              <li>공유 카드를 잘 활용하여 최고의 5장 조합을 만드세요</li>
            </ul>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="modal-action">
          <button 
            className="btn btn-primary btn-lg" 
            onClick={onClose}
          >
            규칙 이해했습니다!
          </button>
        </div>
      </div>
    </div>
  );
}; 