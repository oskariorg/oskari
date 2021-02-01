import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Message, Option, TextInput } from 'oskari-ui';
import { LocaleConsumer, Controller } from 'oskari-ui/util';
import { InfoTooltip } from '../InfoTooltip';
import { StyledFormField, StyledLink, Border, DefaultStyle, StyleField, StyleSelect } from './styled';
import { SelectOutlined } from '@ant-design/icons';

const ServiceLegend = ({ url }) => {
    if (!url) {
        return (
            <Fragment>
                <Message messageKey='legend.serviceLegend' />
                <span>:&nbsp;</span>
                <Message messageKey='legend.serviceNotAvailable' />
            </Fragment>
        );
    }
    return (
        <Tooltip title={url}>
            <Message messageKey='legend.serviceLegend' />
            <Link url={url}/>
        </Tooltip>
    );
};

ServiceLegend.propTypes = {
    url: PropTypes.string
};

const Link = ({ url }) => (
    <StyledLink href={url} rel="noreferrer noopener" target="_blank" >
        <SelectOutlined/>
    </StyledLink>
);
Link.propTypes = {
    url: PropTypes.string.isRequired
};

const LegendImage = LocaleConsumer(({ legendImage = '', controller, getMessage }) => (
    <Fragment>
        <Message messageKey='legend.legendImage'/>
        <InfoTooltip messageKeys='legend.legendImageDesc'/>
        <StyledFormField>
            <TextInput
                placeholder={getMessage('legend.legendImagePlaceholder')}
                value={legendImage}
                onChange={(evt) => controller.setLegendImage(evt.target.value)} />
        </StyledFormField>
    </Fragment>
));
LegendImage.propTypes = {
    legendImage: PropTypes.string.isRequired,
    controller: PropTypes.instanceOf(Controller).isRequired
};

class Legend extends React.Component {
    constructor (props) {
        super(props);
        this.state = { selected: props.layer.style };
    }

    getStyleLabel (style) {
        const { name, title } = style;
        const label = title || name;
        if (name === this.props.layer.style) {
            return label + ' (' + this.props.getMessage('styles.default') + ')';
        }
        return label;
    }

    onStyleChange (selected) {
        this.setState({
            selected
        });
    }

    onDefaultStyleChange (styleName, selected) {
        const defaultStyle = selected ? styleName : '';
        this.props.controller.setStyle(defaultStyle);
    }

    render () {
        const { layer, controller } = this.props;
        const { options = {}, capabilities = {}, legendImage } = layer;
        const styleOptions = capabilities.styles || [];
        const legends = options.legends || {};
        if (styleOptions.length === 0) {
            return (
                <LegendImage legendImage={legendImage} controller = {controller}/>
            );
        }
        const style = styleOptions.find(s => s.name === this.state.selected) || styleOptions[0];
        const { name, legend } = style;
        const legendUrl = legends[name] || legendImage || '';
        const isDefault = name === layer.style;
        return (
            <Fragment>
                <Message messageKey='legend.title'/>
                <InfoTooltip messageKeys={['legend.styleDesc', 'styles.desc']} />
                <Border>
                    <Fragment>
                        <StyleField>
                            <StyleSelect
                                value={name}
                                onChange={value => this.onStyleChange(value)}
                            >
                                { styleOptions.map(option => (
                                    <Option key={option.name} value={option.name}>
                                        {this.getStyleLabel(option)}
                                    </Option>
                                )) }
                            </StyleSelect>
                            <DefaultStyle
                                checked={isDefault}
                                onChange={(evt) => this.onDefaultStyleChange(name, evt.target.checked)}
                            >
                                <Message messageKey='styles.default'/>
                            </DefaultStyle>
                        </StyleField>
                        <StyledFormField>
                            <ServiceLegend url = {legend} />
                        </StyledFormField>
                        <StyledFormField>
                            <Fragment>
                                <Message messageKey='legend.overriddenLegend' />
                                <InfoTooltip messageKeys='legend.overrideTooltip' />
                                { legendUrl && <Link url = {legendUrl} /> }
                                <TextInput
                                    value = {legendUrl}
                                    onChange={evt => controller.setLegendUrl(name, evt.target.value)}
                                />
                            </Fragment>
                        </StyledFormField>
                    </Fragment>
                </Border>
            </Fragment>
        );
    }
};

Legend.propTypes = {
    layer: PropTypes.object.isRequired,
    controller: PropTypes.instanceOf(Controller).isRequired,
    getMessage: PropTypes.func.isRequired
};

const contextWrap = LocaleConsumer(Legend);
export { contextWrap as Legend };