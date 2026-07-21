# Copyright 2026 Akretion (http://www.akretion.com).
# @author Florian Mounier <florian.mounier@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import logging
import threading
from weakref import WeakSet

from odoo import http

from odoo.addons.bus.websocket import WebsocketConnectionHandler


class BroadcastChannelWebsocketConnectionHandler(WebsocketConnectionHandler):
    _broadcast_websocket = WeakSet()

    @classmethod
    def _serve_forever(cls, websocket, db, httprequest):
        current_thread = threading.current_thread()
        current_thread.type = "websocket"
        cls._broadcast_websocket.add(websocket)

        for message in websocket.get_messages():
            for ws in set(cls._broadcast_websocket):
                if ws != websocket:
                    try:
                        ws._send(message)
                    except Exception as e:
                        logging.warning(f"Error sending message: {e}")
                        try:
                            ws.close()
                        except Exception:
                            logging.warning(f"Error closing websocket: {e}")
                        cls._broadcast_websocket.remove(ws)

        cls._broadcast_websocket.remove(websocket)


class BroadcastChannel(http.Controller):
    """Broadcast Channel for concurrent edit warning"""

    @http.route(
        "/websocket/broadcast_channel",
        type="http",
        auth="public",
        csrf=False,
        websocket=True,
    )
    def broadcast_channel(self, **kwargs):
        """Websocket route to handle broadcast channel connections."""
        return BroadcastChannelWebsocketConnectionHandler.open_connection(http.request)
