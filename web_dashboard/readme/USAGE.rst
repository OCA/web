* Go to Dashboard/Settings/Dashboards
* Select the main action for the new dashboard
* Add sub-actions
* Assign to a user if you want to restrict the access

==============
For developers
==============

* declare a dashboard action

    .. code-block:: xml

       <record model="web.dashboard" id="web_dashboard_demo">
        <field name="name">My Dashboard</field>
        <field name="act_window_id" ref="base.action_res_users" />
      </record>
      <record model="web.dashboard.action" id="web_dashboard_action_demo_1">
        <field name="name">Users</field>
        <field name="dashboard_id" ref="web_dashboard.web_dashboard_demo" />
        <field name="act_window_id" ref="base.action_res_users" />
      </record>
* To make the dashboard specific for a model
    * set the model on the dashboard declaration

    .. code-block:: xml

       <field name="model_id" ref="base.model_res_partner" />

    * inherit the dashboard mixin

    .. code-block:: python

       class ResPartner(models.Model):
           _name = "res.partner"
           _inherit = ["res.partner", "web.dashboard.mixin"]

    * add the action to the form view

    .. code-block:: xml

       <div name="button_box" position="inside">
            <button
              type="object"
              string="Dashboard"
              name="action_show_dashboard"
              class="oe_stat_button"
              icon="fa-bars"
            />
       </div>
