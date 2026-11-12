import {
    Component,
    markup,
    onMounted,
    onPatched,
    onWillStart,
    signal,
    useProps,
} from "@odoo/owl";
import {loadJS} from "@web/core/assets";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

export async function loadBokehLibraries() {
    const scripts = [
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-3.10.1.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-api-3.10.1.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-widgets-3.10.1.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-tables-3.10.1.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-mathjax-3.10.1.min.js",
        "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-gl-3.10.1.min.js",
    ];

    for (const script of scripts) {
        await loadJS(script);
    }
}

export default class BokehChartJsonWidget extends Component {
    props = useProps(standardFieldProps);
    widget = signal.ref();

    setup() {
        onPatched(() => {
            var script = document.createElement("script");
            script.text = this.props.record.data[this.props.name].script;
            this.widget().append(script);
        });
        onMounted(() => {
            var script = document.createElement("script");
            script.text = this.props.record.data[this.props.name].script;
            this.widget().append(script);
        });
        onWillStart(() => loadBokehLibraries());
    }
    markup(value) {
        return markup(value);
    }
}

BokehChartJsonWidget.template = "web_widget_bokeh_chart.BokehChartlJsonField";

export const bokehChartJsonWidget = {
    component: BokehChartJsonWidget,
};

registry.category("fields").add("bokeh_chart_json", bokehChartJsonWidget);
