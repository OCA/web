odoo.define("web_widget_domain_dynamic.tests", function (require) {
    "use strict";

    const FormView = require("web.FormView");
    const testUtils = require("web.test_utils");
    const {date_to_str} = require("web.time");
    const {createView} = testUtils;
    const {QUnit} = window;

    QUnit.module(
        "web_widget_domain_dynamic",
        {
            beforeEach: function () {
                this.data = {
                    partner: {
                        fields: {
                            date: {string: "A date", type: "date", searchable: true},
                            domain: {
                                string: "Domain",
                                type: "char",
                                default: "[]",
                                searchable: true,
                                trim: true,
                            },
                            model: {
                                string: "Model",
                                type: "char",
                                default: "partner",
                                searchable: true,
                            },
                        },
                        records: [
                            {
                                id: 1,
                                date: "2017-02-03",
                            },
                            {
                                id: 2,
                                date: date_to_str(new Date()),
                            },
                            {
                                id: 3,
                                date: date_to_str(moment().add(10, "days").toDate()),
                            },
                        ],
                        onchanges: {},
                    },
                };
            },
        },
        function () {
            QUnit.test(
                "domain field: edit domain with dynamic content",
                async function (assert) {
                    assert.expect(2);

                    const originalDebug = odoo.debug;
                    odoo.debug = true;

                    let rawDomain = `[["date", ">=", datetime.datetime.combine(context_today() + relativedelta(days = -365), datetime.time(0, 0, 0)).to_utc().strftime("%Y-%m-%d %H:%M:%S")]]`;
                    const partner1 = this.data.partner.records[0];
                    partner1.domain = rawDomain;
                    partner1.model = "partner";

                    const form = await createView({
                        View: FormView,
                        model: "partner",
                        data: this.data,
                        arch: `
                        <form>
                            <field name="model"/>
                            <field name="domain" widget="domain" options="{'model': 'model'}"/>
                        </form>
                    `,
                        mockRPC(route, args) {
                            if (args.method === "write") {
                                assert.strictEqual(args.args[1].domain, rawDomain);
                            }
                            return this._super.apply(this, arguments);
                        },
                        res_id: 1,
                        viewOptions: {mode: "edit"},
                    });

                    assert.strictEqual(
                        form.$(".o_domain_debug_input").val(),
                        rawDomain
                    );

                    rawDomain = `[["date", ">=", datetime.datetime.combine(context_today() + relativedelta(days = -1), datetime.time(0, 0, 0)).to_utc().strftime("%Y-%m-%d %H:%M:%S")]]`;
                    await testUtils.fields.editAndTrigger(
                        form.$(".o_domain_debug_input"),
                        rawDomain,
                        ["input", "change", "focusout"]
                    );
                    await testUtils.form.clickSave(form);

                    form.destroy();
                    odoo.debug = originalDebug;
                }
            );
        }
    );
});
