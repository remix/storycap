module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    'storycap',
    '@storybook/preset-create-react-app',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  webpackFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          storycap: '@remix/storycap',
        }
      }
    };
  },
  docs: {
    autodocs: true
  }
};
