import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import SplitPane from 'react-split-pane';
import LeftPanel from './LeftPanel';
import EditorArea from './EditorArea';
import BottomPanel from './BottomPanel';
import Header from './Header';
import ToolArea from './ToolArea';
import { REGIONS, HISTORY, EVENTS } from './../constants';
import { withReRenderEnabled } from './utils';

const leftPanelDefaultSize = 300;
const leftPanelMaxSize = 700;
const leftPanelClosedSize = 42;
const bottomPanelDefaultSize = 300;
const bottomPanelMaxSize = 700;
const headerHeight = 24;
const toolAreaHeight = 30;
/**
 * React component for App.
 *
 * @class App
 * @extends {React.Component}
 */
class App extends React.Component {

    /**
     * @inheritdoc
     */
    constructor(props) {
        super(props);
        const { history } = this.props.appContext.pref;
        const showLeftPanel = !_.isNil(history.get(HISTORY.ACTIVE_LEFT_PANEL_VIEW));
        const leftPanelSize = showLeftPanel
                                    ? (parseInt(this.props.appContext
                                        .pref.history.get(HISTORY.LEFT_PANEL_SIZE), 10)
                                            || leftPanelDefaultSize)
                                    : 0;
        const bottomPanelIsActive = history.get(HISTORY.BOTTOM_PANEL_IS_ACTIVE);
        const showBottomPanel = !_.isNil(bottomPanelIsActive) ? bottomPanelIsActive : false;
        const bottomPanelSize = showBottomPanel
                                    ? (parseInt(this.props.appContext
                                        .pref.history.get(HISTORY.BOTTOM_PANEL_SIZE), 10)
                                            || bottomPanelDefaultSize)
                                    : 0;
        this.state = {
            showLeftPanel,
            leftPanelSize,
            showBottomPanel,
            bottomPanelSize,
            documentHeight: window.innerHeight,
            documentWidth: window.innerWidth,
            panelResizeInProgress: false,
        };
        this.leftRightSplitPane = undefined;
        this.topBottomSplitPane = undefined;

        // handle window resize events
        window.addEventListener('resize', this.handleWindowResize.bind(this));
        this.props.layoutPlugin.on(EVENTS.TOGGLE_BOTTOM_PANLEL, () => {
            this.setBottomPanelState(!this.state.showBottomPanel);
        });
        this.props.layoutPlugin.on(EVENTS.SHOW_BOTTOM_PANEL, () => {
            this.setBottomPanelState(true);
        });
        this.props.layoutPlugin.on(EVENTS.SHOW_LEFT_PANEL, (view) => {
            history.put(HISTORY.ACTIVE_LEFT_PANEL_VIEW, view);
            this.setLeftPanelState(true);
        });
    }

    /**
     * @inheritdoc
     */
    getChildContext() {
        return {
            history: this.props.appContext.pref.history,
            command: this.props.appContext.command,
            alert: this.props.appContext.alert,
        };
    }

    /**
     * Get views of given Region
     *
     * @returns {Array<React.Component>}
     */
    getViewsForRegion(region) {
        return this.props.layout[region];
    }

    /**
     * This will rerender app when the window is resized.
     *
     * @param {object} event event object.
     * @memberof App
     */
    handleWindowResize() {
        this.setState({
            documentHeight: window.innerHeight,
            documentWidth: window.innerWidth,
        });
    }

     /**
     * Update left panel state
     * @param {boolean} showLeftPanel
     * @param {number} leftPanelSize
     */
    setLeftPanelState(showLeftPanel, leftPanelSize) {
        const { history } = this.props.appContext.pref;
        if (_.isNil(leftPanelSize)) {
            const sizeFromHistory = history.get(HISTORY.LEFT_PANEL_SIZE);
            leftPanelSize = !_.isNil(sizeFromHistory) && sizeFromHistory !== 0
                                    ? sizeFromHistory : leftPanelDefaultSize;
        }
        history.put(HISTORY.LEFT_PANEL_SIZE, leftPanelSize);
        this.setState({
            showLeftPanel,
            leftPanelSize,
        });
    }

    /**
     * Update bottom panel state
     * @param {boolean} showBottomPanel
     * @param {number} bottomPanelSize
     */
    setBottomPanelState(showBottomPanel, bottomPanelSize) {
        const { history } = this.props.appContext.pref;
        if (_.isNil(bottomPanelSize)) {
            const sizeFromHistory = history.get(HISTORY.BOTTOM_PANEL_SIZE);
            bottomPanelSize = !_.isNil(sizeFromHistory) && sizeFromHistory !== 0
                                    ? sizeFromHistory : bottomPanelDefaultSize;
        }
        history.put(HISTORY.BOTTOM_PANEL_IS_ACTIVE, showBottomPanel);
        history.put(HISTORY.BOTTOM_PANEL_SIZE, bottomPanelSize);
        this.setState({
            showBottomPanel,
            bottomPanelSize,
        });
    }


    /**
     * @inheritdoc
     */
    render() {
        const {showBottomPanel, bottomPanelSize} = this.state;
        const renderedBottomPanelSize = showBottomPanel ? bottomPanelSize : 0;

        return (
            <div className="" onContextMenu={() => false}>
                <Header
                    views={this.getViewsForRegion(REGIONS.HEADER)}
                    panelResizeInProgress={this.state.panelResizeInProgress}
                    width={this.state.documentWidth}
                    height={headerHeight}
                />
                <ToolArea
                    views={this.getViewsForRegion(REGIONS.TOOL_AREA)}
                    panelResizeInProgress={this.state.panelResizeInProgress}
                    width={this.state.documentWidth}
                    height={toolAreaHeight}
                />
                <SplitPane
                    ref={(ref) => { this.leftRightSplitPane = ref; }}
                    split="vertical"
                    className="left-right-split-pane"
                    allowResize={this.state.showLeftPanel}
                    minSize={this.state.showLeftPanel ? leftPanelDefaultSize : leftPanelClosedSize}
                    maxSize={leftPanelMaxSize}
                    defaultSize={this.state.showLeftPanel ? this.state.leftPanelSize : leftPanelClosedSize}
                    onChange={(size) => {
                        this.state.panelResizeInProgress = true;
                        this.setLeftPanelState(true, size);
                    }
                    }
                    onDragFinished={() => {
                        if (!_.isNil(this.leftRightSplitPane)) {
                            this.leftRightSplitPane.setState({
                                resized: false,
                                draggedSize: undefined,
                            });
                        }
                        this.setState({
                            panelResizeInProgress: false,
                        });
                    }
                    }
                    style={{
                        height: this.state.documentHeight - (headerHeight + toolAreaHeight),
                    }}
                >
                    <LeftPanel
                        panelResizeInProgress={this.state.panelResizeInProgress}
                        width={this.state.leftPanelSize}
                        height={this.state.documentHeight - (headerHeight + toolAreaHeight)}
                        onActiveViewChange={
                            (newView) => {
                                if (!_.isNil(this.leftRightSplitPane)) {
                                    this.leftRightSplitPane.setState({
                                        resized: false,
                                        draggedSize: undefined,
                                    });
                                }
                                this.setLeftPanelState(!_.isNil(newView));
                            }
                        }
                        views={this.getViewsForRegion(REGIONS.LEFT_PANEL)}
                    />
                    <SplitPane
                        ref={(ref) => { this.topBottomSplitPane = ref; }}
                        className="top-bottom-split-pane"
                        split="horizontal"
                        primary="second"
                        minSize={this.state.showBottomPanel ? bottomPanelDefaultSize : 0}
                        maxSize={bottomPanelMaxSize}
                        defaultSize={renderedBottomPanelSize}
                        onChange={(size) => {
                            this.state.panelResizeInProgress = true;
                            this.setBottomPanelState(true, size);
                        }
                        }
                        onDragFinished={() => {
                            if (!_.isNil(this.topBottomSplitPane)) {
                                this.topBottomSplitPane.setState({
                                    resized: false,
                                    draggedSize: undefined,
                                });
                            }
                            this.setState({
                                panelResizeInProgress: false,
                            });
                        }
                        }
                        pane1Style={{
                            height: this.state.documentHeight - (headerHeight + toolAreaHeight +
                                renderedBottomPanelSize),
                        }}
                    >
                        <EditorArea
                            panelResizeInProgress={this.state.panelResizeInProgress}
                            width={this.state.documentWidth -
                                (this.state.showLeftPanel ? this.state.leftPanelSize : leftPanelClosedSize)}
                            height={this.state.documentHeight - (headerHeight + toolAreaHeight
                                    + renderedBottomPanelSize)}
                            views={this.getViewsForRegion(REGIONS.EDITOR_AREA)}
                        />
                        <BottomPanel
                            maximize={this.state.showBottomPanel && this.state.bottomPanelSize === bottomPanelMaxSize}
                            onClose={
                                () => {
                                    this.setBottomPanelState(false);
                                }
                            }
                            onToggleMaximizedState={
                                (isMaximized) => {
                                    const newSize = isMaximized ? bottomPanelMaxSize : bottomPanelDefaultSize;
                                    this.setBottomPanelState(true, newSize);
                                }
                            }
                            onActiveViewChange={
                                (newView) => {
                                    this.setBottomPanelState(!_.isNil(newView));
                                    if (!_.isNil(this.topBottomSplitPane)) {
                                        this.topBottomSplitPane.setState({
                                            resized: false,
                                            draggedSize: undefined,
                                        });
                                    }
                                }
                            }
                            views={this.getViewsForRegion(REGIONS.BOTTOM_PANEL)}
                            panelResizeInProgress={this.state.panelResizeInProgress}
                            width={this.state.documentWidth -
                                (this.state.showLeftPanel ? this.state.leftPanelSize : leftPanelClosedSize)}
                            height={this.state.bottomPanelSize}
                        />
                    </SplitPane>
                </SplitPane>
            </div>
        );
    }
}

App.propTypes = {
    layoutPlugin: PropTypes.objectOf(Object).isRequired,
    appContext: PropTypes.objectOf(Object).isRequired,
    layout: PropTypes.objectOf(Object).isRequired,
};

App.childContextTypes = {
    history: PropTypes.shape({
        put: PropTypes.func,
        get: PropTypes.func,
    }).isRequired,
    command: PropTypes.shape({
        on: PropTypes.func,
        dispatch: PropTypes.func,
    }).isRequired,
    alert: PropTypes.shape({
        showInfo: PropTypes.func,
        showSuccess: PropTypes.func,
        showWarning: PropTypes.func,
        showError: PropTypes.func,
    }).isRequired,
};

export default App;
