odoo.define_section('web_widget_char_switchcase', ['web.form_common', 'web.core', 'web.form_widgets'], function (test) {
    'use strict';

    function createField(form_common, web_form_widgets, node) {
        var field_manager = new form_common.DefaultFieldManager(null, {});
        var field = new web_form_widgets.FieldChar(field_manager, node);
        field.$input = $('<input/>');
        field.initialize_content();
        return field;
    }

    test('Default is upper', function(assert, form_common, core, web_form_widgets) {
        this.field = createField(form_common, web_form_widgets, {'attrs': {}});

        var orig_val = 'Hello World!';
        this.field.$input.val(orig_val);
        this.field.$input.keyup();
        assert.strictEqual(this.field.$input.val(), orig_val.toUpperCase());
    });

    test('UPPER OPTION', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'upper'}"}};
        this.field = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        this.field.$input.val(orig_val);
        this.field.$input.keyup();
        assert.strictEqual(this.field.$input.val(), orig_val.toUpperCase());
    });

    test('lower option', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'lower'}"}};
        this.field = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        this.field.$input.val(orig_val);
        this.field.$input.keyup();
        assert.strictEqual(this.field.$input.val(), orig_val.toLowerCase());
    });

    test('Title Option', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'title'}"}};
        this.field = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        this.field.$input.val(orig_val);
        this.field.$input.keyup();
        assert.strictEqual(this.field.$input.val(), 'Hello World!');
    });

    test('Sentence option', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'sentence'}"}};
        this.field = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        this.field.$input.val(orig_val);
        this.field.$input.keyup();
        assert.strictEqual(this.field.$input.val(), 'Hello world!');
    });
    
    test('camelOption', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'camel'}"}};
        this.field = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        this.field.$input.val(orig_val);
        this.field.$input.keyup();
        assert.strictEqual(this.field.$input.val(), 'helloWorld!');
    });

    test('PascalOption', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'pascal'}"}};
        this.field = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        this.field.$input.val(orig_val);
        this.field.$input.keyup();
        assert.strictEqual(this.field.$input.val(), 'HelloWorld!');
    });

    test('snake_option', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'snake'}"}};
        this.field = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        this.field.$input.val(orig_val);
        this.field.$input.keyup();
        assert.strictEqual(this.field.$input.val(), 'hello_world!');
    });
});
