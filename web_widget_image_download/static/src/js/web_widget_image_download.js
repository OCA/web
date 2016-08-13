/*
 * Copyright 2016 Flavio Corpa <flavio.corpa@tecnativa.com>
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
 */
openerp.web_widget_image_download = function (instance) {
    'use strict';

    instance.web.form.web_widget_image_download = instance.web.form.FieldBinaryImage.include({
        render_value: function () {
            this._super();

            var $widget = this.$el.find('.oe_form_binary_file_download');

            this.imgSrc = this.$el.find('img[name="image"]').attr('src');

            $.ajax({
                type: 'HEAD',
                url: this.imgSrc,
                complete: function (xhr) {
                    // retrieve image type from server ("Content-Type" header)
                    $widget.attr('download', xhr.getResponseHeader("Content-Type").replace('/', '.'));
                }
            });

            // use jquery instead of `replace` with qweb (to avoid breaking inheritance)
            if (this.has_custom_image()) {
                this.$el.find('.oe_form_binary_file_clear').removeClass('col-md-offset-5');
            }

            $widget.attr('href', this.imgSrc);
        },
        has_custom_image: function () {
            // check if the image of the widget is different from the default placeholder
            return this.imgSrc && !this.imgSrc.includes('/placeholder.png');
        }
    });
}
