# Copyright 2017 - 2018 Modoolar <info@modoolar.com>
# License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

from odoo import models, api, exceptions, _


def is_module_installed(env, module_name):
    return module_name in env.registry._init_modules


class Base(models.AbstractModel):
    _inherit = 'base'

    # Following attributes are here so that
    # we can accumulate changes of computed fields,
    # because those fields trigger write function multiple times
    _implements_syncer = False

    # If this field is set to True,
    # then syncer notification would contain entire record,
    # by default it will return vals
    _sync_entire = False

    # Global map for related fields stored by root field
    _syncer_related_fields = {}

    # Local list of One2Many "satellite" models
    _syncer_satellites = []

    @classmethod
    def _build_model_attributes(cls, pool):
        super(Base, cls)._build_model_attributes(pool)
        cls._syncer_related_fields = {}
        cls._syncer_satellites = []

    @api.model
    def _setup_base(cls):
        super(Base, cls)._setup_base()

        if not cls._implements_syncer:
            return

        for field_name in cls._fields:
            field = cls._fields[field_name]
            if field.related:
                cls._register_syncer_related_field(field)

            elif field.type in ['one2many', 'many2many']:
                cls._register_x2m_field(field)

    def _register_x2m_field(cls, field):
        model = {
            'model': cls._name,
            'field_name': field.name,
            'type': field.type,
            'attrs': field._attrs,
        }

        if field.type == 'one2many':
            if field._attrs.get('syncer', False) and \
                    isinstance(field._attrs['syncer'], (dict,)):
                model['inverse_name'] = field._attrs['syncer']['inverse_names']
            else:
                model['inverse_name'] = [field.inverse_name]
        elif field.type == 'many2many':
            comodel = cls.env[field.comodel_name]

            def field_filter(field_name):
                f = comodel._fields[field_name]
                return f.type == 'many2many' and f.comodel_name == cls._name

            # If there is no other side or there is more than one
            # then we can't process notifications
            inverse_field = list(filter(field_filter, comodel._fields))
            if len(inverse_field) == 0 or len(inverse_field) > 1:
                return
            model['inverse_field'] = inverse_field[0]

        cls.env[field.comodel_name]._syncer_satellites.append(model)

    def _register_syncer_related_field(cls, field):
        root = field.related.split('.')[0]
        names = cls._syncer_related_fields.get(root, [])
        names.append(field.name)
        cls._syncer_related_fields[root] = names

    @api.multi
    def _write(self, vals):
        if is_module_installed(self.env, "web_syncer") and \
                self._implements_syncer:
            for record in self:
                self.env.syncer.update(record, vals)
        return super(Base, self)._write(vals)

    @api.multi
    def write(self, vals):
        if not is_module_installed(self.env, "web_syncer"):
            return super(Base, self).write(vals)

        # We always process m2x notifications
        self.process_x2m_notifications_before_write(vals)

        # In case current model does not implements syncer
        # we just call base write
        if not self._implements_syncer:
            return super(Base, self).write(vals)

        self.env.syncer.begin(self)

        for record in self:
            self.env.syncer.update(record, vals)

        self.env.syncer.level_up()
        ret = super(Base, self).write(vals)
        self.env.syncer.level_down()

        if self.env.syncer.is_top_level:
            for delta, record, indirect in self.env.syncer.records:
                record.push_write_notification(delta, indirect)

        self.process_x2m_notifications(vals)
        return ret

    @api.model
    @api.returns('self', lambda value: value.id)
    def create(self, vals):
        new = super(Base, self).create(vals)
        if is_module_installed(self.env, 'web_syncer'):
            self.env.syncer.begin(self)

            if new._implements_syncer:
                new.push_create_notification()

            new.process_x2m_notifications(vals)

            if self.env.syncer.is_top_level:
                for delta, record, indirect in self.env.syncer.records:
                    record.push_write_notification(delta, indirect)
        return new

    @api.multi
    def unlink(self):
        if is_module_installed(self.env, "web_syncer") and \
                self._implements_syncer:
            for rec in self:
                rec.push_unlink_notification()
        return super(Base, self).unlink()

    def process_x2m_notifications(self, vals):
        if not self._syncer_satellites:
            return

        def is_fake_one2many(fn):
            return self._fields[fn].type == 'integer' and fn == 'res_id'

        def is_fake_one2many_for_model(model, rec):
            for field_name in ['res_model', 'model']:
                if field_name in rec and rec[field_name] == model:
                    return True
            return False

        for x2m_field in self._syncer_satellites:
            model = x2m_field['model']
            field_name = x2m_field['field_name']

            if x2m_field['type'] == 'one2many':
                for rec in self:
                    for inverse_name in x2m_field['inverse_name']:

                        # Special case for fake one2many field
                        #  (i.e. ir.attachments)
                        if is_fake_one2many(inverse_name):
                            if not is_fake_one2many_for_model(model, rec):
                                continue
                            record = self.env[model].browse(
                                rec[inverse_name]
                            ).sudo()
                        else:
                            record = rec[inverse_name].sudo()
                        if not record:
                            continue
                        self.push_indirect_notification(model, record.id, {
                            'method': 'write',
                            'record_name': record.name_get()[0][1],
                            'data': {field_name: record[field_name].ids},
                        })

            elif x2m_field['type'] == 'many2many':
                for rec in self:
                    for record in rec[x2m_field['inverse_field']].sudo():
                        self.push_indirect_notification(model, record.id, {
                            'method': 'write',
                            'record_name': record.name_get()[0][1],
                            'data': {field_name: record[field_name].ids},
                        })

    def process_x2m_notifications_before_write(self, vals):
        for x2m_field in self._syncer_satellites:
            if x2m_field['type'] != 'one2many':
                continue

            def is_fake_one2many(fn):
                return self._fields[fn].type == 'integer' and fn == 'res_id'

            def is_fake_one2many_for_model(model, rec):
                for field_name in ['res_model', 'model']:
                    if field_name in rec and rec[field_name] == model:
                        return True
                return False

            processed = {}
            for inverse_name in x2m_field['inverse_name']:
                if inverse_name not in vals:
                    continue

                record_id = vals[inverse_name]
                if not record_id:
                    continue

                model = x2m_field['model']
                field_name = x2m_field['field_name']

                if not isinstance(record_id, int):
                    record = record_id.sudo()
                else:
                    record = self.env[model].with_context(
                        prefetch_fields=[field_name]
                    ).browse(record_id).sudo()

                for rec in self:

                    # Special case for fake one2many field
                    #  (i.e. ir.attachments)
                    if is_fake_one2many(inverse_name):
                        if not is_fake_one2many_for_model(model, rec):
                            continue
                        original = self.env[model].browse(
                            rec[inverse_name]
                        ).sudo()
                    else:
                        original = rec[inverse_name].sudo()

                    if not original:
                        continue

                    # Parent has changed and we need to notify previous parent
                    if original.id != record.id:
                        ids = original[field_name].ids
                        key = (original.id, model)

                        item = processed.setdefault(key, [original, list(ids)])
                        if rec.id in item[1]:
                            item[1].remove(rec.id)

                    for key, item in processed.items():
                        self.push_indirect_notification(model, item[0].id, {
                            'method': 'write',
                            'record_name': item[0].name_get()[0][1],
                            'data': {field_name: item[1]},
                        })

    def push_create_notification(self):
        self.push_record_notification("create", entire=True)

    def push_write_notification(self, delta, indirect):
        self.push_record_notification("write", delta=delta, indirect=indirect)

    def push_unlink_notification(self):
        self.push_record_notification("unlink", {}, entire=False)

        for x2m_field in self._syncer_satellites:
            if x2m_field['type'] != 'one2many':
                continue
            processed = {}

            for inverse_name in x2m_field['inverse_name']:
                record = self[inverse_name]
                if not record:
                    continue
                model = x2m_field['model']
                ids = record[x2m_field['field_name']].ids
                key = (record.id, model)

                item = processed.setdefault(key, [record, list(ids)])
                item[1].remove(self.id)

            for key, item in processed.items():
                self.push_indirect_notification(model, item[0].id, {
                    'method': 'write',
                    'record_name': item[0].name_get()[0][1],
                    'data': {x2m_field['field_name']: item[1]},
                })

    def push_record_notification(self, method, delta=False, entire=False,
                                 indirect=False):
        self.ensure_one()

        entire = entire or self._sync_entire
        self.push_notification(self._name, self.id, entire, indirect, {
            "method": method,
            "record_name": self.name,
            "__last_update": self.write_date,
            "data": self._format_values(
                self,
                entire and self.sudo().read()[0] or delta, not entire
            ),
        })

    def push_indirect_notification(self, res_model, res_id, message):
        self.push_notification(res_model, res_id, False, True, message)

    def push_notification(self, res_model, res_id, entire, indirect, message):
        message.update(
            dict(indirect=indirect, entire=entire, user_id=self.prepare_user())
        )
        self.env.syncer.push([
            self.generate_channel_name(res_model),
            self.prepare_sync_message(message, res_model, res_id)
        ])

    @api.model
    def prepare_user(self):
        return {
            "id": self.env.user.id,
            "name": self.env.user.name,
            "__last_update": self.env.user.write_date
        }

    @api.model
    def prepare_sync_message(self, message, res_model=None, record_id=None):
        return [
            (self._cr.dbname, res_model or self._name, record_id or self.id),
            message
        ]

    @api.model
    def generate_channel_name(self, res_model=None):
        return self._cr.dbname + ":" + res_model or self._name

    @api.model
    def _format_values(self, record, vals, update_related_fields=False):
        if len(record) == 0:
            raise exceptions.ValidationError(
                _("Write must be called on recordset with at least one record")
            )
        single_record = record if len(record) == 1 else record[0]
        ret_val = vals.copy()

        # Update all related fields
        if update_related_fields:
            related_fields = []

            for field_name in vals:
                rv = self._syncer_related_fields.get(field_name, [])
                related_fields.extend(rv)

            if related_fields:
                related_values = record.sudo().read(related_fields)
                ret_val.update(related_values[0])

        keys = ret_val.keys()
        for fn in list(keys):
            f_type = record._fields[fn].type

            if f_type == 'one2many':
                del ret_val[fn]

            elif f_type == 'many2one':
                value = single_record[fn]
                ret_val[fn] = value and [value.id, value.name] or False

            elif f_type == 'many2many':
                value = single_record[fn]
                ret_val[fn] = value and value.ids or []
        return ret_val
