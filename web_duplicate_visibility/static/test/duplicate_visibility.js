"use strict";
odoo.define_section('web_duplicate_visibility',
                    ['web.data', 'web.FormView'],
                    function(test, mock){

    function assertDuplicate(data, FormView, form_tag, visible){
        mock.add('test.model:read', function () {
            return [{ id: 1, a: 'foo', b: 'bar', c: 'baz' }];
        });

        mock.add('test.model:fields_view_get', function () {
            return {
                type: 'form',
                fields: {
                    a: {type: 'char', string: "A"},
                    b: {type: 'char', string: "B"},
                    c: {type: 'char', string: "C"}
                },
                arch: form_tag +
                   '    <field name="a"/>' +
                   '    <field name="b"/>' +
                   '    <field name="c"/>' +
                   '</form>',
            };
        });

        var ds = new data.DataSetStatic(null, 'test.model', null, [1]);
        ds.index = 0;
        var $fix = $( "#qunit-fixture");
        var form = new FormView(
            {},
            ds,
            false,
            {
                sidebar: true,
            }
        );
        form.appendTo($fix);
        form.do_show();
        form.render_sidebar();

        var $fix = $( "#qunit-fixture");
        var actions = $fix.find('.oe_sidebar a[data-section="other"]').filter(
            function(i, obj){
                return obj.text.trim() == "Duplicate";
            }
        );
        strictEqual(
            actions.length, visible, "duplicate state is not as expected"
        );
    };

    test('Duplicate button visible when nothing set',
         function(assert, data, FormView){
        assertDuplicate(data, FormView, '<form>', 1);
    });

    test('Duplicate button visible when create="1"',
         function(assert, data, FormView){
        assertDuplicate(data, FormView, '<form create="1">', 1);
    });

    test('Duplicate button visible when duplicate="1"',
         function(assert, data, FormView){
        assertDuplicate(data, FormView, '<form duplicate="1">', 1);
    });

    test('Duplicate button not displayed when create="0"',
         function(assert, data, FormView){
        assertDuplicate(data, FormView, '<form create="0">', 0);
    });

    test('Duplicate button not displayed when create="1" duplicate="0"',
         function(assert, data, FormView){
        assertDuplicate(data, FormView, '<form create="1" duplicate="0">', 0);
    });

    test('Duplicate button not displayed when duplicate="0"',
         function(assert, data, FormView){
        assertDuplicate(data, FormView, '<form duplicate="0">', 0);
    });
});
