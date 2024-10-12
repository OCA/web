from odoo import fields


class MapField(fields.Field):
    """
    Custom field to store the location of a record.

    The field stores the location as a string in the format 'lat,lng'.
    """

    type = "char"
    column_type = ("varchar", "varchar")


# Monkey patch the fields module to add the Map field.
fields.Map = MapField
