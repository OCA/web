/** @odoo-module */

/* global cytoscape */

import { Component, onMounted, onPatched, onWillUnmount, useRef } from "@odoo/owl";

/**
 * DiagramRenderer — OWL component.
 * Renders the diagram using Cytoscape.js with the dagre hierarchical layout.
 * Replaces the legacy Raphael.js renderer for better performance and UX.
 */
export class DiagramRenderer extends Component {
    setup() {
        this.containerRef = useRef("diagram");
        this._cy = null;
        onMounted(() => this._render());
        onPatched(() => this._render());
        onWillUnmount(() => this._destroy());
    }

    _destroy() {
        if (this._keyHandler) {
            document.removeEventListener("keydown", this._keyHandler);
            this._keyHandler = null;
        }
        if (this._cy) {
            this._cy.destroy();
            this._cy = null;
        }
    }

    _render() {
        const container = this.containerRef.el;
        if (!container) return;

        const { nodes, edges, onEditNode, onRemoveNode, onEditEdge, onAddEdge, onRemoveEdge } =
            this.props;

        this._destroy();

        // Set container height dynamically so Cytoscape can render
        const viewportHeight = window.innerHeight;
        const rect = container.getBoundingClientRect();
        container.style.height = Math.max(400, viewportHeight - rect.top - 20) + "px";

        // Identify connected vs isolated nodes
        const connectedIds = new Set();
        Object.values(edges).forEach((edge) => {
            connectedIds.add(String(edge.s_id));
            connectedIds.add(String(edge.d_id));
        });

        // Build elements — only connected nodes go into dagre
        const connectedElements = [];
        const isolatedNodes = [];

        Object.values(nodes).forEach((node) => {
            const nid = String(node.id);
            const el = {
                data: {
                    id: nid,
                    label: node.name || nid,
                    color: node.color === "white" ? "#ffffff" : "#EEF0F4",
                },
            };
            if (connectedIds.has(nid)) {
                connectedElements.push(el);
            } else {
                isolatedNodes.push(el);
            }
        });

        Object.values(edges).forEach((edge) => {
            connectedElements.push({
                data: {
                    id: `e_${edge.id}`,
                    source: String(edge.s_id),
                    target: String(edge.d_id),
                    label: edge.signal || "",
                },
            });
        });

        // All elements combined (isolated nodes added with preset positions after dagre)
        const allElements = [...connectedElements, ...isolatedNodes];

        this._cy = cytoscape({
            container,
            elements: allElements,
            style: [
                {
                    selector: "node",
                    style: {
                        "background-color": "data(color)",
                        "border-color": "#CED4DA",
                        "border-width": 1.5,
                        "label": "data(label)",
                        "text-valign": "center",
                        "text-halign": "center",
                        "font-size": 11,
                        "font-family": '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        "color": "#1C2438",
                        "width": 120,
                        "height": 50,
                        "shape": "round-rectangle",
                        "text-wrap": "wrap",
                        "text-max-width": 110,
                    },
                },
                {
                    selector: "node:selected",
                    style: {
                        "border-color": "#0D6EFD",
                        "border-width": 2.5,
                    },
                },
                {
                    selector: "edge",
                    style: {
                        "width": 2,
                        "line-color": "#8C96A5",
                        "target-arrow-color": "#8C96A5",
                        "target-arrow-shape": "triangle",
                        "curve-style": "bezier",
                        "label": "data(label)",
                        "font-size": 10,
                        "color": "#6C757D",
                        "text-background-color": "#ffffff",
                        "text-background-opacity": 0.8,
                        "text-background-padding": 2,
                    },
                },
                {
                    selector: "edge:selected",
                    style: {
                        "line-color": "#0D6EFD",
                        "target-arrow-color": "#0D6EFD",
                    },
                },
            ],
            layout: { name: "preset", animate: false },
            // Enable zoom and pan
            userZoomingEnabled: true,
            userPanningEnabled: true,
            minZoom: 0.05,
            maxZoom: 3,
            wheelSensitivity: 0.3,
        });

        // Run dagre on connected nodes — let dagre handle all positioning
        this._cy.elements().filter((el) => connectedIds.has(el.id()) || el.isEdge()).layout({
            name: "dagre",
            rankDir: "TB",
            nodeSep: 40,
            rankSep: 80,
            edgeSep: 10,
            ranker: "network-simplex",
            animate: false,
        }).run();

        // Place isolated nodes in a grid below the connected graph
        const connectedBounds = this._cy.elements().filter((el) => connectedIds.has(el.id())).boundingBox();
        const bottomY = (connectedBounds.y2 || 0) + 120;
        const NODE_W = 140;
        const COLS = 15;
        isolatedNodes.forEach((el, i) => {
            const nid = el.data.id;
            this._cy.getElementById(nid).position({
                x: (i % COLS) * NODE_W + NODE_W / 2,
                y: bottomY + Math.floor(i / COLS) * 80,
            });
        });

        // Double-click on node → edit
        this._cy.on("dblclick", "node", (evt) => {
            onEditNode(parseInt(evt.target.id(), 10));
        });

        // Double-click on edge → edit
        this._cy.on("dblclick", "edge", (evt) => {
            const edgeId = evt.target.id().replace("e_", "");
            onEditEdge(parseInt(edgeId, 10));
        });

        // Fit the full graph in view after layout
        this._cy.ready(() => {
            this._cy.fit(undefined, 30);
        });

        // Keyboard shortcuts: +/- to zoom, arrows to pan, F to fit
        this._keyHandler = (e) => {
            if (!this._cy) return;
            const PAN_STEP = 80;
            const ZOOM_FACTOR = 1.2;
            switch (e.key) {
                case "+": case "=":
                    this._cy.zoom({ level: this._cy.zoom() * ZOOM_FACTOR, renderedPosition: { x: this._cy.width() / 2, y: this._cy.height() / 2 } });
                    break;
                case "-":
                    this._cy.zoom({ level: this._cy.zoom() / ZOOM_FACTOR, renderedPosition: { x: this._cy.width() / 2, y: this._cy.height() / 2 } });
                    break;
                case "ArrowUp":    this._cy.panBy({ x: 0, y: PAN_STEP });  e.preventDefault(); break;
                case "ArrowDown":  this._cy.panBy({ x: 0, y: -PAN_STEP }); e.preventDefault(); break;
                case "ArrowLeft":  this._cy.panBy({ x: PAN_STEP, y: 0 });  e.preventDefault(); break;
                case "ArrowRight": this._cy.panBy({ x: -PAN_STEP, y: 0 }); e.preventDefault(); break;
                case "f": case "F":
                    this._cy.fit(undefined, 30);
                    break;
            }
        };
        document.addEventListener("keydown", this._keyHandler);

        // Expose cy instance for export
        container._cy = this._cy;
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
