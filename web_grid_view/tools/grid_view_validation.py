# Copyright 2026 Domatix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tools import view_validation


@view_validation.validate("grid")
def schema_grid(arch, **kwargs):
    """Validate grid view arch against the RNG schema."""
    return True


@view_validation.validate("grid")
def valid_field_types(arch, **kwargs):
    """Check field type constraints in grid view arch."""
    col_count = measure_count = readonly_count = 0
    for el in arch.xpath("//field"):
        ftype = el.get("type", "")
        if ftype == "col":
            col_count += 1
        elif ftype == "measure":
            measure_count += 1
        elif ftype == "readonly":
            readonly_count += 1
    errors = []
    if col_count != 1:
        errors.append('Grid view must have exactly one <field type="col">')
    if measure_count != 1:
        errors.append('Grid view must have exactly one <field type="measure">')
    if readonly_count > 1:
        errors.append('Grid view must have at most one <field type="readonly">')
    if errors:
        raise view_validation.ValidationError("\n".join(errors))
    return True
