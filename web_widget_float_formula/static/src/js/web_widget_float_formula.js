/**
*    Copyright GRAP
*    Copyright 2016 LasLabs Inc.
*    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define('web_widget_float_formula', function(require) {
    "use strict";

    var core = require('web.core');
    var basic_fields = require('web.basic_fields');
    var FieldFloat = basic_fields.FieldFloat;
    FieldFloat.include({
        start: function() {
            this._super();
            this.on('blurred', this, this._compute_result);
            this.on('focused', this, this._display_formula);

            this.setUpFocus();
        },

        setUpFocus: function() {
            var self = this;
            this.$el.on({
                focus: function() { self.trigger('focused'); },
                blur: function() { self.trigger('blurred'); }
            });
        },

        commitChanges: function() {
            this._compute_result();
        },

        _formula_text: '',

        _clean_formula_text: function() {
            this._formula_text = '';
        },

        _process_formula: function(formula) {
            try{
                formula = formula.toString();
            } catch (ex) {
                return false;
            }
            var clean_formula = formula.toString().replace(/^\s+|\s+$/g, '');
            if (clean_formula[0] == '=') {
                clean_formula = clean_formula.substring(1);
                var myreg = new RegExp('[0-9]|\\s|\\.|,|\\(|\\)|\\+|\\-|\\*|\\/', 'g');
                if (clean_formula.replace(myreg, '') === '') {
                    return clean_formula;
                }
            }
            return false;
        },

        _eval_formula: function(formula) {
            // Import localization values used to eval formula
            var translation_params = core._t.database.parameters;
            var decimal_point = translation_params.decimal_point;
            var thousands_sep = translation_params.thousands_sep;

            var value;
            formula = formula.replace(thousands_sep, '').replace(decimal_point, '.');
            try {
                value = eval(formula);
            }
            catch(e) {}

            if (typeof value != 'undefined') {
                return value;
            }
            return false;
        },

        _compute_result: function() {
            this._clean_formula_text();

            var input = this.$input.val();

            var formula = this._process_formula(input);
            if (formula !== false) {
                var value = this._eval_formula(formula);
                if (value !== false) {
                    this._formula_text = "=" + formula;

                    var decimal_point = core._t.database.parameters.decimal_point;

                    // _setValue
                    this._setValue(value.toString().replace(decimal_point, '.'))
                    this._render();
                }
            }
        },

        // Display the formula stored in the field to allow modification
        _display_formula: function() {
            if (this._formula_text !== '') {
                this.$input.val(this._formula_text);
            }
        },
    });
});
