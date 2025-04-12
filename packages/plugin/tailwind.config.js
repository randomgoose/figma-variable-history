/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        brand: {
          DEFAULT: 'var(--figma-color-bg-brand)',
          hover: 'var(--figma-color-bg-brand-hover)',
          pressed: 'var(--figma-color-bg-brand-pressed)',
          secondary: 'var(--figma-color-bg-brand-secondary)',
          tertiary: 'var(--figma-color-bg-brand-tertiary)',
        },
        component: {
          DEFAULT: 'var(--figma-color-bg-component)',
          hover: 'var(--figma-color-bg-component-hover)',
          pressed: 'var(--figma-color-bg-component-pressed)',
          secondary: 'var(--figma-color-bg-component-secondary)',
          tertiary: 'var(--figma-color-bg-component-tertiary)',
        },
        danger: {
          DEFAULT: 'var(--figma-color-bg-danger)',
          hover: 'var(--figma-color-bg-danger-hover)',
          pressed: 'var(--figma-color-bg-danger-pressed)',
          secondary: 'var(--figma-color-bg-danger-secondary)',
          tertiary: 'var(--figma-color-bg-danger-tertiary)',
        },
        success: {
          DEFAULT: 'var(--figma-color-bg-success)',
          hover: 'var(--figma-color-bg-success-hover)',
          pressed: 'var(--figma-color-bg-success-pressed)',
          secondary: 'var(--figma-color-bg-success-secondary)',
          tertiary: 'var(--figma-color-bg-success-tertiary)',
        },
        warning: {
          DEFAULT: 'var(--figma-color-bg-warning)',
          hover: 'var(--figma-color-bg-warning-hover)',
          pressed: 'var(--figma-color-bg-warning-pressed)',
          secondary: 'var(--figma-color-bg-warning-secondary)',
          tertiary: 'var(--figma-color-bg-warning-tertiary)',
        },
        selected: {
          DEFAULT: 'var(--figma-color-bg-selected)',
          hover: 'var(--figma-color-bg-selected-hover)',
          pressed: 'var(--figma-color-bg-selected-pressed)',
          secondary: 'var(--figma-color-bg-selected-secondary)',
          tertiary: 'var(--figma-color-bg-selected-tertiary)',
          strong: 'var(--figma-color-bg-selected-strong)',
        },
        disabled: {
          DEFAULT: 'var(--figma-color-bg-disabled)',
          secondary: 'var(--figma-color-bg-disabled-secondary)',
        },
        DEFAULT: 'var(--figma-color-bg)',
        hover: 'var(--figma-color-bg-hover)',
        pressed: 'var(--figma-color-bg-pressed)',
        secondary: 'var(--figma-color-bg-secondary)',
        tertiary: 'var(--figma-color-bg-tertiary)',
        inverse: 'var(--figma-color-bg-inverse)',
      },
      borderColor: {
        brand: {
          DEFAULT: 'var(--figma-color-border-brand)',
          strong: 'var(--figma-color-border-brand-strong)',
        },
        component: {
          DEFAULT: 'var(--figma-color-border-component)',
          hover: 'var(--figma-color-border-component-hover)',
          strong: 'var(--figma-color-border-component-strong)',
        },
        danger: {
          DEFAULT: 'var(--figma-color-border-danger)',
          strong: 'var(--figma-color-border-danger-strong)',
        },
        success: {
          DEFAULT: 'var(--figma-color-border-success)',
          strong: 'var(--figma-color-border-success-strong)',
        },
        warning: {
          DEFAULT: 'var(--figma-color-border-warning)',
          strong: 'var(--figma-color-border-warning-strong)',
        },
        selected: {
          DEFAULT: 'var(--figma-color-border-selected)',
          strong: 'var(--figma-color-border-selected-strong)',
        },
        disabled: {
          DEFAULT: 'var(--figma-color-border-disabled)',
          strong: 'var(--figma-color-border-disabled-strong)',
        },
        DEFAULT: 'var(--figma-color-border)',
        strong: 'var(--figma-color-border-strong)',
      },
      textColor: {
        brand: {
          DEFAULT: 'var(--figma-color-text-brand)',
          secondary: 'var(--figma-color-text-brand-secondary)',
          tertiary: 'var(--figma-color-text-brand-tertiary)',
        },
        component: {
          DEFAULT: 'var(--figma-color-text-component)',
          pressed: 'var(--figma-color-text-component-pressed)',
          secondary: 'var(--figma-color-text-component-secondary)',
          tertiary: 'var(--figma-color-text-component-tertiary)',
        },
        danger: {
          DEFAULT: 'var(--figma-color-text-danger)',
          secondary: 'var(--figma-color-text-danger-secondary)',
          tertiary: 'var(--figma-color-text-danger-tertiary)',
        },
        success: {
          DEFAULT: 'var(--figma-color-text-success)',
          secondary: 'var(--figma-color-text-success-secondary)',
          tertiary: 'var(--figma-color-text-success-tertiary)',
        },
        warning: {
          DEFAULT: 'var(--figma-color-text-warning)',
          secondary: 'var(--figma-color-text-warning-secondary)',
          tertiary: 'var(--figma-color-text-warning-tertiary)',
        },
        selected: {
          DEFAULT: 'var(--figma-color-text-selected)',
          secondary: 'var(--figma-color-text-selected-secondary)',
          tertiary: 'var(--figma-color-text-selected-tertiary)',
        },
        DEFAULT: 'var(--figma-color-text)',
        secondary: 'var(--figma-color-text-secondary)',
        tertiary: 'var(--figma-color-text-tertiary)',
        disabled: 'var(--figma-color-text-disabled)',
        hover: 'var(--figma-color-text-hover)',
      },
      boxShadow: {
        'elevation-500':
          '0 2px 5px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        slideDown: {
          from: { height: '0px' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        slideUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0px' },
        },
        overlayShow: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        contentShow: {
          from: { opacity: '0', transform: 'translate(-50%, -10%) scale(0.96)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        collapsibleSlideDown: {
          from: { height: '0px' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        collapsibleSlideUp: {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0px' },
        },
      },
      animation: {
        slideDown: 'slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        slideUp: 'slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        collapsibleSlideDown: 'collapsibleSlideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        collapsibleSlideUp: 'collapsibleSlideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  plugins: [],
};
