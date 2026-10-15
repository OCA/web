The existing definitions in the old web_pwa_oca of 16.0 (not existing or customizable
in core) are maintained.

The settings this module adds live in the same "Progressive Web App" block as core's own `web.web_app_name` field, which core hides behind developer mode (`base.group_no_one`). That restriction is dropped here so the settings are actually reachable - General Settings itself already requires admin access, so this doesn't expose anything that wasn't already admin-only.
