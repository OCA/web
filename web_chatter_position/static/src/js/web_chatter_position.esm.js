/** @odoo-module **/
/*
    Copyright 2023 Camptocamp SA (https://www.camptocamp.com).
    Copyright 2024 Alitec Pte Ltd (https://www.alitec.sg).
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

import {FormCompiler} from "@web/views/form/form_compiler";
import {FormController} from "@web/views/form/form_controller";
import {patch} from "@web/core/utils/patch";
import {SIZES} from "@web/core/ui/ui_service";
import {hasTouch} from "@web/core/browser/feature_detection";
import {append, createElement, getTag, setAttributes} from "@web/core/utils/xml";

patch(FormCompiler.prototype, {
    /**
     * Patch the css classes of the `Form`, to include an extra `h-100` class.
     * Without it, the form sheet will not be full height in some situations,
     * looking a bit weird.
     *
     * @override
     */
    compileForm(el, params) {
        const sheetNode = el.querySelector("sheet");
        const displayClasses = sheetNode
            ? `d-flex {{ ((__comp__.uiService.size < ${SIZES.XXL} && ${
                  odoo.web_chatter_position != "sided"
              }) || ${
                  odoo.web_chatter_position === "bottom"
              }) ? "flex-column" : "flex-nowrap h-100" }}`
            : "d-block";
        const stateClasses =
            "{{ __comp__.props.record.dirty ? 'o_form_dirty' : !__comp__.props.record.isNew ? 'o_form_saved' : '' }}";
        const form = createElement("div", {
            class: "o_form_renderer",
            "t-att-class": "__comp__.props.class",
            "t-attf-class": `{{__comp__.props.record.isInEdition ? 'o_form_editable' : 'o_form_readonly'}} ${displayClasses} ${stateClasses}`,
        });
        if (!sheetNode) {
            for (const child of el.childNodes) {
                // ButtonBox are already compiled for the control panel and should not
                // be recompiled for the renderer of the view
                if (child.attributes?.name?.value !== "button_box") {
                    append(form, this.compileNode(child, params));
                }
            }
            form.classList.add("o_form_nosheet");
        } else {
            let compiledList = [];
            for (const child of el.childNodes) {
                const compiled = this.compileNode(child, params);
                if (getTag(child, true) === "sheet") {
                    append(form, compiled);
                    compiled.prepend(...compiledList);
                    compiledList = [];
                } else if (compiled) {
                    compiledList.push(compiled);
                }
            }
            append(form, compiledList);
        }
        return form;
    },
    compile(node, params) {
        // TODO no chatter if in dialog?
        const res = super.compile(node, params);
        const chatterContainerHookXml = res.querySelector(".o-mail-Form-chatter");
        if (!chatterContainerHookXml) {
            return res; // No chatter, keep the result as it is
        }
        const chatterContainerXml = chatterContainerHookXml.querySelector(
            "t[t-component='__comp__.mailComponents.Chatter']"
        );
        setAttributes(chatterContainerXml, {
            isChatterAside: "false",
            isInFormSheetBg: "false",
            saveRecord: "__comp__.props.saveRecord",
        });
        if (chatterContainerHookXml.parentNode.classList.contains("o_form_sheet")) {
            return res; // If chatter is inside sheet, keep it there
        }
        const formSheetBgXml = res.querySelector(".o_form_sheet_bg");
        const parentXml = formSheetBgXml && formSheetBgXml.parentNode;
        if (!parentXml) {
            return res; // Miss-config: a sheet-bg is required for the rest
        }

        const webClientViewAttachmentViewHookXml = res.querySelector(
            ".o_attachment_preview"
        );
        if (webClientViewAttachmentViewHookXml) {
            // In sheet bg (attachment viewer present)
            setAttributes(webClientViewAttachmentViewHookXml, {
                "t-if": `__comp__.hasFileViewer() and __comp__.uiService.size >= ${SIZES.XXL}`,
            });
            const sheetBgChatterContainerHookXml =
                chatterContainerHookXml.cloneNode(true);
            sheetBgChatterContainerHookXml.classList.add("o-isInFormSheetBg", "w-auto");
            setAttributes(sheetBgChatterContainerHookXml, {
                "t-if": `__comp__.hasFileViewer() and __comp__.uiService.size >= ${SIZES.XXL}`,
            });
            append(formSheetBgXml, sheetBgChatterContainerHookXml);
            const sheetBgChatterContainerXml =
                sheetBgChatterContainerHookXml.querySelector(
                    "t[t-component='__comp__.mailComponents.Chatter']"
                );
            setAttributes(sheetBgChatterContainerXml, {
                isInFormSheetBg: "true",
                isChatterAside: "false",
            });
        }
        // After sheet bg (standard position, either aside or below)
        if (webClientViewAttachmentViewHookXml) {
            setAttributes(chatterContainerHookXml, {
                "t-if": `!(__comp__.hasFileViewer() and __comp__.uiService.size >= ${SIZES.XXL})`,
                "t-attf-class": `{{ __comp__.uiService.size >= ${SIZES.XXL} and !(__comp__.hasFileViewer() and __comp__.uiService.size >= ${SIZES.XXL}) ? "o-aside" : "" }}`,
            });
            setAttributes(chatterContainerXml, {
                isInFormSheetBg: "__comp__.hasFileViewer()",
                isChatterAside: `__comp__.uiService.size >= ${SIZES.XXL} and !(__comp__.hasFileViewer() and __comp__.uiService.size >= ${SIZES.XXL})`,
            });
        } else if (odoo.web_chatter_position === "sided") {
            setAttributes(chatterContainerXml, {
                isInFormSheetBg: "false",
                isChatterAside: "true",
            });
            setAttributes(chatterContainerHookXml, {
                "t-attf-class": "o-aside",
            });
        } else {
            setAttributes(chatterContainerXml, {
                isInFormSheetBg: "false",
                isChatterAside: `__comp__.uiService.size >= ${SIZES.XXL}`,
            });
            setAttributes(chatterContainerHookXml, {
                "t-attf-class": `{{ (__comp__.uiService.size >= ${SIZES.XXL} && ${
                    odoo.web_chatter_position != "bottom"
                }) ? "o-aside" : "mt-4 mt-md-0" }}`,
            });
        }
        append(parentXml, chatterContainerHookXml);
        return res;
    },
});

patch(FormController.prototype, {
    /**
     * Patch the css classes of the form container, to include an extra `flex-row` class.
     * Without it, it'd go for flex columns direction and it won't look good.
     *
     * @override
     */
    get className() {
        const result = {};
        const {size} = this.ui;
        if (size <= SIZES.XS) {
            result.o_xxs_form_view = true;
        } else if (
            (!this.env.inDialog &&
                size === SIZES.XXL &&
                odoo.web_chatter_position != "bottom") ||
            odoo.web_chatter_position === "sided"
        ) {
            result["o_xxl_form_view h-100"] = true;
        }
        if (this.props.className) {
            result[this.props.className] = true;
        }
        result.o_field_highlight = size < SIZES.SM || hasTouch();
        if (odoo.web_chatter_position === "sided") {
            result["flex-row"] = true;
        }
        return result;
    },
});
