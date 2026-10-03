import threading

from odoo import api
from odoo.orm.registry import Registry
from odoo.tools import mute_logger

with mute_logger("odoo.tests.common"):
    from odoo.tests import loader
from . import process_js_coverage

run_suite_org = loader.run_suite


def run_suite(suite, *args, **kwargs):
    if suite.has_http_case():
        dbname = threading.current_thread().dbname
        registry = Registry.registries[dbname]
        with registry.cursor() as cr:
            # pregenerate debug asset bundles because we patch debug=assets into all
            # urls in order to avoid minification to be able to match covered code
            # with code in the filesystem
            env = api.Environment(cr, api.SUPERUSER_ID, {})
            IrQweb = env["ir.qweb"]
            js_bundles, css_bundles = IrQweb._get_bundles_to_pregenarate()
            for bundle in sorted(js_bundles):
                IrQweb._get_asset_bundle(
                    bundle, css=False, js=True, debug_assets=True
                ).js()
            for bundle in sorted(css_bundles):
                IrQweb._get_asset_bundle(
                    bundle, css=True, js=False, debug_assets=True
                ).css()

    result = run_suite_org(suite, *args, **kwargs)
    if suite.has_http_case():
        dbname = threading.current_thread().dbname
        registry = Registry.registries[dbname]
        with registry.cursor() as cr:
            env = api.Environment(cr, api.SUPERUSER_ID, {})
            process_js_coverage.process(env, loader._logger)
    return result


loader.run_suite = run_suite
