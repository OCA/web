/* Copyright 2021 ITerra - Sergey Shebanin
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2023 Taras Shabaranskyi
 * Copyright 2026 Liam Noonan
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {onMounted, onWillStart, onWillUnmount, useRef} from "@odoo/owl";
import {FileViewer} from "@web/core/file_viewer/file_viewer";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

const CHATTER_IS_ASIDE_CLASS = ".o-mail-Form-chatter.o-aside";

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

patch(FileViewer.prototype, {
    setup() {
        super.setup();
        this.root = useRef("root");
        Object.assign(this.state, {
            allowMinimize: false,
            maximized: true,
        });
        useFileViewerAsideHeight(this.root);
        onWillStart(this.setDefaultMaximizeState);
    },

    get maximizeLabel() {
        return this.state.maximized ? _t("Minimize") : _t("Maximize");
    },

    setDefaultMaximizeState() {
        this.state.allowMinimize = Boolean(
            document.querySelector(CHATTER_IS_ASIDE_CLASS)
        );
        this.state.maximized = !this.state.allowMinimize;
    },

    toggleMaximized() {
        this.state.maximized = !this.state.maximized;
    },
});
