odoo.define_section('web_readonly_bypass', ['web_readonly_bypass'], function(test) {
"use strict";


    test('ignore_readonly', function(assert, ro_bypass){
        var data = {};
        var mode_create = true;
        var options = {};
        var context = {};
        ro_bypass.ignore_readonly(data, options, mode_create, context);
        assert.deepEqual(data,
            {},
            "Empty context and options mode create"
        );

        mode_create = false;
        data = {};
        ro_bypass.ignore_readonly(data, options, mode_create, context);
        assert.deepEqual(data,
            {},
            "Empty context and options mode write"
        );

        mode_create = false;
        data = {};
        context = {'readonly_by_pass': true};
        options = {'readonly_fields': {'field_1': 'va1-1',
                                       'field_2': false,
                                       'field_3': 'val-3'}};
        ro_bypass.ignore_readonly(data, options, mode_create, context);

        assert.deepEqual(data,
            {'field_1': 'va1-1', 'field_2': false, 'field_3': 'val-3'},
            "all fields mode write"
        );

        mode_create = true;
        data = {};
        context = {'readonly_by_pass': true};
        options = {'readonly_fields': {'field_1': 'va1-1',
                                       'field_2': false,
                                       'field_3': 'val-3'}};
        ro_bypass.ignore_readonly(data, options, mode_create, context);

        assert.deepEqual(data,
            {'field_1': 'va1-1', 'field_3': 'val-3'},
            "all fields mode create (false value are escaped)"
        );

        mode_create = true;
        data = {};
        context = {};
        options = {'readonly_fields': {'field_1': 'va1-1',
                                       'field_2': false,
                                       'field_3': 'val-3'}};
        ro_bypass.ignore_readonly(data, options, mode_create, context);

        assert.deepEqual(data,
            {},
            "without context, default, we won't save readonly fields"
        );
    });

    test('retrieve_readonly_by_pass_fields', ['web_readonly_bypass'], function(assert, ro_bypass){
        var context = {'readonly_by_pass': true}
        var options = {'readonly_fields': {'field_1': 'va1-1',
                                           'field_2': 'val-2',
                                           'field_3': 'val-3'}};
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {'field_1': 'va1-1', 'field_2': 'val-2', 'field_3': 'val-3'},
            "All fields should be accepted!"
        );

        context = {'readonly_by_pass': ['field_1', 'field_3']};
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {'field_1': 'va1-1','field_3': 'val-3'},
            "two field s1"
        );

        context = {'readonly_by_pass': ['field_1',]};
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {'field_1': 'va1-1'},
            "Only field 1"
        );

        context = {'readonly_by_pass': []};
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {},
            "Empty context field"
        );

        context = null;
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {},
            "Null context"
        );

        context = false;
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {},
            "false context"
        );

        context = {'readonly_by_pass': true}
        options = {'readonly_fields': {'field_1': 'va1-1'}};
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {'field_1': 'va1-1'},
            "Only one option"
        );


        options = {'readonly_fields': {}};
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {},
            "Empty readonly_fields option"
        );

        options = {};
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {},
            "Empty option"
        );

        options = null;
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {},
            "null option"
        );

        options = false;
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {},
            "false option"
        );

        context = false;
        assert.deepEqual(
            ro_bypass.retrieve_readonly_by_pass_fields(
                options, context),
            {},
            "false option and false context"
        );
    });
});
