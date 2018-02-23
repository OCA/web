.. image:: https://www.gnu.org/graphics/lgplv3-147x51.png
   :target: https://www.gnu.org/licenses/lgpl-3.0.en.html
   :alt: License: LGPL-v3

==========================
Web Diagram Position Saver
==========================

This module helps with saving positions of diagram elements.

Usage
=====

To use this module functionality you need to decorate ``node`` element of the ``diagram view`` with the coordinate attributes
``xpos`` and ``ypos`` like in the example below.

.. code-block:: xml

         <record id="view_project_workflow_diagram" model="ir.ui.view">
             <field name="name">project.workflow.diagram</field>
             <field name="model">project.workflow</field>
             <field name="arch" type="xml">
                 <diagram string="Workflow Editor">
                     <node object="project.workflow.state" xpos="xpos" ypos="ypos" shape="rectangle:True"
                           bgcolor="blue:type=='todo';yellow:type=='in_progress';green:type=='done'">
                         <field name="name"/>
                         <field name="stage_id"/>
                         <field name="type" invisible="1"/>
                     </node>
                     <arrow object="project.workflow.transition" source="src_id" destination="dst_id" label="['name']">
                         <field name="src_id"/>
                         <field name="dst_id"/>
                         <field name="name"/>
                     </arrow>
                 </diagram>
             </field>
         </record>

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/web/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Petar Najman <petar.najman@modoolar.com>
* Aleksandar Gajić <aleksandar.gajic@modoolar.com>

Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.
