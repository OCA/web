/** @odoo-module **/
import {Component, onMounted, onWillUnmount, useRef, useState} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {_t} from "@web/core/l10n/translation";
import {browser} from "@web/core/browser/browser";
import {delay} from "web.concurrency";
import {isVideoElementReady} from "@web/webclient/barcode/ZXingBarcodeDetector";

export class VideoCameraDialog extends Component {
    setup() {
        this.videoPreviewRef = useRef("videoPreview");
        this.stream = null;
        this.state = useState({
            isReady: false,
        });

        onMounted(async () => {
            const constraints = {
                video: {facingMode: this.props.facingMode},
                audio: false,
            };

            try {
                this.stream = await browser.navigator.mediaDevices.getUserMedia(
                    constraints
                );
            } catch (err) {
                const errors = {
                    NotFoundError: _t("No device can be found."),
                    NotAllowedError: _t("Odoo needs your authorization first."),
                };
                const errorMessage =
                    _t("Could not start scanning. ") +
                    (errors[err.name] || err.message);
                this.onError(new Error(errorMessage));
                return;
            }
            this.videoPreviewRef.el.srcObject = this.stream;
            await this.isVideoReady();
            const tracks = this.stream.getVideoTracks();
            if (tracks.length) {
                const [track] = tracks;
                const caps = track.getCapabilities();
                if (caps.width && caps.height) {
                    await track.applyConstraints({
                        width: caps.width.max,
                        height: caps.height.max,
                    });
                }
            }
        });

        onWillUnmount(() => {
            if (this.stream) {
                this.stream.getTracks().forEach((track) => track.stop());
                this.stream = null;
            }
        });
    }
    async isVideoReady() {
        return new Promise(async (resolve) => {
            while (!isVideoElementReady(this.videoPreviewRef.el)) {
                await delay(10);
            }
            this.state.isReady = true;
            resolve();
        });
    }
    async onCapture() {
        const imageCapture = new ImageCapture(this.stream.getVideoTracks()[0]);
        const imageBlob = await imageCapture.takePhoto();
        this.props.onCapture(imageBlob);
        this.props.close();
    }
    onError(error) {
        this.props.close({error});
    }
}

Object.assign(VideoCameraDialog, {
    components: {
        Dialog,
    },
    template: "web_chatter_camera.VideoCameraDialog",
});

export function isVideoCameraSupported() {
    return (
        window.ImageCapture &&
        browser.navigator.mediaDevices &&
        browser.navigator.mediaDevices.getUserMedia
    );
}
