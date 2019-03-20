export class StateHandler {
    constructor () {
        this.listeners = [];
        this.selectedLayerIds = [];
        this.groups = [];
        this.filterKeyword = null;
        this.openGroupTitles = null;
        this.filtered = null;
        this.map = Oskari.getSandbox().getMap();
    }
    getState () {
        return {
            mutator: this.getMutator(),
            selectedLayerIds: this._getSelectedLayerIds(),
            groups: this.groups,
            filtered: this.filtered,
            openGroupTitles: this.openGroupTitles,
            mapSrsName: this.map.getSrsName()
        };
    }
    updateStateWithProps ({groups, selectedLayerIds, filterKeyword}) {
        this.groups = groups || this.groups;
        this.selectedLayerIds = selectedLayerIds || this.selectedLayerIds;
        if (!this._filterStateChanged(filterKeyword)) {
            return;
        }
        this.filterKeyword = filterKeyword;
        this.filtered = this._getSearchResults();
        this.openGroupTitles = this.filtered
            ? this.filtered.map(result => result.group.getTitle()) : [];
    }
    updateSelectedLayerIds () {
        this.selectedLayerIds = this.map.getLayers().map(layer => layer.getId());
    }
    _filterStateChanged (nextFilterKeyword) {
        return this.filterKeyword !== nextFilterKeyword;
    }
    _getSelectedLayerIds () {
        if (this.selectedLayerIds.length === 0) {
            this.updateSelectedLayerIds();
        }
        return this.selectedLayerIds;
    }
    _getSearchResults () {
        if (!this.filterKeyword && this.filterKeyword !== 0) {
            return null;
        }
        const results = this.groups.map(group => {
            const layers = group.getLayers()
                .filter(lyr => group.matchesKeyword(lyr.getId(), this.filterKeyword));
                // and some other rule?
            return {group, layers};
        }).filter(result => result.layers.length !== 0);
        return results;
    }
    addListener (listener) {
        this.listeners.push(listener);
    }
    notify () {
        this.listeners.forEach(consumer => consumer());
    }
    getMutator () {
        const me = this;
        const sandbox = Oskari.getSandbox();
        return {
            addLayer (id) {
                if (!id || me.selectedLayerIds.includes(id)) {
                    return;
                }
                setTimeout(() => sandbox.postRequestByName('AddMapLayerRequest', [id]), 300);
                me.selectedLayerIds.push(id);
                me.notify();
            },
            removeLayer (id) {
                if (!id || !me.selectedLayerIds.includes(id)) {
                    return;
                }
                sandbox.postRequestByName('RemoveMapLayerRequest', [id]);
                me.notify();
            },
            updateOpenGroupTitles (titles) {
                me.openGroupTitles = titles;
                me.notify();
            },
            showLayerMetadata (layer) {
                const uuid = layer.getMetadataIdentifier();
                const subUuids = [];
                if (layer.getSubLayers()) {
                    layer.getSubLayers().forEach(subLayer => {
                        const subUuid = subLayer.getMetadataIdentifier();
                        if (subUuid && subUuid !== uuid && !subUuids.includes[subUuid]) {
                            subUuids.push(subUuid);
                        }
                    });
                }
                sandbox.postRequestByName('catalogue.ShowMetadataRequest', [
                    {uuid},
                    subUuids.map(sub => ({uuid: sub}))
                ]);
            },
            showLayerBackendStatus (layerId) {
                sandbox.postRequestByName('ShowMapLayerInfoRequest', [layerId]);
            }
        };
    }
}