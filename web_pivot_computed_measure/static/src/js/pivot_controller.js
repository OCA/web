/* Copyright 2020 Tecnativa - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

odoo.define('web_pivot_computed_measure.PivotController', function (require) {
    "use strict";

    var core = require('web.core');
    var config = require('web.config');
    var PivotController = require('web.PivotController');

    var QWeb = core.qweb;


    PivotController.include({
        custom_events: _.extend({}, PivotController.prototype.custom_events, {
            add_measure: '_onAddMeasure',
            remove_measure: '_onRemoveMeasure',
        }),

        computed_measures_open: false,

        /**
         * Add the computed measures to the context. This
         * will be used when save a filter.
         *
         * @override
         */
        getContext: function () {
            var res = this._super.apply(this, arguments);
            var state = this.model.get();
            res.pivot_computed_measures = state.computed_measures;
            return res;
        },

        /**
         * @override
         */
        renderButtons: function($node) {
            this._super.apply(this, arguments);
            if ($node) {
                this._renderComputedMeasures();
            }
        },

        /**
         * Handle click event on measures menu to support computed measures sub-menu
         *
         * @override
         */
        _onButtonClick: function (event) {
            var $target = $(event.target);
            if ($target.parents("div[data-id='__computed__']").length) {
                var hideMenu = false;
                event.preventDefault();

                if ($target.hasClass('dropdown-item') || $target.hasClass('o_submenu_switcher')) {
                    this.computed_measures_open = !this.computed_measures_open;
                    this._renderComputedMeasures();
                } else if ($target.hasClass('o_add_computed_measure')) {
                    hideMenu = true;
                    var field1 = this.$buttons_measures_ex.find('#computed_measure_field_1').val();
                    var field2 = this.$buttons_measures_ex.find('#computed_measure_field_2').val();
                    var oper = this.$buttons_measures_ex.find('#computed_measure_operation').val();
                    if (oper === "custom") {
                        oper = this.$buttons_measures_ex.find('#computed_measure_operation_custom').val();
                    }
                    var name = this.$buttons_measures_ex.find('#computed_measure_name').val();
                    var format = this.$buttons_measures_ex.find('#computed_measure_format').val();
                    var uniqueId = (new Date()).getTime();
                    this.model.createComputedMeasure(uniqueId, field1, field2, oper, name, format)
                        .then(this.update.bind(this, {}, {reload: false}));
                }

                if (!hideMenu) {
                    event.stopPropagation();
                }

                return;
            }

            this._super.apply(this, arguments);
        },

        /**
         * Render computed measures menu
         */
        _renderComputedMeasures: function() {
            if (this.$buttons_measures_ex && this.$buttons_measures_ex.length) {
                this.$buttons_measures_ex.remove();
            }
            var self = this;
            var measures = _.sortBy(_.pairs(_.omit(this.measures, '__count')), function (x) { return x[1].string.toLowerCase(); });
            this.$buttons_measures_ex = $(QWeb.render('web_pivot_computed_measure.ExtendedMenu', {
                isOpen: this.computed_measures_open,
                debug: config.debug,
                measures: measures,
                computed_measures: _.map(_.reject(measures, function(item) { return !item[1].__computed_id; }), function(item) {
                    item[1].active = _.contains(self.model.data.measures, item[0]);
                    return item;
                }),
            }));
            this.$buttons_measures_ex.find('#computed_measure_operation').on('change', this._onChangeComputedMeasureOperation.bind(this));
            this.$buttons.find('.o_pivot_measures_list').append(this.$buttons_measures_ex);
        },

        /**
         * Custom event to add a new measure
         *
         * @param {CustomEvent} ev
         */
        _onAddMeasure: function(ev) {
            this.measures[ev.data.id] = ev.data.def;
            this._renderComputedMeasures();
        },

        /**
         * Custom event to remove a measure
         *
         * @param {CustomEvent} ev
         */
        _onRemoveMeasure: function(ev) {
            delete this.measures[ev.data.id];
            this._renderComputedMeasures();
        },

        /**
         * Set default values related with the selected operation
         *
         * @param {ChangeEvent} ev
         */
        _onChangeComputedMeasureOperation: function(ev) {
            var $option = $(ev.target.options[ev.target.selectedIndex]);
            if ($(ev.target).val() === "custom") {
                this.$buttons_measures_ex.find('#container_computed_measure_operation_custom').removeClass('d-none');
            } else {
                var format = $option.data('format');
                if (format) {
                    this.$buttons_measures_ex.find('#computed_measure_format').val(format);
                }
                this.$buttons_measures_ex.find('#container_computed_measure_operation_custom').addClass('d-none');
            }
        }
    });

});
