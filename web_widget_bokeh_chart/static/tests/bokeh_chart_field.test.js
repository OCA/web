/**
 * Copyright 2026 ForgeFlow S.L.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
 */
import {defineModels, fields, models, mountView} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";

describe.current.tags("desktop");

const DIV = '<div class="o_test_bokeh_div">chart</div>';

class Chart extends models.Model {
    bokeh_chart = fields.Text();
    bokeh_chart_json = fields.Json();

    _records = [
        {
            id: 1,
            bokeh_chart: JSON.stringify({
                div: DIV,
                script: "window.bokehCharTestLoaded = true;",
            }),
            bokeh_chart_json: {
                div: DIV,
                script: "window.bokehJsonTestLoaded = true;",
            },
        },
    ];
}

defineModels([Chart]);

test("bokeh_chart widget renders the div and runs the script", async () => {
    await mountView({
        type: "form",
        resModel: "chart",
        resId: 1,
        arch: `<form><field name="bokeh_chart" widget="bokeh_chart"/></form>`,
    });
    expect(".o_field_bokeh_chart .o_test_bokeh_div").toHaveCount(1);
    expect(".o_field_bokeh_chart script").toHaveCount(1);
    expect(window.bokehCharTestLoaded).toBe(true);
    expect(typeof window.Bokeh).toBe("object");
});

test("bokeh_chart_json widget renders the div and runs the script", async () => {
    await mountView({
        type: "form",
        resModel: "chart",
        resId: 1,
        arch: `<form><field name="bokeh_chart_json" widget="bokeh_chart_json"/></form>`,
    });
    expect(".o_field_bokeh_chart_json .o_test_bokeh_div").toHaveCount(1);
    expect(".o_field_bokeh_chart_json script").toHaveCount(1);
    expect(window.bokehJsonTestLoaded).toBe(true);
});
