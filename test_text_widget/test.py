from openerp import models, fields


class test(models.Model):

    _name = "test.model"
    text_field = fields.Text("TEST")