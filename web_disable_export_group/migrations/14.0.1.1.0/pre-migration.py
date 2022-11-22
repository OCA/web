from openupgradelib import openupgrade


@openupgrade.migrate()
def migrate(env, version):
    # Otherwise, the migration already happened on 13.0
    if not env.ref("web_disable_export_group.group_export_xlsx_data", False):
        openupgrade.rename_xmlids(
            env.cr,
            [
                (
                    "web_disable_export_group.group_export_data",
                    "web_disable_export_group.group_export_xlsx_data",
                )
            ],
        )
