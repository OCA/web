The module adds configurable banners for backend **form** views. Define
rules per model (and optionally per view) to show context-aware alerts
with a chosen severity (info/warning/danger).

Messages can be plain text with \${placeholders} or fully custom HTML;
visibility, severity, and values are computed server-side via a safe
Python expression.

Banners are injected just before or after a target node (default:
//sheet) and refresh on form load/save/reload.
