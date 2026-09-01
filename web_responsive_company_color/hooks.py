def uninstall_hook(env):
    env["res.company"].with_context(uninstall_scss=True).search(
        []
    ).scss_create_or_update_attachment()


def post_init_hook(env):
    env["res.company"].search([]).scss_create_or_update_attachment()
