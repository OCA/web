/*
    Copyright 2026 Roberto Fichera
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {Component, onError, useEffect, useRef, useState} from "@odoo/owl";
import {
    extractFieldsFromArchInfo,
    useRecordObserver,
} from "@web/model/relational_model/utils";
import {useBus, useService} from "@web/core/utils/hooks";
import {Domain} from "@web/core/domain";
import {FIELD_WIDTHS} from "@web/views/list/column_width_hook";
import {FetchRecordError} from "@web/model/relational_model/errors";
import {ListArchParser} from "@web/views/list/list_arch_parser";
import {ListPanelRenderer} from "./list_panel_renderer.esm";
import {Pager} from "@web/core/pager/pager";
import {RelationalModel} from "@web/model/relational_model/relational_model";
import {SIZES} from "@web/core/ui/ui_service";
import {_t} from "@web/core/l10n/translation";
import {browser} from "@web/core/browser/browser";
import {evaluateExpr} from "@web/core/py_js/py";
import {parseXML} from "@web/core/utils/xml";
import {stringToOrderBy} from "@web/search/utils/order_by";
import {tokenize} from "@web/core/py_js/py_tokenizer";
import {useDebounced} from "@web/core/utils/timing";

// Attributes of a panel <field> evaluated on each row.
const ROW_EXPRESSIONS = ["invisible", "readonly", "required"];
const NAME_TOKEN = 3;
// A list column's minimum width in the panel: core's (80px for a char,
// 105px for a monetary) would not fit three columns in 280px.
const PANEL_MIN_WIDTH = 40;
// The panel never edits: one object, so the renderer's props stay equal.
const NO_ACTIONS = Object.freeze({});

/** The panel's own records: no cached data shown before the fetch. */
class ListPanelModel extends RelationalModel {
    static withCache = false;
}

/**
 * The model fields an expression names.
 *
 * @param {String|null} expr
 * @param {Object} fields
 * @returns {String[]}
 */
export function expressionFieldNames(expr, fields) {
    if (!expr) {
        return [];
    }
    try {
        return tokenize(expr)
            .filter((token) => token.type === NAME_TOKEN && token.value in fields)
            .map((token) => token.value);
    } catch {
        return [];
    }
}

/**
 * A field column that may shrink to PANEL_MIN_WIDTH, keeping core's maximum.
 * A column with its own `width` is left as declared.
 */
function narrowColumn(column) {
    if (column.type !== "field" || column.attrs?.width) {
        return column;
    }
    const base = column.field.listViewWidth;
    const listViewWidth = (params) => {
        const width =
            typeof base === "function"
                ? base(params)
                : base || FIELD_WIDTHS[column.widget || column.fieldType];
        return [PANEL_MIN_WIDTH, Array.isArray(width) ? width[1] : width];
    };
    return {...column, field: {...column.field, listViewWidth}};
}

function isRowExpression(name) {
    return name.startsWith("decoration-") || ROW_EXPRESSIONS.includes(name);
}

/**
 * The currency field a monetary column needs to show its symbol, as the
 * server adds it to a real list.
 *
 * @param {String} name
 * @param {Object} options the column's options
 * @param {Object} fields
 * @returns {String[]}
 */
export function currencyFieldNames(name, options, fields) {
    if (fields[name]?.type !== "monetary") {
        return [];
    }
    const currency =
        options?.currency_field || fields[name].currency_field || "currency_id";
    return currency in fields ? [currency] : [];
}

function parseOptions(column) {
    try {
        return evaluateExpr(column.getAttribute("options") || "{}");
    } catch {
        return {};
    }
}

function appendField(list, name, invisible = false) {
    const column = list.ownerDocument.createElement("field");
    column.setAttribute("name", name);
    if (invisible) {
        column.setAttribute("column_invisible", "1");
    }
    list.append(column);
}

/**
 * Copies the <field> columns of `source` into `list`, without their children
 * (an x2many's inline sub-view), and returns the fields their row
 * expressions and currencies name.
 */
function copyColumns(source, list, fields) {
    const named = [];
    for (const child of source?.children || []) {
        if (child.tagName !== "field") {
            console.warn(`listpanel: <${child.tagName}> is not supported, ignored`);
            continue;
        }
        if (
            !(child.getAttribute("name") in fields) ||
            child.getAttribute("widget") === "handle"
        ) {
            continue;
        }
        const column = child.cloneNode(false);
        for (const attr of column.attributes) {
            if (isRowExpression(attr.name)) {
                named.push(...expressionFieldNames(attr.value, fields));
            }
        }
        named.push(
            ...currencyFieldNames(
                column.getAttribute("name"),
                parseOptions(column),
                fields
            )
        );
        list.append(column);
    }
    return named;
}

/**
 * Parses a <listpanel> (or any element holding <field> columns) as a <list>.
 * The fields that row expressions name are added as invisible columns, as
 * the server does for a real list.
 *
 * @param {String|null} xml
 * @param {Object} fields
 * @param {String} resModel
 * @returns {Object} a ListArchParser archInfo
 */
export function parsePanelArch(xml, fields, resModel) {
    const source = xml ? parseXML(xml) : null;
    const list = parseXML("<list/>");
    const named = [];
    for (const attr of source?.attributes || []) {
        if (attr.name.startsWith("decoration-")) {
            list.setAttribute(attr.name, attr.value);
            named.push(...expressionFieldNames(attr.value, fields));
        }
    }
    named.push(...copyColumns(source, list, fields));
    if (!list.children.length) {
        appendField(list, "display_name");
    }
    const declared = new Set([...list.children].map((col) => col.getAttribute("name")));
    for (const name of new Set(named)) {
        if (!declared.has(name)) {
            appendField(list, name, true);
        }
    }
    return new ListArchParser().parse(list, {[resModel]: {fields}}, resModel);
}

export class ListPanel extends Component {
    static template = "web_form_listpanel.ListPanel";
    static components = {Pager, ListPanelRenderer};
    static props = {
        record: Object,
        archInfo: Object,
    };

    setup() {
        this.orm = useService("orm");
        const services = {orm: this.orm};
        for (const key of ListPanelModel.services) {
            services[key] = useService(key);
        }
        const ui = useService("ui");
        this.ui = useState(ui);
        this.rootRef = useRef("root");
        useEffect(() => this.fitHeight());
        useEffect(
            (el) => {
                const scroller = el?.closest(".o_content");
                if (!scroller) {
                    return;
                }
                const observer = new ResizeObserver(() => this.fitHeight());
                observer.observe(scroller);
                return () => observer.disconnect();
            },
            () => [this.rootRef.el]
        );
        useBus(ui.bus, "resize", () => this.loadPending && this.load());
        if (this.env.listPanelBus) {
            useBus(this.env.listPanelBus, "saved", () => this.load());
        }
        const origin = this.env.listPanelOrigin;
        this.origin =
            origin && origin.resModel === this.props.record.resModel ? origin : null;
        this.archInfo = this.makeArchInfo();
        const {activeFields, fields} = extractFieldsFromArchInfo(
            this.archInfo,
            this.fields
        );
        this.model = useState(
            new ListPanelModel(
                this.env,
                {
                    config: {
                        resModel: this.props.record.resModel,
                        fields,
                        activeFields,
                        isMonoRecord: false,
                        context: this.props.record.context,
                        domain: [],
                        orderBy: [],
                        groupBy: [],
                    },
                    limit: this.props.archInfo.limit,
                    // The pager shows the exact total, as before.
                    countLimit: Number.MAX_SAFE_INTEGER,
                },
                services
            )
        );
        this.state = useState({
            mode: this.origin ? "search" : "related",
            rowCount: 0,
            orderBy: null,
            total: 0,
            offset: 0,
            limit: this.props.archInfo.limit,
            error: null,
            loading: false,
            collapsed: this.readCollapsed(),
        });
        // A widget or a decoration failing to render must not break the form.
        onError((error) => {
            console.warn("listpanel: cannot render the records", error);
            Object.assign(this.state, {error: "render", loading: false});
        });
        this.resetPage();
        this.domainKey = undefined;
        this.loadId = 0;
        this.loadPending = false;
        // Bound here: the template reads pagerProps on its render context,
        // so a closure made in that getter would write there, not on this.
        this.onPagerUpdate = ({offset, limit}) => {
            Object.assign(this.state, {offset, limit});
            return this.load();
        };
        this.onSort = (fieldName) => this.sortBy(fieldName);
        // The rows on screen are the previous ones while a load is pending.
        this.onOpenRow = (record) =>
            !this.state.loading && this.openRecord(record.resId);
        this.debouncedLoad = useDebounced(() => this.load(), 300);
        useRecordObserver((record) => {
            const key = JSON.stringify(this.computeRelatedDomain(record));
            if (key === this.domainKey) {
                return;
            }
            const firstCall = this.domainKey === undefined;
            this.domainKey = key;
            if (firstCall) {
                return this.load();
            }
            if (this.state.mode === "related") {
                this.state.offset = 0;
                this.debouncedLoad();
            }
        });
    }

    /**
     * The Related domain evaluated on the record. The arch expression may
     * yield a list or a domain string (e.g. a computed Binary or Char field).
     *
     * @param {Object} record
     * @returns {Array|false|null} false when the expression yields no value
     *   (e.g. an unset domain field), null when there is no domain or it
     *   cannot be evaluated
     */
    computeRelatedDomain(record) {
        const expr = this.props.archInfo.domain;
        if (!expr) {
            return null;
        }
        try {
            const context = record.evalContextWithVirtualIds;
            const value = evaluateExpr(expr, context);
            return value ? new Domain(value).toList(context) : false;
        } catch {
            return null;
        }
    }

    /** The record's fields, or the origin list's for the Auto panel. */
    get fields() {
        const auto = this.props.archInfo.auto && this.origin?.fields;
        return {
            display_name: {
                name: "display_name",
                type: "char",
                string: _t("Display Name"),
            },
            ...(auto || this.props.record.fields),
        };
    }

    /**
     * The Auto panel shows the origin list's archInfo as it is, the others
     * their own; in both the columns may shrink to the panel's width.
     */
    makeArchInfo() {
        const {auto, arch} = this.props.archInfo;
        const archInfo =
            auto && this.origin?.archInfo
                ? this.origin.archInfo
                : parsePanelArch(
                      auto ? null : arch,
                      this.fields,
                      this.props.record.resModel
                  );
        return {...archInfo, columns: archInfo.columns.map(narrowColumn)};
    }

    get title() {
        return this.props.archInfo.auto
            ? this.origin?.title
            : this.props.archInfo.string;
    }

    /**
     * In the column layout (below XXL) the form scrolls inside .o_content and
     * the panel is sticky: size it to the visible part of that scroller.
     */
    fitHeight() {
        const container = this.rootRef.el?.closest(".o_listpanel_container");
        if (!container) {
            return;
        }
        const scroller = container.closest(".o_content");
        const isColumn = container.parentElement.classList.contains("flex-column");
        container.style.height =
            isColumn && scroller ? `${scroller.clientHeight}px` : "";
    }

    get isWideEnough() {
        return this.ui.size >= SIZES.LG;
    }

    get storageKey() {
        const viewId = this.env.config?.viewId || "default";
        return `web_form_listpanel:collapsed:${this.props.record.resModel}:${viewId}`;
    }

    readCollapsed() {
        try {
            return browser.localStorage.getItem(this.storageKey) === "1";
        } catch {
            return false;
        }
    }

    toggleCollapsed() {
        this.state.collapsed = !this.state.collapsed;
        try {
            if (this.state.collapsed) {
                browser.localStorage.setItem(this.storageKey, "1");
            } else {
                browser.localStorage.removeItem(this.storageKey);
            }
        } catch {
            // Storage unavailable: the state just lasts for this view.
        }
        if (!this.state.collapsed && this.loadPending) {
            this.load();
        }
    }

    get hasRelated() {
        return Boolean(this.props.archInfo.domain);
    }

    get hasSearch() {
        return Boolean(this.origin);
    }

    get searchDisabledTitle() {
        return _t(
            "Open this form from a list or kanban view to browse its records here"
        );
    }

    /** Puts the panel on the first page of the mode, or on the origin's page. */
    resetPage() {
        const search = this.state.mode === "search";
        this.state.offset = search ? this.origin.offset || 0 : 0;
        this.state.limit = (search && this.origin.limit) || this.props.archInfo.limit;
    }

    setMode(mode) {
        if (mode === this.state.mode || (mode === "search" && !this.hasSearch)) {
            return;
        }
        this.state.mode = mode;
        this.state.orderBy = null;
        this.resetPage();
        return this.load();
    }

    /** The mode's own order: the origin's in Search, `order` otherwise. */
    get modeOrderBy() {
        const originOrder = this.state.mode === "search" && this.origin.orderBy;
        return originOrder?.length
            ? originOrder
            : stringToOrderBy(this.props.archInfo.order || "");
    }

    /** A header click, sorting as a list does, on the panel's own order. */
    sortBy(fieldName) {
        let orderBy = [...(this.state.orderBy || this.modeOrderBy)];
        if (orderBy[0]?.name === fieldName) {
            orderBy = orderBy[0].asc
                ? [{name: fieldName, asc: false}, ...orderBy.slice(1)]
                : [];
        } else {
            orderBy = [
                {name: fieldName, asc: true},
                ...orderBy.filter((o) => o.name !== fieldName),
            ];
        }
        this.state.orderBy = orderBy.length ? orderBy : null;
        return this.load();
    }

    /**
     * @returns {{domain: Array}|"empty"|"error"}
     */
    get fetchParams() {
        if (this.state.mode === "search") {
            return {domain: this.origin.domain};
        }
        if (!this.hasRelated) {
            return "empty";
        }
        if (this.domainKey === "null") {
            return "error";
        }
        if (this.domainKey === "false") {
            return "empty";
        }
        return {domain: JSON.parse(this.domainKey)};
    }

    /**
     * Fetches the current page. A hidden panel only remembers that it must
     * load once shown, and only the latest call may write its result.
     */
    async load() {
        if (this.state.collapsed || !this.isWideEnough) {
            this.loadPending = true;
            return;
        }
        this.loadPending = false;
        const loadId = ++this.loadId;
        const params = this.fetchParams;
        if (typeof params === "string") {
            Object.assign(this.state, {
                rowCount: 0,
                total: 0,
                loading: false,
                error: params === "error" ? "domain" : null,
            });
            return;
        }
        this.state.loading = true;
        const loadParams = {
            domain: params.domain,
            orderBy: this.state.orderBy || this.modeOrderBy,
            offset: this.state.offset,
            limit: this.state.limit,
        };
        try {
            // The model's own load resets the offset on a new domain, and
            // drops a superseded call without ever settling it: only the
            // first load goes through it, once, to create the root list.
            if (this.firstLoad) {
                await this.firstLoad;
                await this.model.root.load(loadParams);
            } else {
                Object.assign(this.model.config, loadParams);
                this.firstLoad = this.model
                    .load()
                    .then(() => this.model.whenReady.resolve());
                this.firstLoad.catch(() => (this.firstLoad = null));
                await this.firstLoad;
            }
            if (loadId === this.loadId) {
                const {root} = this.model;
                Object.assign(this.state, {
                    rowCount: root.records.length,
                    total: root.count,
                    offset: root.offset,
                    loading: false,
                    error: null,
                });
            }
        } catch {
            if (loadId !== this.loadId) {
                return;
            }
            Object.assign(this.state, {
                rowCount: 0,
                total: 0,
                loading: false,
                error: "load",
            });
        }
    }

    /**
     * Opens a panel row in the form, the way the form pager does: a dirty
     * record is saved first and a failed save keeps the user on it. The
     * form's pager set becomes the panel's loaded ids.
     *
     * @param {Number} resId
     */
    async openRecord(resId) {
        const {record} = this.props;
        if (resId === record.resId) {
            return;
        }
        if ((await record.isDirty()) && !(await record.save())) {
            return;
        }
        try {
            await record.model.load({
                resId,
                resIds: this.model.root.records.map((row) => row.resId),
            });
        } catch (error) {
            // As the form pager: drop the vanished row, let Odoo notify.
            if (error instanceof FetchRecordError) {
                this.load();
            }
            throw error;
        }
    }

    get rendererProps() {
        return {
            list: this.model.root,
            archInfo: this.archInfo,
            openRecord: this.onOpenRow,
            onSort: this.onSort,
            readonly: true,
            allowSelectors: false,
            editable: false,
            activeActions: NO_ACTIONS,
            currentResId: this.props.record.resId,
            formRecord: this.props.record,
        };
    }

    get pagerProps() {
        return {
            offset: this.state.offset,
            limit: this.state.limit,
            total: this.state.total,
            withAccessKey: false,
            onUpdate: this.onPagerUpdate,
        };
    }

    get errorMessage() {
        switch (this.state.error) {
            case "domain":
                return _t("Cannot evaluate the domain");
            case "render":
                return _t("Cannot display the records");
            default:
                return _t("Could not load records");
        }
    }
}
