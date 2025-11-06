import {SearchModel} from "@web/search/search_model";
import {patch} from "@web/core/utils/patch";
import {rankInterval} from "@web/search/utils/dates";

function processActiveItem(activeItem, queryElem) {
    if ("generatorId" in queryElem) {
        activeItem.generatorIds.push(queryElem.generatorId);
    } else if ("intervalId" in queryElem) {
        activeItem.intervalIds.push(queryElem.intervalId);
    } else if ("autocompleteValue" in queryElem) {
        activeItem.autocompleteValues.push(queryElem.autocompleteValue);
    }
}

function createActiveItem(searchItemId, queryElem) {
    if ("generatorId" in queryElem) {
        return {searchItemId, generatorIds: [queryElem.generatorId]};
    }
    if ("intervalId" in queryElem) {
        return {searchItemId, intervalIds: [queryElem.intervalId]};
    }
    if ("autocompleteValue" in queryElem) {
        return {searchItemId, autocompleteValues: [queryElem.autocompleteValue]};
    }
    return {searchItemId};
}

patch(SearchModel.prototype, {
    _getGroups() {
        const preGroups = [];
        for (const queryElem of this.query) {
            const {searchItemId} = queryElem;
            let {groupId} = this.searchItems[searchItemId];
            if ("autocompleteValue" in queryElem) {
                if (queryElem.autocompleteValue.isShiftKey) {
                    groupId = Math.random();
                }
            }
            let preGroup = preGroups.find((group) => group.id === groupId);
            if (!preGroup) {
                preGroup = {id: groupId, queryElements: []};
                preGroups.push(preGroup);
            }
            queryElem.groupId = groupId;
            preGroup.queryElements.push(queryElem);
        }
        const groups = [];
        for (const preGroup of preGroups) {
            const {queryElements, id} = preGroup;
            const activeItems = [];
            for (const queryElem of queryElements) {
                const {searchItemId} = queryElem;
                let activeItem = activeItems.find(
                    ({searchItemId: existingId}) => existingId === searchItemId
                );
                if (activeItem) {
                    processActiveItem(activeItem, queryElem);
                } else {
                    activeItem = createActiveItem(searchItemId, queryElem);
                    activeItems.push(activeItem);
                }
            }
            for (const activeItem of activeItems) {
                if ("intervalIds" in activeItem) {
                    activeItem.intervalIds.sort(
                        (g1, g2) => rankInterval(g1) - rankInterval(g2)
                    );
                }
            }
            groups.push({id, activeItems});
        }

        return groups;
    },
    deactivateGroup(groupId) {
        this.query = this.query.filter((queryElem) => {
            return queryElem.groupId !== groupId;
        });

        for (const partName in this.domainParts) {
            const part = this.domainParts[partName];
            if (part.groupId === groupId) {
                this.setDomainParts({[partName]: null});
            }
        }
        if (this._checkOrderByCountStatus) {
            this._checkOrderByCountStatus();
        } else if (this._checkComparisonStatus) {
            this._checkComparisonStatus();
        }
        this._notify();
    },
});
