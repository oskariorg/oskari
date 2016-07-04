/**
 * @class Oskari.statistics.statsgrid.View
 *
 * Sample extension bundle definition which inherits most functionalty
 * from DefaultView class.
 *
 */
Oskari.clazz.define('Oskari.statistics.statsgrid.StatsView',
/**
 * @static constructor function
 */
function() {
}, {
    /**
     * Show content
     * @method showContent
     * @param {Boolean} isShown true if content should be rendered, false if not
     */
    showContent: function(isShown, config) {
        if(isShown) {
            this.getLeftColumn().addClass('statsgrid_100');
            this.getLeftColumn().append(this.getEl());
            this.addContent(this.getEl(), config);
        }
        else {
            this.getLeftColumn().removeClass('statsgrid_100');
            this.getEl().empty();
            this.getEl().remove();
        }
    },
    addContent : function (el, config) {
        var sb = this.instance.getSandbox();
        var service = sb.getService('Oskari.statistics.statsgrid.StatisticsService');
        var comps = this.getComponents(config);
        comps.forEach(function(component, index) {
            component.render(el);
            var notLastComponent = index < comps.length - 1;
            if(notLastComponent) {
                el.append('<hr style="border: 1px dashed #c3c3c3;" />');
            }
        });
    },
    getComponents : function(config) {
        var sb = this.instance.getSandbox();
        config = config || {};
        var comps = [];
        if(config.indicatorSelector !== false) {
            comps.push(Oskari.clazz.create('Oskari.statistics.statsgrid.IndicatorSelection', sb));
        }
        if(config.regionSelector !== false) {
            comps.push(Oskari.clazz.create('Oskari.statistics.statsgrid.RegionsetSelection', sb));
        }
        if(config.grid !== false) {
            comps.push(Oskari.clazz.create('Oskari.statistics.statsgrid.Datatable', sb));
        }
        return comps;
    }
}, {
    "protocol": ["Oskari.userinterface.View"],
    "extend": ["Oskari.statistics.statsgrid.GridModeView"]
});