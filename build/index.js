const fs = require('fs');
const rollup = require('rollup');
const rollupBabel = require('rollup-plugin-babel');
const babel = require('babel-core');
const babelPresetES2015 = require('babel-preset-es2015');
const babelPresetES2016 = require('babel-preset-es2016');
const babelPresetES2017 = require('babel-preset-es2017');
const babelPluginTransformRestSpread = require('babel-plugin-transform-object-rest-spread');
const uglifyJS = require('uglify-js');

const copyrightNotice = '/**\n' +
	' * Froala Editor Paragraph Format Extended plugin v0.0.1\n' +
	' * (https://github.com/FinesseRus/froala-editor-paragraph-format-extended-plugin) Copyright 2016-2018 Surgie Finesse\n' +
	' * Licensed under the MIT license\n' +
	' */\n';

rollup.rollup({
	input: './src/paragraph_format_extended.js',
	plugins: [
		rollupBabel({
			exclude: 'node_modules/**',
			presets: [babelPresetES2017, babelPresetES2016],
			plugins: [babelPluginTransformRestSpread]
		})
	]
})
	.then(bundle => bundle.generate({
		globals: {
			jquery: 'jQuery',
			'froala-editor': 'jQuery.fn.froalaEditor'
		},
		format: 'umd'
	}))
	.then(({code}) => babel.transform(code, {
		presets: [babelPresetES2015]
	}).code)
	.then(code => "(function(){\n" + code + "\n})();")
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
