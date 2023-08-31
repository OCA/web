/** @odoo-module */

import {RTreeModel} from "../src/views/rtree/rtree_model.esm";

QUnit.module("RTree", () => {
    QUnit.test("should compute the correct query parameters", (assert) => {
        const taskParentDefs = [
            {
                parent: "project.project",
                child: "project.task",
                field: "project_id",
                domain: [["parent_id", "=", false]],
            },
            {
                parent: "project.task",
                child: "project.task",
                field: "parent_id",
            },
        ];
        let model = new RTreeModel({}, {parentDefs: taskParentDefs}, {});
        assert.deepEqual(model.computeParentParams(null, null), {
            records: [
                {
                    model: "project.project",
                    domain: [],
                },
                {
                    model: "project.task",
                    domain: [
                        ["parent_id", "=", false],
                        ["project_id", "=", false],
                    ],
                },
            ],
            groups: [
                {
                    model: "project.task",
                    groupBy: "project_id",
                    groupModel: "project.project",
                    domain: [
                        ["parent_id", "=", false],
                        ["project_id", "!=", false],
                    ],
                },
                {
                    model: "project.task",
                    groupBy: "parent_id",
                    groupModel: "project.task",
                    domain: [
                        ["parent_id.parent_id", "=", false],
                        ["parent_id.project_id", "=", false],
                    ],
                },
            ],
        });
        assert.deepEqual(model.computeParentParams("project.project", 42), {
            records: [
                {
                    model: "project.task",
                    domain: [
                        ["parent_id", "=", false],
                        ["project_id", "=", 42],
                    ],
                },
            ],
            groups: [
                {
                    model: "project.task",
                    groupBy: "parent_id",
                    groupModel: "project.task",
                    domain: [
                        ["parent_id.parent_id", "=", false],
                        ["parent_id.project_id", "=", 42],
                    ],
                },
            ],
        });
        assert.deepEqual(model.computeParentParams("project.task", 40), {
            records: [
                {
                    model: "project.task",
                    domain: [["parent_id", "=", 40]],
                },
            ],
            groups: [
                {
                    model: "project.task",
                    groupBy: "parent_id",
                    groupModel: "project.task",
                    domain: [["parent_id.parent_id", "=", 40]],
                },
            ],
        });
        const fileParentDefs = [
            {
                parent: "filesystem.directory",
                child: "filesystem.directory",
                field: "parent_id",
            },
            {
                parent: "filesystem.directory",
                child: "filesystem.file",
                field: "directory_id",
            },
        ];
        model = new RTreeModel({}, {parentDefs: fileParentDefs}, {});
        assert.deepEqual(model.computeParentParams(null, null), {
            records: [
                {
                    model: "filesystem.directory",
                    domain: [["parent_id", "=", false]],
                },
                {
                    model: "filesystem.file",
                    domain: [["directory_id", "=", false]],
                },
            ],
            groups: [
                {
                    model: "filesystem.directory",
                    groupBy: "parent_id",
                    groupModel: "filesystem.directory",
                    domain: [["parent_id.parent_id", "=", false]],
                },
                {
                    model: "filesystem.file",
                    groupBy: "directory_id",
                    groupModel: "filesystem.directory",
                    domain: [["directory_id.parent_id", "=", false]],
                },
            ],
        });
        assert.deepEqual(model.computeParentParams("filesystem.directory", 42), {
            records: [
                {
                    model: "filesystem.directory",
                    domain: [["parent_id", "=", 42]],
                },
                {
                    model: "filesystem.file",
                    domain: [["directory_id", "=", 42]],
                },
            ],
            groups: [
                {
                    model: "filesystem.directory",
                    groupBy: "parent_id",
                    groupModel: "filesystem.directory",
                    domain: [["parent_id.parent_id", "=", 42]],
                },
                {
                    model: "filesystem.file",
                    groupBy: "directory_id",
                    groupModel: "filesystem.directory",
                    domain: [["directory_id.parent_id", "=", 42]],
                },
            ],
        });
        const abcParentDefs = [
            {
                parent: "abc.a",
                child: "abc.b",
                field: "a_id",
                domain: [["parent_id", "=", false]],
            },
            {
                parent: "abc.b",
                child: "abc.b",
                field: "parent_id",
            },
            {
                parent: "abc.b",
                child: "abc.c",
                field: "b_id",
            },
            {
                parent: "abc.c",
                child: "abc.d",
                field: "c_id",
                domain: [["parent_id", "=", false]],
            },
            {
                parent: "abc.d",
                child: "abc.d",
                field: "parent_id",
            },
            {
                parent: "abc.d",
                child: "abc.e",
                field: "d_id",
                domain: [["parent_id", "=", false]],
            },
            {
                parent: "abc.e",
                child: "abc.e",
                field: "parent_id",
            },
            {
                parent: "abc.e",
                child: "abc.f",
                field: "e_id",
            },
        ];
        model = new RTreeModel({}, {parentDefs: abcParentDefs}, {});
        assert.deepEqual(model.computeParentParams(null, null), {
            records: [
                {
                    model: "abc.a",
                    domain: [],
                },
                {
                    model: "abc.b",
                    domain: [
                        ["parent_id", "=", false],
                        ["a_id", "=", false],
                    ],
                },
                {
                    model: "abc.c",
                    domain: [["b_id", "=", false]],
                },
                {
                    model: "abc.d",
                    domain: [
                        ["parent_id", "=", false],
                        ["c_id", "=", false],
                    ],
                },
                {
                    model: "abc.e",
                    domain: [
                        ["parent_id", "=", false],
                        ["d_id", "=", false],
                    ],
                },
                {
                    model: "abc.f",
                    domain: [["e_id", "=", false]],
                },
            ],
            groups: [
                {
                    model: "abc.b",
                    groupBy: "a_id",
                    groupModel: "abc.a",
                    domain: [
                        ["parent_id", "=", false],
                        ["a_id", "!=", false],
                    ],
                },
                {
                    model: "abc.b",
                    groupBy: "parent_id",
                    groupModel: "abc.b",
                    domain: [
                        ["parent_id.parent_id", "=", false],
                        ["parent_id.a_id", "=", false],
                    ],
                },
                {
                    model: "abc.c",
                    groupBy: "b_id",
                    groupModel: "abc.b",
                    domain: [
                        ["b_id.parent_id", "=", false],
                        ["b_id.a_id", "=", false],
                    ],
                },
                {
                    model: "abc.d",
                    groupBy: "c_id",
                    groupModel: "abc.c",
                    domain: [
                        ["parent_id", "=", false],
                        ["c_id.b_id", "=", false],
                    ],
                },
                {
                    model: "abc.d",
                    groupBy: "parent_id",
                    groupModel: "abc.d",
                    domain: [
                        ["parent_id.parent_id", "=", false],
                        ["parent_id.c_id", "=", false],
                    ],
                },
                {
                    model: "abc.e",
                    groupBy: "d_id",
                    groupModel: "abc.d",
                    domain: [
                        ["parent_id", "=", false],
                        ["d_id.parent_id", "=", false],
                        ["d_id.c_id", "=", false],
                    ],
                },
                {
                    model: "abc.e",
                    groupBy: "parent_id",
                    groupModel: "abc.e",
                    domain: [
                        ["parent_id.parent_id", "=", false],
                        ["parent_id.d_id", "=", false],
                    ],
                },
                {
                    model: "abc.f",
                    groupBy: "e_id",
                    groupModel: "abc.e",
                    domain: [
                        ["e_id.parent_id", "=", false],
                        ["e_id.d_id", "=", false],
                    ],
                },
            ],
        });
        assert.deepEqual(model.computeParentParams("abc.a", 42), {
            records: [
                {
                    model: "abc.b",
                    domain: [
                        ["parent_id", "=", false],
                        ["a_id", "=", 42],
                    ],
                },
            ],
            groups: [
                {
                    model: "abc.b",
                    groupBy: "parent_id",
                    groupModel: "abc.b",
                    domain: [
                        ["parent_id.parent_id", "=", false],
                        ["parent_id.a_id", "=", 42],
                    ],
                },
                {
                    model: "abc.c",
                    groupBy: "b_id",
                    groupModel: "abc.b",
                    domain: [
                        ["b_id.parent_id", "=", false],
                        ["b_id.a_id", "=", 42],
                    ],
                },
            ],
        });
        assert.deepEqual(model.computeParentParams("abc.b", 42), {
            records: [
                {
                    model: "abc.b",
                    domain: [["parent_id", "=", 42]],
                },
                {
                    model: "abc.c",
                    domain: [["b_id", "=", 42]],
                },
            ],
            groups: [
                {
                    model: "abc.b",
                    groupBy: "parent_id",
                    groupModel: "abc.b",
                    domain: [["parent_id.parent_id", "=", 42]],
                },
                {
                    model: "abc.c",
                    groupBy: "b_id",
                    groupModel: "abc.b",
                    domain: [["b_id.parent_id", "=", 42]],
                },
                {
                    model: "abc.d",
                    groupBy: "c_id",
                    groupModel: "abc.c",
                    domain: [
                        ["parent_id", "=", false],
                        ["c_id.b_id", "=", 42],
                    ],
                },
            ],
        });
        assert.deepEqual(model.computeParentParams("abc.c", 42), {
            records: [
                {
                    model: "abc.d",
                    domain: [
                        ["parent_id", "=", false],
                        ["c_id", "=", 42],
                    ],
                },
            ],
            groups: [
                {
                    model: "abc.d",
                    groupBy: "parent_id",
                    groupModel: "abc.d",
                    domain: [
                        ["parent_id.parent_id", "=", false],
                        ["parent_id.c_id", "=", 42],
                    ],
                },
                {
                    model: "abc.e",
                    groupBy: "d_id",
                    groupModel: "abc.d",
                    domain: [
                        ["parent_id", "=", false],
                        ["d_id.parent_id", "=", false],
                        ["d_id.c_id", "=", 42],
                    ],
                },
            ],
        });
        assert.deepEqual(model.computeParentParams("abc.d", 42), {
            records: [
                {
                    model: "abc.d",
                    domain: [["parent_id", "=", 42]],
                },
                {
                    model: "abc.e",
                    domain: [
                        ["parent_id", "=", false],
                        ["d_id", "=", 42],
                    ],
                },
            ],
            groups: [
                {
                    model: "abc.d",
                    groupBy: "parent_id",
                    groupModel: "abc.d",
                    domain: [["parent_id.parent_id", "=", 42]],
                },
                {
                    model: "abc.e",
                    groupBy: "d_id",
                    groupModel: "abc.d",
                    domain: [
                        ["parent_id", "=", false],
                        ["d_id.parent_id", "=", 42],
                    ],
                },
                {
                    model: "abc.e",
                    groupBy: "parent_id",
                    groupModel: "abc.e",
                    domain: [
                        ["parent_id.parent_id", "=", false],
                        ["parent_id.d_id", "=", 42],
                    ],
                },
                {
                    model: "abc.f",
                    groupBy: "e_id",
                    groupModel: "abc.e",
                    domain: [
                        ["e_id.parent_id", "=", false],
                        ["e_id.d_id", "=", 42],
                    ],
                },
            ],
        });
        assert.deepEqual(model.computeParentParams("abc.e", 42), {
            records: [
                {
                    model: "abc.e",
                    domain: [["parent_id", "=", 42]],
                },
                {
                    model: "abc.f",
                    domain: [["e_id", "=", 42]],
                },
            ],
            groups: [
                {
                    model: "abc.e",
                    groupBy: "parent_id",
                    groupModel: "abc.e",
                    domain: [["parent_id.parent_id", "=", 42]],
                },
                {
                    model: "abc.f",
                    groupBy: "e_id",
                    groupModel: "abc.e",
                    domain: [["e_id.parent_id", "=", 42]],
                },
            ],
        });
    });
});
