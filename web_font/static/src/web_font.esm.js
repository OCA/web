/* Copyright 2026 Ecosoft Co., Ltd. (https://ecosoft.co.th)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {session} from "@web/session";
import {user} from "@web/core/user";

const PROBE = "web_font_probe";

/**
 * Ratio between the default Odoo fonts and the chosen font, measured in this
 * browser, so the chosen font looks as big as the fonts the user is used to.
 * The sample is the name of the user's language written in that language
 * (e.g. "ไทย"), then "English" if the font does not cover that language.
 */
async function measureScale(face, standard) {
    const probe = await new FontFace(PROBE, face.src).load();
    document.fonts.add(probe);
    const ctx = document.createElement("canvas").getContext("2d");
    const measure = (fontFamily, text) => {
        ctx.font = `100px ${fontFamily}`;
        return ctx.measureText(text);
    };
    const lang = user.lang.split("-")[0];
    const samples = [
        new Intl.DisplayNames([lang], {type: "language"}).of(lang),
        "English",
    ];
    let scale = 1;
    for (const text of samples) {
        const ref = measure(standard, text);
        const res = measure(`${PROBE}, ${standard}`, text);
        // Same width: the sample is not covered by the font
        if (res.width !== ref.width) {
            scale = ref.actualBoundingBoxAscent / res.actualBoundingBoxAscent;
            break;
        }
    }
    document.fonts.delete(probe);
    return Math.min(Math.max(scale, 0.5), 2);
}

/**
 * Default Odoo fonts. The stylesheets are loaded after this script, so wait
 * for them before reading the value.
 */
async function getStandardFonts() {
    if (document.readyState !== "complete") {
        await new Promise((resolve) =>
            window.addEventListener("load", resolve, {once: true})
        );
    }
    return getComputedStyle(document.documentElement)
        .getPropertyValue("--font-sans-serif")
        .trim();
}

export async function applyWebFont({family, faces, size}) {
    const root = document.documentElement;
    const fontFamily = `web_font_${family}`;
    let scale = size / 100;
    if (!scale) {
        const face =
            faces.find(
                (f) => ["normal", "400"].includes(f.weight) && f.style === "normal"
            ) || faces[0];
        // The font file is in the key, so it is measured again when it changes
        const key = `web_font.scale:${face.src}:${user.lang}`;
        scale = Number(localStorage.getItem(key));
        if (!scale) {
            scale = await measureScale(face, await getStandardFonts());
            localStorage.setItem(key, scale);
        }
    }
    for (const {src, weight, style} of faces) {
        document.fonts.add(
            new FontFace(fontFamily, src, {
                weight,
                style,
                sizeAdjust: `${scale * 100}%`,
            })
        );
    }
    root.style.setProperty("--web-font-family", fontFamily);
    root.classList.add("o_web_font");
}

if (session.web_font && session.web_font.faces.length) {
    applyWebFont(session.web_font).catch((error) =>
        console.warn("web_font: cannot load the font", error)
    );
}
