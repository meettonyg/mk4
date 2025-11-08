<template>
  <div class="carousel-wrapper">
    <swiper
      :modules="modules"
      :slides-per-view="slidesPerView"
      :space-between="spaceBetween"
      :autoplay="autoplayConfig"
      :navigation="settings.arrows !== false"
      :pagination="paginationConfig"
      :loop="settings.infinite !== false"
      :breakpoints="breakpoints"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
      class="gmkb-carousel"
    >
      <swiper-slide 
        v-for="(item, index) in items" 
        :key="index"
      >
        <slot name="item" :item="item" :index="index"></slot>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  settings: {
    type: Object,
    default: () => ({
      autoplay: true,
      autoplaySpeed: 3000,
      slidesToShow: 3,
      slidesToShowTablet: 2,
      slidesToShowMobile: 1,
      infinite: true,
      arrows: true,
      dots: true
    })
  },
  spaceBetween: {
    type: Number,
    default: 20
  }
});

const modules = [Navigation, Pagination, Autoplay];
const swiperInstance = ref(null);

const slidesPerView = computed(() => props.settings.slidesToShow || 3);

const autoplayConfig = computed(() => {
  if (props.settings.autoplay === false) return false;
  
  return {
    delay: props.settings.autoplaySpeed || 3000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true
  };
});

const paginationConfig = computed(() => {
  if (props.settings.dots === false) return false;
  
  return {
    clickable: true,
    dynamicBullets: true
  };
});

const breakpoints = computed(() => ({
  320: {
    slidesPerView: props.settings.slidesToShowMobile || 1,
    spaceBetween: 10
  },
  768: {
    slidesPerView: props.settings.slidesToShowTablet || 2,
    spaceBetween: 15
  },
  1024: {
    slidesPerView: props.settings.slidesToShow || 3,
    spaceBetween: props.spaceBetween
  }
}));

const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
};

const onSlideChange = () => {
  // Optional: Analytics tracking could go here
  // console.log('Slide changed');
};

// Expose for parent component
defineExpose({
  swiper: swiperInstance,
  next: () => swiperInstance.value?.slideNext(),
  prev: () => swiperInstance.value?.slidePrev(),
  slideTo: (index) => swiperInstance.value?.slideTo(index)
});
</script>

<style scoped>
.carousel-wrapper {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.gmkb-carousel {
  width: 100%;
  padding-bottom: 40px; /* Space for pagination dots */
}

/* Custom carousel styling to match theme */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: var(--gmkb-primary-color, #3b82f6);
  background: rgba(255, 255, 255, 0.9);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 18px;
  font-weight: bold;
}

:deep(.swiper-pagination-bullet) {
  width: 10px;
  height: 10px;
  background: #cbd5e1;
  opacity: 1;
  transition: all 0.3s ease;
}

:deep(.swiper-pagination-bullet-active) {
  background: var(--gmkb-primary-color, #3b82f6);
  width: 24px;
  border-radius: 5px;
}

/* Dark mode support */
body.dark-mode :deep(.swiper-button-next),
body.dark-mode :deep(.swiper-button-prev) {
  background: rgba(30, 41, 59, 0.9);
  color: #60a5fa;
}

body.dark-mode :deep(.swiper-button-next:hover),
body.dark-mode :deep(.swiper-button-prev:hover) {
  background: rgba(30, 41, 59, 1);
}

body.dark-mode :deep(.swiper-pagination-bullet) {
  background: #475569;
}

body.dark-mode :deep(.swiper-pagination-bullet-active) {
  background: #60a5fa;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    width: 32px;
    height: 32px;
  }
  
  :deep(.swiper-button-next::after),
  :deep(.swiper-button-prev::after) {
    font-size: 14px;
  }
}
</style>
