import React, {Component} from 'react';
import {connect} from 'react-redux';

import NavLeft from "./NavLeft";
import NavRight from "./NavRight";
import Aux from "../../../../hoc/_Aux";

class NavBar extends Component {
    render() {
        let headerClass = ['navbar', 'pcoded-header', 'navbar-expand-lg', this.props.headerBackColor];
        if (this.props.headerFixedLayout) {
            headerClass = [...headerClass, 'headerpos-fixed'];
        }

        return (
            <Aux>
                <header className={headerClass.join(' ')}>
                    <div className="m-header">
                        <div className="b-brand">
                            <div className="b-bg">
                                <i className="feather icon-trending-up"/>
                            </div>
                            <span className="b-title">Hospital General</span>
                        </div>
                    </div>
                    <div className="mobile-menu" id="mobile-header"><i className="feather icon-more-horizontal"/></div>
                    <div className="collapse navbar-collapse">
                        <NavLeft/>
                        <NavRight rtlLayout={this.props.rtlLayout} />
                    </div>
                </header>
            </Aux>
        );
    }
}

const mapStateToProps = state => {
    return {
        rtlLayout: state.rtlLayout,
        headerBackColor: state.headerBackColor,
        headerFixedLayout: state.headerFixedLayout
    }
};

export default connect(mapStateToProps) (NavBar);
