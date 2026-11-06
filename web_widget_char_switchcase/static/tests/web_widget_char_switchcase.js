odoo.define("web_widget_char_switchcase.web_widget_char_switchcase", function (
    require
) {
    "use strict";

    const FormView = require("web.FormView");
    const testUtils = require("web.test_utils");

    const createView = testUtils.createView;

    const test_str = "Hello World!";

    async function createTestView(widget_opts) {
        const data = {
            partner: {
                fields: {comment: {string: "Comment", type: "char"}},
                records: [{id: 1, comment: test_str}],
                onchanges: {},
            },
        };
        const arch = `
        <form>
            <field name="comment" options='${JSON.stringify(widget_opts)}' />
        </form>
        `;

        return await createView({
            View: FormView,
            model: "partner",
            data: data,
            arch: arch,
            viewOptions: {
                mode: "edit",
            },
            res_id: 1,
        });
    }

    QUnit.module("web_widget_char_switchcase", {}, function () {
        QUnit.module("FieldCharSwitchCase");

        QUnit.test("Default does nothing", async function (assert) {
            assert.expect(1);

            const form = await createTestView({});
            const $input = form.$('.o_field_widget[name="comment"]');
            $input.trigger("keyup");
            assert.strictEqual($input.val(), test_str);
            form.destroy();
        });

        QUnit.test("UPPER OPTION", async function (assert) {
            assert.expect(1);

            const form = await createTestView({transform: "upper"});
            const $input = form.$('.o_field_widget[name="comment"]');
            $input.trigger("keyup");
            assert.strictEqual($input.val(), test_str.toUpperCase());
            form.destroy();
        });

        QUnit.test("lower option", async function (assert) {
            assert.expect(1);

            const form = await createTestView({transform: "lower"});
            const $input = form.$('.o_field_widget[name="comment"]');
            $input.trigger("keyup");
            assert.strictEqual($input.val(), test_str.toLowerCase());
            form.destroy();
        });

        QUnit.test("Title Option", async function (assert) {
            assert.expect(1);

            const form = await createTestView({transform: "title"});
            const $input = form.$('.o_field_widget[name="comment"]');
            $input.trigger("keyup");
            assert.strictEqual($input.val(), "Hello World!");
            form.destroy();
        });

        QUnit.test("Sentence option", async function (assert) {
            assert.expect(1);

            const form = await createTestView({transform: "sentence"});
            const $input = form.$('.o_field_widget[name="comment"]');
            $input.trigger("keyup");
            assert.strictEqual($input.val(), "Hello world!");
            form.destroy();
        });

        QUnit.test("camelOption", async function (assert) {
            assert.expect(1);

            const form = await createTestView({transform: "camel"});
            const $input = form.$('.o_field_widget[name="comment"]');
            $input.trigger("keyup");
            assert.strictEqual($input.val(), "helloWorld!");
            form.destroy();
        });

        QUnit.test("PascalOption", async function (assert) {
            assert.expect(1);

            const form = await createTestView({transform: "pascal"});
            const $input = form.$('.o_field_widget[name="comment"]');
            $input.trigger("keyup");
            assert.strictEqual($input.val(), "HelloWorld!");
            form.destroy();
        });

        QUnit.test("snake_option", async function (assert) {
            assert.expect(1);

            const form = await createTestView({transform: "snake"});
            const $input = form.$('.o_field_widget[name="comment"]');
            $input.trigger("keyup");
            assert.strictEqual($input.val(), "hello_world!");
            form.destroy();
        });
    });
});
