import math
from sim import (corners, overlap, poly_rect, run, FRONT_CAR, REAR_CAR,
                 HALF_START, MID_START)


def center(x, y, th):
    cs = corners(x, y, th)
    return (sum(p[0] for p in cs) / 4, sum(p[1] for p in cs) / 4)


def two_arc(start, w1, th1):
    return run(start, [
        (w1, -0.35, lambda x, y, t: t >= math.radians(th1), 40),
        (522, -0.35, lambda x, y, t: t <= 0, 40),
    ])


def first_hit(p):
    for i, (x, y, t) in enumerate(p):
        cp = corners(x, y, t)
        if overlap(cp, poly_rect(FRONT_CAR)):
            return ("front", i, round(x, 2), round(y, 2), round(math.degrees(t), 1))
        if overlap(cp, poly_rect(REAR_CAR)):
            return ("rear", i, round(x, 2), round(y, 2), round(math.degrees(t), 1))
    return None


for name, start, w1, th1 in [
    ("半圈", HALF_START, -180, 30),
    ("一圈", MID_START, -360, 40),
    ("打滿", MID_START, -522, 45),
    ("打滿", MID_START, -522, 50),
]:
    p, m = two_arc(start, w1, th1)
    x, y, t = p[-1]
    cx, cy = center(x, y, t)
    print(f"{name} th={th1}: end=({x:.2f},{y:.2f}) center=({cx:.2f},{cy:.2f}) hit={first_hit(p)}")
