openerp.web_text_widget = function (instance)
{

var QWeb = instance.web.qweb;
var _t = instance.web._t;


instance.web_text_widget.FieldTextLimited = instance.web.form.FieldText.extend(
    instance.web.form.ReinitializeFieldMixin, {
    template: 'FieldText',
    LIMIT_LINES_CONTEXT_KEY: 'limit_lines',
    LIMIT_LINES_DEFAULT: 10,
    LIMIT_CHARS_CONTEXT_KEY: 'limit_chars',
    LIMIT_CHARS_DEFAULT: 500,

    events: {
        'keyup': function (e) {
            if (e.which === $.ui.keyCode.ENTER) {
                e.stopPropagation();
            }
            this.limit_value($(e.target));
        },
        'change textarea': 'store_dom_value',
    },

    limit_value: function($textarea)
    {
        var ctx = this.build_context().eval();
        var limit_lines = ctx[this.LIMIT_LINES_CONTEXT_KEY]*1
        if (!limit_lines){
            limit_lines = this.LIMIT_LINES_DEFAULT;
            console.log("No default values found for limit lines in '"
             + this.name + "' field. Default value " + limit_lines
             + " will be used.");
        }

        var limit_chars = ctx[this.LIMIT_CHARS_CONTEXT_KEY]*1
        if (!limit_chars){
            limit_chars = this.LIMIT_CHARS_DEFAULT;
            console.log("No default values found for limit chars in '"
             + this.name + "' field. Default value " + limit_chars
             + " will be used.");
        }

        var value = $textarea.val();
        var lines = value.split("\n");
        if (lines.length > limit_lines){
            $textarea.val(lines.slice(0, limit_lines).join("\n"));
        }
        if (value.length > limit_chars){
            $textarea.val(value.slice(0, limit_chars));
        }
        this.$el.find('span.length_limit').html(value.length + '/' + limit_chars);
    },

    initialize_content: function() {
        return this._super();
    },

    store_dom_value: function () {
        this.limit_value(this.$textarea);
        return this._super();
    },
});

instance.web.form.widgets.add('text_limited',
    'instance.web_text_widget.FieldTextLimited');
};
