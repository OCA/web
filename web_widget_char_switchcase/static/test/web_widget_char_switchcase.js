odoo.define_section('web_widget_char_switchcase', ['web.form_common', 'web.core', 'web.form_widgets'], function (test) {
    'use strict';

    function createField(form_common, web_form_widgets, node) {
        var field_manager = new form_common.DefaultFieldManager(null, {});
        var fieldWidget = new web_form_widgets.FieldChar(field_manager, node);
        fieldWidget.setElement($('<input/>'));
        fieldWidget.initialize_content();
        return fieldWidget;
    }

    test('Default does nothing', function(assert, form_common, core, web_form_widgets) {
        var fieldWidget = createField(form_common, web_form_widgets, {'attrs': {}});

        var orig_val = 'Hello World!';
        fieldWidget.$input.val(orig_val);
        fieldWidget.$input.trigger('keyup');
        assert.strictEqual(fieldWidget.$input.val(), orig_val);
    });

    test('UPPER OPTION', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'upper'}"}};
        var fieldWidget = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        fieldWidget.$input.val(orig_val);
        fieldWidget.$input.trigger('keyup');
        assert.strictEqual(fieldWidget.$input.val(), orig_val.toUpperCase());
    });

    test('lower option', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'lower'}"}};
        var fieldWidget = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        fieldWidget.$input.val(orig_val);
        fieldWidget.$input.trigger('keyup');
        assert.strictEqual(fieldWidget.$input.val(), orig_val.toLowerCase());
    });

    test('Title Option', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'title'}"}};
        var fieldWidget = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        fieldWidget.$input.val(orig_val);
        fieldWidget.$input.trigger('keyup');
        assert.strictEqual(fieldWidget.$input.val(), 'Hello World!');
    });

    test('Sentence option', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'sentence'}"}};
        var fieldWidget = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        fieldWidget.$input.val(orig_val);
        fieldWidget.$input.trigger('keyup');
        assert.strictEqual(fieldWidget.$input.val(), 'Hello world!');
    });
    
    test('camelOption', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'camel'}"}};
        var fieldWidget = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        fieldWidget.$input.val(orig_val);
        fieldWidget.$input.trigger('keyup');
        assert.strictEqual(fieldWidget.$input.val(), 'helloWorld!');
    });

    test('PascalOption', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'pascal'}"}};
        var fieldWidget = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        fieldWidget.$input.val(orig_val);
        fieldWidget.$input.trigger('keyup');
        assert.strictEqual(fieldWidget.$input.val(), 'HelloWorld!');
    });

    test('snake_option', function(assert, form_common, core, web_form_widgets) {
        var node = {'attrs': {'options': "{'transform': 'snake'}"}};
        var fieldWidget = createField(form_common, web_form_widgets, node);

        var orig_val = 'Hello World!';
        fieldWidget.$input.val(orig_val);
        fieldWidget.$input.trigger('keyup');
        assert.strictEqual(fieldWidget.$input.val(), 'hello_world!');
    });
});
