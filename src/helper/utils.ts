// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const ts2dt = (unixTs: number) => {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    const date = new Date(unixTs);

    const y = date.getFullYear();
    const M = date.getMonth() + 1;
    const d = date.getDate();
    const H = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const ms = date.getMilliseconds();

    // Will display time in 10:30:23 format
    const formattedTime = `${ y }/${ M }/${ d }-${ H }:${ m }:${ s }.${ ms }`;
    const dtMultiPart = { y, M, d, H, m, s, ms };

    return { formattedTime, dtMultiPart };
}

const log = (logValue: unknown): void => {
    // const dateTime = new Date();
    // const modifiedLogValue= `[${ dateTime }] : ${ logValue }`;

    console.log(logValue);
}

export default {
    ts2dt,
    log,
};
