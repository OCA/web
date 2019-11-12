# Copyright 2019 Brainbean Apps (https://brainbeanapps.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class WebWidgetDropdownDynamicExample(models.TransientModel):
    _name = 'web.widget.dropdown.dynamic.example'
    _description = 'Web Widget Dropdown Dynamic Example'

    name = fields.Char(
        default='Web Widget Dropdown Dynamic Example',
        required=True,
    )

    char_field_options = fields.Text(
        string='Char field options',
        default=(
            'Option A\n'
            'Option B\n'
            'Option C\n'
        ),
    )
    char_field = fields.Char(
        string='Char field',
    )

    int_field_min = fields.Integer(
        string='Int field (min)',
        default=0,
    )
    int_field_max = fields.Integer(
        string='Int field (max)',
        default=9,
    )
    int_field = fields.Integer(
        string='Int field',
    )

    selection_field_options = fields.Text(
        string='Selection field options',
        default=(
            'Option A\n'
            'Option B\n'
            'Option C\n'
            'Option D\n'
        ),
    )
    selection_field = fields.Char(
        string='Selection field',
        selection=[
            ('Option A', 'Option A'),
            ('Option B', 'Option B'),
            ('Option C', 'Option C'),
        ]
    )

    @api.model
    def values_char_field(self):
        options = self.env.context.get('options').strip().split('\n')
        return list(map(
            lambda option: (option, option),
            filter(
                lambda option: bool(option),
                options
            )
        ))

    @api.model
    def values_int_field(self):
        min_value = int(self.env.context.get('min'))
        max_value = int(self.env.context.get('max'))
        options = []
        for value in range(min_value, max_value + 1):
            options.append((value, str(value)))
        return options

    @api.model
    def values_selection_field(self):
        options = self.env.context.get('options').strip().split('\n')
        return list(map(
            lambda option: (option, option),
            filter(
                lambda option: bool(option),
                options
            )
        ))
