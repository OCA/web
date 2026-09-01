from odoo import models


class ResCompany(models.Model):
    _inherit = "res.company"

    # For customizations of new web elements included
    # under _get_scss_template to take effect, one need
    # to handle migration to invoke post_init_hook()
    def _get_scss_template(self):
        uninstall_scss = self._context.get("uninstall_scss", False)
        if not uninstall_scss:
            return (
                super()._get_scss_template()
                + """
.app-menu-container {
    background: url('/web_responsive/static/src/img/home-menu-bg-overlay.svg'),
        linear-gradient(
            to bottom,
            %(color_navbar_bg)s,
            desaturate(lighten(%(color_navbar_bg)s, 20%%), 15)
        );
}
        """
            )
        return super()._get_scss_template()
