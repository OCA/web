/* Copyright 2017 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html). */

odoo.define_section('web_widget_slick', ['web.core', 'web.form_common'], function(test) {
    "use strict";

    function appendWidget (core, formCommon, $fix) {
        var fieldManager = new formCommon.DefaultFieldManager(null, {});
        var node = {'attrs': {}};
        var FieldSlickImages = core.form_widget_registry.get('one2many_slick_images');
        var widget = new FieldSlickImages(fieldManager, node);
        widget.appendTo($fix);
        return widget;
    }

    function imageUrl (modelName, fieldName, id) {
        return '/web/image/' + modelName + '/' + id + '/' + fieldName;
    }

    test('It should add a slick widget',
        function(assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);

            var slickContainerCount = $fix.find('.slick-container').length;
            assert.strictEqual(slickContainerCount, 1);
        }
    );

    test('.init() should add defaults to options',
        function(assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var fieldManager = new formCommon.DefaultFieldManager(null, {});
            var node = {'attrs': {}};
            var FieldSlickImages = core.form_widget_registry.get('one2many_slick_images');
            var widget = new FieldSlickImages(fieldManager, node);
            widget.appendTo($fix);

            widget.defaults.testing = 'tested';
            widget.init(fieldManager, node);
            assert.strictEqual(widget.options.testing, 'tested');
        }
    );

    test('.destroy_content() should remove images',
        function(assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);

            var $slickImage = $('<div><img></div>');
            widget.$slick.slick('slickAdd', $slickImage);
            widget.destroy_content();

            var slickImageCount = widget.$slick.find('img').length;
            assert.strictEqual(slickImageCount, 0);
        }
    );

    test('.destroy_content() should remove carousel',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);

            widget.destroy_content();

            var slickChildren = widget.$slick.children().length;
            assert.strictEqual(slickChildren, 0);
        }
    );

    test('.render_value() should add images corresponding to field value',
        function(assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);

            var fieldValues = [1, 2];
            widget.set({'value': fieldValues});
            widget.render_value();

            var slickImages = widget.$slick.find('img');
            var slickImageUrls = slickImages.map(function() {
                return $(this).data('lazy');
            }).get();

            var modelName = widget.options.modelName;
            var fieldName = widget.options.fieldName;
            var expectedUrls = fieldValues.map(function(id) {
                return '/web/image/' + modelName + '/' + id + '/' + fieldName;
            });

            assert.deepEqual(slickImageUrls, expectedUrls);
        }
    );

    test('._resizeCarousel() should resize the widget',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var $nosheet = $('<div class="o_form_nosheet"></div>');
            $fix.append($nosheet);

            var widget = appendWidget(core, formCommon, $nosheet);
            var setWidth = 50;
            widget.$slick.outerWidth(setWidth);

            widget._resizeCarousel();

            assert.notStrictEqual(widget.$slick.outerWidth(), setWidth);
        }
    );

    test('._resizeCarousel() should be called when container is resized',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var $nosheet = $('<div class="o_form_nosheet"></div>');
            $fix.append($nosheet);

            var widget = appendWidget(core, formCommon, $nosheet);
            var setWidth = 50;
            widget.$slick.outerWidth(setWidth);

            core.bus.trigger('resize');

            assert.notStrictEqual(widget.$slick.outerWidth(), setWidth);
        }
    );

    test('._resizeLabelWidth() should return the width of the preceding ' +
        'sibling label cell if it exists',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);

            var width = 100;
            var $cell = $('<td style="width:10px;"></td>');
            var $labelCell = $('<td class="o_td_label"></td>');
            $labelCell.outerWidth(width);

            widget.$slick.append($labelCell);
            widget.$slick.append($cell);

            assert.strictEqual(widget._resizeLabelWidth($cell), width);
        }
    );

    test('._resizeLabelWidth() should return 0 if the previous sibling cell ' +
        ' of the provided element is not a label cell',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);

            var width = '100px';
            var $cell = $('<td></td>');
            widget.$slick.append($('<td style="width:' + width + ';"></td>'));
            widget.$slick.append($cell);

            assert.strictEqual(widget._resizeLabelWidth($cell), 0);
        }
    );

    test('._resizeMarginWidth() should return the total left and right ' +
        ' margins of the provided element',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);

            var elementStyle = 'margin-left: 12px; margin-right: 7px;';
            var marginTotal = 19;
            var $element = $('<div style="' + elementStyle + '"></div>');
            widget.$slick.append($element);

            assert.strictEqual(widget._resizeMarginWidth($element), marginTotal);
        }
    );

    test('._resizeMaxWidth() should return the width of the closest sheet element',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var $sheet1 = $('<div class="o_form_sheet"></div>');
            var $sheet2 = $('<div class="o_form_sheet"></div>');
            var expectedWidth = 266;

            $sheet1.width(700);
            $sheet2.width(expectedWidth);
            $sheet1.append($sheet2);
            $fix.append($sheet1);

            var widget = appendWidget(core, formCommon, $sheet2);

            assert.strictEqual(widget._resizeMaxWidth(), expectedWidth);
        }
    );

    test('._resizeMaxWidth() should return the width of the closest nosheet element',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var $nosheet1 = $('<div class="o_form_nosheet"></div>');
            var $nosheet2 = $('<div class="o_form_nosheet"></div>');
            var expectedWidth = 266;

            $nosheet1.width(700);
            $nosheet2.width(expectedWidth);
            $nosheet1.append($nosheet2);
            $fix.append($nosheet1);

            var widget = appendWidget(core, formCommon, $nosheet2);

            assert.strictEqual(widget._resizeMaxWidth(), expectedWidth);
        }
    );

    test('._resizeScaledWidth() should return the provided integer, scaled' +
        'to the % width in the provided element style attribute',
        function (assert, core, formCommon) {
            var $fix = $('#qunit-fixture');
            var widget = appendWidget(core, formCommon, $fix);

            var givenWidth = 100;
            var widthPercent = 54;
            var expectedWidth = widthPercent;
            var $cell = $('<td style="width:' + widthPercent + '%;"></td>');

            assert.strictEqual(widget._resizeScaledWidth($cell, givenWidth), expectedWidth);
        }
    );
});
