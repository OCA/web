# -*- coding: utf-8 -*-
# © 2015-2016 ONESTEiN BV (<http://www.onestein.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import json

from odoo import tools
from odoo import SUPERUSER_ID
from odoo import models, fields, api
from odoo.exceptions import Warning as UserError
from odoo.modules.registry import RegistryManager
from odoo.tools.translate import _


class BveView(models.Model):
    _name = 'bve.view'
    _description = "BI View Editor"

    @api.depends('group_ids')
    @api.multi
    def _compute_users(self):
        for bve_view in self:
            if bve_view.sudo().group_ids:
                bve_view.user_ids = self.env['res.users'].sudo().browse(
                    list(set([u.id for group in bve_view.sudo().group_ids
                              for u in group.users])))
            else:
                bve_view.user_ids = self.env['res.users'].sudo().search([])

    name = fields.Char(size=128, string="Name", required=True)
    model_name = fields.Char(size=128, string="Model Name")

    note = fields.Text(string="Notes")

    state = fields.Selection(
        [('draft', 'Draft'),
         ('created', 'Created')],
        string="State",
        default="draft")
    data = fields.Text(
        string="Data",
        help="Use the special query builder to define the query "
             "to generate your report dataset. "
             "NOTE: Te be edited, the query should be in 'Draft' status.")

    action_id = fields.Many2one('ir.actions.act_window', string="Action")
    view_id = fields.Many2one('ir.ui.view', string="View")

    group_ids = fields.Many2many(
        'res.groups',
        string="Groups",
        help="User groups allowed to see the generated report; "
             "if NO groups are specified the report will be public "
             "for everyone.")

    user_ids = fields.Many2many(
        'res.users',
        string="Users",
        compute=_compute_users,
        store=True)

    _sql_constraints = [
        ('name_uniq',
         'unique(name)',
         'Custom BI View names must be unique!'),
    ]

    
    
    @api.multi
    def copy(self, default=None):        
        default['name'] = self.name + '(copy)'
        return super(BveView, self).copy(default)
        
    @api.multi
    def unlink(self):
        for view in self:
            if view.state == 'created':
                raise UserError(
                    _('You cannot delete a created view! '
                      'Reset the view to draft first.'))

        super(BveView, self).unlink()

    @api.multi
    def action_edit_query(self):
        return {
            'type': 'ir.actions.client',
            'tag': 'bi_view_editor.open',
            'target': 'new',
            'params': {'bve_view_id': self.id}
        }

    @api.multi
    def action_reset(self):
        if self.action_id:
            if self.action_id.view_id:
                self.action_id.view_id.sudo().unlink()
            self.action_id.sudo().unlink()

        models = self.env['ir.model'].sudo().search(
            [('model', '=', self.model_name)])
        for model in models:
            model.sudo().unlink()

        table_name = self.model_name.replace(".", "_")
        tools.drop_view_if_exists(self.env.cr, table_name)

        self.write({
            'state': 'draft'
        })
        return True

    def _create_graph_view(self):
        fields_info = json.loads(self.data)
        view_fields = ["""<field name="x_{}" type="{}" />""".format(
            field_info['name'],
            (field_info['row'] and 'row') or
            (field_info['column'] and 'col') or
            (field_info['measure'] and 'measure'))
            for field_info in fields_info if field_info['row'] or
            field_info['column'] or field_info['measure']]
        return view_fields

    def _create_tree_view(self):
        fields_info = json.loads(self.data)
        view_fields = ["""<field name="x_{}" type="{}" />""".format(
            field_info['name'],
            (field_info['row'] and 'row') or
            (field_info['column'] and 'col') or
            (field_info['measure'] and 'measure'))
            for field_info in fields_info if field_info['row'] or
            field_info['column'] or field_info['measure']]
        return view_fields

    @api.multi
    def action_create(self):

        def _get_fields_info(fields_data):
            fields_info = []
            for field_data in fields_data:
                field = self.env['ir.model.fields'].browse(field_data["id"])
                vals = {
                    "table": self.env[field.model_id.model]._table,
                    "table_alias": field_data["table_alias"],
                    "select_field": field.name,
                    "as_field": "x_" + field_data["name"],
                    "join": False,
                    "model": field.model_id.model
                }
                if field_data.get("join_node"):
                    vals.update({"join": field_data["join_node"]})
                fields_info.append(vals)
            return fields_info

        def _build_query():
            data = self.data
            if not data:
                raise UserError(_('No data to process.'))
            info = _get_fields_info(json.loads(data))
            fields = [("{}.{}".format(f["table_alias"],
                       f["select_field"]),
                       f["as_field"]) for f in info if 'join_node' not in f]
            tables = set([(f["table"], f["table_alias"]) for f in info])
            join_nodes = [
                (f["table_alias"],
                 f["join"],
                 f["select_field"]) for f in info if f["join"] is not False]

            table_name = self.model_name.replace(".", "_")
            tools.drop_view_if_exists(self.env.cr, table_name)

            basic_fields = [
                ("t0.id", "id"),
                ("t0.write_uid", "write_uid"),
                ("t0.write_date", "write_date"),
                ("t0.create_uid", "create_uid"),
                ("t0.create_date", "create_date")
            ]

            q = """CREATE or REPLACE VIEW %s as (
                SELECT %s
                FROM  %s
                WHERE %s
                )""" % (table_name, ','.join(
                ["{} AS {}".format(f[0], f[1])
                 for f in basic_fields + fields]), ','.join(
                ["{} AS {}".format(t[0], t[1])
                 for t in list(tables)]), " AND ".join(
                ["{}.{} = {}.id".format(j[0], j[2], j[1])
                 for j in join_nodes] + ["TRUE"]))

            self.env.cr.execute(q)

        def _prepare_field(field_data):
            if not field_data["custom"]:
                field = self.env['ir.model.fields'].browse(field_data["id"])
                vals = {
                    "name": "x_" + field_data["name"],
                    "complete_name": field.complete_name,
                    'model': self.model_name,
                    'relation': field.relation,
                    "field_description": field_data.get(
                        "description", field.field_description),
                    "ttype": field.ttype,
                    "selection": field.selection,
                    "size": field.size,
                    'state': "manual"
                }
                if vals['ttype'] == 'monetary':
                    vals.update({'ttype': 'float'})
                if field.ttype == 'selection' and not field.selection:
                     model_obj = self.env[field.model_id.model]
                     selection = model_obj._fields[field.name].get_description(self.env)['selection']
                     selection_domain = str(selection)                     
                     vals.update({"selection": selection_domain})                     
                return vals

        def _prepare_object():
            return {
                'name': self.name,
                'model': self.model_name,
                'field_id': [
                    (0, 0, _prepare_field(field))
                    for field in json.loads(self.data)
                    if 'join_node' not in field]
            }

        def _build_object():
            res_id = self.env['ir.model'].sudo().create(_prepare_object())
            return res_id

        # read access
        def group_ids_with_access(model_name, access_mode):
            self.env.cr.execute('''SELECT
                  g.id
                FROM
                  ir_model_access a
                  JOIN ir_model m ON (a.model_id=m.id)
                  JOIN res_groups g ON (a.group_id=g.id)
                  LEFT JOIN ir_module_category c ON (c.id=g.category_id)
                WHERE
                  m.model=%s AND
                  a.active IS True AND
                  a.perm_''' + access_mode, (model_name,))
            return [x[0] for x in self.env.cr.fetchall()]

        def _build_access_rules(obj):
            info = json.loads(self.data)
            models = list(set([f["model"] for f in info]))
            read_groups = set.intersection(*[set(
                group_ids_with_access(model, 'read')) for model in models])

            for group in read_groups:
                self.env['ir.model.access'].sudo().create({
                    'name': 'read access to ' + self.model_name,
                    'model_id': obj.id,
                    'group_id': group,
                    'perm_read': True,
                })

            # edit access
            for group in self.group_ids:
                self.env['ir.model.access'].sudo().create({
                    'name': 'read access to ' + self.model_name,
                    'model_id': obj.id,
                    'group_id': group.id,
                    'perm_read': True,
                    'perm_write': True,
                })

            return

        self.model_name = "x_bve." + ''.join(
            [x for x in self.name.lower()
             if x.isalnum()]).replace("_", ".").replace(" ", ".")

        _build_query()
        obj = _build_object()
        _build_access_rules(obj)
        self.env.cr.commit()

        self.env.registry = RegistryManager.new(self.env.cr.dbname)
        RegistryManager.signal_registry_change(self.env.cr.dbname)
        #self.pool = self.env.registry

        ui_view_obj = self.env['ir.ui.view']
        view_ids = ui_view_obj.sudo().search([('model', '=', self.model_name)])

        [ui_view_obj.sudo().unlink()
         for view_id in view_ids]

        view_ids = []
        view_id = self.env['ir.ui.view'].sudo().create(            
            {'name': "Pivot Analysis",
             'type': 'pivot',
             'model': self.model_name,
             'priority': 16,
             'arch': """<?xml version="1.0"?>
                        <pivot string="Pivot Analysis"> {} </pivot>
                     """.format("".join(self._create_graph_view()))
             })
        view_ids.append(view_id)
        view_id = self.env['ir.ui.view'].sudo().create(            
            {'name': "Graph Analysis",
             'type': 'graph',
             'model': self.model_name,
             'priority': 16,
             'arch': """<?xml version="1.0"?>
                        <graph string="Graph Analysis"
                               type="bar"
                               stacked="True"> {} </graph>
                     """.format("".join(self._create_graph_view()))
             })
        view_ids.append(view_id)

        view_id = self.env['ir.ui.view'].sudo().create(            
            {'name': "Tree Analysis",
             'type': 'tree',
             'model': self.model_name,
             'priority': 16,
             'arch': """<?xml version="1.0"?>
                        <tree string="List Analysis" create="false"> {} </tree>
                     """.format("".join(self._create_tree_view()))
             })
        view_ids.append(view_id)

        action_vals = {'name': self.name,
                       'res_model': self.model_name,
                       'type': 'ir.actions.act_window',
                       'view_type': 'form',
                       'view_mode': 'tree,graph,pivot',
                       #'view_id': view_ids and view_ids[0] or 0,
                       'context': "{'service_name': '%s'}" % self.name,
                       }
        act_window = self.env['ir.actions.act_window']
        action_id = act_window.sudo().create(action_vals)

        self.write({
            'action_id': action_id.id,
            'view_id': view_id.id,
            'state': 'created'
        })

        return True

    @api.multi
    def open_view(self):
        return {
            'type': 'ir.actions.act_window',
            'res_model': self.model_name,
            'view_type': 'form',
            'view_mode': 'tree,graph,pivot',
        }
