-- 족보 저격 시스템을 위한 RPC 함수 생성

-- 저격 선언 함수 (족보 저격 방식)
CREATE OR REPLACE FUNCTION declare_snipe(
    p_game_id UUID,
    p_player_id UUID,
    p_hand_rank TEXT,
    p_highest_card INTEGER
) RETURNS JSON AS $$
DECLARE
    v_game games%ROWTYPE;
    v_player players%ROWTYPE;
BEGIN
    -- 게임 상태 확인
    SELECT * INTO v_game FROM games WHERE id = p_game_id;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', '게임을 찾을 수 없습니다.');
    END IF;
    
    IF v_game.status != 'playing' THEN
        RETURN json_build_object('success', false, 'message', '게임이 진행 중이 아닙니다.');
    END IF;
    
    IF v_game.game_phase != 'sniping' THEN
        RETURN json_build_object('success', false, 'message', '저격 단계가 아닙니다.');
    END IF;
    
    -- 플레이어 상태 확인
    SELECT * INTO v_player FROM players WHERE id = p_player_id AND game_id = p_game_id;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', '플레이어를 찾을 수 없습니다.');
    END IF;
    
    IF v_player.is_in_game != true OR v_player.is_folded = true THEN
        RETURN json_build_object('success', false, 'message', '게임에 참여 중이 아니거나 폴드한 플레이어입니다.');
    END IF;
    
    -- 이미 저격 선언했는지 확인
    IF v_player.declared_snipe IS NOT NULL THEN
        RETURN json_build_object('success', false, 'message', '이미 저격을 선언했습니다.');
    END IF;
    
    -- 저격 선언 저장
    UPDATE players 
    SET declared_snipe = json_build_object(
        'hand_rank', p_hand_rank,
        'highest_card_number', p_highest_card
    ),
    last_game_action = 'snipe'
    WHERE id = p_player_id;
    
    RETURN json_build_object(
        'success', true, 
        'message', format('%s %s 저격이 선언되었습니다.', p_hand_rank, p_highest_card)
    );
END;
$$ LANGUAGE plpgsql;

-- 저격 결과 처리 함수 (카드 공개 후 호출)
CREATE OR REPLACE FUNCTION process_snipe_results(p_game_id UUID) RETURNS JSON AS $$
DECLARE
    v_snipe_player RECORD;
    v_target_player RECORD;
    v_snipe_success BOOLEAN;
    v_total_rewards INTEGER := 0;
    v_results JSON := '[]'::JSON;
BEGIN
    -- 저격 선언한 플레이어들을 순회
    FOR v_snipe_player IN 
        SELECT id, nickname, declared_snipe, chips
        FROM players 
        WHERE game_id = p_game_id 
        AND declared_snipe IS NOT NULL
        AND is_in_game = true
    LOOP
        v_snipe_success := false;
        
        -- 해당 족보 이상을 가진 플레이어가 있는지 확인
        FOR v_target_player IN
            SELECT id, nickname, actual_hand_result
            FROM players
            WHERE game_id = p_game_id
            AND is_in_game = true
            AND actual_hand_result IS NOT NULL
        LOOP
            -- 저격한 족보와 실제 족보 비교 로직 (여기서는 단순화)
            -- 실제로는 hand rank의 우선순위와 카드 숫자를 비교해야 함
            IF (v_target_player.actual_hand_result->>'hand_rank')::TEXT = (v_snipe_player.declared_snipe->>'hand_rank')::TEXT 
               AND (v_target_player.actual_hand_result->'rank_determining_cards'->>0)::INTEGER >= (v_snipe_player.declared_snipe->>'highest_card_number')::INTEGER THEN
                v_snipe_success := true;
                
                -- 저격당한 플레이어의 족보를 최하위로 변경
                UPDATE players 
                SET actual_hand_result = jsonb_set(
                    actual_hand_result::jsonb,
                    '{hand_rank}',
                    '"sniped"'::jsonb
                )
                WHERE id = v_target_player.id;
            END IF;
        END LOOP;
        
        -- 저격 성공/실패에 따른 칩 조정
        IF v_snipe_success THEN
            UPDATE players 
            SET chips = chips + 5 -- SNIPE_SUCCESS_REWARD
            WHERE id = v_snipe_player.id;
            v_total_rewards := v_total_rewards + 5;
        ELSE
            UPDATE players 
            SET chips = chips - 3 -- SNIPE_FAILURE_PENALTY
            WHERE id = v_snipe_player.id;
        END IF;
        
        -- 결과 저장
        v_results := v_results || json_build_object(
            'sniper_id', v_snipe_player.id,
            'sniper_name', v_snipe_player.nickname,
            'declared_rank', v_snipe_player.declared_snipe->>'hand_rank',
            'declared_card', v_snipe_player.declared_snipe->>'highest_card_number',
            'success', v_snipe_success
        );
    END LOOP;
    
    -- 저격 선언 초기화
    UPDATE players 
    SET declared_snipe = NULL
    WHERE game_id = p_game_id;
    
    RETURN json_build_object(
        'success', true,
        'message', '저격 결과가 처리되었습니다.',
        'results', v_results,
        'total_rewards', v_total_rewards
    );
END;
$$ LANGUAGE plpgsql; 