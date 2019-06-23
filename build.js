const {writeFile} = require('fs');
const {promisify} = require('util');
const babel = require('@babel/core');
const terser = require('terser');
const {version, author, homepage, license} = require('./package.json');

const writeFileAsync = promisify(writeFile);

const copyrightNotice = `/**
 * Froala Editor Paragraph Format Extended plugin v${version} (${homepage})
 * Copyright 2016-${new Date().getFullYear()} ${author.name}
 * Licensed under the ${license} license
 */
`;
const babelPlugins = [];

async function buildForNode() {
  // Building the full CommonJS code
  const {code} = await babel.transformFileAsync('./src/paragraph_format_extended.js', {
    presets: [
      ['@babel/preset-env', {
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

async function buildForBrowser() {
  // Building the full UMD code
  let {code} = await babel.transformFileAsync('./src/paragraph_format_extended.js', {
    presets: [
      ['@babel/preset-env']
    ],
    plugins: [
      ...babelPlugins,
      ['@babel/plugin-transform-modules-umd', {
        globals: {
          'froala-editor': 'FroalaEditor'
        },
        exactGlobals: true
      }]
    ]
  });
  await writeFileAsync('./dist/paragraph_format_extended.umd.js', copyrightNotice + code);
  console.log('`dist/paragraph_format_extended.umd.js` has been built');

  // Building the minified UMD code
  code = terser.minify(code).code;
  await writeFileAsync('./dist/paragraph_format_extended.umd.min.js', copyrightNotice + code);
  console.log('`dist/paragraph_format_extended.umd.min.js` has been built');
}

buildForNode();
buildForBrowser();
