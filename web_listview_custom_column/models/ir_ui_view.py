# -*- coding: utf-8 -*-
# © 2017 Therp BV <http://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from lxml import etree
from openerp import _, api, models


class IrUiView(models.Model):
    _inherit = 'ir.ui.view'

    @api.multi
    def custom_column(self, diff):
        """Apply a change for a custom view. Create a new custom view or
        view override as necessary"""
        import pudb
        pudb.set_trace()
        self.ensure_one()
        tree = etree.fromstring(self.read_combined(self.id)['arch'])
        customized_view = self.env.ref(
            self._custom_column_xmlid(diff), raise_if_not_found=False
        ) or self.browse([])
        if diff['operation'] == 'add':
            etree.SubElement(tree, 'field', {'name': diff['name']})
        elif diff['operation'] == 'remove':
            for element in tree:
                if element.attrib['name'] == diff['name'] and\
                        element.tag == 'field':
                    tree.remove(element)
        elif diff['operation'] == 'left':
            for element in tree:
                if element.attrib['name'] == diff['name'] and\
                        element.tag == 'field' and\
                        element.getprevious() is not None:
                    element.getprevious().addprevious(element)
                    break
        elif diff['operation'] == 'right':
            for element in tree:
                if element.attrib['name'] == diff['name'] and\
                        element.tag == 'field' and\
                        element.getnext() is not None:
                    element.getnext().addnext(element)
                    break
        elif diff['operation'] == 'reset':
            customized_view.unlink()
            return []
        elif diff['operation'] == 'to_user':
            diff['type'] = 'user'
            customized_view = self.env.ref(
                self._custom_column_xmlid(diff), raise_if_not_found=False
            ) or self.browse([])
        elif diff['operation'] == 'to_all':
            customized_view.unlink()
            diff['type'] = 'all'
            customized_view = self.env.ref(
                self._custom_column_xmlid(diff), raise_if_not_found=False
            ) or self.browse([])
        else:
            raise NotImplementedError(
                'Unknown operation %s' % diff['operation']
            )

        replacement = etree.Element('tree', {'position': 'replace'})
        replacement.append(tree)
        arch = etree.tostring(replacement, pretty_print=True)
        if customized_view:
            customized_view.write({'arch': arch})
        else:
            customized_view = self._custom_column_create_view(diff, arch)
        return customized_view.id

    @api.multi
    def custom_column_desc(self):
        """Return metadata necessary for UI"""
        self.ensure_one()
        return {
            'fields': self.env[self.model].fields_get(),
            'type': bool(self.env.ref(
                self._custom_column_xmlid({'type': 'user'}),
                raise_if_not_found=False
            )) and 'user' or bool(self.env.ref(
                self._custom_column_xmlid({'type': 'all'}),
                raise_if_not_found=False
            )) and 'all' or 'user',
        }

    @api.multi
    def _custom_column_xmlid(self, diff, qualify=True):
        """Return an xmlid for the view of a type of customization"""
        self.ensure_one()
        customization_type = diff['type']
        return '%scustom_view_%d_%s%s' % (
            qualify and 'web_listview_custom_column.' or '',
            self.id,
            customization_type,
            '_%d' % self.env.uid if customization_type == 'user' else '',
        )

    @api.multi
    def _custom_column_create_view(self, diff, arch):
        """Actually create a view for customization"""
        self.ensure_one()
        values = self.copy_data(default={
            'name': _('%s customized') % self.name,
            'arch': arch,
            'inherit_id': self.id,
            'mode': 'extension',
            'priority': 10000 + (diff['type'] == 'user' and 1 or 0),
            'user_ids': [(4, self.env.uid)] if diff['type'] == 'user' else [],
        })[0]
        result = self.create(values)
        self.env['ir.model.data'].create({
            'name': self._custom_column_xmlid(diff, qualify=False),
            'module': 'web_listview_custom_column',
            'model': self._name,
            'res_id': result.id,
            'noupdate': True,
        })
        return result

    @api.multi
    def _check_xml(self):
        """Don't validate our custom views, this will break in init mode"""
        if self.env.registry._init:
            self = self.filtered(
                lambda x: not x.xml_id or not x.xml_id.startswith(
                    'web_listview_custom_column.custom_view_'
                )
            )
        return super(IrUiView, self)._check_xml()

    _constraints = [(_check_xml, 'Invalid view definition', ['arch'])]

    @api.model
    def get_inheriting_views_arch(self, view_id, model):
        """Don't apply our view inheritance in init mode for the same reason"""
        return [
            (arch, view_id_)
            for arch, view_id_ in
            super(IrUiView, self).get_inheriting_views_arch(view_id, model)
            if not self.env.registry._init or
            not self.sudo().browse(view_id_).xml_id or
            not self.sudo().browse(view_id_).xml_id.startswith(
                'web_listview_custom_column.custom_view_'
            )
        ]
