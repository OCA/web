from odoo import fields, models


class PartnerDetail(models.AbstractModel):
    """Link of the teacher / student tables to res.partner"""

    _name = "partner.detail"
    _inherit = "sub.form.child"
    _description = "Partner Detail"
    _link_field = "partner_id"

    partner_id = fields.Many2one(
        "res.partner", required=True, index=True, ondelete="cascade"
    )


class PartnerTeacher(models.Model):
    _name = "partner.teacher"
    _inherit = "partner.detail"
    _description = "Teacher Partner"

    subject = fields.Char()
    hire_date = fields.Date()
    contract = fields.Selection(
        [("permanent", "Permanent"), ("temporary", "Temporary")]
    )
    full_time = fields.Boolean()
    hours = fields.Integer()
    currency_id = fields.Many2one(
        "res.currency", default=lambda self: self.env.company.currency_id
    )
    salary = fields.Monetary()
    course_ids = fields.One2many("partner.course", "teacher_id")
    tag_ids = fields.Many2many("res.partner.category")
    bio = fields.Html()


class PartnerCourse(models.Model):
    _name = "partner.course"
    _description = "Teacher Course"

    teacher_id = fields.Many2one("partner.teacher", required=True, ondelete="cascade")
    name = fields.Char(required=True)
    hours = fields.Integer()


class PartnerStudent(models.Model):
    _name = "partner.student"
    _inherit = "partner.detail"
    _description = "Student Partner"

    level = fields.Char()
    enrollment_date = fields.Date()
    last_visit = fields.Datetime()
    average = fields.Float(digits=(4, 2))
    tutor_id = fields.Many2one("res.partner")
    note = fields.Text()
    photo = fields.Image(max_width=256, max_height=256)
    document = fields.Binary(attachment=True)
    document_name = fields.Char()
