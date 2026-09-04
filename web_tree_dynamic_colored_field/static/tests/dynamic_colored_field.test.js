import {defineModels, fields, models, mountView} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {queryAll} from "@odoo/hoot-dom";

describe.current.tags("desktop");

class Partner extends models.Model {
    name = fields.Char();
    amount = fields.Integer();
    _records = [
        {id: 1, name: "Over", amount: 5000},
        {id: 2, name: "Under", amount: 10},
    ];
}

class User extends models.Model {
    _name = "res.users";
    has_group() {
        return true;
    }
}

defineModels([Partner, User]);

describe("DynamicColoredField", () => {
    test("applies bg_color to the rows whose expression matches", async () => {
        await mountView({
            type: "list",
            resModel: "partner",
            arch: `
                <list>
                    <field name="name" options="{'bg_color': 'red: amount &gt; 1000'}" />
                    <field name="amount" />
                </list>`,
        });
        // Only the over-1000 row's name cell gets the red background.
        const colored = queryAll("tr.o_data_row td").filter(
            (td) => td.style.backgroundColor === "red"
        );
        expect(colored.length).toBe(1);
    });

    test("skips a color expression referencing a field absent from the view", async () => {
        await mountView({
            type: "list",
            resModel: "partner",
            arch: `
                <list>
                    <field name="name" options="{'bg_color': 'red: missing_field &gt; 0'}" />
                </list>`,
        });
        // The list still renders (the patch caught the eval error instead of
        // throwing an OwlError) and no cell is colored.
        expect(queryAll("tr.o_data_row").length).toBe(2);
        const colored = queryAll("tr.o_data_row td").filter(
            (td) => td.style.backgroundColor
        );
        expect(colored.length).toBe(0);
    });
});
