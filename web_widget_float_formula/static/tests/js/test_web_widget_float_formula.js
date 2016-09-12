/**
*    Copyright 2016 LasLabs Inc.
*    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
**/

odoo.define_section('web_widget_float_formula', ['web.form_common', 'web.form_widgets', 'web.core'], function(test) {
    'use strict';

    window.test_setup = function(self, form_common, form_widgets, core) {
        core.bus.trigger('web_client_ready');
        var field_manager = new form_common.DefaultFieldManager(null, {});
        var filler = {'attrs': {}}; // Needed to instantiate FieldFloat 
        self.field = new form_widgets.FieldFloat(field_manager, filler);
        self.$element = $('<input>');
        self.field.$el.append(self.$element);
    };

    test('Float fields should have a _formula_text property that defaults to an empty string',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);

            assert.strictEqual(this.field._formula_text, '');
    });

    test('.initialize_content() on float fields should clear the _formula_text property',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);
            this.field._formula_text = 'test';
            this.field.initialize_content();

            assert.strictEqual(this.field._formula_text, '');
    });

    test('._clean_formula_text() on float fields should clear the _formula_text property',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);
            this.field._formula_text = 'test';
            this.field._clean_formula_text();

            assert.strictEqual(this.field._formula_text, '');
    });

    test('._process_formula() on float fields should return false when given invalid formulas',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);

            assert.strictEqual(this.field._process_formula('2*3'), false);
            assert.strictEqual(this.field._process_formula('=2*3a'), false);
    });

    test('._process_formula() on float fields should properly process a valid formula',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);

            assert.strictEqual(this.field._process_formula(' =2*3\n'), '2*3');
    });

    test('._eval_formula() on float fields should properly evaluate a valid formula',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);

            assert.equal(this.field._eval_formula('2*3'), 6);
    });

    test('._eval_formula() on float fields should properly handle alternative decimal points and thousands seps',
        function(assert, form_common, form_widgets, core) {
            var translation_params = core._t.database.parameters;
            translation_params.decimal_point = ',';
            translation_params.thousands_sep = '.';
            window.test_setup(this, form_common, form_widgets, core);

            assert.equal(this.field._eval_formula('2.000*3,5'), 7000);
    });

    test('._eval_formula() on float fields should return false when given an input that evals to undefined',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);

            assert.equal(this.field._eval_formula(''), false);
    });

    test('._eval_formula() on float fields should return false when given an input that cannot be evaluated',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);

            assert.equal(this.field._eval_formula('*/'), false);
    });

    test('._compute_result() on float fields should always clean up _formula_text',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);
            this.field._formula_text = 'test';
            this.field._compute_result();

            assert.strictEqual(this.field._formula_text, '');
    });

    test('._compute_result() should not change the value of the associated input when it is not a valid formula',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);
            this.$element.val('=2*3a');
            this.field._compute_result();

            assert.strictEqual(this.$element.val(), '=2*3a');
    });

    test('._compute_result() should not change the value of the associated input when it cannot be evaled',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);
            this.$element.val('=*/');
            this.field._compute_result();

            assert.strictEqual(this.$element.val(), '=*/');
    });

    test('._compute_result() should behave properly when the current value of the input element is a valid formula',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);
            this.$element.val('=2*3');
            this.field._compute_result();

            assert.equal(this.$element.val(), '6');
            assert.strictEqual(this.field._formula_text, '=2*3');
    });

    test('._display_formula() should update the value of the input element when there is a stored formula',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);
            this.field._formula_text = "test";
            this.field._display_formula();

            assert.equal(this.$element.val(), 'test');
    });

    test('.start() on float fields should add a handler that calls ._compute_result() when the field is blurred',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);
            this.field.called = false;
            this.field._compute_result = function() {
                this.called = true;
            };
            this.field.start();
            this.field.trigger('blurred');

            assert.strictEqual(this.field.called, true);
    });

    test('.start() on float fields should add a handler that calls ._display_formula() when the field is focused',
        function(assert, form_common, form_widgets, core) {
            window.test_setup(this, form_common, form_widgets, core);
            this.field.called = false;
            this.field._display_formula = function() {
                this.called = true;
            };
            this.field.start();
            this.field.trigger('focused');

            assert.strictEqual(this.field.called, true);
    }); 
 
});
