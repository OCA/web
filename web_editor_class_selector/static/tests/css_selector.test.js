import { animationFrame, expect, test } from "@odoo/hoot";
import { click } from "@odoo/hoot-dom";
import { setupEditor } from "@html_editor/../tests/_helpers/editor";
import { getContent } from "@html_editor/../tests/_helpers/selection";
import { expandToolbar } from "@html_editor/../tests/_helpers/toolbar";
import { CssSelectorPlugin } from "../src/js/css_selector/css_selector_plugin.esm";

test("custom CSS classes can be selected and applied to content", async () => {
  const customClasses = [
    {name: "Primary", class_name: "o_class_selector_primary"},
    {name: "Secondary", class_name: "o_class_selector_secondary"},
  ];
  const {el} = await setupEditor("<p>[text]</p>", {
    config: {
      includePlugins: [CssSelectorPlugin],
      custom_class_css: customClasses,
    },
  });

  const selectorButton = ".o-we-toolbar [name='css-selector'] button";
  await expandToolbar();
  expect(selectorButton).toHaveText("Custom CSS");

  await click(selectorButton);
  await animationFrame();
  await click(".o-dropdown-item.o_class_selector_primary");
  await animationFrame();
  expect(getContent(el)).toBe('<p><span class="o_class_selector_primary">[text]</span></p>');
  expect(selectorButton).toHaveText("Primary");

  await click(selectorButton);
  await animationFrame();
  await click(".o-dropdown-item.o_class_selector_secondary");
  await animationFrame();
  expect(getContent(el)).toBe('<p><span class="o_class_selector_secondary">[text]</span></p>');
  expect(selectorButton).toHaveText("Secondary");
});
