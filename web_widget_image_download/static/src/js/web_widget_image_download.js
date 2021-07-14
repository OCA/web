/* Copyright 2016 Flavio Corpa <flavio.corpa@tecnativa.com>
 * Copyright 2016 Jairo Llopis <jairo.llopis@tecnativa.com>
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define("web_widget_image_download.widget", function (require) {
    "use strict";

    var FieldBinaryImage = require("web.basic_fields").FieldBinaryImage;

    FieldBinaryImage.include({
        _render: function () {
            this._super();
            var $widget = this.$el.find(".o_form_binary_file_download");
            this.imgSrc = this.$el.find('img[name="' + this.name + '"]').attr("src");

            $.ajax({
                // Avoid downloading full image, just headers
                type: "HEAD",
                url: this.imgSrc,
                complete: function (xhr) {
                    $widget.attr(
                        "download",
                        xhr.getResponseHeader("Content-Type").replace("/", ".")
                    );
                },
            });

            $widget.attr("href", this.imgSrc);
        },
    });
});
