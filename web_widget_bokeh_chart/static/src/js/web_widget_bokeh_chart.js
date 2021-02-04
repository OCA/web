odoo.define("web_widget_bokeh_chart", function (require) {
    "use strict";

    var fieldRegistry = require("web.field_registry");
    var AbstractField = require("web.AbstractField");

    var BokehChartWidget = AbstractField.extend({
        _renderReadonly: function () {
            var val = this.value;
            this.$el.html(val);
        },
    });
    fieldRegistry.add("bokeh_chart", BokehChartWidget);
    return {
        BokehChartWidget: BokehChartWidget,
    };
});
