/**
* Copyright (C) 2019 - Today: GRAP (http://www.grap.coop)
* @author: Quentin DUPONT <quentin.dupont@grap.coop>
* License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) **/

odoo.define('web.web_widget_numeric_step', function(require) {
    "use strict";

    var Registry = require('web.field_registry');
    var NumericStep = require('web.basic_fields').FieldFloat;

    /**
    * Get decimal precision for the input field
    *
    * @param {object} input Input field
    * @return {int} Precision
    */
    function getPrecision(input) {
      if (!isFinite(input)) return 0;
      var ten_multiple = 1, precision = 0;
      while (Math.round(input * ten_multiple) / ten_multiple !== input) {
        ten_multiple *= 10;
        precision++;
       }
      return precision;
    }

    /**
    * Increase input number with chosen step iteration
    *
    * @param {object} self Input field
    * @param {Float} step Step iteration
    * @param {String} minusOrPlus Choose "minus" to decrease. Default is "plus"
    */
    function addStep(self, step, minusOrPlus) {
        var oldVal= parseFloat(self._getValue());
        var precision = Math.max(getPrecision(oldVal), getPrecision(step))
        if (minusOrPlus == "minus") {
            step = -step
        }
        var newVal = oldVal + step;
        // Check input limits
        if (newVal > self.attrs.options.max) {
            newVal = self.attrs.options.max;
        } else if (newVal < self.attrs.options.min) {
            newVal = self.attrs.options.min;
        }
        var newVal_s = newVal.toFixed(precision).toString();
        self._setValue(newVal_s); 
        self.$input[0].value = newVal_s;
    }


    NumericStep.include({
        template: 'web_widget_numeric_step',

        _render: function () {
            var self = this;
            // Use native options for input number
            this.nodeOptions['type'] = "number";
            this._super();

            // Add native options for input number
            var input_number_options = ['max', 'min', 'placeholder', 'step'];
            for (var options of input_number_options) {
                if (typeof this.nodeOptions[options] !== 'undefined') {
                    this.$el[0][options] = this.nodeOptions[options];
                } 
            }

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
                if ($(this).hasClass("btn_numeric_step_plus")) {
                    addStep(self, step, "plus")
                // MINUS button
                } else if ($(this).hasClass("btn_numeric_step_minus")){
                    addStep(self, step, "minus")

                };
            });
        },
    });

    Registry.add('numeric_step', NumericStep);

});
