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
        $o-community-color: %(primary_color)s; 
        $o-required-color: %(required_color)s;

        $o-brand-odoo: $o-community-color;
        $o-brand-primary: $o-community-color;

        $o-main-text-color: %(primary_text_color)s;
        $o-required-text-color: %(required_text_color)s;
    """
    
    company_colors = fields.Serialized()
    primary_color = fields.Char(sparse='company_colors')
    primary_text_color = fields.Char(sparse='company_colors')
    required_color = fields.Char(sparse='company_colors')
    required_text_color = fields.Char(sparse='company_colors')

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
            fields_to_check = ('primary_color',
                               'primary_text_color',
                               'required_color',
                               'required_text_color')
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
                        'required_color': n_rgb_to_hex(_r, _g, _b),
                        'primary_color': n_rgb_to_hex(_rd, _gd, _bd),
                        'primary_text_color': '#4c4c4c' if _a < 0.5 
                                                else '#fff',
                        'required_text_color': '#4c4c4c' if _a < 0.5 
                                                else '#fff',
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
            'required_color': (values.get('required_color') or '#D2D2FF'),
            'primary_color': (values.get('primary_color') or '#7C7BAD'),
            'primary_text_color': (values.get('primary_text_color') 
                                    or '#4c4c4c'),
            'required_text_color': (values.get('required_text_color') 
                                    or '#4c4c4c'),
        })
        return values

    @api.multi
    def _scss_generate_content(self):
        self.ensure_one()
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
        