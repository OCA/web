This module defines a new rtree view type. RTree stands for “real tree” or
“recursive tree”. It allows to display recursive and hierarchical data
structures.

An rtree view defined for a model displays records of that model as regular
records rows, just like the regular list (“tree”) view. The difference is that
records can have parents and children, and the first non-widget column
displays the tree structure using carets that allow to expand and collapse
the children of a record. That column also displays the number of children if
there are any.

Additionally, the rtree view can display records of other models in the tree
structure. These records appear as rows with (by default) only their
``display_name`` displayed in the first non-widget column. Other fields of
these secondary models can be mapped to those of the primary model to be
displayed in the corresponding columns.

.. figure:: static/description/rtree.png
   :alt: An example rtree view displaying projects and tasks
