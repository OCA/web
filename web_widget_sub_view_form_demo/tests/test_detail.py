from odoo.exceptions import ValidationError
from odoo.tests import Form, TransactionCase


class TestDetail(TransactionCase):
    def test_no_type(self):
        partner = self.env["res.partner"].create({"name": "Nobody"})
        self.assertFalse(partner.detail_ref)

    def test_switch_type(self):
        partner = self.env["res.partner"].create({"name": "Ann", "kind": "teacher"})
        teacher = partner.detail_ref
        self.assertEqual(teacher._name, "partner.teacher")
        partner.kind = "student"
        self.assertEqual(partner.detail_ref._name, "partner.student")
        # the previous detail is kept as an orphan...
        self.assertTrue(teacher.exists())
        # ...and found again when switching back
        partner.kind = "teacher"
        self.assertEqual(partner.detail_ref, teacher)
        partner.kind = False
        self.assertFalse(partner.detail_ref)

    def test_kind_mismatch(self):
        partner = self.env["res.partner"].create({"name": "Ann", "kind": "teacher"})
        with self.assertRaises(ValidationError):
            self.env["partner.student"].create({"partner_id": partner.id})

    def test_form_onchange(self):
        partner = self.env["res.partner"].create({"name": "Bob", "kind": "student"})
        student = partner.detail_ref
        with Form(partner) as form:
            form.kind = "teacher"
            # not created before saving
            self.assertFalse(form.detail_ref)
            form.kind = "student"
            self.assertEqual(form.detail_ref, f"partner.student,{student.id}")

    def test_teacher_form(self):
        partner = self.env["res.partner"].create({"name": "Ann", "kind": "teacher"})
        tag = self.env["res.partner.category"].create({"name": "Tag"})
        with Form(partner.detail_ref) as form:
            form.subject = "Maths"
            form.contract = "temporary"
            form.full_time = True
            form.hours = 18
            form.salary = 2500
            form.tag_ids.add(tag)
            form.bio = "<p>Bio</p>"
            with form.course_ids.new() as course:
                course.name = "Algebra"
                course.hours = 4
        teacher = partner.detail_ref
        self.assertEqual(teacher.salary, 2500)
        self.assertEqual(teacher.tag_ids, tag)
        self.assertEqual(teacher.course_ids.name, "Algebra")

    def test_student_form(self):
        partner = self.env["res.partner"].create({"name": "Bob", "kind": "student"})
        with Form(partner.detail_ref) as form:
            form.level = "L1"
            form.average = 12.5
            form.tutor_id = partner
            form.note = "Note"
            form.document = "aGVsbG8="
        student = partner.detail_ref
        self.assertEqual(student.average, 12.5)
        self.assertEqual(student.tutor_id, partner)
        self.assertTrue(student.document)
