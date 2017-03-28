# -*- coding: utf-8 -*-
# Copyright 2017 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from openerp.tests.common import TransactionCase


class TestDarkroomModal(TransactionCase):

    def test_default_res_model_id_model_in_context(self):
        """Should return correct ir.model record when context has model name"""
        active_model = 'res.users'
        test_model = self.env['darkroom.modal'].with_context({
            'active_model': active_model,
        })
        test_result = test_model._default_res_model_id()

        expected = self.env['ir.model'].search([('model', '=', active_model)])
        self.assertEqual(test_result, expected)

    def test_default_res_model_id_no_valid_info_in_context(self):
        """Should return empty ir.model recordset when missing/invalid info"""
        test_model = self.env['darkroom.modal'].with_context({})
        test_result = test_model._default_res_model_id()

        self.assertEqual(test_result, self.env['ir.model'])

    def test_default_res_record_id_id_in_context(self):
        """Should return correct value when ID in context"""
        active_record_id = 5
        test_model = self.env['darkroom.modal'].with_context({
            'active_record_id': active_record_id,
        })
        test_result = test_model._default_res_record_id()

        self.assertEqual(test_result, active_record_id)

    def test_default_res_record_id_no_id_in_context(self):
        """Should return 0 when no ID in context"""
        test_model = self.env['darkroom.modal'].with_context({})
        test_result = test_model._default_res_record_id()

        self.assertEqual(test_result, 0)

    def test_default_res_record_model_and_id_in_context(self):
        """Should return correct record when context has model name and ID"""
        active_model = 'res.users'
        active_record_id = 1
        test_model = self.env['darkroom.modal'].with_context({
            'active_model': active_model,
            'active_record_id': active_record_id,
        })
        test_result = test_model._default_res_record()

        expected = self.env[active_model].browse(active_record_id)
        self.assertEqual(test_result, expected)

    def test_default_res_record_model_but_no_id_in_context(self):
        """Should return right empty recordset if model but no ID in context"""
        active_model = 'res.users'
        test_model = self.env['darkroom.modal'].with_context({
            'active_model': active_model,
        })
        test_result = test_model._default_res_record()

        self.assertEqual(test_result, self.env[active_model])

    def test_default_res_record_no_valid_model_info_in_context(self):
        """Should return None if context has missing/invalid model info"""
        active_model = 'bad.model.name'
        test_model = self.env['darkroom.modal'].with_context({
            'active_model': active_model,
        })
        test_result = test_model._default_res_record()

        self.assertIsNone(test_result)

    def test_default_res_field_id_model_and_field_in_context(self):
        """Should return correct ir.model.fields record when info in context"""
        active_model = 'res.users'
        active_field = 'name'
        test_model = self.env['darkroom.modal'].with_context({
            'active_model': active_model,
            'active_field': active_field,
        })
        test_result = test_model._default_res_field_id()

        self.assertEqual(test_result.name, active_field)
        self.assertEqual(test_result.model_id.model, active_model)

    def test_default_res_field_id_no_valid_field_in_context(self):
        """Should return empty recordset if field info missing/invalid"""
        active_model = 'res.users'
        active_field = 'totally.not.a.real.field.name'
        test_model = self.env['darkroom.modal'].with_context({
            'active_model': active_model,
            'active_field': active_field,
        })
        test_result = test_model._default_res_field_id()

        self.assertEqual(test_result, self.env['ir.model.fields'])

    def test_default_res_field_id_no_valid_model_in_context(self):
        """Should return empty recordset if model info missing/invalid"""
        active_field = 'name'
        test_model = self.env['darkroom.modal'].with_context({
            'active_field': active_field,
        })
        test_result = test_model._default_res_field_id()

        self.assertEqual(test_result, self.env['ir.model.fields'])

    def test_default_image_all_info_in_context(self):
        """Should return value of correct field if all info in context"""
        active_model = 'res.users'
        active_record_id = 1
        active_field = 'name'
        test_model = self.env['darkroom.modal'].with_context({
            'active_model': active_model,
            'active_record_id': active_record_id,
            'active_field': active_field,
        })
        test_result = test_model._default_image()

        expected = self.env[active_model].browse(active_record_id).name
        self.assertEqual(test_result, expected)

    def test_default_image_no_valid_field_in_context(self):
        """Should return None if missing/invalid field info in context"""
        active_model = 'res.users'
        active_record_id = 1
        test_model = self.env['darkroom.modal'].with_context({
            'active_model': active_model,
            'active_record_id': active_record_id,
        })
        test_result = test_model._default_image()

        self.assertIsNone(test_result)

    def test_default_image_no_valid_id_in_context(self):
        """Should return False/None if missing/invalid record ID in context"""
        active_model = 'res.users'
        active_field = 'name'
        test_model = self.env['darkroom.modal'].with_context({
            'active_model': active_model,
            'active_field': active_field,
        })
        test_result = test_model._default_image()

        self.assertFalse(test_result)

    def test_default_image_no_valid_model_in_context(self):
        """Should return None if missing/invalid model info in context"""
        active_record_id = 1
        active_field = 'name'
        test_model = self.env['darkroom.modal'].with_context({
            'active_record_id': active_record_id,
            'active_field': active_field,
        })
        test_result = test_model._default_image()

        self.assertIsNone(test_result)

    def test_action_save_record_count_in_self(self):
        """Should raise correct error if not called on recordset of 1"""
        test_wizard = self.env['darkroom.modal'].with_context({
            'active_model': 'res.users',
            'active_record_id': 1,
            'active_field': 'name',
        }).create({})
        test_wizard_set = test_wizard + test_wizard.copy()

        with self.assertRaises(ValueError):
            self.env['darkroom.modal'].action_save()
        with self.assertRaises(ValueError):
            test_wizard_set.action_save()

    def test_action_save_update_source(self):
        """Should update source record correctly"""
        active_model = 'res.users'
        active_record_id = 1
        test_wizard = self.env['darkroom.modal'].with_context({
            'active_model': active_model,
            'active_record_id': active_record_id,
            'active_field': 'name',
        }).create({})
        test_name = 'Test Name'
        test_wizard.image = test_name
        test_wizard.action_save()

        result = self.env[active_model].browse(active_record_id).name
        self.assertEqual(result, test_name)

    def test_action_save_return_action(self):
        """Should return correct action"""
        test_wizard = self.env['darkroom.modal'].with_context({
            'active_model': 'res.users',
            'active_record_id': 1,
            'active_field': 'name',
        }).create({})
        test_value = test_wizard.action_save()

        self.assertEqual(test_value, {'type': 'ir.actions.act_window_close'})
