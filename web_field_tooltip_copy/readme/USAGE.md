- Activate developer mode.
- Hover the `?` next to a field label.
- Move the pointer into the tooltip if needed — it stays open while hovered.
- Click any technical value (or press Enter/Space when focused) to copy it.
- Selection keys **and** labels are both copyable.

Copy works via the Clipboard API, with a legacy `execCommand` fallback when
needed (for example some HTTP contexts).
