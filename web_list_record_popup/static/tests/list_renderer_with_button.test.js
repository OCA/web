/* @odoo-module */
/* eslint-disable sort-imports */

import {animationFrame} from "@odoo/hoot-mock";
import {click} from "@odoo/hoot-dom";
import {expect, test} from "@odoo/hoot";
import {defineModels, fields, models, mountView} from "@web/../tests/web_test_helpers";

class Parent extends models.Model {
    name = fields.Char();
    line_ids = fields.One2many({
        string: "Lines",
        relation: "line",
        relation_field: "parent_id",
    });

    _records = [
        {
            id: 1,
            name: "Test Parent Record",
            line_ids: [1],
        },
    ];
}

class Line extends models.Model {
    name = fields.Char();
    parent_id = fields.Many2one({relation: "parent"});

    _records = [
        {
            id: 1,
            name: "Test Line Record 1",
            parent_id: 1,
        },
    ];
}

defineModels([Parent, Line]);

test("click on edit-line-popup button inside a list opens the form dialog", async () => {
    await mountView({
        type: "form",
        resModel: "parent",
        resId: 1,
        arch: `
            <form>
                <field name="name"/>
                <field name="line_ids">
                    <list editable="bottom">
                        <button name="dummy_button_for_js" class="edit-line-popup" icon="fa-external-link"/>
                        <field name="name"/>
                    </list>
                </field>
            </form>
        `,
    });

    // 1. Check if the button is injected properly
    expect(".edit-line-popup").toHaveCount(1);

    // 2. Ensure no dialog is open yet
    expect(".o_dialog").toHaveCount(0);

    // 3. Click the button
    await click(".edit-line-popup");
    await animationFrame();

    // 4. The modal popup (Form View) should now be opened
    expect(".o_dialog .o_form_view").toHaveCount(1);
});

test("click on edit-line-popup button for new record opens form dialog", async () => {
    await mountView({
        type: "form",
        resModel: "parent",
        resId: 1,
        arch: `
            <form>
                <field name="name"/>
                <field name="line_ids">
                    <list editable="bottom">
                        <button name="dummy_button_for_js" class="edit-line-popup" icon="fa-external-link"/>
                        <field name="name"/>
                    </list>
                </field>
            </form>
        `,
    });

    // Add a new line
    await click(".o_field_x2many_list_row_add a");
    await animationFrame();

    // Should have 2 buttons now (1 existing + 1 new)
    expect(".edit-line-popup").toHaveCount(2);

    // Click on the new line's popup button (last one)
    const buttons = document.querySelectorAll(".edit-line-popup");
    buttons[buttons.length - 1].click();
    await animationFrame();

    // Dialog should open for the new record
    expect(".o_dialog .o_form_view").toHaveCount(1);
});
