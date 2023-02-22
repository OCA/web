/** @odoo-module **/
import {registry} from "@web/core/registry";

export function findTrip(model, viewType) {
    const trips = registry.category("trips").getAll();
    const matchedTrips = _.filter(trips, function (trip) {
        return trip.selector(model, viewType);
    });
    if (matchedTrips.length >= 1) {
        if (matchedTrips.length != 1) {
            console.warning("More than one trip found", model, viewType);
        }
        return matchedTrips[0].Trip;
    }
    return null;
}
