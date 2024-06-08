const path = require('path');

/** @type { import('@storybook/preact-vite').StorybookConfig } */
const config = {
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/preact-vite',
    options: {},
  },
  staticDirs: ['../mock'],
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  viteFinal(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      // vite can't resolve path like '!../css/style.css'
      '!..': () => '..',
    };

    return config;
  },
};

export default config;
