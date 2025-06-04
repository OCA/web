/** @odoo-module ignore **/

// eslint-disable-next-line no-undef
const IconifyIcon = window.customElements.get("iconify-icon");

IconifyIcon.addAPIProvider("", {
    resources: ["/web_iconify_proxy"],
});
