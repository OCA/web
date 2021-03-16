* Integrate `Notification API <https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification>`_
* Integrate `Web Share API <https://web.dev/web-share/>`_
* Create ``portal_pwa`` module, intended to be used by front-end users (customers, suppliers...)
* Current *John Resig's inheritance* implementation doesn't support ``async``
  functions because ``this._super`` can't be called inside a promise. So we
  need to use the following workaround:

  - Natural 'async/await' example (This breaks "_super" call):

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
                    return resolve(mydata);
                });
            }
        });

* Fix issue when trying to run in localhost with several databases. The browser
  doesn't send the cookie and web manifest returns 404.
* Firefox can't detect 'standalone' mode. See https://bugzilla.mozilla.org/show_bug.cgi?id=1285858
* Firefox disable service worker in private mode. See https://bugzilla.mozilla.org/show_bug.cgi?id=1601916
