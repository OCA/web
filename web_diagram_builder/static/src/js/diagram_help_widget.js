/** @odoo-module */

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";

class DiagramHelpWidget extends Component {
    static template = "web_diagram_builder.DiagramHelpWidget";
    static props = ["*"];

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");
    }

    get label() {
        return _t("How does it work?");
    }

    async openHelp() {
        const helpAction = await this.orm.call(
            "web.diagram.builder",
            "get_help_action",
            [],
        );
        this.action.doAction(helpAction);
    }
}

registry.category("view_widgets").add("diagram_help_button", {
    component: DiagramHelpWidget,
});
