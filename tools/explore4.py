import math
from sim import (L, REAR, W, corners, overlap, poly_rect, run, FRONT_CAR, REAR_CAR,
                 NOSE_START, LANE_Y, delta)


def a_pillar(x, y, th):
    u, v = 2.4, 0.8
    return (x + u * math.cos(th) - v * math.sin(th),
            y + u * math.sin(th) + v * math.cos(th))


def center(x, y, th):
    cs = corners(x, y, th)
    return (sum(p[0] for p in cs) / 4, sum(p[1] for p in cs) / 4)


def rg(x, y, th):
    return min(p[1] for p in corners(x, y, th))


def hit(p):
    for i, (x, y, t) in enumerate(p):
        cp = corners(x, y, t)
        if overlap(cp, poly_rect(FRONT_CAR)):
            return ("front", i, round(x, 2), round(y, 2), round(math.degrees(t), 1))
        if overlap(cp, poly_rect(REAR_CAR)):
            return ("rear", i, round(x, 2), round(y, 2), round(math.degrees(t), 1))
    return None


for a_stop in [2.20, 2.30, 2.40, 2.50]:
    segs = [
        (-522, 0.35, lambda x, y, t: a_pillar(x, y, t)[1] <= a_stop, 30),
        (522, 0.35, lambda x, y, t: t >= math.radians(12), 30),
        (0, -0.35, lambda x, y, t: center(x, y, t)[0] <= -2.8, 30),
        (522, -0.35, lambda x, y, t: t <= 0, 30),
    ]
    p, m = run(NOSE_START, segs)
    x, y, t = p[-1]
    cx, cy = center(x, y, t)
    print(f"A柱 {a_stop}: marks={m} end=({x:.2f},{y:.2f},{math.degrees(t):.1f}) center=({cx:.2f},{cy:.2f}) hit={hit(p)}")
