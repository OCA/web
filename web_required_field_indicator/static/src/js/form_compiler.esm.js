/** @odoo-module **/

import {FormCompiler} from "@web/views/form/form_compiler";
import {getModifier} from "@web/views/view_compiler";
import {getTag} from "@web/core/utils/xml";
import {patch} from "@web/core/utils/patch";

const INVALID_PAGE_CLASS = "o_web_required_field_indicator_page_invalid";

// Collects the names of the fields that belong directly to a <page>, so
// their validity can be checked at render time. Fields nested inside
// another <field> (x2many list/kanban columns) are skipped: they belong
// to sub-records, not to the main record whose validity we are checking.
function collectPageFieldNames(pageEl) {
    const fieldNames = new Set();
    for (const fieldEl of pageEl.querySelectorAll("field[name]")) {
        let ancestor = fieldEl.parentElement;
        let nested = false;
        while (ancestor && ancestor !== pageEl) {
            if (getTag(ancestor, true) === "field") {
                nested = true;
                break;
            }
            ancestor = ancestor.parentElement;
        }
        if (!nested) {
            fieldNames.add(fieldEl.getAttribute("name"));
        }
    }
    return [...fieldNames];
}

patch(FormCompiler.prototype, "web_required_field_indicator.FormCompiler", {
    compileNotebook(el, params) {
        const noteBook = this._super(el, params);
        // Same <page> filtering as the original compileNotebook, so this
        // list lines up 1-to-1 with the <t t-set-slot> children it produced.
        const pageElements = [...el.children].filter((child) => {
            if (getTag(child, true) !== "page") {
                return false;
            }
            const invisible = getModifier(child, "invisible");
            return !this.isAlwaysInvisible(invisible, params);
        });
        const pageSlots = [...noteBook.children];
        pageElements.forEach((pageEl, index) => {
            const pageSlot = pageSlots[index];
            const fieldNames = collectPageFieldNames(pageEl);
            if (!pageSlot || !fieldNames.length) {
                return;
            }
            const invalidExpr = `(${JSON.stringify(
                fieldNames
            )}.some((fname) => props.record.isInvalid(fname)) ? "${INVALID_PAGE_CLASS}" : "")`;
            const existingClassName = pageSlot.getAttribute("className");
            pageSlot.setAttribute(
                "className",
                existingClassName
                    ? `((${existingClassName}) + " " + ${invalidExpr})`
                    : invalidExpr
            );
        });
        return noteBook;
    },
});
