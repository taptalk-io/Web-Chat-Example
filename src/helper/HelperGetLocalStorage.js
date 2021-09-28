export class HelperGetLocalStorage {
    getLocalStorageData(index) {
        try {
            let localStorageData = null; 

            localStorageData = JSON.parse(
                JSON.parse(localStorage.getItem("persist:root"))[index]
            );
            
            return localStorageData;
        }catch(e) {
            return null;
        }
    }
}

export default new HelperGetLocalStorage()



