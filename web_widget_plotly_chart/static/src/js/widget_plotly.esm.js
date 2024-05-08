/** @odoo-module **/

import {CharField} from "@web/views/fields/char/char_field";
import {loadBundle} from "@web/core/assets";
import {registry} from "@web/core/registry";

import {onPatched, onWillStart, useEffect, useRef} from "@odoo/owl";

export class PlotlyChartWidget extends CharField {
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
            loadBundle({
                jsLibs: [
                    "/web_widget_plotly_chart/static/src/lib/plotly/plotly-2.32.0.min.js",
                ],
            })
        );
    }
    updatePlotly(value) {
        const value_html = $(value);
        const div = value_html.find(".plotly-graph-div").get(0).outerHTML || "";
        const script = value_html.find("script").get(0).textContent || "";

        if (this.widget.el) {
            this.widget.el.innerHTML = div;
            new Function(script)();
        }
    }
}

PlotlyChartWidget.template = "web_widget_plotly_chart.PlotlyChartWidgetField";
PlotlyChartWidget.supportedTypes = ["char", "text"];

export const plotlyChartWidget = {
    ...CharField,
    component: PlotlyChartWidget,
};

registry.category("fields").add("plotly_chart", plotlyChartWidget);
