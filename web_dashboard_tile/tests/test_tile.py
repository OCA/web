# -*- coding: utf-8 -*-
# © 2016 Antonio Espinosa - <antonio.espinosa@tecnativa.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.tests.common import TransactionCase


class TestTile(TransactionCase):
    def test_tile(self):
        tile_obj = self.env['tile.tile']
        model_id = self.env['ir.model'].search([
            ('model', '=', 'tile.tile')])
        field_id = self.env['ir.model.fields'].search([
            ('model_id', '=', model_id.id),
            ('name', '=', 'sequence')])
        self.tile1 = tile_obj.create({
            'name': 'Count / Sum',
            'sequence': 1,
            'model_id': model_id.id,
            'domain': "[('model_id', '=', %d)]" % model_id.id,
            'secondary_function': 'sum',
            'secondary_field_id': field_id.id})
        self.tile2 = tile_obj.create({
            'name': 'Min / Max',
            'sequence': 2,
            'model_id': model_id.id,
            'domain': "[('model_id', '=', %d)]" % model_id.id,
            'primary_function': 'min',
            'primary_field_id': field_id.id,
            'secondary_function': 'max',
            'secondary_field_id': field_id.id})
        self.tile3 = tile_obj.create({
            'name': 'Avg / Median',
            'sequence': 3,
            'model_id': model_id.id,
            'domain': "[('model_id', '=', %d)]" % model_id.id,
            'primary_function': 'avg',
            'primary_field_id': field_id.id,
            'secondary_function': 'median',
            'secondary_field_id': field_id.id})
        # count
        self.assertEqual(self.tile1.primary_value, '3')
        # sum
        self.assertEqual(self.tile1.secondary_value, '6')
        # min
        self.assertEqual(self.tile2.primary_value, '1')
        # max
        self.assertEqual(self.tile2.secondary_value, '3')
        # average
        self.assertEqual(self.tile3.primary_value, '2')
        # median
        self.assertEqual(self.tile3.secondary_value, '2.0')
