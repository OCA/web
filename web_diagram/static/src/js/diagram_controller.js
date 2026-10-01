/** @odoo-module */

import { Component, onWillStart, onWillUpdateProps, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { router } from "@web/core/browser/router";
// rpc is no longer a service in Odoo 18; DiagramModel imports it directly
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { FormViewDialog } from "@web/views/view_dialogs/form_view_dialog";
import { _t } from "@web/core/l10n/translation";
import { Layout } from "@web/search/layout";
import { Pager } from "@web/core/pager/pager";
import { DiagramModel } from "./diagram_model";
import { DiagramRenderer } from "./diagram_renderer";

/**
 * DiagramController — OWL component, entry point for the diagram view.
 * Parses the arch, owns the DiagramModel, and manages view state.
 */
export class DiagramController extends Component {
    setup() {
        this.dialog = useService("dialog");
        this.orm = useService("orm");

        const archInfo = this._parseArch(this.props.arch, this.props.fields || {});
        this.archInfo = archInfo;

        // When switching via the control panel switcher, Odoo's switchView
        // passes no resId prop (it relies on action.res_id which is stale for
        // actions opened from a list). The router state still holds the form
        // view's resId at setup() time because pushState() is debounced.
        const routerResId = router.current.resId;
        const resId =
            this.props.resId ||
            (typeof routerResId === "number" ? routerResId : false);

        // _currentResId is the authoritative resId for the current diagram
        // record; it can change during pager navigation.
        this._currentResId = resId;
        this._ids = []; // ordered list of IDs for pager navigation

        this.display = { ...this.props.display, controlPanel: {} };
        this.model = new DiagramModel();
        this.state = useState({
            nodes: {},
            edges: {},
            labels: archInfo.labels,
            nodeModel: archInfo.nodeModel,
            connectorModel: archInfo.connectorModel,
            connectorAttrs: archInfo.connectorAttrs,
            parentField: false,
            pager: { offset: 0, total: 0 },
        });

        onWillStart(async () => {
            await this._loadDiagram(this._currentResId);
            await this._initPager();
        });

        // When Odoo reuses this controller instance (e.g. switching back from
        // form view within the same action), onWillStart does not re-run.
        // onWillUpdateProps fires instead — reload so data stays fresh.
        onWillUpdateProps(async () => {
            await this._loadDiagram(this._currentResId);
        });
    }

    /**
     * Parse the view arch XML element and extract diagram configuration.
     * Accepts either a DOM Element or an XML string.
     */
    _parseArch(arch, fields) {
        let archEl = arch;
        if (typeof arch === "string") {
            archEl = new DOMParser().parseFromString(arch, "text/xml").documentElement;
        }

        const toTitleCase = (str) =>
            str.replace(/\w\S*/g, (txt) =>
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );

        const nodeEl = [...archEl.children].find((el) => el.tagName === "node");
        const arrowEl = [...archEl.children].find((el) => el.tagName === "arrow");

        const labels = [...archEl.children]
            .filter((el) => el.tagName === "label")
            .map((el) => el.getAttribute("string"));

        const invisibleNodes = [];
        const visibleNodes = [];
        const nodeFieldsString = [];

        [...nodeEl.children].forEach((child) => {
            const name = child.getAttribute("name");
            if (child.getAttribute("invisible") === "1") {
                invisibleNodes.push(name);
            } else {
                const field = fields[name] || {};
                visibleNodes.push(name);
                nodeFieldsString.push(field.string || toTitleCase(name));
            }
        });

        const connectorFieldsString = [...arrowEl.children].map((conn) => {
            const name = conn.getAttribute("name");
            const field = fields[name] || {};
            return field.string || toTitleCase(name);
        });

        return {
            nodeModel: nodeEl.getAttribute("object"),
            connectorModel: arrowEl.getAttribute("object"),
            labels,
            visibleNodes,
            invisibleNodes,
            nodeFieldsString,
            connectorFieldsString,
            nodeAttrs: {
                bgcolor: nodeEl.getAttribute("bgcolor"),
                shape: nodeEl.getAttribute("shape"),
            },
            connectorAttrs: {
                source: arrowEl.getAttribute("source"),
                destination: arrowEl.getAttribute("destination"),
                label: arrowEl.getAttribute("label"),
            },
        };
    }

    _updateState() {
        const data = this.model.get();
        this.state.nodes = data.nodes;
        this.state.edges = data.edges;
        this.state.parentField = data.parentField;
    }

    /** Load (or reload) the diagram for a specific record ID. */
    async _loadDiagram(resId) {
        await this.model.load({
            resId,
            resModel: this.props.resModel,
            nodeModel: this.archInfo.nodeModel,
            connectorModel: this.archInfo.connectorModel,
            connectorAttrs: this.archInfo.connectorAttrs,
            nodeAttrs: this.archInfo.nodeAttrs,
            visibleNodes: this.archInfo.visibleNodes,
            invisibleNodes: this.archInfo.invisibleNodes,
            nodeFieldsString: this.archInfo.nodeFieldsString,
            connectorFieldsString: this.archInfo.connectorFieldsString,
            labels: this.archInfo.labels,
        });
        this._updateState();
    }

    /** Fetch the ordered ID list and compute the current pager position. */
    async _initPager() {
        if (!this._currentResId || !this.props.resModel) {
            return;
        }
        try {
            this._ids = await this.orm.search(
                this.props.resModel,
                this.props.domain || [],
                { context: this.props.context }
            );
        } catch (_e) {
            this._ids = [this._currentResId];
        }
        const idx = this._ids.indexOf(this._currentResId);
        this.state.pager = {
            offset: idx >= 0 ? idx : 0,
            total: this._ids.length,
        };
    }

    /** Called by the Pager component when the user clicks next/previous. */
    async onPagerUpdate({ offset }) {
        const newResId = this._ids[offset];
        if (!newResId || newResId === this._currentResId) {
            return;
        }
        this._currentResId = newResId;
        this.state.pager.offset = offset;
        await this._loadDiagram(newResId);
        router.pushState({ resId: newResId });
    }

    async reload() {
        await this.model.reload();
        this._updateState();
    }

    /** Called by Pager's updateTotal prop — refreshes data and returns new total. */
    async onPagerUpdateTotal() {
        await this._initPager();
        await this._loadDiagram(this._currentResId);
        return this.state.pager.total;
    }

    // -------------------------------------------------------------------------
    // Node actions
    // -------------------------------------------------------------------------

    addNode() {
        this.dialog.add(FormViewDialog, {
            resModel: this.state.nodeModel,
            context: {
                ...(this.props.context || {}),
                [`default_${this.state.parentField}`]: this._currentResId,
            },
            title: _t("Create: Activity"),
            onRecordSaved: () => this.reload(),
        });
    }

    editNode(id) {
        this.dialog.add(FormViewDialog, {
            resModel: this.state.nodeModel,
            resId: id,
            context: this.props.context || {},
            title: _t("Open: Activity"),
            onRecordSaved: () => this.reload(),
        });
    }

    removeNode(id) {
        this.dialog.add(ConfirmationDialog, {
            body: _t(
                "Are you sure you want to remove this node? " +
                "This will remove its connected transitions as well."
            ),
            confirm: async () => {
                await this.orm.unlink(this.state.nodeModel, [id]);
                await this.reload();
            },
        });
    }

    // -------------------------------------------------------------------------
    // Edge actions
    // -------------------------------------------------------------------------

    addEdge(sourceId, destId) {
        this.dialog.add(FormViewDialog, {
            resModel: this.state.connectorModel,
            context: {
                ...(this.props.context || {}),
                [`default_${this.state.connectorAttrs.source}`]: sourceId,
                [`default_${this.state.connectorAttrs.destination}`]: destId,
            },
            title: _t("Create: Transition"),
            onRecordSaved: () => this.reload(),
        });
    }

    editEdge(id) {
        this.dialog.add(FormViewDialog, {
            resModel: this.state.connectorModel,
            resId: parseInt(id, 10),
            context: this.props.context || {},
            title: _t("Open: Transition"),
            onRecordSaved: () => this.reload(),
        });
    }

    removeEdge(id) {
        this.dialog.add(ConfirmationDialog, {
            body: _t("Are you sure you want to remove this transition?"),
            confirm: async () => {
                await this.orm.unlink(this.state.connectorModel, [id]);
                await this.reload();
            },
        });
    }
}

DiagramController.template = "web_diagram.DiagramController";
DiagramController.components = { Layout, DiagramRenderer, Pager };
// OWL 3 (Odoo 18) changed prop definition syntax; use wildcard until
// the correct OWL 3 syntax is confirmed for all prop types used here.
DiagramController.props = ["*"];
