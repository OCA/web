# Copyright 2017 - 2018 Modoolar <info@modoolar.com>
# License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

import odoo
import odoo.http as http
from odoo.tools.safe_eval import safe_eval
from odoo.tools import ustr
from odoo.addons.web_diagram.controllers.main import DiagramView


class MyDiagramView(DiagramView):

    @odoo.http.route()
    def get_diagram_info(self, id, model, node, connector,
                         src_node, des_node, label, **kw):

        visible_node_fields = kw.get('visible_node_fields', [])
        invisible_node_fields = kw.get('invisible_node_fields', [])
        node_fields_string = kw.get('node_fields_string', [])
        connector_fields = kw.get('connector_fields', [])
        connector_fields_string = kw.get('connector_fields_string', [])

        bgcolors = {}
        shapes = {}
        bgcolor = kw.get('bgcolor', '')
        shape = kw.get('shape', '')

        if bgcolor:
            for color_spec in bgcolor.split(';'):
                if color_spec:
                    colour, color_state = color_spec.split(':')
                    bgcolors[colour] = color_state

        if shape:
            for shape_spec in shape.split(';'):
                if shape_spec:
                    shape_colour, shape_color_state = shape_spec.split(':')
                    shapes[shape_colour] = shape_color_state

        ir_view = http.request.env['ir.ui.view']
        graphs = ir_view.graph_get(int(id), model, node, connector, src_node,
                                   des_node, label, (140, 180))
        nodes = graphs['nodes']
        transitions = graphs['transitions']
        isolate_nodes = {}
        for blnk_node in graphs['blank_nodes']:
            isolate_nodes[blnk_node['id']] = blnk_node
        y = [
            t['y']
            for t in nodes.values()
            if t['x'] == 20
            if t['y']
        ]
        y_max = (y and max(y)) or 120

        connectors = {}
        list_tr = []

        for tr in transitions:
            list_tr.append(tr)
            connectors.setdefault(tr, {
                'id': int(tr),
                's_id': transitions[tr][0],
                'd_id': transitions[tr][1]
            })

        connector_model = http.request.env[connector]
        data_connectors = connector_model.search([
            ('id', 'in', list_tr)
        ]).read(connector_fields)

        for tr in data_connectors:
            transition_id = str(tr['id'])
            _sourceid, label = graphs['label'][transition_id]
            t = connectors[transition_id]
            t.update(
                source=tr[src_node][1],
                destination=tr[des_node][1],
                options={},
                signal=label
            )

            for i, fld in enumerate(connector_fields):
                t['options'][connector_fields_string[i]] = tr[fld]

        fields = http.request.env['ir.model.fields']
        field = fields.search([
            ('model', '=', model),
            ('relation', '=', node),
            ('ttype', '=', 'one2many')
        ])
        node_act = http.request.env[node]
        search_acts = node_act.search([(field.relation_field, '=', id)])
        data_acts = search_acts.read(
            invisible_node_fields + visible_node_fields
        )

        for act in data_acts:
            n = nodes.get(str(act['id']))
            if not n:
                n = isolate_nodes.get(act['id'], {})
                y_max += 140
                n.update(x=20, y=y_max)
                nodes[act['id']] = n

            n.update(
                id=act['id'],
                color='white',
                options={}
            )
            for color, expr in bgcolors.items():
                if safe_eval(expr, act):
                    n['color'] = color

            for shape, expr in shapes.items():
                if safe_eval(expr, act):
                    n['shape'] = shape

            for i, fld in enumerate(visible_node_fields):
                n['options'][node_fields_string[i]] = act[fld]

        _id, name = http.request.env[model].browse([id]).name_get()[0]
        ret = dict(
            nodes=nodes,
            conn=connectors,
            display_name=name,
            parent_field=graphs['node_parent_field']
        )

        # End of original method

        xpos = kw.get('xpos', False)
        ypos = kw.get('ypos', False)

        if xpos and ypos:
            # Nodes collection contains inconsistent key type
            # Integers and integer string representations are used as keys:
            # [1, 2, 3, '4', '5', '6']
            # We need to fix this before we can continue

            nodes = dict()
            for key, value in ret['nodes'].items():
                nodes[int(key)] = value
            ret['nodes'] = nodes

            model_dao = http.request.env[model]

            View = http.request.env['ir.ui.view']
            nodes_field = View.get_graph_nodes_field(model, node)
            state_ids = model_dao.browse(id)[nodes_field]
            for state in state_ids:
                state_id = state['id']
                if state_id in nodes:
                    nodes[state_id].update(
                        x=state[xpos],
                        y=state[ypos],
                    )
        return ret

    @odoo.http.route(
        '/web_diagram_position/diagram/update', type='json', auth='user')
    def update_diagram(self, id, node, xpos, ypos, x, y):
        http.request.env[node].browse(id).write({xpos: x, ypos: y})
        return http.request.env[node].browse(id)['name']

    def eval_node_shape(self, shape, node, default_shape='rectangle'):
        if not shape:
            return default_shape
        for shape_spec in shape.split(';'):
            if shape_spec:
                shape_type, shape_state = shape_spec.split(':')
                if safe_eval(shape_state, {}, node):
                    return shape_type
        return default_shape

    def eval_node_color(self, bgcolor, node, default_color='white'):
        if not bgcolor:
            return default_color
        for color_spec in bgcolor.split(';'):
            if color_spec:
                color, color_state = color_spec.split(':')
                if safe_eval(color_state, {}, node):
                    return color
        return default_color

    def eval_connector_label(self, label, conn):
        if not label:
            return ''

        label_string = ''
        for lbl in odoo.tools.safe_eval(label):
            if ustr(lbl) in conn and ustr(conn[lbl]) == 'False':
                label_string += ' '
            else:
                label_string = label_string + " " + ustr(conn[lbl])
        return label_string
