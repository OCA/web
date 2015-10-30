openerp.web_widget_text_markdown = function (oe) {

    var _lt = oe.web._lt;

    oe.web.form.widgets.add('bootstrap_markdown', 'openerp.web_widget_text_markdown.FieldTextMarkDown');

    oe.web_widget_text_markdown.FieldTextMarkDown = oe.web.form.AbstractField.extend(
        oe.web.form.ReinitializeFieldMixin,
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
                return oe.web.parse_value(val, this, def);
            },

            initialize_content: function () {
                // Gets called at each redraw of widget
                //  - switching between read-only mode and edit mode
                //  - BUT NOT when switching to next object.
                this.$txt = this.$el.find('textarea[name="' + this.name + '"]');
                if (!this.get('effective_readonly')) {
                    this.$txt.markdown({autofocus: false, savable: false});
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
                return oe.web.format_value(val, this, def);
            }
        }
    );

    /**
     * bootstrap_markdown support on list view
     **/
    oe.web_widget_text_markdown.FieldTextMarkDownList = oe.web.list.Char.extend({

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
                oe.web.format_value(
                    row_data[this.id].value, this, options.value_if_empty
                )
            );
            return markdown_text;
        }
    });

    oe.web.list.columns.add(
        "field.bootstrap_markdown", "oe.web_widget_text_markdown.FieldTextMarkDownList"
    );
};
