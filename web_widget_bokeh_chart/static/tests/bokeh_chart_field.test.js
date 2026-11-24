/**
 * Copyright 2026 ForgeFlow S.L.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
 */
import {animationFrame, describe, expect, test} from "@odoo/hoot";
import {
    defineModels,
    destroyApp,
    fields,
    models,
    mountView,
    pagerNext,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {loadBokehLibraries} from "@web_widget_bokeh_chart/js/web_widget_bokeh_chart.esm";

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
        {
            id: 2,
            bokeh_chart: JSON.stringify({
                div: DIV,
                script: "window.Bokeh.embed.embed_items('second');",
            }),
            bokeh_chart_json: {
                div: DIV,
                script: "window.Bokeh.embed.embed_items('second');",
            },
        },
        {
            id: 3,
            bokeh_chart: JSON.stringify({
                div: DIV,
                script: "window.Bokeh.embed.embed_items('third');",
            }),
            bokeh_chart_json: {
                div: DIV,
                script: "window.Bokeh.embed.embed_items('third');",
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

async function mockEmbedItems() {
    await loadBokehLibraries();
    const embeds = [];
    patchWithCleanup(window.Bokeh.embed, {
        embed_items(name) {
            return new Promise((resolve, reject) => embeds.push({name, reject}));
        },
    });
    return embeds;
}

for (const name of ["bokeh_chart", "bokeh_chart_json"]) {
    test(`${name} widget ignores a failed embed of a replaced chart`, async () => {
        const embeds = await mockEmbedItems();
        await mountView({
            type: "form",
            resModel: "chart",
            resId: 2,
            resIds: [2, 3],
            arch: `<form><field name="${name}" widget="${name}"/></form>`,
        });
        expect(embeds.map((embed) => embed.name)).toEqual(["second"]);
        await pagerNext();
        expect(embeds.map((embed) => embed.name)).toEqual(["second", "third"]);
        expect(`.o_field_${name} script`).toHaveCount(1);
        embeds[0].reject(new Error("could not find HTML tag"));
        await animationFrame();
        expect.verifyErrors([]);
    });

    test(`${name} widget ignores a failed embed of a destroyed chart`, async () => {
        const embeds = await mockEmbedItems();
        await mountView({
            type: "form",
            resModel: "chart",
            resId: 2,
            arch: `<form><field name="${name}" widget="${name}"/></form>`,
        });
        expect(embeds).toHaveLength(1);
        destroyApp();
        expect(`.o_field_${name}`).toHaveCount(0);
        embeds[0].reject(new Error("could not find HTML tag"));
        await animationFrame();
        expect.verifyErrors([]);
    });

    test(`${name} widget raises a failed embed of the current chart`, async () => {
        expect.errors(1);
        const embeds = await mockEmbedItems();
        await mountView({
            type: "form",
            resModel: "chart",
            resId: 2,
            arch: `<form><field name="${name}" widget="${name}"/></form>`,
        });
        expect(embeds).toHaveLength(1);
        embeds[0].reject(new Error("invalid chart"));
        await animationFrame();
        expect.verifyErrors(["invalid chart"]);
    });
}
