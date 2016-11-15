# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.tests.common import TransactionCase


class TestWebKanbanAbstract(TransactionCase):
    def setUp(self):
        super(TestWebKanbanAbstract, self).setUp()
        self.test_model = self.env['web.kanban.abstract.tester'].create({})

        test_model_type = self.env['ir.model'].search([
            ('model', '=', 'web.kanban.abstract.tester'),
        ])
        self.test_stage_1 = self.env['web.kanban.stage'].create({
            'name': 'Test Stage 1',
            'res_model': test_model_type.id,
        })
        self.test_stage_2 = self.env['web.kanban.stage'].create({
            'name': 'Test Stage 2',
            'res_model': test_model_type.id,
            'fold': True,
        })

    def test_read_group_stage_ids_base_case(self):
        '''It should return a structure with the proper content'''
        id_1 = self.test_stage_1.id
        id_2 = self.test_stage_2.id

        self.assertEqual(
            self.test_model._read_group_stage_ids(),
            (
                [(id_1, 'Test Stage 1'), (id_2, 'Test Stage 2')],
                {id_1: False, id_2: True},
            )
        )

    def test_read_group_stage_ids_correct_associated_model(self):
        '''It should only return info for stages with right associated model'''
        id_1 = self.test_stage_1.id
        id_2 = self.test_stage_2.id

        stage_model = self.env['ir.model'].search([
            ('model', '=', 'web.kanban.stage'),
        ])
        self.env['web.kanban.stage'].create({
            'name': 'Test Stage 3',
            'res_model': stage_model.id,
        })

        self.assertEqual(
            self.test_model._read_group_stage_ids(),
            (
                [(id_1, 'Test Stage 1'), (id_2, 'Test Stage 2')],
                {id_1: False, id_2: True},
            )
        )
