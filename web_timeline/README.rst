.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
    :alt: License: AGPL-3

===============
Timeline Widget
===============

Define a new widget displaying events in an interactive visualization chart.

The widget is based on the external library 
http://visjs.org/timeline_examples.html

Usage
=====

Example:
    <?xml version="1.0" encoding="utf-8"?>
    <openerp>
        <data>
    
            <record id="view_task_timeline" model="ir.ui.view">
                <field name="name">project.task.timeline</field>
                <field name="model">project.task</field>
                <field name="type">timeline</field>
                <field eval="2" name="priority"/>
                <field name="arch" type="xml">
                    <timeline date_start="date_start" 
                              date_stop="date_end"
                              date_delay='1'
                              string="Tasks"
                              default_group_by="user_id" event_open_popup="true" colors="#ec7063:user_id == false;#2ecb71:kanban_state=='done';">
                    </timeline>
                </field>
            </record>
    
            <record id="project.action_view_task" model="ir.actions.act_window">
                <field name="view_mode">kanban,tree,form,calendar,gantt,timeline,graph</field>
            </record>
        </data>
    </openerp>

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/162/8.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Laurent Mignon <laurent.mignon@acsone.eu>
* Adrien Peiffer <adrien.peiffer@acsone.eu>

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.