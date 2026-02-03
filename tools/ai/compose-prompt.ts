import type { Tables, TaskType, Platform, Json } from '@/types/database';

type VoiceProfile = Tables<'voice_profiles'>;
type PlatformProfile = Tables<'platform_profiles'>;
type PromptTemplate = Tables<'prompt_templates'>;

export interface UserInput {
  topic?: string;
  audience?: string;
  angle?: string;
  example?: string;
  cta_preference?: string;
  idea_title?: string;
  idea_hook?: string;
  idea_outline?: string[];
  idea_cta?: string;
}

export interface ComposedPrompt {
  prompt: string;
  versions: {
    task_template_id: string;
    task_template_version: number;
    voice_profile_id: string;
    voice_profile_version: number;
    platform_profile_id?: string;
    platform_profile_version?: number;
  };
}

export interface ComposePromptInput {
  taskType: TaskType;
  voiceProfile: VoiceProfile;
  platformProfile?: PlatformProfile;
  promptTemplate: PromptTemplate;
  userInput: UserInput;
  trendSummary?: string;
}

export function composePrompt(input: ComposePromptInput): ComposedPrompt {
  const { taskType, voiceProfile, platformProfile, promptTemplate, userInput, trendSummary } =
    input;

  const sections: string[] = [];

  // 1. Task Template
  sections.push(`=== TASK ===\n${promptTemplate.content}`);

  // 2. Voice Profile
  sections.push(formatVoiceProfile(voiceProfile));

  // 3. Platform Profile (if provided)
  if (platformProfile) {
    sections.push(formatPlatformProfile(platformProfile));
  }

  // 4. User Input
  sections.push(formatUserInput(userInput));

  // 5. Trend Summary (if provided)
  if (trendSummary) {
    sections.push(`=== CURRENT TRENDS ===\n${trendSummary}`);
  }

  const prompt = sections.join('\n\n');

  return {
    prompt,
    versions: {
      task_template_id: promptTemplate.id,
      task_template_version: promptTemplate.version,
      voice_profile_id: voiceProfile.id,
      voice_profile_version: voiceProfile.version,
      platform_profile_id: platformProfile?.id,
      platform_profile_version: platformProfile?.version,
    },
  };
}

function formatVoiceProfile(profile: VoiceProfile): string {
  const lines = ['=== VOICE PROFILE ==='];

  lines.push(`PERSONA: ${profile.persona}`);

  if (profile.tone_rules.length > 0) {
    lines.push('\nTONE RULES:');
    profile.tone_rules.forEach((rule) => lines.push(`- ${rule}`));
  }

  if (profile.readability_rules.length > 0) {
    lines.push('\nREADABILITY RULES:');
    profile.readability_rules.forEach((rule) => lines.push(`- ${rule}`));
  }

  if (profile.forbidden_language && profile.forbidden_language.length > 0) {
    lines.push('\nFORBIDDEN LANGUAGE (never use these words/phrases):');
    lines.push(profile.forbidden_language.join(', '));
  }

  return lines.join('\n');
}

function formatPlatformProfile(profile: PlatformProfile): string {
  const lines = ['=== PLATFORM PROFILE ==='];

  lines.push(`PLATFORM: ${profile.platform.toUpperCase()}`);

  // Structure
  const structure = profile.structure as { sections?: Array<{ name: string; description: string; required?: boolean }> };
  if (structure.sections && structure.sections.length > 0) {
    lines.push('\nSTRUCTURE:');
    structure.sections.forEach((section) => {
      const required = section.required ? ' (required)' : ' (optional)';
      lines.push(`- ${section.name}${required}: ${section.description}`);
    });
  }

  if (profile.formatting_rules.length > 0) {
    lines.push('\nFORMATTING RULES:');
    profile.formatting_rules.forEach((rule) => lines.push(`- ${rule}`));
  }

  // Length constraints
  const constraints = profile.length_constraints as { target_min?: number; target_max?: number; hard_max?: number; unit?: string };
  if (constraints) {
    lines.push('\nLENGTH CONSTRAINTS:');
    if (constraints.target_min && constraints.target_max) {
      lines.push(`- Target: ${constraints.target_min}-${constraints.target_max} ${constraints.unit || 'characters'}`);
    }
    if (constraints.hard_max) {
      lines.push(`- Hard max: ${constraints.hard_max} ${constraints.unit || 'characters'}`);
    }
  }

  if (profile.required_output_fields.length > 0) {
    lines.push('\nREQUIRED OUTPUT FIELDS:');
    profile.required_output_fields.forEach((field) => lines.push(`- ${field}`));
  }

  return lines.join('\n');
}

function formatUserInput(input: UserInput): string {
  const lines = ['=== USER INPUT ==='];

  if (input.topic) lines.push(`TOPIC: ${input.topic}`);
  if (input.audience) lines.push(`AUDIENCE: ${input.audience}`);
  if (input.angle) lines.push(`ANGLE: ${input.angle}`);
  if (input.example) lines.push(`EXAMPLE/REFERENCE: ${input.example}`);
  if (input.cta_preference) lines.push(`CTA PREFERENCE: ${input.cta_preference}`);

  // Idea context (if generating post from idea)
  if (input.idea_title) lines.push(`\nIDEA TITLE: ${input.idea_title}`);
  if (input.idea_hook) lines.push(`IDEA HOOK: ${input.idea_hook}`);
  if (input.idea_outline && input.idea_outline.length > 0) {
    lines.push('IDEA OUTLINE:');
    input.idea_outline.forEach((point, i) => lines.push(`${i + 1}. ${point}`));
  }
  if (input.idea_cta) lines.push(`IDEA CTA: ${input.idea_cta}`);

  return lines.join('\n');
}
