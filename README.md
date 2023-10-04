# Storycap

[storybook]: https://github.com/storybooks/storybook
[puppeteer]: https://github.com/GoogleChrome/puppeteer

![DEMO](https://raw.githubusercontent.com/reg-viz/storycap/artwork/demo_v2.gif)

[![npm](https://img.shields.io/npm/v/storycap.svg?style=flat-square)](https://www.npmjs.com/package/storycap)

> A [Storybook][storybook] Addon, Save the screenshot image of your stories :camera: via [Puppeteer][puppeteer].

Storycap crawls your Storybook and takes screenshot images.
It is primarily responsible for image generation necessary for Visual Testing such as [reg-suit](https://github.com/reg-viz/reg-suit).

<!-- toc -->

- [Features](#features)
- [Install](#install)
- [Getting Started](#getting-started)
  - [Managed mode](#managed-mode)
    - [Setup Storybook](#setup-storybook)
    - [Setup your stories(optional)](#setup-your-storiesoptional)
    - [Run `storycap` Command](#run-storycap-command)
- [API](#api)
  - [`withScreenshot`](#withscreenshot)
  - [type `ScreenshotOptions`](#type-screenshotoptions)
  - [type `Variants`](#type-variants)
  - [type `Viewport`](#type-viewport)
  - [function `isScreenshot`](#function-isscreenshot)
- [Command Line Options](#command-line-options)
- [Multiple PNGs from 1 story](#multiple-pngs-from-1-story)
  - [Basic usage](#basic-usage)
  - [Variants composition](#variants-composition)
  - [Parallelisation across multiple computers](#parallelisation-across-multiple-computers)
- [Tips](#tips)
  - [Run with Docker](#run-with-docker)
  - [Full control the screenshot timing](#full-control-the-screenshot-timing)
- [Chromium version](#chromium-version)
- [Storybook compatibility](#storybook-compatibility)
  - [Storybook versions](#storybook-versions)
  - [UI frameworks](#ui-frameworks)
- [Migration](#migration)
- [How it works](#how-it-works)
- [Examples](#examples)
- [TODO](#todo)
- [Contributing](#contributing)
- [License](#license)

<!-- tocstop -->

## Features

- :camera: Take screenshots of each stories. via [Puppeteer][puppeteer].
- :zap: Extremely fast.
- :package: Zero configuration.
- :rocket: Provide flexible screenshot shooting options.
- :tada: Independent of any UI framework(React, Angular, Vue, etc...)

## Install

```sh
$ npm install storycap
```

Or

```sh
$ npm install storycap puppeteer
```

Installing puppeteer is optional. See [Chromium version](#chromium-version) to get more detail.

## Getting Started

Storycap runs with 2 modes. One is "simple" and another is "managed".

With the simple mode, you don't need to configure your Storybook. All you need is give Storybook's URL, such as:

```sh
$ npx storycap http://localhost:9001
```

You can launch your server via `--serverCmd` option.

```sh
$ storycap --serverCmd "start-storybook -p 9001" http://localhost:9001
```

Of course, you can use pre-built Storybook:

```sh
$ build-storybook -o dist-storybook
$ storycap --serverCmd "npx http-server dist-storybook -p 9001" http://localhost:9001
```

Also, Storycap can crawls built and hosted Storybook pages:

```sh
$ storycap https://next--storybookjs.netlify.app/vue-kitchen-sink/
```

### Managed mode

#### Setup Storybook

If you want to control how stories are captured (timing or size or etc...), use managed mode.

First, add `storycap` to your Storybook config file:

```js
/* .storybook/main.js */

module.exports = {
  stories: ['../src/**/*.stories.@(js|mdx)'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    'storycap', // <-- Add storycap
  ],
};
```

Next, use `withScreenshot` decorator to tell how Storycap captures your stories.

```js
/* .storybook/preview.js */

import { withScreenshot } from 'storycap';

export const decorators = [
  withScreenshot, // Registration the decorator is required
];

export const parameters = {
  // Global parameter is optional.
  screenshot: {
    // Put global screenshot parameters(e.g. viewport)
  },
};
```

**Note:** You can set configuration of screenshot with `addParameters` and `screenshot` key.

**Note:** Storycap also supports notation of legacy Storybook decorator such as `addDecorator(withScreenshot({/* some options */})`. But using decorator as function is deprecated and not recommended. See [Storybook's migration guide](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#options-addon-deprecated) if you want more details.

#### Setup your stories(optional)

And you can overwrite the global screenshot options in specific stories file via `parameters`.

```js
import React from 'react';
import MyComponent from './MyComponent';

export default {
  title: 'MyComponent',
  parameters: {
    screenshot: {
      delay: 200,
    },
  },
};

export const normal = () => <MyComponent />;
export const small = () => <MyComponent text="small" />;
small.story = {
  parameters: {
    screenshot: {
      viewport: 'iPhone 5',
    },
  },
};
```

Of course Storycap works well with CSF 3.0 notation.

```js
import React from 'react';
import MyComponent from './MyComponent';

export default {
  title: 'MyComponent',
  component: MyComponent,
  parameters: {
    screenshot: {
      delay: 200,
    },
  },
};

export const Normal = {};

export const Small = {
  args: {
    text: 'small',
  },
  parameters: {
    screenshot: {
      viewport: 'iPhone 5',
    },
  },
};
```

#### Run `storycap` Command

```sh
$ npx start-storybook -p 9009
$ npx storycap http://localhost:9009
```

Or you can exec with one-liner via `--serverCmd` option:

```sh
$ npx storycap http://localhost:9009 --serverCmd "start-storybook -p 9009"
```

## API

### `withScreenshot`

```typescript
withScreenshot(opt?: ScreenshotOptions): Function;
```

A Storybook decorator to notify Storycap to captures stories.

**Note:** Using `withScreenshot` as function is deprecated. Use `addParameters` if you give screenshot options.

### type `ScreenshotOptions`

`ScreenshotOptions` object is available as the value of the key `screenshot` of `addParameters` argument or `withScreenshot` argument.

```ts
interface ScreenshotOptions {
  delay?: number;                           // default 0 msec
  waitAssets?: boolean;                     // default true
  waitFor?: string | () => Promise<void>;   // default ""
  fullPage?: boolean;                       // default true
  hover?: string;                           // default ""
  focus?: string;                           // default ""
  click?: string;                           // default ""
  skip?: boolean;                           // default false
  viewport?: Viewport;
  viewports?: string[] | { [variantName]: Viewport };
  variants?: Variants;
  waitImages?: boolean;                     // default true
  omitBackground?: boolean;                 // default false
  captureBeyondViewport?: boolean;          // default true
  clip?: { x: number; y: number; width: number; height: number } | null; // default null
}
```

- `delay`: Waiting time [msec] before capturing.
- `waitAssets`: If set true, Storycap waits until all resources requested by the story, such as `<img>` or CSS background images, are finished.
- `waitFor` : If you set a function to return `Promise`, Storycap waits the promise is resolved. You can also set a name of global function that returns `Promise`.
- `fullPage`: If set true, Storycap captures the entire page of stories.
- `focus`: If set a valid CSS selector string, Storycap captures after focusing the element matched by the selector.
- `hover`: If set a valid CSS selector string, Storycap captures after hovering the element matched by the selector.
- `click`: If set a valid CSS selector string, Storycap captures after clicking the element matched by the selector.
- `skip`: If set true, Storycap cancels capturing corresponding stories.
- `viewport`, `viewports`: See type `Viewport` section below.
- `variants`: See type `Variants` section below.
- `waitImages`: Deprecated. Use `waitAssets`. If set true, Storycap waits until `<img>` in the story are loaded.
- `omitBackground`: If set true, Storycap omits the background of the page allowing for transparent screenshots. Note the storybook theme will need to be transparent as well.
- `captureBeyondViewport`: If set true, Storycap captures screenshot beyond the viewport. See also [Puppeteer API docs](https://github.com/puppeteer/puppeteer/blob/v13.1.3/docs/api.md#pagescreenshotoptions).
- `clip`: If set, Storycap captures only the portion of the screen bounded by x/y/width/height.

### type `Variants`

`Variants` is used to generate [multiple PNGs from 1 story](#multiple-pngs-from-1-story).

```ts
type Variants = {
  [variantName: string]: {
    extends?: string | string[]; // default: ""
    delay?: number;
    waitAssets?: boolean;
    waitFor?: string | () => Promise<void>;
    fullPage?: boolean;
    hover?: string;
    focus?: string;
    click?: string;
    skip?: boolean;
    viewport?: Viewport;
    waitImages?: boolean;
    omitBackground?: boolean;
    captureBeyondViewport?: boolean;
    clip?: { x: number; y: number; width: number; height: number } | null;
  };
};
```

- `extends`: If set other variant's name(or an array of names of them), this variant extends the other variant options. And this variant generates a PNG file with suffix such as `_${parentVariantName}_${thisVariantName}`.

### type `Viewport`

`Viewport` is compatible for [Puppeteer viewport interface](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetviewportviewport).

```ts
type Viewport =
  | string
  | {
      width: number; // default: 800
      height: number; // default: 600
      deviceScaleFactor: ?number; // default: 1,
      isMobile?: boolean; // default: false,
      hasTouch?: boolean; // default: false,
      isLandscape?: boolean; // default: false,
    };
```

**Note:** You should choose a valid [device name](https://github.com/puppeteer/puppeteer/blob/main/src/common/DeviceDescriptors.ts) if set string.

`Viewport` values are available in `viewports` field such as:

```js
addParameters({
  screenshot: {
    viewports: {
      large: {
        width: 1024,
        height: 768,
      },
      small: {
        width: 375,
        height: 668,
      },
      xsmall: {
        width: 320,
        height: 568,
      },
    },
  },
});
```

### function `isScreenshot`

```typescript
function isScreenshot(): boolean;
```

Returns whether current process runs in Storycap browser. It's useful to change your stories' behavior only in Storycap (e.g. disable JavaScript animation).

## Command Line Options

<!-- inject:clihelp -->

```txt
usage: storycap [options] storybook_url

Options:
      --help                       Show help                                                                   [boolean]
      --version                    Show version number                                                         [boolean]
  -o, --outDir                     Output directory.                               [string] [default: "__screenshots__"]
  -p, --parallel                   Number of browsers to screenshot.                               [number] [default: 4]
  -f, --flat                       Flatten output filename.                                   [boolean] [default: false]
  -i, --include                    Including stories name rule.                                    [array] [default: []]
  -e, --exclude                    Excluding stories name rule.                                    [array] [default: []]
      --delay                      Waiting time [msec] before screenshot for each story.           [number] [default: 0]
  -V, --viewport                   Viewport.                                              [array] [default: ["800x600"]]
      --disableCssAnimation        Disable CSS animation and transition.                       [boolean] [default: true]
      --disableWaitAssets          Disable waiting for requested assets                       [boolean] [default: false]
      --trace                      Emit Chromium trace files per screenshot.                  [boolean] [default: false]
      --silent                                                                                [boolean] [default: false]
      --verbose                                                                               [boolean] [default: false]
      --forwardConsoleLogs         Forward in-page console logs to the user's console.        [boolean] [default: false]
      --serverCmd                  Command line to launch Storybook server.                       [string] [default: ""]
      --serverTimeout              Timeout [msec] for starting Storybook server.               [number] [default: 60000]
      --shard                      The sharding options for this run. In the format <shardNumber>/<totalShards>.
                                   <shardNumber> is a number between 1 and <totalShards>. <totalShards> is the total
                                   number of computers working.                                [string] [default: "1/1"]
      --captureTimeout             Timeout [msec] for capture a story.                          [number] [default: 5000]
      --captureMaxRetryCount       Number of count to retry to capture.                            [number] [default: 3]
      --metricsWatchRetryCount     Number of count to retry until browser metrics stable.       [number] [default: 1000]
      --viewportDelay              Delay time [msec] between changing viewport and capturing.    [number] [default: 300]
      --reloadAfterChangeViewport  Whether to reload after viewport changed.                  [boolean] [default: false]
      --stateChangeDelay           Delay time [msec] after changing element's state.               [number] [default: 0]
      --listDevices                List available device descriptors.                         [boolean] [default: false]
  -C, --chromiumChannel            Channel to search local Chromium. One of "puppeteer", "canary", "stable", "*"
                                                                                                 [string] [default: "*"]
      --chromiumPath               Executable Chromium path.                                      [string] [default: ""]
      --puppeteerLaunchConfig      JSON string of launch config for Puppeteer.
               [string] [default: "{ "args": ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] }"]

Examples:
  storycap http://localhost:9009
  storycap http://localhost:9009 -V 1024x768 -V 320x568
  storycap http://localhost:9009 -i "some-kind/a-story"
  storycap http://example.com/your-storybook -e "**/default" -V iPad
  storycap --serverCmd "start-storybook -p 3000" http://localhost:3000

```

<!-- endinject -->

## Multiple PNGs from 1 story

By default, storycap generates 1 screenshot image from 1 story. Use `variants` if you want multiple PNGs(e.g. viewports, element's states variation, etc...) for 1 story.

### Basic usage

For example:

```js
import React from 'react';
import MyComponent from './MyButton';

export default {
  title: 'MyButton',
};

export const normal = () => <MyButton />;
normal.story = {
  parameters: {
    screenshot: {
      variants: {
        hovered: {
          hover: 'button.my-button',
        },
      },
    },
  },
};
```

The above configuration generates 2 PNGs:

- `MyButton/normal.png`
- `MyButton/normal_hovered.png`

The variant key, `hovered` in the above example, is used as suffix of the generated PNG file name. And the almost all `ScreenshotOptions` fields are available as fields of variant value.

**Note:** `variants` itself and `viewports` are prohibited as variant's field.

### Variants composition

You can composite multiple variants via `extends` field.

```js
normal.story = {
  parameters: {
    screenshot: {
      variants: {
        small: {
          viewport: 'iPhone 5',
        },
        hovered: {
          extends: 'small',
          hover: 'button.my-button',
        },
      },
    },
  },
};
```

The above example generates the following:

- `MyButton/normal.png` (default
- `MyButton/normal_small.png` (derived from the `small` variant
- `MyButton/normal_hovered.png` (derived from the `hovered` variant
- `MyButton/normal_small_hovered.png` (derived from the `hovered` and `small` variant

**Note:** You can extend some viewports with keys of `viewports` option because the `viewports` field is expanded to variants internally.

### Parallelisation across multiple computers

To process more stories in parallel across multiple computers, the `shard` argument can be used.

The `shard` argument is a string of the format: `<shardNumber>/<totalShards>`. `<shardNumber>` is a number between 1 and `<totalShards>`, inclusive. `<totalShards>` is the total number of computers running the execution.

For example, a run with `--shard 1/1` would be considered the default behaviour on a single computer. Two computers each running `--shard 1/2` and `--shard 2/2` respectively would split the stories across two computers.

Stories are distributed across shards in a round robin fashion when ordered by their ID. If a series of stories 'close together' are slower to screenshot than others, they should be distributed evenly.

## Tips

### Run with Docker

Use [regviz/node-xcb](https://cloud.docker.com/u/regviz/repository/docker/regviz/node-xcb).

Or create your Docker base image such as:

```Dockerfile
FROM node:12

RUN apt-get update -y
RUN apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

### Full control the screenshot timing

Sometimes you may want to full-manage the timing of performing screenshot.
Use the `waitFor` option if you think so. This string parameter should points a global function to return `Promise`.

For example, the following setting tells storycap to wait for resolving of `fontLoading`:

```html
<!-- ./storybook/preview-head.html -->
<link rel="preload" href="/some-heavy-asset.woff" as="font" onload="this.setAttribute('loaded', 'loaded')" />
<script>
  function fontLoading() {
    const loaded = () => !!document.querySelector('link[rel="preload"][loaded="loaded"]');
    if (loaded()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const id = setInterval(() => {
        if (!loaded()) return;
        clearInterval(id);
        resolve();
      }, 50);
    });
  }
</script>
```

```js
/* .storybook/config.js */
import { addParameters, addDecorator } from '@storybook/react';
import { withScreenshot } from 'storycap';

addDecorator(withScreenshot);
addParameters({
  screenshot: {
    waitFor: 'fontLoading',
  },
});
```

## Chromium version

Since v3.0.0, Storycap does not use Puppeteer directly. Instead, Storycap searches Chromium binary in the following order:

1. Installed Puppeteer package (if you installed explicitly)
1. Canary Chrome installed locally
1. Stable Chrome installed locally

You can change search channel with `--chromiumChannel` option or set executable Chromium file path with `--chromiumPath` option.

## Storybook compatibility

### Storybook versions

Storycap is tested with the followings versions:

- Simple mode:
  - [x] Storybook v5.x
  - [x] Storybook v6.x
- Managed mode:
  - [x] Storybook v5.x
  - [x] Storybook v6.x

See also packages in `examples` directory.

### UI frameworks

Storycap (with both simple and managed mode) is agnostic for specific UI frameworks(e.g. React, Angular, Vue.js, etc...). So you can use it with Storybook with your own favorite framework :smile: .

## Migration

See [migration guide](./MIGRATION.md) if you already use [storybook-chrome-screenshot](https://www.npmjs.com/package/storybook-chrome-screenshot) or [zisui](https://www.npmjs.com/package/zisui).

## How it works

Storycap accesses the launched page using [Puppeteer][puppeteer].

<!--
## Examples

- [tsuyoshiwada/scs-with-reg-viz](https://github.com/tsuyoshiwada/scs-with-reg-viz) : A example repository of visual regression test using storycap and reg-suit.
- [Quramy/angular-sss-demo](https://github.com/Quramy/angular-sss-demo) : Storybook, Screenshot, and Snapshot testing for Angular
- [viswiz-io/viswiz-tutorial-storybook](https://github.com/viswiz-io/viswiz-tutorial-storybook) : A tutorial repository for setting up visual regression testing with VisWiz.io
-->

## TODO

The following tasks remain. Contributes are welcome :smiley:

- [x] Upgrade v2
- [x] Extract crawler as a NPM package.
- [ ] More unit testing.
- [ ] Capture with JS/CSS coverages.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT © reg-viz](./LICENSE)
