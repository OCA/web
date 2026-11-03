import {SEARCH_KEYS} from "@web/search/with_search/with_search";

// Pivot and graph reloads run read_group over the whole domain, so they are
// spaced further apart than list reloads.
export const AGGREGATE_MIN_INTERVAL_MS = 30000;

export function searchParamsFromProps(props) {
    return Object.fromEntries(SEARCH_KEYS.map((key) => [key, props[key]]));
}
