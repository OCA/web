odoo.define("web.web_widget_json_graph", function (require) {
    "use strict";

    var ajax = require("web.ajax");
    var AbstractField = require("web.AbstractField");
    var field_registry = require("web.field_registry");

    var JSONGraphWidget = AbstractField.extend({
        jsLibs: ["/web/static/lib/Chart/Chart.js"],
        willStart: function () {
            this._super();
            return ajax.loadLibs(this);
        },
        start: function () {
            var config = JSON.parse(this.value);
            this.$canvas = $("<canvas/>");
            this.$el.empty();
            this.$el.append(this.$canvas);
            var context = this.$canvas[0].getContext("2d");
            // eslint-disable-next-line no-undef
            this.chart = new Chart(context, config);
            return this.chart;
        },
        _destroy: function () {
            return this._super();
        },
    });
    field_registry.add("json_graph", JSONGraphWidget);
});
