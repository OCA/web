# coding: utf-8
##############################################################################
#
#    Odoo, Open Source Management Solution
#    Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
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

from openerp.http import Controller, route, request


class MyController(Controller):
    @route([
        "/help/<int:action_id>",
    ], type='http', auth="public")
    def handler(self, action_id, *args, **kwargs):
        req = request.session.model('ir.actions.act_window')
        return 'blabla %s db %s' % (action_id, req)

    def _get_html_tpl(self):
        return """<html>
  <head>
    <title>{{title}}</title>
    {{head}}
  </head>
  <body>
    <h1>{{h1}}</h1>
{{body}}
  </body>
</html>"""
