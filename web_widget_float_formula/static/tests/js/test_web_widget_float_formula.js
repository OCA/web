/**
*    Copyright 2016 LasLabs Inc.
*    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define('web_widget_float_formula', function(require) {
    "use strict";

    var core = require('web.core');
    var testUtils = require('web.test_utils');
    var FormView = require('web.FormView');

    var createView = testUtils.createView;
    var triggerKeypressEvent = testUtils.triggerKeypressEvent;

    var assertClose = function(assert, actual, expected, message) {
        var pass = Math.abs(actual - expected) < 0.00001;

        assert.pushResult({
            result: pass,
            actual: actual,
            expected: expected,
            message: message
        });
    }

    QUnit.module('web_widget_float_formula', {
        beforeEach: function() {
            this.data = {
                foo: {
                    fields: {
                        bar: { string: "Bar", type: "float" }
                    },
                    records: [
                        { id: 1, bar: 1.2 }
                    ]
                }
            };
        }
    });

    QUnit.test('Float fields in form view', function(assert) {
        assert.expect(8);

        var form = createView({
            View: FormView,
            model: 'foo',
            data: this.data,
            res_id: 1,
            arch: '<form><field name="bar"/></form>',
            viewOptions: {
                mode: 'edit',
            },
            mockRPC: function (route, args) {
                if (args.method === 'write') {
                    assert.step('save');
                }
                return this._super.apply(this, arguments);
            },
        });

        assertClose(assert, form.$('input').val(), 1.2);

        form.$('input').val('=(1 + 2) / 3').blur();
        assertClose(assert, form.$('input').val(), 1,
            'blur event should trigger compute event');

        form.$('input').focus();
        assert.strictEqual(form.$('input').val(), '=(1 + 2) / 3',
            'focus event should display the forumla');

        form.$('input').val('=(1 * 2x) /').blur();
        assert.strictEqual(form.$('input').val(), '=(1 * 2x) /',
            'invalid formula should not be calculated');

        _.extend(core._t.database.parameters, {
            grouping: [3, 0],
            decimal_point: ',',
            thousands_sep: '.'
        });

        form.$('input').val('=2.000*3,5').blur();
        assert.strictEqual(form.$('input').val(), "7.000,00",
            'eval should handle decimal point and thousands separator properly');

        _.extend(core._t.database.parameters, {
            grouping: [3, 0],
            decimal_point: '.',
            thousands_sep: ','
        });

        form.$('input').val('=3-2');

        form.$buttons.find('.o_form_button_save').click();
        assert.verifySteps(['save'], 'should have saved');
        assertClose(assert, form.$('.o_field_widget').text(), 1,
            'save should also trigger compute result')

        form.destroy();
    });

});
