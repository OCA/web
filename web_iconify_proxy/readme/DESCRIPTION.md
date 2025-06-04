This module acts as a proxy for the Iconify API, allowing Odoo to fetch
icons through the Odoo server rather than directly from the Iconify API.
This improves performance by caching the icons locally using Odoo's
ir.attachment model.
