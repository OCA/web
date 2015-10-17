openerp.web_text_widget = function (instance)
{

var QWeb = instance.web.qweb;
var _t = instance.web._t;


instance.web.form.FieldText.include({
    template: 'FieldText',
    LIMIT_LINES_CONTEXT_KEY: 'maxlines',
    LIMIT_CHARS_CONTEXT_KEY: 'maxlength',

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
        var maxlines = ctx[this.LIMIT_LINES_CONTEXT_KEY]*1
        var maxlength = ctx[this.LIMIT_CHARS_CONTEXT_KEY]*1

        var value = $textarea.val();
        var lines = value.split("\n");
        
        if (maxlines && lines.length > maxlines){
            $textarea.val(lines.slice(0, maxlines).join("\n"));
        }
        if (maxlength && value.length > maxlength){
            $textarea.val(value.slice(0, maxlength));
        }
        this.$el.find('span.length_limit').html(value.length + '/' + maxlength);
    },

});

instance.web.form.FieldChar.include({
    template: 'FieldChar',
    LIMIT_CHARS_CONTEXT_KEY: 'maxlength',

    events: {
        'keyup': function (e) {
            this.limit_value($(e.target));
        },
        'change textarea': 'store_dom_value',
    },

    limit_value: function($textarea)
    {
        var ctx = this.build_context().eval();
        var maxlength = ctx[this.LIMIT_CHARS_CONTEXT_KEY]*1

        var value = $textarea.val();

        if (maxlength && value.length > maxlength){
            $textarea.val(value.slice(0, maxlength));
        }
        this.$el.find('span.length_limit').html(value.length + '/' + maxlength);
    },

});
}