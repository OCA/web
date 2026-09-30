/* Copyright 2024 Taras Shabaranskyi
 * Copyright 2026 Liam Noonan
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {FileViewerAttachmentView} from "@web_responsive/chatter/web/attachment_view.esm";
import {FormRenderer} from "@web/views/form/form_renderer";
import {patch} from "@web/core/utils/patch";

patch(FormRenderer.prototype, {
    setup() {
        super.setup();
        if (this.mailComponents) {
            this.mailComponents.AttachmentView = FileViewerAttachmentView;
        }
    },

    /** A bit of a hack
     * COMBO would render chatter on the bottom, so we use EXTERNAL_COMBO_XXL instead.
     * This still gets us aside chatter and o_attachment_preview still renders so we
     * can hook into it.
     */
    mailLayout(hasAttachmentContainer) {
        const layout = super.mailLayout(hasAttachmentContainer);
        if (layout === "COMBO") {
            return "EXTERNAL_COMBO_XXL";
        }
        return layout;
    },
});
