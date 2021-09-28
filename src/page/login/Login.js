import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Login.scss';
import { Modal, ModalBody } from 'reactstrap';
import { IoIosClose } from 'react-icons/io';
import LogoTaptalk from '../../assets/img/logo-taptalk.png';
import FlagGlobe from '../../assets/img/flag-globe.svg';
import IconChatting from '../../assets/img/icon-chatting.svg';
// import IconCallNumber from '../../assets/img/icon-call-number.svg';
import IconRefresh from '../../assets/img/icon-refresh.svg';
import WhatsAppIcon from '../../assets/img/whatsappIcon.svg'; 
import ChatService from '../../services/ChatService';
import axios from 'axios';
import Helper from "../../helper/Helper";
import { connect } from 'react-redux';
import { taptalk } from '@taptalk.io/web-sdk';
import PhoneCodeModal from '../../component/reuseableComponent/phoneCodeModal/PhoneCodeModal';
import { FiChevronDown } from 'react-icons/fi';

const OTP_CHANNEL = {
  sms: "sms",
  whatsapp: "whatsapp"
}

var Login = (props) => {
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

  let [modalOTP, setModalOTP] = useState(false);
  // let [valuePhoneCode] = useState("+62");
  let [valPhone, setValPhone] = useState("");
  let [loadingRequestOTP, setLoadingRequestOTP] = useState(false);
  let [otpID, setOtpID] = useState("");
  let [otpKey, setOtpKey] = useState("");
  let [valOtpCode, setValOtpCode] = useState("");
  let [loadingVerifyOTP, setLoadingVerifyOTP] = useState(false);

  let [timerOTP, setTimerOTP] = useState(5);
  let [waitRequestOtp, setWaitRequestOtp] = useState(false);
  let [isOTPFalse, setIsOTPFalse] = useState(false);
  let [otpChannel, setOtpChannel] = useState(OTP_CHANNEL.sms);
  let [phoneWithCode, setPhoneWithCode] = useState("");
  let [country, setCountry] = useState(false);
  let [countryList, setCountryList] = useState(false);
  let [countryListArray, setCountryListArray] = useState(false);
  let [loadingCountry, setLoadingCountry] = useState(false);
  let [isOpenPhoneCodeModal, setIsOpenPhoneCodeModal] = useState(false);
  let [otpInvalid, setOtpInvalid] = useState(false);

  let togglePhoneCodeModal = () => {
    if(!loadingCountry) {
      setIsOpenPhoneCodeModal(!isOpenPhoneCodeModal);
    }
  }

  let onSelectPhoneCode = (val) => {
    setValPhone(`+${val.callingCode} `);
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
      setValPhone(`+62 `);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [countryList])

  let toggleModalOTP = () => setModalOTP(!modalOTP);

  let onChangePhoneNumber = (e) => {
    let re = /^\+[0-9\s]*$/;
    if(e.target.value.length >= country.callingCode.length + 2 && re.test(e.target.value)) {
      setValPhone(e.target.value);
    }
  }

  let requestOTP = (e) => {
    setIsOTPFalse(false);

    if(e) {
      e.preventDefault();
    }

    setLoadingRequestOTP(true);
		let url = `${props.appData.data.baseApiUrl}/v1/client/login/request_otp/v1_6`;
    let _phone = valPhone.split(" ");
    _phone.shift();
    _phone = _phone.join("");

		let data = {
      countryID: country.id,
			method: 'phone',
			// countryID: 1,
			phone: _phone
    };
    
    axios.post(url, data, {headers: authenticationHeader})
      .then(function (response) {
        let _response = response.data;

        if(_response.error.code === "") {
          if(_response.data.success) {
            setModalOTP(true);
            setOtpID(_response.data.otpID);
            setOtpKey(_response.data.otpKey);
            setOtpChannel(_response.data.channel);
            setPhoneWithCode(_response.data.phoneWithCode);
          }else {
            Helper.doToast(_response.data.message, "fail")
          }

          setLoadingRequestOTP(false);
        }else {
          setLoadingRequestOTP(false);
          Helper.doToast("Please input your correct phone number", "fail")
          console.log(_response.error.message);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  
  let onChangeOtpNumber = (e) => {
    const re = /^[0-9\b]+$/;

    // if value is not blank, then test the regex

    if (e.target.value === '' || re.test(e.target.value)) {
      setValOtpCode(e.target.value);
    }
  }

	let verifyOTP = (e) => {
    e.preventDefault();
    setLoadingVerifyOTP(true);
		let url = `${props.appData.data.baseApiUrl}/v1/client/login/verify_otp`;
		let data = {
			otpID: otpID,
			otpKey: otpKey,
			otpCode: valOtpCode
		};

    axios.post(url, data, {headers: authenticationHeader})
      .then(function (response) {
        let _response = response.data;
        
        if(_response.error.code === "") {
          setIsOTPFalse(false);
          // phoneWithCode
          if(!_response.data.isRegistered) {
            props.history.push({
              pathname: "/register",
              state: {
                country: country,
                valPhone: valPhone
              }
            })
          }else {
            requestAccessToken(_response.data.ticket);
          }
        }else {
          setLoadingVerifyOTP(false);

          if(_response.error.code === "40002") {
            setOtpInvalid(_response.error.message);
            setIsOTPFalse(true);
          }

          console.log(_response.error.message);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
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
        setLoadingVerifyOTP(false);
        // window.location.href = "/chat";
      },
      onError: (errorCode, errorMessage) => {
        setLoadingVerifyOTP(false);
        Helper.doToast("Please input your correct phone number", "fail")
        console.log(errorCode, errorMessage);
      }
    })
  }
  
  let requestAgainAction = () => {
    requestOTP();
    setIsOTPFalse(false);
    setWaitRequestOtp(true);
    let _timerOTP = 5;
    setTimerOTP(_timerOTP);

    let countdownRequestAgain = setInterval(() => {
      _timerOTP--;
      setTimerOTP(_timerOTP);

      if(_timerOTP === 0) {
        clearInterval(countdownRequestAgain);
        setWaitRequestOtp(false);
      }
      
    }, 1000);
  };

  let generateOTPModal = () => {
    return (
      <Modal isOpen={modalOTP} toggle={toggleModalOTP} className="otp-modal">
        <ModalBody>
          <div className="otp-modal-header">
            <b>Verification code sent</b>
            <IoIosClose onClick={() => toggleModalOTP()}/>
          </div>

          <div className={`icon-chatting-wrapper ${otpChannel === OTP_CHANNEL.sms ? "" : "otp-whatsapp"}`}>
            <img src={otpChannel === OTP_CHANNEL.sms ? IconChatting : WhatsAppIcon} alt="" />
          </div>

          <form onSubmit={(e) => verifyOTP(e)}>
            <p 
              className="otp-info" 
              dangerouslySetInnerHTML={{__html: otpChannel === OTP_CHANNEL.sms ? 
                `Enter the 6 digit OTP we've sent by SMS to <b>+${phoneWithCode}</b>`
                :
                `Enter the 6 digit OTP we've sent by WhatsApp to <b>+${phoneWithCode}</b>`
              }}
            />

            {/* <p className="re-type-phone" onClick={() => setModalOTP(false)}>
              <img src={IconCallNumber} alt="" />
              <b>Re-enter your mobile number</b>
            </p> */}

            <input type="text" alt="" placeholder="Enter OTP" onChange={(e) => onChangeOtpNumber(e)} value={valOtpCode} maxLength={6} />

            {isOTPFalse && 
              <p style={{margin: '10px 0 0', color: 'red'}}>{otpInvalid}</p>
            }

            {!loadingVerifyOTP &&
                <button className="orange-button">
                  Continue
                </button>
            }
          </form>

          {loadingVerifyOTP &&
            <button className="orange-button">
              <div className="lds-ring">
                <div />
                <div />
                <div />
                <div />
              </div>
            </button>
          }

          <p className="not-receiving-otp">
            Didn’t receive the 6 digit OTP?
          </p>

          {!waitRequestOtp ?
            <p className="resend-otp" onClick={() => requestAgainAction()}>
              <img src={IconRefresh} alt="" /> <b>Request Again</b>
            </p>
            :
            <p className="wait-otp">
              <b>Wait 0:{timerOTP < 10 ? "0"+timerOTP : timerOTP}</b>
            </p>
          }
        </ModalBody>
      </Modal>
    )
  }

  let isDisabled = () => {
    let disabled = false;
    let _valPhone = valPhone.replace("+", "").split(" ").join("");

    if(_valPhone.length < 7 || _valPhone.length > 15 || !country) {
      disabled = true;
    }

    return disabled;
  }

  return (
    <div className="login-wrapper">
      <PhoneCodeModal 
        isOpen={isOpenPhoneCodeModal}
        onSelect={onSelectPhoneCode}
        toggle={togglePhoneCodeModal}
        value={country}
        countryList={countryList}
        countryListArray={countryListArray}
      />
      
      <div className="orange-border" />
      
      <div className="login-main-content">
        <img src={LogoTaptalk} alt="" />
        <br />

        <div className="login-card">
          <b className="title-welcome">Welcome</b>
          <p>Enter your mobile number to continue</p>
          
          <form onSubmit={(e) => requestOTP(e)}>
            <div className="phone-wrapper">
              {/* <div className="code-phone">
                <label>
                  <b>Code</b>
                </label>
                <input type="text" placeholder="+62" value={valuePhoneCode} readOnly={true} />
              </div> */}

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
                      id="phone-number-input"
                      value={valPhone}
                      disabled={loadingCountry || !country}
                      onChange={(e) => onChangePhoneNumber(e)}
                      maxLength={19}
                />

                {loadingCountry &&
                  <div className="lds-ring">
                    <div /><div /><div /><div />
                  </div>
                }
              </div>
            </div>

            {!loadingRequestOTP &&
                <button className="orange-button" disabled={isDisabled()}>
                    Continue
                </button>
            }
          </form>

          {loadingRequestOTP &&
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
              Don't have an account? <Link to="/register">Sign Up</Link>
            </b>
          </p>
        </div>
      </div>

      {generateOTPModal()}
    </div>
  );
}

const mapStateToProps = state => ({
  appData: state.appData,
});

export default connect(mapStateToProps, null)(Login);