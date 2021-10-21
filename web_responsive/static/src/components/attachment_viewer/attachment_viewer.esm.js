/** @odoo-module **/
/* Copyright 2021 ITerra - Sergey Shebanin
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {AttachmentViewer} from "@mail/components/attachment_viewer/attachment_viewer";
import {patch} from "web.utils";

const {useState} = owl.hooks;

// Patch attachment viewer to add min/max buttons capability
patch(AttachmentViewer.prototype, "web_responsive.AttachmentViewer", {
    setup() {
        this._super();
        this.state = useState({
            maximized: false,
        });
    },
    // Disable auto-close to allow to use form in edit mode.
    isCloseable() {
        return false;
    },
});
