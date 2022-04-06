* Before version 13.0, this module had a feature allowing to change the color of
  a line depending on a field, using a ``colors`` attribute with the name of the
  field on the ``<tree>`` element. Since 13.0, the ``colors`` attribute is no
  longer in the RelaxNG schema of the tree view, so we can't use it anymore.
  This feature has then been dropped, but could be reimplement in another way.
  Feature was redone in `0280e04 <https://github.com/OCA/web/commit/0280e0479c3152093000fbca09e4445139c277d4/>`_ and removed in `8469dbb <https://github.com/OCA/web/commit/8469dbb954b6b312872cd2646bbb335faa94afe6/>`_.
