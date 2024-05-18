# Copyright 2022 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
from odoo import _, api, models
from odoo.exceptions import ValidationError


class BaseModel(models.BaseModel):
    _inherit = "base"

    @api.model
    def _check_product_picker_duplicated_products(self, vals_list):
        relation = self.env.context.get("product_picker_relation")
        if relation != self._name or not len(vals_list):
            return
        product_field = self.env.context.get("product_picker_product_field")
        product_ids = [
            values[product_field] for values in vals_list if product_field in values
        ]
        num_products = len(product_ids)
        if not num_products:
            return
        elif num_products != len(set(product_ids)):
            raise ValidationError(
                _("Can't create the %s: Duplicated product! (Inside query)") % relation
            )
        relation_field = self.env.context.get("product_picker_relation_field")
        # All records have the same 'relation id' when created with the product picker
        relation_id = vals_list[0][relation_field]
        # When write maybe need get the value from the record
        if not relation_id:
            field_obj = self[relation_field]
            if field_obj:
                relation_id = relation_id.id
        db_sol = self.search(
            [
                (relation_field, "=", relation_id),
                (product_field, "in", product_ids),
            ],
            limit=1,
        )
        if db_sol:
            raise ValidationError(
                _("Can't create the %s: Duplicated product (%s)! (Already in database)")
                % (relation, db_sol[product_field].display_name)
            )

    @api.model_create_multi
    def create(self, vals_list):
        """
        Avoid create lines that have a product currently used
        when use the product picker
        """
        self._check_product_picker_duplicated_products(vals_list)
        return super().create(vals_list)

    def write(self, values):
        """
        Avoid write lines that have a product currently used
        when use the product picker
        """
        self._check_product_picker_duplicated_products([values])
        return super().write(values)
