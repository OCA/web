# Part of Odoo. See LICENSE file for full copyright and licensing details.

from collections import deque

import odoo.http as http

from odoo.tools.safe_eval import safe_eval

# Spacing between nodes
NODE_W = 150   # horizontal gap between nodes
NODE_H = 110   # vertical gap between levels
MAX_COLS = 8   # max nodes per row before wrapping within a level


def _parse_key_value_spec(spec_str):
    """Parse a semicolon-separated list of 'key:value' pairs into a dict.
    Malformed pairs (missing colon) are silently skipped.
    """
    result = {}
    for item in (spec_str or '').split(';'):
        if ':' in item:
            key, value = item.split(':', 1)
            result[key] = value
    return result


def _tree_layout(nodes, transitions):
    """Compact top-down tree layout.

    - Parents appear above their children.
    - Siblings of the same parent are grouped together horizontally.
    - Each depth level is capped at MAX_COLS columns; extra nodes wrap to
      a sub-row within the same level (vertical scroll only, no wide canvas).
    - Isolated nodes (no edges) are placed at the very bottom.
    """
    # Build children map and track which nodes have a parent
    children = {}
    has_parent = set()

    for _tr_id, (src_id, dst_id) in transitions.items():
        src_str = str(src_id)
        dst_str = str(dst_id)
        children.setdefault(src_str, [])
        if dst_str not in children[src_str]:
            children[src_str].append(dst_str)
        has_parent.add(dst_str)

    all_ids = set(nodes.keys())
    roots = [nid for nid in all_ids if nid not in has_parent]

    # BFS to build depth and BFS order (siblings grouped by parent)
    depth = {}
    visited = set()
    queue = deque()
    for root in roots:
        depth[root] = 0
        queue.append(root)
        visited.add(root)

    bfs_order = []
    while queue:
        nid = queue.popleft()
        bfs_order.append(nid)
        for child in children.get(nid, []):
            if child not in visited:
                visited.add(child)
                depth[child] = depth[nid] + 1
                queue.append(child)

    # Group nodes by depth level, preserving BFS order
    # (so siblings of the same parent are consecutive)
    levels = {}
    for nid in bfs_order:
        d = depth[nid]
        levels.setdefault(d, [])
        levels[d].append(nid)

    # Assign positions level by level
    current_y = 0
    for d in sorted(levels.keys()):
        level_nodes = levels[d]
        n_rows = max(1, (len(level_nodes) + MAX_COLS - 1) // MAX_COLS)

        for i, nid in enumerate(level_nodes):
            col = i % MAX_COLS
            wrap_row = i // MAX_COLS
            nodes[nid]['x'] = col * NODE_W
            nodes[nid]['y'] = current_y + wrap_row * NODE_H

        # Advance y by: one main level gap + extra rows within this level
        current_y += NODE_H * n_rows

    # Place isolated nodes (not reachable from any root) at the bottom
    unplaced = [nid for nid in all_ids if nid not in visited]
    for i, nid in enumerate(unplaced):
        nodes[nid]['x'] = (i % MAX_COLS) * NODE_W
        nodes[nid]['y'] = current_y + NODE_H

    return nodes


class DiagramView(http.Controller):

    @http.route('/web_diagram/diagram/get_diagram_info', type='json', auth='user')
    def get_diagram_info(self, id, model, node, connector,
                         src_node, des_node, label, **kw):

        visible_node_fields = kw.get('visible_node_fields', [])
        invisible_node_fields = kw.get('invisible_node_fields', [])
        node_fields_string = kw.get('node_fields_string', [])
        connector_fields = kw.get('connector_fields', [])
        connector_fields_string = kw.get('connector_fields_string', [])

        bgcolors = _parse_key_value_spec(kw.get('bgcolor', ''))
        shapes = _parse_key_value_spec(kw.get('shape', ''))

        ir_view = http.request.env['ir.ui.view']
        graphs = ir_view.graph_get(int(id), model, node, connector, src_node,
                                   des_node, label, (NODE_W, NODE_H))
        nodes = graphs['nodes']
        transitions = graphs['transitions']
        isolate_nodes = {
            blnk_node['id']: blnk_node
            for blnk_node in graphs['blank_nodes']
        }
        y = [t['y'] for t in nodes.values() if t['x'] == 20 and t['y']]
        y_max = (y and max(y)) or 120

        connectors = {}
        list_tr = list(transitions.keys())

        for tr in transitions:
            connectors.setdefault(tr, {
                'id': int(tr),
                's_id': transitions[tr][0],
                'd_id': transitions[tr][1]
            })

        connector_model = http.request.env[connector]
        data_connectors = connector_model.search([('id', 'in', list_tr)]).read(connector_fields)

        for tr in data_connectors:
            transition_id = str(tr['id'])
            label = graphs['label'][transition_id][1]
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
        field = fields.search([('model', '=', model), ('relation', '=', node)], limit=1)
        node_act = http.request.env[node]
        if field and field.relation_field:
            search_acts = node_act.search([(field.relation_field, '=', id)])
        else:
            search_acts = node_act.browse()
        data_acts = search_acts.read(invisible_node_fields + visible_node_fields)

        for act in data_acts:
            act_id_str = str(act['id'])
            n = nodes.get(act_id_str)
            if not n:
                n = isolate_nodes.get(act['id'], {})
                y_max += NODE_H
                n.update(x=20, y=y_max)
                nodes[act_id_str] = n

            n.update(id=act['id'], color='white', options={})

            for color, expr in bgcolors.items():
                if safe_eval(expr, act):
                    n['color'] = color

            for shape, expr in shapes.items():
                if safe_eval(expr, act):
                    n['shape'] = shape

            for i, fld in enumerate(visible_node_fields):
                n['options'][node_fields_string[i]] = act[fld]

        # Apply compact hierarchical layout
        nodes = _tree_layout(nodes, transitions)

        name = http.request.env[model].browse(id).display_name
        return dict(nodes=nodes,
                    conn=connectors,
                    display_name=name,
                    parent_field=graphs['node_parent_field'])
