# Check a code before printing

Use this when the customer is about to print or publish a code and asks whether it is ready, whether it will scan, or to check it over. It works for one code or a few. It reads the saved code; it does not change it.

Be clear about what this can and cannot tell them. The settings show some problems for certain. They cannot prove a design scans: only a real scan does. The QR Cake editor tests the actual image as the customer designs it, and a printed proof scanned with two different phones is the final word.

## Checks

Call `get_qr_code`, then work through these in order.

1. **It is active.** `state` must be `ACTIVE`. A paused code prints fine and then does nothing.
2. **It goes to the right place.** Show the destination and ask the customer to confirm it, or point out anything that looks like a typo. For a plain link code, if this conversation can open web pages, open the destination (never the `scanUrl`, which would count as a scan) and say whether it loaded. A file code (`metadata.type` `pdf`, `file`, `audio`, `video` or `image`) must have its file: no `metadata.file`, or an empty `metadata.gallery` on an image code, means it shows a notice instead of the file and is not ready to print.
3. **The image carries the short link.** The file to print comes from the editor (`https://qrcake.com/create/{id}`), which draws the saved design and, when `metadata.domain` is set, uses the customer's own domain. A plain image from `render_qr_code` of the `scanUrl` also works but has no design. An image that encodes the destination itself is not this code and cannot be changed later.
4. **Contrast.** Compare `metadata.primaryColour` (the code) with `metadata.bgColour` (the background), and each of `metadata.eyeColour` and `metadata.eyeInnerColour`, when set, with the background.
   - For each colour take the red, green and blue values from 0 to 255 and divide by 255. For each of the three, if the value is 0.03928 or less divide it by 12.92; otherwise add 0.055, divide by 1.055 and raise to the power 2.4. The brightness is 0.2126 × red + 0.7152 × green + 0.0722 × blue.
   - The ratio is (lighter brightness + 0.05) divided by (darker brightness + 0.05).
   - Below 3: the code will not scan. Say so plainly and name the two colours.
   - Between 3 and 4: it is on the edge. Recommend more contrast and the editor's own test.
   - A background ending in `00` in its eight-digit form is transparent, and `metadata.gradient` with colours in it has no single ratio. In both cases the result depends on what the code is printed on: say so, and recommend a plain light surface.
5. **Corner shapes.** `metadata.eyeOuterStyle` and `metadata.eyeInnerStyle` are the frame and centre of the three corner squares; a missing centre is `square`. These pairs cannot be read: `diamond` with any different shape, and `square` with `round` in either order. Matching pairs are fine.
6. **Logo.** When `metadata.showLogoImage` is true and `metadata.logoUnderlay` is not, the logo covers part of the code. The settings cannot say whether it covers too much. Do not guess: point to the editor's test and a printed proof.
7. **Size.** Point to the size calculator for the print size at the distance people will scan from: https://qrcake.com/qr-code-size-calculator

`analyze_qr_design` gives a further estimate of how much error correction a design uses. Treat it as a hint only. It reasons about the design instead of reading the image, and it can call a working design over budget or a broken one healthy. Never present its verdict as the answer to "will this scan".

## Answer

Lead with the verdict: "ready, once a printed proof scans", or "fix these first". List only the checks that found something, each with what to change, and give the editor link. Always finish with the proof step: print one, scan it with two different phones at the real distance.
