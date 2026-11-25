// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    webModels,
} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {queryAll, queryRect} from "@odoo/hoot-dom";
import {browser} from "@web/core/browser/browser";

describe.current.tags("desktop");

class Partner extends models.Model {
    name = fields.Char();
    city = fields.Char();
    email = fields.Char();

    _records = [{id: 1, name: "Partner", city: "City", email: "test@example.com"}];
}

defineModels([Partner, ...Object.values(webModels)]);

for (const editable of [false, true]) {
    for (const delta of [-100, 100]) {
        test(`restored widths follow the pointer: editable=${editable}, delta=${delta}`, async () => {
            for (const field of ["name", "city", "email"]) {
                browser.localStorage.setItem(
                    `odoo.columnWidth.partner.${field}`,
                    "120"
                );
            }
            await mountView({
                resModel: "partner",
                type: "list",
                arch: `<list ${editable ? 'editable="bottom"' : ""}>
                    <field name="name"/>
                    <field name="city"/>
                    <field name="email"/>
                </list>`,
            });

            const header = 'th[data-name="city"]';
            const handle = `${header} .o_resize`;
            const initialHeader = queryRect(header);
            const initialWidths = queryAll("thead th").map(
                (th) => th.getBoundingClientRect().width
            );
            expect(initialHeader.width).toBeGreaterThan(120);
            const {x, y, width, height} = queryRect(handle);
            const {moveTo, drop} = await contains(handle, {visible: false}).drag();
            await moveTo({
                position: {x: x + width / 2 + delta, y: y + height / 2},
            });

            expect(queryRect(header).right - initialHeader.right).toBeCloseTo(delta, {
                margin: 2,
            });
            for (const [index, th] of queryAll("thead th").entries()) {
                if (!th.matches(header)) {
                    expect(th.getBoundingClientRect().width).toBeCloseTo(
                        initialWidths[index],
                        {margin: 2}
                    );
                }
            }
            await drop();
            expect(queryRect(header).right - initialHeader.right).toBeCloseTo(delta, {
                margin: 2,
            });
            expect(
                Number(browser.localStorage.getItem("odoo.columnWidth.partner.city"))
            ).toBeCloseTo(initialHeader.width + delta, {margin: 2});
        });
    }
}
