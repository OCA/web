/*
    Copyright 2026 Roberto Fichera
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {EventBus, reactive, useSubEnv} from "@odoo/owl";
import {currencyFieldNames, expressionFieldNames} from "./list_panel.esm";
import {FormController} from "@web/views/form/form_controller";
import {KanbanController} from "@web/views/kanban/kanban_controller";
import {ListController} from "@web/views/list/list_controller";
import {browser} from "@web/core/browser/browser";
import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";
import {useSetupAction} from "@web/search/action_hook";

const AUTO_COLUMNS = 3;

/**
 * The list or kanban a form is being opened from. The multi-record view
 * hands over only record ids when it opens a record, so its search domain,
 * sort and page are passed here, and the next form consumes them.
 *
 * @type {{resModel: String, resId: Number, domain: Array, orderBy: Array, offset: Number, limit: Number|null, title: String, archInfo: Object|null, fields: Object}|null}
 */
let pendingOrigin = null;

/**
 * The Auto panel state of the form this env belongs to. A view nested in
 * the form gets its own env.config, so it does not pick up the form's state.
 *
 * @param {Object} env
 * @returns {{config: Object, state: {shown: Boolean}, toggle: Function}|null}
 */
export function listPanelAutoFor(env) {
    const auto = env.listPanelAuto;
    return auto && auto.config === env.config ? auto : null;
}

/** Whether the form arch itself, not an inline sub-view, has this tag. */
function archHas(xmlDoc, tag) {
    return [...xmlDoc.querySelectorAll(tag)].some(
        (node) => !node.parentElement?.closest("field")
    );
}

export function setPendingOrigin(origin) {
    pendingOrigin = origin;
}

/**
 * Returns the pending origin when it belongs to this record, and clears it
 * in any case so that it can never be picked up by another form.
 *
 * @param {String} resModel
 * @param {Number} resId
 */
export function takePendingOrigin(resModel, resId) {
    const origin = pendingOrigin;
    pendingOrigin = null;
    return origin && origin.resModel === resModel && origin.resId === resId
        ? origin
        : null;
}

/**
 * The fields the kept columns need: themselves, what their decorations and
 * modifiers and the list's row decorations name, and their currencies.
 */
function neededFieldNames(archInfo, columns, fields) {
    const needed = new Set();
    const expressions = archInfo.decorations.map((deco) => deco.condition);
    for (const col of columns) {
        needed.add(col.name);
        expressions.push(col.invisible, ...Object.values(col.decorations || {}));
        for (const name of currencyFieldNames(col.name, col.options, fields)) {
            needed.add(name);
        }
    }
    for (const expr of expressions) {
        for (const name of expressionFieldNames(expr, fields)) {
            needed.add(name);
        }
    }
    return needed;
}

/**
 * The list's archInfo for the Auto panel: its columns visible right now (the
 * filter of the list's own export), at most AUTO_COLUMNS, with its row
 * decorations and widgets, loading only the fields they need. Null for a
 * kanban or a list with no field column.
 */
function autoArchInfo(controller) {
    const {archInfo, context} = controller.props;
    if (!archInfo.columns) {
        return null;
    }
    const {fields} = controller.model.root;
    const optional = controller.optionalActiveFields || {};
    const columns = archInfo.columns
        .filter((col) => col.type === "field" && !col.isHandle && fields[col.name])
        .filter((col) => !evaluateBooleanExpr(col.column_invisible, context))
        .filter((col) => !col.optional || optional[col.name])
        .slice(0, AUTO_COLUMNS)
        // Shown as they are: no toggler, nothing hidden on the form record.
        .map((col) => ({...col, optional: false, column_invisible: false}));
    if (!columns.length) {
        return null;
    }
    const needed = neededFieldNames(archInfo, columns, fields);
    const fieldNodes = Object.fromEntries(
        Object.entries(archInfo.fieldNodes).filter(([, node]) => needed.has(node.name))
    );
    return {...archInfo, columns, fieldNodes, widgetNodes: {}};
}

function originFromController(controller, record) {
    const root = controller.model.root;
    return {
        title: controller.env.config.getDisplayName?.() || "",
        archInfo: autoArchInfo(controller),
        fields: root.fields,
        resModel: root.resModel,
        resId: record.resId,
        domain: controller.props.domain || [],
        orderBy: root.orderBy || [],
        offset: root.isGrouped ? 0 : root.offset,
        limit: root.isGrouped ? null : root.limit,
    };
}

/**
 * Only an open that mounts a form in this window may leave an origin: not a
 * list in a dialog (it only selects), a new window, or a list "action".
 */
function opensFormHere(controller, options) {
    return !(
        controller.env.inDialog ||
        options?.newWindow ||
        (controller.props.allowOpenAction && controller.archInfo?.openAction)
    );
}

for (const Controller of [ListController, KanbanController]) {
    patch(Controller.prototype, {
        async openRecord(record, options) {
            setPendingOrigin(
                opensFormHere(this, options) ? originFromController(this, record) : null
            );
            return super.openRecord(record, options);
        },
    });
}

patch(FormController.prototype, {
    setup() {
        super.setup();
        // A fresh open from a list wins: the action service may reuse this
        // controller and restore the state of an earlier open.
        const origin =
            takePendingOrigin(this.props.resModel, this.props.resId) ||
            this.props.state?.listPanelOrigin;
        useSetupAction({getLocalState: () => ({listPanelOrigin: origin})});
        this.listPanelBus = new EventBus();
        useSubEnv({
            listPanelOrigin: origin,
            listPanelBus: this.listPanelBus,
            listPanelAuto: this.makeListPanelAuto(origin),
        });
    },

    /**
     * The Auto panel's shared state, only when its button applies: the
     * setting is on, the form came from a list or kanban, the view declares
     * no listpanel, has a sheet to sit beside, and is not in a dialog.
     */
    makeListPanelAuto(origin) {
        if (
            !session.web_form_listpanel_auto_panel ||
            !origin ||
            this.env.inDialog ||
            archHas(this.archInfo.xmlDoc, "listpanel") ||
            !archHas(this.archInfo.xmlDoc, "sheet")
        ) {
            return undefined;
        }
        const key = `web_form_listpanel:auto:${this.props.resModel}`;
        let shown = false;
        try {
            shown = browser.localStorage.getItem(key) === "1";
        } catch {
            // Storage unavailable: hidden.
        }
        const state = reactive({shown});
        return {
            config: this.env.config,
            state,
            toggle() {
                state.shown = !state.shown;
                try {
                    if (state.shown) {
                        browser.localStorage.setItem(key, "1");
                    } else {
                        browser.localStorage.removeItem(key);
                    }
                } catch {
                    // Storage unavailable: the choice lasts for this form.
                }
            },
        };
    },

    async onRecordSaved(record, changes) {
        await super.onRecordSaved(record, changes);
        this.listPanelBus.trigger("saved");
    },
});
