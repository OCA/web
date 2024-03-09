# Copyright 2021 Sergey Shebanin
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

import json

from odoo.tests.common import HttpCase, SingleTransactionCase, tagged


@tagged("post_install", "-at_install")
class TestCheckController(SingleTransactionCase, HttpCase):
    def post_json(self, url, data):
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        res = self.url_open(
            url,
            data=json.dumps({"params": data}),
            headers=headers,
        )
        self.assertEqual(200, res.status_code)
        res = json.loads(res.content.decode("utf-8"))
        return res.get("result")

    def setUp(self):
        super(TestCheckController, self).setUp()
        self.authenticate("admin", "admin")
        stub_function = "Web Refresh Test"
        self.domain = [("function", "=", stub_function)]
        self.first_company = self.env["res.partner"].create(
            {
                "name": "First company",
                "is_company": True,
                "type": "contact",
                "function": stub_function,
            }
        )
        self.second_company = self.env["res.partner"].create(
            {
                "name": "Second company",
                "is_company": True,
                "type": "contact",
                "function": stub_function,
            }
        )
        self.env["res.partner"].flush()
        self.first_person = self.env["res.partner"].create(
            {
                "name": "First person",
                "parent_id": self.first_company.id,
                "type": "contact",
                "color": 1,
                "function": stub_function,
            }
        )
        self.second_person = self.env["res.partner"].create(
            {
                "name": "Second person",
                "parent_id": self.first_company.id,
                "type": "other",
                "color": 2,
                "function": stub_function,
            }
        )
        self.third_person = self.env["res.partner"].create(
            {
                "name": "Third person",
                "parent_id": self.second_company.id,
                "type": "contact",
                "color": 3,
                "function": stub_function,
            }
        )
        self.fourth_person = self.env["res.partner"].create(
            {
                "name": "Fourth person",
                "type": "contact",
                "color": 4,
                "function": stub_function,
            }
        )

    # Emulate several cases for list of test data
    # Final data object should be:
    # {
    #     "ids": [<First person id>, <Second person id>],
    #     "model": "res.partner",
    #     "domain": [
    #         ["function", "=", "Web Refresh Test"],
    #         ["parent_id", "=", <First company id>]],
    #     "limit": 80,
    #     "orderby": "id"
    # }
    def test_10_check_list(self):
        data = dict(
            ids=[],
            model="res.partner",
            domain=self.domain + [("parent_id", "=", self.first_company.id)],
            limit=80,
            orderby="id",
        )
        self.assertEqual(True, self.post_json("/web_refresh/check_list", data))
        data["ids"] = [self.first_person.id]
        self.assertEqual(True, self.post_json("/web_refresh/check_list", data))
        data["ids"] = [self.second_person.id, self.first_person.id]
        self.assertEqual(True, self.post_json("/web_refresh/check_list", data))
        data["ids"] = [self.first_person.id, self.second_person.id]
        self.assertEqual(False, self.post_json("/web_refresh/check_list", data))

    # Emulate sequential unfolding for ["parent_id", "type"] grouped test data
    # Final data object should be:
    # {
    #     "groups": [{"id": <First company id>, "count": 2,
    #                 "groups": [{"id": "contact", "count": 1,
    #                             "limit": 80, "ids": [<First person id>]},
    #                            {"id": "other", "count": 1,
    #                             "limit": 80, "ids": [<Second person id>]}]
    #                },
    #                {"id": <Second company id>, "count": 1,
    #                 "groups": [{"id": "contact", "count": 1,
    #                             "limit": 80, "ids": [<Third person id>]}]
    #                }],
    #     "model": "res.partner",
    #     "domain": [["function", "=", "Web Refresh Test"],
    #                ["parent_id", "!=", False]],
    #     "limit": 80,
    #     "orderby": "id",
    #     "groupby": ["parent_id", "type"]
    # }
    def test_20_check_groups(self):
        data = dict(
            groups=[],
            model="res.partner",
            domain=self.domain + [("parent_id", "!=", False)],
            limit=80,
            orderby="id",
            groupby=["parent_id", "type"],
        )
        self.assertEqual(True, self.post_json("/web_refresh/check_groups", data))
        data["groups"] = [dict(id=self.first_company.id, count=1, groups=[])]
        self.assertEqual(True, self.post_json("/web_refresh/check_groups", data))
        data["groups"].append(dict(id=self.second_company.id, count=1, groups=[]))
        self.assertEqual(True, self.post_json("/web_refresh/check_groups", data))
        data["groups"][0]["count"] = 2
        self.assertEqual(False, self.post_json("/web_refresh/check_groups", data))
        data["groups"][0]["groups"] = [dict(id="contact", count=1, limit=80, ids=[])]
        self.assertEqual(True, self.post_json("/web_refresh/check_groups", data))
        data["groups"][0]["groups"].append(dict(id="other", count=1, limit=80, ids=[]))
        self.assertEqual(False, self.post_json("/web_refresh/check_groups", data))
        data["groups"][1]["groups"].append(
            dict(id="contact", count=1, limit=80, ids=[])
        )
        self.assertEqual(False, self.post_json("/web_refresh/check_groups", data))
        data["groups"][0]["groups"][0]["ids"] = [self.second_person.id]
        self.assertEqual(True, self.post_json("/web_refresh/check_groups", data))
        data["groups"][0]["groups"][0]["ids"] = [self.first_person.id]
        self.assertEqual(False, self.post_json("/web_refresh/check_groups", data))
        data["groups"][0]["groups"][1]["ids"] = [self.second_person.id]
        self.assertEqual(False, self.post_json("/web_refresh/check_groups", data))
        data["groups"][1]["groups"][0]["ids"] = [self.third_person.id]
        self.assertEqual(False, self.post_json("/web_refresh/check_groups", data))

    # Emulate pivot for ["parent_id", "type"] grouped test data
    # Final valid data object should be:
    # {
    #     "groups": {"": [6, 10],
    #                ",contact": [5, 8],
    #                ",other": [1, 2],
    #                "<First company id>": [2, 3],
    #                "<Second company id>": [1, 3],
    #                "false": [3, 4],
    #                "<First company id>,contact": [1, 1],
    #                "<First company id>,other": [1, 2],
    #                "<Second company id>,contact": [1, 3],
    #                "false,contact": [3, 4]
    #               },
    #      "model": "res.partner",
    #      "domain": [["function", "=", "Web Refresh Test"]],
    #      "groupby": ["parent_id", "type"],
    #      "measures": ["__count", "color:sum"]
    # }

    def test_30_check_pivot(self):
        data = dict(
            groups={},
            model="res.partner",
            domain=self.domain,
            groupby=["parent_id", "type"],
            measures=["__count", "color:sum"],
        )
        self.assertEqual(True, self.post_json("/web_refresh/check_pivot", data))
        data["groups"] = {",private": [0, 0]}
        self.assertEqual(True, self.post_json("/web_refresh/check_pivot", data))
        data["groups"] = {"": []}
        self.assertEqual(True, self.post_json("/web_refresh/check_pivot", data))
        data["groups"] = {"": [6]}
        self.assertEqual(True, self.post_json("/web_refresh/check_pivot", data))
        data["groups"] = {"": [6, 10]}
        data["groups"][",contact"] = [5, 8]
        data["groups"][",other"] = [1, 2]
        data["groups"][self.first_company.id] = [2, 3]
        data["groups"][self.second_company.id] = [1, 3]
        data["groups"]["false"] = [3, 4]
        data["groups"][str(self.first_company.id) + ",contact"] = [1, 1]
        data["groups"][str(self.first_company.id) + ",other"] = [1, 2]
        data["groups"][str(self.second_company.id) + ",contact"] = [1, 3]
        data["groups"]["false,contact"] = [3, 4]
        self.assertEqual(False, self.post_json("/web_refresh/check_pivot", data))
        data["groups"]["false,false"] = [0, 0]
        self.assertEqual(True, self.post_json("/web_refresh/check_pivot", data))
