import type { SDTopicAnswers } from '../systemDesign';
import { py } from '../foundationsAnswers/code';

// Phase 7 · Low-level design questions. One good answer for each practice exercise.

export const sdPhase7Answers: Record<string, SDTopicAnswers> = {
    'sd7-t1': {
        explain: {
            answer: `"A ParkingLot has several Floors, and each Floor has Spots of three sizes: small, compact and large. A Vehicle is abstract; Bike, Car and Truck each say which spot size they need. When a vehicle arrives, the lot asks a SpotAssignmentStrategy for a free spot that fits, for example the nearest one, marks it taken and issues a Ticket with the entry time. On exit, a PricingStrategy works out the fee from the time parked, a Payment is taken, and the spot is freed.\n\nThe patterns, and why: Strategy for spot assignment and for pricing, because those are the rules most likely to change (nearest-first, weekend rates, EV charging). A Factory creates vehicles and spots from input. Display boards are Observers of spot changes, so they update their free counts without the lot knowing about them. There is one ParkingLot, created at start-up and injected.\n\nThe key risk is concurrency: two gates assigning the same spot. Finding and taking a spot happens in one atomic step under a lock. To extend it, an EV charging spot is a new spot type with its own pricing strategy; nothing else changes."`,
        },
        draw: {
            answer: `Composition (the filled diamond) marks parts that belong to one whole: a lot's floors, a floor's spots. A Spot holds at most one Vehicle, and a Ticket links one Vehicle to one Spot. The two strategies are interfaces the lot holds, so they can be swapped.`,
            code: py`
                ParkingLot
                 + park(vehicle): Ticket
                 + leave(ticket): fee
                 - assigner: SpotAssignmentStrategy ──► «interface»
                 - pricing:  PricingStrategy ──┐         + find_spot(floors, vehicle)
                   │ 1                         │           △ NearestFirst
                   ◆                           └──► «interface»
                   │ 1..*                            + fee(hours)
                 Floor                                 △ Hourly, Weekend
                  + free_count(size)
                   │ 1
                   ◆
                   │ 1..*
                 Spot ── 0..1 ── Vehicle «abstract»
                  id, size,       + size
                  vehicle           △ Bike, Car, Truck
                   ▲ 1
                   │
                 Ticket ── 1 ── Vehicle
                  id, entry time

                 Payment ── 1 ── Ticket (amount, method, status)
                 DisplayBoard ┄┄ observes ┄┄► Floor
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The pricing strategy charges £2 for the first hour, then £1.50 for each extra hour or part of one, all in pence to keep money exact. A fake clock makes the fees testable without waiting hours.\n\nThree vehicles park in three spots of the right size; a fourth gets "car park full". The bike leaves after 45 minutes and pays £2.00; the car leaves after two and a half hours (3 started hours) and pays £2 + 2 × £1.50 = £5.00. A new car then gets the compact spot the old car freed, not the bike's small spot.`,
            code: py`
                import math
                import threading
                import uuid
                from enum import Enum


                class Size(Enum):
                    SMALL = 1
                    COMPACT = 2
                    LARGE = 3


                class Vehicle:
                    size = Size.COMPACT


                class Bike(Vehicle):
                    size = Size.SMALL


                class Car(Vehicle):
                    size = Size.COMPACT


                class Truck(Vehicle):
                    size = Size.LARGE


                class Spot:
                    def __init__(self, spot_id, size):
                        self.id, self.size, self.vehicle = spot_id, size, None


                class Ticket:
                    def __init__(self, vehicle, spot, entry):
                        self.id, self.vehicle, self.spot, self.entry = uuid.uuid4().hex, vehicle, spot, entry


                class PricingStrategy:
                    def fee_pence(self, hours):
                        raise NotImplementedError


                class HourlyPricing(PricingStrategy):
                    """£2 for the first hour, then £1.50 for each extra hour or part of one."""

                    def fee_pence(self, hours):
                        started_hours = max(1, math.ceil(hours))
                        return 200 + 150 * (started_hours - 1)


                class ParkingLot:
                    def __init__(self, spots, pricing, clock):
                        self.spots, self.pricing, self.clock = spots, pricing, clock
                        self._lock = threading.Lock()

                    def park(self, vehicle):
                        with self._lock:                         # find and take a spot in one step
                            spot = next((s for s in self.spots
                                         if s.vehicle is None and s.size.value >= vehicle.size.value), None)
                            if spot is None:
                                raise RuntimeError("car park full")
                            spot.vehicle = vehicle
                        return Ticket(vehicle, spot, self.clock())

                    def leave(self, ticket):
                        hours = (self.clock() - ticket.entry) / 3600
                        fee = self.pricing.fee_pence(hours)
                        with self._lock:
                            ticket.spot.vehicle = None
                        return fee


                now = [0]                                        # a fake clock, in seconds
                lot = ParkingLot([Spot("S1", Size.SMALL), Spot("C1", Size.COMPACT), Spot("L1", Size.LARGE)],
                                 HourlyPricing(), clock=lambda: now[0])

                tickets = [lot.park(vehicle) for vehicle in (Bike(), Car(), Truck())]
                print([t.spot.id for t in tickets])              # ['S1', 'C1', 'L1']

                try:
                    lot.park(Car())
                except RuntimeError as error:
                    print(error)                                 # car park full

                now[0] = 45 * 60                                 # 45 minutes after entry
                print(lot.leave(tickets[0]))                     # 200: the first hour
                now[0] = int(2.5 * 3600)                         # 2.5 hours after entry
                print(lot.leave(tickets[1]))                     # 500: £2 + 2 × £1.50
                print(lot.park(Car()).spot.id)                   # C1: the bike's spot is too small
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• One lock for the whole car park: the simplest, and obviously correct. Every gate waits its turn to assign a spot, but assigning takes microseconds and a car park has a handful of gates, so the waiting is negligible. The right default.\n• One lock per floor: gates on different floors can assign at the same time. But a vehicle that doesn't fit on one floor must move on to the next, and taking locks in different orders invites deadlock, so you need a fixed lock order. More complexity, for contention that a real car park doesn't have.\n• Compare-and-set per spot: no locks at all. Each gate scans for a free spot and claims it only if it is still free ("set vehicle if currently empty", atomically); if another gate won, it tries the next spot. The most concurrent, but subtler: retries, and it needs an atomic primitive, which in a distributed system is a conditional database update.\n\nIn the interview: start with one lock and say why it is enough. If the gates are separate machines, the lock moves into the database as a conditional update (UPDATE spots SET vehicle = … WHERE id = … AND vehicle IS NULL), which is really compare-and-set per spot.`,
        },
    },
    'sd7-t2': {
        explain: {
            answer: `Picture an old-fashioned lift operator. They don't rush to whichever button was pressed last. They pick a direction, say up, and keep going, stopping at every floor where someone inside wants to get off or someone outside wants to go up. When there are no more requests above, they turn around and do the same on the way down.\n\nThat is LOOK. Each lift keeps two sorted lists of stops: those above it and those below it. While moving up it serves the up stops in order, from the nearest; when none are left above, it switches direction and serves the down stops. Unlike its cousin SCAN, it doesn't travel to the top floor if nobody needs it there; it only goes as far as the last request (it "looks" ahead).\n\nWhy it works: every request is served within one sweep, so nobody on a far floor waits forever, and the lift doesn't zigzag between nearby requests while others wait. Serving the nearest request first, by contrast, can starve far floors under heavy traffic.`,
        },
        draw: {
            answer: `The state machine enforces the safety rule: the lift only moves from DoorsOpen after the doors are confirmed closed. Maintenance can be entered from any state and serves no calls. The controller holds the lifts and a swappable dispatch strategy.`,
            code: py`
                Lift states
                  Idle ── call above ──► MovingUp
                  Idle ── call below ──► MovingDown
                  Idle ── call on this floor ──► DoorsOpen
                  MovingUp / MovingDown ── reached a stop ──► DoorsOpen
                  DoorsOpen ── timer, doors closed ──►
                      MovingUp / MovingDown (more stops) or Idle (none)
                  any state ── maintenance key ──► Maintenance ── key off ──► Idle
                  (never move unless "doors closed" is confirmed)

                Classes
                  ElevatorController 1 ◆── * Elevator
                   + request(floor, direction)    - id, floor, direction
                   - dispatch: DispatchStrategy   - state: ElevatorState
                                                  - up_stops, down_stops
                                                  + add_stop(floor), step()
                  «interface» DispatchStrategy    Elevator 1 ◆── 1 Door
                   + choose(elevators, request)   Elevator 1 ◆── 1 Display
                     △ NearestCar, ZoneDispatch
                  Request: floor, direction, kind (hall | car)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Time moves in ticks: in each tick a lift travels one floor. Each lift follows LOOK (keep going while there are stops ahead, then turn). Each new request is given to a lift with the lesson's pick_elevator cost: distance, plus a penalty of 10 if the lift is busy heading the other way. Passengers board when their lift reaches their floor; their wait is the number of ticks since they pressed the button, and their destination becomes a new stop.\n\n20 requests arrive at random times on a 15-floor building, with a fixed seed so the run is repeatable. The printout shows every floor each lift stopped at, and the average and longest wait. Try changing the penalty in the cost function, or using one lift, and watch the waits change.`,
            code: py`
                import random


                class Elevator:
                    def __init__(self, eid):
                        self.id, self.floor, self.direction = eid, 0, 0    # -1 down, 0 idle, 1 up
                        self.stops = set()
                        self.path = [0]                                     # every floor it stopped at

                    def add_stop(self, floor):
                        if floor != self.floor:
                            self.stops.add(floor)

                    def step(self):                                         # one tick: LOOK
                        if not self.stops:
                            self.direction = 0
                            return
                        above = any(s > self.floor for s in self.stops)
                        below = any(s < self.floor for s in self.stops)
                        self.direction = 1 if (self.direction >= 0 and above) or not below else -1
                        self.floor += self.direction
                        if self.floor in self.stops:
                            self.stops.discard(self.floor)
                            self.path.append(self.floor)


                def pick_elevator(elevators, floor, direction):
                    def cost(e):
                        heading_there = e.direction == direction and (floor - e.floor) * direction >= 0
                        return abs(e.floor - floor) + (0 if e.direction == 0 or heading_there else 10)
                    return min(elevators, key=cost)


                random.seed(4)
                FLOORS = 15
                requests = []
                while len(requests) < 20:
                    start, end = random.sample(range(FLOORS), 2)            # two different floors
                    requests.append((random.randrange(40), start, end))     # (time, from, to)
                requests.sort()

                lifts = [Elevator(i) for i in range(3)]
                waiting = {lift.id: {} for lift in lifts}                   # lift -> floor -> [(time, destination)]
                waits = []


                def board(lift, tick):
                    for asked_at, destination in waiting[lift.id].pop(lift.floor, []):
                        waits.append(tick - asked_at)
                        lift.add_stop(destination)


                tick = 0
                while requests or any(lift.stops or waiting[lift.id] for lift in lifts):
                    while requests and requests[0][0] == tick:
                        asked_at, start, end = requests.pop(0)
                        lift = pick_elevator(lifts, start, 1 if end > start else -1)
                        waiting[lift.id].setdefault(start, []).append((asked_at, end))
                        lift.add_stop(start)
                    for lift in lifts:
                        board(lift, tick)                                   # already on that floor
                        lift.step()
                        board(lift, tick)                                   # just arrived
                    tick += 1

                for lift in lifts:
                    print(f"lift {lift.id}:", lift.path)
                print("average wait:", round(sum(waits) / len(waits), 1), "ticks; longest:", max(waits))
                # lift 0: [0, 13, 4, 3, 2, 0, 4, 11, 14, 4]
                # lift 1: [0, 4, 14, 4, 1, 10, 13, 3, 1, 0, 6, 8, 13]
                # lift 2: [0, 2, 1, 5, 8, 4, 3, 5, 7, 10, 11, 6, 1, 13]
                # average wait: 6.8 ticks; longest: 19
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Nearest-lift dispatch (any lift can serve any floor; pick the cheapest by distance and direction):\n• Pros: simple; adapts to whatever traffic appears; every lift is useful all the time; short average waits in low and medium buildings.\n• Cons: lifts bunch together and chase the same calls; trips mix short and long journeys, so someone going to floor 40 stops at 5, 9 and 12; under heavy load, waits become unpredictable.\n\nZone-based dispatch (lifts 1–2 serve floors 1–15, lifts 3–4 serve floors 16–30, often running express through the other zone):\n• Pros: fewer stops per trip and faster journeys to high floors; predictable; works well in tall buildings and in the morning rush.\n• Cons: an idle lift in one zone can't help a busy zone, so capacity is wasted; when a zone's lifts are busy, its passengers wait even though other lifts are free; changing floors between zones may need a transfer.\n\nReal systems mix them: zones (or destination dispatch, where you enter your floor in the lobby and are told which lift to take) at peak times, and nearest-lift the rest of the day.`,
        },
    },
    'sd7-t3': {
        explain: {
            answer: `Three friends: Asha, Ben and Chen. Each person has one net balance, in pence: positive means they are owed money, negative means they owe.\n\n1. Asha pays £30 for dinner, split equally: each share is £10. Ben and Chen each owe Asha £10, and Asha's own share cancels out. Balances: Asha +£20, Ben −£10, Chen −£10.\n2. Ben pays £12 for a taxi, split equally: £4 each. Balances: Asha +£16, Ben −£2, Chen −£14. (They always add up to zero.)\n\nSimplifying: instead of paying back each expense separately (Ben → Asha £10, Chen → Asha £10, Asha → Ben £4, Chen → Ben £4: four payments), match the biggest debtor with the biggest creditor, again and again:\n• Chen (−£14) pays Asha (+£16) £14. Asha is now +£2, Chen is settled.\n• Ben (−£2) pays Asha (+£2) £2. Everyone is at zero.\nTwo payments settle everything. The greedy method always needs at most n − 1 payments for n people.`,
        },
        draw: {
            answer: `An Expense owns its splits; the abstract Split has one subclass per way of splitting. SplitFactory builds the right splits and rejects any that don't add up to the total. Every expense updates the BalanceSheet, which DebtSimplifier reads to suggest the fewest payments.`,
            code: py`
                Group 1 ◆── * Expense
                 - members: User[*]          - payer: User
                                             - amount_pence
                                             - description
                                             - splits ◆── 1..* Split «abstract»
                                                               - user: User
                                                               - amount_pence
                                                                 △
                                               ┌─────────────────┼─────────────────┐
                                           EqualSplit        ExactSplit       PercentSplit
                                                             (given amount)   (given percent)

                SplitFactory
                 + create(kind, total, people, values) → Split[]  (checks the sum)
                BalanceSheet
                 - net: User → pence        ◄── updated by each new Expense
                DebtSimplifier
                 + simplify(balance_sheet) → [(from, to, pence)]
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Money is whole pence (integers) throughout. Each split type returns who owes what, and refuses splits that don't add up: exact amounts must sum to the total, and percentages must sum to 100. Integer division leaves a few pence over, which are handed out one each, to people in a fixed order, so the shares always add up to the total exactly.\n\n£10 split three ways gives 334, 333 and 333 pence. £9.99 split 50/25/25 gives 500, 250 and 249: the 2 leftover pence go to the first two people.`,
            code: py`
                from collections import defaultdict


                def equal_split(total, people):
                    share, remainder = divmod(total, len(people))
                    return {p: share + (1 if i < remainder else 0) for i, p in enumerate(people)}


                def exact_split(total, amounts):
                    if sum(amounts.values()) != total:
                        raise ValueError(f"exact amounts add up to {sum(amounts.values())}, not {total}")
                    return dict(amounts)


                def percent_split(total, percents):
                    if sum(percents.values()) != 100:
                        raise ValueError(f"percentages add up to {sum(percents.values())}, not 100")
                    shares = {p: total * pct // 100 for p, pct in percents.items()}
                    leftover = total - sum(shares.values())
                    for p in list(percents)[:leftover]:          # the leftover pence, one each, in a fixed order
                        shares[p] += 1
                    return shares


                net = defaultdict(int)                           # pence: + is owed money, - owes money


                def add_expense(payer, shares):
                    for person, owed in shares.items():
                        net[person] -= owed
                        net[payer] += owed


                shares = equal_split(1000, ["asha", "ben", "chen"])
                assert sorted(shares.values()) == [333, 333, 334] and sum(shares.values()) == 1000
                print(shares)                                    # {'asha': 334, 'ben': 333, 'chen': 333}
                print(percent_split(999, {"asha": 50, "ben": 25, "chen": 25}))   # {'asha': 500, 'ben': 250, 'chen': 249}

                for bad in (lambda: exact_split(1000, {"asha": 500, "ben": 400}),
                            lambda: percent_split(1000, {"asha": 60, "ben": 30})):
                    try:
                        bad()
                    except ValueError as error:
                        print(error)
                # exact amounts add up to 900, not 1000
                # percentages add up to 90, not 100

                add_expense("asha", equal_split(3000, ["asha", "ben", "chen"]))   # dinner, £30
                add_expense("ben", equal_split(1200, ["asha", "ben", "chen"]))    # taxi, £12
                print(dict(net))                                 # {'asha': 1600, 'ben': -200, 'chen': -1400}
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Pairwise balances (for every pair of people, how much one owes the other):\n• Easy: showing "you owe Ben £6" directly, per friend and per group; settling up with one particular person; explaining where a number came from.\n• Hard: storage grows with the square of the number of people; one expense updates many pairs; and paying everything back pair by pair needs many more payments than necessary.\n\nOne net balance per user:\n• Easy: tiny storage (one number per person); an expense is a few additions; "am I owed or do I owe, overall?" is instant; simplifying to at most n − 1 payments falls straight out of it.\n• Hard: you lose who owes whom. The simplified plan might ask you to pay someone you never shared a bill with, which confuses users, and you can't show a per-friend balance without going back to the expenses.\n\nIn practice, keep the expenses as the source of truth (they can always be replayed), keep net balances per group for speed, and work out pairwise views or simplified payments when someone asks to see or settle them.`,
        },
    },
    'sd7-t4': {
        explain: {
            answer: `Buying crisps priced at 120p:\n\n1. Idle: the screen says "select an item".\n2. You press A3. A3 is in stock, so: Idle → ItemSelected. The screen shows "120p".\n3. You insert £1. 100p is less than 120p, so it stays in ItemSelected and shows "20p to pay".\n4. You insert 50p. 150p is now at least 120p, so: ItemSelected → HasMoney.\n5. HasMoney → Dispensing, straight away: the sale is recorded first (so a power cut can't lose it), then the crisps drop, and A3's count goes down by one.\n6. Change: 150 − 120 = 30p, worked out from the coins in the machine (a 20p and a 10p) and paid out. Dispensing → Idle.\n\nIf A3 had been the last packet, it is now marked sold out, and the next person who presses A3 is told "sold out" instead of being taken to ItemSelected. Pressing cancel in ItemSelected or HasMoney refunds every coin inserted and returns to Idle.`,
        },
        draw: {
            answer: `Money is only taken in ItemSelected, so a coin inserted while Idle is simply returned. Dispensing can only be reached once the price is covered, and a cancel before that refunds everything.`,
            code: py`
                               select item (in stock)
                  Idle ───────────────────────────► ItemSelected
                   ▲  │                                │ insert coin, paid < price:
                   │  │ select item (none left)        │   stay (show what is left)
                   │  ▼                                │ insert coin, paid ≥ price
                   │ SoldOut message ── back to Idle   ▼
                   │                                HasMoney
                   │                                   │ automatic
                   │ give change                       ▼
                   └─────────────────────────────── Dispensing
                                                    (record the sale,
                                                     drop the item)

                  cancel in ItemSelected or HasMoney
                    → refund every coin inserted → Idle
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The greedy method takes the biggest coin that fits, as many as allowed, then moves on. With plenty of every coin, that works for UK coins. With limited coins it can fail: to give 60p from one 50p and three 20p coins, greedy takes the 50p, and then needs 10p, which the machine doesn't have. But three 20p coins would have worked.\n\nThe dynamic-programming version builds up every amount it can reach, using each physical coin at most once, and keeps the way that uses the fewest coins. It finds 3 × 20p for 60p, and agrees with greedy when greedy works.`,
            code: py`
                COINS = [200, 100, 50, 20, 10, 5, 2, 1]          # pence


                def greedy_change(amount, available):
                    given = {}
                    for coin in COINS:
                        use = min(amount // coin, available.get(coin, 0))
                        if use:
                            given[coin] = use
                            amount -= coin * use
                    return given if amount == 0 else None        # None: can't make exact change


                def dp_change(amount, available):
                    """The fewest coins that make exactly amount, using at most available[coin] of each."""
                    best = {0: {}}                               # amount reached -> coins used
                    for coin in COINS:
                        for _ in range(available.get(coin, 0)):  # each physical coin at most once
                            for total, used in list(best.items()):
                                new_total = total + coin
                                if new_total > amount:
                                    continue
                                candidate = {**used, coin: used.get(coin, 0) + 1}
                                if new_total not in best or sum(candidate.values()) < sum(best[new_total].values()):
                                    best[new_total] = candidate
                    return best.get(amount)


                limited = {50: 1, 20: 3}
                print(greedy_change(60, limited), dp_change(60, limited))      # None {20: 3}

                plenty = {coin: 10 for coin in COINS}
                print(greedy_change(80, plenty), dp_change(80, plenty))        # {50: 1, 20: 1, 10: 1} {50: 1, 20: 1, 10: 1}
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `For this machine, state classes, with a short table kept as documentation.\n\nThe states here don't just decide the next state; they do real work that differs by state: ItemSelected adds up coins and compares with the price, HasMoney must handle cancel by refunding, Dispensing must record the sale before driving the motor and must recover after a power cut, and SoldOut hands coins straight back. Keeping each state's logic in its own class keeps money handling in one place per state and makes each one testable alone, which matters because mistakes here lose real money.\n\nA transition table (state → event → next state) would be the better choice if the machine were mostly a list of allowed moves with little behaviour, or if the rules had to be configured without new code. It is also the best way to show the whole machine at once, which is why it is worth drawing even when the code uses classes.`,
        },
    },
    'sd7-t5': {
        explain: {
            answer: `An LRU cache needs two things to be fast:\n1. Find an item by its key: is "user:42" in the cache?\n2. Know the order of use, and change it cheaply: move an item to "most recently used" on every get, and remove the least recently used one when full.\n\nA hash map does the first in O(1), but has no useful order. A list keeps the order, but finding a key in it takes O(n). So you use both: the map goes from key to the item's node in the list, and the list keeps the nodes in order of use.\n\nWhy doubly linked: to move a node to the front, you must unlink it from wherever it is in the middle, which means fixing its neighbours' pointers. With a link back to the previous node, that is O(1). A singly linked list would have to walk from the start to find the previous node, which is O(n). The back of the list (just before the tail sentinel) is always the least recently used item, so eviction is O(1) too.`,
        },
        draw: {
            answer: `Front means most recently used. get(1) moves node 1 to the front, so node 2 becomes the least recently used, and it is the one evicted when put(3) overflows the capacity of 2. The map always points at exactly the nodes in the list.`,
            code: py`
                Capacity 2. Front of the list = most recently used.

                put(1):  head ⇄ [1:a] ⇄ tail
                put(2):  head ⇄ [2:b] ⇄ [1:a] ⇄ tail
                get(1):  head ⇄ [1:a] ⇄ [2:b] ⇄ tail     1 moves to the front
                put(3):  head ⇄ [3:c] ⇄ [1:a] ⇄ tail     full: 2 (at the back)
                                                         is evicted
                map after put(3): {1 → node 1, 3 → node 3}
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The first version is the lesson's hash map plus doubly linked list. The second uses OrderedDict, which is exactly that structure built in: move_to_end() marks a key as most recent, and popitem(last=False) removes the oldest.\n\nBoth run the same sequence of calls and give the same results. A second check runs 10,000 random gets and puts against both, with a fixed seed, and confirms they always agree.`,
            code: py`
                import random
                from collections import OrderedDict


                class Node:
                    def __init__(self, key=None, val=None):
                        self.key, self.val, self.prev, self.next = key, val, None, None


                class LRUCache:                                  # from memory: hash map + doubly linked list
                    def __init__(self, capacity):
                        self.cap, self.map = capacity, {}
                        self.head, self.tail = Node(), Node()
                        self.head.next, self.tail.prev = self.tail, self.head

                    def _remove(self, node):
                        node.prev.next, node.next.prev = node.next, node.prev

                    def _add_front(self, node):
                        node.prev, node.next = self.head, self.head.next
                        self.head.next.prev = node
                        self.head.next = node

                    def get(self, key):
                        if key not in self.map:
                            return None
                        node = self.map[key]
                        self._remove(node)
                        self._add_front(node)
                        return node.val

                    def put(self, key, val):
                        if key in self.map:
                            self._remove(self.map[key])
                        node = Node(key, val)
                        self.map[key] = node
                        self._add_front(node)
                        if len(self.map) > self.cap:
                            lru = self.tail.prev
                            self._remove(lru)
                            del self.map[lru.key]


                class OrderedLRU:                                # the same with OrderedDict
                    def __init__(self, capacity):
                        self.cap, self.data = capacity, OrderedDict()

                    def get(self, key):
                        if key not in self.data:
                            return None
                        self.data.move_to_end(key)               # most recent at the end
                        return self.data[key]

                    def put(self, key, val):
                        self.data[key] = val
                        self.data.move_to_end(key)
                        if len(self.data) > self.cap:
                            self.data.popitem(last=False)        # least recent is at the start


                def run(cache, ops):
                    return [cache.get(op[1]) if op[0] == "get" else cache.put(op[1], op[2]) for op in ops]


                ops = [("put", 1, "a"), ("put", 2, "b"), ("get", 1), ("put", 3, "c"), ("get", 2),
                       ("get", 3), ("put", 1, "A"), ("put", 4, "d"), ("get", 3), ("get", 1), ("get", 4)]
                gets = [r for op, r in zip(ops, run(LRUCache(2), ops)) if op[0] == "get"]
                print(gets)                                      # ['a', None, 'c', None, 'A', 'd']
                print(run(LRUCache(2), ops) == run(OrderedLRU(2), ops))   # True

                random.seed(0)
                ops = [("get", random.randrange(20)) if random.random() < 0.5 else ("put", random.randrange(20), i)
                       for i in range(10_000)]
                print(run(LRUCache(5), ops) == run(OrderedLRU(5), ops))   # True: 10,000 random calls agree
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `The simple way: one lock around both get and put. get has to be inside the lock too, because it changes the list (it moves the node to the front); two threads moving nodes at once would corrupt the pointers. (Python's GIL doesn't help: a get is many steps, and a thread can switch between them.)\n\nWhat it costs:\n• Every operation, even a read, waits its turn, so under heavy concurrency the cache handles one request at a time and threads queue at the lock.\n• A read-write lock doesn't help, because every get is a write to the order.\n\nWays to reduce the cost:\n• Shard it: N independent LRU caches, each with its own lock, chosen by a hash of the key. Contention drops by about N; the price is that eviction is only "least recently used" within each shard.\n• Approximate the order: record reads in a buffer and apply them in batches (as Java's Caffeine does), or use a CLOCK-style "recently used" bit instead of moving nodes. Redis samples a few keys and evicts the oldest of them.\n• Use a well-tested concurrent cache library instead of writing your own.`,
        },
    },
    'sd7-t6': {
        explain: {
            answer: `Three sell orders are waiting in the book:\n• S1: sell 5 shares at £101, placed at 09:00.\n• S2: sell 3 at £100, placed at 09:01.\n• S3: sell 4 at £100, placed at 09:02.\n\nA buy order arrives: buy 10 at up to £101.\n\nPrice-time priority means the best price goes first, and at the same price, the earliest order goes first. For a buyer the best price is the lowest, so the £100 level goes before £101, even though S1 was placed first.\n1. £100 level, oldest first: S2 fills 3 (7 still wanted), then S3 fills 4 (3 still wanted).\n2. £101 level: S1 fills 3 of its 5.\n\nTrades: 3 @ £100, 4 @ £100, 3 @ £101. Each trade happens at the price of the order that was already waiting. S1 stays in the book with 2 shares left.\n\nThe rule is what makes the exchange fair and deterministic: improving your price gets you served first, and at equal prices, whoever came first wins.`,
        },
        draw: {
            answer: `Asks (sell orders) are listed from the cheapest upwards, bids (buy orders) from the highest down; the gap between the best ask and the best bid is the spread. The incoming buy at £101 takes everything at £100 and part of £101; the bids are untouched, and the £102 sellers are above the buyer's limit, so they stay.`,
            code: py`
                Before                          After "buy 10 @ £101"

                 ASKS (sell orders)              ASKS
                  £102 │ 6 (S4)                   £102 │ 6 (S4)
                  £101 │ 5 (S1)                   £101 │ 2 (S1: 3 filled)
                  £100 │ 3 (S2), 4 (S3)           £100 │ —   (both filled)
                ───────┼──── spread ────        ───────┼──── spread ────
                   £99 │ 2 (B1)                    £99 │ 2 (B1)
                   £98 │ 7 (B2)                    £98 │ 7 (B2)
                 BIDS (buy orders)               BIDS

                Trades: S2 3 @ £100, S3 4 @ £100, S1 3 @ £101
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `sell() mirrors buy(): it fills against the highest bids while they are at or above its price, oldest first at each price, and rests whatever is left. cancel() uses lazy deletion: finding an order inside a heap is slow, so the id is just marked as cancelled, and cancelled orders are thrown away whenever they reach the top. Each trade is (buyer, seller, price, quantity), at the resting order's price.\n\nThe test: three sells (two at £100, so time decides between them), then one buy that fills partly at each level and leaves 2 shares of S1. After S1 is cancelled, a buy at £105 finds nothing to match and rests as a bid; a later sell at £99 fills against it at £105, its price.`,
            code: py`
                import heapq
                import itertools


                class OrderBook:
                    def __init__(self):
                        self.bids, self.asks = [], []            # heaps of (price key, time, qty, id)
                        self.clock = itertools.count()
                        self.cancelled = set()

                    def _top(self, heap):                        # skip cancelled orders lazily
                        while heap and heap[0][3] in self.cancelled:
                            heapq.heappop(heap)
                        return heap[0] if heap else None

                    def buy(self, order_id, price, qty):
                        trades = []
                        while qty and (top := self._top(self.asks)) and top[0] <= price:
                            ask_price, t, ask_qty, ask_id = heapq.heappop(self.asks)
                            fill = min(qty, ask_qty)
                            trades.append((order_id, ask_id, ask_price, fill))
                            qty -= fill
                            if ask_qty > fill:
                                heapq.heappush(self.asks, (ask_price, t, ask_qty - fill, ask_id))
                        if qty:
                            heapq.heappush(self.bids, (-price, next(self.clock), qty, order_id))
                        return trades

                    def sell(self, order_id, price, qty):
                        trades = []
                        while qty and (top := self._top(self.bids)) and -top[0] >= price:
                            neg_price, t, bid_qty, bid_id = heapq.heappop(self.bids)
                            fill = min(qty, bid_qty)
                            trades.append((bid_id, order_id, -neg_price, fill))     # buyer, seller, price, qty
                            qty -= fill
                            if bid_qty > fill:
                                heapq.heappush(self.bids, (neg_price, t, bid_qty - fill, bid_id))
                        if qty:
                            heapq.heappush(self.asks, (price, next(self.clock), qty, order_id))
                        return trades

                    def cancel(self, order_id):
                        self.cancelled.add(order_id)


                book = OrderBook()
                book.sell("S1", 101, 5)
                book.sell("S2", 100, 3)
                book.sell("S3", 100, 4)                          # same price as S2, but later
                print(book.buy("B1", 101, 10))
                # [('B1', 'S2', 100, 3), ('B1', 'S3', 100, 4), ('B1', 'S1', 101, 3)]
                print(book._top(book.asks))                      # (101, 0, 2, 'S1'): 2 of S1 left

                book.cancel("S1")
                print(book.buy("B2", 105, 1))                    # []: S1 is cancelled, so B2 rests as a bid
                print(book.sell("S4", 99, 3))                    # [('B2', 'S4', 105, 1)]: 2 of S4 rest as an ask
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `A sorted map of price levels makes cancel fast.\n\nHeaps of individual orders:\n• The best order is always at the top: O(1) to look at, O(log n) to remove.\n• But cancel is slow: a heap isn't searchable, so finding one order is O(n), and removing it from the middle needs a re-heapify. The usual workaround is lazy deletion (mark it cancelled and skip it when it reaches the top): cancel becomes O(1), but cancelled orders stay in memory, the top must skip them, and the book's real depth at each price is hard to read.\n\nA sorted map of price levels (a balanced tree or skip list: price → a first-in-first-out queue of orders, as a doubly linked list), plus a hash map from order id to its node:\n• Cancel: look the order up by id, unlink it from its level's queue: O(1). If the level is now empty, remove it from the map: O(log P), for P price levels.\n• The best price is the first or last key; matching walks the queue at that level in time order.\n• Depth per price (the market-data feed) is just each level's total.\n\nReal exchanges use the second shape (often with an array indexed by price tick instead of a tree), because traders cancel far more often than they trade.`,
        },
    },
};
