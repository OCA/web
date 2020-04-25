/**
 * Copyright 2016 LasLabs Inc.
 * Copyright 2020 Brainbean Apps (https://brainbeanapps.com)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
 */
odoo.define('web_widget_float_formula.test_web_widget_float_formula', function (require) {
    "use strict";

    var FormView = require('web.FormView');
    var testUtils = require('web.test_utils');

    QUnit.module('web_widget_float_formula', {}, function () {

        QUnit.test('float field', async function (assert) {
            assert.expect(5);

            const form = await testUtils.createAsyncView({
                View: FormView,
                model: 'demo_entry',
                data: {
                    demo_entry: {
                        fields: {
                            test_field: {string: 'Test Field', type: 'float'},
                        },
                        records: [{id: 1, test_field: 0.0}],
                    },
                },
                res_id: 1,
                arch:
                    '<form>' +
                        '<field name="test_field"/>' +
                    '</form>',
                viewOptions: {
                    mode: 'edit',
                },
            });

            var test_field = form.$('.o_field_widget[name="test_field"]');

            testUtils.fields.editInput(test_field, '0.0 + 40.0 + 2.0');
            assert.strictEqual(test_field.val(), '42.00');

            test_field.triggerHandler('focus');
            assert.strictEqual(test_field.val(), '0.0 + 40.0 + 2.0');
            test_field.triggerHandler('blur');
            assert.strictEqual(test_field.val(), '42.00');

            testUtils.fields.editInput(test_field, '=(1.5+8.0/2.0-(15+5)*0.1)');
            assert.strictEqual(test_field.val(), '3.50');

            testUtils.fields.editInput(test_field, 'bubblegum');
            assert.strictEqual(test_field.val(), 'bubblegum');

            form.destroy();
        });

        QUnit.test('integer field', async function (assert) {
            assert.expect(5);

            const form = await testUtils.createAsyncView({
                View: FormView,
                model: 'demo_entry',
                data: {
                    demo_entry: {
                        fields: {
                            test_field: {string: 'Test Field', type: 'integer'},
                        },
                        records: [{id: 1, test_field: 0}],
                    },
                },
                res_id: 1,
                arch:
                    '<form>' +
                        '<field name="test_field"/>' +
                    '</form>',
                viewOptions: {
                    mode: 'edit',
                },
            });

            var test_field = form.$('.o_field_widget[name="test_field"]');

            testUtils.fields.editInput(test_field, '0 + 40 + 2');
            assert.strictEqual(test_field.val(), '42');

            test_field.triggerHandler('focus');
            assert.strictEqual(test_field.val(), '0 + 40 + 2');
            test_field.triggerHandler('blur');
            assert.strictEqual(test_field.val(), '42');

            testUtils.fields.editInput(test_field, '=(1+8/2-(15+5)*0.1)');
            assert.strictEqual(test_field.val(), '3');

            testUtils.fields.editInput(test_field, 'bubblegum');
            assert.strictEqual(test_field.val(), 'bubblegum');

            form.destroy();
        });

        QUnit.test('monetary field', async function (assert) {
            assert.expect(5);

            const form = await testUtils.createAsyncView({
                View: FormView,
                model: 'demo_entry',
                data: {
                    demo_entry: {
                        fields: {
                            test_field: {string: 'Test Field', type: 'monetary'},
                            currency_id: {string: 'Currency', type: 'many2one', relation: 'currency', searchable: true},
                        },
                        records: [{id: 1, test_field: 0.0, currency_id: 1}],
                    },
                    currency: {
                        fields: {
                            symbol: {string: 'Currency Sumbol', type: 'char', searchable: true},
                            position: {string: 'Currency Position', type: 'char', searchable: true},
                        },
                        records: [{
                            id: 1,
                            display_name: '$',
                            symbol: '$',
                            position: 'before',
                        }]
                    },
                },
                res_id: 1,
                arch:
                    '<form>' +
                        '<field name="test_field" widget="monetary"/>' +
                        '<field name="currency_id" invisible="1"/>' +
                    '</form>',
                viewOptions: {
                    mode: 'edit',
                },
                session: {
                    currencies: {
                        1: {
                            id: 1,
                            display_name: '$',
                            symbol: '$',
                            position: 'before',
                        },
                    },
                },
            });

            var test_field = form.$('.o_field_widget[name="test_field"]');
            var test_field_input = form.$('.o_field_widget[name="test_field"] input');

            testUtils.fields.editInput(test_field_input, '0.0 + 40.0 + 2.0');
            assert.strictEqual(test_field_input.val(), '42.00');

            test_field.triggerHandler('focusin');
            assert.strictEqual(test_field_input.val(), '0.0 + 40.0 + 2.0');
            test_field.triggerHandler('focusout');
            assert.strictEqual(test_field_input.val(), '42.00');

            testUtils.fields.editInput(test_field_input, '=(1.5+8.0/2.0-(15+5)*0.1)');
            assert.strictEqual(test_field_input.val(), '3.50');

            testUtils.fields.editInput(test_field_input, 'bubblegum');
            assert.strictEqual(test_field_input.val(), 'bubblegum');

            form.destroy();
        });

    });
});
