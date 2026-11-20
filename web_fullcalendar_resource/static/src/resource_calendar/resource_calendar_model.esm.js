import {CalendarModel} from "@web/views/calendar/calendar_model";

/**
 * Model for the "resource" view.
 *
 * On top of the records, it builds the list of resources (the columns) from the
 * relation pointed to by `resource_field`, and associates each record with the
 * list of resources it belongs to (`resourceIds`).
 *
 * By default, the displayed columns are the resources actually present in the
 * loaded records (scalable, including for a many2many field such as
 * `partner_ids`). A business module can display ALL the resources of a domain
 * by setting `showAllResources = true` and overriding `resourceDomain()`.
 */
export class ResourceCalendarModel extends CalendarModel {
    setup(params, services) {
        super.setup(params, services);
        this.data.resources = [];
    }

    get resourceField() {
        return this.meta.resourceField;
    }
    get resources() {
        return this.data.resources;
    }

    /**
     * If true, display every resource returned by `resourceDomain()` (even
     * without any event). Otherwise, only display the ones present in the loaded
     * records.
     */
    get showAllResources() {
        return false;
    }

    /**
     * Extension point: domain applied when `showAllResources` is true (e.g.
     * filtering by regional unit).
     * @returns {Array}
     */
    resourceDomain() {
        return [];
    }

    async updateData(data) {
        // Super loads data.records; the columns are then derived from them.
        await super.updateData(data);
        data.resources = await this.loadResources(data.records);
    }

    /**
     * @protected
     * @param {Object} records the loaded records (key = id)
     * @returns {Promise<Array<{id: string, title: string}>>}
     */
    async loadResources(records) {
        const field = this.meta.fields[this.resourceField];
        let domain = null;
        if (this.showAllResources) {
            domain = this.resourceDomain();
        } else {
            const ids = new Set();
            for (const record of Object.values(records)) {
                for (const id of record.resourceIds || []) {
                    ids.add(parseInt(id, 10));
                }
            }
            if (!ids.size) {
                return [];
            }
            domain = [["id", "in", [...ids]]];
        }
        const resources = await this.orm.searchRead(field.relation, domain, [
            "display_name",
        ]);
        return resources.map((rec) => ({
            id: String(rec.id),
            title: rec.display_name,
        }));
    }

    normalizeRecord(rawRecord) {
        const record = super.normalizeRecord(rawRecord);
        const field = this.meta.fields[this.resourceField];
        const rawValue = rawRecord[this.resourceField];
        let ids = [];
        if (rawValue) {
            if (["many2many", "one2many"].includes(field.type)) {
                ids = rawValue;
            } else if (Array.isArray(rawValue)) {
                ids = [rawValue[0]];
            } else {
                ids = [rawValue];
            }
        }
        record.resourceIds = ids.map(String);
        return record;
    }
}
