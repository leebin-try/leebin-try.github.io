"""Build original explanatory SVGs and a finite prime-power illustration.

Standard library only. No proof archive, model or external dataset is downloaded.
The numerical example illustrates definitions; it is not evidence for all zeros.
Use --check in CI to compare committed assets with their reproducible source.
"""
import argparse
import csv
import hashlib
import html
import io
import json
import math
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/math/riemann-2026'
INK, MUTED, GREEN, TEAL = '#203029', '#607168', '#cceb7d', '#208980'


def text(x, y, value, size=26, color=INK, weight=400):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}">{html.escape(value)}</text>'


def box(x, y, width, height, fill='#edf0e6'):
    return f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="12" fill="{fill}"/>'


def arrow(x1, y1, x2, y2):
    return f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{TEAL}" stroke-width="4" fill="none" marker-end="url(#arrow)"/>'


def frame(title, body, height=675, dark=False):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 {height}" role="img" aria-label="{html.escape(title)}">
<title>{html.escape(title)}</title><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="{TEAL}"/></marker></defs>
<style>text{{font-family:Arial,sans-serif}}</style><rect width="1200" height="{height}" fill="{'#102635' if dark else '#f9faf7'}"/>{body}</svg>'''.encode()


def assets():
    images = {}
    body = text(66, 65, 'BIN / JOURNAL   ·   MATH', 20, '#a4bcbc')
    body += '<rect x="150" y="112" width="900" height="275" fill="#183848" rx="8"/>'
    for x, label in [(150, 'Re s = 0'), (600, 'Re s = 1/2'), (1050, 'Re s = 1')]:
        body += f'<path d="M{x} 120V380" stroke="{GREEN if x == 600 else "#507380"}" stroke-width="{5 if x == 600 else 2}"/>'
        body += text(x - 64, 420, label, 22, '#c2d5d3')
    for y in [155, 210, 282, 344]:
        body += f'<circle cx="600" cy="{y}" r="8" fill="{GREEN}"/>'
    body += text(195, 245, 'critical strip', 34, '#7b9ba5')
    body += text(675, 265, 'a proof to understand', 30, '#a5c5c4')
    body += text(66, 520, 'READING THE RIEMANN PROOF', 47, '#f0f4ea', 700)
    body += text(66, 575, 'Prime sums → lattices → a zero-free half-plane', 28, '#bad7d0')
    body += text(66, 626, 'Original schematic · points are not numerical zero verification', 19, '#9eb6b8')
    images['cover.svg'] = frame('Reading the Riemann proof: a schematic critical strip', body, dark=True)

    body = text(55, 65, 'ONE QUESTION, THREE LANGUAGES', 34, INK, 700)
    for x, title, lines in [
        (50, 'ARITHMETIC', ['prime powers', 'Λ(n), characters', 'weighted remainder']),
        (440, 'ANALYSIS', ['logarithmic derivative', 'Mellin / Laplace transform', 'zeros become singularities']),
        (830, 'GEOMETRY', ['integral structures', 'norms and covolumes', 'upper versus lower bounds']),
    ]:
        body += box(x, 145, 320, 300)
        body += text(x + 22, 200, title, 29, TEAL, 700)
        for i, line in enumerate(lines):
            body += text(x + 22, 265 + i * 58, line, 22)
    body += arrow(377, 292, 426, 292) + arrow(817, 292, 768, 292)
    body += text(55, 525, 'The bridge is an exact identity or a quantified inequality.', 29, INK, 600)
    body += text(55, 585, 'A diagram explains dependencies; it does not replace the proof of a bridge.', 24, MUTED)
    images['three-languages.svg'] = frame('Arithmetic, analysis and geometry meet through precise interfaces', body)

    body = text(55, 65, 'A LATTICE YOU CAN CALCULATE', 34, INK, 700)
    body += box(55, 112, 570, 450)
    for x in range(115, 600, 60):
        body += f'<path d="M{x} 150V520" stroke="#d7dfcf"/>'
    for y in range(160, 530, 60):
        body += f'<path d="M95 {y}H600" stroke="#d7dfcf"/>'
    body += '<rect x="175" y="220" width="120" height="180" fill="#cceb7d" fill-opacity=".65" stroke="#208980" stroke-width="3"/>'
    for x in range(175, 600, 120):
        for y in [220, 400]:
            body += f'<circle cx="{x}" cy="{y}" r="7" fill="{TEAL}"/>'
    body += arrow(175, 400, 295, 400) + arrow(175, 400, 175, 220)
    body += text(205, 440, '2 e₁', 27) + text(105, 310, '3 e₂', 27)
    for y, line in [(170, "L = Z²"), (235, "L′ = 2Z × 3Z"), (300, 'index [L : L′] = 6'), (365, 'covolume(L′) = 6'), (430, 'det(Gram) = 36')]:
        body += text(680, y, line, 31, INK, 600)
    body += text(55, 625, 'Finite index I changes log squared covolume by 2 log I.', 28, MUTED)
    images['lattice.svg'] = frame('A two-dimensional lattice illustrates index and squared covolume', body)

    body = text(55, 60, 'THE MATHEMATICAL INTERFACES', 34, INK, 700)
    for x, title, description in [(50, 'A / SHORT', 'norm + index control'), (440, 'B / ENOUGH', 'many independent forms'), (830, 'C / LONG', 'a covolume lower bound')]:
        body += box(x, 105, 320, 118) + text(x + 20, 150, title, 29, TEAL, 700) + text(x + 20, 195, description, 22)
    body += arrow(210, 230, 440, 300) + arrow(600, 230, 600, 300) + arrow(990, 230, 760, 300)
    body += box(245, 315, 710, 106, '#dfeabf') + text(292, 357, 'COMPARE THE SAME CORRECTED COVOLUME', 25, INK, 700)
    body += text(370, 398, 'm · totalRemainder ≤ f a (log b)⁵', 27)
    body += arrow(600, 429, 600, 468)
    body += box(100, 482, 1000, 140)
    body += text(140, 525, 'm ≍ √x  →  a one-sided prime-sum bound', 30, INK, 600)
    body += text(140, 580, 'Landau + twists  →  no zeros to the right  →  symmetry', 27)
    body += text(55, 696, 'Source interfaces: readable Lean rewriting, commit 72fead10; not a local kernel replay.', 22, MUTED)
    images['proof-map.svg'] = frame('Three lattice estimates lead to the main inequality and the critical line', body, height=740)

    body = text(55, 65, 'LEARN TOWARD A DELIVERABLE', 34, INK, 700)
    topics = [('REAL + LINEAR ANALYSIS', 'limits, bounds, Gram determinants'), ('COMPLEX ANALYSIS', 'continuation, residues, transforms'), ('NUMBER THEORY', 'characters, prime powers, L(s, χ)'), ('AUTOMORPHIC FORMS', 'theta kernels and period integrals'), ('ARITHMETIC GEOMETRY', 'integrality, slopes, denominators'), ('LEAN READING', 'statements, dependencies, axioms')]
    for i, (title, subtitle) in enumerate(topics):
        x, y = 55 + (i % 2) * 575, 110 + (i // 2) * 170
        body += box(x, y, 515, 130)
        body += text(x + 22, y + 45, title, 25, TEAL, 700) + text(x + 22, y + 92, subtitle, 22)
    body += text(55, 650, 'Reading the architecture is a first milestone; checking every input is a different task.', 22, MUTED)
    images['learning-map.svg'] = frame('A prerequisite map with concrete reading goals', body)

    limit = 100_000
    prime = bytearray(b'\x01') * (limit + 1)
    prime[0:2] = b'\x00\x00'
    weights = [0.0] * (limit + 1)
    for p in range(2, limit + 1):
        if not prime[p]:
            continue
        if p * p <= limit:
            prime[p * p:limit + 1:p] = b'\x00' * ((limit - p * p) // p + 1)
        power = p
        while power <= limit:
            weights[power] = math.log(p)
            power *= p
    output = io.StringIO(newline='')
    writer = csv.writer(output, lineterminator='\n')
    writer.writerow(['x', 'psi_x', 'psi_minus_x', 'error_over_sqrt_x'])
    psi = 0.0
    for n in range(1, limit + 1):
        psi += weights[n]
        if n in [10, 100, 1000, 10_000, 100_000]:
            writer.writerow([n, f'{psi:.9f}', f'{psi-n:.9f}', f'{(psi-n)/math.sqrt(n):.9f}'])
    images['prime-powers.csv'] = output.getvalue().encode()
    manifest = {
        'scope': 'Original teaching diagrams and a finite arithmetic computation; not a new proof or a verification of the Lean archive.',
        'proofCommit': '72fead102f663d5c7a407964a13dc0cf9d977207',
        'files': {name: hashlib.sha256(data).hexdigest() for name, data in images.items()},
    }
    images['manifest.json'] = (json.dumps(manifest, indent=2) + '\n').encode()
    return images


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    expected = assets()
    if args.check:
        for name, data in expected.items():
            assert (OUT / name).read_bytes() == data, f'Stale or changed Math asset: {name}'
        png = (OUT / 'cover.png').read_bytes()
        assert png[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II', png[16:24]) == (1200, 675)
        rows = list(csv.DictReader(io.StringIO(expected['prime-powers.csv'].decode())))
        for directory in [ROOT / 'src/content/posts', ROOT / 'src/content/posts/en']:
            article = (directory / 'math-riemann-proof-2026.md').read_text()
            for row in rows:
                line = f"| {int(row['x']):,} | {row['psi_x']} | {row['psi_minus_x']} | {row['error_over_sqrt_x']} |"
                assert line in article, f'Article numerical table differs from the computation: {directory}'
        print('Verified five original Math SVGs, finite prime-power CSV, provenance manifest and social cover.')
    else:
        OUT.mkdir(parents=True, exist_ok=True)
        for name, data in expected.items():
            (OUT / name).write_bytes(data)
        print('Built original Math diagrams and finite prime-power illustration; render cover.png separately.')


if __name__ == '__main__':
    main()
