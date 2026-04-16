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
            // Edges — soft blue-gray, Bootstrap-inspired
            edge_color: "#8C96A5",
            edge_label_color: "#6C757D",
            edge_label_font_size: 11,
            edge_width: 2,
            edge_spacing: 100,
            edge_loop_radius: 100,
            // Nodes — clean card look (rounded, light border, dark text)
            node_label_color: "#1C2438",
            node_label_font_size: 12,
            node_outline_color: "#CED4DA",   // Bootstrap light border
            node_outline_width: 1.5,
            node_selected_color: "#0D6EFD", // Bootstrap primary blue
            node_selected_width: 2.5,
            node_size_x: 120,
            node_size_y: 80,
            node_border_radius: 8,           // rounded corners
            font_family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            // Connectors / close button
            connector_active_color: "#0D6EFD",
            connector_radius: 5,
            close_button_radius: 9,
            close_button_color: "#6C757D",
            close_button_x_color: "#FFF",
            // Node fill colours
            gray: "#EEF0F4",                 // light blue-gray (default)
            white: "#FFF",
            viewport_margin: 50,
        };

        // Clear previous diagram
        container.innerHTML = "";

        // Compute explicit pixel height.  Raphael requires a pixel value —
        // height="100%" does not resolve inside Odoo 18's Layout component.
        // Use the viewport height as a minimum, but expand to fit all nodes so
        // Raphael's SVG overflow:hidden does not clip nodes placed at large y.
        const nodeList = Object.values(nodes);
        const maxNodeY = nodeList.length > 0
            ? Math.max(...nodeList.map((n) => n.y + 50 + style.node_size_y))
            : 0;
        const rect = container.getBoundingClientRect();
        const viewportHeight = Math.max(400, Math.round(window.innerHeight - rect.top - 10));
        const height = Math.max(viewportHeight, maxNodeY + style.viewport_margin);

        const r = new Raphael(container, "100%", height);
        const graph = new CuteGraph(r, style, container);
        const idToNode = {};

        Object.values(nodes).forEach((node) => {
            const n = new CuteNode(
                graph,
                node.x + 50, // shift to avoid clipping at x=0 in Raphael's coordinate space
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
                idToNode[edge.d_id] || idToNode[edge.s_id] // fallback: loop to source if dest not in current view
            );
            e.id = edge.id;
        });

        // Wire up interaction callbacks (static on the CuteGraph classes)
        CuteNode.double_click_callback = (cutenode) => onEditNode(cutenode.id);
        CuteNode.destruction_callback = (cutenode) => {
            onRemoveNode(cutenode.id);
            // Return a never-resolving promise so the library never calls
            // entity.remove() — the diagram is redrawn after server confirms.
            return new Promise(() => {});
        };

        CuteEdge.double_click_callback = (cuteedge) => onEditEdge(cuteedge.id);
        CuteEdge.creation_callback = () => ({ label: "" });
        CuteEdge.new_edge_callback = (cuteedge) => {
            onAddEdge(cuteedge.get_start().id, cuteedge.get_end().id);
        };
        CuteEdge.destruction_callback = (cuteedge) => {
            onRemoveEdge(cuteedge.id);
            return new Promise(() => {});
        };
    }
}

DiagramRenderer.template = "web_diagram.DiagramView";
DiagramRenderer.props = {
    nodes: Object,
    edges: Object,
    labels: Array,
    onEditNode: Function,
    onRemoveNode: Function,
    onEditEdge: Function,
    onAddEdge: Function,
    onRemoveEdge: Function,
};
