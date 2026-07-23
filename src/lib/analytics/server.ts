import 'server-only';
import { createClient } from '@supabase/supabase-js';

// We explicitly create an admin client that ONLY runs server-side
// We do not export this client to prevent accidental misuse.
const getAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  );
};

export type AnalyticsEvent = 
  | 'app_open' 
  | 'login' 
  | 'signup' 
  | 'analysis_started' 
  | 'analysis_completed' 
  | 'analysis_failed' 
  | 'analysis_rejected_invalid_input'
  | 'pwa_install';

export interface LogEventParams {
  userId?: string | null;
  eventType: AnalyticsEvent;
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  metadata?: Record<string, any>;
}

/**
 * Non-blocking server-side analytics logger.
 * Failures here MUST NEVER crash the parent route.
 */
export const logServerEvent = (params: LogEventParams) => {
  // Fire and forget, catching errors internally
  Promise.resolve().then(async () => {
    try {
      const adminClient = getAdminClient();
      if (!adminClient) return;

      const { error } = await adminClient.from('analytics_events').insert({
        user_id: params.userId || null,
        event_type: params.eventType,
        device_type: params.deviceType || 'unknown',
        metadata: params.metadata || {},
      });

      if (error) {
        console.error('[Analytics] Failed to log event:', error.message);
      }
    } catch (e) {
      console.error('[Analytics] Unexpected error logging event:', e);
    }
  });
};
