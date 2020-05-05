Put a ``widget="mermaid"`` attribute in relevant field tags in the view
declaration::

    <field name="flowchart" widget="mermaid"/>

Optionally, use an ``options`` attribute to pass a JSON object with
`mermaid configuration <https://mermaidjs.github.io/#/mermaidAPI?id=configuration>`_::

  <field name="flowchart"
         widget="mermaid"
         options='{"theme": "forest", "gantt": {"fontSize": 14}}'/>

The syntax for creating diagrams is described in
`mermaid's documentation <https://mermaidjs.github.io/#/flowchart>`_.

As an example, this text::

    graph LR
        10.0 --> 11.0
        11.0 --> 12.0
        12.0 -.-> 13.0

Produces this flowchart:

.. image:: ./static/description/flowchart_example.png
    :alt: Flowchart

Demonstration
=============

In demo mode, the addon adds a flowchart field to users so you can try it. This shows up in Runbot instances.

Upgrading Mermaid
=================

This information is only relevant for the development of this addon, not for users.

This addon uses a slightly tweaked build of Mermaid that works in older browsers. To reproduce it, take the following steps:

- Clone ``https://github.com/knsv/mermaid/``
- Checkout the version you want to upgrade to (e.g. ``git checkout 8.4.0``)
- In ``webpack.config.base.js``, in ``const jsRule = ...``, remove the ``include`` key (so all dependencies are transpiled)
- In ``babel.config.js``, in ``targets``, add some browsers besides ``node: 'current'``. I arbitrarily went with this::

    targets: {
      node: 'current',
      ie: '11',
      edge: '20',
      firefox: '35',
      chrome: '45',
      safari: '9',
    }

- Run ``yarn install``
- Run ``yarn build``
- The completed file is now in ``dist/mermaid.js``. Try running ``grep 'let ' dist/mermaid.js`` to make sure everything was transpiled. The only output should be from comments.
- Copy ``dist/mermaid.js`` to ``web_widget_mermaid/static/lib/mermaid/mermaid.js``.
- Bump the version number in ``__manifest__.py`` to match the Mermaid version.
