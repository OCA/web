import {describe, expect, test} from "@odoo/hoot";

import {FormCompiler} from "@web/views/form/form_compiler";
import {patchWithCleanup} from "@web/../tests/web_test_helpers";

describe.current.tags("headless");

function compileTemplate(arch, position) {
    patchWithCleanup(odoo, {web_chatter_position: position});
    const parser = new DOMParser();
    const xml = parser.parseFromString(arch, "text/xml");
    const compiler = new FormCompiler({
        form: xml.documentElement,
        FormRenderer: xml.documentElement,
    });
    return compiler.compile("form");
}

const formWithChatter = `
  <form>
    <sheet><group/></sheet>
    <chatter/>
  </form>
`;

test("auto preserves the standard chatter placement", () => {
    const compiled = compileTemplate(formWithChatter, "auto");
    const sheet = compiled.querySelector(".o_form_sheet_bg");
    const chatter = compiled.querySelectorAll(".o-mail-Form-chatter");

    expect(sheet.classList.contains("o_fullwidth")).toBe(false);
    expect(chatter).toHaveLength(1);
    expect(chatter[0].classList.contains("o-isInFormSheetBg")).toBe(false);
});

test("bottom moves chatter into the sheet when there is no attachment preview", () => {
    const compiled = compileTemplate(formWithChatter, "bottom");
    const sheet = compiled.querySelector(".o_form_sheet_bg");
    const chatter = compiled.querySelectorAll(".o-mail-Form-chatter");
    const inSheetChatter = compiled.querySelector(
        ".o-mail-Form-chatter.o-isInFormSheetBg"
    );
    const externalChatter = compiled.querySelector(
        ".o-mail-Form-chatter:not(.o-isInFormSheetBg)"
    );

    expect(sheet.classList.contains("o_fullwidth")).toBe(true);
    expect(chatter).toHaveLength(2);
    expect(inSheetChatter.getAttribute("t-if")).toBe("true");
    expect(inSheetChatter.getAttribute("t-attf-class").includes("o-aside")).toBe(true);
    expect(externalChatter.getAttribute("t-if")).toBe("false");
});

test("bottom reuses the sheet chatter when an attachment preview is present", () => {
    const arch = `
    <form>
      <sheet>
        <div class="o_attachment_preview"/>
      </sheet>
      <chatter/>
    </form>
  `;
    const compiled = compileTemplate(arch, "bottom");
    const chatter = compiled.querySelectorAll(".o-mail-Form-chatter");

    expect(
        compiled.querySelector(".o_form_sheet_bg").classList.contains("o_fullwidth")
    ).toBe(true);
    expect(chatter).toHaveLength(2);
    expect(
        compiled
            .querySelector(".o-mail-Form-chatter.o-isInFormSheetBg")
            .getAttribute("t-if")
    ).toBe("true");
    expect(
        compiled
            .querySelector(".o-mail-Form-chatter:not(.o-isInFormSheetBg)")
            .getAttribute("t-if")
    ).toBe("false");
});

test("sided uses the full-height side-by-side form layout", () => {
    const compiled = compileTemplate(formWithChatter, "sided");
    const form = compiled.querySelector(".d-flex.d-print-block.flex-nowrap.h-100");

    expect(form.className).toBe("d-flex d-print-block flex-nowrap h-100");
});

test("bottom leaves forms without chatter unchanged", () => {
    const compiled = compileTemplate("<form><sheet><group/></sheet></form>", "bottom");

    expect(
        compiled.querySelector(".o_form_sheet_bg").classList.contains("o_fullwidth")
    ).toBe(false);
});

test("bottom leaves chatter unchanged when the form has no sheet", () => {
    const compiled = compileTemplate("<form><chatter/></form>", "bottom");
    const chatter = compiled.querySelector(".o-mail-Form-chatter");

    expect(chatter.getAttribute("t-if")).not.toBe("false");
});
