"""產生路邊停車四種打法的俯視示意圖（SVG）。"""
import math
import os
from sim import (L, FRONT, REAR, W, SLOT_X0, SLOT_X1, SLOT_Y1,
                 FRONT_CAR, REAR_CAR, LANE_Y, HALF_START, MID_START,
                 corners, run)

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "diagrams")

W_PX, H_PX = 880, 300
SC = 49.4
X_MIN = -10.8
Y_MIN = -0.55

BG = "#0f141a"
ROAD = "#151c25"
WALK = "#0a0e13"
CURB = "#5b6673"
SLOT = "#4b5c6e"
OTHER = "#39434f"
OTHER_LINE = "#4e5b69"
ME = "#ffb020"
ME_FILL = "rgba(255,176,32,0.14)"
PATH_C = "#ffb020"
TXT = "#cfd8e3"
DIM = "#8b98a8"

FONT = "font-family=\"system-ui,-apple-system,'Noto Sans TC','PingFang TC',sans-serif\""


def px(x):
    return (x - X_MIN) * SC


def py(y):
    return H_PX - (y - Y_MIN) * SC


def poly(pts, **kw):
    d = " ".join(f"{px(a):.1f},{py(b):.1f}" for a, b in pts)
    attrs = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in kw.items())
    return f'<polygon points="{d}" {attrs}/>'


def rect(x0, y0, x1, y1, **kw):
    return poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], **kw)


def car_shape(x, y, th, fill, stroke, sw=2, dash=None, op=1.0):
    pts = corners(x, y, th)
    d = " ".join(f"{px(a):.1f},{py(b):.1f}" for a, b in pts)
    extra = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<polygon points="{d}" fill="{fill}" stroke="{stroke}" '
            f'stroke-width="{sw}" opacity="{op}"{extra}/>')


def text(x, y, s, size=15, fill=TXT, anchor="start", weight="500", op=1.0):
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" '
            f'text-anchor="{anchor}" font-weight="{weight}" opacity="{op}" {FONT}>{s}</text>')


def badge(x, y, n):
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="13" fill="{ME}"/>'
            + text(x, y + 5, str(n), 15, "#10151b", "middle", "700"))


def trail(path, step=6):
    pts = []
    for i in range(0, len(path), step):
        x, y, t = path[i]
        cs = corners(x, y, t)
        pts.append(f"{px(sum(p[0] for p in cs) / 4):.1f},{py(sum(p[1] for p in cs) / 4):.1f}")
    x, y, t = path[-1]
    cs = corners(x, y, t)
    pts.append(f"{px(sum(p[0] for p in cs) / 4):.1f},{py(sum(p[1] for p in cs) / 4):.1f}")
    return " ".join(pts)


def base(title, sub):
    """共用底圖：路面、路緣、車位、前後車。"""
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W_PX} {H_PX}" width="{W_PX}" height="{H_PX}">']
    s.append(f'<rect width="{W_PX}" height="{H_PX}" fill="{BG}"/>')
    # 路面 / 人行道
    s.append(poly([(X_MIN, 0), (5.2, 0), (5.2, 5.2), (X_MIN, 5.2)], fill=ROAD))
    s.append(poly([(X_MIN, Y_MIN), (5.2, Y_MIN), (5.2, 0), (X_MIN, 0)], fill=WALK))
    # 路緣
    s.append(f'<line x1="{px(X_MIN):.1f}" y1="{py(0):.1f}" x2="{px(5.2):.1f}" y2="{py(0):.1f}" '
             f'stroke="{CURB}" stroke-width="4"/>')
    # 車位標線
    s.append(rect(SLOT_X0, 0, SLOT_X1, SLOT_Y1, fill="rgba(75,92,110,0.14)", stroke=SLOT,
                  stroke_width=2.5, stroke_dasharray="10 8"))
    # 前後車
    s.append(rect(*FRONT_CAR, fill=OTHER, stroke=OTHER_LINE, stroke_width=2))
    s.append(rect(*REAR_CAR, fill=OTHER, stroke=OTHER_LINE, stroke_width=2))
    s.append(text(px((FRONT_CAR[0] + FRONT_CAR[2]) / 2), py((FRONT_CAR[1] + FRONT_CAR[3]) / 2) + 5,
                  "前車", 13, DIM, "middle"))
    s.append(text(px((REAR_CAR[0] + REAR_CAR[2]) / 2), py((REAR_CAR[1] + REAR_CAR[3]) / 2) + 5,
                  "後車", 13, DIM, "middle"))
    # 標題
    s.append(text(22, 26, title, 18, TXT, "start", "700"))
    if sub:
        s.append(text(22, 46, sub, 12.5, DIM))
    return s


def finish(s):
    s.append(f'<text x="{W_PX - 20}" y="{H_PX - 14}" font-size="11" fill="{DIM}" '
             f'text-anchor="end" {FONT}>俯視示意，比例與實際停車格略有差異</text>')
    s.append("</svg>")
    return "\n".join(s)


def save(name, s):
    os.makedirs(OUT, exist_ok=True)
    p = os.path.join(OUT, name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(finish(s))
    print("wrote", p)


# ---------- 前三種：實算軌跡 ----------

def build_form(name, title, start, wheel, th1, labels, note, ref):
    """labels: 三張圖各自的步驟說明。"""
    p1, _ = run(start, [(wheel, -0.35, lambda x, y, t: t >= math.radians(th1), 40)])
    p2, _ = run(start, [(wheel, -0.35, lambda x, y, t: t >= math.radians(th1), 40),
                        (522, -0.35, lambda x, y, t: t <= 0, 40)])

    def panel(idx, sub, path, end, badge_pts, adjust=False):
        s = base(title, sub)
        if len(path) > 1:
            s.append(f'<polyline points="{trail(path)}" fill="none" stroke="{PATH_C}" '
                     f'stroke-width="3.5" opacity="0.6" stroke-linecap="round"/>')
        # 起點（車道上的起始位置）
        s.append(car_shape(*start, "none", ME, 2, "7 6", 0.5))
        for i, (mx, my, mt) in enumerate(badge_pts):
            s.append(badge(px(mx) - 20, py(my) - 40, i + 1))
        # 當前車
        s.append(car_shape(*end, ME_FILL, ME, 3))
        if idx == 1 and ref:
            u, v, lab = ref
            rx, ry = start[0] + u, start[1] + v
            s.append(f'<circle cx="{px(rx):.1f}" cy="{py(ry):.1f}" r="5.5" fill="none" '
                     f'stroke="#7dd3fc" stroke-width="2.5"/>')
            s.append(text(px(rx) + 10, py(ry) - 12, lab, 12, "#7dd3fc", "start"))
        if adjust:
            cs = corners(*end)
            cx = sum(q[0] for q in cs) / 4
            cy = sum(q[1] for q in cs) / 4
            s.append(f'<line x1="{px(cx - 0.75):.1f}" y1="{py(cy):.1f}" x2="{px(cx + 0.75):.1f}" '
                     f'y2="{py(cy):.1f}" stroke="{ME}" stroke-width="2.5" opacity="0.85" '
                     f'marker-start="url(#ar2)" marker-end="url(#ar2)"/>')
            s.append(f'<defs><marker id="ar2" markerWidth="8" markerHeight="8" refX="6" refY="4" '
                     f'orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="{ME}"/></marker></defs>')
            s.append(text(px(cx), py(cy) + 58, "前後微調", 12, ME, "middle"))
        s.append(text(W_PX - 20, 26, note, 12.5, DIM, "end"))
        save(f"{name}-{idx}.svg", s)

    panel(1, labels[0], [], start, [])
    panel(2, labels[1], p1, p1[-1], [p1[-1]])
    panel(3, labels[2], p2, p2[-1], [p1[-1], p2[-1]], adjust=True)


build_form(
    "half", "右打半圈",
    HALF_START, -180, 30,
    ["① 順著前車平行前進，右側 B 柱對齊前車車頭，右打半圈開始倒車",
     "② 右側後視鏡看到右前門把手與路邊重合，方向盤左打滿繼續倒車",
     "③ 車身擺正，視狀況前後微調"],
    "外擺幅度：小",
    (0.86, -0.85, "B 柱（右側）對前車車頭"),
)

build_form(
    "full", "右打一圈",
    MID_START, -360, 40,
    ["① 順著前車平行前進，車尾對齊前車車尾，右打一圈開始倒車",
     "② 右側後視鏡看到右前門把手與路邊重合，方向盤左打滿繼續倒車",
     "③ 車身擺正，視狀況前後微調"],
    "外擺幅度：中",
    (-0.69, 0.0, "車尾對前車車尾"),
)

build_form(
    "lock", "右打滿",
    MID_START, -522, 46,
    ["① 車尾對齊前車車尾，方向盤右打滿開始倒車",
     "② 看到後車完整車頭時回正直倒；右側門把手對路邊時左打滿倒車",
     "③ 車身擺正，視狀況前後微調"],
    "外擺幅度：大",
    (-0.69, 0.0, "車尾對前車車尾"),
)


# ---------- 第 4 種：動作分解 ----------

def nose_pose():
    A = (-3.40, 3.06, math.radians(-36))
    B = (-4.20, 2.05, 0.0)
    C = (-4.30, 1.16, 0.0)
    return A, B, C


def ctr(p):
    cs = corners(*p)
    return (sum(q[0] for q in cs) / 4, sum(q[1] for q in cs) / 4)


def nose_diagram(idx, sub, show, arrows, marks=None):
    s = base("車頭先進", sub)
    s.append(car_shape(-8.3 + REAR, LANE_Y, 0, "none", ME, 2, "7 6", 0.42))
    s.append(text(px(-8.0), py(LANE_Y) - 26, "起始：B 柱對後車車頭", 11.5, DIM, "start", "400", 0.85))
    for i, p in enumerate(POSES):
        on = i in show
        s.append(car_shape(*p, ME_FILL if on else "none",
                           ME if on else "#8a6a2a", 3 if on else 2,
                           None if on else "6 6", 1.0 if on else 0.3))
    for (p_from, p_to, cdx, cdy, lab, lx, ly) in arrows:
        f0 = (p_from[0] + 3.31 * math.cos(p_from[2]), p_from[1] + 3.31 * math.sin(p_from[2]))
        f1 = (p_to[0] + 3.31 * math.cos(p_to[2]), p_to[1] + 3.31 * math.sin(p_to[2]))
        s.append(f'<path d="M {px(f0[0]):.1f} {py(f0[1]):.1f} Q '
                 f'{px((f0[0]+f1[0])/2 + cdx):.1f} {py((f0[1]+f1[1])/2 + cdy):.1f} '
                 f'{px(f1[0]):.1f} {py(f1[1]):.1f}" fill="none" stroke="{ME}" '
                 f'stroke-width="2.5" opacity="0.9" marker-end="url(#ar)"/>')
        s.append(text(px(lx), py(ly), lab, 12.5, ME))
    if marks:
        for (mx, my, lab) in marks:
            s.append(f'<circle cx="{px(mx):.1f}" cy="{py(my):.1f}" r="6" fill="none" '
                     f'stroke="#7dd3fc" stroke-width="2.5"/>')
            s.append(text(px(mx) + 10, py(my) - 8, lab, 12, "#7dd3fc"))
    s.append(f'<defs><marker id="ar" markerWidth="9" markerHeight="9" refX="7" refY="4.5" '
             f'orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="{ME}"/></marker></defs>')
    s.append(text(W_PX - 20, 26, "示意動作分解，非實際行駛軌跡", 11.5, DIM, "end"))
    save(f"nose-{idx}.svg", s)


POSES = nose_pose()
A, B, C = POSES

nose_diagram(1, "① B 柱對齊後車車頭，右打滿駛入車格；左 A 柱對白線時停", {0}, [],
             [(-0.99, 2.30, "左 A 柱對白線")])

nose_diagram(2, "② 左打滿往前開，把車身擺正（右後視鏡看車身與後車約 2 指）", {1},
             [(A, B, 0.8, 0.7, "左打滿往前", 0.9, 3.35)])

nose_diagram(3, "③ 左後視鏡看到後車車頭時回正直倒；右側門把手對路邊時左打滿倒車擺正", {2},
             [(B, C, 0.7, 0.2, "倒車擺正", 0.9, 2.55)])
