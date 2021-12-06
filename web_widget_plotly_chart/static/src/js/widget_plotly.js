odoo.define("web_widget_plotly_chart", function (require) {
    "use strict";

    var fieldRegistry = require("web.field_registry");
    var AbstractField = require("web.AbstractField");

    var PlotlyChartWidget = AbstractField.extend({
        _renderReadonly: function () {
            var val = this.value;
            this.$el.html(val);
        },
    });
    fieldRegistry.add("plotly_chart", PlotlyChartWidget);
    return {
        PlotlyChartWidget: PlotlyChartWidget,
    };
});
