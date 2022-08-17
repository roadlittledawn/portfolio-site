import moment from "moment";

/**
 * Returns human friendly name of month given the month's calendar number
 *
 * @param {number} monthNumber Calendar number of the month 1-12
 * @returns {string} Human friendly full name of month
 */
const getNameOfMonth = (monthNumber) =>
  new Date(2021, monthNumber - 1, 10).toLocaleString("default", {
    month: "long",
  });

/**
 *
 * @param {number} dateStamp
 * @returns Unix timestamp
 */

const convertToUnixTime = (dateStamp) => new Date(dateStamp).getTime();

/**
 * @param {string} unit What unit of time to calculate. only 'years' currently supported
 * @param {array} start Array of date stamp. Example: [2022, 4, 23]
 * @param {array} end Array of date stamp. Example: [2022, 5, 23]
 */

const calculateTimeBetweenDates = ({
  unit,
  start,
  end,
  returnFloat = false,
  roundUp = true,
}) => {
  var a = moment(end);
  var b = moment(start);
  return roundUp
    ? Math.ceil(a.diff(b, unit, returnFloat))
    : a.diff(b, unit, returnFloat);
};

export { getNameOfMonth, convertToUnixTime, calculateTimeBetweenDates };
