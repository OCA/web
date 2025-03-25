import {markup, onMounted, onPatched, onWillStart, useRef} from "@odoo/owl";
import {CharField, charField} from "@web/views/fields/char/char_field";
import {loadJS} from "@web/core/assets";
import {registry} from "@web/core/registry";

export async function loadBokehLibraries() {
    const scripts = [
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-3.6.3.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-api-3.6.3.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-widgets-3.6.3.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-tables-3.6.3.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-mathjax-3.6.3.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-gl-3.6.3.min.js",
    ];

    for (const script of scripts) {
        await loadJS(script);
    }
}
export default class BokehChartWidget extends CharField {
    setup() {
        this.widget = useRef("widget");
        onPatched(() => {
            var script = document.createElement("script");
            script.text = this.json_value.script;
            this.widget.el.append(script);
        });
        onMounted(() => {
            var script = document.createElement("script");
            script.text = this.json_value.script;
            this.widget.el.append(script);
        });
        super.setup();
        onWillStart(() => loadBokehLibraries());
    }
    get json_value() {
        var value = false;
        if (this.props.record.data[this.props.name]) {
            value = JSON.parse(this.props.record.data[this.props.name]);
            if (value) {
                value.div = markup(value.div.trim());
            }
        }
        return value;
    }
}
BokehChartWidget.template = "web_widget_bokeh_chart.BokehChartField";

export const bokehChartWidget = {
    ...charField,
    component: BokehChartWidget,
};

registry.category("fields").add("bokeh_chart", bokehChartWidget);
