/**
 * Media Query Composable
 * 
 * Provides reactive media query breakpoints for responsive design.
 * 
 * @version 2.0.0
 */

import { ref, onMounted, onUnmounted, computed } from 'vue';

// Breakpoint definitions
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440
};

/**
 * Use media query hook
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} Reactive breakpoint state
 */
export function useMediaQuery(options = {}) {
  const {
    mobileBreakpoint = BREAKPOINTS.mobile,
    tabletBreakpoint = BREAKPOINTS.tablet,
    desktopBreakpoint = BREAKPOINTS.desktop
  } = options;

  // State
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 768);

  /**
   * Update window dimensions
   */
  const updateDimensions = () => {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  };

  /**
   * Handle window resize
   */
  const handleResize = () => {
    updateDimensions();
  };

  // Setup resize listener
  onMounted(() => {
    updateDimensions();
    window.addEventListener('resize', handleResize);
    console.log('📱 Media query initialized:', {
      width: windowWidth.value,
      height: windowHeight.value
    });
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  // Computed breakpoint states
  const isMobile = computed(() => windowWidth.value < tabletBreakpoint);
  const isTablet = computed(() => 
    windowWidth.value >= tabletBreakpoint && windowWidth.value < desktopBreakpoint
  );
  const isDesktop = computed(() => windowWidth.value >= desktopBreakpoint);
  const isWide = computed(() => windowWidth.value >= BREAKPOINTS.wide);
  
  const isSmallMobile = computed(() => windowWidth.value < mobileBreakpoint);
  const isTouchDevice = computed(() => 
    'ontouchstart' in window || navigator.maxTouchPoints > 0
  );

  // Orientation
  const isPortrait = computed(() => windowHeight.value > windowWidth.value);
  const isLandscape = computed(() => windowWidth.value > windowHeight.value);

  // Device type string
  const deviceType = computed(() => {
    if (isMobile.value) return 'mobile';
    if (isTablet.value) return 'tablet';
    return 'desktop';
  });

  return {
    // Dimensions
    windowWidth,
    windowHeight,
    
    // Breakpoints
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isSmallMobile,
    
    // Device info
    isTouchDevice,
    isPortrait,
    isLandscape,
    deviceType
  };
}

/**
 * Use orientation hook
 * 
 * @returns {Object} Orientation state
 */
export function useOrientation() {
  const orientation = ref(
    typeof window !== 'undefined' && window.screen?.orientation?.type || 'portrait-primary'
  );

  const handleOrientationChange = () => {
    orientation.value = window.screen.orientation.type;
    console.log('🔄 Orientation changed:', orientation.value);
  };

  onMounted(() => {
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }
  });

  onUnmounted(() => {
    if (window.screen?.orientation) {
      window.screen.orientation.removeEventListener('change', handleOrientationChange);
    }
  });

  const isPortrait = computed(() => orientation.value.includes('portrait'));
  const isLandscape = computed(() => orientation.value.includes('landscape'));

  return {
    orientation,
    isPortrait,
    isLandscape
  };
}

/**
 * Use touch gestures hook
 * 
 * @returns {Object} Touch gesture handlers
 */
export function useTouchGestures() {
  const touchStart = ref(null);
  const touchEnd = ref(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEnd.value = null;
    touchStart.value = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    };
  };

  const onTouchMove = (e) => {
    touchEnd.value = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  };

  const onTouchEnd = (callbacks = {}) => {
    if (!touchStart.value || !touchEnd.value) return;

    const distanceX = touchStart.value.x - touchEnd.value.x;
    const distanceY = touchStart.value.y - touchEnd.value.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    // Horizontal swipes
    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        callbacks.onSwipeLeft?.();
      } else {
        callbacks.onSwipeRight?.();
      }
    }

    // Vertical swipes
    if (isVerticalSwipe && Math.abs(distanceY) > minSwipeDistance) {
      if (distanceY > 0) {
        callbacks.onSwipeUp?.();
      } else {
        callbacks.onSwipeDown?.();
      }
    }

    // Tap (quick touch with minimal movement)
    const duration = Date.now() - touchStart.value.time;
    const movement = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    
    if (duration < 200 && movement < 10) {
      callbacks.onTap?.();
    }

    touchStart.value = null;
    touchEnd.value = null;
  };

  const enableTouchGestures = (element = document.body, callbacks = {}) => {
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: true });
    element.addEventListener('touchend', () => onTouchEnd(callbacks), { passive: true });

    console.log('👆 Touch gestures enabled');

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  };

  return {
    enableTouchGestures,
    touchStart,
    touchEnd
  };
}

/**
 * Responsive utility functions
 */
export const responsive = {
  /**
   * Check if viewport matches media query
   * 
   * @param {string} query - Media query string
   * @returns {boolean} Whether query matches
   */
  matches(query) {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  },

  /**
   * Get current breakpoint name
   * 
   * @returns {string} Breakpoint name
   */
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width < BREAKPOINTS.mobile) return 'xs';
    if (width < BREAKPOINTS.tablet) return 'sm';
    if (width < BREAKPOINTS.desktop) return 'md';
    if (width < BREAKPOINTS.wide) return 'lg';
    return 'xl';
  },

  /**
   * Check if dark mode is preferred
   * 
   * @returns {boolean} Whether dark mode is preferred
   */
  prefersDarkMode() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  /**
   * Check if reduced motion is preferred
   * 
   * @returns {boolean} Whether reduced motion is preferred
   */
  prefersReducedMotion() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};
