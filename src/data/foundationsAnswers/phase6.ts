import type { TopicAnswers } from '../foundations';
import { py } from './code';

// Phase 6 · Systems and scale. One good answer for each practice exercise.
// Answers use a GPU when there is one and fall back to the CPU otherwise, so
// they run on a laptop; the GPU numbers they mention are typical, not measured
// here. Triton needs an NVIDIA GPU: a free Colab GPU is enough.

export const phase6Answers: Record<string, TopicAnswers> = {
    'f6-t1': {
        derive: {
            answer: `Arithmetic intensity = FLOPs ÷ bytes moved to and from memory. fp32 is 4 bytes per number.\n\nAdding two vectors of 1 million numbers: 1 million additions. Bytes: read 2 × 1M × 4 = 8 MB, write 1M × 4 = 4 MB, so 12 MB.\nIntensity = 1,000,000 ÷ 12,000,000 ≈ 0.08 FLOPs per byte.\n\nMultiplying two 1,024 × 1,024 matrices: each of the 1,024² outputs needs 1,024 multiplies and 1,024 adds, so 2 × 1,024³ ≈ 2.15 billion FLOPs. Bytes, at best (read A and B once, write C once): 3 × 1,024² × 4 ≈ 12.6 MB.\nIntensity ≈ 2.15 × 10⁹ ÷ 1.26 × 10⁷ ≈ 171 FLOPs per byte.\n\nA modern GPU can do roughly 10 to 50 fp32 FLOPs (far more in bf16) in the time it moves one byte. So the vector add is memory-bound by a wide margin: the maths units sit idle waiting for data. The matrix multiply is compute-bound: there is enough work per byte to keep them busy. The bigger the matrices, the higher the intensity, which is why large matrix multiplications are where GPUs shine.`,
        },
        build: {
            answer: `Time torch.matmul at sizes from 64 to 2,048 (more on a GPU), counting 2n³ FLOPs per multiply. Warm up first, repeat several times, and on a GPU call torch.cuda.synchronize() before stopping the clock (see the profiling topic for why).\n\nThe curve has the same shape on every device: tiny matrices reach a small fraction of the peak, because fixed costs (launching the operation, moving small amounts of data) dominate; as the size grows, the achieved FLOPs per second climbs and then levels off near the hardware's limit. On the laptop used here (an Apple M-series machine), the CPU levels off at about 1.5 TFLOP/s, thanks to built-in matrix units, while the small built-in GPU starts slower (37 GFLOP/s at n = 64) and keeps climbing, to about 4 TFLOP/s at n = 2,048. A data-centre GPU reaches tens of TFLOP/s in fp32 and hundreds in bf16. The lesson: GPUs only pay off when you give them big operations, which is one reason for batching.`,
            code: py`
                import time
                import torch
                import matplotlib.pyplot as plt

                devices = ["cpu"] + (["cuda"] if torch.cuda.is_available() else []) + (["mps"] if torch.backends.mps.is_available() else [])
                sync = {"cuda": torch.cuda.synchronize, "mps": torch.mps.synchronize, "cpu": lambda: None}
                sizes = [64, 128, 256, 512, 1024, 2048]
                for device in devices:
                    rates = []
                    for n in sizes:
                        a, b = torch.randn(n, n, device=device), torch.randn(n, n, device=device)
                        for _ in range(3):
                            a @ b                                              # warm up
                        sync[device]()
                        repeats = max(1, int(2e9 // (2 * n**3)))
                        start = time.perf_counter()
                        for _ in range(repeats):
                            a @ b
                        sync[device]()
                        rates.append(2 * n**3 * repeats / (time.perf_counter() - start) / 1e9)
                    print(device, [f"{n}: {r:.0f} GFLOP/s" for n, r in zip(sizes, rates)])
                    plt.plot(sizes, rates, marker="o", label=device)
                plt.xscale("log"); plt.xlabel("matrix size n"); plt.ylabel("GFLOP/s achieved"); plt.legend(); plt.show()
            `,
        },
        break: {
            answer: `1,000 tiny additions of 1,000 numbers do the same total work as one addition of 1 million numbers, but take several times longer: in the run below, about 4 times on this laptop's CPU, where each call costs about a microsecond. On a GPU the gap is usually far bigger, because every call also launches a kernel, which costs several microseconds by itself.\n\nWhy: every operation has a fixed cost that has nothing to do with its size. Python has to call into PyTorch, PyTorch checks the arguments, picks a kernel and allocates the output, and on a GPU it also launches the kernel, which costs several microseconds by itself. For 1,000 numbers the actual adding takes well under a microsecond, so almost all the time is overhead, paid 1,000 times. One big operation pays it once.\n\nThis is why good GPU code avoids Python loops over small pieces, batches work together, and fuses several small operations into one kernel.`,
            code: py`
                import time
                import torch

                device = "cuda" if torch.cuda.is_available() else "cpu"
                sync = torch.cuda.synchronize if device == "cuda" else (lambda: None)
                small = [(torch.randn(1000, device=device), torch.randn(1000, device=device)) for _ in range(1000)]
                big_a, big_b = torch.randn(1_000_000, device=device), torch.randn(1_000_000, device=device)

                sync(); start = time.perf_counter()
                for a, b in small:
                    a + b
                sync(); tiny = time.perf_counter() - start

                start = time.perf_counter()
                big_a + big_b
                sync(); one = time.perf_counter() - start
                print(f"{device}: 1,000 tiny ops {tiny * 1000:.2f} ms, 1 big op {one * 1000:.3f} ms, {tiny / one:.0f}x slower")
            `,
        },
        explain: {
            answer: `Picture a huge kitchen with 1,000 fast chefs and one narrow door for ingredients. If a dish needs many ingredients but little cooking per ingredient, like chopping one carrot each, the chefs spend most of their time waiting at the door: the kitchen is memory-bound, limited by how fast ingredients come in. If a dish needs a lot of cooking per ingredient, like a complex recipe from a few supplies, the chefs are busy all the time: it is compute-bound, limited by how fast they cook.\n\nA GPU is that kitchen: enormous compute, comparatively narrow memory bandwidth. Matrix multiplications are the complex recipes, which is why they run fast. Element-wise operations, such as adding, activations and normalisation, are the carrots, which is why fusing several of them into one trip through the door helps so much.`,
        },
    },
    'f6-t2': {
        derive: {
            answer: `125 million parameters:\nfp32 (4 bytes each): 125M × 4 = 500 MB.\nfp16 (2 bytes): 250 MB.\nbf16 (2 bytes): 250 MB.\n\nfp16 and bf16 take the same space; they differ in how the 16 bits are split. fp16 has more bits for precision but a small range (largest value about 65,504, and tiny values underflow to 0). bf16 has the same range as fp32 (up to about 3.4 × 10³⁸) but less precision. That is why bf16 is the usual choice for training: values almost never overflow or underflow, and neural networks tolerate the lower precision.`,
        },
        build: {
            answer: `Wrap the forward pass and loss in torch.autocast(device, dtype=torch.bfloat16). Matrix multiplications then run in bf16 while the weights, the optimiser and precision-sensitive operations (like softmax and the loss) stay in fp32; backward follows automatically.\n\nOn a modern NVIDIA GPU, bf16 typically trains 1.5 to 3 times faster than fp32 and uses noticeably less memory for activations, with a final loss that is essentially the same. On a laptop CPU, as in the run below, the loss is the same, but bf16 was about 20 times slower (13 s against 256 s for 400 steps): this CPU has no fast bf16 maths, so every operation pays for conversions and slow fallback code. Mixed precision is a GPU technique; measure on the hardware you will actually use.`,
            code: py`
                import time
                import torch
                from gpt import GPT, Config, get_batch, estimate_loss

                device = "cuda" if torch.cuda.is_available() else "cpu"
                for precision in ["fp32", "bf16"]:
                    torch.manual_seed(0)
                    model = GPT(Config()).to(device)
                    opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
                    if device == "cuda":
                        torch.cuda.reset_peak_memory_stats()
                    start = time.perf_counter()
                    for _ in range(400):
                        x, y = (t.to(device) for t in get_batch("train"))
                        with torch.autocast(device, dtype=torch.bfloat16, enabled=(precision == "bf16")):
                            _, loss = model(x, y)
                        opt.zero_grad(); loss.backward(); opt.step()
                    seconds = time.perf_counter() - start
                    memory = f", peak memory {torch.cuda.max_memory_allocated() / 1e6:.0f} MB" if device == "cuda" else ""
                    print(f"{precision} on {device}: {seconds:.1f} s for 400 steps, val loss {estimate_loss(model.cpu()):.3f}{memory}")
            `,
        },
        break: {
            answer: `In fp16, any number smaller than about 6 × 10⁻⁸ becomes exactly 0, and anything above 65,504 becomes inf. Gradients in a real network are often tiny (1e-6 to 1e-9 for many weights), so in plain fp16 a large share of them underflow to 0, and those weights simply stop learning. In the run below, the same gradient values kept in fp16 lose a large fraction to 0.\n\nThe gradient scaler (torch.amp.GradScaler) fixes this by multiplying the loss by a big number, such as 65,536, before backward. Every gradient is multiplied by the same factor, which lifts the tiny ones into fp16's range. Before the optimiser step it divides them back, in fp32. If any gradient overflowed to inf, it skips that step and halves the scale; if steps succeed for a while, it raises the scale again.\n\nbf16 has fp32's range, so it almost never needs a scaler, which is the main reason it replaced fp16 for training.`,
            code: py`
                import torch

                grads = torch.logspace(-10, -3, 8)                         # typical small gradient sizes
                print("fp32:          ", [f"{g:.0e}" for g in grads.tolist()])
                print("fp16:          ", [f"{g:.0e}" for g in grads.half().float().tolist()])          # tiny ones become 0
                scale = 65536.0
                print("fp16 x 65,536: ", [f"{g:.0e}" for g in (grads * scale).half().float().div(scale).tolist()])
                print("bf16:          ", [f"{g:.0e}" for g in grads.bfloat16().float().tolist()])
                print("fp16 overflow: ", torch.tensor(70000.0).half())     # inf: why the scaler skips such steps

                if torch.cuda.is_available():                              # the real training loop with a scaler
                    model = torch.nn.Linear(10, 1).cuda()
                    opt, scaler = torch.optim.SGD(model.parameters(), lr=0.1), torch.amp.GradScaler()
                    x, y = torch.randn(64, 10, device="cuda"), torch.randn(64, 1, device="cuda")
                    with torch.autocast("cuda", dtype=torch.float16):
                        loss = torch.nn.functional.mse_loss(model(x), y)
                    scaler.scale(loss).backward(); scaler.step(opt); scaler.update()
                    print("scale now:", scaler.get_scale())
            `,
        },
        explain: {
            answer: `Writing prices rounded to the nearest pound instead of exact to the penny. It is quicker to write, takes less space, and for most purposes the answer comes out the same. Mixed precision does most of a network's maths in 16-bit numbers, which are half the size of 32-bit ones, so they move twice as fast through memory and modern GPUs multiply them much faster.\n\nBut you keep the accounts that must add up exactly in full pennies. In mixed precision the 32-bit parts are: the master copy of the weights (small updates would be lost if added to a rounded number), the optimiser's running averages, and sensitive sums like softmax, layer norm and the loss. bf16 is the rounding that keeps the full range of prices; fp16 rounds more finely but can't write very large or very small amounts, which is why it needs a gradient scaler.`,
        },
    },
    'f6-t3': {
        derive: {
            answer: `With Adam and mixed precision, the usual per-parameter cost is about 16 bytes:\n• 2 bytes: bf16 weights used in the forward and backward pass\n• 2 bytes: bf16 gradients\n• 4 bytes: fp32 master copy of the weights\n• 4 bytes: Adam's first moment (running mean of gradients), fp32\n• 4 bytes: Adam's second moment (running mean of squared gradients), fp32\n\n350 million × 16 bytes = 5.6 GB, before any activations.\n\nFor comparison, inference needs only the bf16 weights: 350M × 2 = 0.7 GB. Training needs 8 times as much before activations, and activations come on top, growing with batch size and sequence length; for long sequences they can be bigger than everything else. That is why a model you can run on a laptop may need a large GPU to train.`,
        },
        build: {
            answer: `On a GPU, torch.cuda.max_memory_allocated() after a training step gives the peak; reset it between runs. Without a GPU you can measure the part that changes with batch size directly: the activations that autograd saves for the backward pass. A saved-tensors hook sees every tensor saved during the forward pass, so summing their sizes gives the activation memory.\n\nThe result: activation memory grows in proportion to the batch size (double the batch, double the memory) and faster than proportionally with sequence length (8 times the length gives about 14 times the memory here), because some of what attention saves grows with the square of the length. The weights, gradients and optimiser states don't change at all. So when you run out of memory, the batch size and sequence length are the first things to cut.`,
            code: py`
                import torch
                import matplotlib.pyplot as plt
                from gpt import GPT, Config, get_batch

                def activation_bytes(model, batch_size, block_size):
                    total = 0
                    def pack(t):
                        nonlocal total
                        total += t.numel() * t.element_size()
                        return t
                    x, y = get_batch("train", block_size=block_size, batch_size=batch_size)
                    with torch.autograd.graph.saved_tensors_hooks(pack, lambda t: t):
                        _, loss = model(x, y)
                    loss.backward()
                    return total / 1e6

                torch.manual_seed(0)
                for name, values, make in [("batch size", [8, 16, 32, 64], lambda v: (v, 64)),
                                           ("sequence length", [32, 64, 128, 256], lambda v: (16, v))]:
                    results = []
                    for v in values:
                        b, t = make(v)
                        results.append(activation_bytes(GPT(Config(block_size=max(t, 64))), b, t))
                    print(name, [f"{v}: {mb:.0f} MB" for v, mb in zip(values, results)])
                    plt.plot(values, results, marker="o", label=name)
                plt.xlabel("value"); plt.ylabel("saved activations (MB)"); plt.legend(); plt.show()
                if torch.cuda.is_available():
                    print("GPU peak memory:", torch.cuda.max_memory_allocated() / 1e6, "MB")
            `,
        },
        break: {
            answer: `Raise the batch size and, on a GPU, you eventually get "CUDA out of memory". (On a CPU the machine just starts swapping and crawls, so don't try it there.) Two ways to keep the same effective batch:\n\nGradient accumulation: split the big batch into small micro-batches, run backward on each (dividing each loss by the number of micro-batches), and only call optimizer.step() after all of them. Gradients add up in .grad, so the result is the same update as one big batch, using the memory of one micro-batch, at the cost of time. The run below checks this: the accumulated gradient matches the big-batch gradient to about 1e-6.\n\nActivation checkpointing: don't save the activations inside each block during the forward pass; recompute them during backward. In the run below it cuts the saved activation memory about 10 times (153 MB to 15 MB), for roughly 30% more compute. Large-model training uses both, plus sharding the optimiser state across GPUs.`,
            code: py`
                import torch
                from torch.utils.checkpoint import checkpoint
                from gpt import GPT, Config, get_batch

                torch.manual_seed(0)
                model = GPT(Config(dropout=0.0))
                x, y = get_batch("train", batch_size=64)

                model.zero_grad(); model(x, y)[1].backward()
                big = model.head.weight.grad.clone()
                model.zero_grad()
                for xs, ys in zip(x.chunk(4), y.chunk(4)):                 # 4 micro-batches of 16
                    (model(xs, ys)[1] / 4).backward()                         # gradients add up in .grad
                print("accumulated vs big batch, max difference:", (model.head.weight.grad - big).abs().max().item())

                def saved_mb(use_checkpointing):
                    total = 0
                    def pack(t):
                        nonlocal total
                        total += t.numel() * t.element_size(); return t
                    with torch.autograd.graph.saved_tensors_hooks(pack, lambda t: t):
                        h = model.tok(x) + model.pos(torch.arange(x.shape[1]))
                        for block in model.blocks:
                            h = checkpoint(block, h, use_reentrant=False) if use_checkpointing else block(h)
                        loss = torch.nn.functional.cross_entropy(model.head(model.ln(h)).flatten(0, 1), y.flatten())
                    loss.backward()
                    return total / 1e6
                print(f"saved activations: normal {saved_mb(False):.0f} MB, with checkpointing {saved_mb(True):.0f} MB")
            `,
        },
        explain: {
            answer: `Moving house. It is not just the furniture you have to fit in the van. The furniture is the weights. You also need boxes to pack it in: the gradients, one for every weight. You need labels and notes about each box, saying where it goes and how fragile it is: the optimiser states, which for Adam take twice the space of the furniture itself. And while you pack, you need floor space to lay things out: the activations, which you need at the end to check everything, and which grow with how much you pack at once (the batch size).\n\nRunning a model (inference) is just living in the house: only the furniture. Training is moving house, which takes many times the space.`,
        },
    },
    'f6-t4': {
        derive: {
            answer: `Data parallelism, 8 GPUs, a model that fits on one: every GPU holds a full copy of the model. Each takes a different slice of the batch (8 slices), runs forward and backward on its own, and then all 8 average their gradients with an all-reduce. Every copy applies the same averaged update, so they stay identical. It scales the batch, not the model.\n\nTensor parallelism, a model that needs 4 GPUs: each big weight matrix is split across the 4 GPUs, for example by columns. For one layer, every GPU multiplies the input by its quarter of the matrix, then they exchange results (an all-reduce or all-gather) before the next layer. Very chatty, so it is used inside one machine with fast links.\n\nPipeline parallelism, 4 GPUs: the layers are split into 4 consecutive stages, layers 1 to 6 on GPU 0, 7 to 12 on GPU 1, and so on. Activations flow from stage to stage. To keep every GPU busy, the batch is cut into micro-batches that follow each other through the pipeline; the idle time at the start and end is the "bubble".\n\nLarge models combine them: tensor parallel within a machine, pipeline across machines, data parallel across groups, often with the optimiser state sharded too (FSDP or ZeRO).`,
            code: py`
                DATA PARALLEL (model fits on 1 GPU)        TENSOR PARALLEL (1 layer split 4 ways)
                GPU0: full model, batch slice 1 ┐          input ─┬▶ GPU0: W[:, 0:¼]  ┐
                GPU1: full model, batch slice 2 ├ all-reduce      ├▶ GPU1: W[:, ¼:½]  ├ gather ▶ next layer
                ...                             │ gradients       ├▶ GPU2: W[:, ½:¾]  │
                GPU7: full model, batch slice 8 ┘                 └▶ GPU3: W[:, ¾:1]  ┘

                PIPELINE PARALLEL (layers split into 4 stages, micro-batches m1, m2, m3 …)
                GPU0 [layers 1–6]   m1 m2 m3 m4
                GPU1 [layers 7–12]     m1 m2 m3 m4
                GPU2 [layers 13–18]       m1 m2 m3 m4
                GPU3 [layers 19–24]          m1 m2 m3 m4     (the empty corners are the "bubble")
            `,
            codeLanguage: 'text',
        },
        build: {
            answer: `DistributedDataParallel with 2 CPU processes and the gloo backend, so no GPU is needed. Each process builds the same model (same seed), takes half of the batch, and after backward DDP averages the gradients across the processes automatically. Then compare with one process computing the gradient of the whole batch: they match to better than 1e-8. That equality is the guarantee data parallelism gives you: N workers on N slices compute exactly the update one worker would compute on the full batch.\n\nOn real GPUs, change the backend to "nccl", put each process on its own device, and launch with torchrun --nproc_per_node=2 train.py.`,
            code: py`
                import os
                import torch
                import torch.distributed as dist
                import torch.multiprocessing as mp
                from torch.nn.parallel import DistributedDataParallel as DDP

                def make_model():
                    torch.manual_seed(0)
                    return torch.nn.Sequential(torch.nn.Linear(10, 32), torch.nn.ReLU(), torch.nn.Linear(32, 1))

                def worker(rank, world, X, Y, queue):
                    os.environ.update(MASTER_ADDR="127.0.0.1", MASTER_PORT="29511")
                    dist.init_process_group("gloo", rank=rank, world_size=world)
                    model = DDP(make_model())
                    xs, ys = X.chunk(world)[rank], Y.chunk(world)[rank]            # this worker's slice
                    torch.nn.functional.mse_loss(model(xs), ys).backward()        # DDP averages gradients here
                    if rank == 0:
                        queue.put(model.module[0].weight.grad.clone())
                    dist.destroy_process_group()

                if __name__ == "__main__":
                    torch.manual_seed(1)
                    X, Y = torch.randn(64, 10), torch.randn(64, 1)
                    queue = mp.get_context("spawn").SimpleQueue()
                    mp.spawn(worker, args=(2, X, Y, queue), nprocs=2)
                    ddp_grad = queue.get()
                    single = make_model()
                    torch.nn.functional.mse_loss(single(X), Y).backward()
                    print("max difference from single-device training:", (ddp_grad - single[0].weight.grad).abs().max().item())
            `,
        },
        break: {
            answer: `Make one process sleep for a while in every step. Now every step of the whole group takes as long as the slowest process: in the run below, both workers' step time jumps to roughly the sleeper's, even though the other worker has nothing extra to do.\n\nWhy: the gradient all-reduce is a synchronisation point. No worker can finish the step until every worker has contributed its gradients, so the fast one waits at the all-reduce, idle. With 1,000 GPUs, one slow GPU, a bad network link, or one worker that got an unusually long batch slows all 1,000 down.\n\nThat is why large training runs watch for stragglers, keep batches the same size on every worker, overlap communication with computation, and replace failing machines quickly.`,
            code: py`
                import os
                import time
                import torch
                import torch.distributed as dist
                import torch.multiprocessing as mp
                from torch.nn.parallel import DistributedDataParallel as DDP

                def worker(rank, world, slow_rank, queue):
                    os.environ.update(MASTER_ADDR="127.0.0.1", MASTER_PORT="29512")
                    dist.init_process_group("gloo", rank=rank, world_size=world)
                    torch.manual_seed(0)
                    model = DDP(torch.nn.Linear(100, 100))
                    x = torch.randn(32, 100)
                    times = []
                    for _ in range(5):
                        start = time.perf_counter()
                        if rank == slow_rank:
                            time.sleep(0.2)                                    # this worker is slow
                        model(x).sum().backward()                              # all-reduce waits for everyone
                        times.append(time.perf_counter() - start)
                    queue.put((rank, slow_rank, sum(times) / len(times)))
                    dist.destroy_process_group()

                if __name__ == "__main__":
                    ctx = mp.get_context("spawn")
                    for slow in [None, 1]:
                        queue = ctx.SimpleQueue()
                        mp.spawn(worker, args=(2, slow, queue), nprocs=2)
                        results = sorted(queue.get() for _ in range(2))
                        print(f"slow worker = {slow}: " + ", ".join(f"worker {r} step {t * 1000:.0f} ms" for r, _, t in results))
            `,
        },
        explain: {
            answer: `Cooking a huge dinner for a wedding.\n\nData parallel: several kitchens each cook the full menu, each for different tables, and at the end of every course the head chefs compare notes so every kitchen improves its recipe in the same way. It needs each kitchen to be big enough for the whole menu.\n\nTensor parallel: one cake is too big for any single chef, so several chefs work on the same cake at the same time, each on their own slice, constantly passing tools and checking with each other. They must stand close together (fast links in one machine).\n\nPipeline parallel: an assembly line, with one station per course. Starters go to station 1 and then move on, while station 1 starts the next table's starters, so all stations stay busy, except at the very start and end of the service.`,
        },
    },
    'f6-t5': {
        derive: {
            answer: `13 billion parameters:\nbf16 (2 bytes each): 13B × 2 = 26 GB.\nint8 (1 byte): 13 GB.\n4-bit (half a byte): 6.5 GB.\n\nPlus a little extra for the scales that quantisation stores (one per row or per small group of weights), and, at run time, the KV cache and activations. So a 13B model that needs a large data-centre GPU in bf16 fits on a 16 GB consumer GPU in 4-bit, which is why quantisation is so popular for running models locally.`,
        },
        build: {
            answer: `Int8 quantisation stores each weight as an integer from −127 to 127 plus a scale: w ≈ scale × q, with scale = max|w| / 127. Per-tensor uses one scale for a whole weight matrix; per-channel uses one scale per output row.\n\nOn the trained Shakespeare GPT, both are very accurate, because a typical weight matrix has no extreme values: the average relative error per weight is small, and the validation loss changes by less than a thousandth (1.7488 to 1.7487 per-tensor, 1.7486 per-channel). Per-channel is consistently more accurate than per-tensor, because each row gets a scale that fits its own range. The generated text looks just as good after quantisation. (This simulates quantisation by rounding the weights; real int8 kernels also do the maths in integers, which is where the speed comes from.)`,
            code: py`
                import copy
                import torch
                from gpt import GPT, train, estimate_loss, encode, decode

                def quantise_(weight, per_channel):
                    w = weight.data
                    peak = w.abs().amax(dim=1, keepdim=True) if per_channel else w.abs().max()
                    scale = peak.clamp(min=1e-12) / 127
                    q = torch.round(w / scale).clamp(-127, 127)
                    error = ((q * scale - w).abs() / w.abs().mean()).mean().item()
                    weight.data = q * scale                            # simulate int8 storage
                    return error

                torch.manual_seed(0)
                model = train(GPT(), steps=1500, log_every=0)
                torch.manual_seed(1); base_loss = estimate_loss(model, iters=50)
                print(f"original: val loss {base_loss:.4f}")
                for per_channel in [False, True]:
                    q = copy.deepcopy(model)
                    errors = [quantise_(m.weight, per_channel) for m in q.modules() if isinstance(m, torch.nn.Linear)]
                    torch.manual_seed(1)
                    loss = estimate_loss(q, iters=50)
                    torch.manual_seed(2)
                    text = decode(q.generate(torch.tensor([encode("ROMEO:")]), 80)[0].tolist())
                    print(f"{'per-channel' if per_channel else 'per-tensor '}: mean relative error {sum(errors) / len(errors):.4f}, "
                          f"val loss {loss:.4f}\n{text}\n")
            `,
        },
        break: {
            answer: `Put one huge weight (say 100 times the largest normal weight) into a layer and quantise per-tensor. The single scale is now set by the outlier: scale = 100 × normal max / 127. Every normal weight is now tiny compared with the step size, so almost all of them round to 0 or ±1: in the run below, most of the layer's weights become exactly 0, and the relative error for the other weights jumps from about 1% to around 100%. One number has destroyed the whole layer's precision.\n\nPer-channel quantisation limits the damage to the outlier's own row: the other rows keep their own scales and stay accurate.\n\nThis is a real problem in LLMs: a few activation and weight channels have values far larger than the rest. That is why practical methods quantise per channel or in small groups (for example 128 weights per scale), keep the outlier channels in higher precision (as LLM.int8() does), or move the outliers into the weights before quantising (as SmoothQuant does).`,
            code: py`
                import torch

                def quantise(w, per_channel):
                    peak = w.abs().amax(dim=1, keepdim=True) if per_channel else w.abs().max()
                    scale = peak.clamp(min=1e-12) / 127
                    return torch.round(w / scale).clamp(-127, 127) * scale

                torch.manual_seed(0)
                w = torch.randn(256, 256) * 0.02
                w_out = w.clone(); w_out[0, 0] = 100 * w.abs().max()             # one huge outlier
                others = torch.ones_like(w, dtype=torch.bool); others[0, 0] = False
                for name, weights in [("normal", w), ("with outlier", w_out)]:
                    for per_channel in [False, True]:
                        dq = quantise(weights, per_channel)
                        rel = ((dq - weights).abs()[others] / weights.abs()[others]).median().item()
                        zeros = (dq[others] == 0).float().mean().item()
                        print(f"{name:12s} {'per-channel' if per_channel else 'per-tensor '}: "
                              f"median relative error of the other weights {rel:.1%}, rounded to zero {zeros:.0%}")
            `,
        },
        explain: {
            answer: `Batching is a bus instead of many taxis. Each taxi takes one passenger and needs its own driver and fuel; a bus takes 50 passengers for barely more than the cost of one trip. A GPU serving one request at a time wastes most of its power reading the whole model from memory for a single token; serving a batch of requests together reads the weights once and uses them for every request, so each user's share of the cost drops sharply. The price is that each passenger may wait a moment for the bus to fill.\n\nQuantisation is a compressed photo. A JPEG takes a fraction of the space of the original and usually looks the same, because it throws away detail you wouldn't notice. Storing weights in 8 or 4 bits instead of 16 makes the model half or a quarter the size, so it fits on smaller hardware and loads from memory faster, with a small loss in quality. Compress too hard, and the artefacts start to show.`,
        },
    },
    'f6-t6': {
        derive: {
            answer: `1. The data loader is too slow. The GPU sits idle between steps waiting for the next batch. In the profiler trace: gaps between GPU kernels, with time on the CPU in DataLoader or image decoding. Fix: more num_workers, pin_memory=True, pre-process the data.\n\n2. Synchronising every step. Calling loss.item(), print(tensor) or moving a tensor to the CPU in every step forces the CPU to wait for the GPU. In the trace: cudaStreamSynchronize or "aten::item" with long waits, and the GPU queue running dry. Fix: log less often, and keep values on the GPU.\n\n3. Many small operations. Lots of short kernels, each with launch overhead; the GPU is "busy" but mostly launching. In the trace: thousands of tiny kernels and a high share of CPU time in operator dispatch. Fix: batch the work, fuse operations (torch.compile), avoid Python loops over tensors.\n\n4. Slow, memory-bound operations or the wrong precision. Element-wise and normalisation operations dominate, or matrix multiplies run in fp32. In the trace: top operations are not matmuls, or matmuls are slower than they should be. Fix: mixed precision (bf16), fused kernels such as FlashAttention.\n\n(Also common: copying data between CPU and GPU in every step, which shows up as memcpy in the trace.)`,
        },
        build: {
            answer: `Wrap 20 training steps in torch.profiler.profile, then print the operations sorted by total time. On this GPT, on a CPU, the top three are:\n1. Attention (aten::scaled_dot_product_attention), about a quarter of the time, and it runs PyTorch's slowest "math" implementation.\n2. The batched matrix multiplies (aten::bmm) inside that math attention.\n3. Dropout, and specifically generating its random masks (aten::bernoulli_), about 16% of the time on its own.\n\nThe third one is a real finding: dropout isn't free, and the dropout inside attention is also what forces the slow math path, because the fast fused attention kernels on CPU don't support it. This small model trains on plenty of data and barely overfits in a few thousand steps, so dropout is a cost with little benefit here. Setting dropout to 0 raises throughput by about 40% in the run below (about 52,000 to 74,000 tokens per second); a bigger batch (64) then adds more, to about 106,000, by making each matrix multiply larger. Always profile again after a change: the bottleneck moves.`,
            code: py`
                import time
                import torch
                from torch.profiler import profile, ProfilerActivity
                from gpt import GPT, Config, get_batch

                def steps(model, opt, n, batch_size):
                    for _ in range(n):
                        x, y = get_batch("train", batch_size=batch_size)
                        _, loss = model(x, y)
                        opt.zero_grad(); loss.backward(); opt.step()

                def throughput(dropout, batch_size):
                    torch.manual_seed(0)
                    model = GPT(Config(dropout=dropout))
                    opt = torch.optim.AdamW(model.parameters(), lr=1e-3)
                    steps(model, opt, 3, batch_size)                              # warm up
                    start = time.perf_counter()
                    steps(model, opt, 20, batch_size)
                    return 20 * batch_size * 64 / (time.perf_counter() - start), model, opt

                _, model, opt = throughput(0.1, 16)
                with profile(activities=[ProfilerActivity.CPU] + ([ProfilerActivity.CUDA] if torch.cuda.is_available() else [])) as prof:
                    steps(model, opt, 20, 16)
                print(prof.key_averages().table(sort_by="cpu_time_total", row_limit=6))

                for dropout, batch_size in [(0.1, 16), (0.0, 16), (0.0, 64)]:
                    tokens_per_second, _, _ = throughput(dropout, batch_size)
                    print(f"dropout {dropout}, batch {batch_size}: {tokens_per_second:,.0f} tokens per second")
            `,
        },
        break: {
            answer: `On a GPU, operations are asynchronous: PyTorch queues the kernel and returns immediately, long before the GPU has finished. So time.time() around a GPU operation without torch.cuda.synchronize() measures only how long it took to queue the work, a few microseconds, however big the operation is. With synchronize() before stopping the clock, you wait for the GPU to finish, and get the real time, which for a large matrix multiply can be thousands of times longer.\n\nThe same trap appears elsewhere: the first call includes start-up costs (warm up first), and an innocent loss.item() somewhere synchronises and makes a later step look slow. For benchmarks, use torch.utils.benchmark or CUDA events, which handle this for you.\n\nOn a CPU, as in a run without a GPU, both numbers are the same, because CPU operations finish before they return. The code prints both on whatever device you have.`,
            code: py`
                import time
                import torch

                device = "cuda" if torch.cuda.is_available() else "cpu"
                a = torch.randn(4096, 4096, device=device)
                a @ a                                                        # warm up
                if device == "cuda":
                    torch.cuda.synchronize()

                start = time.time(); b = a @ a; no_sync = time.time() - start
                if device == "cuda":
                    torch.cuda.synchronize()
                start = time.time(); b = a @ a
                if device == "cuda":
                    torch.cuda.synchronize()
                with_sync = time.time() - start
                print(f"{device}: without synchronize {no_sync * 1000:.3f} ms, with synchronize {with_sync * 1000:.3f} ms")
            `,
        },
        explain: {
            answer: `Before hiring more chefs to speed up a slow kitchen, you time each station. Maybe the cooking is fast and the real hold-up is the dishwasher, or the one person fetching ingredients. Hiring more chefs wouldn't help at all.\n\nProfiling is timing the stations of your program: which operations take the time, whether the GPU is busy or waiting, and on what. Without it, you optimise what you guess is slow, which is usually wrong. With it, you fix the actual bottleneck first, then time again, because fixing one station often reveals the next slowest one.`,
        },
    },
    'f6-t7': {
        derive: {
            answer: `A 4,096 × 4,096 fp32 matrix is 4,096² × 4 bytes ≈ 67 MB (64 MiB). Call that M.\n\nNaive softmax in PyTorch runs several separate kernels, each going to memory and back:\n1. row max: read M (the output, one number per row, is tiny)\n2. subtract the max: read M, write M\n3. exp: read M, write M\n4. row sum: read M\n5. divide: read M, write M\nTotal: about 5M read + 3M written = 8M ≈ 537 MB.\n\nFused softmax: one kernel loads each row into fast on-chip memory, does all five steps there, and writes the result once: M read + M written = 2M ≈ 134 MB.\n\nSoftmax is memory-bound (a few operations per number), so time is roughly proportional to bytes moved. Expected speed-up ≈ 8M / 2M = 4 times. The official Triton tutorial measures close to this on large rows.`,
        },
        build: {
            answer: `These need an NVIDIA GPU with Triton installed (a free Colab GPU works). The vector-add kernel shows the basic pattern: each program instance handles one block of BLOCK_SIZE elements, computes its offsets from tl.program_id, masks off the elements past the end, loads, adds and stores. The fused softmax gives each row to one program, loads it once, computes max, exp, sum and divide in registers, and writes it once.\n\nBenchmarks with triton.testing.do_bench: vector add matches PyTorch (both are limited by memory bandwidth; you can't beat the hardware); fused softmax is several times faster than the naive PyTorch version and roughly matches torch.softmax, which is itself a fused kernel. Matrix multiply, the third tutorial, adds tiling and is the place to learn how high-performance kernels reuse data; Triton's version gets close to cuBLAS.`,
            code: py`
                # Needs an NVIDIA GPU and: pip install triton
                import torch
                import triton
                import triton.language as tl

                @triton.jit
                def add_kernel(x_ptr, y_ptr, out_ptr, n, BLOCK_SIZE: tl.constexpr):
                    pid = tl.program_id(axis=0)
                    offsets = pid * BLOCK_SIZE + tl.arange(0, BLOCK_SIZE)
                    mask = offsets < n                                   # don't read past the end
                    x = tl.load(x_ptr + offsets, mask=mask)
                    y = tl.load(y_ptr + offsets, mask=mask)
                    tl.store(out_ptr + offsets, x + y, mask=mask)

                def add(x, y, block=1024):
                    out = torch.empty_like(x)
                    grid = lambda meta: (triton.cdiv(x.numel(), meta["BLOCK_SIZE"]),)
                    add_kernel[grid](x, y, out, x.numel(), BLOCK_SIZE=block)
                    return out

                @triton.jit
                def softmax_kernel(out_ptr, in_ptr, row_stride, n_cols, BLOCK_SIZE: tl.constexpr):
                    row = tl.program_id(0)
                    cols = tl.arange(0, BLOCK_SIZE)
                    x = tl.load(in_ptr + row * row_stride + cols, mask=cols < n_cols, other=-float("inf"))
                    x = x - tl.max(x, axis=0)                            # everything happens in registers
                    e = tl.exp(x)
                    tl.store(out_ptr + row * row_stride + cols, e / tl.sum(e, axis=0), mask=cols < n_cols)

                def softmax(x):
                    out = torch.empty_like(x)
                    softmax_kernel[(x.shape[0],)](out, x, x.stride(0), x.shape[1], BLOCK_SIZE=triton.next_power_of_2(x.shape[1]))
                    return out

                def naive_softmax(x):                                    # 5 separate passes over memory
                    m = x.max(dim=1, keepdim=True).values
                    e = torch.exp(x - m)
                    return e / e.sum(dim=1, keepdim=True)

                x, y = torch.randn(10_000_000, device="cuda"), torch.randn(10_000_000, device="cuda")
                assert torch.allclose(add(x, y), x + y)
                print("add: triton", triton.testing.do_bench(lambda: add(x, y)), "ms | torch", triton.testing.do_bench(lambda: x + y), "ms")
                m = torch.randn(4096, 4096, device="cuda")
                assert torch.allclose(softmax(m), torch.softmax(m, dim=1), atol=1e-6)
                for name, fn in [("triton fused", softmax), ("naive torch", naive_softmax), ("torch.softmax", lambda t: torch.softmax(t, 1))]:
                    print(f"softmax {name}: {triton.testing.do_bench(lambda: fn(m)):.3f} ms")
            `,
        },
        break: {
            answer: `Without the mask, with a size that isn't a multiple of BLOCK (say 1,000,001 with BLOCK 1,024), the last program reads and writes past the end of the arrays. The result: garbage in memory just past your tensor, a crash with "an illegal memory access was encountered" (which then poisons the whole CUDA context, so later calls fail too), or, worst of all, nothing visible at all because the memory happened to be accessible, and something else is silently corrupted. That is why every load and store at the edge of the data must be masked.\n\nBLOCK size: very small (say 16 or 32) means a huge number of programs, each doing almost nothing: the scheduling overhead and the poor use of wide memory transactions make it much slower. Very large (say 65,536) means few programs, each needing a lot of registers, so fewer run at once and some of the GPU sits idle; very large blocks can also fail to compile. The sweet spot for a simple element-wise kernel is usually around 1,024 to 4,096; Triton's autotuner can try several and pick the best.`,
            code: py`
                # Needs an NVIDIA GPU and: pip install triton
                import torch
                import triton
                import triton.language as tl

                @triton.jit
                def add_no_mask(x_ptr, y_ptr, out_ptr, n, BLOCK_SIZE: tl.constexpr):
                    offsets = tl.program_id(0) * BLOCK_SIZE + tl.arange(0, BLOCK_SIZE)
                    tl.store(out_ptr + offsets, tl.load(x_ptr + offsets) + tl.load(y_ptr + offsets))   # no mask!

                @triton.jit
                def add_kernel(x_ptr, y_ptr, out_ptr, n, BLOCK_SIZE: tl.constexpr):
                    offsets = tl.program_id(0) * BLOCK_SIZE + tl.arange(0, BLOCK_SIZE)
                    mask = offsets < n
                    tl.store(out_ptr + offsets, tl.load(x_ptr + offsets, mask=mask) + tl.load(y_ptr + offsets, mask=mask), mask=mask)

                n = 50_000_001                                          # not a multiple of the block size
                x, y = torch.randn(n, device="cuda"), torch.randn(n, device="cuda")
                for block in [32, 256, 1024, 4096, 16384]:
                    out = torch.empty_like(x)
                    ms = triton.testing.do_bench(lambda: add_kernel[(triton.cdiv(n, block),)](x, y, out, n, BLOCK_SIZE=block))
                    print(f"BLOCK {block:5d}: {ms:.3f} ms")
                out = torch.empty_like(x)
                add_no_mask[(triton.cdiv(n, 1024),)](x, y, out, n, BLOCK_SIZE=1024)    # reads and writes past the end
                torch.cuda.synchronize()                                # may raise "illegal memory access", or silently corrupt
            `,
        },
        explain: {
            answer: `Cooking a dish in one trip to the fridge instead of walking back and forth for each ingredient. Unfused code is like fetching the eggs, cracking them, putting the bowl back in the fridge, fetching it again to add milk, putting it back, fetching it again to whisk: most of the time is spent walking, not cooking.\n\nA GPU kernel that reads data from memory, does one small thing and writes it back is one trip to the fridge. Kernel fusion does several steps, such as subtract, exp, sum and divide, in one kernel while the data sits in the GPU's fast on-chip memory, then writes the result once. For memory-bound work, fewer trips means proportionally less time, which is the whole idea behind FlashAttention and fused softmax.`,
        },
    },
    'f6-t8': {
        derive: {
            answer: `Distillation compares the student's softened probabilities q = softmax(z/T) with the teacher's p = softmax(v/T), where z and v are the logits and T is the temperature.\n\nThe gradient of the soft cross-entropy with respect to a student logit is:\n∂L/∂zᵢ = (1/T) · (qᵢ − pᵢ).\n\nTwo factors of T shrink this gradient:\n1. The 1/T from the chain rule, because the logits are divided by T.\n2. The difference qᵢ − pᵢ itself: at high T both distributions are close to uniform, and expanding softmax for large T gives qᵢ − pᵢ ≈ (zᵢ − vᵢ) / (N·T), with N classes (when the logits have zero mean).\n\nTogether: ∂L/∂zᵢ ≈ (zᵢ − vᵢ) / (N·T²). The gradient shrinks with T².\n\nMultiplying the soft loss by T² cancels that, so the soft-label term keeps roughly the same influence relative to the hard-label loss whatever temperature you choose. Without it, raising T from 1 to 4 would silently make the distillation signal 16 times weaker. (This is the argument in Hinton, Vinyals and Dean, 2015.)`,
        },
        build: {
            answer: `Teacher: an MLP 784 → 512 → 512 → 10 with dropout (about 670,000 parameters), trained on MNIST images 5,000 to 60,000. Student: 784 → 200 → 10 (about 159,000, a quarter of the size). Train three students with the same settings:\n• hard labels only, on images 0 to 5,000 (the labelled set);\n• distilled on the same 5,000 images: α × T² × KL(teacher's soft probabilities ‖ student's) + (1 − α) × cross-entropy with the hard labels, T = 4, α = 0.7;\n• soft labels only, on all 60,000 images, using no true labels at all: the teacher labels them.\n\nThe honest result, averaged over 3 seeds: on the same 5,000 images, distillation did not beat hard labels here (about 91.7% against 92.2%). With an MLP on an easy dataset, the teacher's soft labels added little that the true labels didn't already give. But the third student, which learned only from the teacher on 60,000 unlabelled images, reached about 95.7%, more than 3 points higher.\n\nThat is distillation's main practical use: once you have a good teacher, it can label as much extra data as you like for free, and a small student learns its behaviour from that. The "dark knowledge" in soft labels matters more on harder tasks with many similar classes; always compare against the hard-label baseline rather than assuming it helps.`,
            code: py`
                import torch
                import torch.nn as nn
                import torch.nn.functional as F
                from torchvision import datasets

                train, test = datasets.MNIST("data", train=True, download=True), datasets.MNIST("data", train=False, download=True)
                X_all, y_all = train.data.reshape(-1, 784).float() / 255, train.targets
                Xte, yte = test.data.reshape(-1, 784).float() / 255, test.targets
                X_lab, y_lab = X_all[:5000], y_all[:5000]                  # the student's labelled data

                def fit(model, X, y, loss_fn, epochs):
                    opt = torch.optim.Adam(model.parameters(), lr=1e-3)
                    for _ in range(epochs):
                        for idx in torch.randperm(len(X)).split(128):
                            opt.zero_grad(); loss_fn(model, X[idx], y[idx], idx).backward(); opt.step()
                    with torch.no_grad():
                        return (model(Xte).argmax(1) == yte).float().mean().item()

                hard = lambda m, xb, yb, idx: F.cross_entropy(m(xb), yb)
                torch.manual_seed(0)
                teacher = nn.Sequential(nn.Linear(784, 512), nn.ReLU(), nn.Dropout(0.3), nn.Linear(512, 512), nn.ReLU(),
                                        nn.Dropout(0.3), nn.Linear(512, 10))
                print(f"teacher: {fit(teacher, X_all[5000:], y_all[5000:], hard, 4):.2%}")
                teacher.eval()
                with torch.no_grad():
                    soft_lab, soft_all = teacher(X_lab), teacher(X_all)

                T, alpha = 4.0, 0.7
                def distill(m, xb, yb, idx):
                    soft = F.kl_div(F.log_softmax(m(xb) / T, 1), F.softmax(soft_lab[idx] / T, 1), reduction="batchmean")
                    return alpha * T * T * soft + (1 - alpha) * F.cross_entropy(m(xb), yb)
                def soft_only(m, xb, yb, idx):                              # no true labels used at all
                    return T * T * F.kl_div(F.log_softmax(m(xb) / T, 1), F.softmax(soft_all[idx] / T, 1), reduction="batchmean")

                for name, X, y, loss_fn, epochs in [("hard labels, 5,000 images", X_lab, y_lab, hard, 10),
                                                    ("distilled, same 5,000 images", X_lab, y_lab, distill, 10),
                                                    ("teacher's labels only, 60,000 unlabelled", X_all, y_all, soft_only, 2)]:
                    scores = []
                    for seed in range(3):
                        torch.manual_seed(seed)
                        student = nn.Sequential(nn.Linear(784, 200), nn.ReLU(), nn.Linear(200, 10))
                        scores.append(fit(student, X, y, loss_fn, epochs))
                    print(f"student, {name}: {sum(scores) / 3:.2%} (mean of 3 seeds)")
            `,
        },
        break: {
            answer: `Magnitude pruning sets the smallest weights to zero. Without retraining, accuracy holds at 50% sparsity, drops somewhat at 80%, and falls apart at 95%. With a short retraining after pruning (keeping the pruned weights at zero), the network recovers most of the accuracy even at 80%, and a good part of it at 95%: the remaining weights learn to compensate. Plotted, the "no retraining" curve falls off a cliff well before the "with retraining" curve does.\n\nIs the pruned model faster? Not as it stands. The weights are zeros stored in an ordinary dense matrix, and the hardware multiplies zeros just as fast as any other number, so the time is the same. Real speed-ups need either structured pruning (remove whole neurons, heads or channels, so the matrices get smaller), hardware-supported patterns like 2:4 sparsity on recent NVIDIA GPUs, or sparse kernels that only win at very high sparsity. The run below shows the dense timing is unchanged.`,
            code: py`
                import copy
                import time
                import torch
                import torch.nn as nn
                import torch.nn.functional as F
                from torchvision import datasets

                train, test = datasets.MNIST("data", train=True, download=True), datasets.MNIST("data", train=False, download=True)
                X, y = train.data[:20_000].reshape(-1, 784).float() / 255, train.targets[:20_000]
                Xte, yte = test.data.reshape(-1, 784).float() / 255, test.targets
                accuracy = lambda m: (m(Xte).argmax(1) == yte).float().mean().item()

                def train_(model, epochs, masks=None):
                    opt = torch.optim.Adam(model.parameters(), lr=1e-3)
                    for _ in range(epochs):
                        for idx in torch.randperm(len(X)).split(128):
                            opt.zero_grad(); F.cross_entropy(model(X[idx]), y[idx]).backward(); opt.step()
                            if masks:
                                with torch.no_grad():
                                    for layer, mask in masks.items():
                                        layer.weight.mul_(mask)                  # keep pruned weights at zero
                    return model

                torch.manual_seed(0)
                base = train_(nn.Sequential(nn.Linear(784, 300), nn.ReLU(), nn.Linear(300, 100), nn.ReLU(), nn.Linear(100, 10)), 3)
                print(f"dense: {accuracy(base):.2%}")
                for sparsity in [0.5, 0.8, 0.95]:
                    pruned, masks = copy.deepcopy(base), {}
                    for layer in [m for m in pruned if isinstance(m, nn.Linear)]:
                        cut = layer.weight.abs().flatten().kthvalue(int(sparsity * layer.weight.numel())).values
                        masks[layer] = (layer.weight.abs() > cut).float()
                        layer.weight.data.mul_(masks[layer])
                    before = accuracy(pruned)
                    after = accuracy(train_(pruned, 1, masks))
                    print(f"{sparsity:.0%} pruned: no retraining {before:.2%}, after 1 epoch of retraining {after:.2%}")

                with torch.no_grad():
                    for name, model in [("dense", base), ("95% zeros", pruned)]:
                        start = time.perf_counter()
                        for _ in range(50):
                            model(Xte)
                        print(f"{name}: {(time.perf_counter() - start) / 50 * 1000:.2f} ms per pass over the test set")
            `,
        },
        explain: {
            answer: `Pruning is trimming a tree's weakest branches. Many branches contribute almost nothing; cut them, and the tree keeps its shape and fruit, and if you give it a season to regrow (retraining), the remaining branches strengthen to make up for the loss. Cut too much at once, and the tree suffers.\n\nDistillation is an expert teacher training a student. A normal answer key only says "the answer is 7". A good teacher also explains "it's a 7, but it looks a bit like a 1, and nothing like a 4": the soft probabilities. That extra information lets a much smaller student learn to behave like the teacher, faster and from less data, which is how small, fast models are made from big ones.`,
        },
    },
    'f6-t9': {
        derive: {
            answer: `The draft proposes k = 4 tokens; each is accepted with probability α = 0.8, and the first rejection stops the run. The big model's pass always adds one token of its own: a correction at the first rejection, or a bonus token if all 4 are accepted.\n\nTokens per pass = (number of accepted draft tokens) + 1.\nP(at least i drafts accepted) = αⁱ, so the expected number accepted is α + α² + α³ + α⁴ = 0.8 + 0.64 + 0.512 + 0.4096 = 2.3616.\nAdd the big model's own token: 3.36 tokens per big-model pass.\n\nThe same in one formula: (1 − α^(k+1)) / (1 − α) = (1 − 0.8⁵) / 0.2 = (1 − 0.32768) / 0.2 ≈ 3.36.\n\nSo each expensive pass produces about 3.4 tokens instead of 1. The real speed-up is a bit lower, because the draft model's own passes cost something too.`,
            code: py`
                alpha, k = 0.8, 4
                print(sum(alpha**i for i in range(1, k + 1)) + 1, (1 - alpha**(k + 1)) / (1 - alpha))   # both ≈ 3.3616
            `,
        },
        build: {
            answer: `Train two GPTs on Shakespeare: the big one (the shared gpt.py model) and a small draft (width 32, 1 layer). Greedy speculative decoding: the draft proposes k tokens one at a time; the big model then scores the context plus all k proposals in a single forward pass, giving its own greedy choice at every position; accept the proposals up to the first one where the big model disagrees, then append the big model's own token there. Repeat.\n\nThe key check: the output is exactly identical to the big model decoding greedily on its own, because every token that is kept is one the big model would have chosen. (The test stays inside the model's 64-character window: once the context has to be cropped, the two methods would show the big model slightly different windows, so a fair comparison needs a model with a long enough context, or a KV cache.) In the run below, about a quarter of the draft's proposals are accepted, giving about 2 tokens per big-model pass, but the total time is about the same as plain decoding (about 1.0 times). Two reasons: this draft model is weak (a 1-layer model agrees with the big one too rarely), and the big model is tiny, so it is barely more expensive than the draft, while Python overhead costs the same for both. Real systems, where the big model is billions of parameters and the draft is a well-matched smaller model, see 2 to 3 times speed-ups. The fair check is the one the code makes first: identical output.`,
            code: py`
                import time
                import torch
                from gpt import GPT, Config, train, encode, decode

                @torch.no_grad()
                def greedy(model, idx, n):
                    for _ in range(n):
                        logits, _ = model(idx[:, -model.c.block_size:])
                        idx = torch.cat([idx, logits[:, -1].argmax(-1, keepdim=True)], dim=1)
                    return idx

                @torch.no_grad()
                def speculative(big, draft, idx, n, k=4):
                    target, passes, accepted, proposed = idx.shape[1] + n, 0, 0, 0
                    while idx.shape[1] < target:
                        k_now = min(k, target - idx.shape[1])                         # never draft past the end
                        proposal = greedy(draft, idx, k_now)[:, idx.shape[1]:]
                        logits, _ = big(torch.cat([idx, proposal], dim=1))             # one big pass checks them all
                        passes += 1; proposed += k_now
                        choices = logits[0, -k_now - 1:].argmax(-1)                    # big model's pick at each position
                        n_ok = 0
                        while n_ok < k_now and proposal[0, n_ok] == choices[n_ok]:
                            n_ok += 1
                        accepted += n_ok
                        idx = torch.cat([idx, proposal[:, :n_ok], choices[n_ok].view(1, 1)], dim=1)
                    return idx[:, :target], passes, accepted, proposed

                torch.manual_seed(0)
                big = train(GPT(), steps=1500, log_every=0).eval()
                draft = train(GPT(Config(n_embd=32, n_layer=1, n_head=2)), steps=1500, log_every=0).eval()
                plain_s = fast_s = 0.0
                passes = accepted = proposed = tokens = 0
                for prompt in ["ROMEO:\n", "JULIET:\n", "KING RICHARD III:\n", "First Citizen:\n", "MENENIUS:\n"]:
                    ids = torch.tensor([encode(prompt)])
                    n = 64 - ids.shape[1]                     # stay inside the 64-character window, so the big model's
                    t = time.perf_counter(); plain = greedy(big, ids, n); plain_s += time.perf_counter() - t   # context is never cropped
                    t = time.perf_counter(); fast, p, a, q = speculative(big, draft, ids, n); fast_s += time.perf_counter() - t
                    assert torch.equal(plain, fast)                                    # identical output
                    passes, accepted, proposed, tokens = passes + p, accepted + a, proposed + q, tokens + n
                print(f"tokens per big-model pass: {tokens / passes:.2f}, draft acceptance {accepted / proposed:.0%}")
                print(f"plain {plain_s:.2f} s, speculative {fast_s:.2f} s: {plain_s / fast_s:.2f}x")
                print(decode(fast[0].tolist()))
            `,
        },
        break: {
            answer: `A draft trained on very different text, here a list of first names instead of Shakespeare, rarely guesses what the big model would write next, so most proposals are rejected at the first token. In the run below, on real held-out text, a small draft trained on Shakespeare agrees with the big model's next character 37% of the time; the one trained on names agrees 3% of the time. Acceptance falls sharply and each big-model pass yields barely more than one token, while you still pay for the draft's k passes: the result is slower than plain decoding.\n\nWhere is the break-even? Each round costs one big pass plus k draft passes, c·k, where c is the draft's cost relative to the big model; it yields (1 − α^(k+1)) / (1 − α) tokens. Plain decoding gives 1 token per big pass. Speculative decoding only wins when tokens per round > 1 + c·k. With k = 4 and a draft costing 20% of the big model (c = 0.2), you need 1.8 tokens per round, which takes an acceptance rate of about 0.45 or more; with a draft costing 5% (c = 0.05), about 0.17 is enough. In practice: choose a draft trained on the same kind of data (often a smaller model of the same family), and lower k when acceptance is low.`,
            code: py`
                import urllib.request
                import torch
                from gpt import GPT, Config, train, encode, get_batch, val_data

                def tokens_per_round(alpha, k):
                    return (1 - alpha ** (k + 1)) / (1 - alpha) if alpha < 1 else k + 1
                for c in [0.2, 0.05]:
                    breakeven = next(a / 100 for a in range(1, 100) if tokens_per_round(a / 100, 4) > 1 + c * 4)
                    print(f"draft cost {c:.0%} of the big model: speculative wins above acceptance {breakeven:.2f}")

                @torch.no_grad()
                def acceptance(big, draft, n=300):
                    text = val_data[:n + 64].unsqueeze(0)                      # real held-out text
                    hits = 0
                    for i in range(64, 64 + n):
                        ctx = text[:, i - 64:i]                                     # the 64 characters before position i
                        hits += int(big(ctx)[0][0, -1].argmax() == draft(ctx)[0][0, -1].argmax())
                    return hits / n

                torch.manual_seed(0)
                big = train(GPT(), steps=1500, log_every=0).eval()
                names = torch.tensor(encode(urllib.request.urlopen("https://raw.githubusercontent.com/karpathy/makemore/master/names.txt").read().decode()))
                for name, source in [("Shakespeare draft", None), ("names draft", names)]:
                    torch.manual_seed(1)
                    draft = GPT(Config(n_embd=32, n_layer=1, n_head=2))
                    opt = torch.optim.AdamW(draft.parameters(), lr=1e-3)
                    for _ in range(1500):
                        loss = draft(*get_batch("train", source=source))[1]
                        opt.zero_grad(); loss.backward(); opt.step()
                    print(f"{name}: agrees with the big model's next token {acceptance(big, draft.eval()):.0%} of the time")
            `,
        },
        explain: {
            answer: `A junior writer drafts the next few words, and a senior editor checks them in one read. Wherever the editor agrees, the words stay; at the first word the editor would have written differently, the editor writes their own word, and the junior starts drafting again from there. The final text is exactly what the senior would have written alone, but the senior only had to read in quick passes instead of writing every word slowly.\n\nIn speculative decoding, a small, fast model drafts several tokens, and the big model checks them all in a single forward pass (checking several tokens at once costs about the same as generating one, because a pass processes many positions in parallel). The better the junior knows the senior's style, the more words survive each check, and the bigger the speed-up.`,
        },
    },
};
