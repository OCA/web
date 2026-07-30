/** @odoo-module **/

import {Many2ManyBinaryField} from "@web/views/fields/many2many_binary/many2many_binary_field";
import {patch} from "@web/core/utils/patch";

patch(Many2ManyBinaryField.prototype, "web_widget_many2many_binary_preview", {
    show_preview(file) {
        return this.props.showPreview && (file.mimetype || "").startsWith("image/");
    },
    getImageUrl(file) {
        return _.str.sprintf(
            "/web/image/%s/%sx%s/%s%s",
            file.id,
            this.props.previewWidth,
            this.props.previewHeight,
            file.name,
            this.props.previewCrop ? "?crop=" + this.props.previewCrop : ""
        );
    },
});

const extractProps = Many2ManyBinaryField.extractProps;
Many2ManyBinaryField.extractProps = (params) => {
    return {
        ...extractProps(params),
        showPreview: Boolean(params.attrs.preview),
        previewWidth: Number(params.attrs.preview_width) || 0,
        previewHeight: Number(params.attrs.preview_height) || 0,
        previewCrop: params.attrs.preview_crop || "",
    };
};
Many2ManyBinaryField.props = {
    ...Many2ManyBinaryField.props,
    showPreview: {type: Boolean, optional: true},
    previewWidth: {type: Number, optional: 0},
    previewHeight: {type: Number, optional: 0},
    previewCrop: {type: String, optional: ""},
};
