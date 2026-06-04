#!/usr/bin/env python3
"""Furrst CampTin backend tests — NEW PRICING MODEL.

Tests:
1. GET /api/listings returns host_verified and sorts verified hosts first.
2. GET /api/listings?verified_only=true returns only verified.
3. GET /api/listings/{id} returns host_verified flag.
4. POST /api/bookings (admin verified) — new pricing fields.
5. POST /api/bookings unverified guest — guest_service_fee_rate 0.14 (if allowed).
6. Smoke test existing endpoints.
7. Admin bootstrap works.
"""
import uuid
import requests
from datetime import datetime, timedelta

BASE = "https://forest-dock.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@furrstcamp.com"
ADMIN_PASSWORD = "Admin123!"

results = []

def log(name, ok, detail=""):
    tag = "PASS" if ok else "FAIL"
    print(f"[{tag}] {name}" + (f" — {detail}" if detail else ""))
    results.append((name, ok, detail))


def auth_headers(t):
    return {"Authorization": f"Bearer {t}"}


def login(email, password):
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
    return r


def register(email, password, name, phone, tos=True):
    return requests.post(f"{BASE}/auth/register", json={
        "email": email, "password": password, "name": name,
        "phone": phone, "accepted_tos": tos
    })


# ---------- Test 7: Admin bootstrap login ----------
print("\n=== TEST 7: Admin bootstrap login ===")
r = login(ADMIN_EMAIL, ADMIN_PASSWORD)
log("Admin bootstrap login (admin@furrstcamp.com / Admin123!)",
    r.status_code == 200,
    f"HTTP {r.status_code}: {r.text[:200]}")
if r.status_code != 200:
    print("Cannot proceed — admin login broken.")
    raise SystemExit(1)
ADMIN_TOKEN = r.json()["token"]
ADMIN = r.json()["user"]
log("Admin user is_verified=true", ADMIN.get("is_verified") is True, f"is_verified={ADMIN.get('is_verified')}")

# ---------- Test 1: GET /api/listings ----------
print("\n=== TEST 1: GET /api/listings ===")
r = requests.get(f"{BASE}/listings")
log("GET /api/listings 200", r.status_code == 200, f"HTTP {r.status_code}")
listings = r.json()
log("Returns >= 6 seed listings", len(listings) >= 6, f"count={len(listings)}")
# host_verified field
has_field = all("host_verified" in l for l in listings)
log("Every listing has host_verified field", has_field)
verified_titles = {"The Blue Water Pontoon", "Climate-Controlled RV Storage", "Luxury Airstream"}
verified_listings = [l for l in listings if l.get("host_verified")]
log("3 listings have host_verified=true", len(verified_listings) == 3,
    f"count={len(verified_listings)} titles={[l.get('title')[:30] for l in verified_listings]}")

# Verify ordering: verified first
first_three = listings[:3]
verified_first_three = all(l.get("host_verified") for l in first_three)
log("First 3 listings are all verified hosts", verified_first_three,
    f"first3 verified flags = {[l.get('host_verified') for l in first_three]}")

# Verify specific titles match
seed_verified_match = sum(1 for l in verified_listings if any(t in (l.get("title") or "") for t in verified_titles))
log("Verified listings include the 3 expected seed titles", seed_verified_match == 3,
    f"matched={seed_verified_match}")

# ---------- Test 2: verified_only filter ----------
print("\n=== TEST 2: GET /api/listings?verified_only=true ===")
r = requests.get(f"{BASE}/listings", params={"verified_only": "true"})
log("GET listings verified_only=true HTTP 200", r.status_code == 200)
vl = r.json()
log("verified_only returns exactly 3 listings", len(vl) == 3, f"count={len(vl)}")
log("verified_only — all have host_verified=true",
    all(l.get("host_verified") for l in vl))

# ---------- Test 3: GET /api/listings/{id} ----------
print("\n=== TEST 3: GET /api/listings/{id} detail ===")
if verified_listings:
    sample_id = verified_listings[0]["id"]
    r = requests.get(f"{BASE}/listings/{sample_id}")
    log("GET /api/listings/{id} 200", r.status_code == 200, f"HTTP {r.status_code}")
    detail = r.json() if r.status_code == 200 else {}
    log("Detail has host_verified field", "host_verified" in detail,
        f"keys={list(detail.keys())[:10]}")
    log("Detail host_verified=true for seeded verified listing",
        detail.get("host_verified") is True,
        f"host_verified={detail.get('host_verified')}")

# Also test an unverified one
unverified_listings = [l for l in listings if not l.get("host_verified")]
if unverified_listings:
    uid = unverified_listings[0]["id"]
    r = requests.get(f"{BASE}/listings/{uid}")
    detail = r.json() if r.status_code == 200 else {}
    log("Detail host_verified=false for seeded unverified listing",
        detail.get("host_verified") is False,
        f"host_verified={detail.get('host_verified')}")

# ---------- Test 4: POST /api/bookings (admin verified guest) ----------
print("\n=== TEST 4: POST /api/bookings as verified admin ===")
# Find a land_stay listing (admin is verified). Need one NOT owned by admin.
land_stays = [l for l in listings if l.get("category") == "land_stay"
              and l.get("owner_id") != ADMIN["id"]]
if not land_stays:
    log("Land stay listing available for booking", False, "no land_stay listings")
else:
    target = land_stays[0]
    start = (datetime.utcnow() + timedelta(days=10)).date().isoformat()
    end = (datetime.utcnow() + timedelta(days=12)).date().isoformat()
    payload = {
        "listing_id": target["id"],
        "start_date": start,
        "end_date": end,
        "selected_add_ons": [],
        "tos_accepted": True,
    }
    r = requests.post(f"{BASE}/bookings", headers=auth_headers(ADMIN_TOKEN), json=payload)
    log("POST /api/bookings 200 for verified admin",
        r.status_code == 200, f"HTTP {r.status_code}: {r.text[:300]}")
    if r.status_code == 200:
        b = r.json()
        # Required new fields
        log("Booking has guest_verified=true", b.get("guest_verified") is True,
            f"guest_verified={b.get('guest_verified')}")
        log("Booking has host_verified field (bool)",
            isinstance(b.get("host_verified"), bool),
            f"host_verified={b.get('host_verified')}")
        log("Booking has guest_service_fee_rate=0.08 (verified guest)",
            abs(b.get("guest_service_fee_rate", 0) - 0.08) < 1e-9,
            f"guest_service_fee_rate={b.get('guest_service_fee_rate')}")
        log("Booking has host_commission_rate field",
            "host_commission_rate" in b,
            f"host_commission_rate={b.get('host_commission_rate')}")
        log("Booking has guest_service_fee field (numeric)",
            isinstance(b.get("guest_service_fee"), (int, float)),
            f"guest_service_fee={b.get('guest_service_fee')}")

        # Math verification
        base = b.get("base_subtotal", 0)
        addons = b.get("add_ons_subtotal", 0)
        gs_rate = b.get("guest_service_fee_rate", 0)
        gs_fee = b.get("guest_service_fee", 0)
        sec = b.get("security_deposit", 0)
        tot = b.get("total_price", 0)
        host_rate = b.get("host_commission_rate", 0)
        host_payout = b.get("host_payout", 0)
        rental_comm = b.get("platform_rental_fee", 0)
        addon_comm = b.get("platform_add_on_fee", 0)

        expected_gs_fee = round((base + addons) * gs_rate, 2)
        log(f"guest_service_fee = (base+add_ons)*rate ({expected_gs_fee})",
            abs(gs_fee - expected_gs_fee) < 0.02,
            f"got {gs_fee}, expected {expected_gs_fee}")

        expected_total = round(base + addons + gs_fee + sec, 2)
        log(f"total_price = base + add_ons + guest_fee + security ({expected_total})",
            abs(tot - expected_total) < 0.02,
            f"got {tot}, expected {expected_total}")

        expected_payout = round((base + addons) - (rental_comm + addon_comm), 2)
        log(f"host_payout = (base+add_ons) - (rental_comm+addon_comm) ({expected_payout})",
            abs(host_payout - expected_payout) < 0.02,
            f"got {host_payout}, expected {expected_payout}")

        # host_commission_rate sanity: 0.0 / 0.015 / 0.03
        valid_rates = {0.0, 0.015, 0.03}
        log("host_commission_rate ∈ {0.0, 0.015, 0.03}",
            any(abs(host_rate - r) < 1e-9 for r in valid_rates),
            f"host_commission_rate={host_rate}")

        # 2-day base check: target['price'] * 2 == base_subtotal
        days = b.get("days") or b.get("units")
        log("units = 2 days", days == 2, f"days={days}")
        expected_base = round(target["price"] * 2, 2)
        log(f"base_subtotal = price*2 ({expected_base})",
            abs(base - expected_base) < 0.02, f"got {base}")

# ---------- Test 4b: ToS missing -> 400 ----------
print("\n=== TEST 4b: POST /api/bookings without tos_accepted ===")
if land_stays:
    payload2 = {
        "listing_id": land_stays[0]["id"],
        "start_date": (datetime.utcnow() + timedelta(days=20)).date().isoformat(),
        "end_date": (datetime.utcnow() + timedelta(days=22)).date().isoformat(),
        "selected_add_ons": [],
        "tos_accepted": False,
    }
    r = requests.post(f"{BASE}/bookings", headers=auth_headers(ADMIN_TOKEN), json=payload2)
    log("POST /api/bookings tos=false → 400", r.status_code == 400,
        f"HTTP {r.status_code}: {r.text[:150]}")

# ---------- Test 5: Unverified guest booking ----------
print("\n=== TEST 5: Fresh unverified user booking attempt ===")
uniq = uuid.uuid4().hex[:8]
fresh_email = f"fresh_guest_{uniq}@furrstcamp.com"
r = register(fresh_email, "TestPass123!", "Fresh Guest", "+15555550199", tos=True)
log("Register fresh unverified guest", r.status_code == 200, f"HTTP {r.status_code}")
fresh_token = r.json()["token"] if r.status_code == 200 else None
fresh_user = r.json()["user"] if r.status_code == 200 else None
log("Fresh user is_verified=false", fresh_user and fresh_user.get("is_verified") is False,
    f"is_verified={fresh_user.get('is_verified') if fresh_user else None}")

if fresh_token and land_stays:
    payload3 = {
        "listing_id": land_stays[0]["id"],
        "start_date": (datetime.utcnow() + timedelta(days=30)).date().isoformat(),
        "end_date": (datetime.utcnow() + timedelta(days=32)).date().isoformat(),
        "selected_add_ons": [],
        "tos_accepted": True,
    }
    r = requests.post(f"{BASE}/bookings", headers=auth_headers(fresh_token), json=payload3)
    # Backend code requires is_verified=true to book -> 403
    if r.status_code == 403:
        log("Unverified guest POST /bookings → 403 (current backend requires verified to book)",
            True, f"HTTP {r.status_code}: {r.text[:150]}")
        log("NOTE: Backend currently blocks unverified guests from booking.\n"
            "      Test #5 in the review request (unverified guest with 14% fee) cannot\n"
            "      be exercised — booking endpoint hard-requires is_verified=true.\n"
            "      If the new pricing model wants unverified guests to pay 14%, the\n"
            "      booking gate at line 944-946 of server.py must be removed/changed.",
            False, "DESIGN INCONSISTENCY")
    elif r.status_code == 200:
        b = r.json()
        log("Unverified guest booking guest_verified=false", b.get("guest_verified") is False)
        log("Unverified guest guest_service_fee_rate=0.14",
            abs(b.get("guest_service_fee_rate", 0) - 0.14) < 1e-9,
            f"rate={b.get('guest_service_fee_rate')}")
    else:
        log("Unverified guest booking returned unexpected status",
            False, f"HTTP {r.status_code}: {r.text[:200]}")

# ---------- Test 6: Smoke existing endpoints ----------
print("\n=== TEST 6: Smoke existing endpoints ===")
# /auth/register handled above.

# /auth/login handled above.

# /auth/me with admin
r = requests.get(f"{BASE}/auth/me", headers=auth_headers(ADMIN_TOKEN))
log("GET /api/auth/me admin", r.status_code == 200, f"HTTP {r.status_code}")

# verification checkout (use fresh user)
if fresh_token:
    r = requests.post(f"{BASE}/payments/verification/create-checkout",
                      params={"origin_url": "https://forest-dock.preview.emergentagent.com"},
                      headers=auth_headers(fresh_token))
    log("POST /api/payments/verification/create-checkout (fresh user)",
        r.status_code == 200,
        f"HTTP {r.status_code}: {r.text[:200]}")
    if r.status_code == 200:
        data = r.json()
        log("verification checkout returns url + session_id",
            "url" in data and "session_id" in data, f"keys={list(data.keys())}")

# /listings/nearby
r = requests.get(f"{BASE}/listings/nearby",
                 params={"lat": 34.05, "lng": -118.25, "radius_miles": 50})
log("GET /api/listings/nearby (no error)",
    r.status_code == 200,
    f"HTTP {r.status_code}: {r.text[:200]}")
if r.status_code == 200:
    nd = r.json()
    log("nearby returns listings + count keys",
        "listings" in nd and "count" in nd, f"keys={list(nd.keys())}")

# /favorites GET + POST (use admin) — pick a non-admin listing
if listings:
    target_fav = listings[0]
    fid = target_fav["id"]
    r = requests.post(f"{BASE}/favorites/{fid}", headers=auth_headers(ADMIN_TOKEN))
    log("POST /api/favorites/{id} as admin",
        r.status_code == 200, f"HTTP {r.status_code}: {r.text[:150]}")
    r = requests.get(f"{BASE}/favorites", headers=auth_headers(ADMIN_TOKEN))
    log("GET /api/favorites",
        r.status_code == 200, f"HTTP {r.status_code}")
    if r.status_code == 200:
        favs = r.json()
        log("Favorites list contains the just-added listing",
            any(l.get("id") == fid for l in favs),
            f"fav ids={[l.get('id') for l in favs][:3]}")
    # clean up
    requests.delete(f"{BASE}/favorites/{fid}", headers=auth_headers(ADMIN_TOKEN))

# ---------- Summary ----------
print("\n" + "=" * 60)
passed = sum(1 for _, ok, _ in results if ok)
total = len(results)
print(f"RESULT: {passed}/{total} assertions passed.")
fails = [r for r in results if not r[1]]
if fails:
    print("\nFAILURES:")
    for name, _, detail in fails:
        print(f"  - {name}: {detail}")
