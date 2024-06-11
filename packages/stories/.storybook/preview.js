import '@create-figma-plugin/ui/css/fonts.css';
import '@create-figma-plugin/ui/css/theme.css';

/** @type { import('@storybook/preact').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
