import { LearningMRI, Student } from '@/types';
import { createClient } from '@/lib/supabase/server';

export interface AnalysisMetadata {
  model_used: string;
  processing_duration_ms: number;
}

export const db = {
  async getProfile(id?: string): Promise<Student | null> {
    const supabase = await createClient();
    
    // Fallback to currently authenticated user if no ID is passed
    let targetId = id;
    if (!targetId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      targetId = user.id;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows
      console.error('Supabase profile select error:', error);
      throw new Error(`Failed to retrieve profile: ${error.message}`);
    }
    return data as Student;
  },

  async saveProfile(profile: Student): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized to save profile");
    
    // Upsert the profile
    const { error } = await supabase
      .from('profiles')
      .upsert({
        ...profile,
        id: user.id, // Enforce current user ID
        user_id: user.id, // Populate foreign key
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase profile upsert error:', error);
      throw new Error(`Failed to save profile: ${error.message}`);
    }
  },

  async saveAnalysis(mri: LearningMRI, metadata: AnalysisMetadata): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized to save analysis");
    
    // We expect mri.subjectDetected to be populated. If not, fallback.
    const subjectDetected = (mri as any).subjectDetected || 'Unknown';
    
    const { error } = await supabase
      .from('analyses')
      .insert({
        id: mri.id,
        student_id: user.id, // For legacy column
        user_id: user.id,    // For new RLS column
        status: 'completed',
        subject_detected: subjectDetected,
        score_obtained: mri.score?.obtained?.toString() || (mri.officialScore ? mri.officialScore.split('/')[0] : null),
        score_total: mri.score?.total?.toString() || (mri.officialScore ? mri.officialScore.split('/')[1] : null),
        model_used: metadata.model_used,
        processing_duration_ms: metadata.processing_duration_ms,
        analysis_data: mri
      });

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to save analysis to database: ${error.message}`);
    }
  },

  async getAnalysis(id: string): Promise<LearningMRI | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('analyses')
      .select('analysis_data')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Supabase select error:', error);
      throw new Error(`Failed to retrieve analysis from database: ${error.message}`);
    }

    return data.analysis_data as LearningMRI;
  }
};
