.. image:: https://www.gnu.org/graphics/lgplv3-147x51.png
   :target: https://www.gnu.org/licenses/lgpl-3.0.en.html
   :alt: License: LGPL-v3

==========
Web Syncer
==========

This module provides generic interface to receive CUD model notifications on web client side.


Usage
=====

To use this module functionality you need to:

- Inherit ``web.syncer`` model at the backend side


.. code-block:: python

      class Task(models.Model):
         _inherit = 'project.task'
         _implements_syncer = True

- Instantiate web.syncer and subscribe to the notifications for your model

.. code-block:: javascript

      const Syncer = require('web.syncer').Syncer;
      var sync = new Syncer();
      sync.subscribe(odoo.session_info.db + ":" + "project.task", notification => {
          let id = notification[0][2];
          let payload = notification[1];
          switch (notification[1].method) {
              case "write": // Handle record  update
                  this.recordUpdated(id, payload.data, payload);
                  break;
              case "create": // Handle created record
                  this.recordCreated(id, payload.data, payload);
                  break;
              case "unlink": // Handle removed record
                  let task = this.records.get(id);
                  if (task) {
                      this.records.delete(id);
                      payload.data = task;
                      this.recordDeleted(id, payload);
                  }
                  break;
          }
      });

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
