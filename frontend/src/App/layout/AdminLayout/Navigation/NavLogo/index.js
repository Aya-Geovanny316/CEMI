import React from 'react';
import Aux from "../../../../../hoc/_Aux";

const navLogo = () => {
    return (
        <Aux>
            <div className="navbar-brand header-logo" style={{ backgroundColor: '#2f3e5a' }}>
                <div className="b-brand">
                    <div className="b-bg">
                        <i className="feather icon-trending-up" />
                    </div>
                    <span className="b-title">Hospital General</span>
                </div>
            </div>
        </Aux>
    );
};

export default navLogo;
