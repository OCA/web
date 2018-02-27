/* Copyright 2014 Sudokeys <http://www.sudokeys.com>
 * Copyright 2017 Komit - <http:///komit-consulting.com>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_widget_text_markdown.bootstrap_markdown",
            function (require) {
    "use strict";

    var core = require('web.core');
    var form_common = require('web.form_common');
    var formats = require ("web.formats");

    var _lt = core._lt;
    var ListView = require('web.ListView');
    var list_widget_registry = core.list_widget_registry;

    var FieldTextMarkDown = form_common.AbstractField.extend(
        form_common.ReinitializeFieldMixin,
        {

            template: 'FieldMarkDown',
            display_name: _lt('MarkDown'),
            widget_class: 'oe_form_field_bootstrap_markdown',
            events: {
                'change input': 'store_dom_value'
            },

            init: function (field_manager, node) {
                this._super(field_manager, node);
                this.$txt = false;

                this.old_value = null;
            },

            parse_value: function(val, def) {
                return formats.parse_value(val, this, def);
            },

            initialize_content: function () {
                // Gets called at each redraw of widget
                //  - switching between read-only mode and edit mode
                //  - BUT NOT when switching to next object.
                this.$txt = this.$el.find('textarea[name="' + this.name + '"]');
                if (!this.get('effective_readonly')) {
                    this.$txt.markdown({
                        autofocus: false,
                        savable: false,
                        iconlibrary: "fa"
                    });
                }
                this.old_value = null; // will trigger a redraw
            },

            store_dom_value: function () {
                if (!this.get('effective_readonly') &&
                    this.is_syntax_valid()) {
                    // We use internal_set_value because we were called by
                    // ``.commit_value()`` which is called by a ``.set_value()``
                    // itself called because of a ``onchange`` event
                    this.internal_set_value(
                        this.parse_value(
                            this._get_raw_value()
                        )
                    );
                }
            },

            commit_value: function () {
                this.store_dom_value();
                return this._super();
            },

            _get_raw_value: function() {
                if (this.$txt === false)
                    return '';
                return this.$txt.val();
            },

            render_value: function () {
                // Gets called at each redraw/save of widget
                //  - switching between read-only mode and edit mode
                //  - when switching to next object.

                var show_value = this.format_value(this.get('value'), '');
                if (!this.get("effective_readonly")) {
                    this.$txt.val(show_value);
                    this.$el.trigger('resize');
                } else {
                    // avoids loading markitup...
                    marked.setOptions({
                        highlight: function (code) {
                            return hljs.highlightAuto(code).value;
                        }
                    });
                    this.$el.find('span[class="oe_form_text_content"]').html(marked(show_value));
                }
            },

            format_value: function (val, def) {
                return formats.format_value(val, this, def);
            }
        }
    );

    core.form_widget_registry.add('bootstrap_markdown',
     FieldTextMarkDown);

     /**
     * bootstrap_markdown support on list view
     **/
    ListView.Column.include({

        init: function(){
            this._super.apply(this, arguments);
            hljs.initHighlightingOnLoad();
            marked.setOptions({
                sanitize: true,
                highlight: function (code) {
                    return hljs.highlightAuto(code).value;
                }
            });
        },

        _format: function(row_data, options){
            options = options || {};
            var markdown_text = marked(
                formats.format_value(
                    row_data[this.id].value, this, options.value_if_empty
                )
            );
            return markdown_text;
        }
    });

    list_widget_registry.add('field.bootstrap_markdown', ListView.Column);

});
