# Copyright 2017 - 2018 Modoolar <info@modoolar.com>
# License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

from odoo import api


class SyncerContext(object):
    def __init__(self, env, data=None):
        self._env = env
        self._data = data or {'notifications': {}, 'values': {}}

    def begin(self, records):
        if self.is_started():
            return
        self._data.update({
            'origin': {records._name: [r.id for r in records]},
            # 'values': {},
            'level': 0,
        })

    def is_started(self):
        return 'origin' in self._data

    @property
    def data(self):
        return self._data

    @property
    def origin(self):
        return self._data['origin']

    @property
    def values(self):
        return self._data['values']

    def update(self, record, values):
        self.values.setdefault(record._name, {}).setdefault(record.id, {})\
            .update(values)

    @property
    def records(self):
        records = []
        for res_model in self.values:
            for record_id, data in self.values[res_model].items():
                record = self._env[res_model].browse(record_id)
                indirect = not (record._name in self.origin and
                                record.id in self.origin[record._name]
                                )
                records.append((data, record, indirect))
        return records

    @property
    def level(self):
        return self._data['level']

    def level_up(self):
        self._data['level'] += 1

    def level_down(self):
        self._data['level'] -= 1

    @property
    def is_top_level(self):
        return self.level == 0

    @property
    def notifications(self):
        return self._data['notifications']

    @property
    def has_notifications(self):
        return len(self.notifications) > 0

    def push(self, notification):
        notif = self.notifications.setdefault(notification[0], {})\
                    .setdefault(notification[1][0], notification)

        if notification[1][1]['method'] in ['create', 'unlink']:
            notif[1][1]['method'] = notification[1][1]['method']

        notif[1][1]['data'].update(notification[1][1]['data'])

    def send(self):
        if self.has_notifications:
            notifications = []
            for model_header, data in self.notifications.items():
                for record_header, notification in data.items():
                    notifications.append(notification)

            self._data = {'notifications': {}, 'values': {}}
            self._env['bus.bus'].sendmany(notifications)


class SyncerEnvironment(api.Environment):
    def __new__(cls, cr, uid, context, syncer_data=None):
        new = super(SyncerEnvironment, cls).__new__(cls, cr, uid, context)
        new._syncer = SyncerContext(new, syncer_data)

        return new

    def __call__(self, cr=None, user=None, context=None):
        cr = self.cr if cr is None else cr
        uid = self.uid if user is None else int(user)
        context = self.context if context is None else context
        new = SyncerEnvironment(
            cr, uid, context, self.syncer and self.syncer.data or None
        )
        return new

    @property
    def syncer(self):
        return self._syncer


api.Environment = SyncerEnvironment
