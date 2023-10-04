// Annoyingly, this file is occasionally run without webpack (e.g. when
// calling `react-scripts test --setupFiles ./setupFile.js`), which
// prevents us from relying on our Webpack config to alias the
// 'storycap' module to our custom '@remix/storycap' module.
import { withScreenshot } from '@remix/storycap';

export const decorators = [
  withScreenshot,
];

export const parameters = {
  screenshot: {
    viewports: {
      LARGE: {
        width: 1200,
        height: 800,
      },
      SMALL: {
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        isMobile: true,
      },
    },
  },
};
