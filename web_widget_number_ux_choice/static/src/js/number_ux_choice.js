/**
* Copyright (C) 2019 - Today: GRAP (http://www.grap.coop)
* @author: Quentin DUPONT <quentin.dupont@grap.coop>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) **/

odoo.define('web.web_widget_number_ux_choice', function(require) {
    "use strict";

    var basic_fields = require('web.basic_fields');
    var Registry = require('web.field_registry');
    // var session = require('web.session');
    // var rpc = require('web.rpc');
    // var pyUtils = require("web.py_utils");

    /*
    * Get precision for the @input field
    */
    function getPrecision(input) {
      if (!isFinite(input)) return 0;
      var e = 1, p = 0;
      while (Math.round(input * e) / e !== input) { e *= 10; p++; }
      return p;
    }

    /*
    * @self : input field
    * @step : must be Float
    * @minusOrPlus : "minus" or "plus"
    *
    * set new value to @self */
    function addStep(self, step, minusOrPlus) {
        var oldVal= parseFloat(self._getValue());
        var precision = Math.max(getPrecision(oldVal), getPrecision(step))
        if (minusOrPlus == "minus") {
            step = -step
        }
        var newVal = oldVal + step;
        var newVal_s = newVal.toFixed(precision).toString();
        self._setValue(newVal_s); 
        self.$input[0].value = newVal_s;
    }

    var NumberUxChoice = basic_fields.FieldFloat.extend({
        template: 'NumberUxChoice',

        _render: function () {
            var self = this;
            this._super();
            this.$("button").parents().removeClass("o_field_integer o_field_number o_input o_required_modifier");
            this.$("button").click(function() {
                var node = $(this).parent()[0];

                // Get step option or default is 1
                if (typeof node.attributes['step'] !== 'undefined') {
                    var step = parseFloat(node.attributes['step'].value);
                } else {
                    var step = 1;
                }
                // PLUS button
                if ($(this).hasClass("btn_number_ux_choice_plus")) {
                    addStep(self, step, "plus")
                // MINUS button
                } else if ($(this).hasClass("btn_number_ux_choice_minus")){
                    addStep(self, step, "minus")

                };
            });
        },

    });

    Registry.add('number_ux_choice', NumberUxChoice);

});
