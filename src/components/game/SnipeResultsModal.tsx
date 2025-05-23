import React from 'react';

interface SnipeResult {
  sniper_id: string;
  sniper_name: string;
  declared_rank: string;
  declared_card: number;
  success: boolean;
}

interface SnipeResultsModalProps {
  isOpen: boolean;
  snipeResults: SnipeResult[];
  onContinue: () => void;
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

export const SnipeResultsModal: React.FC<SnipeResultsModalProps> = ({
  isOpen,
  snipeResults,
  onContinue
}) => {
  if (!isOpen) return null;

  const successfulSnipes = snipeResults.filter(result => result.success);
  const failedSnipes = snipeResults.filter(result => !result.success);

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-xl mb-4 text-center text-gray-900 dark:text-gray-100">
          🎯 저격 결과
        </h3>
        
        {snipeResults.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">이번 라운드에는 저격이 없었습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 성공한 저격 */}
            {successfulSnipes.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                  ✅ 저격 성공 ({successfulSnipes.length}건)
                </h4>
                <div className="space-y-3">
                  {successfulSnipes.map((result, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 p-3 rounded border border-green-100 dark:border-green-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {result.sniper_name}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            &ldquo;{HAND_RANK_KOREAN[result.declared_rank] || result.declared_rank} {result.declared_card}&rdquo; 저격
                          </span>
                        </div>
                        <div className="badge badge-success">+5칩</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 실패한 저격 */}
            {failedSnipes.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
                  ❌ 저격 실패 ({failedSnipes.length}건)
                </h4>
                <div className="space-y-3">
                  {failedSnipes.map((result, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 p-3 rounded border border-red-100 dark:border-red-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {result.sniper_name}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            &ldquo;{HAND_RANK_KOREAN[result.declared_rank] || result.declared_rank} {result.declared_card}&rdquo; 저격
                          </span>
                        </div>
                        <div className="badge badge-error">-3칩</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 총 결과 요약 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📊 저격 요약</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">총 저격 시도:</span>
                  <span className="font-medium ml-2 text-gray-900 dark:text-gray-100">{snipeResults.length}건</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">성공률:</span>
                  <span className="font-medium ml-2 text-gray-900 dark:text-gray-100">
                    {snipeResults.length > 0 ? Math.round((successfulSnipes.length / snipeResults.length) * 100) : 0}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">성공:</span>
                  <span className="font-medium ml-2 text-green-600 dark:text-green-400">{successfulSnipes.length}건</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">실패:</span>
                  <span className="font-medium ml-2 text-red-600 dark:text-red-400">{failedSnipes.length}건</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="modal-action">
          <button 
            className="btn btn-primary btn-lg" 
            onClick={onContinue}
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
}; 