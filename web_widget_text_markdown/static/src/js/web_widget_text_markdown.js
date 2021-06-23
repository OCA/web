/* global marked */
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
        jsLibs: [LIBS_PATH + "marked.js", LIBS_PATH + "bootstrap-markdown.js"],
        cssLibs: [LIBS_PATH + "bootstrap-markdown.min.css"],

        _getValue: function() {
            return this.$markdown.getContent();
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

        _renderReadonly: function() {
            this.$el.html(marked(this._formatValue(this.value)));
        },

        _getMarkdownOptions: function() {
            var markdownOpts = {
                iconlibrary: "fa",
                autofocus: false,
                width: "o_field_text_markdown",
                savable: false,
                language: this.getSession().user_context.lang,
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
