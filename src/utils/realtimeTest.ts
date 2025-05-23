import { supabase } from './supabaseClient';

export const testRealtimeConnection = async (gameId: string) => {
  if (!supabase) {
    // console.error('❌ Supabase client not available');
    return false;
  }

  // console.log('🧪 Testing Realtime connection...');

  // Test basic connectivity
  try {
    const { data, error } = await supabase
      .from('games')
      .select('id, name, status, betting_pot')
      .eq('id', gameId)
      .single();

    if (error) {
      // console.error('❌ Database query failed:', error);
      return false;
    }

    // console.log('✅ Database connection working');
    // console.log('📊 Game data:', data);

    // Test Realtime subscription
    const testChannel = supabase
      .channel(`test-realtime-${gameId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'games', 
          filter: `id=eq.${gameId}` 
        },
        (payload) => {
          // console.log('🎉 Realtime event received!', payload);
          // Clean up after successful test
          setTimeout(() => {
            if (supabase) {
              supabase.removeChannel(testChannel);
              // console.log('🧹 Test channel cleaned up');
            }
          }, 1000);
        }
      )
      .subscribe((status, err) => {
        // console.log(`📡 Test subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          // console.log('✅ Realtime subscription successful');
          
          // Trigger a test update after subscription is confirmed
          setTimeout(async () => {
            // console.log('🔄 Triggering test update...');
            try {
              if (supabase) {
                const { error: updateError } = await supabase
                  .from('games')
                  .update({ 
                    betting_pot: (data.betting_pot || 0) + 1 
                  })
                  .eq('id', gameId);
                
                if (updateError) throw updateError;
                // console.log('✅ Test update sent');
              }
            } catch (e) {
              // console.error('❌ Test update failed:', e);
            }
          }, 500);
        }
        if (err) {
          // console.error('❌ Realtime subscription error:', err);
        }
      });

    return true;
  } catch (e) {
    // console.error('❌ Test failed:', e);
    return false;
  }
}; 