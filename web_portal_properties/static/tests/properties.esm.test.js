import {animationFrame, click, expect, runAllTimers, test} from "@odoo/hoot";
import {
    defineModels,
    fields,
    models,
    mountView,
    onRpc,
    toggleActionMenu,
} from "@web/../tests/web_test_helpers";
import {defineMailModels} from "@mail/../tests/mail_test_helpers";

class Partner extends models.Model {
    display_name = fields.Char();
    properties = fields.Properties({
        string: "Properties",
        searchable: false,
        definition_record: "company_id",
        definition_record_field: "definitions",
    });
    company_id = fields.Many2one({
        string: "Company",
        relation: "properties.definition.model",
    });
    _records = [
        {
            id: 1,
            display_name: "first partner",
            properties: {
                property_1: "char value",
                property_2: "b",
            },
            company_id: 37,
        },
    ];
}

class PropertiesDefinitionModel extends models.Model {
    _name = "properties.definition.model";
    name = fields.Char({string: "Name"});
    definitions = fields.PropertiesDefinition();
    _records = [
        {
            id: 37,
            name: "Company 1",
            definitions: [],
        },
    ];
}

defineModels([Partner, PropertiesDefinitionModel]);
defineMailModels();
test("Portal Properties: check field", async () => {
    onRpc("has_access", () => true);
    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: `
                <form>
                    <sheet>
                        <group>
                            <field name="company_id"/>
                            <field name="properties" widget="portal_properties"/>
                        </group>
                    </sheet>
                </form>`,
        actionMenus: {},
    });
    expect(".o_field_properties").toHaveCount(1);
    await toggleActionMenu();
    await animationFrame();
    expect(".o-dropdown--menu span:contains(Add Properties)").toHaveCount(1, {
        message: "The add button must be in the cog menu",
    });
    await click(".o-dropdown--menu span .fa-cogs");
    await runAllTimers();
    await animationFrame();
    expect(".o_property_field_popover").toHaveCount(1, {
        message: "Should have opened the definition popover",
    });
    expect(".o_property_field_popover .o_property_display_in_portal").toHaveCount(1, {
        message: "The display in portal checkbox should be visible",
    });
});
