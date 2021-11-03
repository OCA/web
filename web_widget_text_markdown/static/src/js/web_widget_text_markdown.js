/* global showdown */
/* Copyright 2014 Sudokeys <http://www.sudokeys.com>
 * Copyright 2017 Komit - <http:///komit-consulting.com>
 * Copyright 2019 Alexandre Díaz - <dev@redneboa.es>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_widget_text_markdown.FieldTextMarkDown", function(require) {
    "use strict";

    var basic_fields = require("web.basic_fields");
    var field_registry = require("web.field_registry");
    var core = require("web.core");

    var _t = core._t;
    var LIBS_PATH = "/web_widget_text_markdown/static/src/lib/";

    var FieldTextMarkDown = basic_fields.FieldText.extend({
        className: [
            basic_fields.FieldText.prototype.className,
            "o_field_text_markdown",
        ].join(" "),
        jsLibs: [
            LIBS_PATH + "bootstrap-markdown.js",
            LIBS_PATH + "showdown.js",
            LIBS_PATH + "showdown-footnotes.js",
            LIBS_PATH + "showdown-table.js",
            LIBS_PATH + "showdown-toc.js",
        ],
        cssLibs: [LIBS_PATH + "bootstrap-markdown.min.css"],

        _getValue: function() {
            if (
                this.$type === "html" &&
                this.$widget &&
                this.$widget === "bootstrap_markdown" &&
                this.$use_markdown
            ) {
                return this._getHtmlValue(this.$input.val());
            }
            return this.$markdown.getContent();
        },

        start: function() {
            this._super();
            // This is custom how to add CSS class and styles
            // Showdown does not support this out of the box.
            // eslint-disable-next-line max-len
            // Ref: https://github.com/showdownjs/showdown/wiki/Add-default-classes-for-each-HTML-element
            const classMap = {
                table: "table table-striped",
            };
            var cmdItalic = null;

            const clss_bindings = Object.keys(classMap).map(key => ({
                type: "output",
                regex: new RegExp(`<${key}(.*)>`, "g"),
                replace: `<${key} class="${classMap[key]}" $1>`,
            }));
            this.$use_markdown = this.attrs.options.use_markdown || false;
            this.$widget = this.attrs.widget;
            this.$type = this.field.type;
            this.shw_render_html = new showdown.Converter({
                extensions: [...clss_bindings, "table", "footnotes", "toc"],
                emoji: true,
                underline: true,
                tablesHeaderId: true,
                omitExtraWLInCodeBlocks: true,
                noHeaderId: true,
                prefixHeaderId: true,
                rawPrefixHeaderId: true,
                ghCompatibleHeaderId: true,
                rawHeaderId: true,
                headerLevelStart: false,
                parseImgDimensions: true,
                simplifiedAutoLink: true,
                literalMidWordUnderscores: false,
                literalMidWordAsterisks: true,
                strikethrough: true,
                tables: true,
                ghCodeBlocks: true,
                tasklists: true,
                smoothLivePreview: true,
                smartIndentationFix: true,
                disableForced4SpacesIndentedSublists: true,
                simpleLineBreaks: true,
                requireSpaceBeforeHeadingText: true,
                ghMentions: true,
                ghMentionsLink: "https://github.com/{u}",
                encodeEmails: true,
                openLinksInNewWindow: true,
                backslashEscapesHTMLTags: true,
                completeHTMLDocument: true,
                metadata: true,
                splitAdjacentBlockquotes: true,
            });

            $.fn.markdown.defaults.buttons[0].forEach(function(group) {
                group.data.forEach(function(button) {
                    if (button.name === "cmdItalic") cmdItalic = button;
                });
            });

            // Override `cmdItalic` button replace use of __ to favour **;
            if (cmdItalic) {
                cmdItalic.callback = function(e) {
                    // Give/remove * surround the selection
                    var chunk = null;
                    var cursor = null;
                    var selected = e.getSelection();
                    var content = e.getContent();
                    if (selected.length === 0) {
                        // Give extra word
                        chunk = e.__localize("emphasized text");
                    } else {
                        chunk = selected.text;
                    }
                    // Transform selection and set the cursor into chunked text
                    if (
                        content.substr(selected.start - 1, 1) === "_" &&
                        content.substr(selected.end, 1) === "_"
                    ) {
                        e.setSelection(selected.start - 1, selected.end + 1);
                        e.replaceSelection(chunk);
                        cursor = selected.start - 1;
                    } else {
                        e.replaceSelection("*" + chunk + "*");
                        cursor = selected.start + 1;
                    }
                    // Set the cursor
                    e.setSelection(cursor, cursor + chunk.length);
                };
            }
        },
        _renderEdit: function() {
            var self = this;
            return $.when(this._super()).then(function() {
                if (
                    self.mode === "edit" &&
                    self.$type === "html" &&
                    self.$widget &&
                    self.$widget === "bootstrap_markdown" &&
                    self.value
                ) {
                    self.value = self._getMarkdownValue(self.value);
                }
            });
        },

        _prepareInput: function() {
            var $input = this._super.apply(this, arguments);

            _.defer(
                function($elm) {
                    $input.removeClass(this.className);
                    $input.wrap(
                        _.str.sprintf("<div class='%s'></div>", this.className)
                    );
                    $elm.markdown(this._getMarkdownOptions());
                    this.$markdown = $elm.data("markdown");
                    this.$markdown.setContent(this.value || "");
                }.bind(this),
                $input
            );
            return $input;
        },
        _getMarkdownValue: function(value) {
            return this.shw_render_html.makeMarkdown(this._formatValue(value));
        },
        _getHtmlValue: function(value) {
            return this.shw_render_html.makeHtml(this._formatValue(value));
        },

        _renderReadonly: function() {
            this.$el.html(this._getHtmlValue(this.value));
        },

        _getMarkdownOptions: function() {
            var self = this;
            var markdownOpts = {
                iconlibrary: "fa",
                autofocus: false,
                width: "o_field_text_markdown",
                savable: false,
                language: this.getSession().user_context.lang,
                onPreview: function(e) {
                    var render_val = self._getHtmlValue(e.getContent());
                    return render_val;
                },
            };

            if (_t.database.multi_lang && this.field.translate) {
                markdownOpts.additionalButtons = [
                    [
                        {
                            name: "oTranslate",
                            data: [
                                {
                                    name: "cmdTranslate",
                                    title: _t("Translate"),
                                    icon: {fa: "fa fa-flag"},
                                    // eslint-disable-next-line max-len
                                    callback: this._markdownTranslate.bind(self),
                                },
                            ],
                        },
                    ],
                ];
            }
            return markdownOpts;
        },

        _markdownTranslate: function() {
            // Event is the click event from callback
            this._onTranslate(event);
        },
    });

    field_registry.add("bootstrap_markdown", FieldTextMarkDown);
    return FieldTextMarkDown;
});
