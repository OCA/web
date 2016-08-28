# coding: utf-8
# © 2016 David BEAL @ Akretion
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from lxml import etree

from openerp import models, api, fields
from openerp.osv import orm
from openerp import SUPERUSER_ID


class IrUiView(models.Model):
    _inherit = 'ir.ui.view'

    def _get_form_width(self):
        return [('oe_form_sheet_full_screen', 'Full Screen'), ]

    form_width = fields.Selection(
        string='Form Width', selection='_get_form_width',
        help="Allow to set the form view to the max width "
             "to have a better usability on data entry")


class ModelExtended(models.Model):
    _inherit = 'ir.model'

    def _css_class_to_apply(self, node, css_class):
        ''' Complete class if exist '''
        existing_class = [
            x[1] for x in node.items()
            if x[0] == 'class']
        if existing_class:
            css_class = '%s %s' % (
                css_class, existing_class[0])
        return css_class

    def _register_hook(self, cr, ids=None):

        def make_fields_view_get():

            @api.model
            def fields_view_get(self, view_id=None, view_type='form',
                                toolbar=False, submenu=False):
                # Perform standard fields_view_get
                res = fields_view_get.origin(
                    self, view_id=view_id, view_type=view_type,
                    toolbar=toolbar, submenu=submenu)
                # customize xml output
                if view_type == 'form' and res.get('view_id'):
                    view = self.env['ir.ui.view'].browse(res.get('view_id'))
                    if view.form_width:
                        doc = etree.XML(res['arch'])
                        node = doc.xpath('//sheet')
                        if node:
                            css_class = view.form_width
                            for current_node in node:
                                new_css = self._css_class_to_apply(
                                    current_node, css_class)
                                current_node.set('class', new_css)
                                orm.setup_modifiers(current_node)
                        res['arch'] = etree.tostring(doc, pretty_print=True)
                return res

            return fields_view_get

        if ids is None:
            ids = self.search(cr, SUPERUSER_ID, [])
        for model in self.browse(cr, SUPERUSER_ID, ids):
            Model = self.pool.get(model.model)
            if Model:
                Model._patch_method('fields_view_get', make_fields_view_get())
        return super(ModelExtended, self)._register_hook(cr)
