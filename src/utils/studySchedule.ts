// Putting the week's routine onto a rota.
//
// Six days are fixed. The deep work block sits on the day off — Thursday, on
// the current rota — and when it lands on a day that already had study on it,
// that study moves to Friday rather than being dropped, otherwise a Wednesday
// day off would quietly cost the week two and a half hours.
//
// Two slots are never displaced: the daily NeetCode problem and the half hour
// of applications after it. Whatever else happens to a day, it keeps both.

import {
    WEEKDAYS,
    dailyRoutine,
    deepWorkSlots,
    LATEST_END_TIME,
    type Weekday,
    type RoutineSlot,
} from '../data/studyPlan';

/**
 * Thursday is the day off on the current shift pattern, so it carries the
 * build. The picker exists for when the rota changes, not because it changes
 * every week — most weeks this default is simply correct and never touched.
 */
export const DEFAULT_DEEP_WORK_DAY: Weekday = 'Thu';

/**
 * Where displaced study lands. Friday is a full 10:00-18:00 shift but carries
 * no study block of its own, so it is the only day with room for Thursday's
 * morning to move into — at the same 06:00-08:30 it would have had.
 */
const OVERFLOW_DAY: Weekday = 'Fri';

/** These survive the deep work block landing on their day. */
const UNDISPLACEABLE = new Set(['dsa', 'job']);

/** Minutes since midnight, so slot times can actually be compared. */
export const minutesInto = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const bySlotStart = (a: RoutineSlot, b: RoutineSlot) =>
    minutesInto(a.start) - minutesInto(b.start);

/**
 * The whole week's routine for a given deep work day.
 * Keyed by weekday, each day's slots in clock order.
 */
export const getRoutineForWeek = (
    deepWorkDay: Weekday = DEFAULT_DEEP_WORK_DAY
): Record<Weekday, RoutineSlot[]> => {
    const week = {} as Record<Weekday, RoutineSlot[]>;
    let displaced: RoutineSlot[] = [];

    for (const day of WEEKDAYS) {
        if (day === deepWorkDay) {
            // The build replaces this day's study; DSA and applications stay.
            displaced = dailyRoutine[day].filter(s => !UNDISPLACEABLE.has(s.kind));
            week[day] = [
                ...deepWorkSlots,
                ...dailyRoutine[day].filter(s => UNDISPLACEABLE.has(s.kind)),
            ].sort(bySlotStart);
        } else {
            week[day] = [...dailyRoutine[day]];
        }
    }

    // Friday absorbs whatever the build pushed off its day, keeping the week
    // at the same total however the rota falls. When Friday IS the deep work
    // day nothing was displaced, so there is nothing to move.
    if (deepWorkDay !== OVERFLOW_DAY && displaced.length > 0) {
        week[OVERFLOW_DAY] = [...week[OVERFLOW_DAY], ...displaced].sort(bySlotStart);
    }

    return week;
};

/**
 * One day's slots. Accepts either the short form ('Sun') or the full name
 * ('Sunday'), because the routine reads better spelled out on screen.
 */
export const getRoutineForDay = (
    dayName: string,
    deepWorkDay: Weekday = DEFAULT_DEEP_WORK_DAY
): RoutineSlot[] => {
    const wanted = dayName.slice(0, 3).toLowerCase();
    const day = WEEKDAYS.find(d => d.toLowerCase() === wanted);
    return day ? getRoutineForWeek(deepWorkDay)[day] : [];
};

/** What the week adds up to. Should not move when the deep work day does. */
export const routineWeeklyHours = (
    deepWorkDay: Weekday = DEFAULT_DEEP_WORK_DAY
): number => {
    const week = getRoutineForWeek(deepWorkDay);
    return WEEKDAYS.reduce(
        (total, day) => total + week[day].reduce((sum, s) => sum + s.hours, 0),
        0
    );
};

export const hoursOnDay = (
    day: Weekday,
    deepWorkDay: Weekday = DEFAULT_DEEP_WORK_DAY
): number =>
    getRoutineForWeek(deepWorkDay)[day].reduce((sum, s) => sum + s.hours, 0);

/** The latest any slot finishes, as 'HH:MM'. Nothing may pass LATEST_END_TIME. */
export const latestEndTime = (
    deepWorkDay: Weekday = DEFAULT_DEEP_WORK_DAY
): string => {
    const week = getRoutineForWeek(deepWorkDay);
    const latest = Math.max(
        ...WEEKDAYS.flatMap(day => week[day].map(s => minutesInto(s.end)))
    );
    return `${String(Math.floor(latest / 60)).padStart(2, '0')}:${String(latest % 60).padStart(2, '0')}`;
};

export const endsTooLate = (deepWorkDay: Weekday = DEFAULT_DEEP_WORK_DAY): boolean =>
    minutesInto(latestEndTime(deepWorkDay)) > minutesInto(LATEST_END_TIME);

/**
 * Sunday is the light day, and only Sunday. When the build takes Sunday the
 * review hour moves to Friday, which does not make Friday a light day — so
 * this asks about the day as well as the slot.
 */
export const isLightDay = (
    day: Weekday,
    deepWorkDay: Weekday = DEFAULT_DEEP_WORK_DAY
): boolean =>
    day === 'Sun' && getRoutineForWeek(deepWorkDay).Sun.some(s => s.kind === 'light');

/**
 * Whether the week has a light day at all. Choosing Sunday for deep work means
 * it does not, which the UI says out loud rather than hiding.
 */
export const hasLightDay = (deepWorkDay: Weekday = DEFAULT_DEEP_WORK_DAY): boolean =>
    isLightDay('Sun', deepWorkDay);

const JS_DAY_TO_WEEKDAY: Weekday[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Weekday of a YYYY-MM-DD date, read at UTC so no timezone can shift it. */
export const weekdayOf = (dateISO: string): Weekday =>
    JS_DAY_TO_WEEKDAY[new Date(`${dateISO}T00:00:00Z`).getUTCDay()];

/** Accepts only the seven day codes — used when reading Firestore back. */
export const isWeekday = (value: unknown): value is Weekday =>
    typeof value === 'string' && (WEEKDAYS as string[]).includes(value);
