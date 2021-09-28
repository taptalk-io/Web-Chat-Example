import React, { useState } from "react";
import "./PhoneCodePicker.scss";
import { FiCheck, FiSearch, FiChevronDown, FiGlobe } from "react-icons/fi";
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import flagGlobe from "../../../assets/img/flag-globe.svg";

let PhoneCodePicker = (props) => {
    let [countryListSearch, setCountryListSearch] = useState({
        keyword: "",
        countryList: []
    });
    let [isShowDropdownCountry, setIsShowDropdownCountry] = useState(false);

    let toggleDropdownCountry = () => {
        let _countryListSearch = {...countryListSearch};
        
        _countryListSearch = {
            keyword: "",
            countryList: []
        }
        setCountryListSearch(_countryListSearch);

        setIsShowDropdownCountry(!isShowDropdownCountry);
    }

    let onChangeSearchCountry = (e) => {
        let _countryListSearch = {...countryListSearch};
        let _countryList = props.countryListProps.slice();

        _countryListSearch.keyword = e.target.value;
        _countryListSearch.countryList = _countryList.filter(val => val.countryLabel.toLowerCase().includes(e.target.value.toLowerCase()));
        setCountryListSearch(_countryListSearch);

    }

    let onChangeSelectCountry = (data, index) => {
        let _countryProps = null;

        if(props.isMultipleProps) {
            let _countryProps = {...props.countryProps};
            _countryProps[index] = data;
        }else {
            _countryProps = data;
        }

        props.onChangeCountryCodeProps(_countryProps);
        toggleDropdownCountry();
    }

    return (
        <div className="area-code-wrapper">
            <Dropdown isOpen={isShowDropdownCountry && !props.isDisabled} toggle={() => toggleDropdownCountry()} className="dropdown-country-code-picker">
                <DropdownToggle className="value-country-code-wrapper">
                    {props.countryProps.countryFlag ?
                    <img src={props.countryProps.countryFlag} alt="" className="country-flag" onError={(e) => {e.target.onerror = null; e.target.src = flagGlobe;}} />
                    :
                    <div className="area-code-placeholder">
                        <FiGlobe />
                    </div>
                    }
                    {props.withoutCode ? "" : +props.countryProps.countryCodeNumber}

                    <FiChevronDown className={isShowDropdownCountry && !props.isDisabled ? "chevron-up" : ""} />
                </DropdownToggle>
                <DropdownMenu>
                    <div className="country-search-wrapper">
                        <FiSearch />
                        <input type="text" onChange={(e) => onChangeSearchCountry(e)} value={countryListSearch.keyword} />
                    </div>

                    <div className="country-list-select">
                        {props.countryListProps &&
                            (countryListSearch.keyword !== "" ?
                                countryListSearch.countryList.length > 0 ?
                                    <div className="country-list-select">
                                        {countryListSearch.countryList.map((value, key) => {
                                            return (
                                                <div 
                                                    className={`custom-phone-code-picker ${props.countryProps.countryCodeNumber === value.countryCodeNumber ? "active-code-number" : ""}`}
                                                    key={`country-list-${key}`}
                                                    onClick={() => onChangeSelectCountry(value, props.indexPhoneCodePickerProps)}
                                                >
                                                    {props.countryProps.countryCodeNumber === value.countryCodeNumber &&
                                                        <FiCheck />
                                                    }
                                                    <img src={value.countryFlag} alt="" onError={(e) => {e.target.onerror = null; e.target.src = flagGlobe;}} />
                                                    <div>
                                                        {value.countryLabel}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                :
                                <div className="country-list-select no-option">
                                    No options
                                </div>
                            :
                            props.countryListProps.map((value, key) => {
                                return (
                                    <div 
                                        className={`custom-phone-code-picker ${props.countryProps.countryCodeNumber === value.countryCodeNumber ? "active-code-number" : ""}`}
                                        key={`country-list-${key}`}
                                        onClick={() => onChangeSelectCountry(value, props.indexPhoneCodePickerProps)}
                                    >
                                        {props.countryProps.countryCodeNumber === value.countryCodeNumber &&
                                            <FiCheck />
                                        }
                                        <img src={value.countryFlag} alt="" onError={(e) => {e.target.onerror = null; e.target.src = flagGlobe;}} />
                                        <div>
                                            {value.countryLabel}
                                        </div>
                                    </div>
                                )
                            }))
                        }
                    </div>
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}

export default PhoneCodePicker;