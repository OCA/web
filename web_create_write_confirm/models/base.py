# (C) 2020 Smile (<https://www.smile.eu>)
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo import models


class BaseModel(models.AbstractModel):
    _inherit = "base"

    def get_message_informations(self, values=False):
        """
        This function gives us the possibility to know
        if we display the message or not
        - In create self is empty
        - In write self is not empty contains current ID
        :param values:
            - In create dictionary contains all recording
                information self is False
            - In write we find only values changed
        :type values: dict
        :return: return dict object popup.message
            (self.env['popup.message'].read())
        """
        return False

    def execute_processing(self, values=False):
        """
        This function gives us the possibility to execute a
            specific treatment after the confirmation of the message
        - In create self is empty
        - In write self is not empty contains current ID
        :param values : a list of dictionaries:
            {'name': field, 'value': value of field}
        :type dictionary list
        :return boolean
        """
        return False
