/**
*    Copyright GRAP
*    Copyright 2016 LasLabs Inc.
*    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define('web_widget_float_formula', function(require) {
    "use strict";

    var form_view = require('web.FormView');
    form_view.include({
        // Ensure that formula is computed even if user saves right away and 
        // clean up '_formula_text' value to avoid bugs in tree view
        _process_save: function(save_obj) {
            for (var f in this.fields) {
                if (!this.fields.hasOwnProperty(f)) { continue; }
                f = this.fields[f];
                if (f.hasOwnProperty('_formula_text') && f.$el.find('input').length > 0) {
                    f._compute_result();
                    f._clean_formula_text();
                }
            }

            return this._super(save_obj);
        },
    });

    var core = require('web.core');
    core.bus.on('web_client_ready', null, function () {
        // Import localization values used to eval formula 
        var translation_params = core._t.database.parameters;
        var decimal_point = translation_params.decimal_point;
        var thousands_sep = translation_params.thousands_sep;

        var field_float = require('web.form_widgets').FieldFloat;
        field_float.include({
            start: function() {
                this._super();
                this.on('blurred', this, this._compute_result);
                this.on('focused', this, this._display_formula);
                return this;
            },

            initialize_content: function() {
                this._clean_formula_text();
                return this._super();
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
                        this.set_value(value);
                        // Force rendering to avoid format loss if there's no change
                        this.render_value();
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
});
