<?php
/**
 * GMKB Logger - Centralized Logging System
 *
 * Replaces scattered error_log() calls with level-based logging.
 * Level is auto-detected from WordPress/plugin constants:
 *
 *   GMKB_LOG_LEVEL (explicit)  > GMKB_VERBOSE_LOG (debug)  > WP_DEBUG (info)  > default (error)
 *
 * Usage:
 *   GMKB_Logger::error('Save failed', ['post_id' => $id]);
 *   GMKB_Logger::warning('Deprecated endpoint called');
 *   GMKB_Logger::info('Media kit saved for post ' . $id);
 *   GMKB_Logger::debug('Params', $params);
 *   GMKB_Logger::startup('ComponentDiscovery loaded');
 *   GMKB_Logger::exception($e, 'During save');
 *
 * @package GMKB
 * @since 4.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Logger {

    const LEVEL_NONE    = 0;
    const LEVEL_ERROR   = 1;
    const LEVEL_WARNING = 2;
    const LEVEL_INFO    = 3;
    const LEVEL_DEBUG   = 4;

    /** @var int|null Cached log level for this request */
    private static $level = null;

    /**
     * Resolve the active log level (once per request).
     */
    private static function level() {
        if (self::$level !== null) {
            return self::$level;
        }

        if (defined('GMKB_LOG_LEVEL')) {
            self::$level = (int) GMKB_LOG_LEVEL;
        } elseif (defined('GMKB_VERBOSE_LOG') && GMKB_VERBOSE_LOG) {
            self::$level = self::LEVEL_DEBUG;
        } elseif (defined('WP_DEBUG') && WP_DEBUG) {
            self::$level = self::LEVEL_INFO;
        } else {
            self::$level = self::LEVEL_ERROR;
        }

        return self::$level;
    }

    /**
     * Write a log line.
     */
    private static function write($label, $message, $context = null) {
        $line = '[GMKB] [' . $label . '] ' . $message;
        error_log($line);

        if ($context !== null && !empty($context)) {
            error_log('[GMKB]   ' . (is_string($context) ? $context : wp_json_encode($context)));
        }
    }

    /**
     * Always logged. Use for real failures.
     */
    public static function error($message, $context = []) {
        if (self::level() < self::LEVEL_ERROR) {
            return;
        }
        self::write('ERROR', $message, $context ?: null);
    }

    /**
     * Log an exception with optional context message.
     */
    public static function exception($exception, $message = '') {
        if (self::level() < self::LEVEL_ERROR) {
            return;
        }

        $msg = $message ? $message . ': ' . $exception->getMessage() : $exception->getMessage();
        self::write('ERROR', $msg, [
            'file' => $exception->getFile() . ':' . $exception->getLine(),
        ]);

        if (self::level() >= self::LEVEL_DEBUG) {
            error_log('[GMKB]   Trace: ' . $exception->getTraceAsString());
        }
    }

    /**
     * Logged when WP_DEBUG is on. Use for notable but non-fatal issues.
     */
    public static function warning($message, $context = []) {
        if (self::level() < self::LEVEL_WARNING) {
            return;
        }
        self::write('WARNING', $message, $context ?: null);
    }

    /**
     * Logged when WP_DEBUG is on. Use for operational events (saves, API calls).
     */
    public static function info($message) {
        if (self::level() < self::LEVEL_INFO) {
            return;
        }
        self::write('INFO', $message);
    }

    /**
     * Logged only when GMKB_VERBOSE_LOG is on. Use for param dumps, field lists.
     */
    public static function debug($message, $data = null) {
        if (self::level() < self::LEVEL_DEBUG) {
            return;
        }
        self::write('DEBUG', $message, $data);
    }

    /**
     * Logged only when GMKB_VERBOSE_LOG is on. Use for init/boot messages.
     */
    public static function startup($message) {
        if (self::level() < self::LEVEL_DEBUG) {
            return;
        }
        self::write('STARTUP', $message);
    }
}
