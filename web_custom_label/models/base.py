# Copyright 2023 - today Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import api, models
from .common import set_custom_labels_on_fields


class Base(models.AbstractModel):

    _inherit = 'base'

    @api.model
    def fields_get(self, allfields=None, attributes=None):
        """Add the custom labels to the fields metadata.

        The method is used to query the fields metadata.
        This data is used by search filters / group by to display the field names.
        """
        fields = super().fields_get(allfields, attributes)
        lang = self.env.context.get('lang') or self.env.user.lang
        labels = self.env['web.custom.label'].get(self._name, lang)
        set_custom_labels_on_fields(labels, fields)
        return fields
