# -*- coding: utf-8 -*-
##############################################################################
#
#    Author: Guewen Baconnier
#    Copyright 2014 Camptocamp SA
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
    'name': 'Web Send Message as Popup',
    'version': '1.0',
    'author': "Camptocamp,Odoo Community Association (OCA)",
    'maintainer': 'Camptocamp',
    'license': 'AGPL-3',
    'category': 'Hidden',
    'depends': ['web'],
    'description': """
Web Send Message as Popup
=========================

In the email/notes threads below the form views, the link 'Send a
message' unfold a text field. From there, a button allows to open the
text field in a full featured email popup with the subject, templates,
attachments and followers.

This module changes the link 'Send a message' so it opens directly the
full featured popup instead of the text field, avoiding an extra click
if the popup is always wanted.""",
    'website': 'http://www.camptocamp.com',
    'qweb': ['static/src/xml/mail.xml'],
    'installable': True,
    'auto_install': False,
}
