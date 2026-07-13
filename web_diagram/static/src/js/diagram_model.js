/** @odoo-module */

import { jsonrpc } from "@web/core/network/rpc_service";

export class DiagramModel {
    constructor() {
        this.rpc = jsonrpc;
    }

    async load(params) {
        this.resId = params.resId;
        this.modelName = params.resModel;
        this.nodeModel = params.nodeModel;
        this.connectorModel = params.connectorModel;
        this.connectorAttrs = params.connectorAttrs;
        this.nodeAttrs = params.nodeAttrs;
        this.visibleNodes = params.visibleNodes;
        this.invisibleNodes = params.invisibleNodes;
        this.nodeFieldsString = params.nodeFieldsString;
        this.connectorFieldsString = params.connectorFieldsString;
        this.labels = params.labels;
        await this._fetchDiagramInfo();
    }

    async reload() {
        await this._fetchDiagramInfo();
    }

    get() {
        return {
            labels: this.labels,
            nodes: this.datanodes || {},
            edges: this.edges || {},
            nodeModel: this.nodeModel,
            parentField: this.parentField,
            resId: this.resId,
            connectorModel: this.connectorModel,
            connectorAttrs: this.connectorAttrs,
        };
    }

    async _fetchDiagramInfo() {
        if (!this.resId) {
            this.datanodes = {};
            this.edges = {};
            this.parentField = false;
            return;
        }
        const data = await this.rpc('/web_diagram/diagram/get_diagram_info', {
            id: this.resId,
            model: this.modelName,
            node: this.nodeModel,
            connector: this.connectorModel,
            src_node: this.connectorAttrs.source,
            des_node: this.connectorAttrs.destination,
            label: this.connectorAttrs.label || false,
            bgcolor: this.nodeAttrs.bgcolor,
            shape: this.nodeAttrs.shape,
            visible_nodes: this.visibleNodes,
            invisible_nodes: this.invisibleNodes,
            node_fields_string: this.nodeFieldsString,
            connector_fields_string: this.connectorFieldsString,
        });
        this.datanodes = data.nodes;
        this.edges = data.conn;
        this.parentField = data.parent_field;
    }
}
