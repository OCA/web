/*
 * Copyright 2016 Flavio Corpa <flavio.corpa@tecnativa.com>
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
 */
openerp.web_widget_image_download = function(instance) {
    'use strict';

    instance.web.form.web_widget_image_download = instance.web.form.FieldBinaryImage.include({
        render_value() {
            this._super();

            // take image URI from preceding <img> tag
            this.$el.find('.oe_form_binary_file_download').attr('href', $('img[name="image"]').attr('src'));
        }
    });
}
