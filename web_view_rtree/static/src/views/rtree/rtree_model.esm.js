/** @odoo-module */

import {DynamicRecordList, Record, RelationalModel} from "@web/views/relational_model";
import {InvalidDomainError} from "@web/core/domain";
import {WarningDialog} from "@web/core/errors/error_dialogs";

// Here is an explanation of how the data loading works.
//
// In a normal list (tree) view, each level contains either groups (controlled
// by the groupBy property) or records. Each level is handled by either a
// DynamicGroupList or a DynamicRecordList. The DynamicGroupList loads groups
// using webReadGroup() and creates a Group object for each. A Group contains
// a list, which is either a DynamicGroupList (if there are more groupBy
// properties) or a DynamicRecordList. The DynamicRecordList loads records
// using webSearchRead() and creates a Record object for each.
//
// In the rtree view, groups and records can appear at any level and records
// can have children. The distinction is that what is called a group here is
// actually a record of a secondary model, as opposed to those of the base or
// primary model that are called records. Because of this, only 2 classes are
// used: DynamicRTreeRecordList and RTreeRecord, which handle all the cases.
//
// A record has thus all the fields displayed in the view, while a group has
// by default only an id and a display_name, but other fields can also be
// used.
//
// What data is loaded (and how it is loaded) when opening a parent (a group
// or a record) to display its children (or when displaying the root) depends
// on the parents definition and the parent. A parent is a group or a record:
// it has a model and an id. At the root level there is no parent.
//
// When it is loaded, a DynamicRTreeRecordList makes webSearchRead() and
// webReadGroup() calls to retrieve the records and the groups that it
// contains. But it is not that simple: because webReadGroup() groups records,
// it only returns groups that have children, and the tree should also display
// empty groups (more on this later). Because of this, webSearchRead() calls
// are also made for models other than the base model. Moreover, there can be
// multiple webReadGroup() calls for the same model, because the groups
// themselves can be of different types.
//
// The received data is merged (see DynamicRTreeRecordList.load()) to have
// only one list of RTreeRecord objects, which can be of 4 types due to the
// combination of these 2 properties:
//
// 1. isRecord: if it is true, the model is the base model and the object
//    represents a record.
// 2. hasChildren: if it is true, the object has children and it can be
//    unfolded to load and display its children.
//
// The isRecord property controls how the RTreeRecord will be displayed: if it
// is true, it will appear as a record row with all its field values in the
// columns; if it is false, it will appear as a row with only its display_name
// and possibly some other values depending on which fields are defined in the
// secondary model field mapping.

// This is copied from web/views/relational_model, because not exported.
function orderByToString(orderBy) {
    return orderBy.map((o) => `${o.name} ${o.asc ? "ASC" : "DESC"}`).join(", ");
}

// This class is used for groups as well as for records.
class RTreeRecord extends Record {
    setup(params, state) {
        super.setup(...arguments);
        this.numChildren = params.numChildren;
        this.isRecord = params.isRecord;

        this.__rawValue = params.__rawValue;
        //
        // this.value = params.value;
        this.value = this.resId;
        this.displayName = params.displayName;
        //
        // this.aggregates = params.aggregates;
        this.aggregates = {};
        this.groupByField = {};
        this.level = params.level;
        this.parent = params.parent;

        if ("isFolded" in state) {
            this.isFolded = state.isFolded;
        } else if ("isFolded" in params) {
            this.isFolded = params.isFolded;
        } else {
            this.isFolded = true;
        }
        if (!this.hasChildren) {
            return;
        }
        const listParams = {
            data: params.data,
            rawContext: params.rawContext,
            orderBy: params.orderBy,
            resModel: params.resModel,
            activeFields: params.activeFields,
            fields: params.fields,
            //
            // limit: params.limit,
            // countLimit: params.count,
            // onCreateRecord: params.onCreateRecord,
            // onRecordWillSwitchMode: params.onRecordWillSwitchMode,
            defaultContext: params.defaultContext,
            parentModel: params.resModel,
            parent: this,
            parentID: this.resId,
            recordModel: params.recordModel,
            level: params.level + 1,
            recordFields: params.recordFields,
            recordActiveFields: params.recordActiveFields,
        };
        // The listState can be null if a record that has children had its
        // children removed by filtering before being reloaded.
        this.list = this.model.createDataPoint(
            "list",
            listParams,
            state.listState || {}
        );
    }

    async load(params = {}) {
        await super.load(params);
        await this.loadChildren();
    }

    exportState() {
        return {
            ...super.exportState(),
            resModel: this.resModel,
            isFolded: this.isFolded,
            listState: this.hasChildren ? this.list.exportState() : null,
        };
    }

    get hasChildren() {
        return this.numChildren > 0;
    }

    get count() {
        return this.numChildren;
    }

    async loadChildren() {
        if (!this.isFolded && this.count) {
            await this.list.load();
        }
    }

    async toggle() {
        if (!this.hasChildren) {
            return;
        }
        this.isFolded = !this.isFolded;
        await this.model.keepLast.add(this.loadChildren());
        this.model.notify();
    }

    async _update(changes, {silent} = {}) {
        if (this.isRecord) {
            return super._update(...arguments);
        }
        // Map fields to real field names
        const mappedChanges = {};
        for (const [k, v] of Object.entries(changes)) {
            mappedChanges[
                this.model.secondaryModelFieldsInverseMapping[this.resModel][k]
            ] = v;
        }
        return super._update(mappedChanges, {silent});
    }
}

class DynamicRTreeRecordList extends DynamicRecordList {
    setup(params, state) {
        super.setup(...arguments);
        // This is only set to let other modules know that this model has
        // groups, which is useful to play well with modules like
        // web_group_expand.
        this.isGrouped = true;
        this.parentModel = params.parentModel;
        this.parentID = params.parentID;
        this.parent = params.parent;
        //
        // this.domain = params.domain;
        this.recordModel = params.recordModel || this.resModel;
        this.level = params.level || 0;
        this.recordFields = params.recordFields || params.fields;
        this.recordActiveFields = params.recordActiveFields || params.activeFields;
        this.recordsState = state.recordsState || [];
        this.loaded = false;
        this._setPreviousOrderBy();
    }

    async load() {
        // This is also called when the sort order has changed.
        if (this.loaded) {
            if (JSON.stringify(this.orderBy) !== this.previousOrderByJSON) {
                return this._reorderRecords();
            }
            return;
        }
        const parentParams = this.model.computeParentParams(
            this.parentModel,
            this.parentID,
            this.domain
        );
        const recordPromises = parentParams.records.map(this._fetchRecords, this);
        const groupPromises = parentParams.groups.map(this._fetchGroups, this);
        const records = await Promise.all(recordPromises);
        const groups = await Promise.all(groupPromises);
        // We want a list where "groups" are first, then "records".
        // A "group" is either an entry of a different model than the base
        // model, or a group with no corresponding record (for example because
        // of filtering).
        // We have to match groups and records.
        // For each model, we have either a group, a record, or both.
        // How to control the final order? The order is controlled by the
        // parent definitions.
        // First, we have to merge the groups of the same model.
        const mergedGroups = this._mergeGroups(parentParams.groups, groups);
        // Then, we have to iterate over all records and:
        // * Remove groups of the same model that have a corresponding record
        //   and add the group information to the record.
        // * Add groups of other models for records that don’t have a
        //   corresponding group.
        const result = this._mergeGroupsAndRecords(
            parentParams.records,
            mergedGroups,
            records
        );
        const recordStateByModel = {};
        for (const recordState of this.recordsState) {
            let recordStateByID = recordStateByModel[recordState.resModel];
            if (recordStateByID === undefined) {
                recordStateByID = {};
                recordStateByModel[recordState.resModel] = recordStateByID;
            }
            recordStateByID[recordState.resId] = recordState;
        }
        for (const recordState of this.recordsState) {
            recordStateByModel[recordState.resModel][recordState.resId] = recordState;
        }
        this.records = await Promise.all(
            result.map(async (data) => {
                let fields = null,
                    activeFields = null;
                let values = data.record;
                const isRecord = data.model === this.recordModel;
                if (isRecord) {
                    fields = this.recordFields;
                    activeFields = this.recordActiveFields;
                } else {
                    fields = this.model.secondaryModelFields[data.model];
                    activeFields = fields;
                    const fieldsMapping =
                        this.model.secondaryModelFieldsMapping[data.model];
                    const mappedValues = {};
                    for (const [k, v] of Object.entries(fieldsMapping)) {
                        mappedValues[k] = values[v];
                    }
                    values = mappedValues;
                }
                let recordState = {};
                const recordStateByID = recordStateByModel[data.model];
                if (recordStateByID !== undefined) {
                    recordState = recordStateByID[data.id] || {};
                }
                const record = this.model.createDataPoint(
                    "record",
                    {
                        resModel: data.model,
                        resId: data.id,
                        fields: fields,
                        activeFields: activeFields,
                        rawContext: this.rawContext,
                        orderBy: this.orderBy,
                        recordModel: this.recordModel,
                        numChildren: data.numChildren,
                        isRecord,
                        displayName: data.displayName,
                        level: this.level,
                        parent: this.parent,
                        recordFields: this.recordFields,
                        recordActiveFields: this.recordActiveFields,
                        isFolded: data.isFolded,
                    },
                    recordState
                );
                await record.load({values: values});
                return record;
            })
        );
        this.count = this.records.length;
        this.loaded = true;
        this._setPreviousOrderBy();
    }

    exportState() {
        const recordsState = [];
        for (const record of this.records) {
            recordsState.push(record.exportState());
        }
        return {
            ...super.exportState(),
            recordsState,
        };
    }

    _mergeGroups(groupParams, groupsResponse) {
        const mergedGroups = [];
        const groupsByModel = {};
        for (let i = 0; i < groupParams.length; ++i) {
            const params = groupParams[i];
            const groups = groupsResponse[i].groups;
            const model = params.groupModel;
            let modelGroups = groupsByModel[model];
            if (modelGroups === undefined) {
                modelGroups = {
                    model,
                    groupsByID: {},
                    groups: [],
                };
                groupsByModel[params.groupModel] = modelGroups;
                mergedGroups.push(modelGroups);
            }
            for (const group of groups) {
                const [id, displayName] = group[params.groupBy];
                const numChildren = group[params.groupBy + "_count"];
                let groupObj = modelGroups.groupsByID[id];
                if (groupObj === undefined) {
                    groupObj = {
                        id,
                        model,
                        displayName,
                        numChildren,
                        record: null,
                        isFolded: !params.expand,
                    };
                    modelGroups.groupsByID[id] = groupObj;
                    modelGroups.groups.push(groupObj);
                } else {
                    groupObj.numChildren += numChildren;
                    groupObj.isFolded = groupObj.isFolded && !params.expand;
                }
            }
        }
        return {
            groups: mergedGroups,
            groupsByModel,
        };
    }

    _mergeGroupsAndRecords(recordParams, groups, recordsResponse) {
        const resultRecords = [];
        for (let i = 0; i < recordParams.length; ++i) {
            const params = recordParams[i];
            const records = recordsResponse[i].records;
            const model = params.model;
            const modelGroups = groups.groupsByModel[model];
            let groupsByID = {};
            if (modelGroups !== undefined) {
                groupsByID = modelGroups.groupsByID;
            }
            if (model === this.recordModel) {
                // Records should stay as records, but receive group
                // information from the corresponding group if it exists
                for (const record of records) {
                    const group = groupsByID[record.id];
                    let numChildren = 0;
                    let isFolded = true;
                    if (group !== undefined) {
                        numChildren = group.numChildren;
                        group.record = record;
                        isFolded = group.isFolded;
                    }
                    resultRecords.push({
                        id: record.id,
                        model,
                        // The record's display_name is not always available
                        // (depending on the fieldNames), and for records this
                        // property is anyway never displayed.
                        displayName: null,
                        numChildren,
                        record,
                        isFolded,
                    });
                }
            } else {
                // Records should become groups (if the corresponding group
                // does not exist already)
                for (const record of records) {
                    const group = groupsByID[record.id];
                    if (group === undefined) {
                        // Insert a new group
                        const groupObj = {
                            id: record.id,
                            model,
                            displayName: record.display_name,
                            numChildren: 0,
                            record,
                            isFolded: true,
                        };
                        modelGroups.groupsByID[record.id] = groupObj;
                        // FIXME: insert at correct sorted position
                        modelGroups.groups.push(groupObj);
                    } else {
                        group.record = record;
                    }
                }
            }
        }
        let result = [];
        // Remove groups that are of the primary model
        for (const group of groups.groups) {
            result = result.concat(
                group.groups.filter((g) => g.model !== this.recordModel)
            );
        }
        result = result.concat(resultRecords);
        return result;
    }

    async _fetchRecords({model, domain}) {
        let fieldNames = [];
        const kwargs = {
            context: this.context,
        };
        if (model === this.recordModel) {
            fieldNames = Object.keys(this.model.rootParams.activeFields);
            kwargs.order = orderByToString(this.orderBy);
        } else {
            fieldNames = Object.values(this.model.secondaryModelFieldsMapping[model]);
        }
        return this.model.orm.webSearchRead(model, domain, fieldNames, kwargs);
    }

    async _fetchGroups({model, groupBy, domain}) {
        const kwargs = {
            context: this.context,
        };
        return this.model.orm.webReadGroup(model, domain, [groupBy], [groupBy], kwargs);
    }

    _findRecordAndParentList(id) {
        // Find the record with the corresponding (datapoint) id and the
        // record list that contains it.
        for (const record of this.records) {
            if (record.id === id) {
                return [record, this];
            }
            if (record.hasChildren) {
                const subResult = record.list._findRecordAndParentList(id);
                if (subResult !== null) {
                    return subResult;
                }
            }
        }
        return null;
    }

    _replaceRecords(model, records) {
        // Replace the records (of the same model, which are always
        // contiguous) by the provided new array of records.
        const isModelRecord = (r) => r.resModel === model;
        const firstRecordIndex = this.records.findIndex(isModelRecord);
        const numRecords = this.records.filter(isModelRecord).length;
        this.records.splice(firstRecordIndex, numRecords, ...records);
    }

    _getValidTargetID(record, records, targetID) {
        if (targetID === null) {
            // A null targetID means the top of the rtree view. This is valid
            // only for the first root elements of the same model.
            const visibleRecords = this.model.getVisibleRecords();
            if (visibleRecords[0].id === records[0].id) {
                return targetID;
            }
            return false;
        }
        let targetRecord = records.find((r) => r.id === targetID);
        if (targetRecord !== undefined) {
            // The target record is a record from the same list as the moved
            // record.
            if (targetRecord.isFolded) {
                return targetID;
            }
            // If the target record is unfolded, it means that the record is
            // moved between the target and its first child.
            return false;
        }
        // We need to find whether targetID corresponds to the element that is
        // just above the first one of the list. This should work, as it means
        // that it is moved to the top of the list. In that case, targetID
        // should be null.
        const visibleRecords = this.model.getVisibleRecords();
        const firstRecordID = records[0].id;
        const firstRecordIndex = visibleRecords.findIndex(
            (r) => r.id === firstRecordID
        );
        if (
            firstRecordIndex !== 0 &&
            visibleRecords[firstRecordIndex - 1].id === targetID
        ) {
            return null;
        }
        // Last case to handle: the record is moved under the last visible
        // child of an unfolded sibling record. We need to find the parent of
        // the target that has the same level and the same model. This doesn't
        // necessarily mean that it is in the list, as itself can have a
        // different parent than the moved record.
        targetRecord = visibleRecords.find((r) => r.id === targetID);
        let parentRecord = targetRecord;
        while (parentRecord.level > record.level) {
            parentRecord = parentRecord.parent;
        }
        if (
            parentRecord.level !== record.level ||
            parentRecord.resModel !== record.resModel ||
            !records.includes(parentRecord)
        ) {
            return false;
        }
        const visibleChildren = this.model.getVisibleRecordsOfList(parentRecord.list);
        if (visibleChildren[visibleChildren.length - 1] === targetRecord) {
            return parentRecord.id;
        }
        return false;
    }

    async resequence(movedID, targetID) {
        // We need to find the list of records from which movedID comes.
        const [record, recordList] = this._findRecordAndParentList(movedID);
        let records = recordList.records.filter((r) => r.resModel === record.resModel);
        // TargetID could be a record from the list, but it could also be
        // from outside the list and still be valid. If it is invalid, it
        // meast that the record is being reparented. For now, this is not
        // supported.
        const validTargetID = this._getValidTargetID(record, records, targetID);
        // We cannot use !validTargetID because null is a valid target id.
        if (validTargetID === false) {
            this.model.errorDialog(
                this.model.env._t("Error"),
                this.model.env._t(
                    "It is not possible to reparent records in a tree view."
                )
            );
            return;
        }
        try {
            this.model.setModelForHandleField(record.resModel);
            records = await this._resequence(
                records,
                record.resModel,
                movedID,
                validTargetID
            );
        } finally {
            this.model.setModelForHandleField(null);
        }
        recordList._replaceRecords(record.resModel, records);
        this.model.notify();
    }

    _setPreviousOrderBy() {
        // The previous order is saved as JSON because this.orderBy is
        // modified in-place.
        this.previousOrderByJSON = JSON.stringify(this.orderBy);
    }

    async _fetchReorderIDs({model, domain}) {
        const fieldNames = ["id"];
        const kwargs = {
            context: this.context,
            order: orderByToString(this.orderBy),
        };
        const result = await this.model.orm.webSearchRead(
            model,
            domain,
            fieldNames,
            kwargs
        );
        return result.records.map((r) => r.id);
    }

    _getReorderedRecords(records, ids) {
        const idMap = {};
        for (const record of records) {
            idMap[record.resId] = record;
        }
        const result = [];
        for (const id of ids) {
            result.push(idMap[id]);
        }
        return result;
    }

    async _reorderChildren() {
        const childrenPromises = [];
        for (const record of this.records) {
            if (!record.hasChildren) {
                continue;
            }
            record.list.orderBy = this.orderBy;
            if (!record.list.loaded) {
                continue;
            }
            // This list is loaded. It order needs thus to be updated, whether
            // it is folded or not.
            childrenPromises.push(record.list._reorderRecords());
        }
        await Promise.all(childrenPromises);
    }

    async _reorderRecords() {
        // The orderBy property has changed. We need to:
        // 1. load the new order of the records
        // 2. re-order the records in-place
        // 3. do this recursively
        const parentParams = this.model.computeParentParams(
            this.parentModel,
            this.parentID,
            this.domain
        );
        // Filter parentParams.records to only keep the ones that match
        // recordModel.
        const recordQueryParams = parentParams.records.filter(
            (r) => r.model === this.recordModel
        );
        if (recordQueryParams.length > 1) {
            throw new Error(
                `Multiple query params found for model ${this.recordModel}`
            );
        }
        let orderPromise = null;
        let records = null;
        if (recordQueryParams.length === 1) {
            records = this.records.filter((r) => r.resModel === this.recordModel);
            if (records.length !== 0) {
                orderPromise = this._fetchReorderIDs(recordQueryParams[0]);
            }
        }
        const childrenPromise = this._reorderChildren();
        if (orderPromise !== null) {
            const ids = await orderPromise;
            const reorderedRecords = this._getReorderedRecords(records, ids);
            this._replaceRecords(this.recordModel, reorderedRecords);
        }
        await childrenPromise;
        this._setPreviousOrderBy();
    }
}

const GLOBAL_FILTER_FIELD = "display_name";

export class RTreeModel extends RelationalModel {
    setup(params, args) {
        this._origHandleField = null;
        super.setup(params, args);
        this.parentDefs = params.parentDefs;
        this.parentsMap = this._buildParentsMap(this.parentDefs);
        this.previousDomain = null;
        this._processFields();
    }

    _buildParentsMap(parentDefs) {
        const parentsMap = {};
        const childrenMap = {};
        const parentModels = [];
        const childModels = [];
        for (const parent of parentDefs) {
            let parentMap = parentsMap[parent.parent];
            if (parentMap === undefined) {
                parentMap = [];
                parentsMap[parent.parent] = parentMap;
                parentModels.push(parent.parent);
            }
            parentMap.push({
                model: parent.child,
                field: parent.field,
                domain: parent.domain,
                expand: parent.expand,
            });
            let childMap = childrenMap[parent.child];
            if (childMap === undefined) {
                childMap = [];
                childrenMap[parent.child] = childMap;
                childModels.unshift(parent.child);
            }
            childMap.unshift({
                model: parent.parent,
                field: parent.field,
                domain: parent.domain,
                expand: parent.expand,
            });
        }
        const allModels = [...parentModels];
        const allModelsSet = new Set(allModels);
        for (const model of childModels) {
            if (!allModelsSet.has(model)) {
                allModels.push(model);
                allModelsSet.add(model);
            }
        }
        return {
            parentsMap,
            childrenMap,
            parentModels,
            childModels,
            allModels,
        };
    }

    _processFields() {
        const secondaryModelFields = {};
        const secondaryModelFieldsMapping = {};
        const secondaryModelFieldsInverseMapping = {};
        for (const model of this.parentsMap.allModels) {
            if (model === this.rootParams.resModel) {
                continue;
            }
            secondaryModelFields[model] = {
                display_name: {name: "display_name"},
            };
            secondaryModelFieldsMapping[model] = {
                display_name: "display_name",
            };
            secondaryModelFieldsInverseMapping[model] = {
                display_name: "display_name",
            };
        }
        for (const [fieldName, field] of Object.entries(this.rootParams.activeFields)) {
            if (field.secondaryFields === undefined) {
                continue;
            }
            for (const [model, secondaryFieldName] of Object.entries(
                field.secondaryFields
            )) {
                const rawAttrs = {
                    ...field.rawAttrs,
                    name: secondaryFieldName,
                };
                secondaryModelFields[model][fieldName] = {
                    ...field,
                    name: secondaryFieldName,
                    rawAttrs,
                    // OnChange is not supported, as it would use the primary
                    // field name.
                    onChange: false,
                };
                secondaryModelFieldsMapping[model][fieldName] = secondaryFieldName;
                secondaryModelFieldsInverseMapping[model][secondaryFieldName] =
                    fieldName;
            }
        }
        this.secondaryModelFields = secondaryModelFields;
        this.secondaryModelFieldsMapping = secondaryModelFieldsMapping;
        this.secondaryModelFieldsInverseMapping = secondaryModelFieldsInverseMapping;
    }

    async _expandAll(list) {
        // This is needed to avoid declaring a function in a loop.
        const makeExpandAllPromise = (recordList) => {
            return async () => this._expandAll(recordList);
        };
        const promises = [];
        for (const record of list.records) {
            if (record.hasChildren) {
                if (record.isFolded) {
                    record.isFolded = false;
                    promises.push(
                        record.loadChildren().then(makeExpandAllPromise(record.list))
                    );
                } else {
                    promises.push(this._expandAll(record.list));
                }
            }
        }
        return Promise.all(promises);
    }

    async _getGlobalFilterResult(globalFilterElement) {
        const promises = [];
        const name = globalFilterElement[2];
        const filterResult = {};
        for (const model of this.parentsMap.allModels) {
            promises.push(this._addGlobalFilterResult(filterResult, model, name));
        }
        await Promise.all(promises);
        return filterResult;
    }

    async _addGlobalFilterResult(filterResult, model, name) {
        const result = await this.orm.call(model, "name_search", [], {
            name,
            limit: null,
            context: this.rootParams.context,
        });
        filterResult[model] = new Set(result.map((record) => record[0]));
    }

    _filterAll(list, filterResult) {
        const newRecordsList = [];
        for (const record of list.records) {
            if (record.hasChildren) {
                record.numChildren = this._filterAll(record.list, filterResult);
            }
            if (record.hasChildren || filterResult[record.resModel].has(record.resId)) {
                newRecordsList.push(record);
            }
        }
        list.records = newRecordsList;
        return newRecordsList.length;
    }

    _parseDomainOperator(operator) {
        let numElements = 0;
        switch (operator) {
            case "&":
            case "|":
                numElements = 2;
                break;
            case "!":
                numElements = 1;
                break;
            default:
                return null;
        }
        return {
            operator,
            numElements,
        };
    }

    _parseDomain(domain) {
        // Check that GLOBAL_FILTER_FIELD is only used once and at the top
        // level, possibly with an & operator.
        const newDomain = [];
        let globalFilterElement = null;
        const operatorStack = [];
        let currentOperator = null;
        for (const element of domain) {
            if (currentOperator !== null) {
                --currentOperator.numElements;
            }
            if (typeof element === "string") {
                if (currentOperator !== null) {
                    operatorStack.push(currentOperator);
                }
                currentOperator = this._parseDomainOperator(element);
                if (currentOperator === null) {
                    throw new InvalidDomainError("Invalid domain: " + domain);
                }
                if (operatorStack.length === 0 && currentOperator.operator === "&") {
                    // Ignore the & operator at the top level, as it is the
                    // default way of combining domain elements.
                    currentOperator = null;
                } else {
                    newDomain.push(currentOperator.operator);
                }
            } else if (element[0] === GLOBAL_FILTER_FIELD) {
                if (globalFilterElement !== null || currentOperator !== null) {
                    // GLOBAL_FILTER_FIELD is used more than once, is not at
                    // the top level or is not used with an & operator.
                    // This is not supported.
                    return {
                        newDomain: null,
                        globalFilterElement,
                    };
                }
                globalFilterElement = element;
            } else {
                newDomain.push(element);
            }
            while (currentOperator !== null) {
                if (currentOperator.numElements !== 0) {
                    break;
                }
                if (operatorStack.length) {
                    currentOperator = operatorStack.pop();
                } else {
                    currentOperator = null;
                }
            }
        }
        return {
            newDomain,
            globalFilterElement,
        };
    }

    // Here is an explanation of how filtering (on display_name of all records
    // of all models) works. This is a naive and slow, but straightforward and
    // easy approach.
    //
    // 1. If a domain is provided, it is parsed to check whether one of its
    //    elements uses the GLOBAL_FILTER_FIELD field. If one does, it is
    //    removed from the domain to not conflict with the domain of the view.
    // 2. The model is loaded if it is not already loaded. This is checked by
    //    comparing the previous domain used to load with the new one.
    // 3. The tree is fully expanded (which results in the whole tree being
    //    loaded).
    // 4. In parallel to the loading of the whole tree, a set of name_search
    //    calls are made, one for each model present in the view, with the
    //    name extracted from the domain. From this, sets of matching ids for
    //    each model are constructed. These are stored in the
    //    globalFilterResult variable.
    // 5. The tree is traversed recursively to filter it, to only display
    //    matching records and their parents, up to the root.
    //
    // Known issues:
    //
    // * The filtering only works with a simple filter, not with | or &
    //   operators, thus entering two values to filter on does not work.
    // * The tree loses its state when applying filtering: all elements that
    //   pass the filter and have (even filtered-out) children are expanded,
    //   and filtered-out elements will return to their default state when the
    //   filter will be removed.

    async load(params = {}) {
        const domain = params.domain;
        const {newDomain, globalFilterElement} = this._parseDomain(domain);
        if (newDomain === null) {
            this.errorDialog(
                this.env._t("Error"),
                this.env._t(
                    "This type of search domain is not supported in a tree view."
                )
            );
            return;
        }
        if (globalFilterElement === null) {
            this.previousDomain = domain;
            return await super.load(params);
        }
        params.domain = newDomain;
        let mainPromise = null;
        if (JSON.stringify(this.previousDomain) === JSON.stringify(newDomain)) {
            mainPromise = Promise.resolve();
        } else {
            mainPromise = super.load(params);
        }
        this.previousDomain = null;
        mainPromise = mainPromise.then(async () => this._expandAll(this.root));
        const globalFilterResult = await this._getGlobalFilterResult(
            globalFilterElement
        );
        await mainPromise;
        this._filterAll(this.root, globalFilterResult);
        this.notify();
    }

    _computeChildParam(child, parentDomain) {
        let domain = child.domain;
        if (domain === null) {
            domain = parentDomain;
        } else {
            domain = domain.concat(parentDomain);
        }
        return {
            model: child.model,
            domain,
        };
    }

    _computeRecordParam(child, parentID) {
        const parentDomain = [[child.field, "=", parentID]];
        return this._computeChildParam(child, parentDomain);
    }

    _computeGroupParam(child, groupModel, groupDomain) {
        let parentDomain = null;
        if (groupDomain.length === 0) {
            parentDomain = [[child.field, "!=", false]];
        } else {
            parentDomain = groupDomain.map((e) => {
                if (e.length === 3) {
                    return [[child.field, e[0]].join("."), e[1], e[2]];
                }
                return e;
            });
        }
        return {
            ...this._computeChildParam(child, parentDomain),
            expand: child.expand,
            groupModel,
            groupBy: child.field,
        };
    }

    _computeRecordAndGroupParams(
        child,
        parentID,
        parentsMap,
        recordParams,
        groupParams,
        domain
    ) {
        if (
            !parentID &&
            domain.length !== 0 &&
            child.model !== this.rootParams.resModel
        ) {
            // When a domain is defined, root-level elements of other models
            // than the record model should be ignored.
            return;
        }
        let recordParam = null;
        if (parentID || domain.length === 0) {
            recordParam = this._computeRecordParam(child, parentID);
        } else {
            recordParam = this._computeChildParam(child, domain);
        }
        recordParams.push(recordParam);
        const groupChildren = parentsMap[child.model];
        if (groupChildren !== undefined) {
            for (const groupChild of groupChildren) {
                groupParams.push(
                    this._computeGroupParam(
                        groupChild,
                        recordParam.model,
                        recordParam.domain
                    )
                );
            }
        }
    }

    _computeRootParentParams(parentsMap, childrenMap, parentModels, domain) {
        // FIXME: This part is hacky. It should be much simpler. Maybe include
        // a null parent in the parentsMaps?
        let recordParams = [];
        let groupParams = [];
        for (const model of parentModels) {
            if (domain.length !== 0 && model !== this.rootParams.resModel) {
                // When a domain is defined, it must be applied only to
                // elements of the record model.
                continue;
            }
            const parents = childrenMap[model];
            if (parents === undefined) {
                recordParams.push({
                    model,
                    domain,
                });
            }
            const children = parentsMap[model];
            if (children !== undefined) {
                for (const child of children) {
                    if (parents === undefined) {
                        groupParams.push(this._computeGroupParam(child, model, domain));
                    }
                    this._computeRecordAndGroupParams(
                        child,
                        false,
                        parentsMap,
                        recordParams,
                        groupParams,
                        domain
                    );
                }
            }
            // Remove extraneous entries
            const seenModels = {};
            recordParams = recordParams.filter((e) => {
                if (seenModels[e.model]) {
                    return false;
                }
                seenModels[e.model] = true;
                return true;
            });
            const seenGroups = {};
            groupParams = groupParams.filter((e) => {
                const key = `${e.model},${e.groupModel},${e.groupBy}`;
                if (seenGroups[key]) {
                    return false;
                }
                seenGroups[key] = true;
                return true;
            });
        }
        return {
            recordParams,
            groupParams,
        };
    }

    computeParentParams(parentModel = null, parentID = null, domain = []) {
        const {parentsMap, childrenMap, parentModels} = this.parentsMap;
        let recordParams = [];
        let groupParams = [];
        if (parentModel === null) {
            ({recordParams, groupParams} = this._computeRootParentParams(
                parentsMap,
                childrenMap,
                parentModels,
                domain
            ));
        } else {
            for (const child of parentsMap[parentModel]) {
                this._computeRecordAndGroupParams(
                    child,
                    parentID,
                    parentsMap,
                    recordParams,
                    groupParams,
                    domain
                );
            }
        }
        return {
            records: recordParams,
            groups: groupParams,
        };
    }

    errorDialog(title, message) {
        this.dialogService.add(WarningDialog, {
            title,
            message,
        });
    }

    get handleField() {
        return this._currentHandleField || this._origHandleField;
    }

    set handleField(field) {
        this._origHandleField = field;
    }

    setModelForHandleField(model) {
        if (model in this.secondaryModelFields) {
            this._currentHandleField =
                this.secondaryModelFields[model][this._origHandleField].name;
        } else {
            this._currentHandleField = null;
        }
    }

    getVisibleRecordsOfList(list) {
        const result = [];
        for (const record of list.records) {
            result.push(record);
            if (record.hasChildren && !record.isFolded) {
                result.push(...this.getVisibleRecordsOfList(record.list));
            }
        }
        return result;
    }

    // Compute the list of all records that are visible (not child of a folded
    // parent) and return it as a flat list.
    getVisibleRecords() {
        return this.getVisibleRecordsOfList(this.root);
    }
}

RTreeModel.Record = RTreeRecord;
RTreeModel.DynamicRecordList = DynamicRTreeRecordList;
