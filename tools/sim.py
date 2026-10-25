import math

# ---- 車輛（Honda Fit 級）----
L = 2.53        # 軸距
FRONT = 0.78    # 前懸
REAR = 0.69     # 後懸
W = 1.70        # 車寬
LOCK = 522.0    # 方向盤中心到死點角度
MAX_D = 35.0    # 前輪最大轉角

# ---- 場景（車頭朝 +x，車位在車尾方向的右側）----
SLOT_X0, SLOT_X1 = -6.0, 0.0
SLOT_Y0, SLOT_Y1 = 0.0, 2.3
CAR_Y0 = 0.20
LANE_Y = 3.35

FRONT_CAR = (0.4, 0.10, 4.4, 1.80)     # 車位前方
REAR_CAR = (-10.4, 0.10, -6.4, 1.80)   # 車位後方

D60 = math.pi / 3


def delta(w):
    return math.radians(w / LOCK * MAX_D)


def corners(x, y, th):
    c, s = math.cos(th), math.sin(th)
    pts = [(-REAR, W / 2), (-REAR, -W / 2), (L + FRONT, -W / 2), (L + FRONT, W / 2)]
    return [(x + u * c - v * s, y + u * s + v * c) for u, v in pts]


def poly_rect(r):
    x0, y0, x1, y1 = r
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def overlap(p1, p2):
    for poly in (p1, p2):
        for i in range(len(poly)):
            ax, ay = poly[i]
            bx, by = poly[(i + 1) % len(poly)]
            nx, ny = -(by - ay), (bx - ax)
            n = math.hypot(nx, ny)
            if n == 0:
                continue
            nx, ny = nx / n, ny / n
            a = [nx * px + ny * py for px, py in p1]
            b = [nx * px + ny * py for px, py in p2]
            if max(a) < min(b) or max(b) < min(a):
                return False
    return True


def run(start, segments, dt=0.02):
    x, y, th = start
    path = [(x, y, th)]
    marks = []
    for w, v, cond, max_d in segments:
        d = delta(w)
        travelled = 0.0
        while True:
            x += v * math.cos(th) * dt
            y += v * math.sin(th) * dt
            th += v * math.tan(d) / L * dt
            travelled += abs(v) * dt
            path.append((x, y, th))
            if cond(x, y, th) or travelled >= max_d:
                break
        marks.append((round(x, 2), round(y, 2), round(math.degrees(th), 1)))
    return path, marks


def right_gap(x, y, th):
    return min(p[1] for p in corners(x, y, th))


def front_gap(x, y, th):
    return min(p[0] for p in corners(x, y, th))


def report(name, path, marks):
    print(f"\n=== {name} ===")
    print("  marks:", marks)
    hx, hy, hth = path[-1]
    cs = corners(hx, hy, hth)
    print("  final corners:", [(round(a, 2), round(b, 2)) for a, b in cs])
    print("  final x-range: %.2f..%.2f  y-range: %.2f..%.2f" % (
        min(p[0] for p in cs), max(p[0] for p in cs),
        min(p[1] for p in cs), max(p[1] for p in cs)))
    bad = []
    for i, (x, y, th) in enumerate(path):
        cp = corners(x, y, th)
        if overlap(cp, poly_rect(FRONT_CAR)):
            bad.append(("front", i))
            break
    for i, (x, y, th) in enumerate(path):
        cp = corners(x, y, th)
        if overlap(cp, poly_rect(REAR_CAR)):
            bad.append(("rear", i))
            break
    print("  collision:", bad if bad else "none")
    print("  inside slot:",
          min(p[0] for p in cs) >= SLOT_X0 - 0.05 and max(p[0] for p in cs) <= SLOT_X1 + 0.05
          and min(p[1] for p in cs) >= 0.05 and max(p[1] for p in cs) <= SLOT_Y1 + 0.05)


# 起點：車尾 x = 2.1（B 柱對前車車頭 x=4.2）
HALF_START = (2.6 + REAR, LANE_Y, 0.0)   # B 柱對齊前車車頭（B 柱距車尾 1.55m）
# 起點：車尾 x = 0.2（車尾對前車車尾）
MID_START = (0.2 + REAR, LANE_Y, 0.0)
# 起點：車尾 x = -8.3（B 柱對後車車頭 x=-6.2）
NOSE_START = (-8.3 + REAR, LANE_Y, 0.0)

def center_x(x, y, th):
    return sum(p[0] for p in corners(x, y, th)) / 4


# ---- 1. 右打半圈 ----
p, m = run(HALF_START, [
    (-180, -0.35, lambda x, y, th: th >= math.radians(20), 20),
    (522, -0.35, lambda x, y, th: th <= 0.0, 20),
    (0, -0.35, lambda x, y, th: center_x(x, y, th) <= -2.8, 4),
])
report("半圈", p, m)

# ---- 2. 右打一圈 ----
p, m = run(MID_START, [
    (-360, -0.35, lambda x, y, th: th >= math.radians(30), 20),
    (522, -0.35, lambda x, y, th: th <= 0.0, 20),
    (0, -0.35, lambda x, y, th: center_x(x, y, th) <= -2.8, 4),
])
report("一圈", p, m)

# ---- 3. 右打滿 ----
p, m = run(MID_START, [
    (-522, -0.35, lambda x, y, th: th >= math.radians(45), 20),
    (0, -0.35, lambda x, y, th: right_gap(x, y, th) <= 0.35, 20),
    (522, -0.35, lambda x, y, th: th <= 0.0, 20),
    (0, -0.35, lambda x, y, th: center_x(x, y, th) <= -2.8, 4),
])
report("打滿", p, m)
