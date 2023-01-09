import setuptools

setuptools.setup(
    setup_requires=['setuptools-odoo'],
    odoo_addon={
        "external_dependencies_override": {
            "python": {
                "mpld3": [
                    "matplotlib==3.0.3; python_version < '3.7'",
                    "matplotlib==3.4.1; python_version >= '3.7'",
                    "mpld3==0.3",
                ],
            },
        },
    },
)
