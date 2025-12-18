/**
 * Tests for ProgressRing component
 *
 * @package GMKB
 * @since 2.2.0
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProgressRing from '@/onboarding/components/ProgressRing.vue';

describe('ProgressRing', () => {
    describe('Rendering', () => {
        it('should render without errors', () => {
            const wrapper = mount(ProgressRing);
            expect(wrapper.exists()).toBe(true);
        });

        it('should display percentage value', () => {
            const wrapper = mount(ProgressRing, {
                props: { percentage: 75 },
            });

            expect(wrapper.text()).toContain('75%');
        });

        it('should display label when provided', () => {
            const wrapper = mount(ProgressRing, {
                props: {
                    percentage: 50,
                    label: 'Progress',
                },
            });

            expect(wrapper.text()).toContain('Progress');
        });

        it('should not display label when not provided', () => {
            const wrapper = mount(ProgressRing, {
                props: { percentage: 50 },
            });

            expect(wrapper.find('.label').exists()).toBe(false);
        });

        it('should render SVG elements', () => {
            const wrapper = mount(ProgressRing);

            expect(wrapper.find('svg').exists()).toBe(true);
            expect(wrapper.findAll('circle')).toHaveLength(2);
        });
    });

    describe('Props', () => {
        it('should use default size of 120', () => {
            const wrapper = mount(ProgressRing);
            const svg = wrapper.find('svg');

            expect(svg.attributes('width')).toBe('120');
            expect(svg.attributes('height')).toBe('120');
        });

        it('should apply custom size', () => {
            const wrapper = mount(ProgressRing, {
                props: { size: 200 },
            });
            const svg = wrapper.find('svg');

            expect(svg.attributes('width')).toBe('200');
            expect(svg.attributes('height')).toBe('200');
        });

        it('should use default stroke width of 10', () => {
            const wrapper = mount(ProgressRing);
            const circles = wrapper.findAll('circle');

            circles.forEach((circle) => {
                expect(circle.attributes('stroke-width')).toBe('10');
            });
        });

        it('should apply custom stroke width', () => {
            const wrapper = mount(ProgressRing, {
                props: { strokeWidth: 15 },
            });
            const circles = wrapper.findAll('circle');

            circles.forEach((circle) => {
                expect(circle.attributes('stroke-width')).toBe('15');
            });
        });

        it('should default percentage to 0', () => {
            const wrapper = mount(ProgressRing);
            expect(wrapper.text()).toContain('0%');
        });
    });

    describe('Progress Calculation', () => {
        it('should calculate correct radius', () => {
            // radius = (size - strokeWidth) / 2
            // With size=120, strokeWidth=10: radius = (120-10)/2 = 55
            const wrapper = mount(ProgressRing, {
                props: { size: 120, strokeWidth: 10 },
            });

            const circle = wrapper.find('.progress-ring-progress');
            expect(circle.attributes('r')).toBe('55');
        });

        it('should calculate correct center', () => {
            // center = size / 2
            const wrapper = mount(ProgressRing, {
                props: { size: 120 },
            });

            const circle = wrapper.find('.progress-ring-progress');
            expect(circle.attributes('cx')).toBe('60');
            expect(circle.attributes('cy')).toBe('60');
        });

        it('should calculate correct circumference', () => {
            // circumference = 2 * PI * radius
            // With radius=55: circumference = 2 * 3.14159 * 55 ≈ 345.58
            const wrapper = mount(ProgressRing, {
                props: { size: 120, strokeWidth: 10 },
            });

            const circle = wrapper.find('.progress-ring-progress');
            const dasharray = parseFloat(circle.attributes('stroke-dasharray'));

            // Allow small floating point difference
            expect(dasharray).toBeCloseTo(2 * Math.PI * 55, 1);
        });

        it('should show full ring at 100%', () => {
            const wrapper = mount(ProgressRing, {
                props: { percentage: 100, size: 120, strokeWidth: 10 },
            });

            const circle = wrapper.find('.progress-ring-progress');
            const offset = parseFloat(circle.attributes('stroke-dashoffset'));

            // At 100%, offset should be 0 (full ring visible)
            expect(offset).toBeCloseTo(0, 1);
        });

        it('should show empty ring at 0%', () => {
            const wrapper = mount(ProgressRing, {
                props: { percentage: 0, size: 120, strokeWidth: 10 },
            });

            const circle = wrapper.find('.progress-ring-progress');
            const offset = parseFloat(circle.attributes('stroke-dashoffset'));
            const circumference = 2 * Math.PI * 55;

            // At 0%, offset should equal circumference (no ring visible)
            expect(offset).toBeCloseTo(circumference, 1);
        });

        it('should show half ring at 50%', () => {
            const wrapper = mount(ProgressRing, {
                props: { percentage: 50, size: 120, strokeWidth: 10 },
            });

            const circle = wrapper.find('.progress-ring-progress');
            const offset = parseFloat(circle.attributes('stroke-dashoffset'));
            const circumference = 2 * Math.PI * 55;

            // At 50%, offset should be half circumference
            expect(offset).toBeCloseTo(circumference * 0.5, 1);
        });
    });

    describe('Reactivity', () => {
        it('should update percentage display when prop changes', async () => {
            const wrapper = mount(ProgressRing, {
                props: { percentage: 25 },
            });

            expect(wrapper.text()).toContain('25%');

            await wrapper.setProps({ percentage: 75 });

            expect(wrapper.text()).toContain('75%');
        });

        it('should update progress offset when percentage changes', async () => {
            const wrapper = mount(ProgressRing, {
                props: { percentage: 0, size: 120, strokeWidth: 10 },
            });

            const circumference = 2 * Math.PI * 55;

            let circle = wrapper.find('.progress-ring-progress');
            expect(parseFloat(circle.attributes('stroke-dashoffset'))).toBeCloseTo(circumference, 1);

            await wrapper.setProps({ percentage: 100 });

            circle = wrapper.find('.progress-ring-progress');
            expect(parseFloat(circle.attributes('stroke-dashoffset'))).toBeCloseTo(0, 1);
        });
    });

    describe('Container Styling', () => {
        it('should set container width and height based on size', () => {
            const wrapper = mount(ProgressRing, {
                props: { size: 150 },
            });

            const container = wrapper.find('.progress-ring-container');
            expect(container.attributes('style')).toContain('width: 150px');
            expect(container.attributes('style')).toContain('height: 150px');
        });
    });

    describe('CSS Classes', () => {
        it('should have progress-ring-container class', () => {
            const wrapper = mount(ProgressRing);
            expect(wrapper.find('.progress-ring-container').exists()).toBe(true);
        });

        it('should have progress-ring class on SVG', () => {
            const wrapper = mount(ProgressRing);
            expect(wrapper.find('.progress-ring').exists()).toBe(true);
        });

        it('should have progress-ring-bg class on background circle', () => {
            const wrapper = mount(ProgressRing);
            expect(wrapper.find('.progress-ring-bg').exists()).toBe(true);
        });

        it('should have progress-ring-progress class on progress circle', () => {
            const wrapper = mount(ProgressRing);
            expect(wrapper.find('.progress-ring-progress').exists()).toBe(true);
        });

        it('should have progress-ring-content class', () => {
            const wrapper = mount(ProgressRing);
            expect(wrapper.find('.progress-ring-content').exists()).toBe(true);
        });

        it('should have percentage class', () => {
            const wrapper = mount(ProgressRing);
            expect(wrapper.find('.percentage').exists()).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle percentage of exactly 0', () => {
            const wrapper = mount(ProgressRing, {
                props: { percentage: 0 },
            });
            expect(wrapper.text()).toContain('0%');
        });

        it('should handle percentage of exactly 100', () => {
            const wrapper = mount(ProgressRing, {
                props: { percentage: 100 },
            });
            expect(wrapper.text()).toContain('100%');
        });

        it('should handle decimal percentages', () => {
            const wrapper = mount(ProgressRing, {
                props: { percentage: 33.33 },
            });
            expect(wrapper.text()).toContain('33.33%');
        });

        it('should handle very small size', () => {
            const wrapper = mount(ProgressRing, {
                props: { size: 40 },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should handle very large size', () => {
            const wrapper = mount(ProgressRing, {
                props: { size: 500 },
            });
            expect(wrapper.exists()).toBe(true);
        });
    });
});
