<?php
/**
 * GMKB AI Configuration - Prompts, Templates, and Settings
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Centralized configuration for all AI generation types.
 *
 * Ported from: media-kit-content-generator/aigen/includes/services/class-mkcg-config.php
 *
 * @package GMKB
 * @subpackage AI
 * @version 1.0.0
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_AI_Config {

    /**
     * System prompts for each content type
     * @var array
     */
    private $system_prompts = array();

    /**
     * User prompt templates for each content type
     * @var array
     */
    private $prompt_templates = array();

    /**
     * Temperature settings for each content type
     * @var array
     */
    private $temperatures = array();

    /**
     * Max token settings for each content type
     * @var array
     */
    private $max_tokens = array();

    /**
     * Constructor
     */
    public function __construct() {
        $this->initialize_system_prompts();
        $this->initialize_prompt_templates();
        $this->initialize_settings();
    }

    /**
     * Initialize system prompts for each content type
     */
    private function initialize_system_prompts() {
        $this->system_prompts = array(

            'biography' => 'You are an expert professional biography writer specializing in creating compelling bios for speakers, authors, consultants, and thought leaders. You craft biographies that:
- Establish credibility and expertise
- Connect emotionally with the target audience
- Highlight unique value propositions
- Are written in the requested person perspective (1st, 2nd, or 3rd)
- Match the requested tone (professional, conversational, inspirational)
- Vary appropriately by length (short: 50-75 words, medium: 150-200 words, long: 300-400 words)

Always write in clear, engaging prose without bullet points unless specifically requested.',

            'topics' => 'You are an expert content strategist who creates compelling interview and speaking topics for thought leaders. You understand what makes topics:
- Attention-grabbing for podcast hosts and event organizers
- Valuable for audiences seeking transformation
- Unique to the speaker\'s expertise and methodology
- Timely and relevant to current conversations

Generate topics that position the speaker as an authority while promising clear value to listeners.',

            'questions' => 'You are a seasoned podcast interviewer and media trainer who creates interview questions that:
- Draw out compelling stories and insights
- Allow the guest to showcase their expertise naturally
- Progress from introductory to deeper topics
- Include both broad and specific questions
- Help hosts conduct engaging, valuable interviews

Create questions that are open-ended and invite storytelling, not just yes/no answers.',

            'tagline' => 'You are a branding expert who creates memorable taglines and positioning statements. Your taglines:
- Are concise (under 10 words ideal)
- Communicate unique value clearly
- Are memorable and quotable
- Differentiate from competitors
- Resonate emotionally with the target audience

Create taglines that could work as a signature line, email signature, or social media bio.',

            'guest_intro' => 'You are a professional master of ceremonies and event host who writes guest introductions. Your introductions:
- Build anticipation and excitement
- Establish credibility concisely
- Include key achievements and credentials
- Flow naturally when read aloud
- Make the audience eager to hear from the guest

Write introductions that a podcast host or event MC could read verbatim.',

            'offers' => 'You are a business strategist who creates compelling service packages and offers. Your packages:
- Clearly communicate value and outcomes
- Are structured with clear deliverables
- Address specific pain points
- Include appropriate pricing frameworks
- Create urgency without being pushy

Create offers that make the decision to work together feel obvious and valuable.',

            'authority_hook' => 'You are a positioning expert who creates compelling authority hooks using the "I help [who] achieve [what] when [when] by [how] in [where] because [why]" framework. Your hooks:
- Clearly identify the target audience
- Promise specific, desirable outcomes
- Explain the unique methodology
- Create emotional resonance
- Are concise yet comprehensive

Create hooks that immediately establish expertise and relevance.',

            'impact_intro' => 'You are a personal branding expert who creates powerful impact introductions that lead with results and mission. Your impact intros:
- Lead with specific, quantifiable achievements and results
- Connect achievements to a compelling mission or purpose
- Create immediate credibility through demonstrated impact
- Are conversational and memorable when spoken aloud
- Follow the formula: "I\'ve [WHERE/results]. My mission is [WHY/purpose]."

Create impact introductions that make people want to know more about how you achieved your results.'
        );
    }

    /**
     * Initialize user prompt templates for each content type
     */
    private function initialize_prompt_templates() {
        $this->prompt_templates = array(

            'biography' => 'Create a {{length}} biography for {{name}}.

Authority/Expertise: {{authorityHook}}

Requirements:
- Write in {{pov}} person
- Use a {{tone}} tone
- Focus on establishing credibility and connecting with readers
- Include the key elements from their authority statement

{{#if length == "short"}}
Write a concise bio of 50-75 words suitable for social media profiles or brief introductions.
{{/if}}

{{#if length == "medium"}}
Write a standard bio of 150-200 words suitable for speaker profiles, book jackets, or professional websites.
{{/if}}

{{#if length == "long"}}
Write a comprehensive bio of 300-400 words suitable for press kits, detailed speaker pages, or formal introductions.
{{/if}}',

            'topics' => 'Generate 10 podcast interview topic TITLES for this expert:

Authority Hook: {{authorityHook}}
Additional Expertise: {{expertise}}

CRITICAL REQUIREMENTS:
- Each topic must be a SHORT title (8-15 words max)
- NO descriptions, explanations, or elaborations after the title
- NO bullet points or sub-items
- Topics should be intriguing and results-driven
- Use specific frameworks, numbers, or contrarian angles

FORMAT: Numbered list with ONLY the topic title on each line.

GOOD examples (short, punchy titles):
1. The 3-Step Framework for Landing High-Profile Podcast Interviews
2. Why Most Experts Fail at Podcast Outreach
3. Converting Podcast Appearances into High-Ticket Clients

BAD example (DO NOT do this - too long):
1. The 90-Day Revenue Revolution - This topic highlights the speaker\'s unique system...

Generate 10 SHORT topic titles now:',

            'questions' => 'Generate 25 interview questions for a podcast guest with this background:

Authority Hook: {{authorityHook}}
Topics they discuss: {{topics}}

Requirements:
- Start with 5 introductory questions (background, journey, what led them here)
- Include 10 expertise questions (diving deep into their methodology and insights)
- Include 5 story-based questions (asking for specific examples and case studies)
- End with 5 actionable questions (what listeners can do, resources, next steps)

Format: Return as a numbered list (1-25), with each question on its own line.',

            'tagline' => 'Create 5 tagline options for someone with this positioning:

Authority Hook: {{authorityHook}}
Name: {{name}}

Requirements:
- Each tagline should be under 10 words
- Vary the approaches: some benefit-focused, some identity-focused, some methodology-focused
- Make them memorable and quotable
- Ensure they work in various contexts (social bio, email signature, business card)

Tone: {{tone}}

Format: Return as a numbered list (1-5), with each tagline on its own line.',

            'guest_intro' => 'Write a compelling guest introduction for:

Name: {{name}}
Biography: {{biography}}
Credentials: {{credentials}}
Tagline: {{tagline}}

Requirements:
- Keep it to 100-150 words
- Build anticipation for what the guest will share
- Include 2-3 key credentials or achievements
- End with a warm welcome statement
- Write so it can be read aloud naturally by a host

Format: Write as a single flowing paragraph that a podcast host or MC could read verbatim.',

            'offers' => 'Create service package descriptions for someone who:

Authority Hook: {{authorityHook}}
Services offered: {{services}}

Requirements:
- Create 3 tiered packages (entry, signature, premium)
- Each package should have a compelling name
- Include 3-5 specific deliverables per package
- Focus on outcomes and transformations
- Suggest relative pricing positioning (not specific numbers)

Format: Structure each package with a name, description, deliverables, and ideal client.',

            'authority_hook' => 'Generate {{count}} compelling authority hook variations using this EXACT information:

WHO I help: {{who}}
WHAT result I deliver: {{what}}
WHEN they need help: {{when}}
HOW I help them (my method): {{how}}

CRITICAL REQUIREMENTS:
1. Each hook MUST incorporate the specific details provided above
2. Use the core structure: "I help [WHO] [achieve WHAT] [WHEN context] through [HOW method]"
3. Create {{count}} DIFFERENT variations with different angles/phrasings
4. Each hook should be 1-2 sentences, under 50 words
5. Make them conversational and natural to say out loud
6. Vary the emphasis: some lead with WHO, some with WHAT, some with HOW

FORMAT: Return as a numbered list (1-{{count}}), with ONLY the hook statement on each line.

GOOD example using the provided info:
1. I help [actual WHO value] [actual WHAT value] [actual WHEN value] through [actual HOW value].

BAD example (DO NOT make up different info):
1. I help overwhelmed entrepreneurs regain focus... (WRONG - uses made up data, not the provided WHO/WHAT/WHEN/HOW)

Generate {{count}} hook variations NOW using ONLY the information provided above:',

            'impact_intro' => 'Generate {{count}} compelling impact introduction variations using this EXACT information:

WHERE (My results/achievements): {{where}}
WHY (My mission/purpose): {{why}}

CRITICAL REQUIREMENTS:
1. Each intro MUST use the specific results and mission provided above
2. Use the core structure: "I\'ve [WHERE - results/achievements]. My mission is [WHY - purpose]."
3. Create {{count}} DIFFERENT variations with different angles/phrasings
4. Each intro should be 2-3 sentences, under 75 words
5. Make them conversational and powerful when spoken aloud
6. Lead with impact - start with results, not credentials
7. Vary the emphasis: some highlight scale, some transformation, some innovation

FORMAT: Return as a numbered list (1-{{count}}), with ONLY the intro statement on each line.

GOOD example using the provided info:
1. I\'ve [actual WHERE value]. My mission is [actual WHY value].

BAD example (DO NOT make up different info):
1. I\'ve helped thousands of people achieve success... (WRONG - uses made up data, not the provided WHERE/WHY)

Generate {{count}} impact intro variations NOW using ONLY the information provided above:'
        );
    }

    /**
     * Initialize temperature and token settings
     */
    private function initialize_settings() {
        // Temperature: Higher = more creative, Lower = more focused
        $this->temperatures = array(
            'biography' => 0.7,
            'topics' => 0.8,
            'questions' => 0.7,
            'tagline' => 0.9,  // More creative for taglines
            'guest_intro' => 0.6,  // More focused for formal intros
            'offers' => 0.7,
            'authority_hook' => 0.7
        );

        // Max tokens per type
        $this->max_tokens = array(
            'biography' => 1000,  // Longer for multiple lengths
            'topics' => 500,
            'questions' => 2000,  // 25 questions need more space
            'tagline' => 300,
            'guest_intro' => 400,
            'offers' => 1500,
            'authority_hook' => 600,  // Increased for 5 variations
            'impact_intro' => 700     // 5 variations, slightly longer format
        );
    }

    /**
     * Get system prompt for a content type
     *
     * @param string $type Content type
     * @return string System prompt
     */
    public function get_system_prompt($type) {
        return isset($this->system_prompts[$type])
            ? $this->system_prompts[$type]
            : 'You are an AI assistant that generates professional content for media kits and personal branding.';
    }

    /**
     * Get prompt template for a content type
     *
     * @param string $type Content type
     * @return string Prompt template
     */
    public function get_prompt_template($type) {
        return isset($this->prompt_templates[$type])
            ? $this->prompt_templates[$type]
            : 'Generate professional content based on: {{authorityHook}}';
    }

    /**
     * Get temperature setting for a content type
     *
     * @param string $type Content type
     * @return float Temperature (0.0 - 1.0)
     */
    public function get_temperature($type) {
        return isset($this->temperatures[$type])
            ? $this->temperatures[$type]
            : 0.7;
    }

    /**
     * Get max tokens setting for a content type
     *
     * @param string $type Content type
     * @return int Max tokens
     */
    public function get_max_tokens($type) {
        return isset($this->max_tokens[$type])
            ? $this->max_tokens[$type]
            : 500;
    }

    /**
     * Get all available content types
     *
     * @return array Content types
     */
    public function get_content_types() {
        return array_keys($this->system_prompts);
    }

    /**
     * Get field mappings for data integration
     * Used when saving AI-generated content to Pods/post meta
     *
     * @return array Field mappings
     */
    public static function get_field_mappings() {
        return array(
            'biography' => array(
                'short' => 'biography',
                'medium' => 'biography',
                'long' => 'biography_long'
            ),
            'topics' => array(
                'topic_1' => 'topic_1',
                'topic_2' => 'topic_2',
                'topic_3' => 'topic_3',
                'topic_4' => 'topic_4',
                'topic_5' => 'topic_5'
            ),
            'questions' => array(
                'pattern' => 'question_{number}'  // question_1 through question_25
            ),
            'authority_hook' => array(
                'who' => 'hook_who',
                'what' => 'hook_what',
                'when' => 'hook_when',
                'how' => 'hook_how',
                'where' => 'hook_where',
                'why' => 'hook_why',
                'complete' => 'authority_hook_complete'
            ),
            'guest_intro' => array(
                'intro' => 'guest_introduction'
            ),
            'tagline' => array(
                'primary' => 'tagline',
                'options' => 'tagline_options'
            )
        );
    }

    /**
     * Get tone options
     *
     * @return array Tone options with labels
     */
    public static function get_tone_options() {
        return array(
            'professional' => 'Professional',
            'conversational' => 'Conversational',
            'inspirational' => 'Inspirational',
            'authoritative' => 'Authoritative',
            'friendly' => 'Friendly & Approachable',
            'bold' => 'Bold & Confident'
        );
    }

    /**
     * Get length options
     *
     * @return array Length options with labels
     */
    public static function get_length_options() {
        return array(
            'short' => 'Short (50-75 words)',
            'medium' => 'Medium (150-200 words)',
            'long' => 'Long (300-400 words)'
        );
    }

    /**
     * Get POV (point of view) options
     *
     * @return array POV options with labels
     */
    public static function get_pov_options() {
        return array(
            'first' => 'First Person (I/My)',
            'second' => 'Second Person (You/Your)',
            'third' => 'Third Person (He/She/They)'
        );
    }
}
