odoo.define("web_time_range_menu_custom.ControlPanelController", function (require) {
    "use strict";

    const ControlPanelController = require("web.ControlPanelController");

    ControlPanelController.include({
        custom_events: _.extend({}, ControlPanelController.prototype.custom_events, {
            activate_custom_time_range: "_onActivateCustomTimeRange",
        }),

        /**
         * @override
         */
        _onActivateCustomTimeRange: function (ev) {
            ev.stopPropagation();
            this.model.activateTimeRangeCustom(
                ev.data.id,
                ev.data.timeRangeId,
                ev.data.comparisonTimeRangeId,
                ev.data.timeRangeCustom,
                ev.data.comparisonTimeRangeCustom
            );
            this._reportNewQueryAndRender();
        },
    });
});
