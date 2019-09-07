# Copyright 2019 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import base64
import time
from colorsys import rgb_to_hls, hls_to_rgb
from odoo import models, fields, api
from ..utils import image_to_rgb, convert_to_image, n_rgb_to_hex


URL_BASE = '/web_company_color/static/src/scss/'
URL_SCSS_GEN_TEMPLATE = URL_BASE + 'custom_colors.%d.%s.gen.scss'


class ResCompany(models.Model):
    _inherit = 'res.company'

    SCSS_TEMPLATE = """
        .o_main_navbar {
          background-color: %(color_navbar_bg)s !important;
          color: %(color_navbar_text)s !important;

          > .o_menu_brand {
            color: %(color_navbar_text)s !important;
            &:hover, &:focus, &:active, &:focus:active {
              background-color: %(color_navbar_bg_hover)s !important;
            }
          }

          .show {
            .dropdown-toggle {
              background-color: %(color_navbar_bg_hover)s !important;
            }
          }

          > ul {
            > li {
              > a, > label {
                color: %(color_navbar_text)s !important;

                &:hover, &:focus, &:active, &:focus:active {
                  background-color: %(color_navbar_bg_hover)s !important;
                }
              }
            }
          }
        }
    """

    company_colors = fields.Serialized()
    color_navbar_bg = fields.Char('Navbar Background Color',
                                  sparse='company_colors')
    color_navbar_bg_hover = fields.Char(
        'Navbar Background Color Hover', sparse='company_colors')
    color_navbar_text = fields.Char('Navbar Text Color',
                                    sparse='company_colors')
    scss_modif_timestamp = fields.Char('SCSS Modif. Timestamp')

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        records.scss_create_or_update_attachment()
        return records

    @api.multi
    def unlink(self):
        result = super().unlink()
        IrAttachmentObj = self.env['ir.attachment']
        for record in self:
            IrAttachmentObj.sudo().search([
                ('url', 'like', '%s%%' % record._scss_get_url_simplified()),
            ]).sudo().unlink()
        return result

    @api.multi
    def write(self, values):
        if not self.env.context.get('ignore_company_color', False):
            fields_to_check = ('color_navbar_bg',
                               'color_navbar_bg_hover',
                               'color_navbar_text')
            if 'logo' in values:
                if values['logo']:
                    _r, _g, _b = image_to_rgb(convert_to_image(values['logo']))
                    # Make color 10% darker
                    _h, _l, _s = rgb_to_hls(_r, _g, _b)
                    _l = max(0, _l - 0.1)
                    _rd, _gd, _bd = hls_to_rgb(_h, _l, _s)
                    # Calc. optimal text color (b/w)
                    # Grayscale human vision perception (Rec. 709 values)
                    _a = 1 - (0.2126 * _r + 0.7152 * _g + 0.0722 * _b)
                    values.update({
                        'color_navbar_bg': n_rgb_to_hex(_r, _g, _b),
                        'color_navbar_bg_hover': n_rgb_to_hex(_rd, _gd, _bd),
                        'color_navbar_text': '#000' if _a < 0.5 else '#fff',
                    })
                else:
                    values.update(self.default_get(fields_to_check))

            result = super().write(values)

            if any([field in values for field in fields_to_check]):
                self.scss_create_or_update_attachment()
        else:
            result = super().write(values)
        return result

    @api.multi
    def _scss_get_sanitized_values(self):
        self.ensure_one()
        # Clone company_color as dictionary to avoid ORM operations
        # This allow extend company_colors and only sanitize selected fields
        # or add custom values
        values = dict(self.company_colors or {})
        values.update({
            'color_navbar_bg': (values.get('color_navbar_bg')
                                or '$o-brand-odoo'),
            'color_navbar_bg_hover': (
                values.get('color_navbar_bg_hover')
                or '$o-navbar-inverse-link-hover-bg'),
            'color_navbar_text': (values.get('color_navbar_text') or '#FFF'),
        })
        return values

    @api.multi
    def _scss_generate_content(self):
        self.ensure_one()
        # ir.attachment need files with content to work
        if not self.company_colors:
            return "// No Web Company Color SCSS Content\n"
        return self.SCSS_TEMPLATE % self._scss_get_sanitized_values()

    # URL to scss related with this company, without timestamp
    # /web_company_color/static/src/scss/custom_colors.<company_id>
    def _scss_get_url_simplified(self):
        self.ensure_one()
        NTEMPLATE = '.'.join(URL_SCSS_GEN_TEMPLATE.split('.')[:2])
        return NTEMPLATE % self.id

    @api.multi
    def scss_get_url(self, timestamp=None):
        self.ensure_one()
        return URL_SCSS_GEN_TEMPLATE % (self.id,
                                        timestamp or self.scss_modif_timestamp)

    @api.multi
    def scss_create_or_update_attachment(self):
        IrAttachmentObj = self.env['ir.attachment']
        # The time window is 1 second
        # This mean that all modifications realized in that second will
        # have the same timestamp
        modif_timestamp = str(int(time.time()))
        for record in self:
            datas = base64.b64encode(
                record._scss_generate_content().encode('utf-8'))
            custom_attachment = IrAttachmentObj.sudo().search([
                ('url', 'like', '%s%%' % record._scss_get_url_simplified())
            ])
            custom_url = record.scss_get_url(timestamp=modif_timestamp)
            values = {
                'datas': datas,
                'url': custom_url,
                'name': custom_url,
                'datas_fname': custom_url.split("/")[-1],
            }
            if custom_attachment:
                custom_attachment.sudo().write(values)
            else:
                values.update({
                    'type': 'binary',
                    'mimetype': 'text/scss',
                })
                IrAttachmentObj.sudo().create(values)
        self.write({'scss_modif_timestamp': modif_timestamp})
        self.env['ir.qweb'].sudo().clear_caches()
