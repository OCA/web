odoo.define('web_widget_bokeh_chart', function (require) {
"use strict";

    var core = require('web.core');
    var form_common = require('web.form_common');
    var formats = require('web.formats');
    var Model = require('web.Model');

    var QWeb = core.qweb;

    var BokehChartWidget = form_common.AbstractField.extend({
        render_value: function() {
            var self = this;
            var val = this.get('value')
            this.$el.html(val)
        },
    });
    core.form_widget_registry.add('bokeh_chart', BokehChartWidget);
});
