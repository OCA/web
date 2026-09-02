/** @odoo-module */

import { registry } from "@web/core/registry";
import { DiagramController } from "./diagram_controller";

export const diagramView = {
    type: "diagram",
    display_name: "Diagram",
    icon: "fa-code-fork",
    multiRecord: false,
    Controller: DiagramController,
};

registry.category("views").add("diagram", diagramView);
