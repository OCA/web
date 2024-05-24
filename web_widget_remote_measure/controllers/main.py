# Copyright 2023 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import socket

from odoo.http import Controller, request, route


class RemoteDeviceTcpConnection(Controller):
    """Connect directly to a remote device"""

    def _get_weight(self, data, host, port, time_out=1):
        """Direct tcp connection to the remote device"""
        response = None
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as device:
            device.settimeout(time_out)
            device.connect((host, port))
            try:
                if data:
                    if isinstance(data, str):
                        data = data.encode("utf-8")
                    device.sendall(data)
                # Get in one shot. The info won't be longer than a few bytes
                response = device.recv(64)
            except Exception as e:
                raise (e)
            finally:
                device.close()
        return response

    @route(
        "/remote_measure_device/<int:device>", type="json", auth="user", sitemap=False
    )
    def request_weight(self, device=None, command=None, **kw):
        """Meant be called from the remote scale widget js code"""
        device = request.env["remote.measure.device"].browse(device)
        command = command or b""
        kw.get("timeout", 1)
        response = b""
        host, port = device.host.split(":")
        try:
            response = self._get_weight(command, host, int(port))
        except socket.timeout:
            response = b"timeout"
        return response
