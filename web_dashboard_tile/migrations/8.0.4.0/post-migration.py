# -*- coding: utf-8 -*-
# © 2016 Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html


def migrate(cr, version):
    if version is None:
        return

    # Update ir.rule
    cr.execute("""
        SELECT res_id FROM ir_model_data
        WHERE name = 'model_tile_rule'
        AND module = 'web_dashboard_tile'""")
    rule_id = cr.fetchone()[0]
    new_domain = """[
        "|",
        ("user_id","=",user.id),
        ("user_id","=",False),
        "|",
        ("group_ids","=",False),
        ("group_ids","in",[g.id for g in user.groups_id]),
        ]"""
    cr.execute("""
        UPDATE ir_rule SET domain_force = '%(domain)s'
        WHERE id = '%(id)s' """ % {'domain': new_domain, 'id': rule_id})
