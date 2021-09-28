import { taptalk } from 'taptalksdk-web';
import { toast } from "react-toastify";
import HelperDate from "./HelperDate";

var Helper = {
    doToast: (text = "YOUR TOAST", _className = null) => {
        const config = {
          autoClose: 3000,
          position: "bottom-left",
          className: _className === null ? "ToastContent" : "ToastContent-"+_className,
          hideProgressBar: true
        };

        toast(text, config);
    },
    renderUserAvatarWord: (text, isGroup) => {
        let userAvatarWord = "";
        let nameSplit = text.split(" ");
        let secondName = nameSplit.length > 1 ? nameSplit[1] : '';

        if(isGroup) {
            userAvatarWord = nameSplit[0].substr(0, 1);
        }else {
            userAvatarWord = nameSplit[0].substr(0, 1);
            userAvatarWord += secondName.substr(0, 1);
        }

        return userAvatarWord;
    },

    getHourMinute: (timestamp) => {
        var time = new Date(timestamp);
        return time.getHours()+":"+(time.getMinutes() < 10 ? ("0" + time.getMinutes()) : time.getMinutes())
    },

    forceLogout: () => {
        taptalk.clearUserData();
        window.location.href = "/login";
    },

    copyToClipBoard: (str) => {
        var el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = str;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
    },

    bytesToSize : (bytes) => {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return (bytes / Math.pow(1024, i)).toFixed(2).replace('.00', '') + ' ' + sizes[i];
    },

    msToTime(duration) {
        // var milliseconds = parseInt((duration % 1000) / 100),
        var seconds = Math.floor((duration / 1000) % 60);
        var minutes = Math.floor((duration / (1000 * 60)) % 60);
        var hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
        
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    },

    getLastActivityString(timestamp) {
        let result = "";

        let arrayTime = [
            31536000000, //1 year 0 
            2592000000, // 30 day 1
            604800000, // 7 day 2
            86400000, // 1 day 3 
            3600000, // 1 hour 4
            60000, //  1 min 5
            1000 // 1 sec 6
        ];

        let objectTime = (key, time) => {
            let timeHashmap = {
                "tap_active_recently": "Active recently",
                "tap_format_d_minute_ago": `Active ${Math.floor(time)} minute ago`,
                "tap_format_d_minutes_ago": `Active ${Math.floor(time)} minutes ago`,
                "tap_format_d_hour_ago": `Active ${Math.floor(time)} hour ago`,
                "tap_format_d_hours_ago": `Active ${Math.floor(time)} hours ago`,
                "tap_active_yesterday": `Active yesterday`,
                "tap_format_d_day_ago": `Active ${Math.floor(time)} day ago`,
                "tap_format_d_days_ago": `Active ${Math.floor(time)} days ago`,
                "tap_format_s_last_active": `Last active ${time}`,
                "tap_active_a_week_ago": "Active a week ago"
            }

            return timeHashmap[key];
        }

        let timeGap;
        let timeNow = new Date();
        timeGap = timeNow.valueOf() - timestamp;
        let midnightTimeGap;
        let timestampMidnight = new Date(timestamp);
        let tommorow = timestampMidnight.setDate(timestampMidnight.getDate() + 1);
        let midnightFromSendTime = new Date(tommorow).setHours(0, 0, 0, 0);
        midnightTimeGap = midnightFromSendTime.valueOf() - timestamp;
        
        if (timestamp === 0) {
            result = "";
        } else if ((midnightTimeGap > timeGap) && (timeGap < arrayTime[5])) {
            result = objectTime("tap_active_recently");
        } else if ((midnightTimeGap > timeGap) && (timeGap < arrayTime[4]) && (timeGap < 120000)) {
            let numberOfMinutes = timeGap / arrayTime[5];
            result = objectTime("tap_format_d_minute_ago", numberOfMinutes);
        
        } else if ((midnightTimeGap > timeGap) && (timeGap < arrayTime[4])) {
            let numberOfMinutes = timeGap / arrayTime[5];
            result = objectTime("tap_format_d_minutes_ago", numberOfMinutes);
        
        } else if ((midnightTimeGap > timeGap) && (timeGap < 7200000)) {
            let numberOfHour = timeGap / arrayTime[4];
            result = objectTime("tap_format_d_hour_ago", numberOfHour);
        
        } else if (midnightTimeGap > timeGap) {
            let numberOfHour = timeGap / arrayTime[4];
            result = objectTime("tap_format_d_hours_ago", numberOfHour);
        } else if ((arrayTime[3] + midnightTimeGap) > timeGap) {
            result = objectTime("tap_active_yesterday");
            
        } else if (((arrayTime[3] * 6 + midnightTimeGap) >= timeGap) && (timeGap < 172800000)) {
            let numberOfDays = timeGap / arrayTime[3];
            result = objectTime("tap_format_d_day_ago", numberOfDays);
            
            
        } else if ((arrayTime[3] * 6 + midnightTimeGap) >= timeGap) {
        
            let numberOfDays = timeGap / arrayTime[3];
            result = objectTime("tap_format_d_days_ago", numberOfDays);
        
        } else if (timeGap <= arrayTime[2]) {
        
            result = objectTime("tap_active_a_week_ago");
        
        } else {
        
            let date = new Date(timestamp);
            let sdf = HelperDate.formatToString(date, "dd MMM yyyy");
            result = objectTime("tap_format_s_last_active", sdf);
        
        }

        return result;
    }
}

export default Helper;