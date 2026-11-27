import {
    VideoCameraDialog,
    isVideoCameraSupported,
} from "../video_camera/video_camera.esm";
import {Chatter} from "@mail/chatter/web_portal/chatter";
import {isMobileOS} from "@web/core/browser/feature_detection";
import {patch} from "@web/core/utils/patch";
import {useRef} from "@odoo/owl";
import {useService} from "@web/core/utils/hooks";

patch(Chatter.prototype, {
    setup() {
        super.setup(...arguments);
        this.dialogService = useService("dialog");
        this.isMobile = isMobileOS();
        this.isVideoCameraSupported = isVideoCameraSupported();
        this.cameraInputRef = useRef("cameraInputRef");
    },

    get showCameraButton() {
        return this.isMobile || this.isVideoCameraSupported;
    },

    onClickCamera() {
        if (this.isMobile) {
            this.cameraInputRef.el.click();
            return;
        }
        this.dialogService.add(VideoCameraDialog, {
            onCapture: (imageBlob) => {
                const file = new File([imageBlob], `photo-${Date.now()}.jpg`, {
                    type: "image/jpeg",
                });
                return this.uploadCameraFiles([file]);
            },
        });
    },

    async onCameraInputChange(ev) {
        const files = [...ev.target.files];
        ev.target.value = "";
        await this.uploadCameraFiles(files);
    },

    async uploadCameraFiles(files) {
        if (!files.length) {
            return;
        }
        if (!this.state.thread.id) {
            const saved = await this.props.saveRecord?.();
            if (!saved) {
                return;
            }
        }
        await Promise.all(
            files.map((file) =>
                this.attachmentUploader.uploadFile(file, {thread: this.state.thread})
            )
        );
        this.state.isAttachmentBoxOpened = true;
        if (this.props.hasParentReloadOnAttachmentsChanged) {
            this.reloadParentView();
        }
    },
});
