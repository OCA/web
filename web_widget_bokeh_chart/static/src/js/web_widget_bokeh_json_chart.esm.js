/** @odoo-module **/

import {Component, markup, onMounted, onPatched, onWillStart, useRef} from "@odoo/owl";
import {loadBundle} from "@web/core/assets";
import {registry} from "@web/core/registry";

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
        onWillStart(() =>
            loadBundle({
                jsLibs: [
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-3.4.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-api-3.4.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-widgets-3.4.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-tables-3.4.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-mathjax-3.4.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-gl-3.4.1.min.js",
                ],
            })
        );
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
