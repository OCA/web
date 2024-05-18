/** @odoo-module **/
/*
    Copyright 2023 Camptocamp SA (https://www.camptocamp.com).
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

import { FormCompiler } from "@web/views/form/form_compiler";
import { patch } from "@web/core/utils/patch";
import { append, setAttributes } from "@web/core/utils/xml";

/**
 * So, you've landed here and you have no idea what this is about. Don't worry, you're
 * not the only one. Here's a quick summary of what's going on:
 *
 * In core, the chatter position depends on the size of the screen and wether there is
 * an attachment viewer or not. There are 3 possible positions, and for each position a
 * different chatter instance is displayed.
 *
 * So, in fact, we have 3 chatter instances running, and we switch their visibility
 * depending on the desired position.
 *
 * A) Bottom position
 *    https://github.com/odoo/odoo/blob/2ef010907/addons/mail/static/src/views/form/form_compiler.js#L160
 *    Condition: `!this.props.hasAttachmentViewer and uiService.size < ${SIZES.XXL}`
 *
 *    This is the bottom position you would except. However it can only be there until
 *    XXL screen sizes, because the container is a flexbox and changes from row to
 *    column display. It's hidden in the presence of an attachment viewer.
 *
 * B) Bottom In-sheet position
 *    https://github.com/odoo/odoo/blob/2ef010907/addons/mail/static/src/views/form/form_compiler.js#L181
 *    Condition: `this.props.hasAttachmentViewer`
 *
 *    This is the bottom position that's used when there's an attachment viewer in place.
 *    It's rendered within the form sheet, possibly to by-pass the flexbox issue
 *    beforementioned. It's only instanciated when there's an attachment viewer.
 *
 * C) Sided position
 *    https://github.com/odoo/odoo/blob/2ef010907/addons/mail/static/src/views/form/form_compiler.js#L83
 *    Condition: `!hasAttachmentViewer() and uiService.size >= ${SIZES.XXL}`
 *
 *    This is the sided position, hidden in the presence of an attachment viewer.
 *    It's the better half of `A`.
 *
 * The patches and overrides you see below are here to alter these conditions to force
 * a specific position regardless of the screen size, depending on an user setting.
 */


patch(FormCompiler.prototype, {
    /**
     * Patch the visibility of bottom chatters (`A` and `B` above).
     * `B` may not exist in some situations, so we ensure it does by creating it.
     *
     * @override
     */
    compile(node, params) {
        const res = super.compile(node, params);

        const chatterContainerHookXml = res.querySelector(
            ".o-mail-ChatterContainer:not(.o-isInFormSheetBg)"
        );
        if (!chatterContainerHookXml) {
            return res;
        }
        if (chatterContainerHookXml.parentNode.classList.contains("o_form_sheet")) {
            return res;
        }
        // Don't patch anything if the setting is "sided": this is the core behaviour
        if (odoo.web_chatter_position === "sided") {
            return res;
            // For "bottom", we keep the chatter in the form sheet
            // (the one used for the attachment viewer case)
            // If it's not there, we create it.
        } else if (odoo.web_chatter_position === "bottom") {
            const webClientViewAttachmentViewHookXml = res.querySelector(
                ".o_attachment_preview"
            );
            if (!webClientViewAttachmentViewHookXml) {
                const formSheetBgXml = res.querySelector(".o_form_sheet_bg");
                if (!formSheetBgXml) {
                    return res;
                }
                const sheetBgChatterContainerHookXml =
                    chatterContainerHookXml.cloneNode(true);
                sheetBgChatterContainerHookXml.classList.add("container");
                sheetBgChatterContainerHookXml.setAttribute("t-if", true);
                formSheetBgXml.setAttribute("style", "max-width: 100%;");
                setAttributes(sheetBgChatterContainerHookXml, {
                    "t-attf-class": "",
                });
                append(formSheetBgXml, sheetBgChatterContainerHookXml);
                chatterContainerHookXml.setAttribute("t-if", false);
            }
        }
        return res;
    },
});
