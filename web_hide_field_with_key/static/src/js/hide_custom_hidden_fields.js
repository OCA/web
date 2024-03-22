(function () {
    "use strict";

    // Those are weak because we don't want to prevent
    // GC of the dom nodes when we leave a page
    const elementStyleMap = new WeakMap();
    const alreadyRemove = new WeakSet();

    function changeStyle(nodes) {
        nodes.forEach((el) => {
            if (el.style.display === "none") {
                el.style.display = elementStyleMap.get(el) || "block";
            } else {
                elementStyleMap.set(el, el.style.display);
                el.style.display = "none";
            }

            if (el.tagName === "TD") {
                const cellIndex = el.cellIndex;
                const tableHead = el.parentNode.parentNode.previousSibling;
                const header = tableHead.querySelectorAll("th")[cellIndex];
                header.style.display = el.style.display;
            }
        });
    }

    // Unfortunately we cannot trust the css because we need
    // to store the base display style to restore it properly
    function rafCallback() {
        // Query only nodes that we did not already defaulted to none
        const filteredNodes = Array.from(
            document.querySelectorAll(".web-hide-field")
        ).filter((e) => !alreadyRemove.has(e));
        // Add the filtered node to the weakset to avoid removing them multiple times
        filteredNodes.forEach((e) => alreadyRemove.add(e));

        if (filteredNodes.length > 0) {
            changeStyle(filteredNodes);
        }
        requestAnimationFrame(rafCallback);
    }

    rafCallback();

    document.addEventListener("keypress", function (event) {
        if (event.key === "p") {
            changeStyle(document.querySelectorAll(".web-hide-field"));
        }
    });
})();
