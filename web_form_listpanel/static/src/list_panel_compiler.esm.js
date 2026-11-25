/*
    Copyright 2026 Roberto Fichera
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {append, createElement, setAttributes} from "@web/core/utils/xml";
import {
    decodeObjectForTemplate,
    encodeObjectForTemplate,
} from "@web/views/view_compiler";
import {FormArchParser} from "@web/views/form/form_arch_parser";
import {FormCompiler} from "@web/views/form/form_compiler";
import {FormRenderer} from "@web/views/form/form_renderer";
import {ListPanel} from "./list_panel.esm";
import {SIZES} from "@web/core/ui/ui_service";
import {listPanelAutoFor} from "./origin.esm";
import {patch} from "@web/core/utils/patch";
import {registry} from "@web/core/registry";
import {useService} from "@web/core/utils/hooks";
import {useState} from "@odoo/owl";

const CONTAINER = "o_listpanel_container";

/**
 * Reads the arch attributes of a <listpanel> node. Its columns and list
 * attributes are parsed by the panel, as a <list>, from `arch`.
 *
 * @param {Element} node
 * @returns {Object}
 */
export function parseListPanelArch(node) {
    const limit = parseInt(node.getAttribute("limit"), 10);
    return {
        domain: node.getAttribute("domain") || null,
        order: node.getAttribute("order") || null,
        limit: limit > 0 ? limit : 80,
        string: node.getAttribute("string") || null,
        arch: node.outerHTML,
    };
}

/**
 * @param {Object} archInfo
 * @param {String} condition the container's t-if
 * @returns {Element}
 */
function makeContainer(archInfo, condition) {
    const container = createElement("div");
    container.classList.add(CONTAINER);
    setAttributes(container, {"t-if": condition});
    const component = createElement("t");
    setAttributes(component, {
        "t-component": "__comp__.listPanelComponents.ListPanel",
        record: "__comp__.props.record",
        archInfo: `__comp__.decodeListPanelArch(${encodeObjectForTemplate(archInfo)})`,
    });
    append(container, component);
    return container;
}

/** @this {FormCompiler} */
function compileListPanel(node, params) {
    const container = makeContainer(
        parseListPanelArch(node),
        "!__comp__.env.inDialog and __comp__.listPanelWide"
    );
    return this.applyInvisible(node.getAttribute("invisible"), container, params);
}

/**
 * The Auto panel of a form without a listpanel tag. Compiled templates are
 * cached per arch, so it is always there and shown by the form's state.
 */
function makeAutoContainer() {
    return makeContainer(
        {domain: null, order: null, limit: 80, string: null, arch: null, auto: true},
        "__comp__.listPanelAutoState and __comp__.listPanelAutoState.shown and __comp__.listPanelWide"
    );
}

registry.category("form_compilers").add("listpanel_compiler", {
    selector: "listpanel",
    fn: compileListPanel,
});

patch(FormCompiler.prototype, {
    compile(node, params) {
        const res = super.compile(node, params);
        const sheetBg = res.querySelector(".o_form_sheet_bg");
        const container = res.querySelector(`.${CONTAINER}`) || makeAutoContainer();
        if (container && sheetBg) {
            sheetBg.parentNode.insertBefore(container, sheetBg);
        }
        return res;
    },
});

patch(FormRenderer.prototype, {
    setup() {
        super.setup();
        this.listPanelComponents = {ListPanel};
        const auto = listPanelAutoFor(this.env);
        this.listPanelAutoState = auto ? useState(auto.state) : null;
        this.listPanelUi = useState(useService("ui"));
    },
    /** Below LG the panel is hidden: render no container, so no grid column. */
    get listPanelWide() {
        return this.listPanelUi.size >= SIZES.LG;
    },
    /** The same object on every render, so the panel is not re-rendered. */
    decodeListPanelArch(encoded) {
        this.listPanelArchs ||= new Map();
        if (!this.listPanelArchs.has(encoded)) {
            this.listPanelArchs.set(encoded, decodeObjectForTemplate(encoded));
        }
        return this.listPanelArchs.get(encoded);
    },
});

/**
 * The <listpanel> columns are list columns of the panel's own records: the
 * form must not take them as fields of its record, or their required,
 * readonly or invisible would apply to it. They are detached while the form
 * parses its arch, and put back for the compiler and the panel.
 */
patch(FormArchParser.prototype, {
    parse(xmlDoc, ...args) {
        const detached = [...xmlDoc.querySelectorAll("listpanel")]
            .filter((node) => !node.parentElement?.closest("field"))
            .map((node) => [node, [...node.childNodes]]);
        for (const [node] of detached) {
            node.replaceChildren();
        }
        try {
            return super.parse(xmlDoc, ...args);
        } finally {
            for (const [node, children] of detached) {
                node.replaceChildren(...children);
            }
        }
    },
});
