/**
*    Copyright 2017 LasLabs Inc.
*    License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
**/

odoo.define('web_widget_darkroom.darkroom_modal_button', function(require) {
    'use strict';

    var core = require('web.core');
    var DataModel = require('web.DataModel');

    core.form_widget_registry.get('image').include({
        // Used in template to prevent Darkroom buttons from being added to
        // forms for new records, which are not supported
        darkroom_supported: function() {
            if (this.field_manager.dataset.index === null) {
                return false;
            }
            return true;
        },

        render_value: function() {
            this._super();

            var imageWidget = this;
            var activeModel = imageWidget.field_manager.dataset._model.name;
            var activeRecordId = imageWidget.field_manager.datarecord.id;
            var activeField = imageWidget.node.attrs.name;

            var updateImage = function() {
                var ActiveModel = new DataModel(activeModel);
                ActiveModel.query([activeField]).
                    filter([['id', '=', activeRecordId]]).
                    all().
                    then(function(result) {
                        imageWidget.set_value(result[0].image);
                    });
            };

            var openModal = function() {
                var context = {
                    active_model: activeModel,
                    active_record_id: activeRecordId,
                    active_field: activeField,
                };
                var modalAction = {
                    type: 'ir.actions.act_window',
                    res_model: 'darkroom.modal',
                    name: 'Darkroom',
                    views: [[false, 'form']],
                    target: 'new',
                    context: context,
                };
                var options = {on_close: updateImage};
                imageWidget.do_action(modalAction, options);
            };

            var $button = this.$('.o_form_binary_image_darkroom_modal');
            if ($button.length > 0) {
                $button.click(openModal);
            }
        },
    });
});
