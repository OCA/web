from openupgradelib import openupgrade


@openupgrade.migrate()
def migrate(env, version):
    openupgrade.rename_xmlids(
        env.cr,
        [
            (
                "web_disable_export_group.group_export_data",
                "web_disable_export_group.group_export_xlsx_data",
            )
        ],
    )
