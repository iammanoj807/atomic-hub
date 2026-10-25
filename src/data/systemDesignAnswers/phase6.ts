import type { SDTopicAnswers } from '../systemDesign';
import { py } from '../foundationsAnswers/code';

// Phase 6 · Design patterns. One good answer for each practice exercise.

export const sdPhase6Answers: Record<string, SDTopicAnswers> = {
    'sd6-t1': {
        explain: {
            answer: `A Singleton is a class that makes sure only one instance of itself ever exists in the program, and gives everyone the same one: the class controls its own creation, and asking for "a new one" returns the existing one. It is used for something there should genuinely be one of, such as the app's configuration or a database connection pool.\n\nThe main criticism: it is global state in disguise. Any code can reach for Config() from anywhere, so:\n• dependencies are hidden: you can't tell from a class's constructor that it secretly uses the config or the database;\n• testing is hard: the one instance carries state from one test to the next, and you can't easily hand a test a fake version;\n• "there will only ever be one" often turns out to be false (a second database, a per-tenant config), and then every caller has to change;\n• creating it safely from several threads needs care.`,
        },
        draw: {
            answer: `The instance is stored on the class itself (a class-level field, shown underlined in UML), not on any object. The creation method checks it first: if it is empty, it creates the instance (inside a lock), and either way it returns the stored one.`,
            code: py`
                ┌───────────────────────────────────┐
                │ Config                            │
                ├───────────────────────────────────┤
                │ - _instance: Config = None        │ ← the one stored
                │ - _lock: Lock                     │   instance (class-level)
                │ - settings: dict                  │
                ├───────────────────────────────────┤
                │ + __new__(): Config               │ ← returns _instance,
                │   (or get_instance() in Java)     │   creating it only the
                └───────────────────────────────────┘   first time
                          ▲         ▲         ▲
                       Config()  Config()  Config()
                      every caller gets the same object
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `A barrier releases all 10 threads at the same moment, and a short sleep inside creation widens the window where a race could happen. The safe version is created exactly once and all 10 threads get the same object.\n\nThe check-lock-check-again ("double-checked locking") matters: the first check skips the lock once the instance exists (fast), and the second check, inside the lock, stops a thread that was waiting from creating a second one. Without the lock, the same test creates several instances.`,
            code: py`
                import threading
                import time


                class Config:
                    _instance = None
                    _lock = threading.Lock()
                    created = 0

                    def __new__(cls):
                        if cls._instance is None:
                            with cls._lock:                       # one thread at a time past here
                                if cls._instance is None:         # check again: another thread may have won
                                    time.sleep(0.01)              # slow creation makes a race likely
                                    cls._instance = super().__new__(cls)
                                    cls._instance.settings = {}
                                    cls.created += 1
                        return cls._instance


                class UnsafeConfig:                               # the same, without the lock
                    _instance = None
                    created = 0

                    def __new__(cls):
                        if cls._instance is None:
                            time.sleep(0.01)
                            cls._instance = super().__new__(cls)
                            cls.created += 1
                        return cls._instance


                def ten_threads(cls):
                    start = threading.Barrier(10)                 # release all 10 at the same moment
                    got = []

                    def grab():
                        start.wait()
                        got.append(cls())

                    threads = [threading.Thread(target=grab) for _ in range(10)]
                    for t in threads:
                        t.start()
                    for t in threads:
                        t.join()
                    return cls.created, len({id(obj) for obj in got})


                print(ten_threads(Config))                        # (1, 1): created once, one shared object
                print(ten_threads(UnsafeConfig)[0] > 1)           # True: without the lock, several were created
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Both give the program one shared instance. The difference is who decides that, and how other code gets hold of it.\n\nSingleton: the class enforces "only one", and code fetches it from anywhere with Config().\n• Testing: the instance is global, so state leaks between tests, and swapping in a fake means monkey-patching the class.\n• Flexibility: "exactly one" is baked in; needing two later (a second database, one config per customer) means changing every caller.\n• Hidden dependencies: you can't see from a constructor what a class really uses.\n• Convenience: no wiring at all.\n\nInjecting one shared instance: create one Config at start-up (in main) and pass it into the classes that need it.\n• Testing: each test passes its own fresh or fake instance. Nothing leaks.\n• Flexibility: making two is just calling the constructor twice.\n• Dependencies are visible in every constructor.\n• Cost: a little wiring code.\n\nIn most designs, injection is better: you get "one instance" by choice at start-up, without the downsides of the pattern.`,
        },
    },
    'sd6-t2': {
        explain: {
            answer: `Both put the decision "which concrete class do I create?" in one place, so the rest of the code never names a concrete class.\n\nFactory Method: a single method creates one product and decides which class it is. NotifierFactory.create("sms") returns an SmsNotifier; the order service only knows it got "a notifier" and calls send(). Adding a channel changes the factory, not the callers.\n\nAbstract Factory: an object that creates a whole family of related products that must match. A UI has a DarkThemeFactory that makes a dark button, a dark checkbox and a dark menu, and a LightThemeFactory that makes the light versions. The screen asks its factory for parts, so it can never mix a dark button with a light checkbox. Switching theme means switching one factory.`,
        },
        draw: {
            answer: `The caller talks to the factory and to the Notifier interface only. The factory's registry maps a channel name to a class; each notifier implements the same send() method, so whichever one comes back is used the same way.`,
            code: py`
                OrderService ── create("sms") ──► NotifierFactory
                     │                             - _registry:
                     │                               "email" → EmailNotifier
                     │                               "sms"   → SmsNotifier
                     │                               "push"  → PushNotifier
                     │                             + create(channel): Notifier
                     │ uses
                     ▼
                «interface» Notifier
                 + send(msg)
                   △            △             △
                   ┊            ┊             ┊
                EmailNotifier  SmsNotifier  PushNotifier
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `create() is exactly the lesson's one line. The factory gains a register() method, used as a decorator, so a new notifier registers itself where it is defined. Adding "push" touches no existing code: one new class, marked with the channel name.`,
            code: py`
                class EmailNotifier:
                    def send(self, msg): return f"email: {msg}"


                class SmsNotifier:
                    def send(self, msg): return f"sms: {msg}"


                class NotifierFactory:
                    _registry = {"email": EmailNotifier, "sms": SmsNotifier}

                    @classmethod
                    def register(cls, channel):
                        def add(notifier_class):
                            cls._registry[channel] = notifier_class
                            return notifier_class
                        return add

                    @classmethod
                    def create(cls, channel):
                        return cls._registry[channel]()          # unchanged


                @NotifierFactory.register("push")                # the new notifier registers itself
                class PushNotifier:
                    def send(self, msg): return f"push: {msg}"


                print(NotifierFactory.create("push").send("Your order has shipped"))   # push: Your order has shipped
                print(NotifierFactory.create("sms").send("Code 4821"))                 # sms: Code 4821
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• There is only one concrete class, and no real prospect of another: just call its constructor.\n• The caller already knows exactly which class it needs: a factory that takes "email" and returns EmailNotifier() adds a lookup and a file for no gain.\n• Construction is trivial: a factory that only wraps a constructor is a layer to read through, not a design.\n• In Python, a class is already a factory: you can pass the class itself (or a function) to whoever needs to create objects, without a Factory class around it.\n\nA factory earns its place when the choice depends on something only known at runtime (configuration, user input, the country), when creating the object is complicated (several steps, dependencies to wire), or when a family of objects must match (Abstract Factory).`,
        },
    },
    'sd6-t3': {
        explain: {
            answer: `At a sandwich counter you don't shout the whole order in one breath. You build it step by step: "white bread", "chicken", "lettuce", "no mayo", and then "that's it". Each choice is clearly named, you can skip what you don't want, and when you say "done", the person behind the counter checks it makes sense ("you didn't pick a bread") before making it.\n\nA builder does the same for objects with many optional parts. Instead of Pizza("large", None, True, False, ["olive"], …), where nobody can remember which position means what, you call clearly named methods, one per part, each returning the builder so they chain: PizzaBuilder("large").add("olive").with_extra_cheese(). Finally build() checks the rules and returns the finished, complete object.`,
        },
        draw: {
            answer: `The builder holds the parts while they are being chosen, and every setter returns the builder itself, which is what lets the calls chain. Only build() creates the Pizza, after checking the rules, so a half-finished pizza can never escape.`,
            code: py`
                PizzaBuilder                          Pizza
                 - size                                - size
                 - toppings: list                      - toppings
                 - extra_cheese: bool                  - extra_cheese
                 + add(topping): PizzaBuilder ─┐
                 + with_extra_cheese():         ├ return self,
                     PizzaBuilder ─────────────┘ so calls chain
                 + build(): Pizza ── checks the rules,
                                     then creates ──►  Pizza
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Each part has its own named method that returns self, so the calls chain and read like a sentence. to(), cc() and attach() can be called several times. build() enforces the one hard rule, at least one recipient, and hands back copies of the lists, so changing the builder afterwards can't change an email already built.`,
            code: py`
                class Email:
                    def __init__(self, to, cc, subject, body, attachments):
                        self.to, self.cc, self.subject = to, cc, subject
                        self.body, self.attachments = body, attachments


                class EmailBuilder:
                    def __init__(self):
                        self._to, self._cc, self._attachments = [], [], []
                        self._subject = self._body = ""

                    def to(self, *addresses):
                        self._to.extend(addresses)
                        return self

                    def cc(self, *addresses):
                        self._cc.extend(addresses)
                        return self

                    def subject(self, text):
                        self._subject = text
                        return self

                    def body(self, text):
                        self._body = text
                        return self

                    def attach(self, filename):
                        self._attachments.append(filename)
                        return self

                    def build(self):
                        if not self._to:
                            raise ValueError("an email needs at least one recipient")
                        return Email(list(self._to), list(self._cc), self._subject, self._body, list(self._attachments))


                email = (EmailBuilder()
                         .to("priya@mail.com")
                         .cc("tom@mail.com")
                         .subject("Invoice 105")
                         .body("Your invoice is attached.")
                         .attach("invoice-105.pdf")
                         .build())
                print(email.to, email.attachments)            # ['priya@mail.com'] ['invoice-105.pdf']

                try:
                    EmailBuilder().subject("Nobody to send to").build()
                except ValueError as error:
                    print(error)                              # an email needs at least one recipient
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `In Python, keyword arguments with defaults (or a dataclass) already solve the main problem the pattern was invented for in Java: Pizza(size="large", toppings=["olive"], extra_cheese=True) is readable, needs no extra class, and a __post_init__ can check the rules. That is the better choice most of the time.\n\nA builder is the better choice when:\n• the object is assembled step by step, across several places or in a loop ("add a header if…", "attach each file"), not in one call;\n• validation spans several parts and should run once, at the end (build());\n• the result should be immutable, but getting there takes many steps;\n• you want a fluent, readable language for complex things: SQL query builders, HTTP request builders, test-data builders;\n• the language has no named or default arguments (Java, older C++).`,
        },
    },
    'sd6-t4': {
        explain: {
            answer: `You bring a UK hair dryer to Spain. The dryer expects a UK socket; the wall has an EU socket. You don't rewire the hotel, and you don't take the dryer apart: you plug a travel adapter in between. It changes the shape of the connection so the two fit, and neither side has to change.\n\nThe Adapter pattern is the same in code. Your code expects an interface (pay(pounds)); a third-party SDK you can't change offers something different (make_payment(pence, currency)). An adapter class implements your interface and translates each call into the SDK's form: pounds into pence, a "GBP" argument added, the SDK's "OK" string turned into True. Your code and the SDK both stay exactly as they are.`,
        },
        draw: {
            answer: `Our code depends only on PaymentGateway. The adapter implements that interface (dotted line) and holds the SDK it wraps (solid arrow), translating every call. Swapping to a different bank later means writing a different adapter; our code never changes.`,
            code: py`
                Our checkout code
                   │ pay(12.50)
                   ▼
                «interface» PaymentGateway
                 + pay(pounds) → bool
                   △
                   ┊ implements
                LegacyBankAdapter
                 - sdk
                 + pay(pounds):
                     make_payment(1250, "GBP") == "OK"
                   │ wraps and calls
                   ▼
                LegacyBankSDK   (we can't change this)
                 + make_payment(pence, currency) → str
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Our code wants current_celsius(city name). The third-party client offers get_temp(city code) in Fahrenheit. The adapter translates both ways: the city name into the API's code on the way in, and Fahrenheit into Celsius ((F − 32) × 5 ÷ 9) on the way out. Nothing that uses TemperatureSource knows the API exists.`,
            code: py`
                from abc import ABC, abstractmethod


                class TemperatureSource(ABC):                    # what our code expects
                    @abstractmethod
                    def current_celsius(self, city) -> float: ...


                class AcmeWeatherAPI:                             # the third-party client we were given
                    def get_temp(self, city_code):
                        return {"LDN": 59.0, "NYC": 86.0}[city_code]      # Fahrenheit


                class AcmeWeatherAdapter(TemperatureSource):
                    CODES = {"London": "LDN", "New York": "NYC"}

                    def __init__(self, api):
                        self.api = api

                    def current_celsius(self, city):
                        fahrenheit = self.api.get_temp(self.CODES[city])
                        return round((fahrenheit - 32) * 5 / 9, 1)


                weather = AcmeWeatherAdapter(AcmeWeatherAPI())
                print(weather.current_celsius("London"), weather.current_celsius("New York"))   # 15.0 30.0
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `An adapter sits exactly where two systems meet, so anything it hides, nobody else sees.\n\nSilent conversion:\n• Lost precision: £10.005 rounded to pence, or rounded twice in different places, and the totals stop matching the bank's.\n• Wrong assumptions: a timestamp assumed to be UTC that was local time, or a unit assumed to be metres that was feet. Everything "works" and the numbers are quietly wrong.\n• Missing data filled with defaults: a missing temperature becomes 0 °C, which is a real temperature.\n\nSwallowed errors:\n• The SDK says "DECLINED" in one case and "TIMEOUT" in another, and the adapter returns False for both. The caller can't tell "the card was refused, don't retry" from "we don't know, check before retrying", and may charge twice.\n• An exception is caught and logged inside the adapter, so the caller thinks the payment failed when it went through (or the opposite).\n\nA good adapter converts explicitly and with tests, and translates errors into your own error types that keep their meaning (PaymentDeclined, PaymentTimedOut), instead of hiding them.`,
        },
    },
    'sd6-t5': {
        explain: {
            answer: `You wrap a present in layers: paper, then a ribbon, then a card. Each layer adds one thing; underneath it is still the same present, and you can add or leave out any layer, in any order.\n\nA decorator does that to an object. Each decorator holds the object inside it, has the same methods (so it looks exactly like the thing it wraps), adds one feature, and passes the call on: a logging layer prints "reading…", an upper-case layer changes the result, a cache layer remembers it. You stack the features you need, LoggingSource(UpperCaseSource(DataSource())), instead of writing a subclass for every combination (LoggedUpperCaseCachedSource…). With three features, that is three small classes instead of seven combinations.`,
        },
        draw: {
            answer: `The call goes down through each layer to the real source, and the result comes back up through them. Every layer has the same read() method as the thing it wraps, so any layer can wrap any other, and the caller can't tell how many layers there are.`,
            code: py`
                caller
                  │ read()                        ▲ "DATA"
                  ▼                               │
                LoggingSource   prints "reading…" │
                  │ inner.read()                  │ "DATA"
                  ▼                               │
                UpperCaseSource                   │ upper-cases
                  │ inner.read()                  │ "data" → "DATA"
                  ▼                               │
                DataSource ───── returns "data" ──┘
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Both decorators have the same get() method as the client, so they stack either way. A fake clock and a client that fails twice make the results repeatable.\n\nThe order changes what is measured. Timing outside retry measures the whole call, retries included: one entry of 0.3 s, which is what the user waited. Retry outside timing measures each attempt separately: three entries of 0.1 s, which tells you how fast the server is but hides that the user waited three times as long. Neither is wrong; they answer different questions, so choose the order on purpose (or keep both).`,
            code: py`
                class Clock:                                     # a fake clock, so the times are repeatable
                    def __init__(self):
                        self.now = 0.0


                class FlakyClient:
                    """Times out twice, then works. Each call takes 0.1 s on the fake clock."""

                    def __init__(self, clock):
                        self.clock, self.calls = clock, 0

                    def get(self, url):
                        self.calls += 1
                        self.clock.now += 0.1
                        if self.calls <= 2:
                            raise TimeoutError(url)
                        return f"200 OK {url}"


                class TimingDecorator:
                    def __init__(self, inner, clock, log):
                        self.inner, self.clock, self.log = inner, clock, log

                    def get(self, url):
                        start = self.clock.now
                        try:
                            return self.inner.get(url)
                        finally:
                            self.log.append(f"took {self.clock.now - start:.1f} s")


                class RetryDecorator:
                    def __init__(self, inner, attempts=3):
                        self.inner, self.attempts = inner, attempts

                    def get(self, url):
                        for attempt in range(1, self.attempts + 1):
                            try:
                                return self.inner.get(url)
                            except TimeoutError:
                                if attempt == self.attempts:
                                    raise


                for order in ("timing outside retry", "retry outside timing"):
                    clock, log = Clock(), []
                    client = FlakyClient(clock)
                    if order == "timing outside retry":
                        stack = TimingDecorator(RetryDecorator(client), clock, log)
                    else:
                        stack = RetryDecorator(TimingDecorator(client, clock, log))
                    print(order, "|", stack.get("/orders"), "|", log)
                # timing outside retry | 200 OK /orders | ['took 0.3 s']
                # retry outside timing | 200 OK /orders | ['took 0.1 s', 'took 0.1 s', 'took 0.1 s']
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• The stack is invisible where it is used: the caller just sees "a client". What it actually does depends on how many layers were wrapped around it, in what order, somewhere else (often in start-up code).\n• Order changes behaviour, silently: retry inside a cache behaves differently from cache inside retry, and timing inside or outside retry measures different things.\n• Layers change things on the way through: a retry layer hides the first two failures, a cache returns old data, an error-handling layer turns an exception into a default. When the result is wrong, you have to work out which layer produced it.\n• Stack traces get deep, full of near-identical wrapper frames.\n• Duplicated layers multiply: a retry around a client that already retries means 3 × 3 = 9 attempts.\n• Identity is lost: isinstance checks and attribute access stop working on the wrapped object.\n\nKeep the stack short, build it in one obvious place, give each layer a clear name, and have each log what it did.`,
        },
    },
    'sd6-t6': {
        explain: {
            answer: `A hotel concierge. You say "dinner for two at 8, and a taxi there". You don't phone the restaurant, check the menu, book the table, then call the taxi firm and give the address. The concierge does all of that, in the right order, and you deal with one person.\n\nA facade is the concierge for a set of classes. Placing an order involves inventory, payments, shipping and notifications, each with its own methods and its own order of calls. A CheckoutFacade offers one method, place_order(order), which makes those calls in the right sequence. Callers get a simple front door; the subsystems stay as they are, and anyone with an unusual need can still talk to them directly, the way you could still phone the restaurant yourself.`,
        },
        draw: {
            answer: `The facade only coordinates: it calls each subsystem in the right order and holds no business rules of its own. The subsystems don't know the facade exists, and callers can still use them directly for anything unusual.`,
            code: py`
                Caller
                  │ place_order(order)
                  ▼
                CheckoutFacade
                  │ 1. reserve(items) ────────────► Inventory
                  │ 2. charge(customer, total) ───► Payments
                  │ 3. schedule(order) ───────────► Shipping
                  │ 4. send(customer, "confirmed") ► Notifier
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The facade switches things on in the order that matters: the projector and its input first, then the amplifier at a sensible volume, and the player last, so the film doesn't start before there is a picture and sound. end_movie() switches off in the reverse order. Anyone using the facade needs one call, not six.`,
            code: py`
                class Projector:
                    def on(self): return "projector on"
                    def input(self, source): return f"projector input: {source}"
                    def off(self): return "projector off"


                class Amplifier:
                    def on(self): return "amplifier on"
                    def volume(self, level): return f"volume {level}"
                    def off(self): return "amplifier off"


                class Player:
                    def on(self): return "player on"
                    def play(self, film): return f"playing {film}"
                    def off(self): return "player off"


                class HomeTheaterFacade:
                    def __init__(self, projector, amplifier, player):
                        self.projector, self.amplifier, self.player = projector, amplifier, player

                    def watch_movie(self, film):
                        return [
                            self.projector.on(),
                            self.projector.input("player"),
                            self.amplifier.on(),
                            self.amplifier.volume(5),
                            self.player.on(),
                            self.player.play(film),               # last: picture and sound are ready
                        ]

                    def end_movie(self):                          # the reverse order
                        return [self.player.off(), self.amplifier.off(), self.projector.off()]


                theater = HomeTheaterFacade(Projector(), Amplifier(), Player())
                print(" → ".join(theater.watch_movie("Dune")))
                # projector on → projector input: player → amplifier on → volume 5 → player on → playing Dune
                print(" → ".join(theater.end_movie()))
                # player off → amplifier off → projector off
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• Keep it thin: it coordinates calls in the right order and nothing more. Business rules ("orders over £1,000 need a fraud check") belong in the subsystems; if you find yourself writing ifs about the business in the facade, move them out.\n• One facade per task or use case, not one for the whole system. A CheckoutFacade and a ReturnsFacade stay small; an OrderSystemFacade grows forever.\n• Don't make it the only way in. Other code may use the subsystems directly for unusual needs, so the facade doesn't have to grow a method for every case.\n• Watch the method count and the number of dependencies: when it holds ten subsystems and twenty methods, split it.\n• Test the subsystems on their own, so the facade's tests only check the order of calls.`,
        },
    },
    'sd6-t7': {
        explain: {
            answer: `In a maps app, the journey is the same, from home to the airport, but you choose how the route is worked out: fastest, shortest, or avoiding tolls. The app doesn't care which you pick; it asks the chosen option for a route and follows it. You can switch options without changing anything else.\n\nStrategy is that idea in code. One job (working out a ride's price) has several interchangeable ways of being done (normal pricing, surge pricing). Each way is its own class (or function) with the same method, price(distance). The Ride holds one strategy and calls it, without knowing which one it has. Swapping the strategy changes the behaviour; adding a new one needs no change to Ride. It replaces an if/elif on "pricing type" in the middle of the business code.`,
        },
        draw: {
            answer: `Ride holds one PricingStrategy and only ever calls price(). Each implementation is interchangeable. Night pricing is added as one more box at the bottom, without touching Ride.`,
            code: py`
                Ride
                 - pricing: PricingStrategy  ◆──► «interface» PricingStrategy
                 + fare(km)                         + price(distance_km)
                                                      △          △           △
                                                      ┊          ┊           ┊
                                           NormalPricing   SurgePricing   NightPricing
                                           2 + 1.2 × km    normal × 1.5   normal + £3
                                                                          (added later)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `NightPricing is one new class with the same price() method: here a flat £3 on top of the normal fare. Ride is not changed. Each strategy gets a test for a 10 km ride: normal £14.00, surge (× 1.5) £21.00, night £17.00, and one more test checks that strategies can be swapped on the same ride.`,
            code: py`
                class NormalPricing:
                    def price(self, distance_km): return 2 + 1.2 * distance_km


                class SurgePricing:
                    def __init__(self, multiplier): self.multiplier = multiplier
                    def price(self, distance_km): return (2 + 1.2 * distance_km) * self.multiplier


                class NightPricing:                               # new: Ride is not changed
                    def price(self, distance_km): return NormalPricing().price(distance_km) + 3


                class Ride:
                    def __init__(self, pricing): self.pricing = pricing
                    def fare(self, km): return round(self.pricing.price(km), 2)


                def test_normal():
                    assert Ride(NormalPricing()).fare(10) == 14.0


                def test_surge():
                    assert Ride(SurgePricing(1.5)).fare(10) == 21.0


                def test_night():
                    assert Ride(NightPricing()).fare(10) == 17.0


                def test_strategy_can_be_swapped():
                    ride = Ride(NormalPricing())
                    ride.pricing = NightPricing()
                    assert ride.fare(10) == 17.0


                for test in (test_normal, test_surge, test_night, test_strategy_can_be_swapped):
                    test()
                print("all 4 tests passed")                       # all 4 tests passed
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• Two or three options that rarely change, each only a line or two: an if/else is shorter and easier to read than an interface and three classes.\n• The choice is used in one place only, so nothing else would reuse the strategies.\n• The behaviour never needs to be swapped at runtime, configured, or tested separately.\n• It is really data, not behaviour: if the options only differ in numbers (a rate per km), a table of numbers is enough.\n\nIn Python there is also a lighter middle ground: functions are already strategies. Pass a function, or keep a dictionary from name to function, without writing classes.\n\nMove to Strategy when the options multiply, when each grows its own logic, when other teams add options, or when you want to test each option on its own.`,
        },
    },
    'sd6-t8': {
        explain: {
            answer: `When you subscribe to a YouTube channel, the channel doesn't need to know who you are or what you'll do with the notification. When a new video is published, YouTube tells every subscriber. People can subscribe and unsubscribe at any time, and the channel keeps publishing the same way.\n\nObserver is that pattern inside a program. The subject (OrderEvents) keeps a list of subscribers. When something happens ("order A123 placed"), it calls each of them. Email sends a receipt, stock is reduced, analytics records the sale, but the order code doesn't call those three things by name; it just publishes. Adding a fourth reaction means subscribing one more function, without touching the order code.`,
        },
        draw: {
            answer: `The subject only holds a list of things to call, so it never depends on email, stock or analytics code. New observers subscribe themselves; the publish loop doesn't change.`,
            code: py`
                OrderEvents (the subject)
                 - subscribers: [send_receipt, update_stock, record_sale]
                 + subscribe(callback)
                 + publish(order_id) ── calls each subscriber
                        │
                ┌───────┼──────────────────┐
                ▼       ▼                  ▼
              Email   Stock              Analytics
              send    reduce the         record
              receipt stock levels       the sale
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The ticker remembers, for each stock, the last price it told subscribers about, and stays quiet unless the new price is more than 1% away from it. Comparing with the last notified price (not the last price seen) means a slow drift still gets reported once it adds up to more than 1%.\n\nFrom 100.0: 100.5 is a 0.5% move, so it is ignored; 101.2 is 1.2% above 100.0, so it is sent; 99.9 is 1.3% below 101.2; 98.8 is 1.1% below 99.9.`,
            code: py`
                class StockTicker:
                    def __init__(self, threshold=0.01):
                        self.threshold = threshold
                        self.last_sent = {}                       # symbol -> last price subscribers were told
                        self.subscribers = []

                    def subscribe(self, callback):
                        self.subscribers.append(callback)

                    def update(self, symbol, price):
                        last = self.last_sent.get(symbol)
                        if last is not None and abs(price - last) / last <= self.threshold:
                            return                                # 1% or less: stay quiet
                        self.last_sent[symbol] = price
                        for notify in self.subscribers:
                            notify(symbol, price)


                alerts = []
                ticker = StockTicker()
                ticker.subscribe(lambda symbol, price: alerts.append(f"{symbol} {price}"))
                for price in [100.0, 100.5, 101.2, 99.9, 98.8]:
                    ticker.update("ACME", price)
                print(alerts)        # ['ACME 100.0', 'ACME 101.2', 'ACME 99.9', 'ACME 98.8']
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `In the simple loop, subscribers run one after another, inside publish():\n• One throws: the error comes back into the publisher, so placing an order can fail because analytics broke, and the subscribers after it in the list are never called.\n• One is slow: publish() waits for it, so the order request waits, and everything after it is delayed.\n\nProtecting the publisher:\n• Wrap each call in try/except, log the error, and carry on with the next subscriber.\n• Run subscribers asynchronously, on a thread pool or a queue, with a timeout, so publish() returns straight away.\n• Across services, use a real message queue (publish/subscribe): each subscriber gets its own queue, with its own retries and a dead-letter queue, and a broken subscriber can't affect the publisher or the others.\n• Decide what must not be an observer: if the order can't be placed without reserving stock, that is part of the main flow, not a fire-and-forget notification.`,
        },
    },
    'sd6-t9': {
        explain: {
            answer: `You phone customer support. First-line support takes the call. If they can answer, done. If not, they pass you to a specialist; if the specialist can't, to a manager. Each person either handles the problem or hands it to the next, and you only deal with "support"; you don't choose who answers.\n\nChain of Responsibility links handlers in a line. A request goes to the first; each handler decides "can I deal with this?" and either handles it or passes it on. An expense of £450 goes to the team lead (limit £100), who passes it to the manager (limit £1,000), who approves it. The sender doesn't know who will handle it, each handler is independent, and the chain can be reordered or extended without changing the others. Web middleware works the same way: authentication, then rate limiting, then validation, then the handler.`,
        },
        draw: {
            answer: `Each approver either handles the request or passes it to the next. A request that reaches the end of the chain unhandled must get a clear answer (here a rejection), never silence.`,
            code: py`
                Team lead ──► Manager ──► Director ──► (end of the chain)
                ≤ £100        ≤ £1,000    ≤ £10,000

                £450
                  Team lead: over £100, pass it on
                  Manager:   £450 ≤ £1,000 ✓
                  → "Manager approved £450"

                £20,000
                  Team lead: pass → Manager: pass → Director:
                  over £10,000, and nobody is left
                  → "Rejected: over every limit"
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Each dispenser handles one note size: it pays as many of its notes as fit (divmod), and passes the remainder to the next dispenser. £180 is three £50s (£150), then one £20, then one £10. An amount the chain can't finish, such as £185, ends with a clear error instead of paying the wrong sum.\n\nOne honest limit of this greedy approach: with only £50 and £20 notes, £60 would fail (£50, then £10 left over), although three £20s would work. A real ATM checks the combination before paying anything out.`,
            code: py`
                class NoteDispenser:
                    def __init__(self, note, next_dispenser=None):
                        self.note, self.next = note, next_dispenser

                    def dispense(self, amount, paid=None):
                        paid = {} if paid is None else paid
                        count, remainder = divmod(amount, self.note)
                        if count:
                            paid[self.note] = count
                        if remainder == 0:
                            return paid
                        if self.next is None:
                            raise ValueError(f"can't pay the last £{remainder} in notes")
                        return self.next.dispense(remainder, paid)


                atm = NoteDispenser(50, NoteDispenser(20, NoteDispenser(10)))
                print(atm.dispense(180))      # {50: 3, 20: 1, 10: 1}

                try:
                    atm.dispense(185)
                except ValueError as error:
                    print(error)              # can't pay the last £5 in notes
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• It isn't obvious who handled a request. The answer depends on the order of the chain, which is set up somewhere else, so reading the sender's code tells you nothing.\n• A request can disappear. If a handler neither handles the request nor passes it on (a missing "else: pass it on"), or the chain ends without a final handler, nothing happens and nobody is told.\n• Order bugs: putting validation before authentication, or the £1,000 approver before the £100 one, changes the results without any error.\n• Hidden side effects: each handler may change the request on the way through, so the last handler sees something different from what was sent.\n• Long chains add a little work to every request, and very long recursive chains get deep stack traces.\n\nMitigations: build the chain in one visible place; log which handler took each request; put a final handler at the end that fails loudly; keep each handler small and test it on its own.`,
        },
    },
    'sd6-t10': {
        explain: {
            answer: `A traffic light reacts to the same event, "tick", differently depending on its colour: red goes to red-and-amber, green goes to amber, amber goes to red. Each colour knows what comes after it. You don't need one big rule book that says "if red and tick, then…, if green and tick, then…"; the current colour decides.\n\nThe State pattern does this in code. An object (a vending machine) behaves differently in different situations (idle, has a coin, sold out). Instead of an if/elif on a status variable inside every method, each state is a class with a method for each event. The machine forwards each event to its current state object, and that state does the right thing and decides which state comes next. A new state is a new class, and each state's rules are in one place.`,
        },
        draw: {
            answer: `Only the arrows shown are allowed; any other event in a state is refused with a clear message. An order can be cancelled before it ships (with a refund once paid); after shipping it is a return, not a cancellation. Delivered and cancelled are final.`,
            code: py`
                created ──pay──► paid ──ship──► shipped ──deliver──► delivered
                   │               │
                   │ cancel        │ cancel (refund the payment)
                   ▼               ▼
                cancelled ◄────────┘

                Final states: delivered, cancelled
                Refused, for example:
                  ship   while created  (not paid yet)
                  cancel while shipped  (use a return instead)
                  pay    while cancelled
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Every state now handles three events: insert_coin, press and refund. HasCoin.press() sells the snack, reduces the stock and moves to SoldOut if it was the last one, otherwise back to Idle. SoldOut refuses coins (handing them back) and presses. HasCoin.refund() returns the coin. The machine itself contains no if statements about its status: it just forwards each event to its current state.`,
            code: py`
                class Idle:
                    def insert_coin(self, machine):
                        machine.state = HasCoin()
                        return "coin accepted"

                    def press(self, machine):
                        return "insert a coin first"

                    def refund(self, machine):
                        return "no coin to return"


                class HasCoin:
                    def insert_coin(self, machine):
                        return "already has a coin"

                    def press(self, machine):
                        machine.stock -= 1
                        machine.state = SoldOut() if machine.stock == 0 else Idle()
                        return "here is your snack"

                    def refund(self, machine):
                        machine.state = Idle()
                        return "coin returned"


                class SoldOut:
                    def insert_coin(self, machine):
                        return "sold out: coin returned"

                    def press(self, machine):
                        return "sold out"

                    def refund(self, machine):
                        return "no coin to return"


                class VendingMachine:
                    def __init__(self, stock):
                        self.stock = stock
                        self.state = Idle() if stock > 0 else SoldOut()

                    def insert_coin(self): return self.state.insert_coin(self)
                    def press(self): return self.state.press(self)
                    def refund(self): return self.state.refund(self)


                machine = VendingMachine(stock=1)
                for event in ["insert_coin", "refund", "insert_coin", "press", "insert_coin", "press"]:
                    print(event, "→", getattr(machine, event)())
                # insert_coin → coin accepted
                # refund → coin returned
                # insert_coin → coin accepted
                # press → here is your snack
                # insert_coin → sold out: coin returned
                # press → sold out
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `A transition table, a dictionary of state → event → next state (for example {"created": {"pay": "paid", "cancel": "cancelled"}, …}), is better when:\n• states mostly differ in which events are allowed and where they lead, not in what they do (an order's status, a ticket's workflow);\n• you want to see every transition at once, check it, draw it, or load it from configuration;\n• non-programmers need to read or change the rules.\nIt is compact and data-driven, and any action can be looked up by name.\n\nState classes are better when:\n• each state really behaves differently (handling money, timers, different data), with real logic per event;\n• the behaviour per state keeps growing, and you want each state's code in one place, easy to test alone.\nThe cost: the transitions are spread across classes, so the overall picture is harder to see.\n\nA common mix: a table for the allowed transitions, plus small functions or classes for the actions that run on each one.`,
        },
    },
};
