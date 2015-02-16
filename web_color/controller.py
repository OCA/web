# -*- encoding: utf-8 -*-
############################################################################
#
# OpenERP, Open Source Web Color
# Copyright (C) 2012 Savoir-faire Linux (<http://www.savoirfairelinux.com>).
# Copyright (C) 2014 Anybox <http://anybox.fr>
# Copyright (C) 2015 Taktik SA <http://taktik.be>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# @author Étienne Beaudry Auger <etienne.b.auger@savoirfairelinux.com>
# @author Adil Houmadi <ah@taktik.be>
#
##############################################################################
import openerp.http as http
from openerp.http import request
from os.path import join, abspath, exists
import mimetypes


class JsColor(http.Controller):
    @http.route("/jscolor/<string:image>", type="http", auth="user")
    def jscolor(self, image):
        addons_path = http.addons_manifest['web_color']['addons_path']
        path = join(
            addons_path,
            'web_color',
            'static',
            'lib',
            'jscolor',
            image
        )
        if not exists(path):
            return request.not_found()
        try:
            image_file = open(abspath(path))
            image_data = image_file.read()
            image_file.close()
            mime_type = mimetypes.guess_type(path)
            if len(mime_type) > 1:
                mime_type = mime_type[0]
            else:
                return request.not_found()
        except:
            return request.not_found()
        headers = [
            ('Content-Type', '%s' % mime_type),
            ('Content-Length', len(image_data)),
        ]
        return request.make_response(image_data, headers)