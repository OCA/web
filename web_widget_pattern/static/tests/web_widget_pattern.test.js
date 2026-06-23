import {defineModels, fields, models, mountView} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";

describe.current.tags("desktop");

class Main extends models.Model {
    char_field_without_pattern = fields.Char({
        string: "Char field 1",
    });
    char_field_with_pattern = fields.Char({
        string: "Char field 2",
        pattern: "[0-9]",
    });

    _records = [{id: 1}];
}

defineModels([Main]);

describe("WebWidgetPattern", () => {
    test("fields without pattern don't render any, those with do", async () => {
        await mountView({
            type: "form",
            resModel: "main",
            resId: 1,
            arch: `
        <form>
            <field name="char_field_without_pattern" />
            <field name="char_field_with_pattern" />
        </form>`,
        });
        expect("div[name='char_field_without_pattern'] input").not.toHaveAttribute(
            "pattern"
        );
        expect("div[name='char_field_with_pattern'] input").toHaveAttribute(
            "pattern",
            "[0-9]"
        );
    });
    test("server side pattern can be overridden in view", async () => {
        await mountView({
            type: "form",
            resModel: "main",
            resId: 1,
            arch: `
        <form>
            <field name="char_field_without_pattern" pattern="[a-z]" />
            <field name="char_field_with_pattern" pattern="[A-Z]" />
        </form>`,
        });
        expect("div[name='char_field_without_pattern'] input").toHaveAttribute(
            "pattern",
            "[a-z]"
        );
        expect("div[name='char_field_with_pattern'] input").toHaveAttribute(
            "pattern",
            "[A-Z]"
        );
    });
});
