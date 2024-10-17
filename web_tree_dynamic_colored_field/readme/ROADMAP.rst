* Before version 13.0, this module had a feature allowing to change the color of
  a line depending on a field, using a ``colors`` attribute with the name of the
  field on the ``<tree>`` element. Since 13.0, the ``colors`` attribute is no
  longer in the RelaxNG schema of the tree view, so we can't use it anymore.
  This feature has then been dropped, but could be reimplement in another way.
