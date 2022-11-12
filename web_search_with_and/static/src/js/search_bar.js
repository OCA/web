odoo.define("web_search_with_and/static/src/js/search_bar.js", function (require) {
    "use strict";

    const {patch} = require("web.utils");
    const components = {
        SearchBar: require("web.SearchBar"),
    };

    patch(components.SearchBar, "web_search_with_and/static/src/js/search_bar.js", {
        /**
         * @private
         * @param {Object} source
         */
        _selectSource(source) {
            // Inactive sources are:
            // - Selection sources
            // - "no result" items
            if (source.active) {
                const labelValue = source.label || this.state.inputValue;
                console.log(
                    "------------- addAutoCompletionValues11 -------------",
                    source,
                    this.isShiftKey
                );
                this.model.dispatch("addAutoCompletionValues", {
                    filterId: source.filterId,
                    value:
                        "value" in source
                            ? source.value
                            : this._parseWithSource(labelValue, source),
                    label: labelValue,
                    operator: source.filterOperator || source.operator,
                    isShiftKey: this.isShiftKey,
                });
            }
            this._closeAutoComplete();
        },

        /* eslint-disable complexity */

        /**
         * @private
         * @param {KeyboardEvent} ev
         */
        _onSearchKeydown(ev) {
            if (ev.isComposing) {
                // This case happens with an IME for example: we let it handle all key events.
                return;
            }
            if (ev.shiftKey) {
                this.isShiftKey = true;
            } else {
                this.isShiftKey = false;
            }
            const currentItem = this.state.sources[this.state.focusedItem] || {};
            switch (ev.key) {
                case "ArrowDown":
                    ev.preventDefault();
                    if (Object.keys(this.state.sources).length) {
                        let nextIndex = this.state.focusedItem + 1;
                        if (nextIndex >= this.state.sources.length) {
                            nextIndex = 0;
                        }
                        this.state.focusedItem = nextIndex;
                    } else {
                        this.env.bus.trigger("focus-view");
                    }
                    break;
                case "ArrowLeft":
                    if (currentItem.expanded) {
                        // Priority 1: fold expanded item.
                        ev.preventDefault();
                        this._expandSource(currentItem, false);
                    } else if (currentItem.parent) {
                        // Priority 2: focus parent item.
                        ev.preventDefault();
                        this.state.focusedItem = this.state.sources.indexOf(
                            currentItem.parent
                        );
                        // Priority 3: Do nothing (navigation inside text).
                    } else if (ev.target.selectionStart === 0) {
                        // Priority 4: navigate to rightmost facet.
                        this._focusFacet(this.model.get("facets").length - 1);
                    }
                    break;
                case "ArrowRight":
                    if (ev.target.selectionStart === this.state.inputValue.length) {
                        // Priority 1: Do nothing (navigation inside text).
                        if (currentItem.expand) {
                            // Priority 2: go to first child or expand item.
                            ev.preventDefault();
                            if (currentItem.expanded) {
                                this.state.focusedItem++;
                            } else {
                                this._expandSource(currentItem, true);
                            }
                        } else if (
                            ev.target.selectionStart === this.state.inputValue.length
                        ) {
                            // Priority 3: navigate to leftmost facet.
                            this._focusFacet(0);
                        }
                    }
                    break;
                case "ArrowUp": {
                    ev.preventDefault();
                    let previousIndex = this.state.focusedItem - 1;
                    if (previousIndex < 0) {
                        previousIndex = this.state.sources.length - 1;
                    }
                    this.state.focusedItem = previousIndex;
                    break;
                }
                case "Backspace":
                    if (!this.state.inputValue.length) {
                        const facets = this.model.get("facets");
                        if (facets.length) {
                            this._onFacetRemove(facets[facets.length - 1]);
                        }
                    }
                    break;
                case "Enter":
                    if (!this.state.inputValue.length) {
                        this.model.dispatch("search");
                        break;
                    }
                /* Falls through */
                case "Tab":
                    if (this.state.inputValue.length) {
                        // Keep the focus inside the search bar
                        ev.preventDefault();
                        this._selectSource(currentItem);
                    }
                    break;
                case "Escape":
                    if (this.state.sources.length) {
                        this._closeAutoComplete();
                    }
                    break;
            }
        },
        /* eslint-enable complexity */
    });
});
