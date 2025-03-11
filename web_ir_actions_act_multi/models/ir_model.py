from odoo import api, models


class IrModelData(models.Model):
    _inherit = "ir.model.data"

    @api.model
    def _module_data_uninstall(self, modules_to_remove):
        # Set a flag to prevent the deletion of tables and columns
        # related to ir.actions.act_multi.
        if "web_ir_actions_act_multi" in modules_to_remove:
            self = self.with_context(uninstall_web_ir_actions_act_multi=True)
        return super(IrModelData, self)._module_data_uninstall(modules_to_remove)


class IrModel(models.Model):
    _inherit = "ir.model"

    def _drop_table(self):
        # Prevent the deletion of the table.
        # The model is ir.actions.act_multi, but the actual table is ir_actions.
        # This table is a core component and should not be removed.
        if self.env.context.get("uninstall_web_ir_actions_act_multi"):
            self -= self.filtered(lambda model: model.model == "ir.actions.act_multi")
        return super()._drop_table()


class IrModelFields(models.Model):
    _inherit = "ir.model.fields"

    def _drop_column(self):
        # Prevent the deletion of columns in the ir_actions table.
        # The model is ir.actions.act_multi, but the actual table is ir_actions.
        # Since this table is a core component, its columns should not be deleted.
        if self.env.context.get("uninstall_web_ir_actions_act_multi"):
            self -= self.filtered(lambda field: field.model == "ir.actions.act_multi")
        return super()._drop_column()
