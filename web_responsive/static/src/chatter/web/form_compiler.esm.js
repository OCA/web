/* Copyright 2026 Liam Noonan
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {FormCompiler} from "@web/views/form/form_compiler";
import {patch} from "@web/core/utils/patch";
import {setAttributes} from "@web/core/utils/xml";

patch(FormCompiler.prototype, {
    compile(node, params) {
        const res = super.compile(node, params);
        const chatterContainerHookXml = res.querySelector(
            ".o-mail-Form-chatter:not(.o-isInFormSheetBg)"
        );
        const chatterContainerXml = chatterContainerHookXml?.querySelector(
            "t[t-component='__comp__.mailComponents.Chatter']"
        );
        if (!chatterContainerXml) {
            return res;
        }
        // ResizablePanel only takes one class string, so we have to
        // bundle chatter's class + t-attf-class into one string.
        const staticClass = chatterContainerHookXml.getAttribute("class") || "";
        const attfClass = chatterContainerHookXml.getAttribute("t-attf-class");
        let chatterContainerClass = `'${staticClass}'`;
        if (attfClass) {
            const attfExpr = attfClass.replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
            chatterContainerClass = `'${staticClass} ' + (${attfExpr})`;
        }
        setAttributes(chatterContainerXml, {
            "t-component": "__comp__.mailComponents.FormChatter",
            chatterComponent: "__comp__.mailComponents.Chatter",
            chatterContainerClass,
        });
        const tIf = chatterContainerHookXml.getAttribute("t-if");
        if (tIf) {
            setAttributes(chatterContainerXml, {"t-if": tIf});
        }
        chatterContainerHookXml.replaceWith(chatterContainerXml);
        return res;
    },
});
