import React from 'react';
import './CircleLoading.scss'

var CircleLoading = (props) => {
    return (
        <div style={props.style} className="circle-loading-wrapper">
            <div className="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
}

export default CircleLoading;
