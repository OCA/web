# Copyright 2024 Manuel Regidor <manuel.regidor@sygel.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


def migrate(cr, version):
    cr.execute(
        """
        update ir_model_data
        set name = 'web_field_tooltip.ir_model_fields_tooltip_list_view'
        where name = 'web_field_tooltip.ir_model_fields_tooltip_tree_view'
             and module = 'web_field_tooltip';
        """
    )
