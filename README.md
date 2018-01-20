# [Froala Editor](http://github.com/froala/wysiwyg-editor/) Paragraph Format Extended plugin

A plugin for [Froala Editor](https://www.froala.com/wysiwyg-editor/) that allows to choose paragraph format (tag name, 
class, etc.) from a list. It is like a mixture of the `paragraphFormat` and the `paragraphStyle` plugins with some 
extended features.


## Installation

### Plain

Download the [plugin script](https://github.com/FinesseRus/froala-editor-paragraph-format-extended-plugin/blob/master/dist/paragraph_format_extended.min.js)
and import it using a `<script>` tag after the Froala Editor import.

```html
<!-- Froala Editor required stuff -->
<link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
<link href="//cdnjs.cloudflare.com/ajax/libs/froala-editor/2.7.3/css/froala_editor.css" rel="stylesheet" type="text/css" />
<link href="//cdnjs.cloudflare.com/ajax/libs/froala-editor/2.7.3/css/froala_style.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/froala-editor/2.7.3/js/froala_editor.min.js"></script>

<!-- Paragraph Format Extended plugin -->
<script type="text/javascript" src="//cdn.jsdelivr.net/npm/froala-editor-paragraph-format-extended-plugin@0.1.0/dist/paragraph_format_extended.min.js"></script>
```

### AMD/RequireJS

The script requires the following AMD modules to be available:

* `jquery` — jQuery.
* `froala-editor` — the Froala Editor main script.

Installation:

```js
require.config({
    paths: {
        jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min',
        'froala-editor': '//cdnjs.cloudflare.com/ajax/libs/froala-editor/2.7.3/js/froala_editor.min',
        'froala-editor-paragraph-format-extended-plugin': '//cdn.jsdelivr.net/npm/froala-editor-paragraph-format-extended-plugin@0.1.0/dist/paragraph_format_extended.min'
    }
});

define('myModule', ['jquery', 'froala-editor-paragraph-format-extended-plugin'], function ($) {
    // ...
});
```

You can find more information about installation of Froala Editor using AMD [there](https://github.com/froala/wysiwyg-editor/issues/690).

### NPM

Install the plugin:

```bash
npm install froala-editor-paragraph-format-extended-plugin --save
```

Require it:

```js
const $ = require('jquery');
require('froala-editor-paragraph-format-extended-plugin');
```

## Basic usage

Create an editor, add a `paragraphFormatExtended` button to the toolbar and set up the formats list:

```html
<textarea id="editor"></textarea>
```
```js
$('#editor').froalaEditor({
    toolbarButtons: $.FroalaEditor.DEFAULTS.toolbarButtons.concat(['paragraphFormatExtended']),
    paragraphFormatExtended: [
        {title: 'Normal'},
        {tag: 'h1', title: 'Heading 1'},
        {tag: 'h2', title: 'Heading 2'},
        {tag: 'h2', 'class': 'fr-text-bordered', title: 'Header 2 bordered'},
        {tag: 'pre', id: 'code', title: 'Code'}
    ]
});
```

## Reference

The name of the toolbar button of this plugin is `paragraphFormatExtended`.

When a paragraph format is changed by the user via the dropdown, the `class` and `id` attributes of the selected 
paragraphs are purged and replaced with the chosen format values even if they are not set.

### Options

#### paragraphFormatExtended

**Type**: `Array`

**Default value:**

```js
[
    {title: 'Normal'},
    {tag: 'h1', title: 'Heading 1'},
    {tag: 'h2', title: 'Heading 2'},
    {tag: 'h3', title: 'Heading 3'},
    {tag: 'h4', title: 'Heading 4'},
    {tag: 'h4', 'class': 'fr-text-bordered', title: 'Header 4 bordered'},
    {tag: 'pre', title: 'Code'}
]
```

A list with the formats that will appear in the Paragraph Format Extended dropdown from the toolbar. Array items are 
objects with the following attributes:

* `title` (String, required) — Format title that is shown in the dropdown. It is [translated by Froala Editor](https://www.froala.com/wysiwyg-editor/docs/methods#language.translate) before displaying.
* `tag` (String|Null) — Paragraph tag name. If `null` or nothing is provided the default editor tag is used.
* `class` (String|Null) — Paragraph CSS class name. May contain multiple classes devided by space.
* `id` (String|Null) — The value of paragraph `id` HTML attribute.

#### paragraphFormatExtendedSelection

**Type**: `Boolean`

**Default value:** `false`

Should the Paragraph Format Extended button from the toolbar be replaced with a dropdown showing the actual paragraph format name for the current text selection.

### Building

The source code is located in the `src` directory. Do the following to modify and compile it:

1. Install [node.js](https://nodejs.org/).
2. Open a console, go to the project root directory and run `npm install`.
3. Run `npm run build` to compile distribution files from the source files.


## Versions compatibility

The project follows the [Semantic Versioning](http://semver.org).


## License

This package is available under MIT License. However, in order to use Froala WYSIWYG HTML Editor plugin you should purchase a license for it.

See https://froala.com/wysiwyg-editor/pricing for licensing the Froala Editor.
