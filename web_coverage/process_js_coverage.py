import json
import pathlib
from urllib.parse import urlparse

from odoo.tools import config, file_path

from .parse_asset_bundle import parse_asset_bundle


def process(env, _logger):
    coverage_path = pathlib.Path(config["screenshots"]) / env.cr.dbname / "web_coverage"
    if not coverage_path.is_dir():
        return
    # TODO: find all files in os.env['WEB_COVERAGE_INCLUDE'],
    # initialize missed with all lines
    all_files = {}
    for coverage_file in coverage_path.iterdir():
        coverage = json.loads(coverage_file.read_text())
        url = urlparse(coverage["url"])
        split_name = url.path.split("/")[-1].split(".")
        while split_name and split_name[-1] in ("min", "js"):
            split_name.pop(-1)
        bundle_name = ".".join(split_name)
        asset_bundle = env["ir.qweb"]._get_asset_bundle(
            bundle_name, css=False, js=True, debug_assets=True
        )
        js_attachment = asset_bundle.get_attachments("js")
        sourcemap_attachment = asset_bundle.get_attachments("js.map")
        if not sourcemap_attachment:
            _logger.debug(
                "sourcemap file for bundle %s not found - ignoring", bundle_name
            )
            continue

        sources, index2file_line = parse_asset_bundle(
            js_attachment, sourcemap_attachment
        )

        for file_coverage in sources:
            file_name_relative = file_coverage["name"][1:]
            file_name_fs = file_path(file_name_relative)
            if not file_name_fs:
                _logger.debug("bundle file %s not found - ignoring", file_name_relative)
                file_coverage["line_count"] = 0
                file_coverage["missed"] = set()
                continue
            file_coverage["line_count"] = len(
                pathlib.Path(file_name_fs).read_text().splitlines()
            )
            file_coverage["missed"] = set()

        for function in coverage["functions"]:
            for coverage_range in function["ranges"]:
                if not coverage_range["count"]:
                    start = coverage_range["startOffset"]
                    end = coverage_range["endOffset"]
                    file_coverage = index2file_line[start][0]
                    assert file_coverage == index2file_line[end][0]
                    file_coverage["missed"] |= set(
                        range(index2file_line[start][1], index2file_line[end][1] + 1)
                    )

        for file_coverage in sources:
            if not file_coverage["line_count"]:
                continue
            file_name_relative = file_coverage["name"][1:]
            # TODO: fix this
            if not pathlib.Path(file_name_relative).exists():
                continue
            if file_name_relative in all_files:
                all_files[file_name_relative]["missed"] &= file_coverage["missed"]
            else:
                all_files[file_name_relative] = file_coverage

    with pathlib.Path("lcov.info").open("w+") as lcov_file:
        lcov_file.write("TN:\n")
        for file_name, file_coverage in all_files.items():
            lcov_file.write(f"SF:{file_name}\n")
            lcov_file.write(f"LF:{file_coverage['line_count']}\n")
            lcov_file.write(
                f"LH:{file_coverage['line_count'] - len(file_coverage['missed'])}\n"
            )
            for line in range(file_coverage["line_count"]):
                hit = int(line not in file_coverage["missed"])
                lcov_file.write(f"DA:{line + 1},{hit}\n")
            lcov_file.write("end_of_record\n")
