/* Copyright 2017 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html). */

odoo.define('web_widget_slickroom', function (require) {
    "use strict";

    var core = require('web.core');
    var FieldSlickImages = require('web_widget_slick').FieldSlickImages;

    var FieldSlickroomImages = FieldSlickImages.extend({

        widget_class: FieldSlickImages.prototype.widget_class + ' o_slickroom',
        events: _.extend({}, FieldSlickImages.prototype.events, {
            'click img': '_openModal'
        }),

        _openModal: function (ev) {
            if (this.get("effective_readonly")) {
                return;
            }

            var recordId = $(ev.target).data('record-id');
            var modalAction = {
                type: 'ir.actions.act_window',
                res_model: 'darkroom.modal',
                name: 'Darkroom',
                views: [[false, 'form']],
                target: 'new',
                context: {
                    active_field: this.options.fieldName,
                    active_model: this.options.modelName,
                    active_record_id: recordId
                }
            };

            this.do_action(modalAction, {
                on_close: $.proxy(this._updateImage, this, recordId)
            });
        },

        _slickRender: function(baseUrl, id) {
            this._super(baseUrl, id);
            this.$slick.find('img:last').data('record-id', id);
        },

        _updateImage: function (recordId) {
            // SlickJS creates 'clones', so multiple elements need updated src
            var $imgs = this.$slick.find('img').filter(function () {
                return $(this).data('record-id') === recordId;
            });
            var $loaded = $imgs.filter('[src]');
            var $notLoaded = $imgs.filter('[data-lazy]');

            var imgUrl = $loaded.first().attr('src');
            var imgUrlNew = imgUrl + "?unique=" + new Date().getTime();

            $loaded.attr('src', imgUrlNew);
            $notLoaded.attr('data-lazy', imgUrlNew);
        }

    });

    core.form_widget_registry.add("slickroom", FieldSlickroomImages);

    return {FieldSlickroomImages: FieldSlickroomImages};

});
