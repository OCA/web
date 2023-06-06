/** @odoo-module **/

import {CharField} from "@web/views/fields/char/char_field";
import {registry} from "@web/core/registry";
import {loadBundle} from "@web/core/assets";
const {onWillStart, markup} = owl;
class BokehChartWidget extends CharField {
    setup() {
        super.setup();
        onWillStart(() =>
            loadBundle({
                jsLibs: [
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-3.1.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-api-3.1.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-widgets-3.1.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-tables-3.1.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-mathjax-3.1.1.min.js",
                    "/web_widget_bokeh_chart/static/src/lib/bokeh/bokeh-gl-3.1.1.min.js",
                ],
            })
        );
    }
    get json_value() {
        var value = JSON.parse(this.props.value);
        value.div = markup(value.div.trim());
        return value;
    }
}
BokehChartWidget.template = "web_widget_bokeh_chart.BokehChartField";
registry.category("fields").add("bokeh_chart", BokehChartWidget);

export default BokehChartWidget;
