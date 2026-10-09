import {describe, expect, test} from "@odoo/hoot";
import {registry} from "@web/core/registry";

describe.current.tags("headless");

test("the grid view type is registered", () => {
    expect(registry.category("views").contains("grid_view")).toBe(true);
});

test("cell widgets are registered", () => {
    const components = registry.category("grid_components");
    expect(components.contains("float")).toBe(true);
    expect(components.contains("integer")).toBe(true);
    expect(components.contains("float_time")).toBe(true);
    expect(components.contains("float_toggle")).toBe(true);
});

test("row label widgets are registered", () => {
    const components = registry.category("grid_row_components");
    expect(components.contains("many2one")).toBe(true);
    expect(components.contains("selection")).toBe(true);
    expect(components.contains("char")).toBe(true);
});
