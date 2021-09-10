odoo.define("web_widget_mpld3_chart", function (require) {
    "use strict";

    var fieldRegistry = require("web.field_registry");
    var AbstractField = require("web.AbstractField");

    var Mpld3ChartWidget = AbstractField.extend({
        start: function () {
            var val = this.value;
            this.$el.html(val);
        },
    });
    fieldRegistry.add("mpld3_chart", Mpld3ChartWidget);
    return {
        Mpld3ChartWidget: Mpld3ChartWidget,
    };
});
