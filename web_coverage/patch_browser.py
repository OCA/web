import json
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit

from odoo.tools import mute_logger

with mute_logger("odoo.tests.common"):
    from odoo.tests.common import ChromeBrowser, save_test_file


_wait_code_ok_org = ChromeBrowser._wait_code_ok
navigate_to_org = ChromeBrowser.navigate_to


def navigate_to(self, url, *args, **kwargs):
    self._websocket_request("Profiler.enable")
    self._websocket_request("Profiler.startPreciseCoverage", params={"detailed": True})
    # we need to run unminified JS files to be able to map coverage to lines in files
    parsed_url = urlsplit(url)
    new_url = urlunsplit(
        parsed_url[:3]
        + (urlencode(dict(parse_qs(parsed_url.query), debug="assets"), doseq=True),)
        + parsed_url[4:]
    )
    return navigate_to_org(self, new_url, *args, **kwargs)


def _wait_code_ok(self, *args, **kwargs):
    result = _wait_code_ok_org(self, *args, **kwargs)

    coverage = self._websocket_request("Profiler.takePreciseCoverage")
    if not coverage or not coverage["result"]:
        self._logger.warning("No coverage collected")
        return result
    self._websocket_request("Debugger.enable")
    for script_coverage in coverage["result"]:
        if not script_coverage["url"] or "/debug/" not in script_coverage["url"]:
            # we don't care for files not in some debug asset
            self._logger.debug(
                "ignoring script %s: %s",
                script_coverage["scriptId"],
                script_coverage["url"],
            )
            continue
        save_test_file(
            self.test_case._testMethodName,
            json.dumps(script_coverage).encode("utf8"),
            prefix=f"{script_coverage['scriptId']}_",
            extension="json",
            document_type="JS coverage",
            logger=self._logger,
            loglevel=self.chrome_log_level,
            directory="web_coverage",
        )
    return result


ChromeBrowser._wait_code_ok = _wait_code_ok
ChromeBrowser.navigate_to = navigate_to
