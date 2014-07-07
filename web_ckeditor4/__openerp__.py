# -*- encoding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2013 Therp BV (<http://therp.nl>)
#    All Rights Reserved
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
    'name': 'CKEditor 4.x widget',
    'version': '1.0',
    'description': """
    This addon provides a widget for editing html fields via CKEditor 4.x

    Use widget="text_html" if you need just html display. In the unlikely case
    you need specific features of ckeditor, use widget="text_ckeditor4".
    """,
    'author': 'Therp BV',
    'website': 'http://www.therp.nl',
    "category": "Tools",
    "depends": [
        'web',
        ],
    'css': [
        'static/src/css/web_ckeditor4.css',
        ],
    'data': [
        ],
    'js': [
        'static/src/js/ckeditor_basepath.js',
        'static/lib/ckeditor/ckeditor.js',
        'static/lib/ckeditor/config.js',
        #to debug ckeditor, comment the lines above,
        #do a
        #cd static/lib
        #git clone https://github.com/ckeditor/ckeditor-dev.git trunk
        #cd trunk
        #git checkout remotes/origin/release/4.1.x
        #and uncomment the lines below
        #'static/lib/trunk/ckeditor.js',
        #'static/lib/trunk/core/event.js',
        #'static/lib/trunk/core/editor_basic.js',
        #'static/lib/trunk/core/env.js',
        #'static/lib/trunk/core/ckeditor_basic.js',
        #'static/lib/trunk/core/dom.js',
        #'static/lib/trunk/core/tools.js',
        #'static/lib/trunk/core/dtd.js',
        #'static/lib/trunk/core/dom/event.js',
        #'static/lib/trunk/core/dom/domobject.js',
        #'static/lib/trunk/core/dom/node.js',
        #'static/lib/trunk/core/dom/window.js',
        #'static/lib/trunk/core/dom/document.js',
        #'static/lib/trunk/core/dom/nodelist.js',
        #'static/lib/trunk/core/dom/element.js',
        #'static/lib/trunk/core/dom/documentfragment.js',
        #'static/lib/trunk/core/dom/walker.js',
        #'static/lib/trunk/core/dom/range.js',
        #'static/lib/trunk/core/dom/iterator.js',
        #'static/lib/trunk/core/command.js',
        #'static/lib/trunk/core/ckeditor_base.js',
        #'static/lib/trunk/core/config.js',
        #'static/lib/trunk/core/filter.js',
        #'static/lib/trunk/core/focusmanager.js',
        #'static/lib/trunk/core/keystrokehandler.js',
        #'static/lib/trunk/core/lang.js',
        #'static/lib/trunk/core/scriptloader.js',
        #'static/lib/trunk/core/resourcemanager.js',
        #'static/lib/trunk/core/plugins.js',
        #'static/lib/trunk/core/ui.js',
        #'static/lib/trunk/core/editor.js',
        #'static/lib/trunk/core/htmlparser.js',
        #'static/lib/trunk/core/htmlparser/basicwriter.js',
        #'static/lib/trunk/core/htmlparser/node.js',
        #'static/lib/trunk/core/htmlparser/comment.js',
        #'static/lib/trunk/core/htmlparser/text.js',
        #'static/lib/trunk/core/htmlparser/cdata.js',
        #'static/lib/trunk/core/htmlparser/fragment.js',
        #'static/lib/trunk/core/htmlparser/filter.js',
        #'static/lib/trunk/core/htmldataprocessor.js',
        #'static/lib/trunk/core/htmlparser/element.js',
        #'static/lib/trunk/core/template.js',
        #'static/lib/trunk/core/ckeditor.js',
        #'static/lib/trunk/core/creators/inline.js',
        #'static/lib/trunk/core/creators/themedui.js',
        #'static/lib/trunk/core/editable.js',
        #'static/lib/trunk/core/selection.js',
        #'static/lib/trunk/core/style.js',
        #'static/lib/trunk/core/dom/comment.js',
        #'static/lib/trunk/core/dom/elementpath.js',
        #'static/lib/trunk/core/dom/text.js',
        #'static/lib/trunk/core/dom/rangelist.js',
        #'static/lib/trunk/core/skin.js',
        #'static/lib/trunk/core/_bootstrap.js',
        #end of ckeditor debug
        'static/src/js/web_ckeditor4.js',
        ],
    'installable': True,
    'auto_install': False,
    'certificate': '',
}
