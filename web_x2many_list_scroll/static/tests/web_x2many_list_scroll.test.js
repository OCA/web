/* Copyright 2026 Jarsa
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */
import {
    defineModels,
    fields,
    models,
    mountView,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {queryOne} from "@odoo/hoot-dom";
import {session} from "@web/session";

describe.current.tags("desktop");

class Order extends models.Model {
    line_ids = fields.One2many({
        string: "Lines",
        relation: "line",
        relation_field: "order_id",
    });
    _records = [{id: 1, line_ids: [1, 2, 3]}];
}
class Line extends models.Model {
    order_id = fields.Many2one({relation: "order"});
    name = fields.Char();
    _records = [
        {id: 1, order_id: 1, name: "a"},
        {id: 2, order_id: 1, name: "b"},
        {id: 3, order_id: 1, name: "c"},
    ];
}
defineModels([Order, Line]);

const LINES = `<list><field name="name"/></list>`;

async function mountOrder(fieldAttrs = "") {
    await mountView({
        type: "form",
        resModel: "order",
        resId: 1,
        arch: `<form><field name="line_ids" ${fieldAttrs}>${LINES}</field></form>`,
    });
    return queryOne(".o_field_x2many");
}

test("the setting makes the list scroll within its rows", async () => {
    patchWithCleanup(session, {web_x2many_list_scroll_rows: 12});
    const field = await mountOrder();
    expect(field).toHaveClass("o_web_x2many_list_scroll");
    expect(field.style.getPropertyValue("--o-x2many-list-scroll-rows")).toBe("12");
    const header = field.querySelector(".o_list_table thead");
    expect(getComputedStyle(header).position).toBe("sticky");
    expect(field.style.getPropertyValue("--o-x2many-list-scroll-row-height")).toMatch(
        /^\d+px$/,
        {
            message: "the row height is measured on the rendered list",
        }
    );
    expect(
        field.style.getPropertyValue("--o-x2many-list-scroll-header-height")
    ).toMatch(/^\d+px$/);
    expect(getComputedStyle(header).zIndex).toBe("2", {
        message: "the header paints over the widgets of the rows rolling under it",
    });
});

test("without the setting the list is left alone", async () => {
    patchWithCleanup(session, {web_x2many_list_scroll_rows: 0});
    const field = await mountOrder();
    expect(field).not.toHaveClass("o_web_x2many_list_scroll");
    expect(field.style.getPropertyValue("--o-x2many-list-scroll-rows")).toBe("");
});

test("the view sets its own number of rows", async () => {
    patchWithCleanup(session, {web_x2many_list_scroll_rows: 12});
    const field = await mountOrder(`options="{'scroll_rows': 5}"`);
    expect(field).toHaveClass("o_web_x2many_list_scroll");
    expect(field.style.getPropertyValue("--o-x2many-list-scroll-rows")).toBe("5");
});

test("the view turns it off with zero", async () => {
    patchWithCleanup(session, {web_x2many_list_scroll_rows: 12});
    const field = await mountOrder(`options="{'scroll_rows': 0}"`);
    expect(field).not.toHaveClass("o_web_x2many_list_scroll");
});
