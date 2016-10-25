# -*- coding: utf-8 -*-
# © initOS GmbH 2014
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from openerp.osv import orm, fields
import re


def remove_html_tags(data):
    p = re.compile(r'<.*?>')
    return p.sub('', data)


def remove_extra_spaces(data):
    p = re.compile(r'\s+')
    return p.sub(' ', data)


def _type_selection(self, *args, **kwargs):
    """Redirect for easier overwriting."""
    return self.pool.get('web.note').type_selection(*args, **kwargs)


class WebNote(orm.Model):
    _name = 'web.note'

    def name_get(self, cr, uid, ids, context=None):
        if context is None:
            context = {}
        if isinstance(ids, (int, long)):
            ids = [ids]
        res = []
        for record in self.browse(cr, uid, ids, context=context):
            name = remove_extra_spaces(remove_html_tags(record.message or ''))

            res.append((record.id, name))
        return res

    def _name_get_fnc(self, cr, uid, ids, prop, unknow_none, context=None):
        res = self.name_get(cr, uid, ids, context=context)
        return dict(res)

    def type_selection(self, cr, uid, context=None):
        return (('private', 'private'),
                ('internal', 'internal'),
                ('external', 'external'))

    def onchange_container_id(self, cr, uid, ids,
                              container_id=False, message=None, context=None):
        result = {}
        if container_id:
            container = self.pool.get('web.note.container').\
                browse(cr, uid, container_id, context=context)
            result['value'] = {
                'sequence':
                    container.sequence or self._defaults.get('sequence', 0),
                }
            if container.pattern:
                result['value']['message'] = container.pattern
        return result

    _order = 'sequence,create_date'

    _columns = {
        'type': fields.selection(_type_selection, 'Note type', required=True),
        'message': fields.html('Message'),
        'display_name':
            fields.function(_name_get_fnc,
                            type="char", string='Note', store=False),
        'container_id': fields.many2one('web.note.container', 'Note-Container',
                                        help='Containers include '
                                        'templates for order and heading.'),
        'sequence': fields.integer('Order in report'),
        'create_uid': fields.many2one('res.users', 'User', readonly=True),
    }

    _defaults = {
        'sequence': 10,
    }


class WebNoteContainer(orm.Model):
    _name = 'web.note.container'
    _description = 'Note Container'

    _order = 'type, sequence'

    _columns = {
        'name': fields.char('Name', required=True,),
        'sequence': fields.integer('Order in report'),
        'type': fields.selection(_type_selection, 'Report', required=True),
        'pattern': fields.html('Template',
                               help='If you select the container the '
                               'template is added to the note.')
    }

    _defaults = {
        'sequence': 10,
    }
