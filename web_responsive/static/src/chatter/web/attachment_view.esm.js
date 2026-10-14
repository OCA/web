/* Copyright 2026 Liam Noonan
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {
    POPOUT_CLOSE_EVENT,
    getFilesOf,
    getStartIndexOf,
} from "@web_responsive/core/file_viewer/file_viewer.esm";
import {useBus, useService} from "@web/core/utils/hooks";
import {AttachmentView} from "@mail/core/common/attachment_view";
import {useEffect} from "@odoo/owl";
import {useFileViewer} from "@web/core/file_viewer/file_viewer_hook";

export class FileViewerAttachmentView extends AttachmentView {
    static template = "web_responsive.FileViewerAttachmentView";

    setup() {
        super.setup();
        this.mailPopout = useService("mail.popout");
        this.fileViewer = useFileViewer();

        const syncViewer = () => {
            if (this.mailPopout.externalWindow || !this.state.thread) {
                this.fileViewer.close();
                return;
            }
            const files = getFilesOf(this.state.thread);
            if (!files.length) {
                this.fileViewer.close();
                return;
            }
            const startIndex = getStartIndexOf(this.state.thread, files);
            this.fileViewer.open(files[startIndex], files);
        };
        useEffect(syncViewer, () => [
            this.props.threadId,
            this.props.threadModel,
            Boolean(this.mailPopout.externalWindow),
        ]);
        useBus(this.env.bus, POPOUT_CLOSE_EVENT, syncViewer);
    }
}
