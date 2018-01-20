# [Froala Editor](http://github.com/froala/wysiwyg-editor/) Paragraph Format Extended plugin

This is a plugin for [Froala Editor](https://www.froala.com/wysiwyg-editor/), a mixture of the `paragraphFormat` and 
`paragraphStyle` plugins with some extended features. It lets set a tag name, a class and an id to a paragraph from a 
list of formats.


## Getting started

1. [Download plugin](https://github.com/FinesseRus/froala-paragraph-format-extended/archive/master.zip).

2. Include JS file to your HTML:

```html
<!-- Froala Editor required stuff -->
<link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
<link href="../css/froala_editor.min.css" rel="stylesheet" type="text/css" />
<link href="../css/froala_style.min.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script type="text/javascript" src="../js/froala_editor.min.js"></script>

<!-- paragraphFormatExt plugin -->
<script type="text/javascript" src="../js/plugins/paragraph_format_ext.min.js"></script>
```

3. Create editor, add `paragraphFormatExt` button to the toolbar and set up formats list:

```html
<textarea id="editor"></textarea>

<srcipt type="text/javascript">
	$( '#editor' ).froalaEditor({
		toolbarButtons: $.FroalaEditor.DEFAULTS.toolbarButtons.concat([ 'paragraphFormatExt' ]),
		paragraphFormatExt: [
			{ title: 'Normal' },
			{ tag: 'h1', title: 'Heading 1'	},
			{ tag: 'h2', title: 'Heading 2'	},
			{ tag: 'h2', 'class': 'fr-text-bordered', title: 'Header 2 bordered' },
			{ tag: 'pre', id: 'code', title: 'Code' }
		]
	});
</srcipt>
```

## Reference

The name of the toolbar button of this plugin is `paragraphFormatExt`.

When paragraph format is changed by user via dropdown the `class` and `id` attributes of selected paragraphs are purged and replaced by chosen format values even if they are not set.

### Options

#### paragraphFormatExt

**Type**: `Array`

**Default value:**

```javascript
[
	{ title: 'Normal' },
	{ tag: 'h1', title: 'Heading 1'	},
	{ tag: 'h2', title: 'Heading 2'	},
	{ tag: 'h3', title: 'Heading 3'	},
	{ tag: 'h4', title: 'Heading 4'	},
	{ tag: 'h4', 'class': 'fr-text-bordered', title: 'Header 4 bordered' },
	{ tag: 'pre', title: 'Code'	}
]
```

An list with the formats that will appear in the Paragraph Format Extended dropdown from the toolbar. Array items are objects with this properties:

* `title` (String, required) — Format title that is shown in the dropdown. It is [translated by Froala Editor](https://www.froala.com/wysiwyg-editor/docs/methods#language.translate) before displaying;
* `tag` (String|Null) — Paragraph tag name. If `null` or nothing is provided the default editor tag is used;
* `class` (String|Null) — Paragraph CSS class name. May contain multiple classes devided by space;
* `id` (String|Null) — The value of paragraph `id` HTML attribute.

#### paragraphFormatExtSelection

**Type**: `Boolean`

**Default value:** `false`

Should the Paragraph Format Extended button from the toolbar be replaced with a dropdown showing the actual paragraph format name for the current text selection.


## License

This package is available under MIT License. However, in order to use Froala WYSIWYG HTML Editor plugin you should purchase a license for it.

See https://froala.com/wysiwyg-editor/pricing for licensing the Froala Editor.


## P.S.

You are welcome to ask questions and post suggestions.