# Copyright 2019 Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, fields


class ResUsers(models.Model):
    _inherit = 'res.users'

    view_transition_mode = fields.Selection([
        ('scale-back-top', 'Scale (Back-Top)'),
        ('scale-top-back', 'Scale (Top-Back)'),
        ('skew', 'Skew'),
        ('translate-left-right', 'Translate (Left-Right)'),
        ('translate-right-left', 'Translate (Right-Left)'),
        ('translate-top-down', 'Translate (Top-Down)'),
        ('translate-down-top', 'Translate (Down-Top)'),
        ('fade-in', 'Fade-In'),
        ('circle-in', 'Circle-In'),
        ('rotate-x-3d', 'Rotate X Top (3D)'),
        ('rotate-y-3d', 'Rotate Y (3D)'),
        ('rotate-x-2d', 'Rotate X'),
    ], string="View Transition Mode")

    def __init__(self, pool, cr):
        """ Override of __init__ to add access rights.
        Access rights are disabled by default, but allowed on some specific
        fields defined in self.SELF_{READ/WRITE}ABLE_FIELDS.
        """
        super().__init__(pool, cr)
        # duplicate list to avoid modifying the original reference
        type(self).SELF_WRITEABLE_FIELDS = list(self.SELF_WRITEABLE_FIELDS)
        type(self).SELF_WRITEABLE_FIELDS.extend(['view_transition_mode'])
        # duplicate list to avoid modifying the original reference
        type(self).SELF_READABLE_FIELDS = list(self.SELF_READABLE_FIELDS)
        type(self).SELF_READABLE_FIELDS.extend(['view_transition_mode'])
