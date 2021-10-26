from openupgradelib import openupgrade


def add_new_group_from_group(self, env, group, new_group):
    groups = env["res.groups"].search([("implied_ids", "=", group.id)])
    groups.write({"implied_ids": [(4, new_group.id)]})
    group.users.write({"groups_id": [(4, new_group.id)]})


@openupgrade.migrate()
def migrate(env, version):
    group = env.ref("web_disable_export_group.group_export_data")
    new_group = env.ref("web_disable_export_group.group_export_xlsx_data")
    add_new_group_from_group(env, group, new_group)
    group = env.ref("base.group_allow_export")
    add_new_group_from_group(env, group, new_group)
