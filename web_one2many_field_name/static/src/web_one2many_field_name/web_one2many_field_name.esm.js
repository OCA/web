/** @odoo-module **/

// Copyright 2026 Pol Reig <pol.reig@qubiq.es>
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import {whenReady} from "@odoo/owl";
import {browser} from "@web/core/browser/browser";
import {patch} from "@web/core/utils/patch";
import {getTooltipInfo} from "@web/views/fields/field_tooltip";
import {X2ManyField} from "@web/views/fields/x2many/x2many_field";
import {ListRenderer} from "@web/views/list/list_renderer";

const COPIED_FEEDBACK_MS = 1200;

/**
 * Prefer the Clipboard API; fall back to execCommand for HTTP / older contexts.
 *
 * @param {String} text
 * @returns {Promise<void>}
 */
async function writeTextToClipboard(text) {
    if (browser.navigator?.clipboard?.writeText) {
        try {
            await browser.navigator.clipboard.writeText(text);
            return;
        } catch {
            // Fall through to legacy path.
        }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
        copied = document.execCommand("copy");
    } finally {
        document.body.removeChild(textarea);
    }
    if (!copied) {
        throw new Error("Clipboard copy failed");
    }
}

/**
 * Annotate nested list metadata with the parent field type so we only expose
 * the parent technical name for One2many (Many2many already has a FormLabel "?").
 */
patch(X2ManyField.prototype, {
    get nestedKeyOptionalFieldsData() {
        return {
            ...super.nestedKeyOptionalFieldsData,
            fieldType: this.field?.type,
        };
    },
});

/**
 * When a list is embedded in a One2many, expose the parent field name
 * (e.g. bom_line_ids) inside the column FieldTooltip, under "Field:".
 */
patch(ListRenderer.prototype, {
    /**
     * @override
     * @param {Object} column
     * @returns {String}
     */
    makeTooltip(column) {
        const infoJson = getTooltipInfo({
            viewMode: "list",
            resModel: this.props.list.resModel,
            field: this.fields[column.name],
            fieldInfo: column,
        });
        const nested = this.props.nestedKeyOptionalFieldsData;
        // Only One2many: Many2many form labels already show the technical "?".
        if (!odoo.debug || nested?.fieldType !== "one2many" || !nested?.field) {
            return infoJson;
        }
        const info = JSON.parse(infoJson);
        info.parentOne2manyField = nested.field;
        return JSON.stringify(info);
    },
});

// Fallback click-to-copy when web_field_tooltip_copy is not installed.
whenReady(() => {
    document.body.addEventListener(
        "click",
        async (ev) => {
            const copyEl = ev.target?.closest?.(
                ".o_o2m_parent_field [data-copy-value]"
            );
            if (!copyEl || !copyEl.closest(".o-tooltip")) {
                return;
            }
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            const text = copyEl.dataset.copyValue;
            if (!text) {
                return;
            }
            try {
                await writeTextToClipboard(text);
            } catch (error) {
                browser.console.warn(error);
                return;
            }
            copyEl.classList.add("o_field_tooltip_copy_done");
            const badge = copyEl.querySelector(".o_field_tooltip_copy_badge");
            if (badge) {
                badge.textContent = "Copied!";
                badge.classList.remove("d-none");
            }
            browser.setTimeout(() => {
                copyEl.classList.remove("o_field_tooltip_copy_done");
                if (badge) {
                    badge.classList.add("d-none");
                }
            }, COPIED_FEEDBACK_MS);
        },
        true
    );
});
