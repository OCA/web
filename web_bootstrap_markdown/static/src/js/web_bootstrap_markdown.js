openerp.web_bootstrap_markdown = function (oe) {

    var _lt = oe.web._lt;

    oe.web.form.widgets.add('bootstrap_markdown', 'openerp.web_bootstrap_markdown.FieldTextMarkDown');

    oe.web_bootstrap_markdown.FieldTextMarkDown = oe.web.form.AbstractField.extend(
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
};
