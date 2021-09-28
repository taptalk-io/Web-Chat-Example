import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Register.scss';
import LogoTaptalk from '../../assets/img/logo-taptalk.png';
import FlagGlobe from '../../assets/img/flag-globe.svg';
import ChatService from '../../services/ChatService';
import axios from 'axios';
import Helper from "../../helper/Helper";
import { connect } from 'react-redux';
import { taptalk } from '@taptalk.io/web-sdk';
import PhoneCodeModal from '../../component/reuseableComponent/phoneCodeModal/PhoneCodeModal';
import { FiChevronDown } from 'react-icons/fi';

var Register = (props) => {
  useEffect(() => {
    if(taptalk.isAuthenticated()) {
      window.location.href = "/chat"
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [taptalk.isAuthenticated()])

  let authenticationHeader = {
    "App-Key": btoa(`${props.appData.data.appID}:${props.appData.data.appSecret}`),
    "Authorization": "",
    "Device-Model": navigator.appName,
    "Device-Platform": "web",
    // "Server-Key": btoa(`${props.appData.data.serverID}:${props.appData.data.serverSecret}`)
  };

  let [loadingRegister, setLoadingRegister] = useState(false);
  let [country, setCountry] = useState(false);
  let [countryList, setCountryList] = useState(false);
  let [countryListArray, setCountryListArray] = useState(false);
  let [loadingCountry, setLoadingCountry] = useState(false);
  let [isOpenPhoneCodeModal, setIsOpenPhoneCodeModal] = useState(false);
  let [valRegister, setValRegister] = useState({
    fullname: "",
    username: "",
    phone: "",
    email: ""
  })
  let [successRegister, setSuccessRegister] = useState(false); 

  useEffect(() => {

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [successRegister])

  let togglePhoneCodeModal = () => {
    if(!loadingCountry || loadingRegister) {
      setIsOpenPhoneCodeModal(!isOpenPhoneCodeModal);
    }
  }

  let onSelectPhoneCode = (val) => {
    let _val = {...valRegister};
    _val.phone = `+${val.callingCode} `;
    setValRegister(_val);
    setCountry(val);
  }

  let getCountry = () => {
    setLoadingCountry(true);

    ChatService.postGetCountry((response) => {
      let newCountryList = {};

      response.dataResult.data.countries.map((value) => {
          let firstWord = value.commonName[0];

          if(newCountryList[firstWord]) {
            newCountryList[firstWord].push(value);
          }else {
            newCountryList[firstWord] = [value];
          }

          setCountryListArray(response.dataResult.data.countries);
          return null;
      })

      setCountryList(newCountryList);
    })
  }

  useEffect(() => {
    getCountry();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  useEffect(() => {
    if(countryList) {
      setLoadingCountry(false);

      if(props.history.location.state) {
        let _valRegister = {...valRegister};
        setCountry(props.history.location.state.country);
        _valRegister.phone = props.history.location.state.valPhone;
        setValRegister(_valRegister)
      }else {
        setCountry({
          callingCode: "62",
          commonName: "Indonesia",
          currencyCode: "IDR",
          flagIconURL: "https://storage.googleapis.com/9a3048-taptalk-prd-public/static/flags/ID@2x.png",
          id: 1,
          isEnabled: true,
          isHidden: false,
          iso2Code: "ID",
          iso3Code: "IDN",
          officialName: "Republic of Indonesia"
        })
  
        let _valRegister = {...valRegister};
        _valRegister.phone = "+62 ";
        setValRegister(_valRegister);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [countryList])

  let onChangeInput = (e) => {
    let _val = {...valRegister}; 
    let re = /^\+[0-9\s]*$/;

    if(e.target.id === "phone") {
      if(e.target.value.length >= country.callingCode.length + 2 && re.test(e.target.value)) {
        _val.phone = e.target.value;
      }
    }else {
      _val[e.target.id] = e.target.value;
    }

    setValRegister(_val);
  }

  let requestAccessToken = (token) => {
    let appData = props.appData.data;
    let appID = appData.appID;
    let appSecret = appData.appSecret;
    // let serverID = appData.serverID;
    // let serverSecret = appData.serverSecret;
    let baseApiUrl = appData.baseApiUrl;

    taptalk.init(appID, appSecret, baseApiUrl);

    taptalk.authenticateWithAuthTicket(token, false, {
      onSuccess: (successMessage) => {
        setSuccessRegister(true);
        // window.location.href = "/chat";
      },
      onError: (errorCode, errorMessage) => {
        setLoadingRegister(false);
        Helper.doToast("Please input your correct phone number", "fail")
        console.log(errorCode, errorMessage);
      }
    })
  }

  let registerAction = (e) => {
    if(e) {
      e.preventDefault();
    }

    setLoadingRegister(true);

		let url = `${props.appData.data.baseApiUrl}/v1/client/register`;

    let _phone = valRegister.phone.split(" ");
    _phone.shift();
    _phone = _phone.join("");

    let data = {
      "fullname": valRegister.fullname,
      "email": valRegister.email,
      "countryID": country.id,
      "phone": _phone,
      "username": valRegister.username,
    };
    
    axios.post(url, data, {headers: authenticationHeader})
      .then(function (response) {
        let _response = response.data;

        if(_response.error.code === "") {
          requestAccessToken(_response.data.ticket)
        }else {
          setLoadingRegister(false);
          Helper.doToast(_response.error.message, "fail")
          console.log(_response.error.message);
        }
      })
      .catch(function (error) {
        setLoadingRegister(false);
        console.log(error);
      });
  }

  let checkUsername = () => {
    let pass = true;
    let re = /^([a-zA-Z0-9/_/.]){4,32}$/;
    let reNum = /^\d+$/;
    let _username = {...valRegister}.username;
    let indexUnderscore = _username.split("").findIndex(val => val === "_");
    let indexDot = _username.split("").findIndex(val => val === ".");

    if(!re.test(_username)) {
      pass = false;
    }

    if(reNum.test(_username[0]) || _username[0] === "_" || _username[0] === "." ) {
      pass = false;
    }

    if(_username[_username.length - 1] === "_" || _username[_username.length - 1] === "." ) {
      pass = false;
    }

    if(_username.includes("_.") || _username.includes("._")) {
      pass = false;
    }

    if((_username[indexUnderscore] + _username[indexUnderscore + 1] === "__") || (_username[indexDot] + _username[indexDot + 1] === "..")) {
      pass = false;
    }

    return pass;
  }

  let isDisabled = () => {
    let isDisabled = false;
    let _valPhone = valRegister.phone.replace("+", "").split(" ").join("");
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if(_valPhone.length < 7 || _valPhone.length > 15) {
      isDisabled = true;
    }

    if(
      valRegister.fullname === "" ||
      !checkUsername() ||
      !country
    ) {
      isDisabled = true;
    }

    if(country && (country.callingCode.length === valRegister.phone.length)) {
      isDisabled = true;
    }

    if(valRegister.email !== "") {
      if(!re.test(valRegister.email)) {
        isDisabled = true;
      }
    }

    return isDisabled;
  }

  return (
    <div className="register-wrapper">
      <PhoneCodeModal 
        isOpen={isOpenPhoneCodeModal}
        onSelect={onSelectPhoneCode}
        toggle={togglePhoneCodeModal}
        value={country}
        countryList={countryList}
        countryListArray={countryListArray}
      />

      <div className="orange-border" />
      
      <div className="register-main-content">
        <img src={LogoTaptalk} alt="" />
        <br />

        <div className="register-card">
          <b className="title-register">Register</b>
          <p>Looks like you don’t have an account yet, please register below.</p>
          
          <form onSubmit={(e) => registerAction(e)}>
            <div className="phone-wrapper">
              {/* <div className="code-phone">
                <label>
                  <b>Code</b>
                </label>
                <input type="text" placeholder="+62" value={valuePhoneCode} readOnly={true} />
              </div> */}

              <label>
                <b>Full Name</b>
              </label>

              <input type="text" 
                    placeholder={"e.g John Doe"}
                    id="fullname"
                    value={valRegister.fullname}
                    onChange={(e) => onChangeInput(e)}
                    disabled={loadingRegister}
              />

              <label>
                <b>Username</b>
              </label>

              <input type="text" 
                    placeholder={"e.g user1234_"}
                    id="username"
                    value={valRegister.username}
                    onChange={(e) => onChangeInput(e)}
                    disabled={loadingRegister}
                    maxLength={32}
              />

              <ul className="username-requirement">
                <li>Username is always required.</li>
                <li>Must be between 4-32 characters.</li>
                <li>Can only contain a-z, 0-9, underscores, and dot.</li>
                <li>Can't start with number or underscore or dot.</li>
                <li>Can't end with underscore or dot.</li>
                <li>Can't contain consecutive underscores, consecutive dot, underscore followed with dot, and otherwise.</li>
              </ul>

              <div className="phone-number">
                <div className="phone-country" onClick={togglePhoneCodeModal}>
                  <img src={!country ? FlagGlobe : country.flagIconURL} alt="" onError={(e) => {e.target.onerror = null; e.target.src = FlagGlobe;}} />
                  <FiChevronDown />
                </div>

                <label>
                  <b>Phone Number</b>
                </label>

                <input type="text" 
                      placeholder={loadingCountry ? "Loading Countries" : country ? "Input phone number" : "Select country first"}
                      id="phone"
                      value={valRegister.phone}
                      disabled={loadingCountry || !country || loadingRegister}
                      onChange={(e) => onChangeInput(e)}
                      className="input-phone"
                      maxLength={19}
                />

                {loadingCountry &&
                  <div className="lds-ring">
                    <div /><div /><div /><div />
                  </div>
                }
              </div>

              <label>
                <b>Email address </b><span>(optional)</span>
              </label>

              <input type="text" 
                    placeholder={"e.g example@work.com"}
                    id="email"
                    value={valRegister.email}
                    onChange={(e) => onChangeInput(e)}
                    disabled={loadingRegister}
              />
            </div>


            {!loadingRegister &&
                <button className="orange-button" disabled={isDisabled()}>
                    Continue
                </button>
            }
          </form>

          {loadingRegister &&
              <button className="orange-button">
                <div className="lds-ring">
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              </button>
          }

          <p className="dont-have-account">
            <b>
              Already have an account? <Link to="/login">Sign In</Link>
            </b>
          </p>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  appData: state.appData,
});

export default connect(mapStateToProps, null)(Register);