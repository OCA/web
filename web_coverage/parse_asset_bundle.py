import json

B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
B64_MAP = {char: val for val, char in enumerate(B64_ALPHABET)}
CONTINUE = 0b100000
CONTINUE_COMPLEMENT = 0b011111
SIGN = 0b000001


def b64vlq_decode(chars):
    """
    Decode a base64 vlq string into a tuple of integers
    """
    vals = []
    current_val, shift = 0, 0
    for c in chars:
        bits = B64_MAP[c]
        current_val = (bits & CONTINUE_COMPLEMENT) << shift | current_val
        shift += 5
        if not bits & CONTINUE:
            sign = current_val & SIGN and -1 or 1
            vals.append((current_val >> 1) * sign)
            current_val, shift = 0, 0
    return tuple(vals)


def parse_asset_bundle(js_attachment, sourcemap_attachment):
    """
    Return list of source files in bundle, and a list mapping indices in js_attachment
    to asource file and a line therein
    """
    sourcemap = json.loads(sourcemap_attachment.raw[5:])
    sourcemap["mappings"] = [
        tuple(b64vlq_decode(segment) for segment in group.split(","))
        for group in sourcemap["mappings"].split(";")
    ]

    sources = [{"name": file_name} for file_name in sourcemap["sources"]]
    sources_index = 0
    # TODO: indices in coverage don't map exactly those in
    # js_attachment.raw.decode('utf8') - for every
    # 4-byte emoji in the code, we get offset+1
    # the below fixes this, but why?
    gen_content = "".join(
        map(
            lambda c: (c + c) if len(c.encode("utf8")) == 4 else c,
            js_attachment.raw.decode("utf8"),
        )
    )
    index2file_line = [None] * len(gen_content)
    gen_index = 0
    org_line = 0
    org_column = 0

    for line_mappings, line in zip(
        # strict=False because bundle attachment has appended code for template which
        # is not mapped
        sourcemap["mappings"],
        gen_content.splitlines(keepends=True),
        strict=False,
    ):
        gen_column = 0
        for mapping in line_mappings:
            if not mapping:
                continue

            gen_column_delta, sources_index_delta, org_line_delta, org_column_delta = (
                mapping
            )

            gen_column += gen_column_delta
            sources_index += sources_index_delta
            org_line += org_line_delta
            org_column += org_column_delta

        next_gen_index = gen_index + len(line)
        index2file_line[gen_index:next_gen_index] = [
            (sources[sources_index], org_line)
        ] * (next_gen_index - gen_index)
        gen_index = next_gen_index

    return sources, index2file_line
