/* Copyright 2021 Tecnativa - Alexandre D. Díaz
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define(
    "web_time_range_menu_custom.controlPanelViewParameters",
    function (require) {
        "use strict";

        const controlPanelViewParameters = require("web.controlPanelViewParameters");
        const core = require("web.core");

        const _lt = core._lt;

        controlPanelViewParameters.PERIOD_OPTIONS =
            controlPanelViewParameters.PERIOD_OPTIONS.concat([
                {
                    description: _lt("Custom Period"),
                    optionId: "custom_period",
                    groupId: 4,
                },
            ]);
        controlPanelViewParameters.TIME_RANGE_OPTIONS =
            controlPanelViewParameters.PERIOD_OPTIONS;

        controlPanelViewParameters.COMPARISON_TIME_RANGE_OPTIONS =
            controlPanelViewParameters.COMPARISON_TIME_RANGE_OPTIONS.concat([
                {
                    description: _lt("Custom Period"),
                    optionId: "custom_comparison_period",
                },
            ]);
    }
);
