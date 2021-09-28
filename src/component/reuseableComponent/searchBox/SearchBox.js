import React from 'react';
import './SearchBox.scss';
import { FiX } from "react-icons/fi";
import SearchGrey from '../../../assets/img/icon-search-grey.svg';
// import SearchOrange from '../../../assets/img/icon-search-orange.svg';
// import CloseCircle from '../../../assets/img/icon-xcircle-grey.svg';

var SearchBox = (props) => {
  return (
    <div className={`search-box-wrapper ${props.value === "" ? "empty-search" : ""}`} style={props.style}>
        <input type="text" 
               placeholder={props.placeholder} 
               onChange={(e) => props.onChangeInputSearch(e)}
               className="search-box-input"
               autoComplete="off"
               value={props.value}
        />
        <img src={SearchGrey} className="search-icon search-grey-icon" alt="" />
        {/* <img src={SearchOrange} className="search-icon search-orange-icon" alt="" /> */}

        {props.value !== "" &&
          <FiX onClick={props.clearSearchingProps} className="clear-search-box" />
        }
        {/* <img src={CloseCircle} className="delete-search" alt="" /> */}
    </div>
  );
}

export default SearchBox;
