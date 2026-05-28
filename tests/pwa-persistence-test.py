from playwright.sync_api import sync_playwright
import time
import os

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a context to simulate first visit
        context = browser.new_context()
        page = context.new_page()

        # Add console log listener
        page.on("console", lambda msg: print(f"CONSOLE1: {msg.text}"))

        print("--- First Visit ---")
        # Visit a room
        room_url = "http://localhost:3000/card.html?room=test-room"
        page.goto(room_url)
        time.sleep(3)

        # Join room with a nickname
        nickname_input = page.locator("#nickname-input")
        if nickname_input.is_visible():
            print("Entering nickname...")
            nickname_input.fill("PWA-User")
            page.get_by_role("button", name="Join Room").click()
            time.sleep(3)

        print(f"Current URL: {page.url}")

        # Check URL after joining
        if "u=" in page.url:
            print("SUCCESS: User ID appended to URL.")
        else:
            print("FAILURE: User ID NOT appended to URL.")
            # return

        browser.close()

if __name__ == "__main__":
    run_test()
