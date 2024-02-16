import setuptools

setuptools.setup(
    setup_requires=['setuptools-odoo'],
    odoo_addon={
        'external_dependencies_override': {
            'python': {
                "bokeh": "bokeh==0.12.7",
            }
        },
    },
)
