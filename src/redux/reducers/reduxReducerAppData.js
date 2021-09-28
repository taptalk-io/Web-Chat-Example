const INITIAL_STATE = {};

let reduxReducerAppData = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_APP_DATA':
        return action.appData;
      case 'CLEAR_APP_DATA':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reduxReducerAppData;