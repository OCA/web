/* Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2023 Taras Shabaranskyi
 * Copyright 2026 Liam Noonan
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {onMounted, onWillStart, onWillUnmount, useRef} from "@odoo/owl";
import {FileViewer} from "@web/core/file_viewer/file_viewer";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

const CHATTER_IS_ASIDE_CLASS = ".o-mail-Form-chatter.o-aside";
const ATTACHMENT_PREVIEW_SELECTOR = ".o_attachment_preview";

export const POPOUT_CLOSE_EVENT = "web_responsive.popout_close";

/** @param {import("models").Thread|undefined} thread */
export function getFilesOf(thread) {
    return (thread?.attachments || []).filter((file) => file.isViewable);
}

/**
 * @param {import("models").Thread|undefined} thread
 * @param {import("models").Attachment[]} files
 */
export function getStartIndexOf(thread, files) {
    const main = thread?.message_main_attachment_id;
    if (!main) {
        return 0;
    }
    const index = files.findIndex((file) => file.eq(main));
    return index >= 0 ? index : 0;
}

/** Set minimized height from the aside chatter; width comes from FormChatter. */
function useFileViewerAsideHeight(ref) {
    let resizeObserver = null;
    function getAsideChatter() {
        return ref.el?.ownerDocument.querySelector(CHATTER_IS_ASIDE_CLASS);
    }
    function update() {
        const chatter = getAsideChatter();
        if (chatter) {
            ref.el.style.setProperty(
                "--o-FileViewerContainer-height",
                `${chatter.clientHeight}px`
            );
        }
    }
    onMounted(() => {
        const chatter = getAsideChatter();
        if (!chatter) {
            return;
        }
        update();
        resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(chatter);
    });
    onWillUnmount(() => resizeObserver?.disconnect());
}

FileViewer.props.push("isPopout?");

patch(FileViewer.prototype, {
    setup() {
        super.setup();
        this.root = useRef("root");
        this.mailPopout = useService("mail.popout");
        Object.assign(this.state, {
            allowMinimize: false,
            maximized: true,
        });
        useFileViewerAsideHeight(this.root);
        onWillStart(() => {
            this.setDefaultMaximizedState();
            this.setMainAttachment();
        });
    },

    get maximizeLabel() {
        return this.state.maximized ? _t("Minimize") : _t("Maximize");
    },

    setDefaultMaximizedState() {
        if (this.props.isPopout) {
            this.state.allowMinimize = false;
            this.state.maximized = true;
            return;
        }
        this.state.allowMinimize = Boolean(
            document.querySelector(CHATTER_IS_ASIDE_CLASS)
        );
        this.state.maximized = !this.state.allowMinimize;
    },

    toggleMaximized() {
        this.state.maximized = !this.state.maximized;
    },

    getLiveFiles() {
        const thread = this.state.file?.thread;
        return thread ? getFilesOf(thread) : this.props.files;
    },

    /** @param {import("models").Attachment[]} files */
    getIndexOfCurrentFile(files) {
        return files.findIndex(
            (file) => file.eq?.(this.state.file) || file === this.state.file
        );
    },

    /**
     * @param {1|-1} step
     */
    navigate(step) {
        const files = this.getLiveFiles();
        if (!files.length) {
            this.close();
            return;
        }
        let currentIndex = this.getIndexOfCurrentFile(files);
        if (currentIndex < 0) {
            currentIndex = Math.min(this.state.index, files.length - 1);
        }
        const nextIndex = (currentIndex + step + files.length) % files.length;
        this.state.index = nextIndex;
        this.state.file = files[nextIndex];
        this.setMainAttachment();
    },

    next() {
        this.navigate(1);
    },

    previous() {
        this.navigate(-1);
    },

    setMainAttachment() {
        if (!document.querySelector(ATTACHMENT_PREVIEW_SELECTOR)) {
            return;
        }
        const file = this.state.file;
        const thread = file?.thread;
        if (!file || !thread) {
            return;
        }
        // Check that the file is in the attachmentsInWebClientView, i.e. is a pdf/image.
        // only these types of files shold be set as message_main_attachment_id
        const mainIndex = thread.attachmentsInWebClientView.findIndex((attachment) =>
            attachment.eq(file)
        );
        if (mainIndex >= 0) {
            thread.setMainAttachmentFromIndex(mainIndex);
        }
    },

    onClickPopout() {
        if (this.props.isPopout) {
            return;
        }
        const files = this.getLiveFiles();
        const startIndex = Math.max(0, this.getIndexOfCurrentFile(files));
        this.mailPopout.addHooks(
            () => undefined,
            () => this.env.bus.trigger(POPOUT_CLOSE_EVENT)
        );
        this.mailPopout.popout(FileViewer, {
            files,
            startIndex,
            close: () => undefined,
            modal: false,
            isPopout: true,
        });
        this.close();
    },
});
