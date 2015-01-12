# -*- coding: utf-8 -*-
##############################################################################
#
#    Authors: Laurent Mignon
#    Copyright (c) 2015 Acsone SA/NV (http://www.acsone.eu)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published
#    by the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
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
    'name': 'Website blog Management',
    'version': '1.0',
    'author': 'ACSONE SA/NV',
    'maintainer': 'ACSONE SA/NV',
    'website': 'http://www.acsone.eu',
    'category': 'Website',
    'depends': [
        'website_blog',
    ],
    'description': """
Website blog management
=======================
The module adds a new field to 'blog.post': website_publication_date.
The publication date is used to preserve the order in which posts are listed in
the web site when clicking on the menu 'News'. The same order is used in
the navigation between posts.
The publication date is filled when a post is published. It's also possible to
specify a specific value in the back-end. If the specified date is in the past,
the post is set to published, if the date is in the future the post will be
automatically published at the given date by a scheduled task.
   """,
    'data': [
        'data/website_blog_mgmt_data.xml',
        'views/website_blog_views.xml'
    ],
    'installable': True,
    'auto_install': False,
    'post_init_hook': 'post_init',
}
