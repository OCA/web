# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2012-2015 Therp BV (<http://therp.nl>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
{
    "name": "Support branding",
    "summary": "Adds your branding to an Odoo instance",
    "category": "Dependecy/Hidden",
    "version": "2.0",
    "license": "AGPL-3",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "website": 'http://therp.nl',
    "description": """Support branding
================

If you run an Odoo support company and you support customers without an OPW,
you can brand the Odoo instance accordingly using this module. This module will
add a line `Supported by $yourcompany` in the menu footer and add a button to
mail exception messages to your support email address.


Configuration
=============

This module is controlled by config parameters:

support_branding.company_name
    Your company's name

support_branding.company_url
    Your company's website

support_branding.company_color
    The color to show your company's name in (CSS syntax)

support_branding.support_email
    The (optional) mailaddress to contact for support

support_branding.release
    The (optional) version number of your deployment

You probably want to depend on this module in your customer specific module and
add the following XML::

  <record id="support_branding.config_parameter_company_name"
          model="ir.config_parameter">
      <field name="value">Your company</field>
  </record>
  <record id="support_branding.config_parameter_company_url"
          model="ir.config_parameter">
      <field name="value">https://yourwebsite.com</field>
  </record>
  <record id="support_branding.config_parameter_company_color"
          model="ir.config_parameter">
      <field name="value">#000</field>
  </record>
  <record id="support_branding.config_parameter_support_email"
          model="ir.config_parameter">
      <field name="value">support@yourwebsite.com</field>
  </record>
  <record id="support_branding.config_parameter_support_email"
          model="ir.config_parameter">
      <field name="value">support@yourwebsite.com</field>
  </record>
  <record id="config_parameter_release" model="ir.config_parameter">
      <field name="value">42</field>
  </record>Configuration

Note that the email button is only visible if you configure an email address,
the default is empty!""",
    "depends": [
        'web',
    ],
    "qweb": [
        'static/src/xml/base.xml',
    ],
    "js": [
        'static/src/js/support_branding.js',
    ],
    "css": [
        'static/src/css/support_branding.css',
    ],
    "data": [
        "data/ir_config_parameter.xml",
    ],
}
