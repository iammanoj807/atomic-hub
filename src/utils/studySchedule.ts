// Putting the week's routine onto a rota.
//
// Six days are fixed. The deep work block sits on the day off, and the only
// things it pushes aside are the ones it would physically collide with.
//
// That rule replaces an older one that stripped everything off the day and
// tried to relocate it to Friday. The morning stage runs 05:30-07:30 and the
// build 09:00-15:00, so they never actually clashed - the old rule moved the
// mornings anyway, and Friday is now a full shift day with nowhere to put
// them. What genuinely does clash, Saturday's applied ML blocks if the build
// is ever moved onto Saturday, is dropped for that week rather than scheduled
// somewhere it cannot happen.

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
 * The other fixed day off. Saturday used to be a 10:00-14:00 shift and the
 * second day off was an occasional bonus; the rota is settled now and Saturday
 * carries the applied ML track, so it is a standing day off rather than
 * something to remember to tick.
 */
export const DEFAULT_SECOND_DAY_OFF: Weekday = 'Sat';

/** Two slots clash when one starts before the other has finished. */
const clashes = (a: RoutineSlot, b: RoutineSlot): boolean =>
    minutesInto(a.start) < minutesInto(b.end) && minutesInto(b.start) < minutesInto(a.end);

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

    for (const day of WEEKDAYS) {
        if (day === deepWorkDay) {
            // Only what the build would sit on top of gives way. The morning
            // stage and the evening habits are hours the build never touches,
            // so a day off keeps them rather than losing them to a rule.
            const survives = dailyRoutine[day].filter(
                s => !deepWorkSlots.some(deep => clashes(s, deep))
            );
            week[day] = [...deepWorkSlots, ...survives].sort(bySlotStart);
        } else {
            week[day] = [...dailyRoutine[day]];
        }
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
