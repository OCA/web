/* global QUnit */
// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.widget_tests", function(require) {
    "use strict";

    var FormView = require("web.FormView");
    var testUtils = require("web.test_utils");

    var createView = testUtils.createView;

    var getArch = function() {
        return (
            "<form>" +
            '<field name="currency_id" invisible="1" />' +
            "<field name=\"line_ids\" widget=\"one2many_product_picker\" options=\"{'groups': [{'name': 'Desk', 'domain': [('name', 'ilike', '%desk%')], 'order': {'name': 'id', 'asc': true}}, {'name': 'Chairs', 'domain': [('name', 'ilike', '%chair%')]}]}\">" +
            "<kanban>" +
            '<field name="name" />' +
            '<field name="product_id" />' +
            '<field name="price_reduce" />' +
            '<field name="price_unit" />' +
            '<field name="foo_id" />' +
            '<field name="product_uom_qty" />' +
            '<field name="product_uom" />' +
            "</kanban>" +
            "</field>" +
            "</form>"
        );
    };

    QUnit.module(
        "Web Widget One2Many Product Picker",
        {
            beforeEach: function() {
                this.data = {
                    foo: {
                        fields: {
                            currency_id: {
                                string: "Currency",
                                type: "many2one",
                                relation: "currency",
                            },
                            line_ids: {
                                string: "Lines Test",
                                type: "one2many",
                                relation: "line",
                                relation_field: "foo_id",
                            },
                            display_name: {string: "Display Name", type: "char"},
                        },
                        records: [
                            {
                                id: 1,
                                line_ids: [1, 2],
                                currency_id: 1,
                                display_name: "FT01",
                            },
                        ],
                    },
                    line: {
                        fields: {
                            name: {string: "Product Name", type: "string"},
                            product_id: {
                                string: "Product",
                                type: "many2one",
                                relation: "product",
                            },
                            product_uom: {
                                string: "UoM",
                                type: "many2one",
                                relation: "uom",
                            },
                            product_uom_qty: {string: "Qty", type: "integer"},
                            price_unit: {string: "Product Price", type: "float"},
                            price_reduce: {
                                string: "Product Price Reduce",
                                type: "float",
                            },
                            foo_id: {
                                string: "Parent",
                                type: "many2one",
                                relation: "foo",
                            },
                        },
                        records: [
                            {
                                id: 1,
                                name: "Large Cabinet",
                                product_id: 1,
                                product_uom: 1,
                                product_uom_qty: 3,
                                price_unit: 9.99,
                                price_reduce: 9.0,
                                foo_id: 1,
                            },
                            {
                                id: 2,
                                name: "Cabinet with Doors",
                                product_id: 2,
                                product_uom: 1,
                                product_uom_qty: 8,
                                price_unit: 42.99,
                                price_reduce: 40.0,
                                foo_id: 1,
                            },
                        ],
                    },
                    product: {
                        fields: {
                            name: {string: "Product name", type: "char"},
                            display_name: {string: "Display Name", type: "char"},
                            list_price: {string: "Price", type: "float"},
                            image_medium: {string: "Image Medium", type: "binary"},
                            uom_category_id: {
                                string: "Category",
                                type: "many2one",
                                relation: "uom_category",
                            },
                        },
                        records: [
                            {
                                id: 1,
                                name: "Large Cabinet",
                                display_name: "Large Cabinet",
                                list_price: 9.99,
                                image_medium: "",
                                uom_category_id: 1,
                            },
                            {
                                id: 2,
                                name: "Cabinet with Doors",
                                display_name: "Cabinet with Doors",
                                list_price: 42.0,
                                image_medium: "",
                                uom_category_id: 1,
                            },
                        ],
                    },
                    uom_category: {
                        fields: {
                            display_name: {string: "Display Name", type: "char"},
                        },
                        records: [{id: 1, display_name: "Unit(s)"}],
                    },
                    uom: {
                        fields: {
                            name: {string: "Name", type: "char"},
                        },
                        records: [{id: 1, name: "Unit(s)"}],
                    },
                    currency: {
                        fields: {
                            name: {string: "Name", type: "char"},
                            symbol: {string: "Symbol", type: "char"},
                        },
                        records: [{id: 1, name: "Eur", symbol: "€"}],
                    },
                };
            },
        },
        function() {
            QUnit.test("Load widget", function(assert) {
                assert.expect(4);

                var form = createView({
                    View: FormView,
                    model: "foo",
                    data: this.data,
                    arch: getArch(),
                    res_id: 1,
                    viewOptions: {
                        ids: [1],
                        index: 0,
                    },
                    mockRPC: function(route, args) {
                        if (route === "/web/dataset/call_kw/foo/read") {
                            assert.deepEqual(
                                args.args[1],
                                ["currency_id", "line_ids", "display_name"],
                                'should only read "currency_id", "line_ids" and "display_name"'
                            );
                            return $.when(this.data.foo.records);
                        } else if (route === "/web/dataset/call_kw/line/read") {
                            assert.deepEqual(
                                args.args[1],
                                [
                                    "name",
                                    "product_id",
                                    "price_reduce",
                                    "price_unit",
                                    "foo_id",
                                    "product_uom_qty",
                                    "product_uom",
                                ],
                                'should only read "name", "product_id", "price_reduce", "price_unit", "foo_id", "product_uom_qty" and "product_uom"'
                            );
                            return $.when(this.data.line.records);
                        } else if (
                            route === "/web/dataset/call_kw/product/search_read"
                        ) {
                            assert.deepEqual(
                                args.kwargs.fields,
                                [
                                    "id",
                                    "uom_id",
                                    "display_name",
                                    "uom_category_id",
                                    "image_medium",
                                    "list_price",
                                ],
                                'should only read "id", "uom_id", "display_name", "uom_category_id", "image_medium" and "list_price"'
                            );
                            return $.when(this.data.product.records);
                        }
                        return this._super.apply(this, arguments);
                    },
                });

                assert.ok(
                    form.$(".oe_field_one2many_product_picker").is(":visible"),
                    "should have a visible one2many product picker"
                );

                form.destroy();
            });
        }
    );
});
