import { LearningMRI, Student } from '@/types';
import { getSupabaseServerClient } from './supabase';

export interface AnalysisMetadata {
  model_used: string;
  processing_duration_ms: number;
}

export const db = {
  async getProfile(id: string): Promise<Student | null> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows
      console.error('Supabase profile select error:', error);
      throw new Error(`Failed to retrieve profile: ${error.message}`);
    }
    return data as Student;
  },

  async saveProfile(profile: Student): Promise<void> {
    const supabase = getSupabaseServerClient();
    
    // Upsert the profile
    const { error } = await supabase
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase profile upsert error:', error);
      throw new Error(`Failed to save profile: ${error.message}`);
    }
  },

  async saveAnalysis(mri: LearningMRI, metadata: AnalysisMetadata): Promise<void> {
    const supabase = getSupabaseServerClient();
    
    // We expect mri.subjectDetected to be populated. If not, fallback.
    const subjectDetected = (mri as any).subjectDetected || 'Unknown';
    
    const { error } = await supabase
      .from('analyses')
      .insert({
        id: mri.id,
        student_id: mri.studentId,
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
    const supabase = getSupabaseServerClient();
    
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
