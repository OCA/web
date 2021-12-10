/** @odoo-module **/

import basicFields from "web.basic_fields";
import fieldRegistry from "web.field_registry";

const BokehChartWidget = basicFields.FieldChar.extend({
    jsLibs: [
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-2.4.2.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-api-2.4.2.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-widgets-2.4.2.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-tables-2.4.2.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-mathjax-2.4.2.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-gl-2.4.2.min.js",
    ],
    _renderReadonly: function () {
        try {
            const val = JSON.parse(this.value);
            this.$el.html(val.div);
            const script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            if ("textContent" in script) script.textContent = val.script;
            else script.text = val.script;
            $("head").append(script);
        } catch (error) {
            return this._super(...arguments);
        }
    },
});

fieldRegistry.add("bokeh_chart", BokehChartWidget);

export default BokehChartWidget;
