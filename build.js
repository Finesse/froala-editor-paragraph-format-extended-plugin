const {writeFile} = require('fs');
const {promisify} = require('util');
const babel = require('@babel/core');
const terser = require('terser');
const {version, author, homepage} = require('./package.json');

const writeFileAsync = promisify(writeFile);

const copyrightNotice = `/**
 * Froala Editor Paragraph Format Extended plugin v${version} (${homepage})
 * Copyright 2016-${new Date().getFullYear()} ${author.name}
 * Licensed under the MIT license
 */
`;

const babelEnvPresetConfig = {
  targets: {
    // According to https://github.com/froala/wysiwyg-editor#browser-support
    browsers: [
      'last 2 Chrome major versions',
      'last 2 Edge major versions',
      'last 2 Firefox major versions',
      'last 2 Safari major versions',
      'last 2 Opera major versions',
      'IE >= 10',
      'last 2 iOS major versions',
      'last 2 ChromeAndroid major versions',
      'last 2 FirefoxAndroid major versions',
      'last 2 Android major versions'
    ]
  }
};
const babelPlugins = [];

async function buildCJS() {
  // Building the full CommonJS code
  let {code} = await babel.transformFileAsync('./src/paragraph_format_extended.js', {
    presets: [
      ['@babel/preset-env', {
        ...babelEnvPresetConfig,
        modules: 'cjs'
      }]
    ],
    plugins: [
      ...babelPlugins,
      '@babel/plugin-transform-runtime'
    ]
  });
  await writeFileAsync('./dist/paragraph_format_extended.cjs.js', copyrightNotice + code);
  console.log('`dist/paragraph_format_extended.cjs.js` has been built');
}

async function buildUMD() {
  // Building the full UMD code
  code = (await promisify(babel.transformFile)('./src/paragraph_format_extended.js', {
    presets: [
      ['@babel/preset-env', babelEnvPresetConfig]
    ],
    plugins: [
      ...babelPlugins,
      ['@babel/plugin-transform-modules-umd', {
        globals: {
          jquery: 'jQuery',
          'froala-editor': 'jQuery.fn.froalaEditor'
        },
        exactGlobals: true
      }]
    ]
  })).code;
  await writeFileAsync('./dist/paragraph_format_extended.umd.js', copyrightNotice + code);
  console.log('`dist/paragraph_format_extended.umd.js` has been built');

  // Building the minified UMD code
  code = terser.minify(code).code;
  writeFileAsync('./dist/paragraph_format_extended.umd.min.js', copyrightNotice + code);
  console.log('`dist/paragraph_format_extended.umd.min.js` has been built');
}

buildCJS();
buildUMD();
