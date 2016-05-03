/**
 * A plugin for Froala Editor.
 * Allows users to choose paragraph format (tag name, class, etc.) from a list.
 *
 * @version 1.0
 * @author Finesse <i@f-ph.ru>
 * @license MIT
 * @see https://github.com/FinesseRus/froala-paragraph-format-extended More info
 */

( function ( $ ) {

	/**
	 * @typedef {String} FormatID
	 *
	 * Paragraph format string representation that contains only data that is necessary for text view (tag name,
	 * classes, etc.). The same formats are represented only by the same values. For example formats {tag: 'h1', class:
	 * 'title header'} and {class: ' header title', tag: 'h1'} have the same FormatID representation.
	 */

	/**
	 * @typedef {Object} Format
	 *
	 * Description of paragraph format.
	 *
	 * @prop {String} title Format title (will be translated)
	 * @prop {String|null} [tag] Name of paragraph HTML tag. If not specified default tag is used.
	 * @prop {String|null} [class] List of paragraph classes divided by space
	 * @prop {String|null} [id] HTML `id` attribute value
	 */

	/**
	 * Plugin default options.
	 *
	 * @type {{}}
	 * @prop {Format[]} paragraphFormatExt List of paragraph formats to be in dropdown
	 * @prop {boolean} [paragraphFormatExtSelection=false] Whether format name of currently selected paragraph should be displayed in the toolbar instead of icon
	 *
	 * @see https://www.froala.com/wysiwyg-editor/docs/concepts/create-plugin More info
	 */
	$.FroalaEditor.DEFAULTS = $.extend( $.FroalaEditor.DEFAULTS, {
		paragraphFormatExt: [
			{ title: 'Normal' },
			{ tag: 'h1', title: 'Heading 1'	},
			{ tag: 'h2', title: 'Heading 2'	},
			{ tag: 'h3', title: 'Heading 3'	},
			{ tag: 'h4', title: 'Heading 4'	},
			{ tag: 'h4', 'class': 'fr-text-bordered', title: 'Header 4 bordered' },
			{ tag: 'pre', title: 'Code'	}
		],
		paragraphFormatExtSelection: false
	});

	/**
	 * The plugin.
	 *
	 * @param {FroalaEditor} editor The Froala Editor instance
	 * @see https://www.froala.com/wysiwyg-editor/docs/concepts/create-plugin More info
	 */
	$.FroalaEditor.PLUGINS.paragraphFormatExt = function( editor )
	{
		/**
		 * Applies format to the currently selected paragraphs.
		 *
		 * @param {FormatID} id Format data
		 */
		function apply( id )
		{
			var format = getIDFormat( id ),
				tag = format.tag || editor.html.defaultTag(),
				doNeedBlock = format.class || format.id;

			editor.selection.save();
			editor.html.wrap( true, true, true, true );
			editor.selection.restore();

			var $blocks = $( editor.selection.blocks() );

			// `editor.selection.blocks` returns nested blocks. We need to process only deepest childs to prevent
			// multiple style applying for nested blocks. This array keeps the list of original and processed blocks. So
			// if processing block contains any block from this list, it is skipped.
			var $blocksToCheck = $blocks;

			editor.selection.save();
			editor.$el.find( 'pre' ).attr( 'skip', true );

			$blocks.each( function( _, block )
			{
				if ( editor.node.isList( block ) )
					return;

				var $block = $( block ),
					$blockNew,
					substitute;

				if ( $block.find( $blocksToCheck ).length )
					return;

				if ( $block.is( 'li' ))
					substitute = substituteLi;
				else if ( $block.parent().is( 'li' ))
					substitute = substituteLiChild;
				else if ( $block.parent().is( 'td, th' ))
					substitute = substituteTableCellChild;
				else
					substitute = substituteOther;

				$blockNew = substitute( $block, tag, doNeedBlock );

				if ( $blockNew ) {
					$blockNew.attr({
						'class':	format.class || null,
						id:			format.id || null
					});
					$blocksToCheck = $blocksToCheck.add( $blockNew );
				}
			});

			editor.$el
				.find( 'pre:not([skip="true"]) + pre:not([skip="true"])' )
				.each( function() {
					$( this ).prev().append( '<br>' + $( this ).html() );
					$( this ).remove();
				});
			editor.$el.find( 'pre' ).removeAttr( 'skip' );
			editor.html.unwrap();
			editor.selection.restore();
		}

		/**
		 * Updates toolbar dropdown view in order to correspond currently selected block format.
		 *
		 * @param {jQuery} $dropdown Dropdown DOM object
		 */
		function refreshDropdown( $dropdown )
		{
			var blocks = editor.selection.blocks(),
				query = getElementFormatIDs( blocks[ 0 ] )
					.map( function( FormatID )
					{
						return '.fr-command[data-param1="' + FormatID + '"]'
					})
					.join( ', ' );

			$dropdown.find( query ).addClass( "fr-active" );
		}

		/**
		 * Updates toolbar button view in order to correspond currently selected block format.
		 *
		 * @param {jQuery} $button Button DOM object
		 */
		function refreshButton( $button )
		{
			if ( !editor.opts.paragraphFormatExtSelection )
				return;

			var blocks = editor.selection.blocks(),
				FormatIDs = getElementFormatIDs( blocks[ 0 ] ),
				formats = editor.opts.paragraphFormatExt,
				title = "\u2014";	// M-dash

			for ( var i = 0; i < formats.length; ++i )
				if ( FormatIDs.indexOf( getFormatID( formats[ i ] ) ) !== -1 ) {
					title = editor.language.translate( formats[ i ].title );
					break;
				}

			$button.find( '> span' ).text( title );
		}

		/**
		 * Determines formats that correspond to specified DOM element.
		 *
		 * @param {HTMLElement} elem DOM element
		 * @returns {FormatID[]} Formats
		 */
		function getElementFormatIDs( elem )
		{
			var tagDefault = editor.html.defaultTag(),
				format, formats;

			if ( elem instanceof HTMLElement ) {
				format = {
					tag: 		elem.tagName.toLowerCase(),
					id:			elem.getAttribute( 'id' ),
					'class':	elem.getAttribute( 'class' )
				};

				if ([ 'li', 'td', 'th' ].indexOf( format.tag ) !== -1 )
					format.tag = tagDefault
			} else {
				format = { tag:	tagDefault };
			}

			formats = [ format ];

			if ( format.tag === tagDefault )
				formats.push( $.extend({}, format, {
					tag: null
				}) );

			return formats.map( getFormatID );
		}

		/**
		 * Wraps content of LI element in DOM element with specified tag name (if tag name is not default tag).
		 *
		 * @param {jQuery} $block LI element
		 * @param {String} tag Tag name of wrapping element
		 * @param {boolean} [requireBlock=false] Wrapping is always required (event if tag name is default tag)
		 * @returns {jQuery} Wrapping element
		 */
		function substituteLi( $block, tag, requireBlock )
		{
			if ( ( !tag || tag.toLowerCase() === editor.html.defaultTag() ) && !requireBlock )
				return $block;

			var $blockNew;

			if ( $block.find( 'ul, ol' ).length > 0 )
			{
				$blockNew = $( '<' + tag + '>' );
				$block.prepend( $blockNew );

				for ( var child = editor.node.contents( $block[ 0 ] )[ 0 ]; child && [ 'ul', 'ol' ].indexOf( child.tagName.toLowerCase() ) === -1; )
				{
					var next = child.nextSibling;
					$blockNew.append( child );
					child = next;
				}
			}
			else
			{
				$blockNew = $( '<' + tag + '>' ).html( $block.html() );
				$block.html( $blockNew );
			}

			return $blockNew;
		}

		/**
		 * Wraps content of direct LI child in DOM element with specified tag name. Content is just unwrapped if tag
		 * name is default tag.
		 *
		 * @param {jQuery} $block DOM element with content to wrap
		 * @param {String} tag Tag name of wrapping element
		 * @param {boolean} [requireBlock=false] Wrapping is always required (event if tag name is default tag)
		 * @returns {jQuery|null} Wrapping element (if wrapping is done)
		 */
		function substituteLiChild( $block, tag, requireBlock )
		{
			if ( tag.toLowerCase() === editor.html.defaultTag() && !requireBlock ) {
				$block.replaceWith( $block.html() );
				return null;
			}

			return substituteOther( $block, tag, requireBlock );
		}

		/**
		 * Wraps content of direct TD or TH child in DOM element with specified tag name. Content is just unwrapped if
		 * tag name is default tag.
		 *
		 * @param {jQuery} $block DOM element with content to wrap
		 * @param {String} tag Tag name of wrapping element
		 * @param {boolean} [requireBlock=false] Wrapping is always required (event if tag name is default tag)
		 * @returns {jQuery|null} Wrapping element (if wrapping is done)
		 */
		function substituteTableCellChild( $block, tag, requireBlock )
		{
			if ( tag.toLowerCase() === editor.html.defaultTag() && !requireBlock ) {
				if ( !editor.node.isEmpty( $block[ 0 ], true ) )
					$block.append( '<br/>' );

				$block.replaceWith( $block.html() );
				return null;
			}

			return substituteOther( $block, tag, requireBlock );
		}

		/**
		 * Changes DOM element tag name.
		 *
		 * @param {jQuery} $block DOM element to change tag name
		 * @param {String} tag New tag name
		 * @returns {jQuery} Element with changed tag name
		 */
		function substituteOther( $block, tag )
		{
			if ( !tag )
				tag = 'div class="fr-temp-div"' + ( editor.node.isEmpty( $block[ 0 ], true ) ? ' data-empty="true"' : '' );

			var $blockNew = $( '<' + tag + ' ' + editor.node.attributes( $block[ 0 ] ) + '>' ).html( $block.html() );
			$block.replaceWith( $blockNew );
			return $blockNew;
		}

		return {
			apply: apply,
			refreshButton: refreshButton,
			refreshDropdown: refreshDropdown
		};
	};

	/**
	 * Defining a plugin button icon.
	 *
	 * @see https://www.froala.com/wysiwyg-editor/docs/concepts/custom-button More info
	 */
	$.FroalaEditor.DefineIcon( 'paragraphFormatExt', { NAME: 'paragraph' });

	/**
	 * Defining a plugin button.
	 *
	 * @see https://www.froala.com/wysiwyg-editor/docs/concepts/custom-button More info
	 */
	$.FroalaEditor.RegisterCommand( 'paragraphFormatExt', {

		/**
		 * Action type.
		 */
		type: 'dropdown',

		/**
		 * Button title.
		 */
		title: 'Paragraph Format',

		/**
		 * Linked plugin (this plugin).
		 */
		plugin: 'paragraphFormatExt',

		/**
		 * Determines whether dropdown selection should be displayed on button.
		 *
		 * @param {FroalaEditor} editor The Froala Editor instance
		 * @returns {boolean}
		 */
		displaySelection: function( editor )
		{
			return editor.opts.paragraphFormatExtSelection;
		},

		/**
		 * Text displayed on button until selection format is determined (any text is selected in editor). Is used if
		 * `displaySelection` returns `true`.
		 */
		defaultSelection: 'Format',

		/**
		 * Button width in pixels. Is used if `displaySelection` returns `true`.
		 */
		displaySelectionWidth: 100,

		/**
		 * Builds dropdown content.
		 *
		 * @returns {String} HTML content
		 */
		html: function()
		{
			var html = '<ul class="fr-dropdown-list">',
				formats = this.opts.paragraphFormatExt;

			for ( var i = 0; i < formats.length; ++i )
			{
				var format = $.extend({}, formats[ i ]);
				format.title = this.language.translate( format.title );

				var tag      = format.tag || this.html.defaultTag();
				var formatId = getFormatID( format );

				html += '<li>' +
					'<' + tag + ( format[ 'class' ] ? ' class="'+format[ 'class' ]+'"' : '' ) + ' style="padding: 0 !important; margin: 0 !important;">' +
					'<a class="fr-command" data-cmd="paragraphFormatExt" data-param1="' + formatId + '" title="' + format.title + '">' +
					format.title +
					'</a>' +
					'</' + tag + '>' +
					'</li>';
			}

			return html + '</ul>';
		},

		/**
		 * Handles dropdown list item click.
		 *
		 * @param {String} command Command name
		 * @param {value} value Dropdown item `data-param1` attribute content
		 */
		callback: function( command, value )
		{
			this.paragraphFormatExt.apply( value )
		},

		/**
		 * Systems calls this action when toolbar button view might needs to be updated.
		 *
		 * @param {jQuery} $button Toolbar button DOM element
		 */
		refresh: function( $button )
		{
			this.paragraphFormatExt.refreshButton( $button )
		},

		/**
		 * Systems calls this action when toolbar dropdown is opened.
		 *
		 * @param {jQuery} $button Toolbar button DOM element
		 * @param {jQuery} $dropdown Toolbar dropdown DOM element
		 */
		refreshOnShow: function( $button, $dropdown )
		{
			this.paragraphFormatExt.refreshDropdown( $dropdown )
		}
	});

	/**
	 * Converts paragraph format description to unique format representation.
	 *
	 * @param {Format} format
	 * @returns {FormatID}
	 */
	function getFormatID( format )
	{
		var str = '';

		if ( format.tag )
			str += format.tag.toLowerCase();

		if ( format.id )
			str += '#' + format.id;

		if ( format[ 'class' ] )
			str += ( format[ 'class' ] instanceof Array ? format[ 'class' ] : String( format[ 'class' ] ).split( /\s+/ ) )
				.filter( function( part ) { return part; })
				.sort()
				.map( function( part ) { return '.' + part })
				.join();

		return str;
	}

	/**
	 * Converts unique format representation to paragraph format description.
	 *
	 * @param {FormatID} id
	 * @returns {Format}
	 */
	function getIDFormat( id )
	{
		var parts = /([^\.#]*)(#[^\.]+|.{0})(\.[\s\S]+|.{0})/.exec( id );

		if ( parts )
			return {
				tag: 		parts[ 1 ].toLowerCase() || null,
				id:			parts[ 2 ].slice( 1 ) || null,
				'class':	parts[ 3 ].split( '.' ).filter( function( part ) { return part; }).join( ' ' ) || null
			};

		return {};
	}

})( jQuery );
