'use server';

import { createClient } from '@/lib/supabase/server';
import { logServerEvent, type AnalyticsEvent } from '@/lib/analytics/server';

export async function logClientEvent(
  eventType: AnalyticsEvent, 
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown',
  metadata: Record<string, any> = {}
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // We pass this over to the non-blocking server logger
    logServerEvent({
      userId: user?.id,
      eventType,
      deviceType,
      metadata
    });
  } catch (e) {
    // Silently catch and ignore analytics errors to not disrupt client
    console.error('[Analytics Action] Error processing client event', e);
  }
}
