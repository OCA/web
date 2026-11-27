import {SearchModel} from "@web/search/search_model";
import {patch} from "@web/core/utils/patch";
import {toRaw} from "@odoo/owl";

patch(SearchModel.prototype, {
    addAutoCompletionValues(searchItemId, autocompleteValue) {
        if (!autocompleteValue.isShiftKey) {
            return super.addAutoCompletionValues(...arguments);
        }
        const searchItem = this.searchItems[searchItemId];
        if (!["field", "field_property"].includes(searchItem.type)) {
            return;
        }
        const {value, operator} = autocompleteValue;
        const alreadyAnded = this.query.some(
            (queryElem) =>
                queryElem.andGroupId !== undefined &&
                queryElem.searchItemId === searchItemId &&
                queryElem.autocompleteValue.value === value &&
                queryElem.autocompleteValue.operator === operator
        );
        if (alreadyAnded) {
            return;
        }
        // A value added with shift goes in a facet of its own, combined with AND
        this.query.push({
            searchItemId,
            autocompleteValue,
            andGroupId: this.nextGroupId++,
        });
        this._notify();
    },

    deactivateGroup(groupId) {
        const isAndGroup = this.query.some(
            (queryElem) => queryElem.andGroupId === groupId
        );
        const isFieldGroupWithAnd = this.query.some(
            (queryElem) =>
                queryElem.andGroupId !== undefined &&
                this.searchItems[queryElem.searchItemId].groupId === groupId
        );
        if (!isAndGroup && !isFieldGroupWithAnd) {
            return super.deactivateGroup(...arguments);
        }
        // The core removes every query element of the field group; keep the AND
        // facets of that field and remove an AND facet on its own.
        const query = this.query.slice();
        const blockNotification = this.blockNotification;
        this.blockNotification = true;
        try {
            super.deactivateGroup(...arguments);
        } finally {
            this.blockNotification = blockNotification;
        }
        const kept = new Set(this.query.map(toRaw));
        this.query.length = 0;
        this.query.push(
            ...query.filter((queryElem) =>
                queryElem.andGroupId === undefined
                    ? kept.has(toRaw(queryElem))
                    : queryElem.andGroupId !== groupId
            )
        );
        this._checkOrderByCountStatus();
        this._notify();
    },

    _getGroups() {
        const preGroups = [];
        for (const queryElem of this.query) {
            const {searchItemId} = queryElem;
            const groupId =
                queryElem.andGroupId === undefined
                    ? this.searchItems[searchItemId].groupId
                    : queryElem.andGroupId;
            let preGroup = preGroups.find((group) => group.id === groupId);
            if (!preGroup) {
                preGroup = {id: groupId, queryElements: []};
                preGroups.push(preGroup);
            }
            preGroup.queryElements.push(queryElem);
        }
        const groups = [];
        for (const preGroup of preGroups) {
            const {queryElements, id} = preGroup;
            const activeItems = [];
            for (const queryElem of queryElements) {
                const {searchItemId} = queryElem;
                let activeItem = activeItems.find(
                    ({searchItemId: itemId}) => itemId === searchItemId
                );
                if ("generatorId" in queryElem) {
                    if (!activeItem) {
                        activeItem = {searchItemId, generatorIds: []};
                        activeItems.push(activeItem);
                    }
                    activeItem.generatorIds.push(queryElem.generatorId);
                } else if ("intervalId" in queryElem) {
                    if (!activeItem) {
                        activeItem = {searchItemId, intervalIds: []};
                        activeItems.push(activeItem);
                    }
                    activeItem.intervalIds.push(queryElem.intervalId);
                } else if ("autocompleteValue" in queryElem) {
                    if (!activeItem) {
                        activeItem = {searchItemId, autocompleteValues: []};
                        activeItems.push(activeItem);
                    }
                    activeItem.autocompleteValues.push(queryElem.autocompleteValue);
                } else if ("optionId" in queryElem) {
                    if (!activeItem) {
                        const {optionId, offset = 0} = queryElem;
                        activeItem = {searchItemId, optionId, offset};
                        activeItems.push(activeItem);
                    }
                } else if (!activeItem) {
                    activeItem = {searchItemId};
                    activeItems.push(activeItem);
                }
            }
            for (const activeItem of activeItems) {
                if ("intervalIds" in activeItem) {
                    activeItem.intervalIds.sort(
                        (g1, g2) => this._rankInterval(g1) - this._rankInterval(g2)
                    );
                }
            }
            groups.push({id, activeItems});
        }
        return groups;
    },
});
