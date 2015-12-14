openerp.testing.section('BooleanSwitchWidget.behaviors',
                        {dependences: ['web.web_widget_boolean_switch'],
                         rpc: 'mock',
                         templates: true,
                        }, function(test){
    test('BooleanSwitchWidget quick edit - enter in edit mode - cancel',
         {asserts: 30}, function (instance, $fix, mock) {

        mock('demo:read', function () {
            console.log("read data");
            return [{ id: 1, a: true, b: 'bar', c: 'baz' }];
        });
        mock('demo:fields_view_get', function () {
            return {
                type: 'form',
                fields: {
                    a: {type: 'boolean', string: "A"},
                    b: {type: 'char', string: "B"},
                    c: {type: 'char', string: "C"}
                },
                arch: '<form>' +
                      '  <field name="a"  widget="boolean_switch" options="{\'quick_edit\': True}"/>' +
                      '  <field name="b"/>' +
                      '  <field name="c"/>' +
                      '</form>',
            };
        });
        var ds = new instance.web.DataSetStatic(null, 'demo', null, [1]);
        ds.index = 0;
        var form = new instance.web.FormView({}, ds, false, {
                    initial_mode: 'view',
                    disable_autofocus: false,
                    $buttons: $(),
                    $pager: $()
            });
        var numTest = 1;
        form.appendTo($fix);
        var promise = form.do_show();
        check_values(form.$el.find(".oe_form_field_boolean_switch"),
                     true, false, false,
                     numTest++ + " - Init state: quick editable with true value");
        form.fields.a.switcher.checkboxes.click();
        check_values(form.$el.find('.oe_form_field_boolean_switch'),
                     false, false, false,
                     numTest++ + " - Quick edit to `false` value");
        form.to_edit_mode();
        check_values(form.$el.find('.oe_form_field_boolean_switch'),
                     false, false, false,
                     numTest++ + " - Move to edit mode value still false");
        form.fields.a.switcher.checkboxes.click();
        check_values(form.$el.find('.oe_form_field_boolean_switch'),
                     true, false, false,
                     numTest++ + " - edit to True");
        // remove class oe_form_dirty to avoid popup in unit test while canceling
        form.$el.removeClass('oe_form_dirty');
        form.on_button_cancel.call(form);
        check_values(form.$el.find('.oe_form_field_boolean_switch'),
                     false, false, false,
                     numTest++ + " - Cancel edit mode return still False");
        return promise;

    });

});

var check_values = function (scratchpad, value, readonly, disabled,
                             message){
    var $container = scratchpad.children();
    var $input = $container.find('input');
    strictEqual($input[0].checked, value, message + " - Input value");
    strictEqual($input[0].readOnly && $input[0].readOnly ? true : false,
                readonly, message + " - Input readonly");
    strictEqual($input[0].disabled && $input[0].disabled ? true : false, disabled,
                message + " - Input disabled");

    var prefix = 'bootstrap-switch-';
    ok($container[0].classList.contains(prefix + (value ? 'on' : 'off')),
       message + " - Bootstrap-switch value class");
    strictEqual($container[0].classList.contains(prefix + "readonly"),
                readonly, message + " - Bootstrap-switch readonly class");
    strictEqual($container[0].classList.contains(prefix + "disabled"),
                disabled, message + " - Bootstrap-switch disabled class");

};

openerp.testing.section('BooleanSwitchWidget.tests',
                        {'dependences': ['web.web_widget_boolean_switch'],
                         }, function(test){
    "use strict";

    var init_check_values = function(instance, scratchpad, html, options,
                                     checked, readonly, disabled, message){
        scratchpad.html(html);
        var widget = new instance.web.BooleanSwitchWidget(
            scratchpad.find('input'), options, null);
        check_values(scratchpad, checked, readonly, disabled, message);
        return widget;
    };

    test('BooleanSwitchWidget Class test method', function(instance, $scratchpad){

        var numTest = 1;
        var widget = init_check_values(
            instance, $scratchpad, '<input type="checkbox" disabled/>', {},
            false, false, true, numTest++ + " - init values");

        ok($scratchpad.children()[0].classList.contains('bootstrap-switch'),
           "Basic bootstrap-switch init using BooleanSwitchWidget class");

        widget.set_disabled(false);
        check_values($scratchpad, false, false, false,
                     numTest++ + " - Enable");

        widget.set_value(true);
        check_values($scratchpad, true, false, false,
                     numTest++ + " - Set true");

        widget.set_readonly(true);
        check_values($scratchpad, true, true, false,
                     numTest++ + " - Set readonly");

        widget.set_disabled(true);
        check_values($scratchpad, true, true, true,
                     numTest++ + " - Disabled");

        widget.set_value(false);
        check_values($scratchpad, false, true, true,
                     numTest++ + " - set value whatever its Disabled and readonly");
        widget.set_readonly(false);
        widget.set_value(true);
        check_values($scratchpad, true, false, true,
                     numTest++ + " - set value whatever its Disabled");
        widget.set_disabled(false);
        widget.set_readonly(true);
        widget.set_value(false);
        check_values($scratchpad, false, true, false,
                     numTest++ + " - set value whatever its readonly");
    });

    test('BooleanSwitchWidget Class test init', function(instance, $scratchpad){
        var numTest = 1;

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox" disabled readonly checked/>',
                          {}, true, true, true,
                          numTest++ + " - init values  disabled readonly checked");

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox" disabled readonly/>',
                          {}, false, true, true,
                          numTest++ + " - init values disabled readonly");

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox" disabled checked/>',
                          {}, true, false, true,
                          numTest++ + " - init values disabled checked");

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox" checked readonly/>',
                          {'disabled': false}, true, true, false,
                          numTest++ + " - init values checked readonly");

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox"/>',
                          {}, false, false, true,
                          numTest++ + " - By default input is disabled without any parameter");

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox" checked/>',
                          {'disabled': false}, true, false, false,
                          numTest++ + " - init values checked");

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox" readonly/>',
                          {'disabled': false, 'quick_edit': true},
                          false, true, false,
                          numTest++ + " - init values disabled readonly");

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox"/>',
                          {'disabled': false}, false, false, false,
                          numTest++ + " - every thing is false");

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox" checked/>',
                          {'quick_edit': true}, true, false, false,
                          numTest++ + " - quick edit enable widget");

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox" checked disabled/>',
                          {'quick_edit': true}, true, false, false,
                          numTest++ + " - quick edit enable widget case initial element is disabled");

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox" checked/>',
                          {}, true, false, true,
                          numTest++ + " - By default widget is disabled test with checked");

        init_check_values(instance, $scratchpad,
                          '<input type="checkbox" checked readonly/>',
                          {}, true, true, true,
                          numTest++ + " - By default widget is disabled test with checked and readonly");
    });

});
