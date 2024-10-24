from odoo import models


class ResCompany(models.Model):
    _inherit = "res.company"

    def _get_scss_template(self):
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
