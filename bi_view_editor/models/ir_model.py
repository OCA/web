# -*- coding: utf-8 -*-
# © 2015-2016 ONESTEiN BV (<http://www.onestein.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, api
from odoo.modules.registry import RegistryManager
from odoo.models import LOG_ACCESS_COLUMNS

NO_BI_MODELS = [
    "temp.range",
    "account.statement.operation.template",
    "fetchmail.server"
]

NO_BI_FIELDS = [
    "id",
    "create_uid",
    "create_date",
    "write_uid",
    "write_date"
]


def dict_for_field(field):
    return {
        "id": field.id,
        "name": field.name,
        "description": field.field_description,
        "type": field.ttype,
        "relation": field.relation,
        "custom": False,

        "model_id": field.model_id.id,
        "model": field.model_id.model,
        "model_name": field.model_id.name
    }


def dict_for_model(model):
    return {
        "id": model.id,
        "name": model.name,
        "model": model.model
    }


class IrModel(models.Model):
    _inherit = 'ir.model'

    def _filter_bi_fields(self, ir_model_field_obj):
        name = ir_model_field_obj.name
        if name in LOG_ACCESS_COLUMNS:
            return False
        model = ir_model_field_obj.model_id
        model_name = model.model        
        if name in self.env[model_name]._fields:
            f = self.env[model_name]._fields[name]
            return f.store            
        return False

    @api.model
    def _filter_bi_models(self, model):
        model_name = model["model"]
        if model_name in NO_BI_MODELS or \
                model_name.startswith("workflow") or \
                model_name.startswith("ir.") or \
                model["name"] == "Unknow" or \
                "report" in model_name or \
                model_name.startswith("base_") or \
                "_" in model_name or \
                "." in model["name"] or \
                "mail" in model_name or \
                "edi." in model_name:
            return False
        return self.env['ir.model.access'].check(
            model["model"], 'read', False)

    @api.model
    def get_related_fields(self, model_ids):
        """ Return list of field dicts for all fields that can be
            joined with models in model_ids
        """
        model_names = dict([(model.id, model.model)
                            for model in self.env['ir.model'].sudo().search(
            [('id', 'in', model_ids.values())])])
        filter_bi_fields = self._filter_bi_fields
        if filter_bi_fields:
            rfields = [
                dict(dict_for_field(field),
                     join_node=-1,
                     table_alias=model[0])
                for field in filter(
                    filter_bi_fields,
                    self.env['ir.model.fields'].sudo().search(
                        [('model_id', 'in', model_ids.values()),
                         ('ttype', 'in', ['many2one'])]))
                for model in model_ids.items()
                if model[1] == field.model_id.id
            ]

            lfields = [
                dict(dict_for_field(field),
                     join_node=model[0],
                     table_alias=-1)
                for field in filter(
                    filter_bi_fields,
                    self.env['ir.model.fields'].sudo().search(
                        [('relation', 'in', model_names.values()),
                         ('ttype', 'in', ['many2one'])]))
                for model in model_ids.items()
                if model_names[model[1]] == field['relation']
            ]

        return [dict(field, join_node=model[0])
                for field in lfields
                if model_names[model[1]] == field['relation']] + [
            dict(field, table_alias=model[0])
            for model in model_ids.items()
            for field in rfields if model[1] == field['model_id']]

    @api.model
    def get_related_models(self, model_ids):
        """ Return list of model dicts for all models that can be
            joined with models in model_ids
        """
        related_fields = self.get_related_fields(model_ids)
        return sorted(filter(
            self._filter_bi_models,
            [{"id": model.id, "name": model.name, "model": model.model}
             for model in self.env['ir.model'].sudo().search(
                ['|',
                 ('id', 'in', model_ids.values() + [
                     f['model_id']
                     for f in related_fields if f['table_alias'] == -1]),
                 ('model', 'in', [
                     f['relation']
                     for f in related_fields if f['join_node'] == -1])])]),
            key=lambda x: x['name'])

    @api.model
    def get_models(self):
        """ Return list of model dicts for all available models.
        """
        models_domain = [('transient', '=', False)]
        return sorted(filter(
            self._filter_bi_models,
            [dict_for_model(model)
                for model in self.search(models_domain)]),
            key=lambda x: x['name'])

    @api.model
    def get_join_nodes(self, field_data, new_field):
        """ Return list of field dicts of join nodes

            Return all possible join nodes to add new_field to the query
            containing model_ids.
        """
        model_ids = dict([(field['table_alias'],
                           field['model_id']) for field in field_data])
        keys = [(field['table_alias'], field['id'])
                for field in field_data if field.get('join_node', -1) != -1]
        join_nodes = ([{'table_alias': alias}
                       for alias, model_id in model_ids.items()
                       if model_id == new_field['model_id']] + [
            d for d in self.get_related_fields(model_ids)
            if (d['relation'] == new_field['model'] and
                d['join_node'] == -1) or
            (d['model_id'] == new_field['model_id'] and
             d['table_alias'] == -1)])
        return filter(
            lambda x: 'id' not in x or
                      (x['table_alias'], x['id']) not in keys, join_nodes)

    @api.model
    def get_fields(self, model_id):
        bi_field_domain = [
            ('model_id', '=', model_id),
            ("name", "not in", NO_BI_FIELDS),
            ('ttype', 'not in', [
                'many2many', "one2many", "html", "binary", "reference"])
        ]
        filter_bi_fields = self._filter_bi_fields
        fields_obj = self.env['ir.model.fields']
        fields = filter(filter_bi_fields,
                        fields_obj.sudo().search(bi_field_domain))
        return sorted([{"id": field.id,
                        "model_id": model_id,
                        "name": field.name,
                        "description": field.field_description,
                        "type": field.ttype,
                        "custom": False,
                        "model": field.model_id.model,
                        "model_name": field.model_id.name}
                       for field in fields], key=lambda x: x['description'],
                      reverse=True)

    @api.model
    def create(self, vals):
        context = self.env.context
        if context is None:
            context = {}
        if context and context.get('bve'):
            vals['state'] = 'base'
        res = super(IrModel, self).create(vals)
        if vals.get('state', 'base') == 'bve':
            vals['state'] = 'manual'

            # add model in registry
            #self.instanciate(cr, user, vals['model'], context)
            #self.pool.setup_models(cr, partial=(not self.pool.ready))
            self.env.setup_models(self.env.cr, partial=(not self.pool.ready))

            RegistryManager.signal_registry_change(self.env.cr.dbname)

        # Following commented line (write method) is not working anymore
        # as in Odoo V9 a new orm constraint is restricting the modification
        # of the state while updating ir.model
        # self.write(cr, user, [res], {'state': 'manual'})
        q = ("""UPDATE ir_model SET state = 'manual'
               WHERE id = """ + str(res.id))

        self.env.cr.execute(q)

        return res
