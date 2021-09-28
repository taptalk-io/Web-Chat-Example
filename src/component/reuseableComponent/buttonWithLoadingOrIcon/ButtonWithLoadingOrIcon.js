//buttonStyle.scss

import React from "react";
import "./ButtonWithLoadingOrIcon.scss";
import Loading from "../loading/Loading";

let ButtonWithLoadingOrIcon = (props) => {
    let {
        className, 
        isDisabled, 
        icon, 
        position, 
        isLoading, 
        loadingWhite,
        loadingColor = "",
        text,
        onClickAction,
        gtmevent,
        style,
        isBold
    } = props;

    let onClickButton = () => {
        if(onClickAction) {
            onClickAction()
        }
    }
    
    return (
        !gtmevent ?
            <button 
                className={`
                    main-reuseable-button
                    ${className} 
                    ${isLoading ? "cursor-default" : ""}
                    ${isLoading || icon ?
                        (position === "left" ?
                            "with-image-or-loading-left"
                            :
                            "with-image-or-loading-right"
                        )
                        :
                        ""
                    }
                `}
                disabled={isDisabled}
                onClick={onClickButton}
                style={style}
            >
                {(icon && position === "left") &&
                    (icon.type === "img" ? 
                        <img src={icon.src} alt="" />
                        :
                        <icon.src />
                    )
                }

                {isLoading && position === "left" &&
                    <div className="loading-left">
                        <Loading color={loadingWhite ? "white" : loadingColor} />
                    </div>
                }
                
                <div className="button-text-wrapper">
                    {/* <b className={`${isLoading || icon ? "top-0" : ""}`}>{text}</b> */}
                    {isBold ?
                        <span>{text}</span>
                        :
                        <b>{text}</b>
                    }
                </div>
                
                {(icon && position === "right") &&
                    (icon.type === "img" ? 
                        <img src={icon.src} alt="" className="icon-right" />
                        :
                        <icon.src className="icon-right" />
                    ) 
                }

                {isLoading && position === "right" &&
                    <div className="loading-right">
                        <Loading color={loadingWhite ? "white" : loadingColor} />
                    </div>
                }

                {(isLoading && !position) &&
                    <Loading color={loadingWhite ? "white" : loadingColor} />
                }
            </button>

            :

            <button 
                className={`main-reuseable-button ${className}`}
                disabled={isDisabled}
                onClick={onClickButton}
                gtmevent={gtmevent}
                style={style}
            >
                {(icon && position === "left") &&
                    (icon.type === "img" ? 
                        <img src={icon.src} alt="" />
                        :
                        <icon.src /> 
                    )
                }

                {isLoading && position === "left" &&
                    <div className="loading-left">
                        <Loading color={loadingWhite ? "white" : loadingColor} />
                    </div>
                }
                
                <p>
                    {/* <b className={`${isLoading || icon ? "top-0" : ""}`}>{text}</b> */}
                    {text}
                </p>
                
                {(icon && position === "right") &&
                    (icon.type === "img" ? 
                        <img src={icon.src} alt="" className="icon-right" />
                        :
                        <icon.src className="icon-right" />
                    ) 
                }

                {isLoading && position === "right" &&
                    <div className="loading-right">
                        <Loading color={loadingWhite ? "white" : loadingColor} />
                    </div>
                }

                {(isLoading && !position) &&
                    <Loading color={loadingWhite ? "white" : loadingColor} />
                }
            </button>
    )
}

export default ButtonWithLoadingOrIcon;