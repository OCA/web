# © 2018 Iván Todorovich <ivan.todorovich@gmail.com>
# © 2019-Today GRAP
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import api, fields, models


class TileCategory(models.Model):
    _name = "tile.category"
    _description = "Dashboard Tile Category"
    _order = "sequence asc"

    name = fields.Char(required=True)

    sequence = fields.Integer(required=True, default=10)

    active = fields.Boolean(default=True)

    action_id = fields.Many2one(
        string='Odoo Action', comodel_name='ir.actions.act_window',
        readonly=True)

    menu_id = fields.Many2one(
        string='Odoo Menu', comodel_name='ir.ui.menu', readonly=True)

    tile_ids = fields.One2many(
        string='Tiles', comodel_name='tile.tile',
        inverse_name='category_id')

    tile_qty = fields.Integer(
        string='Tiles Quantity',
        compute='_compute_tile_qty',
        store=True,
    )

    @api.depends('tile_ids')
    def _compute_tile_qty(self):
        for category in self:
            category.tile_qty = len(category.tile_ids)

    def _prepare_action(self):
        self.ensure_one()
        return {
            'name': self.name,
            'res_model': 'tile.tile',
            'type': 'ir.actions.act_window',
            'view_mode': 'kanban',
            'domain': """[
                ('hidden', '=', False),
                '|', ('user_id', '=', False), ('user_id', '=', uid),
                ('category_id', '=', {self.id})
            ]""".format(self=self),
        }

    def _prepare_menu(self):
        self.ensure_one()
        return {
            'name': self.name,
            'parent_id': self.env.ref(
                'web_dashboard_tile.menu_dashboard_tile').id,
            'action': 'ir.actions.act_window,%d' % self.action_id.id,
            'sequence': self.sequence,
        }

    def _create_ui(self):
        IrUiMenu = self.env['ir.ui.menu']
        IrActionsActWindows = self.env['ir.actions.act_window']
        for category in self:
            if not category.action_id:
                category.action_id = IrActionsActWindows.create(
                    category._prepare_action())
            if not category.menu_id:
                category.menu_id = IrUiMenu.create(category._prepare_menu())

    def _delete_ui(self):
        for category in self:
            if category.menu_id:
                category.menu_id.unlink()
            if category.action_id:
                category.action_id.unlink()

    @api.model
    def create(self, vals):
        category = super().create(vals)
        if category.active:
            category._create_ui()
        return category

    def write(self, vals):
        res = super().write(vals)
        if 'active' in vals.keys():
            if vals.get('active'):
                self._create_ui()
            else:
                self._delete_ui()
        if 'sequence' in vals.keys():
            self.mapped('menu_id').write({'sequence': vals['sequence']})
        if 'name' in vals.keys():
            self.mapped('menu_id').write({'name': vals['name']})
            self.mapped('action_id').write({'name': vals['name']})
        return res

    def unlink(self):
        self._delete_ui()
        super().unlink()
