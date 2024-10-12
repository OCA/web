from odoo import fields


class MapField(fields.Field):
    """
    Custom field to store the location of a record.

    The field stores the location as a string in the format 'lat,lng'.
    """

    type = "char"
    column_type = ("varchar", "varchar")

    def convert_to_record(self, value, record, validate=True):
        """
        Converts the value to a valid value for the record.
        If is not valid, returns "0.0,0.0".
        """
        try:
            float(value.split(",")[0])
            float(value.split(",")[1])
        except ValueError:
            value = "0.0,0.0"
        return value

    def convert_to_export(self, value, record):
        """
        Converts a value from the database to a format suitable for export.
        """
        return value or None

    def convert_to_cache(self, value, record, validate=True):
        """
        Converts a value from the database to a format suitable for the cache.
        """
        return value or None

    def convert_to_column(self, value, record, validate=True):
        """
        Converts a value to a format suitable for the column.
        """
        return value or None

    def _get_attrs(self, model_class, name):
        """
        Get the attributes of the field.
        """
        res = super()._get_attrs(model_class, name)
        res["type"] = "text"
        return res

    def get_location(self, field_name, model, id):
        """
        Get the location of the record.
        """
        record = self.env[model].browse(id)
        return record[field_name]


# Monkey patch the fields module to add the Map field.
fields.Map = MapField
