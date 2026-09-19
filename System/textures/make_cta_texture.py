# Generates System/textures/cta-texture.webp (copied to project/public/images/).
# Run: python make_cta_texture.py  (needs numpy + pillow). Fixed seed = same image every run.
#
# Original procedural texture for the PitchYes CTA band: motion-blurred green light patches
# (same *kind* of effect as the reference, generated from random noise — no source pixels used).
import numpy as np
from PIL import Image

rng = np.random.default_rng(20260919)
W, H = 2400, 1100          # working canvas (cropped to OUT after rotation)
OUT = (1920, 800)
ANGLE = 14                 # streak direction, degrees (downward to the right)


def smooth_noise(h, w, cell):
    """Value noise: random grid upscaled with bicubic interpolation."""
    small = rng.random((max(2, h // cell), max(2, w // cell)))
    img = Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32) / 255.0


def hblur(a, k, passes=3):
    """Long horizontal box blur (repeated ≈ gaussian), per row via cumulative sums."""
    for _ in range(passes):
        pad = np.pad(a, ((0, 0), (k, k)), mode="reflect")
        c = np.cumsum(pad, axis=1, dtype=np.float64)
        a = ((c[:, 2 * k:] - c[:, :-2 * k]) / (2 * k)).astype(np.float32)[:, : a.shape[1]]
    return a


def directional_blur(a, k):
    img = Image.fromarray(a)
    rot = np.asarray(img.rotate(ANGLE, resample=Image.BICUBIC, expand=True), dtype=np.float32)
    rot = hblur(rot, k)
    back = Image.fromarray(rot).rotate(-ANGLE, resample=Image.BICUBIC, expand=False)
    bw, bh = back.size
    left, top = (bw - a.shape[1]) // 2, (bh - a.shape[0]) // 2
    return np.asarray(back.crop((left, top, left + a.shape[1], top + a.shape[0])), dtype=np.float32)


# 1) light patches: layered blobs, contrast-shaped so bright areas are islands
blobs = 0.6 * smooth_noise(H, W, 160) + 0.3 * smooth_noise(H, W, 70) + 0.1 * smooth_noise(H, W, 30)
blobs = np.clip((blobs - 0.42) / 0.38, 0, 1) ** 1.6

# 2) fine grain that becomes streaks after the directional blur
grain = smooth_noise(H, W, 5) * 0.4 + smooth_noise(H, W, 14) * 0.6

field = blobs * (0.7 + 0.3 * grain)
field = directional_blur(field, 150)
streaks = directional_blur(grain, 160)
field = field * (0.85 + 0.15 * (streaks - streaks.mean()) / (streaks.std() + 1e-6))
field = directional_blur(field, 40)

# 3) tone map to the measured palette by percentile (dark forest → bright leaf green)
stops_q = np.array([0, 2, 10, 30, 50, 70, 90, 98, 99.7, 100])
stops_rgb = np.array([
    [1, 12, 18], [1, 15, 22], [1, 18, 24], [1, 32, 30], [1, 52, 39],
    [4, 85, 53], [71, 158, 88], [137, 210, 129], [170, 233, 163], [190, 242, 180],
], dtype=np.float32)
qs = np.percentile(field, stops_q)
rgb = np.stack([np.interp(field, qs, stops_rgb[:, c]) for c in range(3)], axis=-1)

# 4) subtle film grain so large flat areas don't band
rgb += rng.normal(0, 1.6, rgb.shape).astype(np.float32)
img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))

# crop the center and export
cx, cy = W // 2, H // 2
img = img.crop((cx - W // 2, cy - H // 2, cx + W // 2, cy + H // 2)).resize((OUT[0], int(OUT[0] * H / W)), Image.LANCZOS)
top = (img.height - OUT[1]) // 2
img = img.crop((0, top, OUT[0], top + OUT[1]))
img.save("cta-texture.webp", quality=80, method=6)

