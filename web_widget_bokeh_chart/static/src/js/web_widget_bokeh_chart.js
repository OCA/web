odoo.define('web_widget_bokeh_chart', function (require) {
    "use strict";

    const AbstractField = require('web.AbstractField'),
          fieldRegistry = require('web.field_registry')


    var BokehChartWidget = AbstractField.extend({
        _renderReadonly: function() {
            this.$el.html(this.value)
        },
    });

    fieldRegistry.add('bokeh_chart', BokehChartWidget);
});
