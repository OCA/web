/** @odoo-module */

/* global Raphael, CuteGraph, CuteNode, CuteEdge */

import { Component, onMounted, onPatched, useRef } from "@odoo/owl";

/**
 * DiagramRenderer — OWL component.
 * Renders the diagram using Raphael.js (global) and the CuteGraph
 * helpers from graph.js (also globals set by legacy scripts).
 */
export class DiagramRenderer extends Component {
    setup() {
        this.containerRef = useRef("diagram");
        onMounted(() => this._render());
        onPatched(() => this._render());
    }

    _render() {
        const container = this.containerRef.el;
        if (!container) {
            return;
        }

        const { nodes, edges, onEditNode, onRemoveNode, onEditEdge, onAddEdge, onRemoveEdge } =
            this.props;

        const style = {
            edge_color: "#A0A0A0",
            edge_label_color: "#555",
            edge_label_font_size: 10,
            edge_width: 2,
            edge_spacing: 100,
            edge_loop_radius: 100,
            node_label_color: "#333",
            node_label_font_size: 12,
            node_outline_color: "#333",
            node_outline_width: 1,
            node_selected_color: "#0097BE",
            node_selected_width: 2,
            node_size_x: 110,
            node_size_y: 80,
            connector_active_color: "#FFF",
            connector_radius: 4,
            close_button_radius: 8,
            close_button_color: "#333",
            close_button_x_color: "#FFF",
            gray: "#DCDCDC",
            white: "#FFF",
            viewport_margin: 50,
        };

        // Clear previous diagram
        container.innerHTML = "";

        // Render in a temporary off-screen div so Raphael positions labels
        // correctly, then move the result into the real container.
        const div = document.createElement("div");
        div.style.cssText = "position:absolute;top:-10000px;right:-10000px;";
        document.body.appendChild(div);

        const r = new Raphael(div, "100%", "100%");
        const graph = new CuteGraph(r, style, container);
        const idToNode = {};

        Object.values(nodes).forEach((node) => {
            const n = new CuteNode(
                graph,
                node.x + 50, // FIXME: +50 offset should live in the layout algorithm
                node.y + 50,
                CuteGraph.wordwrap(node.name, 14),
                node.shape === "rectangle" ? "rect" : "circle",
                node.color === "white" ? style.white : style.gray
            );
            n.id = node.id;
            idToNode[node.id] = n;
        });

        Object.values(edges).forEach((edge) => {
            const e = new CuteEdge(
                graph,
                CuteGraph.wordwrap(edge.signal, 32),
                idToNode[edge.s_id],
                idToNode[edge.d_id] || idToNode[edge.s_id] // WORKAROUND for missing dest
            );
            e.id = edge.id;
        });

        // Move rendered SVG into real container
        while (div.firstChild) {
            container.appendChild(div.firstChild);
        }
        div.remove();

        // Wire up interaction callbacks (static on the CuteGraph classes)
        CuteNode.double_click_callback = (cutenode) => onEditNode(cutenode.id);
        CuteNode.destruction_callback = (cutenode) => {
            onRemoveNode(cutenode.id);
            // Reject to prevent the library from immediately removing the node;
            // the diagram is redrawn after the server confirms deletion.
            return Promise.reject();
        };

        CuteEdge.double_click_callback = (cuteedge) => onEditEdge(cuteedge.id);
        CuteEdge.creation_callback = () => ({ label: "" });
        CuteEdge.new_edge_callback = (cuteedge) => {
            onAddEdge(cuteedge.get_start().id, cuteedge.get_end().id);
        };
        CuteEdge.destruction_callback = (cuteedge) => {
            onRemoveEdge(cuteedge.id);
            return Promise.reject();
        };
    }
}

DiagramRenderer.template = "web_diagram.DiagramView";
DiagramRenderer.props = {
    nodes: { type: Object },
    edges: { type: Object },
    labels: { type: Array },
    onEditNode: { type: Function },
    onRemoveNode: { type: Function },
    onEditEdge: { type: Function },
    onAddEdge: { type: Function },
    onRemoveEdge: { type: Function },
};
