/** @odoo-module **/

import basicFields from "web.basic_fields";
import fieldRegistry from "web.field_registry";

const Mpld3ChartWidget = basicFields.FieldChar.extend({
    jsLibs: [
        "/web_widget_mpld3_chart/static/src/lib/d3/d3.v5.js",
        "/web_widget_mpld3_chart/static/src/lib/mpld3/mpld3.v0.5.7.js",
    ],
    _renderReadonly: function () {
        try {
            const val = JSON.parse(this.value);
            const new_div = document.createElement("div");
            new_div.setAttribute("id", val.div);
            this.$el.html(new_div);
            this.$el.ready(function () {
                const script = document.createElement("script");
                script.setAttribute("type", "text/javascript");
                if ("textContent" in script) script.textContent = val.script;
                else script.text = val.script;
                $("head").append(script);
            });
        } catch (error) {
            return this._super(...arguments);
        }
    },
});

fieldRegistry.add("mpld3_chart", Mpld3ChartWidget);
export default Mpld3ChartWidget;
