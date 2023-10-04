module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|mdx)'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links', 'storycap'],
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
};
