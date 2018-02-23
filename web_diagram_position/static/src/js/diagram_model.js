// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).
odoo.define('web_diagram_position.DiagramModel', function (require) {
"use strict";

require('web_diagram.DiagramModel').include({

    _fetchDiagramInfo: function () {
        var self = this;
        return this._rpc({
                route: '/web_diagram/diagram/get_diagram_info',
                params: this._prepare_diagram_info_params()
            })
            .then(function (data) {
                self.datanodes = data.nodes;
                self.edges = data.conn;
                self.parent_field = data.parent_field;
            });
    },

    _prepare_diagram_info_params: function () {
        return {
            id: this.res_id,
            model: this.modelName,
            node: this.node_model,
            connector: this.connector_model,
            src_node: this.connectors.attrs.source,
            des_node: this.connectors.attrs.destination,
            label: this.connectors.attrs.label || false,
            bgcolor: this.nodes.attrs.bgcolor,
            shape: this.nodes.attrs.shape,
            visible_nodes: this.visible_nodes,
            invisible_nodes: this.invisible_nodes,
            node_fields_string: this.node_fields_string,
            connector_fields_string: this.connector_fields_string,
            xpos: this.nodes.attrs.xpos || false,
            ypos: this.nodes.attrs.ypos || false,
        }
    },
});
});
