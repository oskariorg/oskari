import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Tabs, TabPane } from 'oskari-ui';
import { LayerList } from './LayerList/';
import { SelectedLayers } from './SelectedLayers/';

const StyledTabs = styled(Tabs)`
    max-width: 600px;
`;

const StyledBadge = styled.div`
    min-width: 20px;
    height: 20px;
    color: #000;
    background: #ffd400;
    border-radius: 4px;
    text-align: center;
    padding: 2px 8px;
    font-size: 12px;
    display: inline;
    line-height: 20px;
    margin-left: 5px;
    font-weight: 700;
`;

const SelectedTab = ({ num, text }) => {
    return (
        <span>
            {text}
            <StyledBadge>
                {num}
            </StyledBadge>
        </span>
    );
};

SelectedTab.propTypes = {
    num: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired
};

export const LayerViewTabs = props => {
    const layerKey = 0;
    const selectedKey = 1;
    const layers = Oskari.getSandbox().findAllSelectedMapLayers();
    const numLayers = layers.length;
    const { text, selected } = props.locale.filter;
    return (
        <StyledTabs tabPosition='top'>
            <TabPane tab={text} key={layerKey}>
                <LayerList {...props} />
            </TabPane>
            <TabPane tab={<SelectedTab num={numLayers} text={selected} />} key={selectedKey}>
                <SelectedLayers layers={layers} />
            </TabPane>
        </StyledTabs>
    );
};

LayerViewTabs.propTypes = {
    locale: PropTypes.shape({
        filter: PropTypes.shape({})
    })
};