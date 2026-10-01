/** @odoo-module **/
import {
    VideoCameraDialog,
    isVideoCameraSupported,
} from "../video_camera/video_camera.esm";
import {ChatterTopbar} from "@mail/components/chatter_topbar/chatter_topbar";
import {isMobileOS} from "@web/core/browser/feature_detection";
import {patch} from "@web/core/utils/patch";
import {useRef} from "@odoo/owl";
import {useService} from "@web/core/utils/hooks";

patch(
    ChatterTopbar.prototype,
    "web_chatter_camera/static/src/components/chatter_topbar/chatter_topbar.esm.js",
    {
        setup() {
            this._super(...arguments);
            this.dialog = useService("dialog");
            this.isMobile = isMobileOS();
            this.isVideoCameraSupported = isVideoCameraSupported();
            this.cameraInputRef = useRef("cameraInputRef");
        },
        async onClickButtonCamera() {
            if (this.isMobile) {
                this.cameraInputRef.el.click();
            } else {
                this.dialog.add(VideoCameraDialog, {
                    onCapture: (imageBlob) => {
                        const file = new File([imageBlob], `photo-${Date.now()}.jpg`, {
                            type: "image/jpeg",
                        });
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        this.cameraInputRef.el.files = dt.files;
                        this.cameraInputRef.el.dispatchEvent(
                            new Event("change", {bubbles: true})
                        );
                    },
                });
            }
        },
        async onCameraInputChange() {
            if (this.chatterTopbar.chatter.isTemporary) {
                const saved = await this.chatterTopbar.chatter.doSaveRecord();
                if (!saved) {
                    return;
                }
            }
            this.chatterTopbar.chatter.fileUploader.uploadFiles(
                this.cameraInputRef.el.files
            );
        },
    }
);
