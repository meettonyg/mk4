<?php
/**
 * GMKB Post Types - DEPRECATED
 *
 * This file previously registered gmkb_pitch and gmkb_interview CPTs.
 *
 * ARCHITECTURAL DECISION (2025-12):
 * We do NOT use separate CPTs for Pitches or Interviews.
 * Instead, data is synced from existing plugin tables via bridge hooks:
 * - Pitches: wp_guestify_messages (guestify-email-outreach plugin)
 * - Interviews: wp_pit_opportunities (Podcast Interview Tracker plugin)
 *
 * The onboarding system tracks counts via user meta:
 * - guestify_total_pitches_sent
 * - guestify_total_interview_entries
 *
 * See: system/class-onboarding-sync.php for bridge implementation
 *
 * @package GMKB
 * @since 3.0.0
 * @deprecated 3.0.1 CPTs removed in favor of bridge pattern
 */

if (!defined('ABSPATH')) {
    exit;
}

// This file is intentionally empty.
// The guest_profile CPT is registered in system/core-schema.php
