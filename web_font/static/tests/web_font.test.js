/* Copyright 2026 Ecosoft Co., Ltd. (https://ecosoft.co.th)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {afterEach, describe, expect, test} from "@odoo/hoot";
import {applyWebFont} from "@web_font/web_font.esm";

describe.current.tags("desktop");

const ROBOTO = {
    family: "Roboto",
    faces: [
        {
            src: "url(/web/static/fonts/google/Roboto/Roboto-Regular.ttf) format('truetype')",
            weight: "400",
            style: "normal",
        },
    ],
};

function getFaces() {
    return [...document.fonts].filter(
        (f) => f.family.replaceAll('"', "") === "web_font_Roboto"
    );
}

afterEach(() => {
    const root = document.documentElement;
    root.classList.remove("o_web_font");
    root.style.removeProperty("--web-font-family");
    for (const face of getFaces()) {
        document.fonts.delete(face);
    }
});

test("chosen font is used, with the default fonts as fallback", async () => {
    await applyWebFont({...ROBOTO, size: 120});
    const root = document.documentElement;
    expect(root).toHaveClass("o_web_font");
    const family = getComputedStyle(root).getPropertyValue("--body-font-family");
    expect(family.startsWith("web_font_Roboto, ")).toBe(true);
    expect(family.length > "web_font_Roboto, ".length).toBe(true);
    expect(getFaces().map((f) => f.sizeAdjust)).toEqual(["120%"]);
});

test("font is scaled automatically", async () => {
    await applyWebFont({...ROBOTO, size: 0});
    const [face] = getFaces();
    const scale = parseFloat(face.sizeAdjust);
    expect(scale >= 50 && scale <= 200).toBe(true);
});
