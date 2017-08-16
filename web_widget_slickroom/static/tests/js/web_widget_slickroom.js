/* Copyright 2017 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html). */

odoo.define_section('web_widget_slickroom', ['web.core', 'web.form_common'], function (test) {
    "use strict";

    function appendWidget (core, formCommon, $fix) {
        var fieldManager = new formCommon.DefaultFieldManager(null, {});
        var node = {'attrs': {}};
        var FieldSlickroomImages = core.form_widget_registry.get('slickroom');
        var widget = new FieldSlickroomImages(fieldManager, node);
        widget.appendTo($fix);
        return widget;
    }

    function imgHTML (id, attr) {
        return $(
            '<div><img data-record-id="' +id + '" ' + attr +
            '="/web/image/ir.attachment/' + id + '/datas"></div>'
        );
    }

    test('._openModal() should open a darkroom modal with provided options',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);
            var recordId = 1;
            widget.$slick.slick('slickAdd', imgHTML(recordId, 'src'));

            var modalAction = {};
            widget.do_action = function (action, options) {
                modalAction = action;
            };

            var expectedAction = {
                "type": "ir.actions.act_window",
                "res_model": "darkroom.modal",
                "name": "Darkroom",
                "views": [[false, "form"]],
                "target": "new",
                "context": {
                    "active_field": widget.options.fieldName,
                    "active_model": widget.options.modelName,
                    "active_record_id": recordId
                }
            };

            widget.$('img').click();

            assert.deepEqual(modalAction, expectedAction);
        }
    );

    test('._openModal() should open a darkroom modal with on_close action ' +
         'that calls ._updateImage()',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);
            var recordId = 1;
            widget.$slick.slick('slickAdd', imgHTML(recordId, 'src'));

            var modalOptions = {};
            widget.do_action = function (action, options) {
                modalOptions = options;
            };

            var $img = widget.$('img');
            $img.click();
            modalOptions.on_close();

            assert.notStrictEqual($img.attr('src').indexOf('?unique'), -1);
        }
    );

    test('._slickRender() should add data-record-id to images',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);

            var values = [1, 2, 3];

            _.each(values, function(recordId) {
                widget._slickRender('/web/image/ir.attachments/', recordId);
            });

            var slickImageIds = widget.$slick.find('img').map(function () {
                return $(this).data('record-id');
            }).get();

            assert.deepEqual(slickImageIds, values);
        }
    );

    test('._updateImage() should update source of matching/loaded slick images',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);
            var imgId = 1;

            for(var i = 0; i < 5; i++) {
                widget.$slick.slick('slickAdd', imgHTML(imgId, 'src'));
            }

            widget._updateImage(imgId);

            var $matches = widget.$slick.find(
                '[data-record-id="' + imgId + '"]'
            );
            $matches.each(function () {
                var newSrc = $(this).attr('src');
                assert.notStrictEqual(newSrc.indexOf('?unique'), -1);
            });
        }
    );

    test('._updateImage() should update lazy data attribute of matching/unloaded slick images',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);
            var imgId = 1;

            for(var i = 0; i < 5; i++) {
                widget.$slick.slick('slickAdd', imgHTML(imgId, 'data-lazy'));
            }

            widget._updateImage(1);

            var $matches = widget.$slick.find(
                '[data-record-id="' + imgId + '"]'
            );
            $matches.each(function () {
                var newSrc = $(this).attr('data-lazy');
                assert.notStrictEqual(newSrc.indexOf('?unique'), -1);
            });
        }
    );

    test('._updateImage() should not update source of non-matching/loaded slick images',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);
            var imgId = 1;
            var img2Id = 2;

            widget.$slick.slick('slickAdd', imgHTML(imgId, 'src'));
            widget.$slick.slick('slickAdd', imgHTML(img2Id, 'src'));

            widget._updateImage(1);

            var $notMatch = widget.$slick.find(
                '[data-record-id="' + img2Id + '"]'
            );
            assert.strictEqual($notMatch.attr('src').indexOf('?unique'), -1);
        }
    );

    test('._updateImage() should not update lazy data attribute of ' +
         'non-matching/unloaded slick images',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);
            var imgId = 1;
            var img2Id = 2;

            widget.$slick.slick('slickAdd', imgHTML(imgId, 'data-lazy'));
            widget.$slick.slick('slickAdd', imgHTML(img2Id, 'data-lazy'));

            widget._updateImage(1);

            var $notMatch = widget.$slick.find(
                '[data-record-id="' + img2Id + '"]'
            );
            assert.strictEqual(
                $notMatch.attr('data-lazy').indexOf('?unique'), -1
            );
        }
    );

});
