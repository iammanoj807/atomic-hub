import type { TopicAnswers } from '../foundations';
import { py } from './code';

// Phase 1 · Math foundations. One good answer for each practice exercise.

export const phase1Answers: Record<string, TopicAnswers> = {
    'f1-t1': {
        derive: {
            answer: `No, they are not a basis.\n\nLook for one vector made from the others: [1, 2, 3] + [0, 1, 1] = [1, 3, 4]. The third vector adds no new direction, so the three only span a flat plane through the origin, not all of 3D space.\n\nCheck with the determinant of the matrix whose rows are the three vectors:\n1·(1·4 − 1·3) − 2·(0·4 − 1·1) + 3·(0·3 − 1·1) = 1 + 2 − 3 = 0.\nA determinant of 0 means the vectors are dependent. A basis of 3D needs 3 independent vectors.`,
        },
        build: {
            answer: `Stack the vectors as rows of a matrix. Its rank is the number of truly independent directions, so the vectors are independent exactly when the rank equals how many vectors there are.\n\nThe example from the derive step gives rank 2, so it is False; the standard basis gives rank 3, so True.`,
            code: py`
                import numpy as np

                def is_independent(vectors):
                    M = np.stack(vectors)                       # one vector per row
                    return np.linalg.matrix_rank(M) == len(vectors)

                print(is_independent([np.array([1, 2, 3]), np.array([0, 1, 1]), np.array([1, 3, 4])]))  # False
                print(is_independent(list(np.eye(3))))                                                # True
                print(is_independent([np.array([1, 2]), np.array([2, 4])]))                           # False
            `,
        },
        break: {
            answer: `[1, 0] and [1, 1e-12] come out as independent: the rank is 2. Mathematically that is correct, since they are not exactly parallel. But in practice they point in almost the same direction, and any real data with a tiny bit of noise would look the same.\n\nWhat this teaches about floating point: computers can't tell "exactly 0" from "very small", so rank is decided with a tolerance. np.linalg.matrix_rank counts singular values bigger than a tiny cutoff (about 1e-16 times the largest). 1e-12 is above that cutoff, so it counts. With [1, 1e-17], the rank drops to 1.\n\nSo "independent or not" is really a question of degree. The ratio of the largest to the smallest singular value, called the condition number, tells you how close to dependent a set of vectors is. Here it is about 10¹²: almost dependent, and any calculation that relies on them being independent will be unstable.`,
            code: py`
                import numpy as np

                M = np.array([[1, 0], [1, 1e-12]])
                print(np.linalg.matrix_rank(M))                     # 2: counted as independent
                print(np.linalg.matrix_rank(np.array([[1, 0], [1, 1e-17]])))   # 1
                print(f"{np.linalg.cond(M):.1e}")                   # 2.0e+12: almost dependent
            `,
        },
        explain: {
            answer: `On a map you can walk east and you can walk north. By combining some amount of east with some amount of north, you can reach every point on the map: the span of those two directions is the whole map.\n\nA basis is a set of directions that reaches everywhere with nothing wasted. East and north are a basis: you need both, and neither can be made from the other. Add "north-east" and you still reach the same places, because north-east is just some east plus some north, so it adds nothing new. And if both your directions were "north" and "a bit more north", you could only ever walk along one line: their span is a line, not the map.`,
        },
    },
    'f1-t2': {
        derive: {
            answer: `Rotate 90° anticlockwise: R = [[0, −1], [1, 0]]. Double x only: S = [[2, 0], [0, 1]].\n\nRotate first, then double x: the first step is on the right, so the matrix is S·R = [[0, −2], [1, 0]].\nDouble x first, then rotate: R·S = [[0, −1], [2, 0]].\n\nWhere the unit square lands (its corners (1, 0), (0, 1) and (1, 1)):\n• S·R: (1, 0) → (0, 1), (0, 1) → (−2, 0), (1, 1) → (−2, 1). A rectangle 2 wide and 1 tall, to the left of the y-axis.\n• R·S: (1, 0) → (0, 2), (0, 1) → (−1, 0), (1, 1) → (−1, 2). A rectangle 1 wide and 2 tall.\n\nBoth have area 2 (the determinant of each is 2), but they are different shapes in different places. Matrix multiplication depends on the order: S·R ≠ R·S.`,
        },
        build: {
            answer: `Entry (i, j) of A·B is the dot product of row i of A with column j of B. So: one loop over the rows of A, one over the columns of B, and one inner loop to add up the products. Check it against A @ B with np.allclose on random matrices of matching sizes.\n\nFor the picture, put the square's corners as columns of a matrix, multiply by the transformation, and plot both outlines.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt

                def matmul(A, B):
                    n, k = A.shape
                    k2, m = B.shape
                    assert k == k2, f"inner sizes differ: {k} and {k2}"
                    C = np.zeros((n, m))
                    for i in range(n):
                        for j in range(m):
                            for p in range(k):
                                C[i, j] += A[i, p] * B[p, j]
                    return C

                rng = np.random.default_rng(0)
                A, B = rng.normal(size=(4, 3)), rng.normal(size=(3, 5))
                assert np.allclose(matmul(A, B), A @ B)

                square = np.array([[0, 1, 1, 0, 0],      # x of each corner, back to the start
                                   [0, 0, 1, 1, 0]])     # y of each corner
                T = np.array([[0, -2], [1, 0]])           # rotate 90°, then double x
                moved = T @ square
                plt.plot(square[0], square[1], label="before")
                plt.plot(moved[0], moved[1], label="after")
                plt.axis("equal"); plt.legend(); plt.show()
            `,
        },
        break: {
            answer: `NumPy refuses: "matmul: Input operand 1 has a mismatch in its core dimension 0 … (size 2 is different from 3)".\n\nThe rule: for A·B, the number of columns of A must equal the number of rows of B. (2, 3) times (3, 4) works and gives (2, 4); (2, 3) times (2, 3) doesn't.\n\nWhy: each entry of the result is a dot product of a row of A with a column of B. A row of a (2, 3) matrix has 3 numbers, but a column of the second (2, 3) matrix has only 2, so there is nothing to pair the third number with. A shortcut: write the shapes side by side, (2, 3)(3, 4). The inner numbers must match, and the outer ones give the result's shape.`,
            code: py`
                import numpy as np

                A = np.ones((2, 3))
                try:
                    A @ np.ones((2, 3))
                except ValueError as e:
                    print(e)
                print((A @ np.ones((3, 4))).shape)    # (2, 4): inner 3s match
            `,
        },
        explain: {
            answer: `The columns of a matrix tell you where the basic arrows land. The first column is where the arrow (1, 0) goes, the second is where (0, 1) goes.\n\nFor [[2, 0], [0, 3]]: the first column is [2, 0], so the arrow along x is stretched to twice its length. The second column is [0, 3], so the arrow along y is stretched three times. Every other point follows: (x, y) goes to x·[2, 0] + y·[0, 3] = (2x, 3y). So the unit square becomes a 2 × 3 rectangle.\n\nThat is why you can read a matrix as a transformation: look at the columns, and you see what it does to space.`,
        },
    },
    'f1-t3': {
        derive: {
            answer: `For a 2 × 2 matrix [[a, b], [c, d]], the determinant is a·d − b·c.\n\n[[3, 1], [2, 4]]: 3·4 − 1·2 = 10. The unit square becomes a shape 10 times bigger in area. Positive, so no flip.\n\n[[1, 2], [2, 4]]: 1·4 − 2·2 = 0. The square is squashed flat onto a line, with area 0. The two columns, [1, 2] and [2, 4], point the same way, so they only reach one line.\n\n[[0, 1], [1, 0]]: 0·0 − 1·1 = −1. Same area, but negative: space is flipped like a mirror image, with x and y swapped (a reflection across the line y = x).`,
        },
        build: {
            answer: `det2 is a·d − b·c. det3 expands along the first row: each entry times the determinant of the 2 × 2 matrix left when you cross out its row and column, with signs +, −, +.\n\nBoth match np.linalg.det on random matrices, and det(A·B) equals det(A)·det(B): scaling area by one, then the other, multiplies the scalings.`,
            code: py`
                import numpy as np

                def det2(A):
                    return A[0, 0] * A[1, 1] - A[0, 1] * A[1, 0]

                def det3(A):
                    total = 0.0
                    for j in range(3):
                        minor = np.delete(np.delete(A, 0, axis=0), j, axis=1)   # cross out row 0, column j
                        total += (-1) ** j * A[0, j] * det2(minor)
                    return total

                rng = np.random.default_rng(0)
                A2, A3, B3 = rng.normal(size=(2, 2)), rng.normal(size=(3, 3)), rng.normal(size=(3, 3))
                assert np.isclose(det2(A2), np.linalg.det(A2))
                assert np.isclose(det3(A3), np.linalg.det(A3))
                assert np.isclose(det3(A3 @ B3), det3(A3) * det3(B3))
                print(det2(np.array([[3, 1], [2, 4]])))     # 10
            `,
        },
        break: {
            answer: `It is not exactly 0. With noise of 1e-10 you get a tiny number instead, and even with no noise at all, rounding usually leaves something around 1e-16 instead of a perfect 0.\n\nSo never test "is it invertible?" with det(A) == 0. A tiny but non-zero determinant looks invertible, yet the matrix is almost flat, and solving with it amplifies errors enormously.\n\nThe determinant is also a poor measure of "almost flat", because it depends on scale: 0.1 times the 10 × 10 identity has a determinant of 1e-10, yet it is perfectly well behaved. Use np.linalg.matrix_rank, which uses a sensible tolerance, or np.linalg.cond: a huge condition number means "close to singular".`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                r1, r2 = rng.normal(size=3), rng.normal(size=3)
                A = np.array([r1, r2, r1 + r2])
                print(np.linalg.det(A))                                # tiny, not exactly 0
                noisy = A + rng.normal(scale=1e-10, size=(3, 3))
                print(np.linalg.det(noisy))                            # still tiny, not 0
                print(np.linalg.matrix_rank(A), f"{np.linalg.cond(noisy):.0e}")   # 2, huge
                print(np.linalg.det(0.1 * np.eye(10)))                 # 1e-10, yet perfectly invertible
            `,
        },
        explain: {
            answer: `Draw a square on a rubber sheet and stretch the sheet with the matrix.\n\nThe size of the determinant says how much the square's area is multiplied: 3 means three times the area, 0.5 means half, and 0 means the sheet was squashed flat onto a line, so no area is left.\n\nThe sign says whether the sheet was flipped over. Positive: it still faces up. Negative: it was turned over like a mirror image, so the order of the corners, clockwise or anticlockwise, is reversed.`,
        },
    },
    'f1-t4': {
        derive: {
            answer: `For [[a, b], [c, d]], the inverse is 1/(a·d − b·c) times [[d, −b], [−c, a]].\n\nHere a·d − b·c = 2·3 − 1·1 = 5, so A⁻¹ = (1/5)·[[3, −1], [−1, 2]] = [[0.6, −0.2], [−0.2, 0.4]].\n\nx = A⁻¹b = [0.6·3 − 0.2·5, −0.2·3 + 0.4·5] = [1.8 − 1.0, −0.6 + 2.0] = [0.8, 1.4].\n\nCheck by multiplying back: 2·0.8 + 1·1.4 = 3 ✓ and 1·0.8 + 3·1.4 = 5 ✓.\n\nIn code you would use np.linalg.solve(A, b) instead of computing the inverse: it is faster and more accurate.`,
        },
        build: {
            answer: `Gaussian elimination has two parts. Forward: for each column, use the row with the biggest value as the pivot (partial pivoting, which avoids dividing by tiny numbers), and subtract multiples of it to make zeros below. Then back-substitution: solve the last equation first, then work upwards.\n\nIt matches np.linalg.solve on random 5 × 5 systems to about 1e-12.`,
            code: py`
                import numpy as np

                def solve(A, b):
                    A, b = A.astype(float).copy(), b.astype(float).copy()
                    n = len(b)
                    for col in range(n):
                        pivot = col + np.argmax(np.abs(A[col:, col]))    # largest value in the column
                        if np.isclose(A[pivot, col], 0):
                            raise ValueError("matrix is singular")
                        A[[col, pivot]], b[[col, pivot]] = A[[pivot, col]], b[[pivot, col]]
                        for row in range(col + 1, n):
                            factor = A[row, col] / A[col, col]
                            A[row, col:] -= factor * A[col, col:]
                            b[row] -= factor * b[col]
                    x = np.zeros(n)
                    for row in range(n - 1, -1, -1):                     # back-substitution
                        x[row] = (b[row] - A[row, row + 1:] @ x[row + 1:]) / A[row, row]
                    return x

                rng = np.random.default_rng(0)
                for _ in range(100):
                    A, b = rng.normal(size=(5, 5)), rng.normal(size=5)
                    assert np.allclose(solve(A, b), np.linalg.solve(A, b))
                print(solve(np.array([[2, 1], [1, 3]]), np.array([3, 5])))   # [0.8 1.4]
            `,
        },
        break: {
            answer: `[[1, 2], [2, 4]] has rank 1: the second row is twice the first. After one elimination step the last pivot is 0, so the code above raises "matrix is singular" (code without that check divides by zero and returns inf or nan). np.linalg.solve raises LinAlgError: Singular matrix.\n\nWhat rank 1 means: both equations say the same thing, so you really have one equation, x + 2y = something, for two unknowns. Then there are two cases:\n• b = [1, 2] fits the pattern: infinitely many solutions, the whole line x + 2y = 1.\n• b = [1, 1] doesn't: the equations contradict each other, so there is no solution at all.\n\nEither way there is never exactly one answer. np.linalg.lstsq gives the best fit instead.`,
            code: py`
                import numpy as np

                A = np.array([[1., 2.], [2., 4.]])
                print(np.linalg.matrix_rank(A))                  # 1
                try:
                    np.linalg.solve(A, np.array([1., 2.]))
                except np.linalg.LinAlgError as e:
                    print(e)                                     # Singular matrix
                x, *_ = np.linalg.lstsq(A, np.array([1., 2.]), rcond=None)
                print(x.round(3), A @ x)                         # one of the infinitely many solutions
            `,
        },
        explain: {
            answer: `A photo of a 3D object keeps only 2 of the 3 directions: width and height survive, depth is lost. So the photo has rank 2.\n\nA matrix's rank is the same idea: the number of independent directions that survive the transformation. A 3 × 3 matrix with full rank 3 keeps all three directions, so you can undo it: it has an inverse. A rank-2 matrix flattens space onto a plane, like the photo. You can't undo it, because many different points land on the same spot: from the photo alone, you can't tell how far away something was.`,
        },
    },
    'f1-t5': {
        derive: {
            answer: `The projection of a onto b is (a·b / b·b)·b.\n\na·b = 2·1 + 3·1 = 5 and b·b = 1 + 1 = 2, so proj = (5/2)·[1, 1] = [2.5, 2.5].\n\nWhat is left over: a − proj = [2 − 2.5, 3 − 2.5] = [−0.5, 0.5].\n\nIs it orthogonal to b? [−0.5, 0.5]·[1, 1] = −0.5 + 0.5 = 0 ✓. That is the point of a projection: it splits a into a part along b and a part at right angles to b.`,
        },
        build: {
            answer: `cosine_similarity(u, v) = u·v / (|u|·|v|): 1 means the same direction, 0 means at right angles, −1 means opposite. project(a, b) = (a·b / b·b)·b.\n\nWith made-up vectors whose three numbers mean roughly "royalty, food, vehicle", the most similar pair is king and queen, and apple and banana come next. That is exactly how semantic search ranks results, with real embeddings instead of three hand-written numbers.`,
            code: py`
                import itertools
                import numpy as np

                def cosine_similarity(u, v):
                    return u @ v / (np.linalg.norm(u) * np.linalg.norm(v))

                def project(a, b):
                    return (a @ b) / (b @ b) * b

                words = {                       # made-up: royalty, food, vehicle
                    "king":   np.array([0.9, 0.1, 0.0]),
                    "queen":  np.array([0.85, 0.15, 0.05]),
                    "apple":  np.array([0.0, 0.9, 0.1]),
                    "banana": np.array([0.05, 0.95, 0.0]),
                    "car":    np.array([0.1, 0.0, 0.95]),
                }
                pairs = sorted(itertools.combinations(words, 2),
                               key=lambda p: -cosine_similarity(words[p[0]], words[p[1]]))
                for a, b in pairs[:2]:
                    print(a, b, round(cosine_similarity(words[a], words[b]), 3))
                print(project(np.array([2., 3.]), np.array([1., 1.])))   # [2.5 2.5]
            `,
        },
        break: {
            answer: `With a zero vector, the bottom of the fraction is 0, so NumPy returns nan with a "invalid value encountered" warning. A zero vector has no direction, so "the angle between them" means nothing.\n\nHandle it on purpose rather than letting nan spread silently through your results. Two reasonable choices: raise an error (best when a zero vector means a bug upstream), or return 0.0, "not similar to anything" (common in search, where an empty document shouldn't crash anything). Pick one and test it.`,
            code: py`
                import numpy as np
                import pytest

                def cosine_similarity(u, v):
                    nu, nv = np.linalg.norm(u), np.linalg.norm(v)
                    if nu == 0 or nv == 0:
                        raise ValueError("cosine similarity is undefined for a zero vector")
                    return u @ v / (nu * nv)

                def test_zero_vector_raises():
                    with pytest.raises(ValueError):
                        cosine_similarity(np.zeros(3), np.ones(3))

                def test_same_direction_is_one():
                    assert np.isclose(cosine_similarity(np.array([1., 2.]), np.array([2., 4.])), 1.0)
            `,
        },
        explain: {
            answer: `The dot product measures how much of one vector goes along the other: a·b = |a|·|b|·cos(angle).\n\nPull a box with a rope. If the rope is flat along the floor, all your pull moves the box. Raise the rope and less of the pull goes along the floor. Pull straight up, at 90° to the floor, and none of the pull goes along the floor: the box doesn't slide at all. That "along the floor" part is the projection, and at 90° it is 0, because cos 90° = 0. So two vectors at right angles have a dot product of 0: neither has any part along the other.`,
        },
    },
    'f1-t6': {
        derive: {
            answer: `Solve det(A − λI) = 0:\n(4 − λ)(3 − λ) − 1·2 = λ² − 7λ + 12 − 2 = λ² − 7λ + 10 = (λ − 5)(λ − 2) = 0.\nSo the eigenvalues are λ = 5 and λ = 2.\n\nFor λ = 5: A − 5I = [[−1, 1], [2, −2]]. The first row says −x + y = 0, so y = x. Eigenvector [1, 1]. Check: A·[1, 1] = [5, 5] = 5·[1, 1] ✓.\n\nFor λ = 2: A − 2I = [[2, 1], [2, 1]], so 2x + y = 0 and y = −2x. Eigenvector [1, −2]. Check: A·[1, −2] = [4 − 2, 2 − 6] = [2, −4] = 2·[1, −2] ✓.\n\nAny multiple of an eigenvector is also an eigenvector, so [2, 2] or [0.707, 0.707] are equally right.`,
        },
        build: {
            answer: `Power iteration: start with a random vector, multiply by A, rescale to length 1, and repeat. Each multiplication stretches the part along the biggest eigenvector the most, so after a few dozen steps only that direction is left. The eigenvalue is then v·Av (the Rayleigh quotient).\n\nFor [[4, 1], [2, 3]] it finds 5 and [0.707, 0.707], the same as np.linalg.eig.`,
            code: py`
                import numpy as np

                def power_iteration(A, steps=100, seed=0):
                    v = np.random.default_rng(seed).normal(size=A.shape[0])
                    for _ in range(steps):
                        v = A @ v
                        v = v / np.linalg.norm(v)
                    return v @ A @ v, v

                A = np.array([[4., 1.], [2., 3.]])
                value, vector = power_iteration(A)
                print(round(value, 6), vector.round(3))        # 5.0 [0.707 0.707]
                values, vectors = np.linalg.eig(A)
                print(values, vectors[:, np.argmax(values)].round(3))
            `,
        },
        break: {
            answer: `It never settles. Each multiplication turns the vector by another 90°, so it goes round and round and comes back to where it started every 4 steps.\n\nWhy: a rotation leaves no direction unchanged, so it has no real eigenvectors. Its eigenvalues are the complex numbers i and −i. Power iteration also needs one eigenvalue that is strictly bigger in size than all the others, so one direction can win. Here both have size 1, so neither wins.\n\nThe lesson: power iteration only works when there is a single dominant eigenvalue, and it slows down when the top two are close in size.`,
            code: py`
                import numpy as np

                R = np.array([[0., -1.], [1., 0.]])
                v = np.array([1., 0.])
                for step in range(5):
                    print(step, v)
                    v = R @ v                    # [1,0] → [0,1] → [-1,0] → [0,-1] → [1,0]
                print(np.linalg.eig(R)[0])       # [0.+1.j 0.-1.j]: complex, both size 1
            `,
        },
        explain: {
            answer: `Spin a globe. Every point on the surface moves, except the points on the axis, which stay exactly where they are. The axis is an eigenvector: a direction the transformation doesn't turn. Its eigenvalue says how much things along it are stretched; for a spin, that is 1, no stretch at all.\n\nWhere the picture breaks: most matrices don't spin, they stretch. For them, an eigenvector stays on its own line but gets longer or shorter (λ = 3 triples it, λ = 0.5 halves it), and a negative λ flips it to point the other way. Also, a flat 2D rotation has no axis at all, so it has no real eigenvectors. And a matrix can have several eigenvectors that aren't at right angles to each other, unlike the one axis of a globe.`,
        },
    },
    'f1-t7': {
        derive: {
            answer: `Write the SVD of the centred data: X = U·Σ·Vᵀ, where U and V have orthonormal columns (UᵀU = I) and Σ is diagonal with the singular values σᵢ.\n\nThen XᵀX = (UΣVᵀ)ᵀ(UΣVᵀ) = V·Σ·Uᵀ·U·Σ·Vᵀ = V·Σ²·Vᵀ.\n\nMultiply both sides by V: XᵀX·V = V·Σ². Read it column by column: XᵀX·vᵢ = σᵢ²·vᵢ. So each right singular vector vᵢ is an eigenvector of XᵀX, with eigenvalue σᵢ².\n\nThe covariance matrix is C = XᵀX / (n − 1), so its eigenvalues are λᵢ = σᵢ² / (n − 1), with the same eigenvectors. That is why PCA can be done with SVD on X, which is more accurate than forming XᵀX first.`,
        },
        build: {
            answer: `Centre the data (subtract each column's mean), take the SVD, and the rows of Vᵀ are the principal directions. Project onto the first two to plot, and the explained-variance ratio is σᵢ² / Σσ².\n\nOn Iris, the first component alone keeps about 92% of the variance and the first two about 98%. In the 2-D plot, the three species separate clearly along the first component.\n\nScikit-learn is only used to load the data. The PCA itself is NumPy.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt
                from sklearn.datasets import load_iris      # only to load the data

                iris = load_iris()
                X, y = iris.data, iris.target                # (150, 4)

                Xc = X - X.mean(axis=0)                      # centre first
                U, S, Vt = np.linalg.svd(Xc, full_matrices=False)
                ratio = S**2 / np.sum(S**2)
                Z = Xc @ Vt[:2].T                            # coordinates in the top 2 components
                print(ratio.round(3))                        # [0.925 0.053 0.017 0.005]

                fig, axes = plt.subplots(1, 2, figsize=(10, 4))
                axes[0].scatter(Z[:, 0], Z[:, 1], c=y, s=12)
                axes[0].set_xlabel("PC 1"); axes[0].set_ylabel("PC 2")
                axes[1].plot(np.arange(1, 5), np.cumsum(ratio), marker="o")
                axes[1].set_xlabel("number of components"); axes[1].set_ylabel("variance kept")
                plt.tight_layout(); plt.show()
            `,
        },
        break: {
            answer: `Without centring, the first "component" points from the origin towards the middle of the data cloud, instead of along the cloud's longest axis. On Iris it lines up almost exactly with the mean vector (cosine about 0.99), while the true first component is a different direction.\n\nWhy it is wrong: PCA is meant to find the directions in which the data varies. Variance is measured around the mean. Without centring, the SVD also "explains" the distance from the origin to the data, which is not variation at all, just where the cloud happens to sit. So always subtract the mean (and, if features use very different units, divide by their standard deviation too).`,
            code: py`
                import numpy as np
                from sklearn.datasets import load_iris

                X = load_iris().data
                mean = X.mean(axis=0)
                first_raw = np.linalg.svd(X, full_matrices=False)[2][0]
                first_centred = np.linalg.svd(X - mean, full_matrices=False)[2][0]

                cos = lambda a, b: abs(a @ b) / (np.linalg.norm(a) * np.linalg.norm(b))
                print(round(cos(first_raw, mean), 3))           # ≈ 0.99: it just found the mean
                print(round(cos(first_raw, first_centred), 3))  # a different direction
            `,
        },
        explain: {
            answer: `Picture a cloud of points shaped like a rugby ball. It has a long axis, a medium one and a short one. PCA finds those axes, longest first, and lets you keep only the long ones. Describing each point by where it sits along the long axis (and maybe the medium one) loses very little, because the points barely spread along the short axis anyway. That is how PCA turns many features into a few, while keeping most of the information.\n\nOne case where it fails: when the data lies on a curve, like points along a spiral or a bent sheet. PCA only finds straight axes, so it squashes the curve flat and points that were far apart along the curve land on top of each other. Another: when the direction that separates two classes has small variance, PCA may throw exactly that direction away.`,
        },
    },
    'f1-t8': {
        derive: {
            answer: `Chain rule: derivative = outer rate (at the inside) × inner rate.\n\nsin(x²): inner x², rate 2x; outer sin, rate cos. Answer: cos(x²)·2x.\n\ne^(3x + 1): inner 3x + 1, rate 3; outer eᵘ, rate eᵘ. Answer: 3e^(3x + 1).\n\nlog(1 + eˣ): inner 1 + eˣ, rate eˣ; outer log u, rate 1/u. Answer: eˣ / (1 + eˣ). That is the sigmoid function: the derivative of softplus is the sigmoid.\n\n(2x + 1)³: inner 2x + 1, rate 2; outer u³, rate 3u². Answer: 3(2x + 1)²·2 = 6(2x + 1)².\n\nAt x = 0.5 these are about 0.969, 36.547, 0.622 and 24.`,
        },
        build: {
            answer: `The central difference looks a little to both sides: f′(x) ≈ (f(x + h) − f(x − h)) / 2h. Its error shrinks with h², much faster than the one-sided (f(x + h) − f(x)) / h.\n\nAt x = 0.5, with h = 1e-5, all four numerical answers match the hand-derived formulas to about 8 or more digits.`,
            code: py`
                import numpy as np

                def numerical_derivative(f, x, h=1e-5):
                    return (f(x + h) - f(x - h)) / (2 * h)

                cases = [
                    (lambda x: np.sin(x**2),        lambda x: np.cos(x**2) * 2 * x),
                    (lambda x: np.exp(3 * x + 1),   lambda x: 3 * np.exp(3 * x + 1)),
                    (lambda x: np.log(1 + np.exp(x)), lambda x: np.exp(x) / (1 + np.exp(x))),
                    (lambda x: (2 * x + 1) ** 3,    lambda x: 6 * (2 * x + 1) ** 2),
                ]
                for f, df in cases:
                    approx, exact = numerical_derivative(f, 0.5), df(0.5)
                    print(round(exact, 6), f"{abs(approx - exact):.1e}")
                    assert np.isclose(approx, exact, rtol=1e-6)
            `,
        },
        break: {
            answer: `h = 1e-5 is the most accurate, with an error around 1e-10 or smaller. Both extremes fail, for opposite reasons.\n\nh = 1e-1 is too big: the formula assumes the curve is nearly straight between x − h and x + h. Over a wide step it isn't, so you get a truncation error, around 1e-3 to 1e-2 here.\n\nh = 1e-12 is too small: f(x + h) and f(x − h) are now almost the same number, and floats keep only about 16 significant digits. Subtracting two nearly equal numbers wipes out most of those digits (catastrophic cancellation), and dividing by the tiny 2h magnifies what is left. The error comes back up, to about 1e-5: a million times worse than h = 1e-5.\n\nThe sweet spot for the central difference is roughly h ≈ 1e-5 to 1e-6, about the cube root of the float precision.`,
            code: py`
                import numpy as np

                f = lambda x: np.sin(x**2)
                exact = np.cos(0.25) * 2 * 0.5
                for h in [1e-1, 1e-5, 1e-12]:
                    approx = (f(0.5 + h) - f(0.5 - h)) / (2 * h)
                    print(h, f"{abs(approx - exact):.1e}")
            `,
        },
        explain: {
            answer: `Think of gears. If gear A turns gear B 3 times as fast, and B turns gear C 2 times as fast, then A turns C 3 × 2 = 6 times as fast. You multiply the rates along the chain.\n\nThe chain rule is the same: for f(g(x)), how fast the output changes with x is (how fast f changes with g) × (how fast g changes with x). Each function in the chain is one gear, and the overall rate is all the gear ratios multiplied together. Backpropagation is this rule applied through every layer of a network.`,
        },
    },
    'f1-t9': {
        derive: {
            answer: `f(x, y) = x²y + 3y².\n∂f/∂x: treat y as a constant, so 2xy.\n∂f/∂y: treat x as a constant, so x² + 6y.\nGradient: ∇f = [2xy, x² + 6y]. At (1, 2) that is [4, 13].\n\ng(x, y) = [x + y, xy, x²] has 3 outputs and 2 inputs, so the Jacobian has 3 rows and 2 columns: one row per output, holding its partial derivatives with respect to x and y.\nRow 1, x + y: [1, 1]\nRow 2, xy: [y, x]\nRow 3, x²: [2x, 0]\nJ = [[1, 1], [y, x], [2x, 0]]. At (1, 2): [[1, 1], [2, 1], [2, 0]].`,
        },
        build: {
            answer: `Nudge one input at a time, both up and down by h, and take the central difference. Each nudge gives one entry of the gradient. The same function, applied to each output of g, builds the Jacobian row by row.\n\nAt (1, 2) it gives [4, 13] for f and [[1, 1], [2, 1], [2, 0]] for g, matching the hand answers. Later, to check backprop, compare this against the gradient your code computes, using a relative error: below about 1e-6 means your backprop is right.`,
            code: py`
                import numpy as np

                def numerical_gradient(f, x, h=1e-5):
                    x = np.asarray(x, dtype=float)
                    grad = np.zeros_like(x)
                    for i in range(x.size):
                        step = np.zeros_like(x)
                        step[i] = h
                        grad[i] = (f(x + step) - f(x - step)) / (2 * h)
                    return grad

                f = lambda v: v[0]**2 * v[1] + 3 * v[1]**2
                print(numerical_gradient(f, [1, 2]).round(6))          # [ 4. 13.]

                g = lambda v: np.array([v[0] + v[1], v[0] * v[1], v[0]**2])
                J = np.stack([numerical_gradient(lambda v, k=k: g(v)[k], [1, 2]) for k in range(3)])
                print(J.round(6))                                       # [[1 1] [2 1] [2 0]]
            `,
        },
        break: {
            answer: `The checker says the gradient of |x| at 0 is 0: (|h| − |−h|) / 2h = (h − h) / 2h = 0.\n\nBut the true derivative doesn't exist there. Just left of 0 the slope is −1, just right of it the slope is +1, and at 0 there is a sharp corner, so there is no single slope. The central difference averages the two sides and reports 0, which looks like a real answer but isn't.\n\nWhy it matters: ReLU has the same corner at 0. Frameworks simply pick a value there (PyTorch uses 0 for ReLU), and in practice inputs rarely land exactly on the corner. But a gradient check run right at a kink can disagree with your backprop for no real reason, so check at random points away from corners.`,
            code: py`
                import numpy as np

                f = lambda x: abs(x)
                h = 1e-5
                print((f(0 + h) - f(0 - h)) / (2 * h))     # 0.0, but the slopes are -1 and +1
                print((f(0 + h) - f(0)) / h, (f(0) - f(0 - h)) / h)   # 1.0 and -1.0
            `,
        },
        explain: {
            answer: `Stand on a hill. Step east: how steeply does the ground rise? Step north: how steeply? Those two slopes, written together, are the gradient vector.\n\nIt points uphill, in the steepest direction, because of how slopes combine: the slope in any direction you choose is the gradient dotted with that direction, which is |gradient| × cos(angle between them). That is biggest when the angle is 0, when you walk exactly along the gradient. So the gradient points straight up the steepest slope, its length says how steep that is, and walking the opposite way is the fastest way down. That is what gradient descent does.`,
        },
    },
    'f1-t10': {
        derive: {
            answer: `The gradient of f(w) = (w − 3)² is 2(w − 3). The update is w ← w − 0.1·2(w − 3).\n\nStep 1: w = 0 − 0.1·2·(0 − 3) = 0 + 0.6 = 0.6\nStep 2: w = 0.6 − 0.1·2·(0.6 − 3) = 0.6 + 0.48 = 1.08\nStep 3: w = 1.08 − 0.1·2·(1.08 − 3) = 1.08 + 0.384 = 1.464\n\nw is moving towards 3, the minimum, where the gradient is 0.\n\nWhy, exactly: subtract 3 from both sides of the update and you get (w − 3) ← (w − 3)·(1 − 2·0.1) = 0.8·(w − 3). So each step removes 20% of the remaining distance: 3 → 2.4 → 1.92 → 1.536 from the target. It gets closer and closer, with steps that shrink as the slope flattens.`,
        },
        build: {
            answer: `The same loop works for any differentiable loss: compute the gradient, step against it, repeat. On (w − 3)², w rises quickly towards 3 and flattens out.\n\nFor linear regression on real data, the diabetes dataset (from scikit-learn, only to load it) predicts disease progression from body mass index. Scale the feature first; then gradient descent with a learning rate of 0.1 brings the loss down smoothly, and the weights match the exact least-squares answer from np.polyfit.`,
            code: py`
                import numpy as np
                import matplotlib.pyplot as plt
                from sklearn.datasets import load_diabetes       # only to load the data

                w, ws = 0.0, []
                for _ in range(50):
                    ws.append(w)
                    w -= 0.1 * 2 * (w - 3)

                d = load_diabetes(scaled=False)
                x = d.data[:, 2]                                  # body mass index
                x = (x - x.mean()) / x.std()                      # scale the feature
                y = d.target
                a, b, losses = 0.0, 0.0, []
                for _ in range(200):
                    pred = a * x + b
                    losses.append(np.mean((pred - y) ** 2))
                    a -= 0.1 * np.mean(2 * (pred - y) * x)
                    b -= 0.1 * np.mean(2 * (pred - y))
                print(round(a, 2), round(b, 2), np.polyfit(x, y, 1).round(2))

                fig, axes = plt.subplots(1, 2, figsize=(10, 4))
                axes[0].plot(ws); axes[0].set_xlabel("step"); axes[0].set_ylabel("w")
                axes[1].plot(losses); axes[1].set_xlabel("step"); axes[1].set_ylabel("loss (MSE)")
                plt.tight_layout(); plt.show()
            `,
        },
        break: {
            answer: `The update gives (w − 3) ← (w − 3)·(1 − 2η), so everything depends on the factor 1 − 2η:\n\n• η = 0.01: factor 0.98. Each step removes only 2% of the distance. Slow.\n• η = 0.5: factor 0. It jumps straight to w = 3 in one step. The fastest possible here.\n• η = 0.9: factor −0.8. The sign flips each step, so w jumps to the other side of 3, but each jump is shorter. It swings from side to side and still settles.\n• η = 1.1: factor −1.2. It swings to the other side and lands further away each time: 0 → 6.6 → −1.32 → 8.18 … It explodes.\n\nThe general rule for this kind of bowl: the steps shrink only when |1 − 2η| < 1, so η must be between 0 and 1. For real losses the limit depends on how curved the loss is, which is why a learning rate that works on one problem can blow up another.`,
            code: py`
                for lr in [0.01, 0.5, 0.9, 1.1]:
                    w, path = 0.0, []
                    for _ in range(5):
                        path.append(round(w, 2))
                        w -= lr * 2 * (w - 3)
                    print(lr, path)
                # 0.01 [0.0, 0.06, 0.12, 0.18, 0.23]
                # 0.5 [0.0, 3.0, 3.0, 3.0, 3.0]
                # 0.9 [0.0, 5.4, 1.08, 4.54, 1.77]
                # 1.1 [0.0, 6.6, -1.32, 8.18, -3.22]
            `,
        },
        explain: {
            answer: `The learning rate is how big a step the model takes downhill each time it learns. Too small, and training crawls: it may take forever, or stop before it gets anywhere good. Too big, and it overshoots the bottom and lands further up the other side each time, so the loss jumps around or explodes into nan.`,
        },
    },
    'f1-t11': {
        derive: {
            answer: `Biased coin: X = 1 with probability 0.3, else 0.\nE[X] = 1·0.3 + 0·0.7 = 0.3.\nE[X²] = 1²·0.3 = 0.3, so Var = E[X²] − E[X]² = 0.3 − 0.09 = 0.21. (The formula for any coin: p(1 − p).)\n\nSum of two fair dice: one die has E = 3.5 and Var = 91/6 − 3.5² = 35/12 ≈ 2.92.\nExpectations always add: E = 3.5 + 3.5 = 7.\nVariances add when the dice are independent: Var = 35/12 + 35/12 = 35/6 ≈ 5.83.`,
        },
        build: {
            answer: `Draw 100,000 samples from each and compare with the formulas: Bernoulli(0.3) has mean 0.3 and variance 0.21; Uniform(0, 1) has mean 0.5 and variance 1/12 ≈ 0.0833; the standard Gaussian has mean 0 and variance 1. With 100,000 samples, each match is good to about 2 or 3 decimal places.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                n = 100_000
                samples = {
                    "Bernoulli(0.3)": (rng.random(n) < 0.3).astype(float),
                    "Uniform(0, 1)":  rng.random(n),
                    "Gaussian(0, 1)": rng.normal(size=n),
                }
                formulas = {"Bernoulli(0.3)": (0.3, 0.21), "Uniform(0, 1)": (0.5, 1 / 12), "Gaussian(0, 1)": (0, 1)}
                for name, x in samples.items():
                    print(name, round(x.mean(), 3), round(x.var(), 3), "expected", formulas[name])
            `,
        },
        break: {
            answer: `For normal distributions, the average settles down as you take more samples: the spread of the average shrinks like 1/√n. With 10 samples it jumps around a lot, with 10,000 it barely moves between runs. That is the law of large numbers.\n\nThe Cauchy distribution breaks this. Its average never settles: averaging 10,000 samples is as jumpy as a single sample. Why: its tails are so heavy that the expectation doesn't exist. Extreme values, millions of times bigger than usual, turn up often enough that each one drags the average somewhere new. The law of large numbers needs a finite mean, and Cauchy has none.\n\nThe lesson for ML: averages, and anything built on them, like a mean loss, can be dominated by rare extreme values. Look at the data, and use robust measures such as the median when outliers are possible.`,
            code: py`
                import numpy as np

                rng = np.random.default_rng(0)
                for n in [10, 100, 10_000]:
                    gauss = [rng.normal(size=n).mean() for _ in range(5)]
                    cauchy = [rng.standard_cauchy(size=n).mean() for _ in range(5)]
                    print(n, np.round(gauss, 3), np.round(cauchy, 2))
                # The Gaussian averages close in on 0; the Cauchy ones stay all over the place.
            `,
        },
        explain: {
            answer: `A fair die lands on 1, 2, 3, 4, 5 or 6, each with probability 1/6. Its expectation is (1 + 2 + 3 + 4 + 5 + 6) / 6 = 3.5.\n\nYou can never actually roll a 3.5. The expectation isn't a likely outcome; it is the long-run average. Roll the die thousands of times and the average of all your rolls gets closer and closer to 3.5. That is what expectation means: the balance point of all the possible outcomes, each weighted by how likely it is.`,
        },
    },
    'f1-t12': {
        derive: {
            answer: `Same test as before: it catches 99% of sick people, and says "positive" for 5% of healthy people. Now 10% are sick.\n\nP(sick | positive) = P(positive | sick)·P(sick) / P(positive)\n= 0.99·0.10 / (0.99·0.10 + 0.05·0.90)\n= 0.099 / (0.099 + 0.045)\n= 0.099 / 0.144 ≈ 0.69.\n\nIt rises from about 17% to about 69%.\n\nWhy: the test didn't change, but the prior did. Think of 1,000 people. Before, 10 were sick (about 10 true positives) and 990 healthy (about 50 false positives), so most positives were false. Now 100 are sick (99 true positives) and 900 healthy (45 false positives), so most positives are real. How common the disease is matters as much as how good the test is.`,
        },
        build: {
            answer: `bayes() applies the formula. The simulation makes a million people, decides who is sick using the prior, gives each a test result with the right error rates, and counts how many of the positives are really sick. The two agree to about 2 decimal places: 0.167 for a 1% prior and 0.688 for 10%.`,
            code: py`
                import numpy as np

                def bayes(prior, sensitivity, false_positive_rate):
                    true_pos = sensitivity * prior
                    false_pos = false_positive_rate * (1 - prior)
                    return true_pos / (true_pos + false_pos)

                rng = np.random.default_rng(0)
                n = 1_000_000
                for prior in [0.01, 0.10]:
                    sick = rng.random(n) < prior
                    positive = np.where(sick, rng.random(n) < 0.99, rng.random(n) < 0.05)
                    simulated = sick[positive].mean()
                    print(prior, round(bayes(prior, 0.99, 0.05), 3), round(simulated, 3))
            `,
        },
        break: {
            answer: `With a prior of 0, the answer is always 0, whatever the test says. The top of the formula is sensitivity × prior = 0, so no amount of evidence can ever move it. A prior of exactly 1 is stuck in the same way at 1.\n\nWhy that is dangerous in real models: a model that gives something a probability of exactly 0 can never learn that it happens. In Naive Bayes, a word never seen with a class gets probability 0, and because probabilities are multiplied, one unseen word makes the whole class impossible. In a loss, log(0) is −infinity. The fix is to never allow exactly 0: smoothing (add a small count to everything), or clipping probabilities to a tiny minimum such as 1e-7.`,
            code: py`
                def bayes(prior, sensitivity, false_positive_rate):
                    true_pos = sensitivity * prior
                    return true_pos / (true_pos + false_positive_rate * (1 - prior))

                print(bayes(0.0, 0.99, 0.05))    # 0.0
                print(bayes(0.0, 1.0, 0.0001))   # still 0.0: no evidence can move it
            `,
        },
        explain: {
            answer: `A smoke alarm beeps. Is your house on fire? The alarm is very good at noticing fires, but fires are rare, and burnt toast happens all the time. So most beeps are toast, not fire.\n\nA medical test is the same. If a disease is rare, the few sick people produce a few true positives, but the huge number of healthy people, even with a small false-alarm rate, produce many more false positives. So among everyone who tests positive, most can still be healthy. To judge the result, you need both how good the test is and how common the disease is: that is Bayes' rule.`,
        },
    },
    'f1-t13': {
        derive: {
            answer: `Coin: h heads and t tails, with P(heads) = p.\nLikelihood: L(p) = pʰ·(1 − p)ᵗ.\nLog-likelihood: ℓ(p) = h·log p + t·log(1 − p).\nDerivative: h/p − t/(1 − p). Set it to 0: h(1 − p) = t·p, so h = p(h + t), and p = h / (h + t).\nThe MLE is simply the fraction of heads: 7 heads in 10 flips gives 0.7.\n\nGaussian mean, with the variance σ² fixed:\nℓ(μ) = −Σ(xᵢ − μ)² / (2σ²) + a constant.\nDerivative: Σ(xᵢ − μ) / σ². Set it to 0: Σxᵢ = n·μ, so μ = (1/n)·Σxᵢ, the sample mean.\nNotice that maximising this log-likelihood is the same as minimising the squared error Σ(xᵢ − μ)²: that is why MSE goes with Gaussian noise.`,
        },
        build: {
            answer: `Minimise the negative log-likelihood of a Gaussian with gradient descent. Learn log σ instead of σ, so σ can never go negative.\n\nOn Iris sepal lengths it converges to μ ≈ 5.843 and σ ≈ 0.825, the same as the formula answers: the sample mean and the standard deviation that divides by n (np.std with its default ddof = 0).`,
            code: py`
                import numpy as np
                from sklearn.datasets import load_iris      # only to load the data

                x = load_iris().data[:, 0]                   # sepal length, 150 values
                mu, log_sigma, lr = 0.0, 0.0, 0.05
                for _ in range(5000):
                    sigma = np.exp(log_sigma)
                    # gradients of the mean negative log-likelihood
                    grad_mu = -np.mean(x - mu) / sigma**2
                    grad_log_sigma = 1 - np.mean((x - mu) ** 2) / sigma**2
                    mu -= lr * grad_mu
                    log_sigma -= lr * grad_log_sigma

                print(round(mu, 3), round(np.exp(log_sigma), 3))   # 5.843 0.825
                print(round(x.mean(), 3), round(x.std(), 3))       # the formula answers
            `,
        },
        break: {
            answer: `3 heads out of 3: MLE says p = 3/3 = 1. The model is now certain that tails is impossible, after only three flips. That is overconfidence from too little data: MLE fits the data you saw exactly, however little of it there is.\n\nAdd one imaginary head and one imaginary tail: p = (3 + 1) / (3 + 2) = 0.8. Much more sensible. Those extra counts are a prior belief that coins are usually fairly balanced, and using them is MAP estimation (with a Beta(2, 2) prior), also called Laplace smoothing.\n\nWith lots of data the prior hardly matters: 700 heads in 1,000 flips gives 0.700 by MLE and 0.6996 with the extra counts. It matters most exactly when data is scarce.`,
        },
        explain: {
            answer: `Maximum likelihood means choosing the model that makes the training data as probable as possible: the probability the model gives to the right label of every example, all multiplied together.\n\nMultiplying thousands of small numbers is awkward, so take the log, which turns the product into a sum, and maximising a sum of logs is the same as minimising minus that sum. Minus the average log-probability of the right label is exactly the cross-entropy loss. So when you train a classifier by minimising cross-entropy, you are doing maximum likelihood: pushing up the probability the model gives to the right answers.`,
        },
    },
    'f1-t14': {
        derive: {
            answer: `Accuracy: p̂ = 170 / 200 = 0.85.\n\nStandard error: √(p̂(1 − p̂) / n) = √(0.85·0.15 / 200) = √(0.1275 / 200) = √0.0006375 ≈ 0.0252.\n\n95% interval: p̂ ± 1.96·SE = 0.85 ± 1.96·0.0252 = 0.85 ± 0.049.\n\nSo roughly 80% to 90%. Read it as: on test sets like this one, the true accuracy is plausibly anywhere from 80% to 90%. Another model scoring 86% on these 200 examples would not be clearly better.`,
        },
        build: {
            answer: `The bootstrap needs no formula: resample the 200 right-or-wrong results with replacement, recompute the accuracy, do it 10,000 times, and take the middle 95% of those accuracies. It gives about 80% to 90%, the same as the formula, which is reassuring.\n\nIts strength is that the same recipe works for any metric, such as F1 or a median latency, where there is no simple standard-error formula.`,
            code: py`
                import numpy as np

                results = np.array([1] * 170 + [0] * 30)          # 1 = right, 0 = wrong
                rng = np.random.default_rng(0)
                boots = [rng.choice(results, size=200, replace=True).mean() for _ in range(10_000)]
                low, high = np.percentile(boots, [2.5, 97.5])
                se = np.sqrt(0.85 * 0.15 / 200)
                print(round(low, 3), round(high, 3))                  # about 0.80 0.90
                print(round(0.85 - 1.96 * se, 3), round(0.85 + 1.96 * se, 3))   # 0.801 0.899
            `,
        },
        break: {
            answer: `The same 4-point gap means very different things at different sizes.\n\nOn 50 examples (40 right versus 42 right), each accuracy has a margin of about ±11 points, so a 4-point gap is well inside the noise. On 5,000 examples (4,000 versus 4,200), the margin is about ±1 point, so the same 4-point gap is almost certainly real.\n\nCounting only the examples where the models disagree is sharper, because both models were tested on the same examples. If the gap is just luck, each disagreement is a coin flip for which model wins. With 50 examples, say they disagree on 8, B winning 5 and A winning 3: that is very possible by chance (p ≈ 0.73). With 5,000 examples, disagreeing on 800 with B winning 500: by chance that would almost never happen (p is about 1e-12). This is McNemar's test.`,
            code: py`
                from math import comb, sqrt

                def sign_test(wins_b, wins_a):
                    n, k = wins_b + wins_a, max(wins_b, wins_a)
                    tail = sum(comb(n, i) for i in range(k, n + 1)) / 2**n
                    return min(1.0, 2 * tail)                          # two-sided p-value

                for n, a, b, b_only, a_only in [(50, 40, 42, 5, 3), (5000, 4000, 4200, 500, 300)]:
                    margin = 1.96 * sqrt(0.8 * 0.2 / n)
                    print(n, f"gap {(b - a) / n:.0%}, margin ±{margin:.1%}, p = {sign_test(b_only, a_only):.2g}")
            `,
        },
        explain: {
            answer: `You taste one spoonful to judge a whole pot of soup. If you stirred first, one spoonful tells you a lot, but not everything, so you would say "it's about this salty, give or take a bit". That "give or take" range is a confidence interval. A bigger spoon, meaning more test data, gives a narrower range.\n\nA biased spoon ruins it. If you never stir and only skim the top, where the oil floats, your spoonful is unlike the pot, and the interval is narrow and confidently wrong. A confidence interval only covers random luck in which spoonful you took, not a systematic bias in how you took it. In ML, a test set that doesn't look like real users is a biased spoon.`,
        },
    },
    'f1-t15': {
        derive: {
            answer: `Entropy H(p) = −Σ pᵢ·log₂ pᵢ, measured in bits.\n\nFair coin: −(0.5·log₂ 0.5 + 0.5·log₂ 0.5) = −(0.5·(−1) + 0.5·(−1)) = 1 bit.\n\nCoin with p = 0.9: −(0.9·log₂ 0.9 + 0.1·log₂ 0.1) = −(0.9·(−0.152) + 0.1·(−3.322)) = 0.137 + 0.332 ≈ 0.47 bits. Less uncertain: you can usually guess heads.\n\nFair die: −6·(1/6)·log₂(1/6) = log₂ 6 ≈ 2.585 bits.\n\nThe fair die is the most uncertain: it has the most equally likely outcomes. For n equally likely outcomes, entropy is log₂ n, the most any distribution over n outcomes can have.`,
        },
        build: {
            answer: `entropy(p) = −Σ p·log p, cross_entropy(p, q) = −Σ p·log q, and kl(p, q) = Σ p·log(p/q). Skip terms where p is 0, because 0·log 0 counts as 0.\n\nBoth checks pass: kl equals cross-entropy minus entropy, and kl(p, p) is 0. KL is the extra cost of using q when the truth is p, and there is none when they are the same.`,
            code: py`
                import numpy as np

                def entropy(p):
                    p = np.asarray(p, float)
                    nz = p > 0
                    return -np.sum(p[nz] * np.log2(p[nz]))

                def cross_entropy(p, q):
                    p, q = np.asarray(p, float), np.asarray(q, float)
                    nz = p > 0
                    return -np.sum(p[nz] * np.log2(q[nz]))

                def kl(p, q):
                    p, q = np.asarray(p, float), np.asarray(q, float)
                    nz = p > 0
                    return np.sum(p[nz] * np.log2(p[nz] / q[nz]))

                p, q = [0.5, 0.3, 0.2], [0.4, 0.4, 0.2]
                assert np.isclose(kl(p, q), cross_entropy(p, q) - entropy(p))
                assert np.isclose(kl(p, p), 0.0)
                print(entropy([0.5, 0.5]), round(entropy([0.9, 0.1]), 3), round(entropy([1 / 6] * 6), 3))
                # 1.0 0.469 2.585
            `,
        },
        break: {
            answer: `KL becomes infinite. Where p says "this happens" but q says "probability 0", the term p·log(p/0) is infinite. The meaning is real: q claims something is impossible, and then it happens, which is infinitely surprising. It is the same reason a classifier that gives the right class probability 0 gets infinite cross-entropy loss, and why probabilities are clipped away from 0 in practice.\n\nKL is not symmetric. For p = [0.9, 0.1] and q = [0.5, 0.5], kl(p, q) ≈ 0.53 bits but kl(q, p) ≈ 0.74 bits. They measure different things: kl(p, q) is the cost of using q when the truth is p. So KL is not a true distance, and which way round you use it changes what a model learns.`,
            code: py`
                import numpy as np

                def kl(p, q):
                    p, q = np.asarray(p, float), np.asarray(q, float)
                    nz = p > 0
                    with np.errstate(divide="ignore"):
                        return np.sum(p[nz] * np.log2(p[nz] / q[nz]))

                print(kl([0.5, 0.5], [1.0, 0.0]))            # inf
                p, q = [0.9, 0.1], [0.5, 0.5]
                print(round(kl(p, q), 3), round(kl(q, p), 3))   # 0.531 0.737
            `,
        },
        explain: {
            answer: `You are packing for a trip. With the true weather forecast, p, you pack exactly what you need. With a wrong forecast, q, you pack badly: an umbrella you never use, and no coat for the cold.\n\nKL divergence, KL(p‖q), is the extra, wasted luggage: how much worse you do on average by planning with q when the weather really follows p. If the forecasts agree, there is no waste, so KL is 0. It can never be negative: a wrong forecast can't help you on average. And it isn't symmetric: packing for sunshine and getting snow costs differently from packing for snow and getting sunshine.`,
        },
    },
    'f1-t16': {
        derive: {
            answer: `Minimise x² + 2y² subject to x + y = 3.\n\nLagrangian: L = x² + 2y² − λ(x + y − 3).\nSet every partial derivative to 0:\n∂L/∂x = 2x − λ = 0, so x = λ/2.\n∂L/∂y = 4y − λ = 0, so y = λ/4.\n∂L/∂λ = −(x + y − 3) = 0, so x + y = 3.\n\nFrom the first two, x = 2y. Put that in the constraint: 3y = 3, so y = 1, x = 2 and λ = 4.\nThe minimum is 2² + 2·1² = 6.\n\nWhat λ means: if the constraint were relaxed to x + y = 3 + ε, the best value would rise by about 4ε. λ is the price of the constraint. And it makes sense that x > y: y is twice as expensive in the objective, so the solution uses less of it.`,
        },
        build: {
            answer: `A function is convex when the straight line between any two points on its graph lies on or above the curve: f(t·a + (1 − t)·b) ≤ t·f(a) + (1 − t)·f(b) for every a, b and t between 0 and 1.\n\nTest that at 10,000 random choices of a, b and t, with a tiny tolerance for rounding. w², |w| and eʷ never break it. sin(w) and w³ break it quickly. Remember the test can only prove a function is not convex; passing it is strong evidence, not proof.`,
            code: py`
                import numpy as np

                def looks_convex(f, trials=10_000, low=-5, high=5, seed=0):
                    rng = np.random.default_rng(seed)
                    a, b = rng.uniform(low, high, trials), rng.uniform(low, high, trials)
                    t = rng.random(trials)
                    return bool(np.all(f(t * a + (1 - t) * b) <= t * f(a) + (1 - t) * f(b) + 1e-9))

                for name, f in [("w²", np.square), ("|w|", np.abs), ("eʷ", np.exp), ("sin w", np.sin), ("w³", lambda w: w**3)]:
                    print(name, looks_convex(f))
                # w² True, |w| True, eʷ True, sin w False, w³ False
            `,
        },
        break: {
            answer: `f(w) = w⁴ − 3w² + w has two valleys. Gradient descent ends in whichever valley it starts above: starts left of about w = 0.17 (the hump between them) end near w ≈ −1.30, the deeper valley with f ≈ −3.51; starts to the right end near w ≈ 1.13, a shallower valley with f ≈ −1.07. Same algorithm, same learning rate, different answers, and half the time it misses the best one.\n\nOn the convex f(w) = w², every start ends at w = 0. A convex function has only one valley, so there is nowhere else to get stuck.\n\nNeural network losses are non-convex like the first one, which is why the starting weights, the random seed and the optimiser affect where training ends.`,
            code: py`
                import numpy as np

                f = lambda w: w**4 - 3 * w**2 + w
                grad = lambda w: 4 * w**3 - 6 * w + 1

                rng = np.random.default_rng(0)
                ends = []
                for start in rng.uniform(-2, 2, 20):
                    w = start
                    for _ in range(2000):
                        w -= 0.01 * grad(w)
                    ends.append(round(float(w), 2))
                print(sorted(set(ends)))                         # [-1.3, 1.13]
                print(round(f(-1.30), 2), round(f(1.13), 2))     # -3.51 -1.07
            `,
        },
        explain: {
            answer: `Drop a marble into a bowl. Wherever you drop it, it rolls to the same bottom point: there is only one lowest point, and nothing to get stuck on. A convex function is a bowl. Any point that is lowest nearby is also the lowest overall, so gradient descent is guaranteed to find the true minimum.\n\nDrop the same marble into a mountain range and it stops in whichever valley is below it, which may not be the deepest one. Non-convex functions, like neural network losses, are mountain ranges: there is no such guarantee, and where you end up depends on where you start.`,
        },
    },
};
