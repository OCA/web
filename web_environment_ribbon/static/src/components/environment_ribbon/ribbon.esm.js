/** @odoo-module **/

import {Component, xml} from "@odoo/owl";
import {useBus, useService} from "@web/core/utils/hooks";
import {registry} from "@web/core/registry";

export class WebEnvironmentRibbon extends Component {
    setup() {
        this.orm = useService("orm");
        useBus(this.env.bus, "WEB_CLIENT_READY", this.showRibbon.bind(this));
    }

    // Code from: http://jsfiddle.net/WK_of_Angmar/xgA5C/
    validStrColour(strToTest) {
        if (strToTest === "") {
            return false;
        }
        if (strToTest === "inherit") {
            return true;
        }
        if (strToTest === "transparent") {
            return true;
        }
        const image = document.createElement("img");
        image.style.color = "rgb(0, 0, 0)";
        image.style.color = strToTest;
        if (image.style.color !== "rgb(0, 0, 0)") {
            return true;
        }
        image.style.color = "rgb(255, 255, 255)";
        image.style.color = strToTest;
        return image.style.color !== "rgb(255, 255, 255)";
    }

    showRibbon() {
        const ribbon = $(".test-ribbon");
        const self = this;
        ribbon.hide();
        // Get ribbon data from backend
        self.orm
            .call("web.environment.ribbon.backend", "get_environment_ribbon")
            .then(function (ribbon_data) {
                // Ribbon name
                if (ribbon_data.name && ribbon_data.name !== "False") {
                    ribbon.show();
                    ribbon.html(ribbon_data.name);
                }
                // Ribbon color
                if (ribbon_data.color && self.validStrColour(ribbon_data.color)) {
                    ribbon.css("color", ribbon_data.color);
                }
                // Ribbon background color
                if (
                    ribbon_data.background_color &&
                    self.validStrColour(ribbon_data.background_color)
                ) {
                    ribbon.css("background-color", ribbon_data.background_color);
                }
            });
    }
}

WebEnvironmentRibbon.props = {};
WebEnvironmentRibbon.template = xml`<div class="test-ribbon" />`;

registry.category("main_components").add("WebEnvironmentRibbon", {
    Component: WebEnvironmentRibbon,
});
