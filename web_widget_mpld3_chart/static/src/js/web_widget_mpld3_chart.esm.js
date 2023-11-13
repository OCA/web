/** @odoo-module **/

import {CharField} from "@web/views/fields/char/char_field";
import {loadBundle} from "@web/core/assets";
import {registry} from "@web/core/registry";
const {onWillStart, markup} = owl;
class Mpld3ChartWidget extends CharField {
    setup() {
        super.setup();
        onWillStart(() =>
            loadBundle({
                jsLibs: [
                    "/web_widget_mpld3_chart/static/src/lib/d3/d3.v5.js",
                    "/web_widget_mpld3_chart/static/src/lib/mpld3/mpld3.v0.5.9.js",
                ],
            })
        );
    }
    get json_value() {
        try {
            var value = JSON.parse(this.props.value);
            value.div = markup(value.div.trim());
            return value;
        } catch (error) {
            return {};
        }
    }
}
Mpld3ChartWidget.template = "web_widget_mpld3_chart.Mpld3ChartField";
registry.category("fields").add("mpld3_chart", Mpld3ChartWidget);

export default Mpld3ChartWidget;
