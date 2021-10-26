from openupgradelib import openupgrade


@openupgrade.migrate()
def migrate(env, version):
    group = env.ref("web_disable_export_group.group_export_data")
    new_group = env.ref("web_disable_export_group.group_export_xlsx_data")
    groups = env["res.groups"].search([("implied_ids", "=", group.id)])
    groups.write({"implied_ids": [(4, new_group.id)]})
    group.users.write({"groups_id": [(4, new_group.id)]})
