odoo.define('many2one_color', function(require) {
    "use strict";
    var core = require('web.core');
    var Model = require('web.Model');
    var FieldMany2One = core.form_widget_registry.get('many2one');
    
    
var FieldMany2OneColored = FieldMany2One.extend({

    start: function() {
        this._super.apply(this, arguments);
        this.set_color_to_field();
    },

    reinit_value: function(val) {
        // TODO doesn't work as suppose
        this._super.apply(this, arguments);
        this.set_color_to_field();
    },

    set_color_to_field: function () {
        var self = this;
        var def = $.when();
        def.then(function () {
            var id = parseInt(Object.keys(self.display_value)[0]);
            if(id){
                new Model(self.field.relation).call('read', [[id], ['color'],]).then(function (data) {
                    self.$el.addClass('o_m2o_color_' + data[0]['color']);
                })
            }
        })
    },
});

core.form_widget_registry.add('many2one_color', FieldMany2OneColored);

});

