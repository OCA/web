odoo.define('web_diagram.DiagramRenderer', function (require) {
"use strict";

var AbstractRenderer = require('web.AbstractRenderer');

/* global cytoscape */

/**
 * Diagram Renderer — Cytoscape.js port for Odoo 15 legacy framework.
 * Replaces the Raphael.js / CuteGraph renderer with Cytoscape + dagre.
 */
var DiagramRenderer = AbstractRenderer.extend({
    template: 'DiagramView',

    init: function (parent, state, params) {
        this._super.apply(this, arguments);
        this._cy = null;
        this._keyHandler = null;
    },

    start: function () {
        this.$diagram_container = this.$el.filter('.o_diagram');
        return this._super.apply(this, arguments);
    },

    destroy: function () {
        this._destroyCy();
        this._super.apply(this, arguments);
    },

    _destroyCy: function () {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        if (this._cy) {
            this._cy.destroy();
            this._cy = null;
        }
    },

    _render: function () {
        var self = this;
        var nodes = this.state.nodes || {};
        var edges = this.state.edges || {};

        this._destroyCy();

        var container = this.$diagram_container[0];
        if (!container) { return Promise.resolve(); }

        // Cytoscape needs an explicit pixel height on its container.
        var viewportHeight = window.innerHeight;
        var rect = container.getBoundingClientRect();
        container.style.height = Math.max(400, viewportHeight - rect.top - 20) + 'px';

        // Identify connected vs isolated nodes
        var connectedIds = {};
        _.each(edges, function (edge) {
            connectedIds[String(edge.s_id)] = true;
            connectedIds[String(edge.d_id)] = true;
        });

        // Build Cytoscape elements
        var connectedElements = [];
        var isolatedNodes = [];

        _.each(nodes, function (node) {
            var nid = String(node.id);
            var el = {
                data: {
                    id: nid,
                    label: node.name || nid,
                    color: node.color === 'white' ? '#ffffff' : '#EEF0F4',
                },
            };
            if (connectedIds[nid]) {
                connectedElements.push(el);
            } else {
                isolatedNodes.push(el);
            }
        });

        _.each(edges, function (edge) {
            connectedElements.push({
                data: {
                    id: 'e_' + edge.id,
                    source: String(edge.s_id),
                    target: String(edge.d_id),
                    label: edge.signal || '',
                },
            });
        });

        this._cy = cytoscape({
            container: container,
            elements: connectedElements.concat(isolatedNodes),
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': 'data(color)',
                        'border-color': '#CED4DA',
                        'border-width': 1.5,
                        'label': 'data(label)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'font-size': 11,
                        'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif',
                        'color': '#1C2438',
                        'width': 120,
                        'height': 50,
                        'shape': 'round-rectangle',
                        'text-wrap': 'wrap',
                        'text-max-width': 110,
                    },
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-color': '#0D6EFD',
                        'border-width': 2.5,
                    },
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#8C96A5',
                        'target-arrow-color': '#8C96A5',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'label': 'data(label)',
                        'font-size': 10,
                        'color': '#6C757D',
                        'text-background-color': '#ffffff',
                        'text-background-opacity': 0.8,
                        'text-background-padding': 2,
                    },
                },
                {
                    selector: 'edge:selected',
                    style: {
                        'line-color': '#0D6EFD',
                        'target-arrow-color': '#0D6EFD',
                    },
                },
            ],
            layout: { name: 'preset', animate: false },
            userZoomingEnabled: true,
            userPanningEnabled: true,
            minZoom: 0.05,
            maxZoom: 3,
            wheelSensitivity: 0.3,
        });

        // Run dagre layout on connected nodes + edges only
        var hasConnected = Object.keys(connectedIds).length > 0;
        if (hasConnected) {
            this._cy.elements().filter(function (el) {
                return connectedIds[el.id()] || el.isEdge();
            }).layout({
                name: 'dagre',
                rankDir: 'TB',
                nodeSep: 30,
                rankSep: 60,
                edgeSep: 5,
                ranker: 'network-simplex',
                animate: false,
            }).run();
        }

        // BFS depth-based Y so siblings at the same depth share the same Y
        var RANK_SEP = 80;
        var childrenMap = {};
        var hasParent = {};
        _.each(edges, function (edge) {
            var src = String(edge.s_id);
            var dst = String(edge.d_id);
            if (!childrenMap[src]) { childrenMap[src] = []; }
            if (childrenMap[src].indexOf(dst) === -1) { childrenMap[src].push(dst); }
            hasParent[dst] = true;
        });

        var depthMap = {};
        var bfsQueue = [];
        _.each(Object.keys(connectedIds), function (nid) {
            if (!hasParent[nid]) {
                depthMap[nid] = 0;
                bfsQueue.push(nid);
            }
        });
        while (bfsQueue.length) {
            var nid = bfsQueue.shift();
            _.each(childrenMap[nid] || [], function (child) {
                if (depthMap[child] === undefined) {
                    depthMap[child] = (depthMap[nid] || 0) + 1;
                    bfsQueue.push(child);
                }
            });
        }
        this._cy.nodes().forEach(function (n) {
            if (connectedIds[n.id()]) {
                n.position('y', (depthMap[n.id()] || 0) * RANK_SEP + 40);
            }
        });

        // Redistribute siblings evenly around their parent's X position
        var NODE_SEP = 160;
        _.each(Object.keys(childrenMap), function (parentId) {
            var siblings = childrenMap[parentId];
            if (siblings.length < 2) { return; }
            var parentNode = self._cy.getElementById(parentId);
            if (!parentNode.length) { return; }
            var parentX = parentNode.position('x');
            var startX = parentX - ((siblings.length - 1) * NODE_SEP) / 2;
            siblings.forEach(function (childId, i) {
                var child = self._cy.getElementById(childId);
                if (child.length) { child.position('x', startX + i * NODE_SEP); }
            });
        });

        // Collision avoidance: push apart nodes at the same depth that are too close
        var MIN_GAP = 130;
        var byDepth = {};
        this._cy.nodes().forEach(function (n) {
            if (!connectedIds[n.id()]) { return; }
            var d = depthMap[n.id()] || 0;
            if (!byDepth[d]) { byDepth[d] = []; }
            byDepth[d].push(n);
        });
        _.each(byDepth, function (levelNodes) {
            levelNodes.sort(function (a, b) { return a.position('x') - b.position('x'); });
            for (var i = 1; i < levelNodes.length; i++) {
                var gap = levelNodes[i].position('x') - levelNodes[i - 1].position('x');
                if (gap < MIN_GAP) {
                    levelNodes[i].position('x', levelNodes[i - 1].position('x') + MIN_GAP);
                }
            }
        });

        // Place isolated nodes in a grid below the connected graph
        var connectedBB = hasConnected
            ? this._cy.elements().filter(function (el) { return connectedIds[el.id()]; }).boundingBox()
            : { y2: 0 };
        var bottomY = (connectedBB.y2 || 0) + 120;
        var GRID_W = 140;
        var COLS = 15;
        isolatedNodes.forEach(function (el, i) {
            self._cy.getElementById(el.data.id).position({
                x: (i % COLS) * GRID_W + GRID_W / 2,
                y: bottomY + Math.floor(i / COLS) * 80,
            });
        });

        // Double-click on node → edit
        this._cy.on('dblclick', 'node', function (evt) {
            self.trigger_up('edit_node', { id: parseInt(evt.target.id(), 10) });
        });
        // Double-click on edge → edit
        this._cy.on('dblclick', 'edge', function (evt) {
            self.trigger_up('edit_edge', { id: parseInt(evt.target.id().replace('e_', ''), 10) });
        });

        // Fit the full graph after layout
        this._cy.ready(function () {
            self._cy.fit(undefined, 30);
        });

        // Keyboard shortcuts: +/- zoom, arrows pan, F fit
        this._keyHandler = function (e) {
            if (!self._cy) { return; }
            var ZOOM_F = 1.2;
            var PAN = 80;
            var cx = self._cy.width() / 2;
            var cy2 = self._cy.height() / 2;
            switch (e.key) {
                case '+': case '=':
                    self._cy.zoom({ level: self._cy.zoom() * ZOOM_F, renderedPosition: { x: cx, y: cy2 } });
                    break;
                case '-':
                    self._cy.zoom({ level: self._cy.zoom() / ZOOM_F, renderedPosition: { x: cx, y: cy2 } });
                    break;
                case 'ArrowUp':    self._cy.panBy({ x: 0,    y: PAN });  e.preventDefault(); break;
                case 'ArrowDown':  self._cy.panBy({ x: 0,    y: -PAN }); e.preventDefault(); break;
                case 'ArrowLeft':  self._cy.panBy({ x: PAN,  y: 0 });    e.preventDefault(); break;
                case 'ArrowRight': self._cy.panBy({ x: -PAN, y: 0 });    e.preventDefault(); break;
                case 'f': case 'F':
                    self._cy.fit(undefined, 30);
                    break;
            }
        };
        document.addEventListener('keydown', this._keyHandler);

        // Expose Cytoscape instance on the container for the export button
        container._cy = this._cy;

        return Promise.resolve();
    },
});

return DiagramRenderer;

});
