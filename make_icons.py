import zlib
import struct
import os

BG = (0x0B, 0x0F, 0x14)
FG = (0xFF, 0xB0, 0x20)


def render(size, scale=1.0):
    """畫一個方向盤圖示，回傳 RGBA rows。"""
    cx = cy = size / 2.0
    R = size * 0.30 * scale      # 外環中心半徑
    T = size * 0.070 * scale     # 外環線寬
    hub = size * 0.088 * scale   # 中央轂半徑
    spoke = size * 0.030 * scale # 輻條寬
    SS = 3

    rows = []
    for y in range(size):
        row = bytearray()
        for x in range(size):
            fr = fg = fb = 0
            for sy in range(SS):
                for sx in range(SS):
                    fx = x + (sx + 0.5) / SS - cx
                    fy = y + (sy + 0.5) / SS - cy
                    d = (fx * fx + fy * fy) ** 0.5
                    on = False
                    if abs(d - R) <= T / 2.0:
                        on = True
                    elif d <= hub:
                        on = True
                    elif abs(fy) <= spoke / 2.0 and abs(fx) <= R:
                        on = True
                    elif abs(fx) <= spoke / 2.0 and fy > 0 and d <= R:
                        on = True
                    if on:
                        fr += FG[0]
                        fg += FG[1]
                        fb += FG[2]
                    else:
                        fr += BG[0]
                        fg += BG[1]
                        fb += BG[2]
            n = SS * SS
            row += bytes((fr // n, fg // n, fb // n, 255))
        rows.append(row)
    return rows


def write_png(path, size, rows):
    raw = b''.join(b'\x00' + bytes(r) for r in rows)

    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xFFFFFFFF)

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    data = (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr)
            + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))
    with open(path, 'wb') as f:
        f.write(data)


out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'icons')
os.makedirs(out, exist_ok=True)

write_png(os.path.join(out, 'icon-192.png'), 192, render(192, 1.0))
write_png(os.path.join(out, 'icon-512.png'), 512, render(512, 1.0))
write_png(os.path.join(out, 'icon-512-maskable.png'), 512, render(512, 0.72))
print('icons written to', out)
