The formatter is automatically loaded in the Odoo backend after installing the module.

When entering a numeric value in a supported price field, thousands separators are added automatically.

Examples:

+-------------+-----------------+
| User Input  | Displayed Value |
+=============+=================+
| 1000        | 1,000           |
+-------------+-----------------+
| 25000       | 25,000          |
+-------------+-----------------+
| 1234567     | 1,234,567       |
+-------------+-----------------+
| 999999999   | 999,999,999     |
+-------------+-----------------+

## Installation

1. Copy the `web_live_price_formatter` directory into your Odoo addons path.
2. Restart the Odoo server.
3. Enable Developer Mode.
4. Go to **Apps** and click **Update Apps List**.
5. Search for **Web Live Price Formatter** and install the module.
