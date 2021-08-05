/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import moment from 'moment-timezone';

const zeroPad = (num: unknown, places: number): string => String(num).padStart(places, '0')

const formatDateTime = (dateTime: number | Date, timezone = 'Asia/Tehran'): string => {
    const unixTs = typeof dateTime === 'number' ? dateTime : dateTime.getDate();
    const date = moment(unixTs).tz(timezone);

    return date.format('yyyy/MM/DD HH:mm:ss.SSS');
}

const addSecondsToDate = (date: Date, seconds: number): Date => {
    const addedDate = moment(date).add(seconds, 's');

    return addedDate.toDate();
}

const log = (logValue: unknown): void => {
    const dateTime = formatDateTime(new Date());
    const modifiedLogValue = `[${ dateTime }] : ${ logValue }`;

    console.log(logValue);
}

export default {
    zeroPad,
    formatDateTime,
    addSecondsToDate,
    log,
};
