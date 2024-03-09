odoo.define("web_copy_confirm.confirm_tests", function (require) {
    "use strict";

    /* global QUnit*/

    var FormView = require("web.FormView");
    var testUtils = require("web.test_utils");

    var createView = testUtils.createView;

    QUnit.module(
        "web_copy_confirm",
        {
            beforeEach: function () {
                this.data = {
                    partner: {
                        fields: {
                            display_name: {
                                string: "STRING",
                                type: "char",
                                default: "Name",
                            },
                        },
                        records: [
                            {
                                id: 1,
                                display_name: "first partner",
                            },
                        ],
                        onchanges: {},
                    },
                };
            },
        },
        function () {
            QUnit.test("ask confirmation before duplicate", async function (assert) {
                assert.expect(4);
                const form = await createView({
                    View: FormView,
                    model: "partner",
                    data: this.data,
                    arch: `
                    <form>
                        <field name="display_name"/>
                    </form>
                `,
                    viewOptions: {
                        mode: "edit",
                    },
                    res_id: 1,
                });

                // Validate that partner2 does not exist
                assert.strictEqual(
                    typeof form.model.localData.partner_2,
                    "undefined",
                    "Partner 2 shouldn't exist"
                );

                // Trigger onDuplicateRecordConfirm
                await form._onDuplicateRecordConfirm();

                // Validate dialog
                var confirmDialog = form.getChildren().pop();
                assert.strictEqual(
                    confirmDialog.buttons[0].text,
                    "Ok",
                    "Ok button is available"
                );
                assert.strictEqual(
                    confirmDialog.$content[0].innerHTML,
                    "Are you sure that you would like to copy this record?",
                    "Confirmation text is available"
                );

                // Confirm dialog
                await confirmDialog.buttons[0].click();

                // Validate that copy is created
                assert.strictEqual(
                    form.model.localData.partner_2.data.display_name,
                    "first partner (copy)",
                    "Copy is created"
                );

                await testUtils.nextTick();
                form.destroy();
            });
        }
    );
});
