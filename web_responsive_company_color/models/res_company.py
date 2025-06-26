from odoo import models


class ResCompany(models.Model):
    _inherit = "res.company"

    # One need to reinstall web_responsive_company_color module
    # to see customization takes effect when new elements added
    # to _get_scss_template
    def _get_scss_template(self):
        uninstall_scss = self._context.get("uninstall_scss", False)
        if not uninstall_scss:
            return (
                super()._get_scss_template()
                + """
                .o_menu_apps .dropdown-menu {
                background: url('/web_responsive/static/img/home-menu-bg-overlay.svg'),
                  linear-gradient(
                    to bottom,
                    %(color_navbar_bg)s,
                    desaturate(lighten(%(color_navbar_bg)s, 20%%), 15)
                  );
                }
                """
            )
        else:
            return super()._get_scss_template()
