import {Component, xml} from "@odoo/owl";
import {useBus, useService} from "@web/core/utils/hooks";
import {registry} from "@web/core/registry";

export class WebEnvironmentRibbon extends Component {
    setup() {
        this.orm = useService("orm");
        useBus(this.env.bus, "WEB_CLIENT_READY", () => this.showRibbon());
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

    async showRibbon() {
        const ribbon = document.getElementsByClassName("test-ribbon")[0];
        ribbon.style.display = "none";
        // Get ribbon data from backend
        const ribbon_data = await this.orm.call(
            "web.environment.ribbon.backend",
            "get_environment_ribbon"
        );
        // Ribbon name
        if (ribbon_data.name && ribbon_data.name !== "False") {
            ribbon.style.display = "block";
            ribbon.innerHTML = ribbon_data.name;
        }
        // Ribbon color
        if (ribbon_data.color && this.validStrColour(ribbon_data.color)) {
            ribbon.style.color = ribbon_data.color;
        }
        // Ribbon background color
        if (
            ribbon_data.background_color &&
            this.validStrColour(ribbon_data.background_color)
        ) {
            ribbon.style.backgroundColor = ribbon_data.background_color;
        }
    }
}

WebEnvironmentRibbon.props = {};
WebEnvironmentRibbon.template = xml`<div class="test-ribbon" style="display:none"/>`;

registry.category("main_components").add("WebEnvironmentRibbon", {
    Component: WebEnvironmentRibbon,
});
