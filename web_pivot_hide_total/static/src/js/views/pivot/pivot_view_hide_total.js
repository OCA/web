odoo.define("web_pivot_hide_total.PivotViewHideTotal", function (require) {
    "use strict";

    const PivotView = require("web.PivotView");
    const PivotModelHideTotal = require("web.PivotModelHideTotal");
    const viewRegistry = require("web.view_registry");

    const PivotViewHideTotal = PivotView.extend({
        config: _.extend({}, PivotView.prototype.config, {
            Model: PivotModelHideTotal,
        }),
    });

    viewRegistry.add("web_pivot_hide_total", PivotViewHideTotal);

    return PivotViewHideTotal;
});
