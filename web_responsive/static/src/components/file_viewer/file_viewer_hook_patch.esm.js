import {patch} from "@web/core/utils/patch";
import {AttachmentList} from "@mail/core/common/attachment_list";

patch(AttachmentList.prototype, {
    setup() {
        super.setup();
        this._wr_isOpeningFileViewer = false;
    },

    onClickAttachment(attachment) {
        // Prevent duplication for opening FileViewer within the same tick/frame
        if (this._wr_isOpeningFileViewer) {
            return;
        }
        this._wr_isOpeningFileViewer = true;
        try {
            super.onClickAttachment(attachment);
        } finally {
            setTimeout(() => {
                this._wr_isOpeningFileViewer = false;
            }, 0);
        }
    },
});
