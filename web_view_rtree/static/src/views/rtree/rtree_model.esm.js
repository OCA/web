/** @odoo-module */

import {DynamicRecordList, Record, RelationalModel} from "@web/views/relational_model";

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
// can have children. The distinction is that what is called group here is not
// a record of the base model (and has only an id and a name), while a record
// is (and has thus all the fields displayed in the view). Because of this,
// only 2 classes are used: DynamicRTreeRecordList and RTreeRecord, which
// handle all the cases.
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
// columns; if it is false, it will appear as a group spanning all columns
// with only its name and the number of its children.
//
// Why display empty groups? It would be logical to think that empty groups
// could be ignored. It would indeed make sense to not display them because
// they do not show other data than their own name and are thus not that
// useful. However, they are shown for a simple reason: with the way the data
// is loaded, it is not possible to detect that children are empty groups. A
// parent could contain only empty groups. In that case, it would be possible
// to unfold it, but it would show no children, which would be confusing.
// Also, the number of children is displayed after the group name. If empty
// groups are not shown, the count could be wrong.

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

        if ("isFolded" in state) {
            this.isFolded = state.isFolded;
        } else if ("isFolded" in params) {
            this.isFolded = params.isFolded;
        } else {
            this.isFolded = true;
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
            parentID: this.resId,
            recordModel: params.recordModel,
            level: params.level + 1,
            recordFields: params.recordFields,
            recordActiveFields: params.recordActiveFields,
        };
        this.list = this.model.createDataPoint("list", listParams, state.listState);
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
        this.isFolded = !this.isFolded;
        await this.model.keepLast.add(this.loadChildren());
        this.model.notify();
    }
}

class DynamicRTreeRecordList extends DynamicRecordList {
    setup(params) {
        super.setup(...arguments);
        this.parentModel = params.parentModel;
        this.parentID = params.parentID;
        //
        // this.domain = params.domain;
        this.recordModel = params.recordModel || this.resModel;
        this.level = params.level || 0;
        this.recordFields = params.recordFields || params.fields;
        this.recordActiveFields = params.recordActiveFields || params.activeFields;
        this.computeParentParams = params.computeParentParams;
    }

    async load() {
        const parentParams = this.computeParentParams(this.parentModel, this.parentID);
        const recordPromises = parentParams.records.map(async (data) =>
            this._fetchRecords(data)
        );
        const groupPromises = parentParams.groups.map(async (data) =>
            this._fetchGroups(data)
        );
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
        this.records = await Promise.all(
            result.map(async (data) => {
                let fields = {},
                    activeFields = {},
                    values = null;
                if (data.model === this.recordModel) {
                    fields = this.recordFields;
                    activeFields = this.recordActiveFields;
                    values = data.record;
                }
                const record = this.model.createDataPoint("record", {
                    resModel: data.model,
                    resId: data.id,
                    fields: fields,
                    activeFields: activeFields,
                    rawContext: this.rawContext,
                    recordModel: this.recordModel,
                    numChildren: data.numChildren,
                    isRecord: data.record !== null,
                    displayName: data.name,
                    level: this.level,
                    recordFields: this.recordFields,
                    recordActiveFields: this.recordActiveFields,
                });
                await record.load({values: values});
                return record;
            })
        );
        this.count = this.records.length;
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
                const [id, name] = group[params.groupBy];
                const numChildren = group[params.groupBy + "_count"];
                let groupObj = modelGroups.groupsByID[id];
                if (groupObj === undefined) {
                    groupObj = {
                        id,
                        model,
                        name,
                        numChildren,
                        record: null,
                    };
                    modelGroups.groupsByID[id] = groupObj;
                    modelGroups.groups.push(groupObj);
                } else {
                    groupObj.numChildren += numChildren;
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
                    if (group !== undefined) {
                        numChildren = group.numChildren;
                        group.record = record;
                    }
                    resultRecords.push({
                        id: record.id,
                        model,
                        // FIXME: use the actual name field
                        name: record.name,
                        numChildren,
                        record,
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
                            // FIXME: use the actual name field
                            name: record.name,
                            numChildren: 0,
                            record: null,
                        };
                        modelGroups.groupsByID[record.id] = groupObj;
                        // FIXME: insert at correct sorted position
                        modelGroups.groups.push(groupObj);
                    }
                }
            }
        }
        let result = [];
        // Remove groups that have a corresponding record
        for (const group of groups.groups) {
            result = result.concat(group.groups.filter((g) => g.record === null));
        }
        result = result.concat(resultRecords);
        return result;
    }

    async _fetchRecords({model, domain}) {
        let fieldNames = [];
        if (model === this.recordModel) {
            fieldNames = this.fieldNames;
        } else {
            // FIXME: get the actual name field
            fieldNames = ["name"];
        }
        const kwargs = {};
        return this.model.orm.webSearchRead(model, domain, fieldNames, kwargs);
    }

    async _fetchGroups({model, groupBy, domain}) {
        const kwargs = {};
        return this.model.orm.webReadGroup(model, domain, [groupBy], [groupBy], kwargs);
    }
}

export class RTreeModel extends RelationalModel {
    setup(params, args) {
        super.setup(params, args);
        this.parentDefs = params.parentDefs;
        this.parentsMap = this._buildParentsMap(this.parentDefs);
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
                domain: parent.domain || null,
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
                domain: parent.domain || null,
            });
        }
        return {
            parentsMap,
            childrenMap,
            parentModels,
            childModels,
        };
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
            groupModel,
            groupBy: child.field,
        };
    }

    _computeRecordAndGroupParams(
        child,
        parentID,
        parentsMap,
        recordParams,
        groupParams
    ) {
        const recordParam = this._computeRecordParam(child, parentID);
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

    _computeRootParentParams(parentsMap, childrenMap, parentModels) {
        // FIXME: This part is hacky. It should be much simpler. Maybe include
        // a null parent in the parentsMaps?
        let recordParams = [];
        let groupParams = [];
        for (const model of parentModels) {
            const parents = childrenMap[model];
            if (parents === undefined) {
                recordParams.push({
                    model,
                    domain: [],
                });
            }
            const children = parentsMap[model];
            if (children !== undefined) {
                for (const child of children) {
                    if (parents === undefined) {
                        groupParams.push(this._computeGroupParam(child, model, []));
                    }
                    this._computeRecordAndGroupParams(
                        child,
                        false,
                        parentsMap,
                        recordParams,
                        groupParams
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

    computeParentParams(parentModel = null, parentID = null) {
        const {parentsMap, childrenMap, parentModels} = this.parentsMap;
        let recordParams = [];
        let groupParams = [];
        if (parentModel === null) {
            ({recordParams, groupParams} = this._computeRootParentParams(
                parentsMap,
                childrenMap,
                parentModels
            ));
        } else {
            for (const child of parentsMap[parentModel]) {
                this._computeRecordAndGroupParams(
                    child,
                    parentID,
                    parentsMap,
                    recordParams,
                    groupParams
                );
            }
        }
        return {
            records: recordParams,
            groups: groupParams,
        };
    }

    createDataPoint(type, params) {
        params.computeParentParams = (parentModel, parentID) => {
            return this.computeParentParams(parentModel, parentID);
        };
        return super.createDataPoint(...arguments);
    }
}

RTreeModel.Record = RTreeRecord;
RTreeModel.DynamicRecordList = DynamicRTreeRecordList;
