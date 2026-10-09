# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models


class DiagramNavHelp(models.TransientModel):
    _name = "web.diagram.nav.help"
    _description = "Diagram Navigation Help"

    content_html = fields.Html(sanitize=False)

    @api.model
    def create_nav_help_action(self):
        lang = (self.env.lang or self.env.user.lang or "en_US").lower()
        is_fr = lang.startswith("fr")
        title = "Conseils de navigation" if is_fr else "Navigation Tips"
        rec = self.create({"content_html": self._get_help_html(is_fr)})
        return {
            "type": "ir.actions.act_window",
            "name": title,
            "res_model": "web.diagram.nav.help",
            "res_id": rec.id,
            "view_mode": "form",
            "target": "new",
            "views": [(False, "form")],
        }

    @staticmethod
    def _get_help_html(is_fr=False):
        if is_fr:
            return (
                '<div style="font-size:0.9em;line-height:1.6;">'
                '<div class="card mb-3 border-0 bg-light rounded p-3">'
                '<h5 class="mb-2"><i class="fa fa-mouse-pointer me-2 text-primary"></i>Avec une souris</h5>'
                '<ul class="mb-0">'
                "<li><strong>Zoom&nbsp;:</strong> molette de la souris pour zoomer/dézoomer.</li>"
                "<li><strong>Déplacement&nbsp;:</strong> cliquez et faites glisser pour vous déplacer.</li>"
                "<li><strong>Tout afficher&nbsp;:</strong> appuyez sur <kbd>F</kbd> pour afficher l'intégralité du diagramme.</li>"
                "</ul>"
                "</div>"
                '<div class="card mb-3 border-0 bg-light rounded p-3">'
                '<h5 class="mb-2"><i class="fa fa-keyboard-o me-2 text-primary"></i>Sans souris (clavier)</h5>'
                '<ul class="mb-0">'
                "<li><strong>Zoom&nbsp;:</strong> touches <kbd>+</kbd> / <kbd>-</kbd>.</li>"
                "<li><strong>Déplacement&nbsp;:</strong> flèches directionnelles.</li>"
                "<li><strong>Tout afficher&nbsp;:</strong> appuyez sur <kbd>F</kbd>.</li>"
                "</ul>"
                "</div>"
                '<div class="card border-0 bg-light rounded p-3">'
                '<h5 class="mb-2"><i class="fa fa-info-circle me-2 text-info"></i>Autres conseils</h5>'
                '<ul class="mb-0">'
                "<li>Les n&oelig;uds sans lien sont regroup&eacute;s dans une grille s&eacute;par&eacute;e en bas de page.</li>"
                "<li>Pour plus d'informations, retournez &agrave; la page pr&eacute;c&eacute;dente et cliquez sur <strong>&laquo;&nbsp;Comment &ccedil;a marche&nbsp;?&nbsp;&raquo;</strong>.</li>"
                "</ul>"
                "</div>"
                "</div>"
            )
        return (
            '<div style="font-size:0.9em;line-height:1.6;">'
            '<div class="card mb-3 border-0 bg-light rounded p-3">'
            '<h5 class="mb-2"><i class="fa fa-mouse-pointer me-2 text-primary"></i>With a mouse</h5>'
            '<ul class="mb-0">'
            "<li><strong>Zoom:</strong> scroll wheel to zoom in/out.</li>"
            "<li><strong>Pan:</strong> click and drag to move around.</li>"
            "<li><strong>Fit all:</strong> press <kbd>F</kbd> to fit the full diagram in view.</li>"
            "</ul>"
            "</div>"
            '<div class="card mb-3 border-0 bg-light rounded p-3">'
            '<h5 class="mb-2"><i class="fa fa-keyboard-o me-2 text-primary"></i>Without a mouse (keyboard)</h5>'
            '<ul class="mb-0">'
            "<li><strong>Zoom:</strong> <kbd>+</kbd> / <kbd>-</kbd> keys.</li>"
            "<li><strong>Pan:</strong> arrow keys to move around.</li>"
            "<li><strong>Fit all:</strong> press <kbd>F</kbd>.</li>"
            "</ul>"
            "</div>"
            '<div class="card border-0 bg-light rounded p-3">'
            '<h5 class="mb-2"><i class="fa fa-info-circle me-2 text-info"></i>Other tips</h5>'
            '<ul class="mb-0">'
            "<li>Nodes with no links are grouped in a separate grid at the bottom.</li>"
            "<li>For more info, go back to the previous page and click <strong>&ldquo;How does it work?&rdquo;</strong>.</li>"
            "</ul>"
            "</div>"
            "</div>"
        )
