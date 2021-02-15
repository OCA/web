odoo.define("web_boolean_button.form_tests", function(require) {
    "use strict";

    /* global QUnit*/

    var FormView = require("web.FormView");
    var testUtils = require("web.test_utils");
    var createView = testUtils.createView;

    QUnit.module("web_boolean_button", {}, function() {
        QUnit.module("web_boolean_button", {}, function() {
            QUnit.module(
                "basic_fields",
                {
                    beforeEach: function() {
                        this.data = {
                            partner: {
                                fields: {
                                    date: {
                                        string: "A date",
                                        type: "date",
                                        searchable: true,
                                    },
                                    datetime: {
                                        string: "A datetime",
                                        type: "datetime",
                                        searchable: true,
                                    },
                                    display_name: {
                                        string: "Displayed name",
                                        type: "char",
                                        searchable: true,
                                    },
                                    foo: {
                                        string: "Foo",
                                        type: "char",
                                        default: "My little Foo Value",
                                        searchable: true,
                                        trim: true,
                                    },
                                    bar: {
                                        string: "Bar",
                                        type: "boolean",
                                        default: true,
                                        searchable: true,
                                    },
                                    txt: {
                                        string: "txt",
                                        type: "text",
                                        default:
                                            "My little txt Value\nHo-ho-hoooo Merry Christmas",
                                    },
                                    int_field: {
                                        string: "int_field",
                                        type: "integer",
                                        sortable: true,
                                        searchable: true,
                                    },
                                    qux: {
                                        string: "Qux",
                                        type: "float",
                                        digits: [16, 1],
                                        searchable: true,
                                    },
                                    p: {
                                        string: "one2many field",
                                        type: "one2many",
                                        relation: "partner",
                                        searchable: true,
                                    },
                                    trululu: {
                                        string: "Trululu",
                                        type: "many2one",
                                        relation: "partner",
                                        searchable: true,
                                    },
                                    timmy: {
                                        string: "pokemon",
                                        type: "many2many",
                                        relation: "partner_type",
                                        searchable: true,
                                    },
                                    product_id: {
                                        string: "Product",
                                        type: "many2one",
                                        relation: "product",
                                        searchable: true,
                                    },
                                    sequence: {
                                        type: "integer",
                                        string: "Sequence",
                                        searchable: true,
                                    },
                                    currency_id: {
                                        string: "Currency",
                                        type: "many2one",
                                        relation: "currency",
                                        searchable: true,
                                    },
                                    selection: {
                                        string: "Selection",
                                        type: "selection",
                                        searchable: true,
                                        selection: [
                                            ["normal", "Normal"],
                                            ["blocked", "Blocked"],
                                            ["done", "Done"],
                                        ],
                                    },
                                    document: {string: "Binary", type: "binary"},
                                    hex_color: {
                                        string: "hexadecimal color",
                                        type: "char",
                                    },
                                },
                                records: [
                                    {
                                        id: 1,
                                        date: "2017-02-03",
                                        datetime: "2017-02-08 10:00:00",
                                        display_name: "first record",
                                        bar: true,
                                        foo: "yop",
                                        int_field: 10,
                                        qux: 0.44444,
                                        p: [],
                                        timmy: [],
                                        trululu: 4,
                                        selection: "blocked",
                                        document: "coucou==\n",
                                        hex_color: "#ff0000",
                                    },
                                    {
                                        id: 2,
                                        display_name: "second record",
                                        bar: true,
                                        foo: "blip",
                                        int_field: 0,
                                        qux: 0,
                                        p: [],
                                        timmy: [],
                                        trululu: 1,
                                        sequence: 4,
                                        currency_id: 2,
                                        selection: "normal",
                                    },
                                    {
                                        id: 4,
                                        display_name: "aaa",
                                        foo: "abc",
                                        sequence: 9,
                                        int_field: false,
                                        qux: false,
                                        selection: "done",
                                    },
                                    {
                                        id: 3,
                                        bar: true,
                                        foo: "gnap",
                                        int_field: 80,
                                        qux: -3.89859,
                                        m2o: 1,
                                        m2m: [],
                                    },
                                    {
                                        id: 5,
                                        bar: false,
                                        foo: "blop",
                                        int_field: -4,
                                        qux: 9.1,
                                        m2o: 1,
                                        m2m: [1],
                                        currency_id: 1,
                                    },
                                ],
                                onchanges: {},
                            },
                            product: {
                                fields: {
                                    name: {
                                        string: "Product Name",
                                        type: "char",
                                        searchable: true,
                                    },
                                },
                                records: [
                                    {
                                        id: 37,
                                        display_name: "xphone",
                                    },
                                    {
                                        id: 41,
                                        display_name: "xpad",
                                    },
                                ],
                            },
                            partner_type: {
                                fields: {
                                    name: {
                                        string: "Partner Type",
                                        type: "char",
                                        searchable: true,
                                    },
                                    color: {
                                        string: "Color index",
                                        type: "integer",
                                        searchable: true,
                                    },
                                },
                                records: [
                                    {id: 12, display_name: "gold", color: 2},
                                    {id: 14, display_name: "silver", color: 5},
                                ],
                            },
                            currency: {
                                fields: {
                                    symbol: {
                                        string: "Currency Sumbol",
                                        type: "char",
                                        searchable: true,
                                    },
                                    position: {
                                        string: "Currency Position",
                                        type: "char",
                                        searchable: true,
                                    },
                                },
                                records: [
                                    {
                                        id: 1,
                                        display_name: "$",
                                        symbol: "$",
                                        position: "before",
                                    },
                                    {
                                        id: 2,
                                        display_name: "€",
                                        symbol: "€",
                                        position: "after",
                                    },
                                ],
                            },
                            "ir.translation": {
                                fields: {
                                    lang_code: {type: "char"},
                                    value: {type: "char"},
                                    res_id: {type: "integer"},
                                },
                                records: [
                                    {
                                        id: 99,
                                        res_id: 37,
                                        value: "",
                                        lang_code: "en_US",
                                    },
                                ],
                            },
                        };
                    },
                },
                function() {
                    QUnit.module("FieldBooleanButtonView");

                    QUnit.test("boolean button tests", async function(assert) {
                        assert.expect(2);

                        var terminology = {
                            string_true: "Production Environment",
                            hover_true: "Switch to test environment",
                            string_false: "Test Environment",
                            hover_false: "Switch to production environment",
                        };

                        var form = await createView({
                            View: FormView,
                            model: "partner",
                            data: this.data,
                            arch:
                                "<form>" +
                                '<div name="button_box" class="oe_button_box">' +
                                '<button type="object" class="oe_stat_button" icon="fa-check-square">' +
                                '<field name="bar" widget="boolean_button" options=\'{"terminology": ' +
                                JSON.stringify(terminology) +
                                "}'/>" +
                                "</button>" +
                                "</div>" +
                                "</form>",
                            res_id: 2,
                        });

                        assert.strictEqual(
                            form.$(
                                ".o_stat_text.o_not_hover:contains(Production Environment)"
                            ).length,
                            1,
                            "button should contain correct string"
                        );
                        assert.strictEqual(
                            form.$(
                                ".o_stat_text.o_hover:contains(Switch to test environment)"
                            ).length,
                            1,
                            "button should display correct string when hovering"
                        );

                        form.destroy();
                    });
                }
            );
        });
    });
});
