/**
 * @class Oskari.framework.bundle.admin-layeranalytics.AdminLayerAnalyticsBundle
 *
 * Definition for bundle. See source for details.
 */
Oskari.clazz.define("Oskari.framework.bundle.admin-layeranalytics.AdminLayerAnalyticsBundle",
/**
 * @method create called automatically on construction
 * @static
 */ 
function() {

}, {
"create" : function() {
    return Oskari.clazz.create("Oskari.framework.bundle.admin-layeranalytics.AdminLayerAnalyticsBundleInstance");
},
"update" : function(manager, bundle, bi, info) {}
}, {

    "protocol" : ["Oskari.bundle.Bundle", "Oskari.mapframework.bundle.extension.ExtensionBundle"],
    "source" : {

        "scripts" : [{
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/admin-layeranalytics/instance.js"
        },{
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/admin-layeranalytics/Tile.js"
        }],
        "locales" : [{
            "lang" : "fi",
            "type" : "text/javascript",
            "src" : "../../../../bundles/framework/admin-layeranalytics/resources/locale/fi.js"
        }]
    },
    "bundle" : {
        "manifest" : {
            "Bundle-Identifier" : "admin-layeranalytics",
            "Bundle-Name" : "admin-layeranalytics",
            "Bundle-Author" : [{
                "Name" : "MML",
                "Organisation" : "nls.fi",
                "Temporal" : {
                    "Start" : "2013",
                    "End" : "2013"
                },
                "Copyleft" : {
                    "License" : {
                        "License-Name" : "EUPL",
                        "License-Online-Resource" : "http://www.paikkatietoikkuna.fi/license"
                    }
                }
            }],        
            "Bundle-Version" : "1.0.0",
            "Import-Namespace" : ["Oskari"],
            "Import-Bundle" : {}

        }
    },

    /**
     * @static
     * @property dependencies
     */
    "dependencies" : ["jquery"]

});

Oskari.bundle_manager.installBundleClass("admin-layeranalytics", "Oskari.framework.bundle.admin-layeranalytics.AdminLayerAnalyticsBundleInstance");
