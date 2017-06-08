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

import datetime
from openerp.addons.website_blog.tests.common import TestWebsiteBlogCommon
from openerp import fields
import time


class TestWebsiteBlogFlow(TestWebsiteBlogCommon):

    def setUp(self):
        super(TestWebsiteBlogFlow, self).setUp()
        self.blog_blog_obj = self.env['blog.blog']
        self.blog_post_obj = self.env['blog.post']
        # Create a new blog
        self.test_blog = self.blog_blog_obj.sudo(
            self.user_blogmanager).create({
                'name': 'New Blog',
                'description': 'Presentation of new Odoo features'
            })
        # Create a first post
        self.test_blog_post_1 = self.blog_post_obj.sudo(
            self.user_blogmanager).create({
                'name': 'New Post 1',
                'blog_id': self.test_blog.id,
            })
        # Create a second post
        self.test_blog_post_2 = self.blog_post_obj.sudo(
            self.user_blogmanager).create({
                'name': 'New Post 2',
                'blog_id': self.test_blog.id,
            })

    def test_blog_post_publication(self):
        """ Test the publication process
        publication process :

         - when publishing a blog.post, the website_publication_date is filled
         to now()
         - when unpublishing a blog.post, the the website_publication_date is
         set to null
         - when updating a blog.post in the backend
           - if the website_publication_date is set in the past, the blog.post
             is published
           - if the website_publication_date is removed, the blog.post
             is unpublished
           - if the website_publication_date is set in the future, a cron will
             publish the blog.post at the expected date
        """
        blog_ids = [self.test_blog_post_1.id, self.test_blog_post_2.id]

        # at creation post are not published and website_publication_date is
        # no set
        blogs = self.blog_post_obj.search(
            [('id', 'in', blog_ids),
             ('website_published', '=', False),
             ('website_publication_date', '=', False)])
        self.assertIn(self.test_blog_post_1, blogs)
        self.assertIn(self.test_blog_post_2, blogs)
        self.assertEqual(len(blogs), 2)

        # when publishing, the publication date is set
        self.test_blog_post_1.write({'website_published': True})
        self.assertTrue(self.test_blog_post_1.website_publication_date)

        # when unpublishing a blog.post, the the website_publication_date is
        # set to None
        self.test_blog_post_1.write({'website_published': False})
        self.assertFalse(self.test_blog_post_1.website_publication_date)

        # if the website_publication_date is set in the past, the blog.post
        # is published
        past_dt = datetime.datetime.now() - datetime.timedelta(hours=1)
        past_dt = fields.Datetime.to_string(past_dt)
        self.test_blog_post_1.write({'website_publication_date': past_dt})
        self.assertTrue(self.test_blog_post_1.website_published)

        # if the website_publication_date is removed, the blog.post is
        # unpublished
        self.test_blog_post_1.write({'website_publication_date': False})
        self.assertFalse(self.test_blog_post_1.website_published)

        # if the website_publication_date is set in the future, a cron will
        # publish the blog.post at the expected date
        future_dt = datetime.datetime.now() + datetime.timedelta(seconds=5)
        future_dt = fields.Datetime.to_string(future_dt)
        self.test_blog_post_1.write({'website_publication_date': future_dt})
        self.assertFalse(self.test_blog_post_1.website_published)
        time.sleep(6)
        self.blog_post_obj.cron_publish_posts()
        self.test_blog_post_1.refresh()
        self.assertTrue(self.test_blog_post_1.website_published)

        # by default,post are ordered by publication Date IOW, even if the
        # post2 has been created after post1, since, the publication date is
        # previous to the one of post1, the order is [post1, post2]
        self.test_blog_post_2.write({'website_publication_date': past_dt})
        blogs = self.blog_post_obj.search(
            [('id', 'in', blog_ids),
             ('website_published', '=', True)])
        self.assertEqual(
            blogs.ids, [self.test_blog_post_1.id, self.test_blog_post_2.id])

        self.test_blog_post_2.write({'website_publication_date': future_dt})
        self.test_blog_post_1.write({'website_publication_date': past_dt})
        blogs = self.blog_post_obj.search(
            [('id', 'in', blog_ids),
             ('website_published', '=', True)])
        self.assertEqual(
            blogs.ids, [self.test_blog_post_2.id, self.test_blog_post_1.id])
