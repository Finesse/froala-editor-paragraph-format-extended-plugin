const fs = require('fs');
const babel = require('babel-core');
const uglifyES = require('uglify-es');
const {version} = require('../package.json');

const copyrightNotice = '/**\n' +
	' * Froala Editor Paragraph Format Extended plugin ' + version + ' (https://github.com/FinesseRus/froala-editor-paragraph-format-extended-plugin)\n' +
	' * Copyright 2016-2018 Surgie Finesse\n' +
	' * Licensed under the MIT license\n' +
	' */\n';

new Promise((resolve, reject) => {
	babel.transformFile('./src/paragraph_format_extended.js', {
		presets: [
			['env', {
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
			}]
		],
		plugins: [
			'transform-object-rest-spread',
			['transform-es2015-modules-umd', {
				globals: {
					jquery: 'jQuery',
					'froala-editor': 'jQuery.fn.froalaEditor'
				},
				exactGlobals: true
			}]
		]
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
	.then(code => uglifyES.minify(code))
	.then(({code}) => new Promise((resolve, reject) => {
		fs.writeFile('./dist/paragraph_format_extended.min.js', copyrightNotice + code, error => {
			if (error) return reject(error);
			resolve(code);
		});
	}));
