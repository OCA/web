# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from openerp.tests.common import TransactionCase


class TestWebKanbanStage(TransactionCase):
    def test_default_res_model_no_params(self):
        '''It should return empty ir.model recordset if no params in context'''
        test_stage = self.env['web.kanban.stage'].with_context({})
        res_model = test_stage._default_res_model()

        self.assertFalse(res_model)
        self.assertEqual(res_model._name, 'ir.model')

    def test_default_res_model_no_action(self):
        '''It should return empty ir.model recordset if no action in params'''
        test_stage = self.env['web.kanban.stage'].with_context(params={})
        res_model = test_stage._default_res_model()

        self.assertFalse(res_model)
        self.assertEqual(res_model._name, 'ir.model')

    def test_default_res_model_info_in_context(self):
        '''It should return correct ir.model record if info in context'''
        test_action = self.env['ir.actions.act_window'].create({
            'name': 'Test Action',
            'res_model': 'res.users',
        })
        test_stage = self.env['web.kanban.stage'].with_context(
            params={'action': test_action.id},
        )

        self.assertEqual(
            test_stage._default_res_model(),
            self.env['ir.model'].search([('model', '=', 'res.users')])
        )

    def test_default_res_model_ignore_self(self):
        '''It should not return ir.model record corresponding to stage model'''
        test_action = self.env['ir.actions.act_window'].create({
            'name': 'Test Action',
            'res_model': 'web.kanban.stage',
        })
        test_stage = self.env['web.kanban.stage'].with_context(
            params={'action': test_action.id},
        )

        self.assertFalse(test_stage._default_res_model())
