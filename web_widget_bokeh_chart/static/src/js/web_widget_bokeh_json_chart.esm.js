import {Component, markup, onMounted, onPatched, onWillStart, useRef} from "@odoo/owl";
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

export default class BokehChartJsonWidget extends Component {
    setup() {
        this.widget = useRef("widget");
        onPatched(() => {
            var script = document.createElement("script");
            script.text = this.props.record.data[this.props.name].script;
            this.widget.el.append(script);
        });
        onMounted(() => {
            var script = document.createElement("script");
            script.text = this.props.record.data[this.props.name].script;
            this.widget.el.append(script);
        });
        onWillStart(() => loadBokehLibraries());
    }
    markup(value) {
        console.log("Marking up...");
        return markup(value);
    }
}

BokehChartJsonWidget.template = "web_widget_bokeh_chart.BokehChartlJsonField";

export const bokehChartJsonWidget = {
    component: BokehChartJsonWidget,
};

registry.category("fields").add("bokeh_chart_json", bokehChartJsonWidget);
