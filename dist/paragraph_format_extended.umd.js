/**
 * Froala Editor Paragraph Format Extended plugin v0.2.0 (https://github.com/Finesse/froala-editor-paragraph-format-extended-plugin)
 * Copyright 2016-2019 Surgie Finesse
 * Licensed under the MIT license
 */
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["froala-editor"], factory);
  } else if (typeof exports !== "undefined") {
    factory(require("froala-editor"));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.FroalaEditor);
    global.paragraph_format_extended = mod.exports;
  }
})(this, function (_froalaEditor) {
  "use strict";

  _froalaEditor = _interopRequireDefault(_froalaEditor);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
   * @prop {Format[]} paragraphFormatExtended List of paragraph formats to be in dropdown
   * @prop {boolean} [paragraphFormatExtendedSelection=false] Whether format name of currently selected paragraph should
   *   be displayed in the toolbar instead of icon
   *
   * @see https://www.froala.com/wysiwyg-editor/docs/concepts/create-plugin More info
   */
  _froalaEditor.default.DEFAULTS = _objectSpread({}, _froalaEditor.default.DEFAULTS, {
    paragraphFormatExtended: [{
      title: 'Normal'
    }, {
      tag: 'h1',
      title: 'Heading 1'
    }, {
      tag: 'h2',
      title: 'Heading 2'
    }, {
      tag: 'h3',
      title: 'Heading 3'
    }, {
      tag: 'h4',
      title: 'Heading 4'
    }, {
      tag: 'h4',
      'class': 'fr-text-bordered',
      title: 'Header 4 bordered'
    }, {
      tag: 'pre',
      title: 'Code'
    }],
    paragraphFormatExtendedSelection: false
  });
  /**
   * The plugin.
   *
   * @param {FroalaEditor} editor The Froala Editor instance
   * @see https://www.froala.com/wysiwyg-editor/docs/concepts/create-plugin More info
   */

  _froalaEditor.default.PLUGINS.paragraphFormatExtended = function (editor) {
    /**
     * It's a jQuery instance. The official plugins do the same.
     */
    var $ = editor.$;
    /**
     * Applies format to the currently selected paragraphs.
     *
     * @param {FormatID} id Format data
     */

    function apply(id) {
      var format = getIdFormat(id);
      var tag = format.tag || editor.html.defaultTag();
      var doesNeedBlock = format.class || format.id;
      editor.selection.save();
      editor.html.wrap(true, true, true, true, true);
      editor.selection.restore();
      var blocks = editor.selection.blocks(); // `editor.selection.blocks` returns nested blocks. We need to process only deepest children to prevent
      // multiple style applying for nested blocks. This array keeps the list of original and processed blocks. So
      // if a being processed block contains any block from this list, it is skipped.

      var blocksToCheck = Array.prototype.slice.call(blocks);
      editor.selection.save();
      editor.$el.find('pre').attr('skip', true);
      blocks.forEach(function (block) {
        if (editor.node.isList(block)) {
          return;
        }

        if (blocksToCheck.some(function (blockToCheck) {
          return blockToCheck !== block && block.contains(blockToCheck);
        })) {
          return;
        }

        var substitute;

        if (block.tagName === 'LI') {
          substitute = substituteLi;
        } else if (block.parentNode.tagName === 'LI') {
          substitute = substituteLiChild;
        } else if (['TD', 'TH'].indexOf(block.parentNode.tagName) !== -1) {
          substitute = substituteTableCellChild;
        } else {
          substitute = substituteOther;
        }

        var $blockNew = substitute($(block), tag, doesNeedBlock);

        if ($blockNew) {
          $blockNew.each(function (_, blockNew) {
            // A null value of the attr method argument doesn't remove the attribute in the embedded version of jQuery
            for (var _i = 0, _arr = ['id', 'class']; _i < _arr.length; _i++) {
              var attribute = _arr[_i];

              if (format[attribute]) {
                blockNew.setAttribute(attribute, format[attribute]);
              } else {
                blockNew.removeAttribute(attribute);
              }
            }

            blocksToCheck.push(blockNew);
          });
        }
      });
      editor.$el.find('pre:not([skip="true"]) + pre:not([skip="true"])').each(function (_, element) {
        var $element = $(element);
        $element.prev().append("<br>".concat($element.html()));
        $element.remove();
      });
      editor.$el.find('pre').removeAttr('skip');
      editor.html.unwrap();
      editor.selection.restore();
    }
    /**
     * Updates toolbar dropdown view in order to correspond currently selected block format.
     *
     * @param {jQuery} $dropdown Dropdown DOM object
     */


    function refreshDropdown($dropdown) {
      var blocks = editor.selection.blocks();
      var query = getElementFormatIds(blocks[0]).map(function (formatId) {
        return ".fr-command[data-param1=\"".concat(formatId, "\"]");
      }).join(', ');
      $dropdown.find(query).addClass('fr-active').attr("aria-selected", true);
    }
    /**
     * Updates toolbar button view in order to correspond currently selected block format.
     *
     * @param {jQuery} $button Button DOM object
     */


    function refreshButton($button) {
      if (!editor.opts.paragraphFormatExtendedSelection) {
        return;
      }

      var blocks = editor.selection.blocks();
      var formatIds = getElementFormatIds(blocks[0]);
      var formats = editor.opts.paragraphFormatExtended;
      var title = "\u2014"; // M-dash

      for (var i = 0; i < formats.length; ++i) {
        if (formatIds.indexOf(getFormatId(formats[i])) !== -1) {
          title = editor.language.translate(formats[i].title);
          break;
        }
      }

      $button.find('> span').text(title);
    }
    /**
     * Determines formats that correspond to specified DOM element.
     *
     * @param {HTMLElement} element DOM element
     * @returns {FormatID[]} Formats
     */


    function getElementFormatIds(element) {
      var tagDefault = editor.html.defaultTag();
      var format;

      if (element instanceof HTMLElement) {
        format = {
          tag: element.tagName.toLowerCase(),
          id: element.getAttribute('id'),
          class: element.getAttribute('class')
        };

        if (['li', 'td', 'th'].indexOf(format.tag) !== -1) {
          format.tag = tagDefault;
        }
      } else {
        format = {
          tag: tagDefault
        };
      }

      var formats = [format];

      if (format.tag === tagDefault) {
        formats.push(_objectSpread({}, format, {
          tag: null
        }));
      }

      return formats.map(getFormatId);
    }
    /**
     * Wraps content of LI element in DOM element with specified tag name (if tag name is not default tag).
     *
     * @param {jQuery} $block LI element
     * @param {String} tag Tag name of wrapping element
     * @param {boolean} [requireBlock=false] Wrapping is always required (event if tag name is default tag)
     * @returns {jQuery} Wrapping element
     */


    function substituteLi($block, tag, requireBlock) {
      if ((!tag || tag.toLowerCase() === editor.html.defaultTag()) && !requireBlock) {
        return $block;
      }

      var $blockNew;

      if ($block.find('ul, ol').length > 0) {
        $blockNew = $("<".concat(tag, ">"));
        $block.prepend($blockNew);

        for (var child = editor.node.contents($block[0])[0]; child && ['ul', 'ol'].indexOf(child.tagName.toLowerCase()) === -1;) {
          var next = child.nextSibling;
          $blockNew.append(child);
          child = next;
        }
      } else {
        $blockNew = $("<".concat(tag, ">")).html($block.html());
        $block.html($blockNew);
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


    function substituteLiChild($block, tag, requireBlock) {
      if (tag.toLowerCase() === editor.html.defaultTag() && !requireBlock) {
        $block.replaceWith($block.html());
        return null;
      }

      return substituteOther($block, tag, requireBlock);
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


    function substituteTableCellChild($block, tag, requireBlock) {
      if (tag.toLowerCase() === editor.html.defaultTag() && !requireBlock) {
        if (!editor.node.isEmpty($block[0], true)) {
          $block.append('<br/>');
        }

        $block.replaceWith($block.html());
        return null;
      }

      return substituteOther($block, tag, requireBlock);
    }
    /**
     * Changes DOM element tag name.
     *
     * @param {jQuery} $block DOM element to change tag name
     * @param {String} tag New tag name
     * @returns {jQuery} Element with changed tag name
     */


    function substituteOther($block, tag) {
      if (!tag) {
        tag = "div class=\"fr-temp-div\"".concat(editor.node.isEmpty($block[0], true) ? ' data-empty="true"' : '');
      }

      var $blockNew = $("<".concat(tag, " ").concat(editor.node.attributes($block[0]), ">")).html($block.html()).removeAttr('data-empty');
      $block.replaceWith($blockNew);
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


  _froalaEditor.default.DefineIcon('paragraphFormatExtended', {
    NAME: 'paragraph',
    SVG_KEY: 'paragraphFormat'
  });
  /**
   * Defining a plugin button.
   *
   * @see https://www.froala.com/wysiwyg-editor/docs/concepts/custom-button More info
   */


  _froalaEditor.default.RegisterCommand('paragraphFormatExtended', {
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
    plugin: 'paragraphFormatExtended',

    /**
     * Determines whether dropdown selection should be displayed on button.
     *
     * @param {FroalaEditor} editor The Froala Editor instance
     * @returns {boolean}
     */
    displaySelection: function displaySelection(editor) {
      return editor.opts.paragraphFormatExtendedSelection;
    },

    /**
     * Text displayed on button until selection format is determined (any text is selected in editor). Is used if
     * `displaySelection` returns `true`.
     */
    defaultSelection: function defaultSelection(editor) {
      return editor.language.translate(editor.opts.paragraphDefaultSelection);
    },

    /**
     * Button width in pixels. Is used if `displaySelection` returns `true`.
     */
    displaySelectionWidth: 100,

    /**
     * Builds dropdown content.
     *
     * @ignore An ordinary function is used to receive a `this` value
     *
     * @returns {String} HTML content
     */
    html: function html() {
      var _this = this;

      var itemsHTML = this.opts.paragraphFormatExtended.map(function (format) {
        var title = _this.language.translate(format.title);

        var tag = format.tag || _this.html.defaultTag();

        var formatId = getFormatId(format); // const shortcut = this.shortcuts.get(`paragraphFormatExtended.${formatId}`);

        return "<li role=\"presentation\">" + "<".concat(tag).concat(format.class ? " class=\"".concat(format.class, "\"") : '').concat(format.id ? " id=\"".concat(format.id, "\"") : '', " style=\"padding: 0 !important; margin: 0 !important;\" role=\"presentation\">") + "<a class=\"fr-command\" tabIndex=\"-1\" role=\"option\" data-cmd=\"paragraphFormatExtended\" data-param1=\"".concat(formatId, "\" title=\"").concat(title, "\">") + title + // (shortcut ? `<span class="fr-shortcut">{shortcut}</span>` : '') +
        "</a>" + "</".concat(tag, ">") + "</li>";
      }).join("\n");
      return "<ul class=\"fr-dropdown-list\" role=\"presentation\">".concat(itemsHTML, "</ul>");
    },

    /**
     * Handles dropdown list item click.
     *
     * @ignore An ordinary function is used to receive a `this` value
     *
     * @param {String} command Command name
     * @param {value} value Dropdown item `data-param1` attribute content
     */
    callback: function callback(command, value) {
      this.paragraphFormatExtended.apply(value);
    },

    /**
     * Systems calls this action when toolbar button view might needs to be updated.
     *
     * @ignore An ordinary function is used to receive a `this` value
     *
     * @param {jQuery} $button Toolbar button DOM element
     */
    refresh: function refresh($button) {
      this.paragraphFormatExtended.refreshButton($button);
    },

    /**
     * Systems calls this action when toolbar dropdown is opened.
     *
     * @ignore An ordinary function is used to receive a `this` value
     *
     * @param {jQuery} $button Toolbar button DOM element
     * @param {jQuery} $dropdown Toolbar dropdown DOM element
     */
    refreshOnShow: function refreshOnShow($button, $dropdown) {
      this.paragraphFormatExtended.refreshDropdown($dropdown);
    }
  });
  /**
   * Converts paragraph format description to unique format representation.
   *
   * @param {Format} format
   * @returns {FormatID}
   */


  function getFormatId(format) {
    var str = '';

    if (format.tag) {
      str += format.tag.toLowerCase();
    }

    if (format.id) {
      str += "#".concat(format.id);
    }

    if (format.class) {
      str += (format.class instanceof Array ? format.class : String(format.class).split(/\s+/)).filter(function (part) {
        return part;
      }).sort().map(function (part) {
        return ".".concat(part);
      }).join('');
    }

    return str;
  }
  /**
   * Converts unique format representation to paragraph format description.
   *
   * @param {FormatID} id
   * @returns {Format}
   */


  function getIdFormat(id) {
    var parts = /([^.#]*)(#[^.]+|.{0})(\.[\s\S]+|.{0})/.exec(id);

    if (parts) {
      return {
        tag: parts[1].toLowerCase() || null,
        id: parts[2].slice(1) || null,
        class: parts[3].split('.').filter(function (part) {
          return part;
        }).join(' ') || null
      };
    } else {
      return {};
    }
  }
});