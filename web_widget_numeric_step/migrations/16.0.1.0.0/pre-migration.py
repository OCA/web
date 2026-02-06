# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openupgradelib import openupgrade


@openupgrade.migrate()
def migrate(env, version):
    """
    Remove the obsolete demo view from v13/v14/v15 that references non-existing
    credit_limit on res.users. In v16, web_widget_numeric_step no longer has this demo,
    and credit_limit is on res.partner.
    """
    # Remove by xmlid if it exists
    openupgrade.delete_records_safely_by_xml_id(
        env, ["web_widget_numeric_step.view_users_form"], delete_childs=True
    )
