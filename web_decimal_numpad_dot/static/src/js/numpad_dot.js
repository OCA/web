(function() {

    var instance = openerp;

    instance.web.form.FieldFloat = instance.web.form.FieldFloat.extend({
        render_value: function() {
            var self = this;
            this._super();
            if (!this.get('readonly')){
                this.$el.find('input').on('keypress', this.floatKeypress.bind(this));
            }
        },
        floatKeypress: function(e){
            if (e.keyCode == '46' || e.charCode == '46') {
                // Cancel the keypress
                e.preventDefault();
                // Add the comma to the value of the input field
                this.$("input").val(this.$("input").val() + instance.web._t.database.parameters.decimal_point);
             }
            else if (e.keyCode == '44' || e.charCode == '44') {
                // Cancel the keypress
                e.preventDefault();
                // Add the comma to the value of the input field
                this.$("input").val(this.$("input").val() + instance.web._t.database.parameters.thousands_sep);
            }
        },
    });
})();
