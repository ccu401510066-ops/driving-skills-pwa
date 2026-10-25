import math
from sim import (L, REAR, W, FRONT, LANE_Y, SLOT_X0, SLOT_X1, SLOT_Y0, SLOT_Y1,
                 FRONT_CAR, REAR_CAR, corners, overlap, poly_rect, run, delta,
                 HALF_START, MID_START)


def center(x, y, th):
    cs = corners(x, y, th)
    return (sum(p[0] for p in cs) / 4, sum(p[1] for p in cs) / 4)


def two_arc(start, w1, th1):
    return run(start, [
        (w1, -0.35, lambda x, y, t: t >= math.radians(th1), 40),
        (522, -0.35, lambda x, y, t: t <= 0, 40),
    ])


def scan(name, start, w1):
    print(f"\n=== {name} (w1={w1}) ===")
    print(" th1 |   end x,y      | center      | collide")
    for th1 in range(10, 61, 5):
        p, m = two_arc(start, w1, th1)
        x, y, t = p[-1]
        cx, cy = center(x, y, t)
        hit = "yes"
        bad = False
        for (px, py, pt) in p:
            cp = corners(px, py, pt)
            if overlap(cp, poly_rect(FRONT_CAR)) or overlap(cp, poly_rect(REAR_CAR)):
                bad = True
                break
        print(f" {th1:3d} | {x:6.2f},{y:5.2f} | {cx:6.2f},{cy:5.2f} | {'HIT' if bad else '-'}")


scan("半圈", HALF_START, -180)
scan("一圈", MID_START, -360)
scan("打滿", MID_START, -522)
