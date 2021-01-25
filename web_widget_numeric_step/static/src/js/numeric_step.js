/* Copyright 2019 GRAP - Quentin DUPONT
 * Copyright 2020 Tecnativa - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

odoo.define("web_widget_numeric_step.field", function(require) {
    "use strict";

    const field_utils = require("web.field_utils");
    const Registry = require("web.field_registry");
    const FieldFloat = require("web.basic_fields").FieldFloat;

    const NumericStep = FieldFloat.extend({
        template: "web_widget_numeric_step",
        className: "o_field_numeric_step o_field_number",
        events: _.extend({}, _.omit(FieldFloat.prototype.events, ["change", "input"]), {
            "mousedown .btn_numeric_step": "_onStepMouseDown",
            "touchstart .btn_numeric_step": "_onStepMouseDown",
            "click .btn_numeric_step": "_onStepClick",
            "wheel .input_numeric_step": "_onWheel",
            "keydown .input_numeric_step": "_onKeyDown",
            "change .input_numeric_step": "_onChange",
            "input .input_numeric_step": "_onInput",
            "onfocusout .widget_numeric_step": "_onFocusOut",
        }),
        supportedFieldTypes: ["float", "integer"],

        // Values in milliseconds used for mouse down smooth speed feature
        DEF_CLICK_DELAY: 400,
        MIN_DELAY: 50,
        SUBSTRACT_DELAY_STEP: 25,

        DELAY_THROTTLE_CHANGE: 200,

        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);

            // Widget config
            let max_val = this.nodeOptions.max;
            let min_val = this.nodeOptions.min;
            if (
                !_.isUndefined(min_val) &&
                !_.isUndefined(max_val) &&
                min_val > max_val
            ) {
                min_val = this.nodeOptions.max;
                max_val = this.nodeOptions.min;
            }

            this._config = {
                step: Number(this.nodeOptions.step) || 1,
                min: Number(min_val),
                max: Number(max_val),
            };

            this._lazyOnChangeTrigger = _.debounce(
                () => this.$input.trigger("change"),
                this.DELAY_THROTTLE_CHANGE
            );
            this._auto_step_interval = false;
        },

        /**
         * Add global events listeners
         *
         * @override
         */
        start: function() {
            this._click_delay = this.DEF_CLICK_DELAY;
            this._autoStep = false;
            return this._super.apply(this, arguments).then(() => {
                document.addEventListener("mouseup", this._onMouseUp.bind(this), false);
                document.addEventListener(
                    "touchend",
                    this._onMouseUp.bind(this),
                    false
                );
            });
        },

        /**
         * Transform database value to usable widget value
         *
         * @override
         */
        _formatValue: function(value) {
            if (this.mode === "edit") {
                return this._sanitizeNumberValue(value);
            }
            return this._super.apply(this, arguments);
        },

        /**
         * Transform widget value to usable database value
         *
         * @override
         */
        _parseValue: function() {
            const parsedVal = this._super.apply(this, arguments);
            if (this.mode === "edit") {
                return Number(parsedVal) || 0;
            }
            return parsedVal;
        },

        /**
         * Adds HTML attributes to the input
         *
         * @override
         */
        _prepareInput: function() {
            const result = this._super.apply(this, arguments);
            this.$input.attr(_.pick(this.nodeOptions, ["placeholder"]));
            // InputField hard set the input type to 'text' or 'password',
            // we force it again to be 'tel'.
            // The widget uses 'tel' type because offers a good layout on
            // mobiles and can accept alphanumeric characters.
            // The bad news is that require implement all good 'number' type
            // features like the minus and plus buttons, steps, min and max...
            // Perhaps in a near future this can be improved to have the best of
            // two types without hacky developments.
            this.$input.attr("type", "tel");
            return result;
        },

        /**
         * Select the proper widget input
         *
         * @override
         */
        _renderEdit: function() {
            _.defer(() =>
                this.$el
                    .parents("td.o_numeric_step_cell")
                    .addClass("numeric_step_editing_cell")
            );
            this._prepareInput(this.$el.find("input.input_numeric_step"));
        },

        /**
         * Resets the content to the formated value in readonly mode.
         *
         * @override
         */
        _renderReadonly: function() {
            this.$el
                .parents("td.numeric_step_editing_cell")
                .removeClass("numeric_step_editing_cell");
            this._super.apply(this, arguments);
        },

        /**
         * Increase/Decrease widget input value
         *
         * @param {String} mode can be "plus" or "minus"
         */
        _doStep: function(mode) {
            let cval = 0;
            try {
                const field = this.record.fields[this.name];
                cval = field_utils.parse[field.type](this.$input.val());
            } catch (e) {
                cval = this.value;
                mode = false; // Only set the value in this case
            }
            if (mode === "plus") {
                cval += this._config.step;
            } else if (mode === "minus") {
                cval -= this._config.step;
            }
            const nval = this._sanitizeNumberValue(cval);
            if (nval !== this.lastSetValue || !mode) {
                this.$input.val(nval);
                // Every time that user update the value we must trigger an
                // onchange method.
                this._lazyOnChangeTrigger();
            }
        },

        /**
         * @private
         */
        _clearStepInterval: function() {
            clearTimeout(this._auto_step_interval);
            this._auto_step_interval = false;
            this._click_delay = this.DEF_CLICK_DELAY;
        },

        // Handle Events

        /**
         * @private
         * @param {MouseClickEvent} ev
         */
        _onStepClick: function(ev) {
            if (!this._autoStep) {
                const mode = ev.target.dataset.mode;
                this._doStep(mode);
            }
            this._autoStep = false;
        },

        /**
         * @private
         * @param {MouseClickEvent} ev
         */
        _onStepMouseDown: function(ev) {
            if (ev.button === 0 && !this._auto_step_interval) {
                this._auto_step_interval = setTimeout(
                    this._whileMouseDown.bind(this, ev),
                    this._click_delay
                );
            }
        },

        /**
         * @private
         * @param {FocusoutEvent} ev
         */
        _onFocusOut: function() {
            if (this._auto_step_interval) {
                this._clearStepInterval();
            }
        },

        /**
         * @private
         */
        _onMouseUp: function() {
            this._clearStepInterval();
        },

        /**
         * @private
         * @param {MouseClickEvent} ev
         */
        _whileMouseDown: function(ev) {
            this._autoStep = true;
            const mode = ev.target.dataset.mode;
            this._doStep(mode);
            if (this._click_delay > this.MIN_DELAY) {
                this._click_delay -= this.SUBSTRACT_DELAY_STEP;
            }

            this._auto_step_interval = false;
            this._onStepMouseDown(ev);
        },

        /**
         * Enable mouse wheel support
         *
         * @param {WheelEvent} ev
         */
        _onWheel: function(ev) {
            ev.preventDefault();
            if (ev.originalEvent.deltaY > 0) {
                this._doStep("minus");
            } else {
                this._doStep("plus");
            }
        },

        /**
         * Enable keyboard arrows support
         *
         * @param {KeyEvent} ev
         */
        _onKeyDown: function(ev) {
            if (ev.keyCode === $.ui.keyCode.UP) {
                this._doStep("plus");
            } else if (ev.keyCode === $.ui.keyCode.DOWN) {
                this._doStep("minus");
            }
        },

        /**
         * Sanitize user input value
         *
         * @override
         */
        _onChange: function(ev) {
            ev.target.value = this._sanitizeNumberValue(ev.target.value);
            return this._super.apply(this, arguments);
        },

        // Helper Functions
        /**
         * Check limits and precision of the value.
         * If the value 'is not a number', the function does nothing to
         * be good with other possible modules.
         *
         * @param {Number} value
         * @returns {Number}
         */
        _sanitizeNumberValue: function(value) {
            let cval = Number(value);
            if (_.isNaN(cval)) {
                return value;
            }
            if (!_.isNaN(this._config.min) && cval < this._config.min) {
                cval = this._config.min;
            } else if (!_.isNaN(this._config.max) && cval > this._config.max) {
                cval = this._config.max;
            }

            const field = this.record.fields[this.name];
            // Formatted value
            return field_utils.format[field.type](cval, field, {
                data: this.record.data,
                escape: true,
                isPassword: false,
                digits: field.digits,
            });
        },
    });

    Registry.add("numeric_step", NumericStep);

    return NumericStep;
});
