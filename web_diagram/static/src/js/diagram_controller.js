/** @odoo-module */

import { Component, onWillStart, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { FormViewDialog } from "@web/views/view_dialogs/form_view_dialog";
import { _t } from "@web/core/l10n/translation";
import { DiagramModel } from "./diagram_model";
import { DiagramRenderer } from "./diagram_renderer";

/**
 * DiagramController — OWL component, entry point for the diagram view.
 * Parses the arch, owns the DiagramModel, and manages view state.
 */
export class DiagramController extends Component {
    setup() {
        this.rpc = useService("rpc");
        this.dialog = useService("dialog");
        this.orm = useService("orm");

        const archInfo = this._parseArch(this.props.arch, this.props.fields || {});
        this.archInfo = archInfo;

        this.model = new DiagramModel(this.rpc);
        this.state = useState({
            nodes: {},
            edges: {},
            labels: archInfo.labels,
            nodeModel: archInfo.nodeModel,
            connectorModel: archInfo.connectorModel,
            connectorAttrs: archInfo.connectorAttrs,
            parentField: false,
        });

        onWillStart(async () => {
            await this.model.load({
                resId: this.props.resId,
                resModel: this.props.resModel,
                nodeModel: archInfo.nodeModel,
                connectorModel: archInfo.connectorModel,
                connectorAttrs: archInfo.connectorAttrs,
                nodeAttrs: archInfo.nodeAttrs,
                visibleNodes: archInfo.visibleNodes,
                invisibleNodes: archInfo.invisibleNodes,
                nodeFieldsString: archInfo.nodeFieldsString,
                connectorFieldsString: archInfo.connectorFieldsString,
                labels: archInfo.labels,
            });
            this._updateState();
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

    async reload() {
        await this.model.reload();
        this._updateState();
    }

    // -------------------------------------------------------------------------
    // Node actions
    // -------------------------------------------------------------------------

    addNode() {
        this.dialog.add(FormViewDialog, {
            resModel: this.state.nodeModel,
            context: {
                ...(this.props.context || {}),
                [`default_${this.state.parentField}`]: this.props.resId,
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
DiagramController.components = { DiagramRenderer };
// Use wildcard to avoid prop-validation failures during migration; tighten later.
DiagramController.props = ["*"];
