const fs = require('fs');
const babel = require('babel-core');
const babelPresetES2015 = require('babel-preset-es2015');
const babelPresetES2016 = require('babel-preset-es2016');
const babelPresetES2017 = require('babel-preset-es2017');
const babelPluginTransformRestSpread = require('babel-plugin-transform-object-rest-spread');
const babelPluginTransformUMD = require('babel-plugin-transform-es2015-modules-umd');
const uglifyJS = require('uglify-js');

const copyrightNotice = '/**\n' +
	' * Froala Editor Paragraph Format Extended plugin v0.0.1 (https://github.com/FinesseRus/froala-editor-paragraph-format-extended-plugin)\n' +
	' * Copyright 2016-2018 Surgie Finesse\n' +
	' * Licensed under the MIT license\n' +
	' */\n';

new Promise((resolve, reject) => {
	babel.transformFile('./src/paragraph_format_extended.js', {
		presets: [babelPresetES2017, babelPresetES2016, babelPresetES2015],
		plugins: [babelPluginTransformRestSpread, [babelPluginTransformUMD, {
			globals: {
				jquery: 'jQuery',
				'froala-editor': 'jQuery.fn.froalaEditor'
			}
		}]]
	}, (error, {code}) => {
		if (error) return reject(error);
		resolve(code);
	});
})
	.then(code => new Promise((resolve, reject) => {
		fs.writeFile('./dist/paragraph_format_extended.js', copyrightNotice + code, error => {
			if (error) return reject(error);
			resolve(code);
		});
	}))
	.then(code => uglifyJS.minify(code))
	.then(({code}) => new Promise((resolve, reject) => {
		fs.writeFile('./dist/paragraph_format_extended.min.js', copyrightNotice + code, error => {
			if (error) return reject(error);
			resolve(code);
		});
	}));
