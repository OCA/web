/* Copyright 2021 Tecnativa - Alexandre D. Díaz
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define("web_time_range_menu_custom.TimeRangeMenu", function(require) {
    "use strict";

    const TimeRangeMenu = require("web.TimeRangeMenu");

    TimeRangeMenu.include({
        events: _.extend({}, TimeRangeMenu.prototype.events, {
            "change #time_range_selector": "_onChangeTimeRangeSelector",
            "change .o_comparison_time_range_selector":
                "_onChangeComparisonTimeRangeSelector",
        }),

        renderElement: function() {
            this._super.apply(this, arguments);
            this.$time_range_selector = this.$el.find("#time_range_selector");
            this.$comparison_time_range_selector = this.$el.find(
                ".o_comparison_time_range_selector"
            );
            this.$selector_custom = this.$el.find("#time_range_selector_custom");
            this.$selector_custom_field_value = this.$selector_custom.find(
                "#date_field_selector_custom_value"
            );
            this.$selector_custom_field_type = this.$selector_custom.find(
                "#date_field_selector_custom_type"
            );
            this.$selector_comparison_custom = this.$el.find(
                "#comparison_time_range_selector_custom"
            );
            this.$selector_comparison_custom_field_value = this.$selector_comparison_custom.find(
                "#date_field_selector_comparison_custom_value"
            );
            this.$selector_comparison_custom_field_type = this.$selector_comparison_custom.find(
                "#date_field_selector_comparison_custom_type"
            );

            this.$selector_custom.toggleClass(
                "d-none",
                this.$time_range_selector.val() !== "custom_period"
            );
            this.$selector_comparison_custom.toggleClass(
                "d-none",
                this.$comparison_time_range_selector.val() !==
                    "custom_comparison_period"
            );

            if (!_.isEmpty(this.timeRangeCustom)) {
                this.$selector_custom_field_value.val(this.timeRangeCustom.value);
                this.$selector_custom_field_type.val(this.timeRangeCustom.type);
            }
            if (!_.isEmpty(this.comparisonTimeRangeCustom)) {
                this.$selector_comparison_custom_field_value.val(
                    this.comparisonTimeRangeCustom.value
                );
                this.$selector_comparison_custom_field_type.val(
                    this.comparisonTimeRangeCustom.type
                );
            }
        },

        _onChangeTimeRangeSelector: function(ev) {
            this.$selector_custom.toggleClass(
                "d-none",
                ev.target.value !== "custom_period"
            );
        },

        _onChangeComparisonTimeRangeSelector: function(ev) {
            this.$selector_comparison_custom.toggleClass(
                "d-none",
                ev.target.value !== "custom_comparison_period"
            );
        },

        _onCheckBoxClick: function() {
            this._super.apply(this, arguments);
            const comparisonTimeRangeId = this.$(
                ".o_comparison_time_range_selector"
            ).val();
            this.$selector_comparison_custom.toggleClass(
                "d-none",
                !this.configuration.comparisonIsSelected ||
                    comparisonTimeRangeId !== "custom_comparison_period"
            );
        },

        _onApplyButtonClick: function() {
            const id = this.$(".o_date_field_selector").val();
            const timeRangeId = this.$(".o_time_range_selector").val();
            let comparisonTimeRangeId = false;
            if (this.configuration.comparisonIsSelected) {
                comparisonTimeRangeId = this.$(
                    ".o_comparison_time_range_selector"
                ).val();
            }
            if (
                timeRangeId !== "custom_period" &&
                comparisonTimeRangeId !== "custom_comparison_period"
            ) {
                return this._super.apply(this, arguments);
            }

            const values = {
                id: id,
                timeRangeId: timeRangeId,
                comparisonTimeRangeId: comparisonTimeRangeId,
            };
            this.timeRangeCustom = null;
            if (timeRangeId === "custom_period") {
                const value = this.$selector_custom_field_value.val();
                const type = this.$selector_custom_field_type.val();
                if (!value || !type) {
                    return false;
                }
                this.timeRangeCustom = {
                    value: value,
                    type: type,
                };
                values.timeRangeCustom = this.timeRangeCustom;
            }
            this.comparisonTimeRangeCustom = null;
            if (comparisonTimeRangeId === "custom_comparison_period") {
                const value = this.$selector_comparison_custom_field_value.val();
                const type = this.$selector_comparison_custom_field_type.val();
                if (!value || !type) {
                    return false;
                }
                this.comparisonTimeRangeCustom = {
                    value: value,
                    type: type,
                };
                values.comparisonTimeRangeCustom = this.comparisonTimeRangeCustom;
            }
            this.trigger_up("activate_custom_time_range", values);
        },
    });
});
