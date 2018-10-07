// License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

odoo.define('web_widget_m2o_image.FieldM2oImage', function (require) {
"use strict";

    var AbstractField = require('web.AbstractField');
    var core = require('web.core');
    var registry = require('web.field_registry');

    var M2oImage = AbstractField.extend({
        className: 'o_m2o_image',
        placeholder: "/web/static/src/img/placeholder.png",
        supportedFieldTypes: ['many2one'],
        specialData: "_fetchSpecialMany2ones",
        events: _.extend({}, AbstractField.prototype.events, {
            'click img': '_onImgClicked',
        }),

        init: function () {
            this._super.apply(this, arguments);
            this._setValues();
        },

        _reset: function () {
            this._super.apply(this, arguments);
            this._setValues();
        },

        _setValues: function () {
            if (this.field.type === 'many2one') {
                this.values = this.record.specialData[this.name];
            }
        },
        // http://localhost:8069/web/image?model=res.partner&field=image_small&id=20&unique=

        _render: function () {
            var self = this;
            if (this.mode === 'edit') {
                this.$el.empty();
                _.each(this.values, function (val, key) {
                    var $container = $('<div>').addClass('col-xs-4 text-center');
                    var $img = $('<img>')
                        .addClass('img img-responsive img-thumbnail ml16 img-200')
                        .toggleClass('btn-info', val.id === self.value.res_id)
                        .attr({src: decodeURIComponent('/web/image?model='+self.field.relation+'&field=image&id='+val.id), onerror: 'this.src="'+self.placeholder+'"'})
                        .data('key', val.id);
                    $container.append($img);
                    var $template_name = $('<p>').text(val.display_name);
                    $container.append($template_name);
                    self.$el.append($container);
                });
            }
            else {
                if (!this.value) {
                    this.$el.empty();
                    var $info = $('<p>').text('Template not selected yet');
                    self.$el.append($info);
                }
                else {
                    this.$el.empty();
                    var $container = $('<div>').addClass('col-xs-6 text-center');
                    var $img = $('<img>')
                        .addClass('img img-responsive img-thumbnail ml16 img-200')
                        .attr({src: decodeURIComponent('/web/image?model='+self.field.relation+'&field=image&id='+self.value.data.id), onerror: 'this.src="'+self.placeholder+'"'});
                    $container.append($img);
                    var $template_name = $('<p>').text(self.value.data.display_name);
                    $container.append($template_name);
                    self.$el.append($container);
                }
            }
        },
        _onImgClicked: function (event) {
            if (this.mode === 'edit') {
                this._setValue($(event.currentTarget).data('key'));
            }
        },
    });

    registry.add('m2o_image', M2oImage);
});
