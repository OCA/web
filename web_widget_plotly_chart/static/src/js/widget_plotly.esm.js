import {CharField, charField} from "@web/views/fields/char/char_field";
import {onPatched, onWillStart, useEffect, useRef} from "@odoo/owl";
import {loadJS} from "@web/core/assets";
import {registry} from "@web/core/registry";

export class PlotlyChartWidget extends CharField {
    static template = "web_widget_plotly_chart.PlotlyChartWidgetField";

    setup() {
        super.setup();

        this.widget = useRef("widget");

        onPatched(() => {
            this.updatePlotly(this.props.record.data[this.props.name]);
        });

        useEffect(() => {
            this.updatePlotly(this.props.record.data[this.props.name]);
        });

        onWillStart(() =>
            loadJS(
                "/web_widget_plotly_chart/static/src/lib/plotly/plotly-2.32.0.min.js"
            )
        );
    }

    updatePlotly(value) {
        const doc = new DOMParser().parseFromString(value || "", "text/html");
        const div = doc.querySelector(".plotly-graph-div")?.outerHTML || "";
        const script = doc.querySelector("script")?.textContent || "";

        if (this.widget.el) {
            this.widget.el.innerHTML = div;
            new Function(script)();
        }
    }
}

export const plotlyChartWidget = {
    ...charField,
    component: PlotlyChartWidget,
    supportedTypes: ["char", "text"],
};

registry.category("fields").add("plotly_chart", plotlyChartWidget);
