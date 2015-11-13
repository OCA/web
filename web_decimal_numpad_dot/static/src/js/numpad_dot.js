(function() {

    var instance = openerp;

    instance.web.form.FieldFloat = instance.web.form.FieldChar.extend({
        is_field_number: true,
        widget_class: 'oe_form_field_float',
        events: {
            "keypress": "floatKeypress",
        },
        floatKeypress: function(e){
            if(e.keyCode == '46' || e.charCode == '46'){
                //Cancel the keypress
                e.preventDefault();
                // Add the comma to the value of the input field
                 this.$("input").val(this.$("input").val() + ',');
            }
        },
    });
})();
