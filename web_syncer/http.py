# Copyright 2017 - 2018 Modoolar <info@modoolar.com>
# License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).
from odoo import http


class SyncerEndPoint(http.EndPoint):

    def __call__(self, *args, **kw):
        result = self.method(*args, **kw)

        if http.request.db:
            http.request.env.syncer.send()
        return result


http.EndPoint = SyncerEndPoint
