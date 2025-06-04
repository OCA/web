This module works in conjunction with web_iconify. Once installed, icons
will be served through the proxy and cached locally.

## SVG Icon Parameters

You can customize SVG icons by adding query parameters to the URL. The format is:

`/web_iconify_proxy/<prefix>/<icon>.svg?param1=value1&param2=value2...`

Available parameters:

*   **color**: Icon color (e.g., `color=red`, `color=%23ff0000`).
*   **width**: Icon width (e.g., `width=50`, `width=50px`).
*   **height**: Icon height (e.g., `height=50`, `height=50px`). If only one dimension is specified, the other will be calculated automatically to maintain aspect ratio.
*   **flip**: Flip the icon. Possible values: `horizontal`, `vertical`, or both (e.g., `flip=horizontal`, `flip=vertical`, `flip=horizontal,vertical`).
*   **rotate**: Rotate the icon by 90, 180, or 270 degrees (e.g., `rotate=90`, `rotate=180`).
*   **box**: Set to `true` to add an empty rectangle to the SVG that matches the viewBox (e.g., `box=true`).

Example:

`/web_iconify_proxy/mdi/home.svg?color=blue&width=64&flip=horizontal`
