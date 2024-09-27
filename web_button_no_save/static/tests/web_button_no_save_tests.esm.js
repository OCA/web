/** @odoo-module **/
/* global QUnit */

import {createView, dom, fields, form} from "web.test_utils";
import FormView from "web.FormView";

QUnit.module("OCA", function () {
    QUnit.module(
        "web_button_no_save",
        {
            beforeEach: async function (assert) {
                this.form = await createView({
                    View: FormView,
                    model: "res.partner",
                    res_id: 1,
                    data: {
                        "res.partner": {
                            fields: {
                                name: {string: "Name", type: "char"},
                            },
                            records: [
                                {
                                    id: 1,
                                    name: "Before",
                                },
                            ],
                        },
                    },
                    arch: `\
                    <form>
                        <header>
                            <button name="test_no_save_0" type="object" class="test_no_save_0"/>
                            <button name="test_no_save_1" type="object" class="test_no_save_1" no_save="1"/>
                        </header>
                        <sheet>
                            <field name="name"/>
                        </sheet>
                    </form>`,
                    mockRPC: async function (route) {
                        if (route === "/web/dataset/call_kw/res.partner/write") {
                            assert.step("saved");
                        }
                        return this._super(...arguments);
                    },
                });
            },
            afterEach: function () {
                this.form.destroy();
            },
        },
        function () {
            QUnit.test("no_save=0", async function (assert) {
                assert.expect(2);
                await form.clickEdit(this.form);
                await fields.editInput(this.form.$(".o_input"), "After0");
                await dom.click(this.form.$(".test_no_save_0"));
                assert.verifySteps(["saved"], "should have saved");
            });

            QUnit.test("no_save=1", async function (assert) {
                assert.expect(1);
                await form.clickEdit(this.form);
                await fields.editInput(this.form.$(".o_input"), "After1");
                await dom.click(this.form.$(".test_no_save_1"));
                assert.verifySteps([], "should not have saved");
            });

            QUnit.test("save", async function (assert) {
                assert.expect(2);
                await form.clickEdit(this.form);
                await fields.editInput(this.form.$(".o_input"), "After2");
                await form.clickSave(this.form);
                assert.verifySteps(["saved"], "should have saved");
            });
        }
    );
});
