# Database Design

## Suggested Tables
`schools`: id, name, branding, settings  
`profiles`: id, auth_user_id, school_id, role, display_name  
`students`: id, profile_id, school_id, class_id, optional_age, optional_board  
`teachers`: id, profile_id, school_id  
`parents`: id, profile_id, school_id  
`parent_student_links`: parent_id, student_id  
`classes`: id, school_id, grade, section, academic_year  
`subjects`: id, name  
`assessments`: id, school_id, class_id, subject_id, title, date, max_marks, question_paper_ref, marking_scheme_ref, status  
`assessment_questions`: id, assessment_id, question_number, question_text, max_marks, concept_tags, command_word  
`submissions`: id, assessment_id, student_id, official_score, analysis_status  
`analyses`: id, submission_id, model_version, summary, structured_result_json  
`diagnostic_findings`: id, analysis_id, question_id, category, description, confidence, evidence  
`learning_profile_snapshots`: id, student_id, subject_id, snapshot_json, created_at  
`tutor_context_exports`: id, student_id, analysis_id, generated_context, created_at

## Storage
Question papers and rubrics can use private storage. Student answer sheets should default to temporary processing for the MVP unless archival is explicitly enabled.

## RLS
Students: own records. Parents: linked children. Teachers: assigned classes. Admins: authorized school scope. Cross-school access must be blocked.
