/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {download} from "@web/core/network/download";
import {isBinarySize} from "@web/core/utils/binary";
import {ImageField} from "@web/views/fields/image/image_field";

patch(
    ImageField.prototype,
    "web_widget_image_download/static/src/js/web_widget_image_download.js",
    {
        async onImageDownload() {
            await download({
                data: {
                    model: this.props.record.resModel,
                    id: this.props.record.data.id,
                    field: this.props.name,
                    filename_field: this.name,
                    filename: this.name || "",
                    download: true,
                    data: isBinarySize(this.props.value) ? null : this.props.value,
                },
                url: "/web/content",
            });
        },
    }
);
