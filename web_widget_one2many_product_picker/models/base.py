# Copyright 2022 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
from odoo import _, api, models
from odoo.exceptions import ValidationError


class BaseModel(models.BaseModel):
    _inherit = "base"

    @api.model_create_multi
    def create(self, vals_list):
        """Avoid create lines that have a product currently used when use the product
        picker"""
        relation = self.env.context.get("product_picker_relation")
        if relation == self._name and len(vals_list):
            product_field = self.env.context.get("product_picker_product_field")
            product_ids = [
                values[product_field] for values in vals_list if product_field in values
            ]
            if len(product_ids) != len(set(product_ids)):
                raise ValidationError(
                    _("Can't create the %s: Duplicated product! (Inside query)")
                    % relation
                )
            relation_field = self.env.context.get("product_picker_relation_field")
            # All records have the same 'relation id' when created with the product
            # picker
            relation_id = vals_list[0][relation_field]
            has_product = (
                self.search(
                    [
                        (relation_field, "=", relation_id),
                        (product_field, "in", product_ids),
                    ],
                    count=True,
                    limit=1,
                )
                != 0
            )
            if has_product:
                raise ValidationError(
                    _("Can't create the %s: Duplicated product! (Already in database)")
                    % relation
                )
        return super().create(vals_list)

    def write(self, values):
        """Avoid write lines that have a product currently used when use the product
        picker"""
        relation = self.env.context.get("product_picker_relation")
        product_field = self.env.context.get("product_picker_product_field")
        if relation == self._name and product_field in values:
            relation_field = self.env.context.get("product_picker_relation_field")
            relation_id = (
                values[relation_field]
                if relation_field in values
                else self.get(relation_field)
            )
            product_id = values[product_field]
            has_product = (
                self.search(
                    [
                        (relation_field, "=", relation_id),
                        (product_field, "=", product_id),
                    ],
                    count=True,
                    limit=1,
                )
                != 0
            )
            if has_product:
                raise ValidationError(
                    _("Can't write the %s: Duplicated product! (Already in database)")
                    % relation
                )
        return super().write(values)
