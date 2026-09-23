import {contains, defineMenus, mountWithCleanup} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {NavBar} from "@web/webclient/navbar/navbar";
import {queryAllTexts} from "@odoo/hoot-dom";

describe.current.tags("desktop");

describe("WebSortMenu", () => {
    test("apps menu is rendered sorted alphabetically by name", async () => {
        defineMenus([
            {id: 1, name: "Zebra"},
            {id: 2, name: "Apple"},
            {id: 3, name: "Mango"},
        ]);
        await mountWithCleanup(NavBar);
        await contains(".o_navbar_apps_menu button.dropdown-toggle").click();
        expect(queryAllTexts(".o-dropdown--menu .dropdown-item")).toEqual([
            "Apple",
            "Mango",
            "Zebra",
        ]);
    });
});
