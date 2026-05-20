from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Using the re-encoded config
    config_url = "http://localhost:3000/card?c=eyJ0IjogIkRheSBpbiB0aGUgUGFyayBCaW5nbyIsICJ3IjogIkZsb3dlcnMsQmVlcyxQaWNuaWNrZXJzLEFudHMsTGl0dGxlIEtpZCBDcnlpbmcsSG9sZGluZyBIYW5kcyxQZXJzb24gTmFwcGluZyxBIEJhbGxvb24sRG9ncyxGcmlzYmVlLFN0cm9sbGVyLENoZXNzIFBsYXllcnMsUm9sbGVyc2thdGVzLE11c2ljaWFuLEp1Z2dsZXIsUGhvdG9ncmFwaGVyLFBhaW50ZXIsUGxhc3RpYyBCYWcgaW4gVHJlZSxTcXVpcnJlbCxQaWdlb24sQmljeWNsZSBCdWlsdCBmb3IgVHdvLEljZSBDcmVhbSxTdW5iYXRoZXIsUGVyc29uIFJlYWRpbmcgTmV3c3BhcGVyLFBlcnNvbiBMaXN0ZW5pbmcgdG8gUmFkaW8sU2lkZXdhbGsgQ2hhbGssSG9wc2NvdGNoIiwid2kiOjUsImgiOjUsImN0IjoiZiIsImN2IjoiUGFyayBCZW5jaCIsImNzIjoiRnJlZSBTcGFjZSIsImZzIjoibSIsImVuIjp0cnVlfQ=="

    # Actually wait, I used the old one again. Let's use the new one.
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
        page.wait_for_timeout(500)
        page.get_by_role("button", name="Join Game").click()
        page.wait_for_timeout(1000)

    # Verify card is rendered
    cells = page.locator(".bingo-cell")
    count = cells.count()
    print(f"Found {count} cells.")

    # Test Note Feature
    print("Testing note feature...")
    first_cell = cells.nth(0)
    print(f"Clicking cell 0...")
    first_cell.click()
    page.wait_for_timeout(1000)

    note_modal = page.locator("#note-modal")
    if note_modal.is_visible():
        print("Note modal opened automatically.")
        page.locator("#note-text").fill("This is a test note.")
        page.wait_for_timeout(500)
        page.get_by_role("button", name="Save Note").click()
        page.wait_for_timeout(1000)
        print("Note saved.")
    else:
        print("Note modal did NOT open automatically.")

    # Take screenshot
    page.screenshot(path="verification-screenshot.png")
    print("Screenshot saved as verification-screenshot.png")
    page.wait_for_timeout(1000)

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
