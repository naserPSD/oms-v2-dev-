import { toast } from 'react-toastify';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from 'axios';
// import { toBengaliNumber, toBengaliWord } from 'bengali-number'

// const { permissions } = useSelector((state) => state.auth) || [];

export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 2MB
export const MAX_FILE_SIZE_VALIDATION = `Max file size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPTED_IMAGE_TYPES_VALIDATION = `Only .jpg, .png, .webp files are accepted.`

export const toaster = (msg, type = 'success') => {
  const options = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  switch (type) {
    case 'success':
      toast.success(msg, options);
      break;
    case 'error':
      toast.error(msg, options);
      break;
    case 'info':
      toast.info(msg, options);
      break;
    case 'warning':
      toast.warn(msg, options);
      break;
    case 'default':
      toast(msg, options);
      break;
    default:
      toast(msg, options);
      break;
  }
};

// import { Notyf } from 'notyf'
import Hashids from 'hashids';
import moment from 'moment';


export const pagination = {
  currentPage: 0,
  perPage: 10,
  totalRows: 0,
  totalPages: 0,
  slOffset: 1,
}

export function cn(obj, input, if_false = '') {
  const elements = input.split('.')

  for (let i = 0; i < elements.length; i++) {
    if (!obj || !obj[elements[i]]) {
      return if_false
    }

    obj = obj[elements[i]]
  }

  if (obj) return obj
  return if_false
}

export const resolveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('undefined') ||
    trimmed.includes('/static/undefined/') ||
    trimmed === 'null' ||
    trimmed === 'undefined'
  ) {
    return null;
  }

  // Blob URLs or base64 data URLs should be returned as is
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (isLocal) {
      const devBase =
        process.env.NEXT_PUBLIC_DEV_BASE_URL || 'http://localhost:4000';
      const cleanDevBase = devBase.replace(/\/+$/, '').replace(/\/api$/, '');

      // If URL points to remote host (sanzio.app, studypress, etc.), rewrite to local backend
      if (/^https?:\/\/(?!localhost|127\.0\.0\.1)[^/]+(\/api)?\/static\//.test(trimmed)) {
        return trimmed.replace(
          /^https?:\/\/(?!localhost|127\.0\.0\.1)[^/]+(\/api)?\/static\//,
          `${cleanDevBase}/api/static/`,
        );
      }
      // If URL is relative /static/ or /api/static/
      if (trimmed.startsWith('/static/')) {
        return `${cleanDevBase}/api${trimmed}`;
      }
      if (trimmed.startsWith('/api/static/')) {
        return `${cleanDevBase}${trimmed}`;
      }
    } else {
      // In production (e.g. https://sanzio.app):
      const origin = window.location.origin;

      let result = trimmed;

      // Upgrade http to https
      if (result.startsWith('http://sanzio.app')) {
        result = result.replace('http://sanzio.app', 'https://sanzio.app');
      }
      if (window.location.protocol === 'https:' && result.startsWith('http://')) {
        result = result.replace(/^http:\/\//, 'https://');
      }

      // If URL points to localhost or 127.0.0.1, rewrite to the current origin /api/static/
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/api)?\/static\//.test(result)) {
        return result.replace(
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/api)?\/static\//,
          `${origin}/api/static/`,
        );
      }

      // In production, static media served by backend MUST go through /api/static/
      // because NGINX only proxies /api to the NestJS backend
      if (result.startsWith('/static/')) {
        return `${origin}/api${result}`;
      }
      if (result.startsWith('/api/static/')) {
        return `${origin}${result}`;
      }
      if (/^https?:\/\/[^/]+\/static\//.test(result)) {
        return result.replace(/\/static\//, '/api/static/');
      }

      return result;
    }
  }

  return trimmed;
};

export const perPageListItems = function () {
  if (typeof window !== 'undefined') {
    try {
      const perPage = localStorage.getItem('perPage');
      if (perPage) {
        const parsed = parseInt(perPage, 10);
        if (!isNaN(parsed) && parsed >= 10) return parsed;
      }
    } catch {
      // ignore
    }
  }
  return 10;
};
perPageListItems.valueOf = function () {
  return perPageListItems();
};
perPageListItems.toString = function () {
  return String(perPageListItems());
};

export default {
  loading: false,
  toaster: toaster,
  resolveImageUrl: resolveImageUrl,
  perPageListItems: perPageListItems,
  cn: function (obj, input, if_false = '') {
    const elements = input.split('.')

    for (let i = 0; i < elements.length; i++) {
      if (!obj || !obj[elements[i]]) {
        return if_false
      }

      obj = obj[elements[i]]
    }

    if (obj) return obj
    return if_false
  },
  authUser: function () {
    return JSON.parse(localStorage.getItem('authUser'))
  },
  auth_id: function () {
    this.cn(this.authUser, 'id')
  },
  auth_name: function () {
    this.cn(this.authUser, 'user_name')
  },
  //   noty: function (msg, type ='success', args = null, callback = null) {
  //     let options = {
  //       position: {
  //         x: 'right',
  //         y: 'top',
  //       }
  //     }

  //     if (args) {
  //       options = Object.assign(options, args)
  //     }

  //     const notyfInstance = new Notyf(options)

  //     if (type == 'success') {
  //       notyfInstance.success(msg)
  //     }

  //     if (type == 'error') {
  //       notyfInstance.error(msg)
  //     }

  //     return new Notyf(options)
  //   },
  err_msg: function (err) {
    if (err && err.data && err.data.msg) return err.data.msg
    else return 'Falied to process this request please try again later'
  },
  rand: function (min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
  },
  hashids: function (value, encode = true) {
    const hashids = new Hashids('to-pass-url-argument', 32)
    if (encode) return hashids.encode(value)
    else return hashids.decode(value)
  },
  paginationData(data) {
    pagination.currentPage = data.page;
    pagination.totalRows = data.totalElements;
    pagination.perPage = data.size;
    console.log('pagination.perPage', pagination.perPage)
    console.log('pagination.currentPage', pagination.perPage)
    pagination.slOffset = pagination.perPage * (pagination.currentPage + 1) - pagination.perPage + 1;
  },
  checkCurrentDateLessThenDate: function (dateValue) {
    const currentDate = this.dDate(new Date(), "YYYY-MM-DD");
    const anotherDate = this.dDate(dateValue, "YYYY-MM-DD");
    if (anotherDate >= currentDate) {
      return true;
    } else {
      return false;
    }
  },
  dDate: function (value, format = "DD-MM-YYYY") {
    // return moment(value).local().format(format);
    if (value) {
      return moment.utc(value).format(format);
    }
    return ''
  },
  dDateUtc: function (value, format = "D MMM YYYY") {
    return moment.utc(value).local().format(format);
  },
  dDateTime: function (value, format = "D MMM YYYY LT") {
    return moment.utc(value).local().format(format);
  },
  dTime: function (value, format = "LT") {
    if (value) {
      // Parse time string in HH:mm:ss format
      return moment.utc(value).local().format("LT");
      // return moment(value, "HH:mm:ss").format(format);
    }
    return ''
  },
  stringTimeToLocalTime: function (value, format = "LT") {
    if (!value) return "";

    const m = moment(value, "HH:mm:ss", true); // strict parsing
    return m.isValid() ? m.format(format) : "";
  },
  utcTimeToLocal: function (value, format = "LT") {
    return moment.utc(value, "HH:mm:ss").local().format(format);
  },
  dRealTime: function (value, format = "LT") {
    return moment(value).local().format(format);
  },
  dateToUtcDateTime: function (value =  new Date()) {
    return moment(value).utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
  },
  rTime: function (value) {
    const today = new Date();
    const year = today.getFullYear();
    const mes = today.getMonth() + 1;
    const dia = today.getDate();
    const fecha = year + "-" + mes + "-" + dia;
    return moment(fecha + ' ' + value).format('LT');
  },
  getBetweenHour: function (startTime, endTime) {
    const myEndTime = endTime ? new Date(endTime) : new Date();
    const myStartTime = new Date(startTime);
    const diffMs = myEndTime - myStartTime;
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    const diffMins = Math.round(
      ((diffMs % 86400000) % 3600000) / 60000
    );
    if (diffHrs > 1) {
      return `${diffHrs} Hours ${diffMins} min`;
    } else {
      return `${diffHrs} Hour ${diffMins} min`;
    }
  }, 
  getYearMonthDayByDates(startDate, endDate = new Date()) {
    const start = moment(startDate);
    const end = moment(endDate);

    // If start is after end or invalid dates, return "0 day"
    if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
      return "0 day";
    }

    const totalDays = end.diff(start, 'days');
    const totalMonths = end.diff(start, 'months');

    // If duration is less than 1 month, return days
    if (totalMonths < 1) {
      return `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
    }

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    let result = [];
    if (years > 0) {
      result.push(`${years} year${years > 1 ? 's' : ''}`);
    }
    if (months > 0) {
      result.push(`${months} month${months > 1 ? 's' : ''}`);
    }
    if (result.length === 0) {
      // This case should theoretically never happen since we checked totalMonths >= 1
      return `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
    }
    return result.join(' ');
  },
  getYearMonthsByDates(startDate, endDate = new Date()) {
    const start = moment(startDate);
    const end = moment(endDate);

    // If start is after end, return "0 month"
    if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
      return "0 month";
    }

    const totalMonths = end.diff(start, 'months');
    if (totalMonths < 1) {
      return "0 month";
    }

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    let result = [];
    if (years > 0) {
      result.push(`${years} year${years > 1 ? 's' : ''}`);
    }
    if (months > 0) {
      result.push(`${months} month${months > 1 ? 's' : ''}`);
    }
    if (result.length === 0) {
      return "0 month";
    }
    return result.join(' ');
  },
  getMonthsToYear(monthsNumber = 0) {
    if (monthsNumber < 12) {
      return `${monthsNumber} month${monthsNumber > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(monthsNumber / 12);
      const months = monthsNumber % 12;
      let result = [];
      if (years > 0) {
        result.push(`${years} year${years > 1 ? 's' : ''}`);
      }
      if (months > 0) {
        result.push(`${months} month${months > 1 ? 's' : ''}`);
      }
      return result.join(' ');
    }
  },
  dMonth: function (value, format = "MMM YYYY") {
    return moment(value).format(format);
  },
  dYear: function (value, format = "YYYY") {
    return moment(value).format(format);
  },
  timeAgo: function (value) {
    // return moment(value).fromNow()
    return moment.utc(value).local().fromNow();
  },
  dNow: function (value) {
    // return moment(value).fromNow()
    return moment.utc(value).local().fromNow();
  },
  isToday: function (value) {
    return moment(value).isSame(new Date(), "day");
  },
  calculateRemainingLife: function (economicLife, manufacturingYear) {
    if (!economicLife) {
      return 0;
    }
    const currentYear = new Date().getFullYear();
    const remainingLife = economicLife - (currentYear - manufacturingYear);
    return remainingLife;
  },
  integer: function (value = 0) {
    const integerValue = value | 0;
    return Number(integerValue).toLocaleString();
  },
  float: function (value = 0.0) {
    const integerValue = parseFloat(value);
    return Number(integerValue).toLocaleString();
  },
  float2: function (value = 0.0) {
    const double = parseFloat(value).toFixed(2);
    return Number(double).toLocaleString();
  },
  limit_str: function (str, limit = 20, alt_str = "...") {
    return str.length > limit
      ? str.substring(0, limit - 3) + alt_str
      : str;
  },
  avatarText: function (value) {
    if (!value || typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  },
  has_permission: function (permit_code) {

    console.log('permit_code', permit_code)

    // let permission_disable=this.$store.state.site.permission_disable;
    let permission_disable = false

    if (permission_disable) {
      return true;
    } else if (permit_code) {

      if (permit_code == "permitted") {
        return true;
      } else {

        // const authStore = useAuthStore();

        // const store = pinia.store;
        // const authStore = useAuthStore(store);
        // const permissions = authStore.permissions;
        // const permissions = []
        // console.log('permissions', authStore)
        const permissions = []

        if (permissions && permissions.length) {

          const userPermission = permissions.find(
            (permission) => permission == permit_code
          );

          return userPermission == undefined ? false : true;

        } else {
          return false;
        }
      }

    } else return false;
  },
  errorHandler: function (error) {
    if (error.response.status === 401) {
      localStorage.clear();
      toaster('Unauthorized access', 'error')
      // window.location.href = '/logout'
    } else if (error.response.status === 403) {
      toaster('Forbidden, The client does not have access rights to the content', 'error')
    } else if (error.response.status === 404) {
      toaster('Source Not Found', 'error')
    } else if (error.response.status === 500) {
      toaster('Internal Server Error', 'error')
    } else if (error.response.status === 503) {
      toaster('Service Unavailable', 'error')
    }
    return error
  },
  generateUniqueId: function (type = 'normal') {
    if (type === 'short') return Date.now().toString(36);
    if (type === 'normal') return Date.now().toString(36) + Math.random().toString(36).substring(2);
    if (type === 'long') return crypto.randomUUID();
  },
  getErrorMessage: function (error) {
    console.log('error checking message', error);
    if (error.response && error.response.data) {
      // Map API errors to Formik fields
      const apiErrors = error.response.data; // Assuming API returns a field-wise error object
      if (apiErrors) {
        return apiErrors; // Map errors to form fields
      } else if (error.response.data.message) {
        return { form: error.response.data.message }; // Global form error
      }
    } else {
      // Set a global form error if no field-specific errors exist
      return { form: 'An unexpected error occurred. Please try again.' };
    }
  },
  masked: function (input) {
    const str = input.toString();
    if (str.length <= 4) {
      return str;
    }

    const firstTwo = str.slice(0, 2); // First 2 characters
    const lastTwo = str.slice(-2); // Last 2 characters
    const maskedPart = '*'.repeat(str.length - 4); // Middle part replaced with *
    console.log('maskedPart', maskedPart)

    return firstTwo + maskedPart + lastTwo;
  },
  replaceRegularExpression: function (input) {
    /* 
        Explanation:
        [-\/\\,\s\[\]\(\)]:
        
        -: Matches hyphen/dash.
        \/: Matches forward slash.
        \\: Matches backslash (requires escaping with \\ because \ is a special character in regex).
        ,: Matches comma.
        \s: Matches any whitespace character (spaces, tabs, newlines).
        \[\]: Matches square brackets [ and ] (requires escaping with \).
        \(\): Matches parentheses ( and ) (requires escaping with \).
        g (global flag):
        
        Ensures that all occurrences in the string are replaced, not just the first.
    */
    const sanitizedValue = input.replace(/[-\/\\,\s\[\]\(\)]/g, "_");

    return sanitizedValue
  },
  compareValuesAreSame: function (obj1, obj2) {
    return Object.keys(obj1).every(key => obj1[key] === obj2[key]);
  },
  sumArray: function (arr = []) {
    return arr.reduce((sum, value) => sum + value, 0);
  },
  capitalizeFirstLetter: function (string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  capitalizeWords: function (string) {
    if (!string || typeof string !== 'string') return '';
    return string.replace(/\b\w/g, (char) => char.toUpperCase());
  },
  isEmptyObject: function (obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  },
  handleApiValidationError(error, setError, fallbackMessage = "Something went wrong!", showToast = false) {
    if (!error) return;
    const msg = error.response?.data?.message;
    const errors = error.response?.data?.errors;

    const safeSetError = (field, message) => {
      if (typeof setError === "function" && field && message) {
        const msgStr =
          typeof message === "string"
            ? message
            : Array.isArray(message)
              ? message[0]
              : typeof message === "object" && message?.message
                ? message.message
                : String(message);

        setError(field, {
          type: "server",
          message: msgStr,
        });
      }
    };

    const matchField = (text) => {
      if (typeof text !== "string") return null;
      const lower = text.toLowerCase().trim();
      if (lower.includes("email")) return "email";
      if (
        lower.includes("employee code") ||
        lower.includes("employeecode") ||
        lower.includes("employee_code") ||
        lower.includes("employee no") ||
        lower.includes("employeeno") ||
        lower.includes("employee id") ||
        lower.includes("employeeid")
      ) {
        return "employeeCode";
      }
      if (
        lower.includes("first name") ||
        lower.includes("firstname") ||
        lower.includes("first_name")
      ) {
        return "firstName";
      }
      if (
        lower.includes("last name") ||
        lower.includes("lastname") ||
        lower.includes("last_name")
      ) {
        return "lastName";
      }
      if (
        lower.includes("phone country") ||
        lower.includes("country code") ||
        lower.includes("calling code")
      ) {
        return "phoneCountryId";
      }
      if (lower.includes("phone") || lower.includes("mobile")) return "phone";
      if (lower.includes("country")) return "countryId";
      if (lower.includes("gender")) return "gender";
      if (lower.includes("marital")) return "maritalStatusId";
      if (lower.includes("religion")) return "religionId";
      if (
        lower.includes("office shift") ||
        lower.includes("officeshift") ||
        lower.includes("office_shift") ||
        lower.includes("shift")
      ) {
        return "officeShiftId";
      }
      if (lower.includes("office")) return "officeId";
      if (lower.includes("department")) return "departmentId";
      if (lower.includes("designation")) return "designationId";
      if (
        lower.includes("joining date") ||
        lower.includes("joiningdate") ||
        lower.includes("joining_date")
      ) {
        return "joiningDate";
      }
      if (lower.includes("role")) return "roleId";
      if (
        lower.includes("salary grade") ||
        lower.includes("salarygrade") ||
        lower.includes("grade")
      ) {
        return "salaryGradeId";
      }
      if (lower.includes("password")) return "password";
      if (lower.includes("remark")) return "remarks";
      if (lower.includes("asset type name") || lower.includes("assettypename")) return "name";
      if (lower.includes("asset type") || lower.includes("assettype")) return "assetTypeId";
      if (lower.includes("asset status") || lower.includes("assetstatus")) return "assetStatusId";
      if (lower.includes("allocation date") || lower.includes("allocationdate")) return "allocationDate";
      if (lower.includes("description")) return "description";
      if (lower.includes("model")) return "model";
      if (lower.includes("serial")) return "serial";
      if (lower.includes("amount")) return "amount";
      if (lower.includes("employee")) return "employeeId";

      const firstWord = text.trim().split(/\s+/)[0];
      if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(firstWord)) return firstWord;
      return null;
    };

    // 1. If errors is an object: { field: messages }
    if (errors && typeof errors === "object" && !Array.isArray(errors)) {
      Object.entries(errors).forEach(([field, messages]) => {
        const targetField = matchField(field) || field;
        safeSetError(targetField, messages);
      });
    }

    // 2. If message is an object (key-value pairs, not array)
    if (msg && typeof msg === "object" && !Array.isArray(msg)) {
      Object.entries(msg).forEach(([field, messages]) => {
        const targetField = matchField(field) || field;
        safeSetError(targetField, messages);
      });
    }

    // 3. If message is an array of strings or validation objects
    if (Array.isArray(msg)) {
      msg.forEach((item) => {
        if (typeof item === "string") {
          const field = matchField(item);
          if (field) safeSetError(field, item);
        } else if (item && typeof item === "object") {
          const prop = item.property || item.field;
          const text = item.constraints
            ? Object.values(item.constraints)[0]
            : item.message;
          if (prop && text) {
            const targetField = matchField(prop) || prop;
            safeSetError(targetField, text);
          }
        }
      });
    }

    // 4. If message is a single string (e.g. "A user with this email already exists")
    if (typeof msg === "string" && msg.trim()) {
      const field = matchField(msg);
      if (field) safeSetError(field, msg);
    }

    if (showToast) {
      const apiMessage = error?.response?.data?.message;
      const text = Array.isArray(apiMessage)
        ? apiMessage.filter(Boolean).join(", ")
        : typeof apiMessage === "string" && apiMessage.trim()
          ? apiMessage
          : error?.message || fallbackMessage;
      toast.error(text, { position: "top-right" });
    }
  },
  tMerge: function (...inputs) {
    return twMerge(clsx(inputs));
  },
  copySelectedText: () => {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
    }
  },
  trimPhoneNumber: (phoneNumber = '') => {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace('+', '');

    return digitsOnly;
  },
  trimPhoneNumberForTel: (phoneNumber = '') => {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // If the number starts with '88', trim it
    if (digitsOnly.startsWith('88')) {
      return digitsOnly.slice(2);
    }

    return digitsOnly;
  },
  trimPhoneNumberForCall: (phoneNumber = '') => {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // If the number starts with '88', trim it
    if (digitsOnly.startsWith('88')) {
      return digitsOnly.slice(2);
    }

    return digitsOnly;
  },
  trimPhoneNumberForWhatsapp: (phoneNumber = '') => {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // If the number starts with '0', replace it with '88'
    if (digitsOnly.startsWith('0')) {
      return '88' + digitsOnly.slice(1);
    }

    return digitsOnly;
  },
  monthNumberToName: (monthNumber) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    if (monthNumber < 1 || monthNumber > 12) {
      return "Invalid month";
    }

    return monthNames[monthNumber - 1];
  },
  monthNameToNumber: (monthName) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthNumber = monthNames.indexOf(monthName) + 1;
    return monthNumber;
  },
  monthOptions: () => {
    return [
      { label: "January", value: 1 },
      { label: "February", value: 2 },
      { label: "March", value: 3 },
      { label: "April", value: 4 },
      { label: "May", value: 5 },
      { label: "June", value: 6 },
      { label: "July", value: 7 },
      { label: "August", value: 8 },
      { label: "September", value: 9 },
      { label: "October", value: 10 },
      { label: "November", value: 11 },
      { label: "December", value: 12 },
    ];
  },
  formatCurrency: (amount = 0, maximumFractionDigits = 2) => {
    return parseFloat(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: maximumFractionDigits });
  }
}

// Function to calculate the sum of an array of numbers
export const sumArray = (arr = []) => {
  return arr.reduce((sum, value) => sum + value, 0);
};

// Function to capitalize the first letter of a string
export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const capitalizeWords = (string) => {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Function to check if an object is empty
export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export function socialPopupLogin(provider, apiBaseUrl) {
  return new Promise((resolve, reject) => {

    const width = 500;
    const height = 600;
    const top = 0;
    const left = window.screen.width - width;

    const popup = window.open(
      `${apiBaseUrl}/auth/${provider}/login`,
      `${provider}Login`,
      `width=${width},height=${height},top=${top},left=${left}`
    );

    function handleMessage(event) {
      const origin = new URL(apiBaseUrl).origin;
      if (event.origin !== origin) return;

      if (event.data && event.data.accessToken) {
        // Clear popup check BEFORE resolving
        clearInterval(checkPopupClosed);
        window.removeEventListener('message', handleMessage);

        try {
          popup.close();
        } catch (e) {
          // Ignore
        }

        resolve({ data: event.data }); // Axios-style response
      }
    }

    window.addEventListener('message', handleMessage);

    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
        window.removeEventListener('message', handleMessage);
        reject(new Error('Popup closed by user'));
      }
    }, 500);
  });
}


