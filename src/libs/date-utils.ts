export function getTimeOfDayNumber(date: Date = new Date(), timeZone: string = 'UTC'): number {
  const timeParts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone
  })
    .formatToParts(date)
    .reduce(
      (acc, part) => {
        if (part.type === 'hour') acc.hours = parseInt(part.value, 10) % 24; // Ensure hours are in 0-23 range
        if (part.type === 'minute') acc.minutes = parseInt(part.value, 10) % 60; // Ensure minutes are in 0-59 range
        if (part.type === 'second') acc.seconds = parseInt(part.value, 10) % 60; // Ensure seconds are in 0-59 range
        return acc;
      },
      { hours: 0, minutes: 0, seconds: 0 }
    );

  const secondsInDay = 24 * 60 * 60; // 86,400
  console.debug(`Time parts: ${JSON.stringify(timeParts)}`);
  console.debug(`Seconds in day: ${secondsInDay}`);
  const secondsSinceMidnight = timeParts.hours * 3600 + timeParts.minutes * 60 + timeParts.seconds;

  return Math.min(Math.ceil((secondsSinceMidnight / secondsInDay) * 999), 999);
}

export function getTimeOfDayCode(date: Date = new Date(), timeZone: string = 'UTC'): string {
  return getTimeOfDayNumber(date, timeZone).toString().padStart(3, '0');
}
