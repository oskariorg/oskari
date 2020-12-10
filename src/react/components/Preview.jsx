import React from 'react';
import PropTypes from 'prop-types';

// Size for preview svg
const previewSize = '80px';

// Viewbox settings for preview svg
//const previewViewbox = '0 0 60 60';
const previewViewbox = {
    minX: 0,
    minY: 0,
    width: 60,
    height: 60
}

// Style settings for wrapping preview rectangle
const previewStyling = {
    border: '1px solid #d9d9d9',
    height: previewSize,
    width: previewSize
}

const linePreviewSVG = '<svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000000" d="M10,15L20,35L40,25" stroke-width="3" stroke-linejoin="miter" stroke-linecap="butt" strokeDasharray="0"></path></svg>';
const areaPreviewSVG = '<svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="checker" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect fill="#eee" x="0" width="10" height="10" y="0"><rect fill="#eee" x="10" width="10" height="10" y="10"></rect></rect></pattern></defs><rect x="0" y="0" width="80" height="80" fill="url(#checker)"></rect><path d="M10,17L40,12L29,40Z" stroke-linejoin="miter" stroke-linecap="butt" stroke-dasharray="0"></path></svg>';

const defaults = {
    defaultStrokeWidth: 1,
    defaultStrokeColor: '#000000',
    defaultFill: '#ffffff',
    defaultFillColor: '#ffffff',
    defaultSize: 3,
    defaultLineCap: 'square',
    defaultLineJoin: 'mitter',
    defaultFillPattern: '',
    defaultPatternId: 'patternPreview',
    defaultStrokeDashArray: ''
}

/**
 * @class Preview
 * @calssdesc <Preview>
 * @memberof module:oskari-ui
 * @see {@link module:oskari-ui/util.LocaleProvider|LocaleProvider}
 * @param {Object} props - { }
 * @param {Component|Callback} previewIcon - callback for creating icon
 * @description Wrap provided svg-icon into base svg of preview
 * 
 * @example <caption>Basic usage</caption>
 * <Preview previewIcon={ svgIconCallback }}/>
 */

export class Preview extends React.Component {
    constructor (props) {
        super(props);

        this.currentStyle = this.props.styleSettings;
        this.markers = this.props.markers;
        this.size = 3;

        this.previewAttributes = {
            strokeColor: defaults.defaultStrokeColor,
            strokeWidth: defaults.defaultStrokeWidth,
            strokeLineCap: defaults.defaultLineCap,
            fill: defaults.defaultFill,
            fillColor: defaults.defaultFillColor,
            pattern: defaults.defaultFillPattern,
            patternId: defaults.defaultPatternId
        };
    }
    
    _fillSvgWithStyle () {
        const format = this.props.styleSettings.format;
        const path = this._parsePath(format);
        
        this.previewAttributes.strokeColor = this.props.styleSettings.stroke.color;
        this.previewAttributes.fillColor = this.props.styleSettings.fill.color;

        this.previewAttributes.fill = format === 'area'
            ? ('url(#' + this.previewAttributes.patternId + ')') : format !== 'line' 
            ? this.props.styleSettings.fill.color : defaults.defaultFillColor;

        if (format === 'area' && ~this.props.styleSettings.fill.area.pattern) {
            const patternPath = this._parsePattern(this.props.fillPatterns.find(pattern => pattern.name === this.props.styleSettings.fill.area.pattern));
            this.previewAttributes.pattern = this._composeSvgPattern(patternPath);
        }

        this.previewAttributes.strokeWidth = format === 'point'
            ? defaults.defaultStrokeWidth : format === 'area'
            ? this.props.styleSettings.stroke.area.width : this.props.styleSettings.stroke.width;
        
        this.previewAttributes.strokeLineCap = format === 'line' ? this.props.styleSettings.stroke.lineCap : defaults.defaultLineCap;

        this.previewAttributes.strokeDashArray = format !== 'point' && this.props.styleSettings.stroke.lineDash === 'dash' ? '4, 4' : defaults.defaultStrokeDashArray;
        
        path.setAttribute('stroke', this.previewAttributes.strokeColor);
        path.setAttribute('stroke-width', this.previewAttributes.strokeWidth);
        path.setAttribute('stroke-linecap', this.previewAttributes.strokeLineCap);
        path.setAttribute('stroke-dasharray', this.previewAttributes.strokeDashArray);
        if (format !== 'line') {
            path.setAttribute('fill', this.previewAttributes.fill);
        }
        
        this.size = format === 'point' ? this.props.styleSettings.image.size : defaults.defaultSize;

        return path.outerHTML;
    }

    _parsePath (format) {
        let baseSvg =
              format === 'point' ? this.props.markers[this.props.styleSettings.image.shape].data
            : format === 'line' ? baseSvg = linePreviewSVG
            : format === 'area' ? baseSvg = areaPreviewSVG
            : false;
        
        const domParser = new DOMParser();
        const parsed = domParser.parseFromString(baseSvg, 'image/svg+xml');
        const rawHtmlPath = parsed.getElementsByTagName('path')[0];

        return rawHtmlPath;
    }

    _parsePattern (pattern) {
        const domParser = new DOMParser();
        const parsed = domParser.parseFromString(pattern.data, 'image/svg+xml');
        const rawHtmlPath = parsed.getElementsByTagName('path')[0];

        rawHtmlPath.setAttribute('stroke', this.previewAttributes.fillColor);

        return rawHtmlPath;
    }

    _composeSvgPattern (patternPath) {
        return '<defs><pattern id="' + this.previewAttributes.patternId +'" viewBox="0, 0, 4, 4" width="50%" height="50%">' + patternPath.outerHTML + '</pattern></defs>';
    }

    _composePreviewViewbox () {
        let viewboxString = ''
        const widthV = previewViewbox.width - (5 * this.size); // multiply by negative to shrink viewbox
        const heightV = previewViewbox.height - (5 * this.size); // multiply by negative to shrink viewbox
        viewboxString = previewViewbox.minX + ' ' + previewViewbox.minY + ' ' +  widthV + ' ' + heightV;
        return viewboxString;
    }

    /**
     * @method _addBaseSvg
     *
     * @returns {Component} - combined svg icon with preview base wrapping around provided icon
     *
     */
    _addBaseSvg () {
        const svgIcon = this._fillSvgWithStyle(); // Get svg icon
        const combinedSvg = this.previewAttributes.pattern + svgIcon; // Add pattern to svg icon

        return (
            <svg
                viewBox={ this._composePreviewViewbox() }
                width={ previewSize }
                height={ previewSize }
                xmlns="http://www.w3.org/2000/svg"
                dangerouslySetInnerHTML={ {__html: combinedSvg } }
            >
            </svg>
        );
    }

    render () {
        return (
            <div style={ previewStyling }>
                { this._addBaseSvg(this.props.previewIcon) }
            </div>
        );
    }
};

Preview.propTypes = {
    markers: PropTypes.array.isRequired,
    styleSettings: PropTypes.object.isRequired
};