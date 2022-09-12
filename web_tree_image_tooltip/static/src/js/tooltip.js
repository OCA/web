odoo.define('web_tree_image_tooltip.web_tree_image_tooltip',
        function (require) {
    "use strict";

    var session = require('web.session');
    var field_utils = require('web.field_utils');
    var FieldBinaryImage = require('web.basic_fields').FieldBinaryImage;
    var ListRenderer = require('web.ListRenderer');

    FieldBinaryImage.include({
        _render: function () {
            this._super();
            if (this.nodeOptions.tooltip_image) {
                var image_src = session.url('/web/image', {
                    model: this.model,
                    id: JSON.stringify(this.res_id),
                    field: this.nodeOptions.tooltip_image,
                    // unique forces a reload of the image when the record has been updated
                    unique: field_utils.format.datetime(this.recordData.__last_update).replace(/[^0-9]/g, ''),
                })
                this.$('.img-fluid')[0].setAttribute("tooltip-image-src", image_src);
            }
        },
    });

    ListRenderer.include({
        events: _.extend({}, ListRenderer.prototype.events, {
            'mouseover tbody tr td .o_field_image': '_onHoverRecord_img',
        }),
        _onHoverRecord_img: function (event) {
            var img_src =
                $(event.currentTarget).children('.img-fluid').attr('tooltip-image-src') ||
                $(event.currentTarget).children('.img-fluid').attr('src');

            $(event.currentTarget).tooltip({
                title: "<img src="+img_src+" class='tooltip_image' />",
                delay: 0,
            }).tooltip('show');
        }
    });
})
