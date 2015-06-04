(function() {

var instance = openerp;

instance.web.form.FieldFloat = instance.web.form.FieldChar.extend({
    is_field_number: true,
    widget_class: 'oe_form_field_float',
    events: {
        "keyup": "floatKeyup",
    },
    floatKeyup: function(e){
        var code = e.which ? e.which : e.keyCode;

        if (code === 110){
            var input = this.$("input").val();
            input = input.substr(0, input.length -1);
            input += instance.web._t.database.parameters.decimal_point;
            this.set("value", input);
        }
    },
});

})();
