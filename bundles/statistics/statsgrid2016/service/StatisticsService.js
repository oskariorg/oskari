/**
 * @class Oskari.statistics.statsgrid.StatisticsService
 */
Oskari.clazz.define('Oskari.statistics.statsgrid.StatisticsService',

    /**
     * @method create called automatically on construction
     * @static
     *
     */

    function (sandbox) {
        this.sandbox = sandbox;
        this.cache = Oskari.clazz.create('Oskari.statistics.statsgrid.Cache');
        this.state = Oskari.clazz.create('Oskari.statistics.statsgrid.StateService', sandbox);
        // pushed from instance
        this.datasources = [];
        // attach on, off, trigger functions
        Oskari.makeObservable(this);
    }, {
        __name: "StatsGrid.StatisticsService",
        __qname: "Oskari.statistics.statsgrid.StatisticsService",

        getQName: function () {
            return this.__qname;
        },

        getName: function () {
            return this.__name;
        },
        notifyOskariEvent : function(event) {
            this.trigger(event.getName(), event);
        },
        getStateService : function() {
            return this.state;
        },
        addDatasource : function(ds) {
            if(!ds) {
                // log error message
                return;
            }
            var me = this;
            if (_.isArray(ds)) {
                //if(typeof ds === 'array') -> loop and add all
                ds.forEach(function(item) {
                    me.addDatasource(item);
                });
                return;
            }
            this.datasources.push(ds);
        },

        /**
         * Returns datasource {id, name, type} as object.
         * If id omitted returns all datasources as array.
         * If datasource with matching id isn't found returns null.
         * @param  {Number} id datasource id
         * @return {Object[]|Object|Null} datasource information or null if not found
         */
        getDatasource : function(id) {
            if(!id) {
                return this.datasources;
            }
            var found = null;
            this.datasources.forEach(function(ds) {
                if(ds.id === id) {
                    found = ds;
                }
            });
            return found;
        },
        /**
         * Returns regionsets that are available to user.
         * Based on maplayers of type STATS.
         */
        getRegionsets : function(includeOnlyIds) {
            var service = this.sandbox.getService('Oskari.mapframework.service.MapLayerService');
            var layers = service.getLayersOfType('STATS');
            if(!layers) {
                return [];
            }
            var list = [];
            layers.forEach(function(regionset) {
                list.push({
                    id : regionset.getId(),
                    name : regionset.getName()
                });
            });
            var singleValue = typeof includeOnlyIds === 'number' || typeof includeOnlyIds === 'string';
            if(singleValue) {
                // wrap to an array
                includeOnlyIds = [includeOnlyIds];
            }
            if(_.isArray(includeOnlyIds)) {
                var result = _.filter(list, function(reg) {
                    return includeOnlyIds.indexOf(reg.id) !== -1;
                });
                if(singleValue) {
                    // if requested with single value, unwrap result from array
                    return result.length ? result[0] : null;
                }
                return result;
            }
            return list;
        },
        /**
         * Calls callback with a list of regions for the regionset.
         * @param  {Number}   regionset regionset id
         * @param  {Function} callback  function to call with error or results
         */
        getRegions : function(regionset, callback) {
            if(!regionset || typeof callback !== 'function') {
                // log error message
                return;
            }
            // TODO: call GetRegions with parameter regionset=regionset
            // use first param as error indicator - null == no error
            jQuery.ajax({
                type: "GET",
                dataType: 'json',
                data : {
                    regionset : regionset
                },
                url: this.sandbox.getAjaxUrl('GetRegions'),
                success: function (pResp) {
                    callback(null, pResp.regions);
                },
                error: function (jqXHR, textStatus) {
                    callback('Error loading regions');
                }
            });
        },
        /**
         * Calls callback with a list of indicators for the datasource.
         * @param  {Number}   ds       datasource id
         * @param  {Function} callback function to call with error or results
         */
        getIndicatorList : function(ds, callback) {
            if(!ds || typeof callback !== 'function') {
                // log error message
                return;
            }
            var cacheKey = 'GetIndicatorList_' + ds;
            var cached = this.cache.get(cacheKey);
            if(cached) {
                callback(null, cached);
                return;
            }

            var queueKey = 'queueGetIndicatorList_' + ds;
            var queue = this.cache.get(queueKey);
            if(!queue) {
                queue = [];
            }
            queue.push(callback);
            this.cache.put(queueKey, queue);
            if(queue.length > 1) {
                // request already in progress
                return;
            }
            var me = this;
            // call GetIndicatorList with parameter datasource=ds
            // use first param as error indicator - null == no error
            jQuery.ajax({
                type: "GET",
                dataType: 'json',
                data : {
                    datasource : ds
                },
                url: me.sandbox.getAjaxUrl('GetIndicatorList'),
                success: function (pResp) {
                    me.cache.put(cacheKey, pResp.indicators);
                    var callbacks = me.cache.get(queueKey);
                    callbacks.forEach(function(cb) {
                        cb(null, pResp.indicators);
                    });
                    me.cache.put(queueKey, null);
                },
                error: function (jqXHR, textStatus) {
                    var callbacks = me.cache.get(queueKey);
                    callbacks.forEach(function(cb) {
                        cb('Error loading indicators');
                    });
                    me.cache.put(queueKey, null);
                }
            });
        },
        /**
         * Calls callback with a list of indicators for the datasource.
         * @param  {Number}   ds        datasource id
         * @param  {Number}   indicator indicator id
         * @param  {Function} callback  function to call with error or results
         */
        getIndicatorMetadata : function(ds, indicator, callback) {
            if(!ds ||!indicator || typeof callback !== 'function') {
                // log error message
                return;
            }
            var me = this;
            // call GetIndicatorMetadata with parameter datasource=ds and indicator=indicator
            // use first param as error indicator - null == no error
            jQuery.ajax({
                type: "GET",
                dataType: 'json',
                data : {
                    datasource : ds,
                    indicator : indicator
                },
                url: me.sandbox.getAjaxUrl('GetIndicatorMetadata'),
                success: function (pResp) {
                    callback(null, pResp);
                },
                error: function (jqXHR, textStatus) {
                    callback('Error loading indicators');
                }
            });
        },
        /**
         * Calls callback with a list of indicators for the datasource.
         * @param  {Number}   ds        datasource id
         * @param  {Number}   indicator indicator id
         * @param  {Function} callback  function to call with error or results
         */
        getIndicatorData : function(ds, indicator, params, regionset, callback) {
            if(!ds ||!indicator || !regionset || typeof callback !== 'function') {
                // log error message
                return;
            }
            // call GetIndicatorData with parameters:
            // - datasource=ds
            // - indicator=indicator
            // - selectors=serialized params
            // - regionset = regionset
            // use first param as error indicator - null == no error
            jQuery.ajax({
                type: "GET",
                dataType: 'json',
                data : {
                    datasource : ds,
                    indicator : indicator,
                    regionset : regionset,
                    selectors : JSON.stringify(params || {})
                },
                url: this.sandbox.getAjaxUrl('GetIndicatorData'),
                success: function (pResp) {
                    callback(null, pResp);
                },
                error: function (jqXHR, textStatus) {
                    callback('Error loading indicator data');
                }
            });
        },
        /*
    Convenience method to get the complete dataset for current selections. Hides the callback hell.
{
    regionset : {
        id : 1234,
        name : "Municipalities"
    },
    indicators : [
        {
            datasource : {
                id : 12,
                name : "SotkaNet"
            },
            id : 346,
            name : "indicator name",
            selections : {
                sex : 'male',
                year : '1993'
            },
            hash : 'unique id for ds, id and selections'
        }
    ],
    data : [
        {
            id : 2353,
            name : "municipality name",
            values : {
                hash1 : value of indicator with hash1,
                hash2 : value of indicator with hash2
            }
        }
    ]
}
         */
        getCurrentDataset : function(callback) {
            var me = this;
            if(typeof callback !== 'function') {
                // TODO: log error
                return;
            }
            var setId = this.getStateService().getRegionset();
            if(!setId) {
                callback("No regionset selected");
                return;
            }
            var regionset = this.getRegionsets(setId);
            var response = {
                regionset : {
                    id : setId,
                    name : regionset.name
                },
                indicators : [],
                data : []
            };
            var indicators = this.getStateService().getIndicators();
            this.getRegions(setId, function(err, regions) {
                if(err) {
                    callback("Couldn't get regions", response);
                    return;
                }

                regions.forEach(function(reg) {
                    response.data.push({
                        id : reg.id,
                        name : reg.name,
                        values : {}
                    });
                });
                if(!indicators.length) {
                    // no indicators, just respond with regions
                    callback(null, response);
                    return;
                }
                // figure out ui names and data for indicators
                var count = 0;
                var errors = 0;
                var done = function() {
                    if(errors) {
                        callback('Error populating indicators', response);
                        return;
                    }
                    callback(null, response);
                };
                indicators.forEach(function(ind) {
                    var metadata = {
                        datasource : {
                            id : ind.datasource,
                            name : me.getDatasource(ind.datasource).name
                        },
                        id : ind.indicator,
                        name : "N/A",
                        selections : ind.selections,
                        hash : ind.hash
                    };
                    response.indicators.push(metadata);
                    // inProgress is a flag for detecting if both async ops have completed
                    var inProgress = true;
                    count++;
                    me.getIndicatorMetadata(ind.datasource, ind.indicator, function(err, indicator) {
                        if(err) {
                            errors++;
                            return;
                        }
                        metadata.name = Oskari.getLocalized(indicator.name);
                        // detect if this indicator is fully populated
                        if(!inProgress) {
                            count--;
                        }
                        inProgress = false;
                        if(count === 0) {
                            done();
                        }
                    });

                    me.getIndicatorData(ind.datasource, ind.indicator, ind.selections, setId, function(err, indicatorData) {
                        if(err) {
                            errors++;
                            return;
                        }
                        response.data.forEach(function(item) {
                            item.values[ind.hash] = indicatorData[item.id];
                        });
                        // detect if this indicator is fully populated
                        if(!inProgress) {
                            count--;
                        }
                        inProgress = false;
                        if(count === 0) {
                            done();
                        }
                    });
                });
            });
        }
    }, {
        'protocol': ['Oskari.mapframework.service.Service']
    });
