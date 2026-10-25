import type { SDTopicAnswers } from '../systemDesign';
import { py } from '../foundationsAnswers/code';

// Phase 5 · Low-level design: OOP and SOLID. One good answer for each practice exercise.

export const sdPhase5Answers: Record<string, SDTopicAnswers> = {
    'sd5-t1': {
        explain: {
            answer: `• Abstraction: to drive, you use the steering wheel, the pedals and the gear stick. You don't need to know how fuel injection works. A class shows callers only the few methods they need.\n• Encapsulation: the engine is under the bonnet, out of reach. You can't set the engine speed to an impossible value by hand; you can only press the accelerator, which keeps it within safe limits. A class keeps its data private and only lets it change through methods that keep it valid.\n• Inheritance: an electric car is a kind of car. It has everything a car has (wheels, seats, a steering wheel) and adds a battery. A subclass reuses its parent and extends it.\n• Polymorphism: "press the accelerator" works on any car, but a petrol car burns more fuel while an electric car draws more current. Code calls the same method on different classes, and each does its own version.`,
        },
        draw: {
            answer: `Shape is abstract: it only promises area(). Each subclass keeps its own measurements private (the minus sign) and implements area() its own way. The hollow triangle points from each subclass up to the parent: "is a kind of".`,
            code: py`
                           «abstract»
                             Shape
                        ───────────────
                        + area(): float
                               △
                      ┌────────┴────────┐
                   Circle           Rectangle
                ────────────     ──────────────
                - radius         - width
                                 - height
                + area()         + area()
                  = π × r²         = width × height
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `total_area only knows about Shape and its area() method. Adding Triangle is one new class; total_area, and any other code that uses shapes, is not touched. That is polymorphism (and the open/closed principle): the caller says "give me your area", and each shape answers in its own way.`,
            code: py`
                import math
                from abc import ABC, abstractmethod


                class Shape(ABC):
                    @abstractmethod
                    def area(self) -> float: ...


                class Circle(Shape):
                    def __init__(self, radius):
                        self._radius = radius

                    def area(self):
                        return math.pi * self._radius ** 2


                class Rectangle(Shape):
                    def __init__(self, width, height):
                        self._width, self._height = width, height

                    def area(self):
                        return self._width * self._height


                def total_area(shapes):                  # the code that uses shapes
                    return sum(shape.area() for shape in shapes)


                print(round(total_area([Circle(1), Rectangle(2, 3)]), 2))                   # 9.14


                class Triangle(Shape):                   # added later: total_area is untouched
                    def __init__(self, base, height):
                        self._base, self._height = base, height

                    def area(self):
                        return 0.5 * self._base * self._height


                print(round(total_area([Circle(1), Rectangle(2, 3), Triangle(4, 5)]), 2))   # 19.14
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `A stack built by inheriting from a list: class Stack(list).\n\nIt looks like neat reuse: a list can already add to the end and pop from the end. But inheritance hands over everything a list can do, and the stack can't take any of it back. Callers can now insert(0, x), sort it, delete from the middle or slice it, all of which break the one promise a stack makes: last in, first out. (Java made exactly this mistake: its Stack class extends Vector.)\n\nComposition fixes it: the Stack holds a list privately and exposes only push(), pop() and peek(). Users can't break it, and the list could later be swapped for something else without anyone noticing.\n\nThe general lesson: inherit only for a true "is a kind of", where the child can honour every promise the parent makes. "Uses one internally" is composition.`,
        },
    },
    'sd5-t2': {
        explain: {
            answer: `Two phones. In the first, the camera is moulded into the case. To get a better camera you need a whole new phone: that is inheritance, where behaviour is baked into the class, and changing it means a new subclass. In the second, the camera is a module that clicks into a standard slot. To upgrade, you swap the module; the rest of the phone doesn't change, and you can test a module on its own. That is composition: the object holds a separate part, behind an interface (the slot), and the part can be swapped, even while the program runs.\n\nWith inheritance, every combination of features needs its own class (FlyingQuackingDuck, FlyingSqueakingDuck…). With composition, you combine small parts freely: a duck has a way of flying and a way of quacking.`,
        },
        draw: {
            answer: `The Duck has its two behaviours (the diamond means it holds them). Each behaviour is an interface, and the small classes below implement it (the dotted line with a hollow triangle). A rubber duck is just Duck(NoFly(), Squeak()): no new subclass needed.`,
            code: py`
                Duck
                 - flyer:   FlyBehaviour
                 - quacker: QuackBehaviour
                 + perform()
                   ◆ has a                ◆ has a
                   │                      │
                   ▼                      ▼
                 «interface»            «interface»
                 FlyBehaviour           QuackBehaviour
                  + fly()                + quack()
                   △       △              △        △
                   ┊       ┊              ┊        ┊
                 Wings   NoFly          Quack    Squeak
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `With inheritance, every mix of channels needs its own class: with email, SMS and push, that is up to 7 classes (every non-empty combination of 3). With composition, there is one Notifier holding a list of channels, and one small class per channel. Any combination is just a different list, and a new channel is one new class.`,
            code: py`
                from abc import ABC, abstractmethod


                class Channel(ABC):
                    @abstractmethod
                    def send(self, user, message): ...


                class EmailChannel(Channel):
                    def send(self, user, message):
                        return f"email to {user}: {message}"


                class SmsChannel(Channel):
                    def send(self, user, message):
                        return f"sms to {user}: {message}"


                class Notifier:
                    def __init__(self, channels):
                        self.channels = list(channels)           # has many channels

                    def notify(self, user, message):
                        return [channel.send(user, message) for channel in self.channels]


                print(Notifier([EmailChannel(), SmsChannel()]).notify("priya", "Your order shipped"))
                # ['email to priya: Your order shipped', 'sms to priya: Your order shipped']


                class PushChannel(Channel):                      # a new channel: no combination classes
                    def send(self, user, message):
                        return f"push to {user}: {message}"


                print(Notifier([SmsChannel(), PushChannel()]).notify("tom", "Code 4821"))
                # ['sms to tom: Code 4821', 'push to tom: Code 4821']
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `When there is a true "is a kind of" relationship, the child can keep every promise the parent makes, and they share real behaviour:\n\n• Exception classes: class PaymentDeclined(PaymentError). Code that catches PaymentError should catch every kind of payment error. This is exactly what inheritance is for.\n• Framework extension points: a test class extends unittest.TestCase, or a web view extends the framework's base view. The framework is designed to be extended this way and calls your overrides.\n• Template method: the parent fixes the steps of an algorithm and the children fill in one or two of them (for example, a report that always loads, formats and saves, where only the formatting differs).\n• Shallow, stable hierarchies you own: one or two levels, unlikely to grow.\n\nThe warning signs that composition would be better: a hierarchy getting deeper, classes for combinations of features, or a child overriding a method to do nothing.`,
        },
    },
    'sd5-t3': {
        explain: {
            answer: `In a restaurant, the chef cooks, the cashier takes payments and the cleaner cleans. When a new tax rule arrives, only the cashier changes how they work; the kitchen carries on undisturbed.\n\nIf the chef also did the accounts, every tax change would interrupt the cooking, and a mistake in the accounts could ruin dinner service. That is a class with several responsibilities: a change for one reason (tax) risks breaking something unrelated (cooking).\n\nThe single responsibility principle says each class should have one reason to change, meaning one job, owned by one kind of change. An Invoice works out totals (changes when pricing rules change); a repository saves it (changes when the database changes); an emailer sends it (changes when the email changes).`,
        },
        draw: {
            answer: `Before, one class changes for three unrelated reasons, and a change to the email template means redeploying, and risking, the tax logic. After, each class has one reason to change, and each can be tested on its own (the repository with a test database, the emailer with a fake sender).`,
            code: py`
                Before: one class, three reasons to change
                ┌───────────────────────┐
                │ Invoice               │  pricing and tax rules
                │  + total()            │  the database
                │  + save_to_db()       │  the email template
                │  + email_to_customer()│
                └───────────────────────┘

                After: one reason each
                ┌────────────┐  ┌───────────────────┐  ┌────────────────┐
                │ Invoice    │  │ InvoiceRepository │  │ InvoiceEmailer │
                │  + total() │  │  + save(invoice)  │  │  + send(invoice)│
                └────────────┘  └───────────────────┘  └────────────────┘
                 pricing          the database           the email
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Four jobs, four classes, each with one reason to change:\n• UserValidator.validate(email, password): the sign-up rules.\n• PasswordHasher.hash(password): the hashing algorithm.\n• UserRepository.save(user) and exists(email): the database.\n• WelcomeEmailer.send(user): the email's wording or provider.\n\nA thin UserRegistration.register(email, password) coordinates them in order and holds no rules of its own. Each part can be swapped or tested alone: here the repository and the emailer are in-memory stand-ins.`,
            code: py`
                import hashlib
                import os
                import re


                class UserValidator:                        # changes when the sign-up rules change
                    def validate(self, email, password):
                        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[a-z]+", email):
                            raise ValueError("invalid email")
                        if len(password) < 10:
                            raise ValueError("password too short")


                class PasswordHasher:                       # changes when the hashing algorithm changes
                    def hash(self, password):
                        salt = os.urandom(16)
                        key = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
                        return salt.hex() + "$" + key.hex()


                class UserRepository:                       # changes when the database changes
                    def __init__(self):
                        self.users = {}

                    def exists(self, email):
                        return email in self.users

                    def save(self, user):
                        self.users[user["email"]] = user


                class WelcomeEmailer:                       # changes when the email changes
                    def __init__(self):
                        self.sent = []

                    def send(self, user):
                        self.sent.append(f"Welcome, {user['email']}!")


                class UserRegistration:                     # only coordinates the steps
                    def __init__(self, validator, hasher, repository, emailer):
                        self.validator, self.hasher = validator, hasher
                        self.repository, self.emailer = repository, emailer

                    def register(self, email, password):
                        self.validator.validate(email, password)
                        if self.repository.exists(email):
                            raise ValueError("email already registered")
                        user = {"email": email, "password_hash": self.hasher.hash(password)}
                        self.repository.save(user)
                        self.emailer.send(user)
                        return user


                emailer = WelcomeEmailer()
                registration = UserRegistration(UserValidator(), PasswordHasher(), UserRepository(), emailer)
                registration.register("priya@mail.com", "correct horse battery")
                print(emailer.sent)                         # ['Welcome, priya@mail.com!']
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• When the pieces always change together. If every change touches the same three classes, they were one responsibility, and splitting them only scatters it: you now open three files to follow one idea.\n• When the classes become too small to mean anything: lots of one-method classes that just pass the call along ("ravioli code"). Following one request means jumping through ten files.\n• When you split early, on guesses. Before you know what actually changes, you will often split along the wrong lines, and then have to change several classes for every request.\n• When the wiring costs more than the class: every split adds construction, dependency passing and names to remember.\n\nThe test is "different reasons to change", meaning different people or rules that change at different times, not "this class has more than 100 lines".`,
        },
    },
    'sd5-t4': {
        explain: {
            answer: `With a power strip, you add a new device by plugging it in. You don't rewire the house, and the kettle and the lamp that are already plugged in aren't affected.\n\nThe open/closed principle says code should work the same way: open for extension (you can add new behaviour), but closed for modification (you don't edit code that already works). The strip's sockets are the interface: every device has the same plug.\n\nIn code: a price calculator that loops over "discount rules", each with an apply() method. A new student discount is a new rule class plugged into the list. Compare that with a long if/elif on the discount type, which you must edit, and might break, every time a new kind appears.`,
        },
        draw: {
            answer: `final_price depends only on the DiscountRule interface. Each concrete rule implements apply() its own way. A new rule is a new box at the bottom; nothing above it changes.`,
            code: py`
                final_price(price, rules) ── uses ──► DiscountRule
                                                      + apply(price)
                                                           △
                                     ┌─────────────────────┼─────────────────────┐
                                SaleDiscount        StudentDiscount         (new rules
                                apply: price × 0.9  apply: price − £5        plug in here)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Before, a single function had an if/elif branch per method, so adding "drone" meant editing it (and retesting every branch). After, each method is its own class behind a Shipping interface, and the function just looks the method up in a registry. Adding drone delivery is one new class and one line that registers it; shipping_cost and the existing methods are untouched.`,
            code: py`
                from abc import ABC, abstractmethod


                class Shipping(ABC):
                    @abstractmethod
                    def cost(self, weight_kg): ...


                class Standard(Shipping):
                    def cost(self, weight_kg):
                        return 3.0 + 0.5 * weight_kg


                class Express(Shipping):
                    def cost(self, weight_kg):
                        return 8.0 + 1.0 * weight_kg


                class International(Shipping):
                    def cost(self, weight_kg):
                        return 15.0 + 2.5 * weight_kg


                METHODS = {"standard": Standard(), "express": Express(), "international": International()}


                def shipping_cost(method, weight_kg):       # never edited again
                    return METHODS[method].cost(weight_kg)


                print(shipping_cost("express", 2))           # 10.0


                class Drone(Shipping):                       # the new method: one class...
                    def cost(self, weight_kg):
                        if weight_kg > 2:
                            raise ValueError("too heavy for a drone")
                        return 12.0


                METHODS["drone"] = Drone()                   # ...and one line to register it
                print(shipping_cost("drone", 1.5))           # 12.0
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• Two cases that will probably never become three: VAT on or off, a guest or a member. One if is clearer than an interface and two classes.\n• Code you own and can easily change: a private function in one service. If a third case appears, refactor then; editing your own code isn't a crime.\n• When you don't yet know how it will vary. Plug-in points built on guesses usually end up in the wrong place, and make the real change harder (YAGNI: you aren't gonna need it).\n• When it is really data, not behaviour: shipping prices that differ only in numbers belong in a table or config, not in one class per row.\n• Scripts and prototypes that will be thrown away.\n\nApply it where change is frequent or expected (pricing rules, payment methods, plug-ins), or where other teams or customers extend your code without being able to edit it.`,
        },
    },
    'sd5-t5': {
        explain: {
            answer: `When a teacher is off sick, a substitute takes the class, and the school's timetable carries on as normal: maths at 9, the lesson happens. Nobody has to check who is teaching today. But if the substitute refuses to teach maths, or teaches it only to half the class, the timetable breaks, and the school has to start checking "is this the substitute?" before every lesson.\n\nThe Liskov substitution principle says a subclass must be usable anywhere its parent is expected, with no surprises: it accepts at least the same inputs, gives at least the same results, and keeps the same promises. The classic failure is a Square that extends a changeable Rectangle. Code that sets width 5 and height 4 expects an area of 20; the Square keeps its sides equal and gives 16. The "substitute" broke a promise, so it isn't a valid substitute.`,
        },
        draw: {
            answer: `Rectangle and Square are both Shapes, but neither is a kind of the other, and Shape doesn't promise set_width or set_height. Each class keeps only the promises it can honour. Code that needs to resize width and height separately asks for a Rectangle; code that only needs an area asks for a Shape.`,
            code: py`
                            «interface»
                               Shape
                            + area()
                           △         △
                           ┊         ┊
                   Rectangle         Square
                   - width           - side
                   - height
                   + set_size(w, h)  + set_side(s)
                   + area() = w × h  + area() = side²

                No Square → Rectangle arrow: a square
                can't keep a rectangle's promise
                that width and height change separately.
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `The first half is the lesson's code: resize() works for a Rectangle and fails its check for a Square, whose area comes out as 16.\n\nThe redesign stops Square pretending to be a Rectangle. Both implement a Shape interface that promises only area(); only Rectangle has set_size(). resize() asks for a Rectangle, so a Square can no longer be passed in, and the check always holds. Both can still go anywhere a Shape is expected.`,
            code: py`
                from abc import ABC, abstractmethod


                # The original design: Square extends Rectangle.
                class OldRectangle:
                    def __init__(self, w, h): self.w, self.h = w, h
                    def set_width(self, w): self.w = w
                    def set_height(self, h): self.h = h
                    def area(self): return self.w * self.h


                class OldSquare(OldRectangle):
                    def set_width(self, w): self.w = self.h = w
                    def set_height(self, h): self.w = self.h = h


                def old_resize(r):
                    r.set_width(5)
                    r.set_height(4)
                    assert r.area() == 20


                old_resize(OldRectangle(2, 3))
                square = OldSquare(3, 3)
                try:
                    old_resize(square)
                except AssertionError:
                    print("the check fails for a square: area =", square.area())   # ... area = 16


                # The redesign: both are Shapes; only a Rectangle can change width and height separately.
                class Shape(ABC):
                    @abstractmethod
                    def area(self): ...


                class Rectangle(Shape):
                    def __init__(self, w, h): self.w, self.h = w, h
                    def set_size(self, w, h): self.w, self.h = w, h
                    def area(self): return self.w * self.h


                class Square(Shape):
                    def __init__(self, side): self.side = side
                    def set_side(self, side): self.side = side
                    def area(self): return self.side ** 2


                def resize(r: Rectangle):
                    r.set_size(5, 4)
                    assert r.area() == 20                    # holds for every Rectangle


                resize(Rectangle(2, 3))
                print([shape.area() for shape in [Rectangle(2, 3), Square(3)]])     # [6, 9]
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Because an isinstance check is what calling code does when it can no longer trust the parent type.\n\nIf every subclass kept the parent's promises, the caller would just call the method and get the right behaviour (polymorphism). When one subclass breaks a promise (a Square that can't set width alone, a ReadOnlyFile that throws on write()), callers get bitten, and the quick fix is a special case: "if isinstance(shape, Square): do something different". The check is the symptom; the broken substitution is the cause.\n\nThose checks then spread: every caller needs one, and every new subclass that breaks the rules needs another branch everywhere, which also breaks the open/closed principle. The real fix is to change the hierarchy (stop the bad inheritance, split the interface), not to teach every caller about the exception.`,
        },
    },
    'sd5-t6': {
        explain: {
            answer: `A TV remote with 80 buttons, when most people only use power, volume and channel. Everyone has to cope with the buttons they never use, and a remote that must support all 80 is expensive to make. Better: a simple remote for most people, and an advanced one for those who want it.\n\nThe interface segregation principle says the same about interfaces: don't force a class to implement methods it doesn't need. A Machine interface with print(), scan() and fax() forces a basic printer to write fake scan() and fax() methods that just throw errors, and any change to fax() touches every printer. Split it into small interfaces by what their users actually need (Printer, Scanner, Fax), and let each class implement only the ones that are true for it.`,
        },
        draw: {
            answer: `Before, one fat interface forces BasicPrinter to fake two methods that throw errors. After, each class implements only the interfaces that are true for it, and code that only prints asks for a Printer, so it works with both machines.`,
            code: py`
                Before
                  «interface» Machine
                   + print()  + scan()  + fax()
                       △                     △
                  BasicPrinter          OfficeMachine
                   print() ✓             print() ✓
                   scan()  ✗ raises      scan()  ✓
                   fax()   ✗ raises      fax()   ✓

                After
                  «interface»   «interface»   «interface»
                   Printer       Scanner        Fax
                   + print()     + scan()       + fax()
                      △  △          △             △
                      ┊  └┄┄┄┄┄┐    ┊   ┌┄┄┄┄┄┄┄┄┄┘
                  BasicPrinter  OfficeMachine
                  (Printer)     (Printer, Scanner, Fax)
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Three small interfaces, one per ability. A human worker implements all three; a robot implements only Workable, so it has no fake eat() that does nothing. Code that runs a shift asks only for Workable, and the lunch break only for Eater, so each part of the program depends only on what it uses.`,
            code: py`
                from abc import ABC, abstractmethod


                class Workable(ABC):
                    @abstractmethod
                    def work(self): ...


                class Eater(ABC):
                    @abstractmethod
                    def eat(self): ...


                class Sleeper(ABC):
                    @abstractmethod
                    def sleep(self): ...


                class HumanWorker(Workable, Eater, Sleeper):
                    def work(self): return "writes code"
                    def eat(self): return "has lunch"
                    def sleep(self): return "sleeps 8 hours"


                class RobotWorker(Workable):                     # no eat() or sleep() to fake
                    def work(self): return "welds car doors"


                def run_shift(workers):                          # needs only work()
                    return [worker.work() for worker in workers]


                def lunch_break(eaters):                         # needs only eat()
                    return [eater.eat() for eater in eaters]


                print(run_shift([HumanWorker(), RobotWorker()]))    # ['writes code', 'welds car doors']
                print(lunch_break([HumanWorker()]))                 # ['has lunch']
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Signs an interface has been split too far:\n• The small interfaces are always used together. Every class implements all four, and every caller needs all four, so they are really one role.\n• Functions need several parameters for one object: process(doc: Printable, s: Stapleable, c: Collatable) where all three are the same machine.\n• You can't name them as roles. Good interfaces are named after what a client needs ("Printer", "PaymentMethod"); if you are reduced to "HasName" and "HasId", you are splitting by method instead of by client.\n• There are more interfaces than real implementations, and each has exactly one method and one implementer.\n\nThe principle is about clients: split when different callers need different parts. If no caller ever uses one part without the others, merge them back.`,
        },
    },
    'sd5-t7': {
        explain: {
            answer: `Your lamp plugs into a standard wall socket. It doesn't depend on a particular power station; it depends on the standard ("230 V, this plug shape"). So you can switch energy supplier, or run the house on solar panels, without rewiring the lamp. Both sides depend on the standard, not on each other.\n\nDependency inversion says the same about code: high-level code (OrderService, the business rules) shouldn't depend on low-level details (a MySQL database class). Both should depend on an abstraction (an OrderRepository interface). OrderService is given a repository instead of creating one: a Postgres one in production, an in-memory one in tests. Swapping the database, or testing without one, needs no change to OrderService.`,
        },
        draw: {
            answer: `The key detail is the direction of the arrows. OrderService points at the interface, and so do both implementations, so the business code no longer points at the database code. That is the "inversion". The wiring code at startup picks the concrete class and passes it in.`,
            code: py`
                OrderService ── depends on ──► «interface»
                 + place(order)                 OrderRepository
                                                 + save(order)
                                                    △        △
                                                    ┊        ┊ implement
                                 PostgresOrderRepository   InMemoryOrderRepository
                                 (production)              (tests)

                main() / start-up code:
                  repo = PostgresOrderRepository(connection)
                  service = OrderService(repo)        ← injected
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `NotificationService depends only on MessageSender. EmailSender is the real implementation (it would be given an SMTP client in production, so it isn't run here); FakeSender just records what it was asked to send. The test hands the service a FakeSender and checks exactly one message went out, with no email server, network or mocking library needed.`,
            code: py`
                from abc import ABC, abstractmethod


                class MessageSender(ABC):
                    @abstractmethod
                    def send(self, to, text): ...


                class EmailSender(MessageSender):                # the real one, used in production
                    def __init__(self, smtp_client):
                        self.smtp = smtp_client

                    def send(self, to, text):
                        self.smtp.sendmail("noreply@shop.com", to, text)


                class FakeSender(MessageSender):                 # for tests: just records messages
                    def __init__(self):
                        self.sent = []

                    def send(self, to, text):
                        self.sent.append((to, text))


                class NotificationService:
                    def __init__(self, sender: MessageSender):   # injected, never created inside
                        self.sender = sender

                    def order_shipped(self, email, order_id):
                        self.sender.send(email, f"Order {order_id} has shipped")


                def test_order_shipped_sends_one_message():
                    fake = FakeSender()
                    NotificationService(fake).order_shipped("priya@mail.com", 105)
                    assert fake.sent == [("priya@mail.com", "Order 105 has shipped")]


                test_order_shipped_sends_one_message()
                print("test passed")                             # test passed
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `• There will only ever be one implementation, and it is fast and in-process (a price calculator, a date formatter). An interface adds a file and a jump for nothing. Injecting the concrete class still keeps it testable.\n• In Python, duck typing already lets you pass any object with the right methods, and test tools can stand in for a class, so a formal ABC is often optional.\n• Small scripts, prototypes and glue code that will be rewritten anyway.\n• Simple value objects (Money, an Address): there is nothing to swap.\n\nWorth it at the boundaries with slow, external or changing things: databases, other services, payment providers, email and SMS, the clock, the file system. Those are exactly the things you want to replace in tests, and the ones most likely to change.`,
        },
    },
    'sd5-t8': {
        explain: {
            answer: `• Association ("uses", "knows about"): a doctor and a patient. Each exists on its own; they are linked for a while. A plain line.\n• Aggregation ("has, but the part lives on"): a football team has players. If the team folds, the players still exist and can join another team. A line with a hollow diamond at the team.\n• Composition ("owns; the part dies with the whole"): a house has rooms. Demolish the house and its rooms are gone too. A line with a filled diamond at the house.\n• Inheritance ("is a kind of"): a dog is an animal. A solid line with a hollow triangle pointing at the parent.\n• Realisation ("implements an interface"): a phone charger implements the USB-C standard; any USB-C device can use it. A dotted line with a hollow triangle pointing at the interface.\n\nMultiplicity says how many: 1, 0..1, * (many) or 1..* (at least one), written at each end of the line.`,
        },
        draw: {
            answer: `Book is the title in the catalogue; BookCopy is one physical copy, which is what gets lent. The library owns its catalogue (composition), but members exist without it (aggregation). A Loan links one Member to one BookCopy for a period of time (associations), and a member can have up to max_loans active loans.`,
            code: py`
                ◆── composition   ◇── aggregation   ─── association

                Library
                 + lend(member, copy) → Loan
                 + return_copy(loan)
                   │
                   ├ 1 ◆──── * Book
                   │          isbn, title, author
                   │            │
                   │            └ 1 ◆──── 1..* BookCopy
                   │                        copy_id, available
                   │                              │ 1
                   └ 1 ◇──── * Member             │
                              member_id, name     │
                              max_loans = 3       │
                                │ 1               │
                                └──── 0..* Loan * ┘
                                       borrowed_on, due_on,
                                       returned_on
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `Each class from the diagram becomes a dataclass with the attributes shown. Composition becomes a list the owner creates and holds (a Book's copies); association becomes a reference to an object that lives independently (a Loan's member and copy). Library.lend() enforces the two rules the diagram implies: a member can't exceed max_loans, and a copy can't be lent twice.`,
            code: py`
                from dataclasses import dataclass, field
                from datetime import date, timedelta


                @dataclass
                class BookCopy:
                    copy_id: str
                    available: bool = True


                @dataclass
                class Book:
                    isbn: str
                    title: str
                    author: str
                    copies: list[BookCopy] = field(default_factory=list)      # composition


                @dataclass
                class Member:
                    member_id: int
                    name: str
                    max_loans: int = 3
                    loans: list["Loan"] = field(default_factory=list)


                @dataclass
                class Loan:
                    member: Member                                            # association
                    copy: BookCopy                                            # association
                    borrowed_on: date
                    due_on: date
                    returned_on: date | None = None


                @dataclass
                class Library:
                    books: dict[str, Book] = field(default_factory=dict)      # composition
                    members: dict[int, Member] = field(default_factory=dict)  # aggregation

                    def lend(self, member, copy, today):
                        active = [loan for loan in member.loans if loan.returned_on is None]
                        if len(active) >= member.max_loans:
                            raise ValueError("loan limit reached")
                        if not copy.available:
                            raise ValueError("copy is already on loan")
                        copy.available = False
                        loan = Loan(member, copy, today, today + timedelta(days=21))
                        member.loans.append(loan)
                        return loan

                    def return_copy(self, loan, today):
                        loan.returned_on = today
                        loan.copy.available = True


                library = Library()
                dune = Book("978-0441013593", "Dune", "Frank Herbert", [BookCopy("dune-1"), BookCopy("dune-2")])
                library.books[dune.isbn] = dune
                asha = Member(1, "Asha")
                library.members[asha.member_id] = asha

                loan = library.lend(asha, dune.copies[0], date(2024, 3, 1))
                print(loan.due_on, dune.copies[0].available)     # 2024-03-22 False
                library.return_copy(loan, date(2024, 3, 10))
                print(dune.copies[0].available)                  # True
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `Enough to agree the design, and no more. Spend about 5 minutes on it.\n\nInclude:\n• the 5 to 8 main classes (the nouns from the use cases);\n• the attributes that matter to the problem (a Spot's size and whether it is free), not every field;\n• the methods used in the core flows (park(), leave(), calculate_fee());\n• relationships, with multiplicity where it matters ("a Floor has many Spots");\n• interfaces wherever behaviour varies (PricingStrategy), since that is where the design decisions are.\n\nLeave out: getters and setters, private helpers, every field's type, constructors, and fine UML details (visibility symbols, exact arrow styles), unless asked.\n\nThe diagram is a tool for the conversation: sketch it, check it with the interviewer, then refine it as you code. Interviewers mark the decisions (what is a class, what varies, who owns what), not drawing precision.`,
        },
    },
    'sd5-t9': {
        explain: {
            answer: `Two people are filling in the same paper booking form at the same time. Both read "3 seats left". Both write their booking and change it to "2 seats left". Two seats have gone, but the form says only one did: one booking has silently disappeared, and the hall may be overbooked.\n\nThat is a race condition: the result depends on the exact timing of two actors, because "read the value, work out the new one, write it back" is several steps, and the other person can slip in between them.\n\nA lock is the rule that only one person may hold the form at a time. The second person waits until the first has finished writing, then reads "2 seats left" and writes "1". The read-and-write becomes one indivisible step (a critical section).`,
        },
        draw: {
            answer: `The race happens because both threads read before either writes, so each writes a value based on stale data. With the lock, thread B can't even read until A has written and released, so its read sees A's result.`,
            code: py`
                Without a lock (count starts at 3)
                time   Thread A            Thread B
                 t1    read count → 3
                 t2                        read count → 3
                 t3    write 3 + 1 = 4
                 t4                        write 3 + 1 = 4
                Result: 4. Expected 5: one update was lost.

                With a lock
                 t1    take the lock
                 t2    read count → 3      wants the lock: waits…
                 t3    write 4
                 t4    release the lock
                 t5                        take the lock
                 t6                        read count → 4
                 t7                        write 5, release
                Result: 5.
            `,
            codeLanguage: 'text',
        },
        apply: {
            answer: `In CPython, count += 1 rarely shows the race on its own, because the interpreter seldom switches threads in the middle of it. Splitting it into read, a forced switch (time.sleep(0)) and write makes the race happen every time. Without the lock, updates are lost: the total comes out below 4,000, and different on every run. With the lock, it is always 4,000.\n\nThe deadlock: thread 1 takes lock A then wants B, while thread 2 takes B then wants A. Each waits for the other forever. (Here a timeout lets the program report it instead of hanging.) The fix is to always take locks in the same order: both threads take A, then B, so one simply waits for the other to finish.`,
            code: py`
                import threading
                import time

                count = 0
                lock = threading.Lock()


                def add_many(use_lock, n=1000):
                    global count
                    for _ in range(n):
                        if use_lock:
                            with lock:
                                current = count
                                time.sleep(0)        # let another thread run here
                                count = current + 1
                        else:
                            current = count
                            time.sleep(0)
                            count = current + 1


                def run(use_lock):
                    global count
                    count = 0
                    threads = [threading.Thread(target=add_many, args=(use_lock,)) for _ in range(4)]
                    for t in threads:
                        t.start()
                    for t in threads:
                        t.join()
                    return count


                print("without the lock:", run(False) < 4000)    # without the lock: True (updates were lost)
                print("with the lock:", run(True))               # with the lock: 4000


                # A deadlock: two threads take the same two locks in opposite orders.
                a, b = threading.Lock(), threading.Lock()
                results = []


                def take(first, second, name):
                    with first:
                        time.sleep(0.1)                          # both threads now hold one lock each
                        if second.acquire(timeout=1):            # a real deadlock would wait forever
                            second.release()
                            results.append(f"{name}: done")
                        else:
                            results.append(f"{name}: stuck (deadlock)")


                def both(order_1, order_2):
                    results.clear()
                    threads = [threading.Thread(target=take, args=(*order_1, "thread 1")),
                               threading.Thread(target=take, args=(*order_2, "thread 2"))]
                    for t in threads:
                        t.start()
                    for t in threads:
                        t.join()
                    return sorted(results)


                print(both((a, b), (b, a)))    # ['thread 1: stuck (deadlock)', 'thread 2: stuck (deadlock)']
                print(both((a, b), (a, b)))    # ['thread 1: done', 'thread 2: done']: same order, no deadlock
            `,
            codeLanguage: 'python',
        },
        tradeoffs: {
            answer: `A threading.Lock lives in the memory of one Python process. Ten servers run ten separate processes, each with its own lock, and none of them knows about the others.\n\nTwo customers click "book seat F12" at the same moment; the load balancer sends one request to server 3 and the other to server 7. Each server takes its own lock (which nobody else is holding), each checks that F12 is free, and each books it. The seat is sold twice, and the locks did nothing.\n\nThe check-and-book must happen at a single place that every server shares:\n• The database (best): a conditional update, UPDATE seats SET booked_by = :user WHERE seat_id = :seat AND booked_by IS NULL, then check one row changed; or a row lock with SELECT … FOR UPDATE inside a transaction; or a UNIQUE constraint on (show_id, seat_id) in the bookings table, so the second insert fails.\n• A distributed lock (Redis, or etcd/ZooKeeper), with a time limit and a fencing token, for work that isn't a single database write.`,
        },
    },
};
