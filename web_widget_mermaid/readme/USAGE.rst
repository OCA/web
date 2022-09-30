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
