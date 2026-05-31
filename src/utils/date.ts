export function getDailyDateString(): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Amsterdam',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const getPart = (type: Intl.DateTimeFormatPartTypes): string => {
        const part = parts.find((p) => p.type === type);
        return part ? part.value : '';
    };

    let year = parseInt(getPart('year'), 10);
    let month = parseInt(getPart('month'), 10);
    let day = parseInt(getPart('day'), 10);
    const hour = parseInt(getPart('hour'), 10);

    // 8 AM rollover logic
    if (hour < 8) {
        const d = new Date(Date.UTC(year, month - 1, day - 1));
        year = d.getUTCFullYear();
        month = d.getUTCMonth() + 1;
        day = d.getUTCDate();
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
