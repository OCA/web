/* global QUnit */
/* Copyright 2019 Alexandre Díaz - <dev@redneboa.es>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_widget_text_markdown.test', function (require) {
    'use strict';

    var FormView = require('web.FormView');
    var testUtils = require('web.test_utils');

    var createAsyncView = testUtils.createAsyncView;


    QUnit.module('web_widget_text_markdown', {
        beforeEach: function () {
            this.data = {
                partner: {
                    fields: {comment: {string: "Comment", type: "text"}},
                    records: [
                        {id: 1, comment: "This is a test\n**Hello**"},
                    ],
                },
            };
            this.arch = '<form><sheet>' +
                            '<field name="comment"' +
                                  ' widget="bootstrap_markdown" />' +
                        '</sheet></form>';
        },
    }, function () {
        QUnit.module('FieldTextMarkDown');
        QUnit.test('bootstrap markdown widget are correctly rendered (preview)',
            function (assert) {
                assert.expect(1);

                var done = assert.async();

                createAsyncView({
                    View: FormView,
                    model: 'partner',
                    data: this.data,
                    arch: this.arch,
                    res_id: 1,
                }).then(function (form) {
                    _.defer(function () {
                        assert.strictEqual(form.$('.md-editor').length, 0);
                        form.destroy();
                        done();
                    });
                });
            }
        );
        QUnit.test('bootstrap markdown widget are correctly rendered (edit)',
            function (assert) {
                assert.expect(1);

                var done = assert.async();

                createAsyncView({
                    View: FormView,
                    model: 'partner',
                    data: this.data,
                    arch: this.arch,
                    res_id: 1,
                    viewOptions: {mode: 'edit'},
                }).then(function (form) {
                    _.defer(function () {
                        assert.strictEqual(form.$('.md-editor').length, 1);
                        form.destroy();
                        done();
                    });
                });
            }
        );
    });

});
