odoo.define('web_export_view.data_export_tests', function (require) {
"use strict";

var ListView = require('web.ListView');
var testUtils = require('web.test_utils');

var createView = testUtils.createView;

QUnit.module('web_export_view', {
    beforeEach: function () {
        this.data = {
            user: {
                fields: {
                    name: {
                        string: "Name",
                        type: "char",
                        },
                    company_ids: {
                        string: "Companies",
                        type: "one2many",
                        relation: "company",
                        },
                },
                records: [
                    {
                        id: 1,
                        name: "User in all companies",
                        company_ids: [1, 2],
                    },
                    {
                        id: 2,
                        name: "User in company 1",
                        company_ids: [1],
                    },
                    {
                        id: 3,
                        name: "User in company 2",
                        company_ids: [2],
                    },
                    {
                        id: 4,
                        name: "User in no company",
                        company_ids: [],
                    },
                ]
            },
            company: {
                fields: {
                    name: {
                        string: "Name",
                        type: "char",
                        },
                },
                records: [
                    {
                        id: 1,
                        name: "Company 1",
                        display_name: "Display company 1",
                    },
                    {
                        id: 2,
                        name: "Company 2",
                        display_name: "Display company 2",
                    },
                ]
            },
        };
    }
}, function () {

    QUnit.test('Exporting many2many_tags widget', function (assert) {
        var data_companies = this.data.company.records;
        assert.expect(1 + data_companies.length);

        var list = createView({
            View: ListView,
            model: 'user',
            data: this.data,
            arch:
                '<tree>' +
                    '<field name="name"/>' +
                    '<field name="company_ids" widget="many2many_tags"/>' +
                '</tree>',
            viewOptions: {
                hasSidebar: true,
                },
            session: {
                get_file: function (params) {
                    // Find line for user in all companies
                    var rows = JSON.parse(params.data.data).rows;
                    var file_companies_text = rows.find(r => r[0] === "User in all companies")[1];
                    var file_companies = file_companies_text.split('\n');

                    // Check that there is exactly one line per company
                    assert.equal(
                        file_companies.length,
                        data_companies.length,
                        "Companies field in file has as many lines as defined companies"
                        );
                    for (let data_company of data_companies) {
                        assert.ok(
                            file_companies.includes(data_company.display_name),
                            "Company " + data_company.id + " is exported"
                            );
                    }

                    params.complete();
                },
            },
        });

        // Select all lines and export
        list.$('thead th.o_list_record_selector input').click();
        list.sidebar.$("button.export_treeview_xls").click();

        // Cleanup
        list.destroy();
    });
});

});
