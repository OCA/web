# -*- coding: utf-8 -*-
{
    "name": "Notifications for Model's basic operations",
    "summary": """Notifications for Odoo models's create, write and unlink operations.""",
    "description": """ Notifications for Odoo models's create, write and unlink operations. """,
    "author": "bluisknot@gmail.com",
    "website": "http://www.yourcompany.com",
    "category": "Uncategorized",
    "version": "1.0",
    "depends": ["base"],
    "installable": True,
    "assets": {
        "web.assets_backend": ["model_basic_ops_notifications/static/src/js/services/notification_service.js"],
    },
    "license": "LGPL-3",
}
