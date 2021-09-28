import React, { useEffect, useState } from 'react';
import './PhoneCodeModal.scss';
import { Modal, ModalBody } from 'reactstrap';
import FlagGlobe from "../../../assets/img/flag-globe.svg";
import { FiX } from 'react-icons/fi';
import SearchBox from "../searchBox/SearchBox";

let PhoneCodeModal = (props) => {
    let {isOpen, toggle, countryList, onSelect, countryListArray} = props;
    let [currentCountryList, setCurrentCountryList] = useState({});
    let [countrySearch, setCountrySearch] = useState("");

    useEffect(() => {
        if(isOpen) {
            setCurrentCountryList(countryList);
        }else {
            setCountrySearch("");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOpen])

    useEffect(() => {
        if(countrySearch) {
            filterCountry(countrySearch);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [countrySearch])

    let searchCountryAction = (e) => {
        setCountrySearch(e.target.value)
    }

    let filterCountry = (word) => {
        let res = countryListArray.filter(val => val.commonName.toLowerCase().includes(word.toLowerCase()));
        let _countryList = {};

        res.map(val => {
            let firstWord = val.commonName[0];
    
            if(_countryList[firstWord]) {
                _countryList[firstWord].push(val);
            }else {
                _countryList[firstWord] = [val];
            }
            
            return null;
        })

        setCurrentCountryList(_countryList);
    }

    return (
        <Modal className="modal-phone-code" toggle={toggle} isOpen={isOpen}>
            <ModalBody>
                <div className="modal-phone-code-header">
                    <b>Select Country</b>

                    <FiX onClick={toggle} />
                </div>

                <div className="modal-phone-search">
                    <SearchBox 
                        placeholder="Search for country" 
                        style={{width: '100%'}} 
                        onChangeInputSearch={searchCountryAction} 
                        value={countrySearch}
                        clearSearchingProps={() => setCountrySearch("")}
                    />
                </div>

                <div className="modal-phone-code-body">
                    {Object.keys(currentCountryList).map((val, idx) => {
                        return (
                            currentCountryList[val].map((_val, _idx) => {
                                return (
                                    <React.Fragment key={`country-${_idx}`}>
                                        {_idx === 0 &&
                                            <div className="alphabet-wrapper" >
                                                <b>{val}</b>
                                            </div>
                                        }

                                        <div 
                                            className="country-wrapper" 
                                            key={`country-${_idx}`} 
                                            onClick={() => {
                                                onSelect(_val);
                                                toggle();
                                            }}
                                        >
                                            <img src={_val.flagIconURL} alt="" onError={(e) => {e.target.onerror = null; e.target.src = FlagGlobe;}} />

                                            <b>{_val.commonName}</b>
                                        </div>
                                    </React.Fragment>
                                )
                            })
                        )
                    })}
                </div>
            </ModalBody>
        </Modal>
    )
}

export default PhoneCodeModal;