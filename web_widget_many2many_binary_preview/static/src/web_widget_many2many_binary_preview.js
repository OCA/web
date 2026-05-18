odoo.define("web_widget_many2many_binary_preview", function (require) {
    "use strict";
    var relational_fields = require("web.relational_fields");
    relational_fields.FieldMany2ManyBinaryMultiFiles.include({
        show_preview(file) {
            return (
                (this.attrs.preview === "true" || this.attrs.preview === "True") &&
                (file.mimetype || "").startsWith("image/")
            );
        },
        getImageUrl(file) {
            return _.str.sprintf(
                "/web/image/%s/%sx%s/%s%s",
                file.id,
                this.attrs.preview_width || 0,
                this.attrs.preview_height || 0,
                file.name,
                this.attrs.preview_crop ? "?crop=" + this.attrs.preview_crop : ""
            );
        },
    });
});
