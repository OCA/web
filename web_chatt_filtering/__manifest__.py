##############################################################################
#
#    Copyright (c) Pesol (http://www.pesol.es)
#    All Right Reserved
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
    "name": "mail_chatt_filtering",
    "summary": """
        Extend the mail_chatt functionality to have filtering by author or by
         message content
    """,
    "category": "web",
    "author": "Pedro Gonzalez <pedro.gonzalez@pesol.es> ,"
    "Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "http://github.com/OCA/web",
    "version": "13.0.1.0.0",
    "depends": ["mail"],
    "data": ["views/templates.xml"],
    "qweb": ["static/src/xml/chatter.xml"],
}
