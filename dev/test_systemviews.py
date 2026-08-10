"""System-view coverage: open ALL 90 system views headlessly (returning to the
galaxy between each) and assert zero page exceptions, in both occupation
variants. Requires: pip install playwright && python -m playwright install chromium.
Run: python dev/test_systemviews.py"""
import sys, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
errors = []

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1600, "height": 1000})
    page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)))
    page.goto((ROOT / "index.html").as_uri())
    page.wait_for_timeout(2000)
    names = page.evaluate("SYS.map(s=>s.name)")
    assert len(names) == 90, f"expected 90 systems, got {len(names)}"
    for style in ("claim", "local"):
        page.evaluate(f"setOccupation('{style}')")
        page.wait_for_timeout(400)
        for n in names:
            page.evaluate(f"openSystemByName({n!r})")
            page.wait_for_timeout(60)
            assert page.evaluate("document.body.classList.contains('sysview')"), n + " did not open"
            page.evaluate("closeSystemView()")
            page.wait_for_timeout(25)
        print(f"{style}: opened {len(names)} system views, page errors so far: {len(errors)}")
    b.close()

for e in errors:
    print(" -", e)
print("system view sweep:", "FAILED" if errors else "PASSED", f"({len(errors)} errors)")
sys.exit(1 if errors else 0)
