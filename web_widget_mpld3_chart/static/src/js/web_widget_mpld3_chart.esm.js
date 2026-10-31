import {Component, markup, onMounted, onPatched, onWillStart, useRef} from "@odoo/owl";
import {loadJS} from "@web/core/assets";
import {registry} from "@web/core/registry";

export default class Mpld3ChartJsonWidget extends Component {
    setup() {
        this.widget = useRef("widget");
        const appendScript = () => {
            const chartData = this.props.record.data[this.props.name];
            if (chartData && chartData.script) {
                const script = document.createElement("script");
                script.text = chartData.script;
                this.widget.el.append(script);
            }
        };
        onPatched(appendScript);
        onMounted(appendScript);
        onWillStart(async () => {
            await loadJS("/web_widget_mpld3_chart/static/src/lib/d3/d3.v5.js");
            await loadJS(
                "/web_widget_mpld3_chart/static/src/lib/mpld3/mpld3.v0.5.10.js"
            );
        });
    }
    markup(value) {
        return markup(value);
    }
}

Mpld3ChartJsonWidget.template = "web_widget_mpld3_chart.Mpld3ChartJsonWidget";

export const mpld3ChartJsonWidget = {
    component: Mpld3ChartJsonWidget,
    supportedTypes: ["json"],
};

registry.category("fields").add("mpld3_chart", mpld3ChartJsonWidget);
