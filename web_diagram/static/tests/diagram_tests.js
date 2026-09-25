/** @odoo-module */

import { describe, expect, test } from "@odoo/hoot";
import { registry } from "@web/core/registry";

// Import the view to ensure it is registered before tests run.
import "@web_diagram/js/diagram_view";

describe("DiagramView", () => {
    test("diagram view is registered in view registry", () => {
        const views = registry.category("views");
        expect(views.contains("diagram")).toBe(true);
        const diagramView = views.get("diagram");
        expect(diagramView.type).toBe("diagram");
        expect(diagramView.multiRecord).toBe(false);
    });
});
