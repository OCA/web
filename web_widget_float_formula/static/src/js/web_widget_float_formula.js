/**
 * Copyright 2014-2015 GRAP
 * Copyright 2016 LasLabs Inc.
 * Copyright 2020 Brainbean Apps (https://brainbeanapps.com)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
 */
odoo.define('web_widget_float_formula', function(require) {
    "use strict";

    var field_utils = require('web.field_utils');
    var pyUtils = require('web.py_utils');
    var NumericField = require('web.basic_fields').NumericField;
    var FieldMonetary = require('web.basic_fields').FieldMonetary;

    var FormulaFieldMixin = {
        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------

        /**
         * Unaltered formula that user has entered.
         *
         * @private
         */
        _formula: '',

        /**
         * Value of the field that was concealed during formula reveal.
         *
         * @private
         */
        _concealedValue: '',

        /**
         * Returns formula prefix character
         *
         * @private
         */
        _getFormulaPrefix: function () {
            return '=';
        },

        /**
         * Process formula if one is detected.
         *
         * @override
         * @private
         * @param {any} value
         * @param {Object} [options]
         */
        _setValue: function (value, options) {
            this._formula = '';
            if (!!value && this._isFormula(value)) {
                try {
                    var evaluated_value = this._evaluateFormula(value);
                    this._formula = value;

                    value = this._formatValue(evaluated_value);
                    this.$input.val(value);
                } catch (err) {
                    this._formula = '';
                } finally {
                    this._concealedValue = '';
                }
            }
            return this._super(value, options);
        },

        /**
         * Checks if provided value is a formula.
         *
         * @private
         * @param {any} value
         */
        _isFormula: function(value) {
            value = value.toString().replace(/\s+/gm, '');
            return value.startsWith(this._getFormulaPrefix())
                || this._getOperatorsRegExp().test(value);
        },

        /**
         * Returns regular expression that matches all supported operators
         *
         * @private
         */
        _getOperatorsRegExp: function () {
            return /((?:\+)|(?:\-)|(?:\*)|(?:\/)|(?:\()|(?:\))|(?:\%))/;
        },

        /**
         * Evaluate formula.
         *
         * @private
         * @param {any} formula
         */
        _evaluateFormula: function(formula) {
            return pyUtils.py_eval(this._preparseFormula(formula));
        },

        /**
         * Pre-parses and sanitizes formula
         *
         * @private
         * @param {string} formula
         */
        _preparseFormula: function(formula) {
            formula = formula.toString().replace(/\s+/gm, '');
            var prefix = this._getFormulaPrefix();
            if (formula.startsWith(prefix)) {
                formula = formula.substring(prefix.length);
            }
            var operatorsRegExp = this._getOperatorsRegExp();
            return formula.split(operatorsRegExp).reduce((tokens, token) => {
                if (token === '') {
                    return tokens;
                }
                if (!operatorsRegExp.test(token)) {
                    token = field_utils.parse.float(token);
                }
                tokens.push(token);
                return tokens;
            }, []).join('');
        },

        /**
         * Reveals formula
         *
         * @private
         */
        _revealFormula: function () {
            if (!!this._formula) {
                this._concealedValue = this.$input.val();
                this.$input.val(this._formula);
            }
        },

        /**
         * Conceals formula
         *
         * @private
         */
        _concealFormula: function () {
            var value = this.$input.val();
            if (!!value && this._isFormula(value)) {
                if (value !== this._formula) {
                    this.commitChanges();
                } else if (!!this._concealedValue) {
                    this.$input.val(this._concealedValue);
                    this._concealedValue = '';
                }
            }
        },

        /**
         * Handles 'focus' event
         *
         * @private
         * @param {FocusEvent} event
         */
        _onFocusFormulaField: function(event) {
            if (this.$input === undefined || this.mode !== 'edit') {
                return;
            }
            this._revealFormula();
        },

        /**
         * Handles 'blur' event
         *
         * @private
         * @param {FocusEvent} event
         */
        _onBlurFormulaField: function(event) {
            if (this.$input === undefined || this.mode !== 'edit') {
                return;
            }
            this._concealFormula();
        },
    };

    NumericField.include({
        ...FormulaFieldMixin,
        events: _.extend({}, NumericField.prototype.events, {
            'focus': '_onFocusFormulaField',
            'blur': '_onBlurFormulaField',
        }),
    });

    FieldMonetary.include({
        ...FormulaFieldMixin,
        events: _.extend({}, FieldMonetary.prototype.events, {
            'focusin': '_onFocusFormulaField',
            'focusout': '_onBlurFormulaField',
        }),
    });

    return {
        FormulaFieldMixin: FormulaFieldMixin,
    };
});
