# coding: utf-8
# © 2015 David BEAL @ Akretion <david.beal@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from openerp import api, models, fields


class ErpHelp(models.AbstractModel):
    _name = 'erp.help'

    enduser_help = fields.Html(
        string="End User Help",
        help="Use this field to add custom content for documentation purpose\n"
             "mainly by power users ")
    advanced_help = fields.Text(
        string="Advanced Help", groups='base.group_no_one',
        help="Use this field to add custom content for documentation purpose\n"
             "mainly by developers or consultants")


class IrModel(models.Model):
    _inherit = ['ir.model', 'erp.help']
    _name = 'ir.model'


class IrModuleModule(models.Model):
    _inherit = 'ir.module.module'

    @api.multi
    def module_uninstall(self):
        if self.name != 'help_popup':
            domain = ['|',
                      ('advanced_help', 'like', '%' + self.name + '%'),
                      ('advanced_help_model', 'like', '%' + self.name + '%')]
            actions = self.env['ir.actions.act_window'].search(domain)
            for record in actions:
                record.with_context(
                    help_uninstall=True).remove_obsolete_help(self.name)
        return super(IrModuleModule, self).module_uninstall()
