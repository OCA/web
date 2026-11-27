import {animationFrame, expect, test} from "@odoo/hoot";
import {
    contains,
    defineModels,
    editSearch,
    fields,
    getFacetTexts,
    models,
    mountWithSearch,
    removeFacet,
} from "@web/../tests/web_test_helpers";
import {SearchBar} from "@web/search/search_bar/search_bar";
import {press} from "@odoo/hoot-dom";

class Partner extends models.Model {
    foo = fields.Char();

    _records = [
        {id: 1, foo: "John Smith"},
        {id: 2, foo: "John Doe"},
        {id: 3, foo: "Jane Smith"},
    ];
    _views = {
        search: `<search><field name="foo"/></search>`,
    };
}

defineModels([Partner]);

async function mountSearchBar() {
    return mountWithSearch(SearchBar, {
        resModel: "partner",
        searchMenuTypes: [],
        searchViewId: false,
    });
}

async function search(value, keys = ["Enter"]) {
    await editSearch(value);
    await press(keys);
    await animationFrame();
}

function facetTexts() {
    return getFacetTexts().map((str) => str.replace(/\s+/g, " "));
}

test.tags("desktop");
test("values of the same field are combined with OR without shift", async () => {
    const searchBar = await mountSearchBar();
    await search("John");
    await search("Smith");
    expect(facetTexts()).toEqual(["Foo John or Smith"]);
    expect(searchBar.env.searchModel.domain).toEqual([
        "|",
        ["foo", "ilike", "John"],
        ["foo", "ilike", "Smith"],
    ]);
});

test.tags("desktop");
test("a value selected with shift is combined with AND", async () => {
    const searchBar = await mountSearchBar();
    await search("John");
    await search("Smith", ["Shift", "Enter"]);
    expect(facetTexts()).toEqual(["Foo John", "Foo Smith"]);
    expect(searchBar.env.searchModel.domain).toEqual([
        "&",
        ["foo", "ilike", "John"],
        ["foo", "ilike", "Smith"],
    ]);
});

test.tags("desktop");
test("a value clicked with shift is combined with AND", async () => {
    const searchBar = await mountSearchBar();
    await search("John");
    await editSearch("Smith");
    await contains(".o_searchview_autocomplete .o-dropdown-item:eq(0)").click({
        shiftKey: true,
    });
    expect(facetTexts()).toEqual(["Foo John", "Foo Smith"]);
    expect(searchBar.env.searchModel.domain).toEqual([
        "&",
        ["foo", "ilike", "John"],
        ["foo", "ilike", "Smith"],
    ]);
});

test.tags("desktop");
test("a value selected without shift after an AND one goes back to OR", async () => {
    await mountSearchBar();
    await search("John");
    await search("Smith", ["Shift", "Enter"]);
    await search("Doe");
    expect(facetTexts()).toEqual(["Foo John or Doe", "Foo Smith"]);
});

test.tags("desktop");
test("the same value selected twice with shift gives one facet", async () => {
    await mountSearchBar();
    await search("John");
    await search("Smith", ["Shift", "Enter"]);
    await search("Smith", ["Shift", "Enter"]);
    expect(facetTexts()).toEqual(["Foo John", "Foo Smith"]);
});

test.tags("desktop");
test("removing a facet keeps the other ones", async () => {
    const searchBar = await mountSearchBar();
    await search("John");
    await search("Doe");
    await search("Smith", ["Shift", "Enter"]);
    await search("Jane", ["Shift", "Enter"]);
    expect(facetTexts()).toEqual(["Foo John or Doe", "Foo Smith", "Foo Jane"]);

    await removeFacet("Foo Smith");
    expect(facetTexts()).toEqual(["Foo John or Doe", "Foo Jane"]);

    await removeFacet("Foo John or Doe");
    expect(facetTexts()).toEqual(["Foo Jane"]);
    expect(searchBar.env.searchModel.domain).toEqual([["foo", "ilike", "Jane"]]);
});

test.tags("desktop");
test("a value between double quotes searches for the exact value", async () => {
    const searchBar = await mountSearchBar();
    await search('"John Smith"');
    expect(facetTexts()).toEqual(["Foo John Smith"]);
    expect(searchBar.env.searchModel.domain).toEqual([["foo", "=", "John Smith"]]);
});
