(function () {
    "use strict";

    function markPortalDiscussFullscreen() {
        if (window.location.pathname !== "/my/discuss") {
            return;
        }
        document.documentElement.classList.add("o_portal_discuss_fullscreen");
        if (document.body) {
            document.body.classList.add("o_portal_discuss_fullscreen");
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", markPortalDiscussFullscreen, {
            once: true,
        });
    } else {
        markPortalDiscussFullscreen();
    }
})();
