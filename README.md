[![Runbot Status](https://runbot.odoo-community.org/runbot/badge/flat/162/12.0.svg)](https://runbot.odoo-community.org/runbot/repo/github-com-oca-web-162)
[![Build Status](https://travis-ci.org/OCA/web.svg?branch=12.0)](https://travis-ci.org/OCA/web)
[![Coverage Status](https://coveralls.io/repos/OCA/web/badge.png?branch=12.0)](https://coveralls.io/r/OCA/web?branch=12.0)

Web addons for Odoo
===================

This project aims to deal with modules related to the webclient of Odoo. You'll find modules that:

- Add facilities to the UI
- Add widgets
- Ease the import/export features
- Generally add clientside functionality

The activation of the HTTP2 protocol for Odoo OCA
=================================================

This section is related to the activation of the HTTP2 protocol and get the Responsive Web UI loading correctly, when deploying Odoo behind a Proxy Server (Nginx, Traefik, Apache, ...) :

     1. - Nginx Proxy :
     
         - Install Odoo OCA Web Responsive module.
         - Activate the HTTP2 protocol in the server block of your Odoo Nginx configuration file's.
         - Add the Nginx parameter "large_client_header_buffers" with a minimum size of "4 32k" in your Nginx proxy configuration file's to the HTTP block.
