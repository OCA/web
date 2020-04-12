odoo.define("web_widget_dropdown_dynamic.web_widget_dropdown_dynamic_tests", function(
    require
) {
    "use strict";

    /* global QUnit*/

    var FormView = require("web.FormView");
    var testUtils = require("web.test_utils");

    QUnit.module("web_widget_dropdown_dynamic", {}, function() {
        QUnit.test("values are fetched w/o context (char)", async function(assert) {
            assert.expect(2);

            var form = await testUtils.createView({
                View: FormView,
                model: "demo_entry",
                data: {
                    demo_entry: {
                        fields: {
                            test_field: {string: "Test Field", type: "char"},
                        },
                        records: [{id: 1, test_field: ""}],
                    },
                },
                arch:
                    "<form>" +
                    '<field name="test_field" widget="dynamic_dropdown" values="_get_test_field_values"/>' +
                    "</form>",
                mockRPC: function(route, args) {
                    if (args.method === "_get_test_field_values") {
                        return Promise.resolve([["value", "Title"]]);
                    }
                    return this._super.apply(this, arguments);
                },
            });

            assert.containsN(form, "option", 2);
            assert.containsOnce(form, "option[value='\"value\"']");

            form.destroy();
        });

        QUnit.test("values are fetched w/o context (integer)", async function(assert) {
            assert.expect(2);

            var form = await testUtils.createView({
                View: FormView,
                model: "demo_entry",
                data: {
                    demo_entry: {
                        fields: {
                            test_field: {string: "Test Field", type: "integer"},
                        },
                        records: [{id: 1, test_field: 0}],
                    },
                },
                arch:
                    "<form>" +
                    '<field name="test_field" widget="dynamic_dropdown" values="_get_test_field_values"/>' +
                    "</form>",
                mockRPC: function(route, args) {
                    if (args.method === "_get_test_field_values") {
                        return Promise.resolve([[0, "Title"]]);
                    }
                    return this._super.apply(this, arguments);
                },
            });

            assert.containsN(form, "option", 2);
            assert.containsOnce(form, "option[value='0']");

            form.destroy();
        });

        QUnit.test("values are fetched w/o context (selection)", async function(
            assert
        ) {
            assert.expect(2);

            var form = await testUtils.createView({
                View: FormView,
                model: "demo_entry",
                data: {
                    demo_entry: {
                        fields: {
                            test_field: {string: "Test Field", type: "selection"},
                        },
                        records: [{id: 1, test_field: ""}],
                    },
                },
                arch:
                    "<form>" +
                    '<field name="test_field" widget="dynamic_dropdown" values="_get_test_field_values"/>' +
                    "</form>",
                mockRPC: function(route, args) {
                    if (args.method === "_get_test_field_values") {
                        return Promise.resolve([["value", "Title"]]);
                    }
                    return this._super.apply(this, arguments);
                },
            });

            assert.containsN(form, "option", 2);
            assert.containsOnce(form, "option[value='\"value\"']");

            form.destroy();
        });

        QUnit.test("values are fetched with changing context", async function(assert) {
            assert.expect(6);

            var form = await testUtils.createView({
                View: FormView,
                model: "demo_entry",
                data: {
                    demo_entry: {
                        fields: {
                            other_field: {string: "Other Field", type: "char"},
                            test_field: {string: "Test Field", type: "char"},
                        },
                        records: [{id: 1, other_field: "", test_field: ""}],
                    },
                },
                arch:
                    "<form>" +
                    '<field name="other_field" />' +
                    '<field name="test_field" widget="dynamic_dropdown" values="_get_test_field_values" context="{\'step\': other_field}"/>' +
                    "</form>",
                mockRPC: function(route, args) {
                    if (args.method === "_get_test_field_values") {
                        if (args.kwargs.context.step === "step-1") {
                            return Promise.resolve([["value", "Title"]]);
                        } else if (args.kwargs.context.step === "step-2") {
                            return Promise.resolve([
                                ["value", "Title"],
                                ["value_2", "Title 2"],
                            ]);
                        }
                        return Promise.resolve([]);
                    }
                    return this._super.apply(this, arguments);
                },
            });

            await testUtils.fields.editAndTrigger(
                form.$('.o_field_widget[name="other_field"]'),
                "step-1",
                ["input"]
            );
            assert.containsN(form, "option", 2);
            assert.containsOnce(form, "option[value='\"value\"']");

            await testUtils.fields.editAndTrigger(
                form.$('.o_field_widget[name="other_field"]'),
                "step-2",
                ["input"]
            );
            assert.containsN(form, "option", 3);
            assert.containsOnce(form, "option[value='\"value\"']");
            assert.containsOnce(form, "option[value='\"value_2\"']");

            await testUtils.fields.editAndTrigger(
                form.$('.o_field_widget[name="other_field"]'),
                "step-other",
                ["input"]
            );
            assert.containsN(form, "option", 1);

            form.destroy();
        });
    });
});
