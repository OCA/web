odoo.define('web.web_widget_text_markdown', function(require) {

    "use strict";

    var core = require('web.core');
    var Model = require('web.Model');
    var Widget = require('web.Widget');
    var common = require('web.form_common');
    var formats = require('web.formats');
    var session = require('web.session');
    var ace_editor = require('web.web_widget_text_ace');

    var QWeb = core.qweb;
    var _lt = core._lt;

    var accented_letters_mapping = {
        'a': '[àáâãäå]',
        'ae': 'æ',
        'c': 'ç',
        'e': '[èéêë]',
        'i': '[ìíîï]',
        'n': 'ñ',
        'o': '[òóôõö]',
        'oe': 'œ',
        'u': '[ùúûűü]',
        'y': '[ýÿ]',
        ' ': '[()\\[\\]]',
    };

    var FieldTextMarkDown = ace_editor.FieldTextAceEditor.extend({
            template: 'FieldMarkDown',
            display_name: _lt('MarkDown'),
            widget_class: 'oe_form_field_markdown',

            init: function(field_manager, node) {

                this._super(field_manager, node);
                // force markdown syntax
                this.mode = "ace/mode/markdown";
                this.md = markdownit({
                    html: true,
                    linkify: true,
                    typographer: true,
                    highlight: function(str, lang) {
                        if (lang && hljs.getLanguage(lang)) {
                            try {
                                return hljs.highlight(lang, str).value;
                            } catch (__) {}
                        }

                        try {
                            return hljs.highlightAuto(str).value;
                        } catch (__) {}

                        return ''; // use external default escaping
                    }
                });

                this.md.use(markdownItAttrs);

            },
            
            render_value: function() {
                var show_value = this.format_value(this.get('value'), '');
                if (!this.get("effective_readonly")) {
                    this.$txt.val(show_value);
                    this.$el.trigger('resize');
                } else {
                    var content = this.md.render(show_value)
                    this.$(".oe_form_text_content").html(content);
                }

            }
        }
    );

    core.form_widget_registry.add('bootstrap_markdown', FieldTextMarkDown);
});
