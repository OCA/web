/* global Webcam */

import {Component, onMounted, onWillStart, useState} from "@odoo/owl";
import {ImageField, imageField} from "@web/views/fields/image/image_field";
import {Dialog} from "@web/core/dialog/dialog";
import {_t} from "@web/core/l10n/translation";
import {debounce} from "@web/core/utils/timing";
import {loadJS} from "@web/core/assets";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

export class WebcamDialog extends Component {
    static template = "web_widget_image_webcam.WebCamDialog";
    static components = {Dialog};
    static props = {
        title: String,
        size: String,
        onSaveClose: Function,
        close: Function,
        width: {type: Number, optional: true},
        height: {type: Number, optional: true},
    };
    setup() {
        this.imageData = false;
        this.orm = useService("orm");
        this.imageData = useState({
            src: "",
        });
        onWillStart(async () => {
            if (window.QUnit) {
                console.warn("Webcam widget is not available in QUnit tests.");
                return;
            }
            await loadJS("/web_widget_image_webcam/static/src/lib/webcam.js");
            const get_webcam_flash_fallback_mode_config = await this.orm.call(
                "ir.config_parameter",
                "get_webcam_flash_fallback_mode_config"
            );
            Webcam.set({
                width: this.props.width,
                height: this.props.height,
                dest_width: this.props.width,
                dest_height: this.props.height,
                image_format: "jpeg",
                jpeg_quality: 90,
                force_flash: get_webcam_flash_fallback_mode_config === "1",
                fps: 45,
            });
        });
        onMounted(() => {
            if (!window.QUnit) {
                Webcam.attach("#live_webcam");
            }
        });
    }
    get isLive() {
        return Webcam.live;
    }
    onTakeSnap() {
        Webcam.snap((data) => {
            this.imageData.src = data;
        });
    }
    onSaveClose() {
        if (this.imageData.src) {
            this.props.onSaveClose(this.imageData.src);
        }
        this.props.close();
    }
}

patch(ImageField.prototype, {
    setup() {
        super.setup();
        this.dialogService = useService("dialog");
        this.debounceOnWebcamClicked = debounce(this.onWebcamClicked, 1000);
    },
    onWebcamClicked() {
        if (window.QUnit) {
            // QUnit tests don't have access to the webcam, so we skip the dialog
            return;
        }
        const dialogProps = {
            size: "large",
            title: _t("WebCam Booth"),
            width: this.props.webcamWidth,
            height: this.props.webcamHeight,
            onSaveClose: (imageData) => {
                const imageDataBase64 = imageData.split(",")[1];
                var approxImgSize =
                    3 * (imageDataBase64.length / 4) -
                    (imageDataBase64.match(/[=]+$/g) || []).length;
                this.onFileUploaded({
                    size: approxImgSize,
                    name: "web-cam-preview.jpeg",
                    type: "image/jpeg",
                    data: imageDataBase64,
                });
            },
            close: () => {
                if (!window.QUnit) {
                    Webcam.reset();
                }
            },
        };
        this.dialogService.add(WebcamDialog, dialogProps);
    },
});

ImageField.props = {
    ...ImageField.props,
    webcamWidth: {type: Number, optional: true},
    webcamHeight: {type: Number, optional: true},
};
ImageField.defaultProps = {
    ...ImageField.defaultProps,
    webcamWidth: 320,
    webcamHeight: 240,
};
const imageExtractProps = imageField.extractProps;
imageField.extractProps = (fieldInfo) => {
    return Object.assign(imageExtractProps(fieldInfo), {
        webcamWidth:
            fieldInfo.options.webcam_size && Boolean(fieldInfo.options.webcam_size[0])
                ? Number(fieldInfo.options.webcam_size[0])
                : 320,
        webcamHeight:
            fieldInfo.options.webcam_size && Boolean(fieldInfo.options.webcam_size[1])
                ? Number(fieldInfo.options.webcam_size[1])
                : 240,
    });
};
