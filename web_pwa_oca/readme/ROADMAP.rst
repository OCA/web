* Evaluate to extend ``FILES_TO_CACHE``
* Integrate `Notification API <https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification>`_
* Integrate `Web Share API <https://web.dev/web-share/>`_
* Create ``portal_pwa`` module, intended to be used by front-end users (customers, suppliers...)
* Current ``John Resig's inheritance`` implementation doesn't support ``async`` functions because ``this._super`` can't be called inside a promise. So we need use the following workaround:
    - Natural 'async/await' example (This breaks "_super" call)
        .. code-block:: javascript

            var MyClass = OdooClass.extend({
                myFunc: async function() {
                    const mydata = await ...do await stuff...
                    return mydata;
                }
            });

    - Same code with the workaround:
        .. code-block:: javascript

            var MyClass = OdooClass.extend({
                myFunc: function() {
                    return new Promise(async (resolve, reject) => {
                        const mydata = await ...do await stuff...
                        resolve(mydata);
                    });
                }
            });
