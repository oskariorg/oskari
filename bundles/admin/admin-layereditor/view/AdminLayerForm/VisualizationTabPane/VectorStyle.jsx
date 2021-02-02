import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSelect } from './StyleSelect';
import { Controller } from 'oskari-ui/util';
import { Button, Message, Modal, StyleEditor, TextInput } from 'oskari-ui';
import { PlusOutlined } from '@ant-design/icons';
import { OSKARI_BLANK_STYLE } from './OskariDefaultStyle';

export const VectorStyle = (props) => {
    const [editorState, setEditorState] = useState({
        modalVisibility: false,
        currentStyle: OSKARI_BLANK_STYLE,
        styleName: '',
        originalName: ''
    });

    const saveStyle = () => props.controller.saveStyleToLayer(editorState.currentStyle, editorState.styleName, editorState.originalName);
    const onModalCancel = () => setEditorState({ ...editorState, modalVisibility: false });
    const resetNewStyle = () => setEditorState({ ...editorState, styleName: '', originalName: '', currentStyle: OSKARI_BLANK_STYLE, modalVisibility: true });
    const onModalOk = () => {
        saveStyle();
        setEditorState({ ...editorState, modalVisibility: false });
    };

    return (
        <Fragment>
            <Button onClick={ resetNewStyle }>
                <PlusOutlined />
                <Message messageKey="styles.addStyle" />
            </Button>

            <Modal visible={ editorState.modalVisibility } onOk={ onModalOk } onCancel={ onModalCancel }>
                <TextInput value={ editorState.styleName } onChange={ (event) => setEditorState({ ...editorState, styleName: event.target.value }) } />
                <StyleEditor
                    oskariStyle={ editorState.currentStyle }
                    onChange={ (style) => setEditorState({ ...editorState, currentStyle: style })}
                />
            </Modal>

            <StyleSelect
                layer={ props.layer }
                controller={ props.controller }
                editStyleCallback={ (styleName) => {
                    setEditorState({
                        modalVisibility: true,
                        styleName: styleName,
                        originalName: styleName,
                        currentStyle: props.controller.getStyleFromLayer(styleName)
                    });
                } }
            />-
        </Fragment>
    );
};

VectorStyle.propTypes = {
    layer: PropTypes.object.isRequired,
    controller: PropTypes.instanceOf(Controller).isRequired
};