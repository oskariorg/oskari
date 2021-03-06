/**
 * @class Oskari.mapframework.bundle.mapmodule.request.GetFeatureInfoActivationRequest
 * Requests GFI functionality to be activated or disabled
 *
 * Requests are build and sent through Oskari.Sandbox.
 * Oskari.mapframework.request.Request superclass documents how to send one.
 */
Oskari.clazz.define(
    'Oskari.mapframework.bundle.mapmodule.request.GetFeatureInfoActivationRequest',
    /**
     * @method create called automatically on construction
     * @static
     *
     * @param {Boolean}
     *            blnEnable true to enable, false to disable
     */
    function (blnEnable, id) {
        this._enable = (blnEnable === true);
        this._id = id;
    }, {
        /** @static @property __name request name */
        __name: 'MapModulePlugin.GetFeatureInfoActivationRequest',
        /**
         * @method getName
         * @return {String} request name
         */
        getName: function () {
            return this.__name;
        },
        /**
         * @method isEnabled
         * Returns true if gfi should be enabled, false to disable
         * @return {Boolean}
         */
        isEnabled: function () {
            return this._enable;
        },
        /**
         * @method getId
         * Returns request id to identify enable/disable requests
         * @return {String}
         */
        getId: function () {
            return this._id;
        }
    }, {
        /**
         * @property {String[]} protocol array of superclasses as {String}
         * @static
         */
        protocol: ['Oskari.mapframework.request.Request']
    }
);
