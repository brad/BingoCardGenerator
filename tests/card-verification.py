from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    config_url = "http://localhost:3000/card?c=eyJ0IjogIkRheSBpbiB0aGUgUGFyayBCaW5nbyIsICJ3IjogIkZsb3dlcnMsQmVlcyxQaWNuaWNrZXJzLEFudHMsTGl0dGxlIEtpZCBDcnlpbmcsSG9sZGluZyBIYW5kcyxQZXJzb24gTmFwcGluZyxBIEJhbGxvb24sRG9ncyxGcmlzYmVlLFN0cm9sbGVyLENoZXNzIFBsYXllcnMsUm9sbGVyc2thdGVzLE11c2ljaWFuLEp1Z2dsZXIsUGhvdG9ncmFwaGVyLFBhaW50ZXIsUGxhc3RpYyBCYWcgaW4gVHJlZSxTcXVpcnJlbCxQaWdlb24sQmljeWNsZSBCdWlsdCBmb3IgVHdvLEljZSBDcmVhbSxTdW5iYXRoZXIsUGVyc29uIFJlYWRpbmcgTmV3c3BhcGVyLFBlcnNvbiBMaXN0ZW5pbmcgdG8gUmFkaW8sU2lkZXdhbGsgQ2hhbGssSG9wc2NvdGNoIiwgInMiOiA1LCAiY3QiOiAiZiIsICJjdiI6ICJQYXJrIEJlbmNoIiwgImNzIjogIkZyZWUgU3BhY2UiLCAiZnoiOiAibSIsICJlbiI6IHRydWV9"

    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    print("Navigating to card page...")
    page.goto(config_url)
    page.wait_for_timeout(2000)

    # Handle nickname modal
    nickname_input = page.locator("#nickname-input")
    if nickname_input.is_visible():
        print("Nickname modal visible. Entering nickname...")
        nickname_input.fill("Tester")
        page.get_by_role("button", name="Join Room").click()
        page.wait_for_timeout(2000)

    # Verify card is rendered
    cells = page.locator(".bingo-cell")
    count = cells.count()
    print(f"Found {count} cells.")

    # Test Long Press via event dispatch
    print("Testing long press via event dispatch...")
    # Cell 1 is not a free space
    cell = cells.nth(1)
    cell.dispatch_event("pointerdown")
    page.wait_for_timeout(700)
    cell.dispatch_event("pointerup")

    page.wait_for_timeout(1000)
    note_modal = page.locator("#note-modal")
    if note_modal.is_visible():
        print("SUCCESS: Note modal opened via long press.")
        page.get_by_role("button", name="Close").click()
        page.wait_for_timeout(1000)
    else:
        print("FAILURE: Note modal did NOT open via long press.")

    # Test Free Space (index 12)
    print("Testing free space long press...")
    free_cell = cells.nth(12)
    free_cell.dispatch_event("pointerdown")
    page.wait_for_timeout(700)
    free_cell.dispatch_event("pointerup")
    page.wait_for_timeout(1000)
    if note_modal.is_visible():
        print("FAILURE: Note modal opened for free space.")
    else:
        print("SUCCESS: Note modal did NOT open for free space.")

    # Take screenshot
    page.screenshot(path="verification-screenshot.png")
    print("Screenshot saved as verification-screenshot.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
