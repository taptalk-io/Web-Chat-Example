const fullMonths  = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
const shortMonths = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

const fullDayNames  = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
const shortDayNames = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];

export class HelperDate {
    constructor() {
        this.DATE_FORMAT_SHORT = "dd/MM/yyyy";
        this.DATE_FORMAT_SQL = "yyyy-MM-dd";
        this.TIME_FORMAT_HHMM = "HH:mm";
        this.TIME_FORMAT_HHMMSS = "HH:mm:ss";
        this.DATETIME_FORMAT_SHORT_HHMM = HelperDate.DATE_FORMAT_SHORT + " " + HelperDate.TIME_FORMAT_HHMM;
        this.DATETIME_FORMAT_SHORT_HHMMSS = HelperDate.DATE_FORMAT_SHORT + " " + HelperDate.TIME_FORMAT_HHMMSS;
        this.DATETIME_FORMAT_SQL = "yyyy-MM-dd HH:mm:ss";
        this.datePickerOptions = {
            locale: { format: 'DD/MM/YYYY'},
            minDate: new Date(),
            singleDatePicker: true,
            alwaysShowCalendar: false,
        };
    }
    
    formatToString(date, format) {
        if (date === null) {
            return null;
        } else if (date === undefined) {
            return undefined;
        }
        var valDay = date.getDay(),
            valDate = date.getDate(),
            valMonth = date.getMonth(),
            valFullYear = date.getFullYear(),
            valYear = valFullYear % 100,
            valHours = date.getHours(),
            valHours12 = (valHours % 12) || 12,
            valMinutes = date.getMinutes(),
            valSeconds = date.getSeconds(),
            valAMPM = (valHours < 12) ? "AM" : "PM";
        var specifiers = {
            "dddd": fullDayNames[valDay],
            "ddd" : shortDayNames[valDay],
            "dd"  : this.withLeadingZero(valDate),
            "d"   : valDate,
            "MMMM": fullMonths[valMonth],
            "MMM" : shortMonths[valMonth],
            "MM"  : this.withLeadingZero(valMonth + 1),
            "M"   : valMonth + 1,
            "yyyy": valFullYear,
            "yyy" : valFullYear,
            "yy"  : this.withLeadingZero(valYear),
            "y"   : valYear,
            "hh"  : this.withLeadingZero(valHours12),
            "h"   : valHours12,
            "HH"  : this.withLeadingZero(valHours),
            "H"   : valHours,
            "mm"  : this.withLeadingZero(valMinutes),
            "m"   : valMinutes,
            "ss"  : this.withLeadingZero(valSeconds),
            "s"   : valSeconds,
            "tt"  : valAMPM,
            "t"   : valAMPM[0]
        };
        var result = format;
        var replacements = [];
        for (var s in specifiers) {
            if (result.includes(s)) {
                var i = replacements.length;
                replacements[i] = specifiers[s];
                result = result.replace(new RegExp(s, "g"), "#" + i + ";");
            }
        }
        for (let j = 0; j < replacements.length; j++) {
            result = result.replace(new RegExp("#" + j + ";", "g"), replacements[j]);
        }
        return result;
    }

    isValidShortDateFormat(text, delimiter = "/") {
        var parts = text.split(delimiter);
        if (parts.length === 3) {
            return (parts[0] && parts[1] && parts[2]);
        }
        return false;
    }

    isValidShortDate(text, delimiter = "/") {
        var parts = text.split(delimiter);
        if (parts.length === 3) {
            var d = parseInt(parts[0], 10);
            var m = parseInt(parts[1], 10) - 1;
            var y = parseInt(parts[2], 10);
            var date = new Date(y, m, d);
            return (date.getDate() === d && date.getMonth() === m && date.getFullYear() === y);
        }
        return false;
    }

    convertToDate(dateString, delimiter = "/") {
        var parts = dateString.split(delimiter).map(part => parseInt(part, 10));
        if (parts.length === 3) {
            var date = new Date(parts[2], parts[1] - 1, parts[0]);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        return null;
    }

    withLeadingZero(n) {
        return (n < 10)
            ? "0" + n
            : n.toString();
    }

    getTodayDate() {
        let _date = new Date();
        return this.formatToString(_date, this.DATE_FORMAT_SHORT);
    }

    timeNoGMT(date) { 
        //without GTM+7
        let _newdate = new Date(date * 1000);
        let leadzero = (val) => {
            return ("00" + val).slice(-2);
        };

        let hour = _newdate.getUTCHours().toString();
        let minute = _newdate.getUTCMinutes().toString();

        return `${leadzero(hour)}:${leadzero(minute)}`;
    }

    isToday(date) {
        let today = new Date();
        let _date = new Date(date);
        return _date.getDate() === today.getDate() &&
               _date.getMonth() === today.getMonth() &&
               _date.getFullYear() === today.getFullYear()
    }

    isYerterday(date) {
        let _date = new Date(date);
        let yesterday = new Date(new Date().setDate(new Date().getDate()-1));
        return _date.getDate() === yesterday.getDate() &&
                _date.getMonth() === yesterday.getMonth() &&
                _date.getFullYear() === yesterday.getFullYear() 
    }

    dayDiff(day2, day1) {
        let ms = day2 - day1;
        ms = parseInt(ms/1000, 10);
        var days = Math.floor(ms / (3600*24));
        ms  -= days*3600*24;
        var hrs   = Math.floor(ms / 3600);
        // let days = ms / (1000 * 60 * 60 * 24);
        // return Math.floor(days);
        return {
            day: days < 0 ? 0 : days,
            hour: days < 0 ? 0 : hrs
        }
    }

    getLastDayOfCurrentTimestamp(y, m) {
        return new Date(y, m, 0).getDate();
    }
}

export default new HelperDate()