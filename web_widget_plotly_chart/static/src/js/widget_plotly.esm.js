/** @odoo-module **/
import AbstractField from "web.AbstractField";
import fieldRegistry from "web.field_registry";

var PlotlyChartWidget = AbstractField.extend({
    jsLibs: ["/web_widget_plotly_chart/static/src/lib/plotly/plotly-2.35.2.min.js"],
    /**
     * @override
     */
    _renderReadonly: function () {
        // Create dummy element so we can extract the div and the script elements
        var el = document.createElement("div");
        el.innerHTML = this.value;
        const div = el.getElementsByTagName("div")[0] || "";
        var script = el.getElementsByTagName("script")[0] || "";
        const script_text = script.textContent;
        script.remove();

        // There seems to be something weird going on.
        // It is not enough to simply add the javascript.
        // Nothing will be shown on the page, if we just add the html code.
        // Instead we need to remove the old script element, recreate it, and finally add it again.
        script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        if ("textContent" in script) script.textContent = script_text;
        else script.text = script_text;

        this.$el.html(div);
        this.$el.append(script);

        return this._super.apply(this, arguments);
    },
});

fieldRegistry.add("plotly_chart", PlotlyChartWidget);

export default PlotlyChartWidget;
