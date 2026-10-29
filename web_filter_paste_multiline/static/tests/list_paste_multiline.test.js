import {
    SELECTORS,
    openModelFieldSelectorPopover,
    selectOperator,
} from "@web/../tests/core/tree_editor/condition_tree_editor_test_helpers";
import {
    contains,
    defineModels,
    fields,
    models,
    mountWithSearch,
    openAddCustomFilterDialog,
    toggleSearchBarMenu,
} from "@web/../tests/web_test_helpers";
import {expect, test} from "@odoo/hoot";
import {queryAllTexts, queryOne} from "@odoo/hoot-dom";
import {SearchBarMenu} from "@web/search/search_bar_menu/search_bar_menu";
import {animationFrame} from "@odoo/hoot-mock";

class Foo extends models.Model {
    email = fields.Char({string: "Email"});
}
defineModels([Foo]);

/**
 * Simulate a paste event on an element
 *
 * Note: works in chrome/chromium (headless or not) as is run by the odoo test
 * suite, but fails in Firefox
 */
function pasteText(element, text) {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", text);
    element.dispatchEvent(
        new ClipboardEvent("paste", {
            clipboardData,
            bubbles: true,
        })
    );
}

/**
 * Open a custom filter on a field named email and with the In operator
 */
async function openFilterWithEmailField() {
    await mountWithSearch(SearchBarMenu, {
        resModel: "foo",
        searchMenuTypes: ["filter"],
        searchViewId: false,
        searchViewArch: `<search/>`,
    });
    await toggleSearchBarMenu();
    await openAddCustomFilterDialog();
    await openModelFieldSelectorPopover();
    await contains(".o_model_field_selector_popover_item_name:contains(Email)").click();
    await selectOperator("in");
}

test("paste multiline text creates one tag line", async () => {
    await openFilterWithEmailField();

    const input = queryOne(`${SELECTORS.valueEditor} input`);
    pasteText(input, "a@example.com\nb@example.com\nc@example.com");
    await animationFrame();

    expect(queryAllTexts(`${SELECTORS.valueEditor} .o_tag`)).toEqual([
        "a@example.com",
        "b@example.com",
        "c@example.com",
    ]);
});

test("paste one line text inputs normal search value", async () => {
    await openFilterWithEmailField();

    const input = queryOne(`${SELECTORS.valueEditor} input`);
    pasteText(input, "single@example.com");
    await animationFrame();

    expect(queryAllTexts(`${SELECTORS.valueEditor} .o_tag`)).toEqual([]);
});

test("empty and only whitespace lines are ignored", async () => {
    await openFilterWithEmailField();

    const input = queryOne(`${SELECTORS.valueEditor} input`);
    pasteText(input, "a@example.com\n   \n\nb@example.com\n");
    await animationFrame();

    expect(queryAllTexts(`${SELECTORS.valueEditor} .o_tag`)).toEqual([
        "a@example.com",
        "b@example.com",
    ]);
});

test("paste appends to already-existing tags", async () => {
    await openFilterWithEmailField();

    const input = queryOne(`${SELECTORS.valueEditor} input`);

    pasteText(input, "a@example.com\nb@example.com");
    await animationFrame();

    pasteText(input, "c@example.com\nd@example.com");
    await animationFrame();

    expect(queryAllTexts(`${SELECTORS.valueEditor} .o_tag`)).toEqual([
        "a@example.com",
        "b@example.com",
        "c@example.com",
        "d@example.com",
    ]);
});
