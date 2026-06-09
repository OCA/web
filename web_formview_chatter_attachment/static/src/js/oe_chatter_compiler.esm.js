/* eslint-disable jsdoc/check-tag-names */
/** @odoo-module **/

import {append, createElement, setAttributes} from "@web/core/utils/xml";
import {evaluateExpr} from "@web/core/py_js/py";
import {registry} from "@web/core/registry";

function compileOeChatter(node) {
    const optionsAttr = node.getAttribute("options");
    let options = {};
    if (optionsAttr) {
        options = evaluateExpr(optionsAttr);
    }

    if (!options || !options.render_attachments) {
        // If it doesn't match the criteria, we don't handle it
        return node;
    }

    const chatterContainerXml = createElement("t");
    setAttributes(chatterContainerXml, {
        "t-component": "__comp__.mailComponents.Chatter",
        has_activities: "false",
        hasAttachmentPreview: "false",
        isAttachmentBoxVisibleInitially: options.open_attachments ? "true" : "false",
        threadId: "__comp__.props.record.resId or undefined",
        threadModel: "__comp__.props.record.resModel",
        webRecord: "__comp__.props.record",
        saveRecord: "() => __comp__.save and __comp__.save()",
    });

    const chatterContainerHookXml = createElement("div");
    chatterContainerHookXml.classList.add("oe_chatter");
    if (options.hide_attachments_topbar) {
        chatterContainerHookXml.classList.add("hide_topbar");
    }
    if (options.readonly) {
        chatterContainerHookXml.classList.add("readonly_attachments");
    }

    setAttributes(chatterContainerHookXml, {"t-if": "!__comp__.env.inDialog"});
    append(chatterContainerHookXml, chatterContainerXml);
    return chatterContainerHookXml;
}

registry.category("form_compilers").add("oe_chatter_attachment_compiler", {
    selector: "div.oe_chatter",
    fn: compileOeChatter,
});

// Intercept native <chatter> compilation to add our custom CSS classes
const formCompilers = registry.category("form_compilers");
const originalChatterCompiler = formCompilers.get("chatter_compiler", null);

if (originalChatterCompiler) {
    const originalFn = originalChatterCompiler.fn;
    originalChatterCompiler.fn = function (node, params) {
        const res = originalFn.call(this, node, params);
        if (res && res.classList && res.classList.contains("o-mail-Form-chatter")) {
            if (
                node.getAttribute("hide_attachments_topbar") === "True" ||
                node.getAttribute("hide_attachments_topbar") === "1"
            ) {
                res.classList.add("oe_chatter", "hide_topbar");
            }
            if (
                node.getAttribute("readonly_attachments") === "True" ||
                node.getAttribute("readonly_attachments") === "1"
            ) {
                res.classList.add("oe_chatter", "readonly_attachments");
            }
        }
        return res;
    };
}
