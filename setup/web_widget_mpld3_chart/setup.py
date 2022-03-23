import setuptools

setuptools.setup(
    setup_requires=['setuptools-odoo'],
    odoo_addon={
        "external_dependencies_override": {
            "python": {
                "mpld3": "mpld3==0.3",
                "matplotlib": "matplotlib==3.0.3; python_version < '3.7'",
            },
        },
    },
)
