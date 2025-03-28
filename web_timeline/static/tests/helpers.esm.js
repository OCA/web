export const FAKE_ORDER_FIELDS = {
    display_name: {string: "Display Name", type: "char"},
    date_start: {string: "Date start", type: "date"},
    date_end: {string: "Date end", type: "date"},
    partner_id: {string: "Partner", type: "many2one", relation: "partner"},
};
