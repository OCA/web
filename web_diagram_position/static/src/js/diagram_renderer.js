// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).
odoo.define('web_diagram_position.DiagramRenderer', function (require) {
"use strict";

require('web_diagram.DiagramRenderer').include({

    track_node_position_changes: function () {
        let model = this.getParent().model;
        return model.nodes.attrs.xpos != undefined && model.nodes.attrs.ypos != undefined;
    },

    on_node_drag_end: function (e) {
        var self = this;
        var node = e.target.cute_node;
        if (e.target.cute_node == undefined || self.node_updating) return
        self.node_updating = true;
        console.log('Drag event: ', node);

        this._rpc({
                route: '/web_diagram_position/diagram/update',
                params: this._prepare_node_for_update(node),
            })
            .then(function (data) {
                self.on_node_updated(node);
                self.node_updating = false;
            });

    },

    _prepare_node_for_update: function (node) {
        let model = this.getParent().model;

        return {
            'id': node.id,
            'node': model.node_model,
            'xpos': model.nodes.attrs.xpos,
            'ypos': model.nodes.attrs.ypos,
            'x': node.get_pos().x,
            'y': node.get_pos().y
        };
    },

    on_node_updated: function (node) {
        console.log('Node updated: ', node);
    },

    create_cute_node: function (graph, node, style) {
        return new MyCuteNode(
            graph,
            node.x,
            node.y,
            MyCuteGraph.wordwrap(node.name, 14),
            node.shape === 'rectangle' ? 'rect' : 'circle',
            style[node.color] || style.gray
        );
    },

    create_cute_edge: function (graph, edge, nodes) {
        return new MyCuteEdge(
            graph,
            MyCuteGraph.wordwrap(edge.signal, 32),
            nodes[edge.s_id],
            nodes[edge.d_id] || nodes[edge.s_id] //WORKAROUND
        );
    },

    create_cute_graph: function (r, style, viewport) {
        return new MyCuteGraph(r, style, viewport, {readonly: this.getParent().is_readonly()});
    },

    make_cute_node: function (graph, node, style) {
        var n = this.create_cute_node(graph, node, style);
        n.id = node.id;
        this.id_to_node[node.id] = n;
        return n;
    },

    make_tracked_cute_node: function (graph, node, style) {
        var n = this.make_cute_node(graph, node, style);

        var self = this;

        var drag_end = function (e) {
            self.on_node_drag_end(e);
        };

        // Here we need to register cute-node with the Rafael's figure node
        // and we need to subscribe to the drag-end event so we can save (x,y) coordinates with the task state.
        n.get_fig().node.cute_node = n;
        n.get_fig().drag(null, null, drag_end);

        // Also, because the state is compiled out of two Rafael's nodes we need to subscribe to the drag-end event
        // of the Rafael's label node. Now, this is a bit tricky one to do because cute-node does not exposes
        // the actual label node. It only exposes the text of the label node.
        // So here we need to do a bit of mumbo jumbo to make this to work.

        // Here we need to register cute-node with the draggable elements of the Rafel's label node.
        // These elements are ``tspan`` and ``text``.
        n.get_fig().next.node.cute_node = n;
        n.get_fig().next.node.firstChild.cute_node = n;

        // Finally we register drag-end event
        n.get_fig().next.drag(null, null, drag_end);
    },

    /**
     * @override
     * @returns {Deferred}
     */
    _render: function () {
        var self = this;
        var nodes  = this.state.nodes;
        var edges  = this.state.edges;
        this.id_to_node = {};
        this.id_to_edge = {};
        var style = this._get_style();

        // remove previous diagram
        this.$diagram_container.empty();

        // for the node and edge's label to be correctly positioned, the diagram
        // must be rendered directly in the DOM, so we render it in a fake
        // element appended in the body, and then move it to this widget's $el
        var $div = $('<div>')
                        .css({position: 'absolute', top: -10000, right: -10000})
                        .appendTo($('body'));
        var r  = new Raphael($div[0], '100%','100%');
        var graph  = self.create_cute_graph(r, style, this.$diagram_container[0]);
        this.graph = graph;

        var make_node = this.track_node_position_changes() ? this.make_tracked_cute_node.bind(this) : this.make_cute_node.bind(this);

        _.each(nodes, function (node) {
            make_node(graph, node, style);
        });

        _.each(edges, function (edge) {
            var e = self.create_cute_edge(graph, edge, self.id_to_node);
            e.id = edge.id;
            self.id_to_edge[e.id] = e;
        });

        // move the renderered diagram to the widget's $el
        $div.contents().appendTo(this.$diagram_container);
        $div.remove();

        MyCuteNode.double_click_callback = function (cutenode) {
            self.trigger_up('edit_node', {id: cutenode.id});
        };
        MyCuteNode.destruction_callback = function (cutenode) {
            self.trigger_up('remove_node', {id: cutenode.id});
            // return a rejected deferred to prevent the library from removing
            // the node directly,as the diagram will be redrawn once the node is
            // deleted
            return $.Deferred().reject();
        };
        MyCuteEdge.double_click_callback = function (cuteedge) {
            self.trigger_up('edit_edge', {id: cuteedge.id});
        };

        MyCuteEdge.creation_callback = function (node_start, node_end) {
            return {label: ''};
        };
        MyCuteEdge.new_edge_callback = function (cuteedge) {
            self.trigger_up('add_edge', {
                source_id: cuteedge.get_start().id,
                dest_id: cuteedge.get_end().id,
            });
        };
        MyCuteEdge.destruction_callback = function (cuteedge) {
            self.trigger_up('remove_edge', {id: cuteedge.id});
            // return a rejected deferred to prevent the library from removing
            // the edge directly, as the diagram will be redrawn once the edge
            // is deleted
            return $.Deferred().reject();
        };
        return $.when();
    },
    
    _get_style: function () {
        return {
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

            viewport_margin: 50
        };
    }
});

});
