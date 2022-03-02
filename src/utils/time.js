/**
 * Returns human friendly name of month given the month's calendar number
 *
 * @param {number} monthNumber Calendar number of the month 1-12
 * @returns {string} Human friendly full name of month
 */
export const getNameOfMonth = (monthNumber) =>
  new Date(2021, monthNumber - 1, 10).toLocaleString("default", {
    month: "long",
  });
