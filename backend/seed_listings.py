"""
Furrst CampTin — Seed Premium Listings
Creates 6 curated listings showcasing high-value rentals across all categories.
All listings are marked status='booked' to reflect active demand while still browsable.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

# Featured listings — real-person host names, lifelike imagery
MOCK_LISTINGS = [
    {
        "owner_id": "seed_user_1",
        "owner_name": "Marcus T.",
        "category": "rv_rental",
        "title": "Luxury Airstream — 31ft Classic with Full Amenities",
        "description": """Experience the pinnacle of mobile luxury in this meticulously maintained 31-foot Airstream Classic. Fully renovated interior with high-end finishes, full kitchen with stainless appliances, spacious bathroom with rainfall shower, and a master bedroom with premium bedding.

Security Features: GPS tracking, 24/7 roadside assistance, comprehensive insurance included.

Perfect for: Extended road trips, family adventures, or remote work on wheels. Fully winterized and ready for four-season travel.

Note: Currently booked through next month due to high demand. Join our waitlist for priority notification.""",
        "price": 299.00,
        "location": "Moab, Utah",
        "latitude": 38.5733,
        "longitude": -109.5498,
        "images": [
            "https://images.unsplash.com/photo-1591799590615-758704d3df5c?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/13304737/pexels-photo-13304737.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "rv_type": "Class A",
            "capacity": 4,
            "power": True,
            "water": True,
            "sewage": True,
            "insurance_proof": "data:image/jpeg;base64,seed",
            "add_ons": {
                "golf_cart": {"available": True, "price_per_day": 25.00, "included_free": False}
            }
        },
        "house_rules": "No smoking. Quiet hours 10pm–7am. Pets OK with $100 deposit. Check-in 3pm.",
        "status": "booked",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_2",
        "owner_name": "Sarah M.",
        "category": "land_stay",
        "title": "Private 40-Acre Estate — Gated, Utilities, Mountain Views",
        "description": """Rare opportunity to secure premium acreage in prime location. This pristine 40-acre parcel offers complete privacy, breathtaking mountain vistas, and professional-grade infrastructure.

Property Features:
• Full hookup sites with 50amp service
• Potable water system throughout
• Gated entry with keypad access
• Gravel roads maintained year-round
• Fiber internet available
• Security cameras at entry points

Ideal for long-term RV parking, equipment storage, off-grid living, or investment holding. Zoning: Agricultural with RV-friendly ordinances.""",
        "price": 150.00,
        "location": "Jackson Hole, Wyoming",
        "latitude": 43.4799,
        "longitude": -110.7624,
        "images": [
            "https://images.pexels.com/photos/28903008/pexels-photo-28903008.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/27824279/pexels-photo-27824279.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "acreage": 40.0,
            "hookup_type": "Full Hookup",
            "utilities": "Electric, Water, Sewer, Fiber Internet",
            "add_ons": {
                "golf_cart": {"available": True, "price_per_day": 0.00, "included_free": True}
            }
        },
        "house_rules": "No fires outside designated pits. Quiet hours 10pm–8am. Dogs welcome on leash.",
        "max_rv_length": 45.0,
        "status": "booked",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_3",
        "owner_name": "David C.",
        "category": "vehicle_storage",
        "title": "Climate-Controlled RV Storage — 24/7 Gated Access",
        "description": """Premium indoor/outdoor storage facility designed specifically for high-value vehicles and RVs. Our facility sets the standard for security and convenience.

Security Infrastructure:
• 24/7 HD surveillance with cloud backup
• Gated entry with individual access codes
• Motion-sensor LED lighting throughout
• Fire suppression systems

Features:
• Electric hookups for battery maintenance
• Wash station on-site
• Dump station available
• Month-to-month or annual contracts

Zero incidents in 5 years of operation.""",
        "price": 250.00,
        "location": "Boulder, Colorado",
        "latitude": 40.0150,
        "longitude": -105.2705,
        "images": [
            "https://images.unsplash.com/photo-1766503494749-0806c2a0aab4?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/20877915/pexels-photo-20877915.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "dimensions": {"length": 45.0, "width": 12.0, "height": 14.0},
            "security_features": ["Gated", "Cameras", "Lights", "24/7 Access"],
            "access_hours": "24/7"
        },
        "house_rules": "Access code must be kept confidential. Vehicles must be insured.",
        "max_rv_length": 45.0,
        "status": "booked",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_4",
        "owner_name": "Elena R.",
        "category": "rv_rental",
        "title": "4x4 Mercedes Sprinter — Full Overland Build, Solar Powered",
        "description": """Professional-grade overland vehicle built for serious adventurers. Custom 4x4 Mercedes Sprinter combines luxury with extreme capability.

Build:
• 4x4 conversion with lifted suspension
• 400W solar + lithium batteries
• Diesel heater, full kitchen, shower
• Starlink internet capability
• Recovery gear included

Trusted by professional expedition teams. Serious inquiries only.""",
        "price": 350.00,
        "location": "Flagstaff, Arizona",
        "latitude": 35.1983,
        "longitude": -111.6513,
        "images": [
            "https://images.unsplash.com/photo-1633043793637-635238a9d20d?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/27620845/pexels-photo-27620845.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "rv_type": "Class B",
            "capacity": 2,
            "power": True,
            "water": True,
            "sewage": True,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "No off-roading outside planned route. Full insurance required.",
        "status": "booked",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_5",
        "owner_name": "James K.",
        "category": "land_stay",
        "title": "Waterfront RV Dock — Private Boat Slip & Full Hookups",
        "description": """Ultra-premium waterfront RV space with private boat dock access. Resort amenities in a secured community.

Waterfront:
• Direct lake access with private 30ft dock
• 50amp electric, full sewer/water
• Fiber internet
• Patio, picnic table, fire ring

Community:
• Gated, 24/7 security
• Clubhouse with showers/laundry
• Kayak storage, fish cleaning station""",
        "price": 185.00,
        "location": "Lake Tahoe, California",
        "latitude": 39.0968,
        "longitude": -120.0324,
        "images": [
            "https://images.pexels.com/photos/9137669/pexels-photo-9137669.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/37114015/pexels-photo-37114015.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "acreage": 0.25,
            "hookup_type": "Full Hookup",
            "utilities": "50amp Electric, Water, Sewer, Fiber, Dock Access"
        },
        "house_rules": "No loud music after 9pm. Pets on leash. Trash to community dumpster.",
        "max_rv_length": 40.0,
        "status": "booked",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_6",
        "owner_name": "Alicia B.",
        "category": "boat_rental",
        "title": "Live-Aboard Dock Slip — 45ft, 50A Power, Pump-Out Included",
        "description": """Liveaboard-permitted slip on a quiet finger pier inside our family-run marina. Slip #B-14 sits on the protected east side, so you'll wake up to flat water 9 mornings out of 10. We've had the same neighbor in B-12 for 11 years — it's that kind of dock.

What you get:
• 45ft LOA, 14ft beam max
• 50A and 30A pedestal power (both billed at cost)
• Fresh water at the slip
• Weekly pump-out included
• Mailbox in the harbormaster's office (we hold packages)
• Heads, hot showers, and a coin laundry are a 90-second walk

Live-aboard status is on file with the city — bring your USCG documentation and proof of insurance, and we can have you wet-slipped within 48 hours. We do a quick walk-down of your vessel at move-in (mostly to make sure your shore cord and lines are sound).

Month-to-month or annual lease. We prefer cruisers who plan to stay six months or longer, but we keep one slip flexible for transients heading up the ICW.""",
        "price": 825.00,
        "location": "Punta Gorda, Florida",
        "latitude": 26.9298,
        "longitude": -82.0454,
        "images": [
            "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "slip_type": "Live-Aboard",
            "max_loa_ft": 45.0,
            "max_beam_ft": 14.0,
            "power_amperage": "30A & 50A",
            "water_hookup": True,
            "pump_out_included": True,
            "liveaboard_allowed": True,
            "insurance_proof": "data:image/jpeg;base64,seed",
            "security_deposit": 1500.00,
            "add_ons": {
                "weekly_pump_out": {"available": True, "price_per_day": 0.00, "included_free": True},
                "mail_holding": {"available": True, "price_per_day": 0.00, "included_free": True},
                "dock_cart_use": {"available": True, "price_per_day": 0.00, "included_free": True}
            }
        },
        "house_rules": "USCG documentation + current marine insurance required. Quiet hours 10pm–7am. No live-aboard pets over 40 lbs without prior approval. Dinghy storage on the rack — no tying to the slip.",
        "status": "active",
        "host_verified": True,
        "created_at": datetime.utcnow().isoformat()
    },

    # ============================================================
    # ===== ADDITIONAL REALISTIC LISTINGS (host_verified mix) =====
    # ============================================================

    # ---- RV RENTALS ----
    {
        "owner_id": "seed_user_7",
        "owner_name": "James K.",
        "category": "rv_rental",
        "title": "Winnebago Revel 4x4 — Off-Grid Adventure Van",
        "description": "Mercedes-Benz Sprinter chassis with true 4x4 capability. Solar electric system, lithium battery bank, on-demand water heater, and a power lift bed. Built for boondocking in any terrain. Recently serviced, 22,000 verified miles.\n\nKitchenette with induction cooktop, stainless sink, and 12V fridge. Cassette toilet + wet bath. Maxxair fan. Pet-friendly.",
        "price": 285.00,
        "location": "Bozeman, Montana",
        "latitude": 45.6770,
        "longitude": -111.0429,
        "images": [
            "https://images.unsplash.com/photo-1569520884908-682f382556e1?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "rv_type": "Class B",
            "capacity": 2,
            "power": True,
            "water": True,
            "sewage": True,
            "insurance_proof": "data:image/jpeg;base64,seed",
            "add_ons": {
                "kayak_rack": {"available": True, "price_per_day": 15.00, "included_free": False},
                "bike_rack": {"available": True, "price_per_day": 10.00, "included_free": False}
            }
        },
        "house_rules": "200 miles/day included, $0.50/mile after. Pets OK. No smoking.",
        "host_verified": True,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_8",
        "owner_name": "Rebecca H.",
        "category": "rv_rental",
        "title": "Family Bunkhouse — 32ft Jayco Travel Trailer",
        "description": "Sleeps 8 comfortably. Quad bunks for kids, queen master, and a convertible dinette. Outdoor kitchen with mini-fridge, two slide-outs for huge living space, and a full bathroom. Towable behind a 1/2-ton truck.\n\nGreat first-time RV experience — we'll walk you through every system. Pre-stocked with kitchen basics and outdoor games.",
        "price": 145.00,
        "location": "Pigeon Forge, Tennessee",
        "latitude": 35.7884,
        "longitude": -83.5543,
        "images": [
            "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/2402648/pexels-photo-2402648.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "rv_type": "Travel Trailer",
            "capacity": 8,
            "power": True,
            "water": True,
            "sewage": True,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Tow vehicle must be 1/2-ton or larger. No pets. Smoking outside only.",
        "host_verified": False,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_9",
        "owner_name": "David O.",
        "category": "rv_rental",
        "title": "Class A Diesel Pusher — 40ft Newmar Dutch Star",
        "description": "Luxury motorcoach with full-body paint, three slide-outs, residential refrigerator, dishwasher, washer/dryer, and a king bed. Tag axle for stability. 8.9L Cummins diesel. Ideal for snowbirds and extended road trips.\n\nIncludes Garmin RV GPS, satellite TV, and 50-amp service. White-glove walkthrough included.",
        "price": 485.00,
        "location": "Naples, Florida",
        "latitude": 26.1420,
        "longitude": -81.7948,
        "images": [
            "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop"
        ],
        "amenities": {
            "rv_type": "Class A",
            "capacity": 6,
            "power": True,
            "water": True,
            "sewage": True,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "CDL not required but RV driving experience strongly preferred. Tow-vehicle option +$50/day.",
        "host_verified": True,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_10",
        "owner_name": "Tara N.",
        "category": "rv_rental",
        "title": "Vintage 1976 VW Westfalia — Restored Camper",
        "description": "Lovingly restored Bay Window Westfalia with rebuilt 2.0L engine. Original pop-top, swivel front seats, integrated kitchen, and a sweet patina. Featured in two travel magazines.\n\nA showstopper at every campground — sleeps 4, but really shines as a couples retreat. Stick shift only.",
        "price": 165.00,
        "location": "Bend, Oregon",
        "latitude": 44.0582,
        "longitude": -121.3153,
        "images": [
            "https://images.unsplash.com/photo-1533387520709-752d83de3630?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1605649461784-edc01e8a02fb?w=800&auto=format&fit=crop"
        ],
        "amenities": {
            "rv_type": "Class B",
            "capacity": 4,
            "power": False,
            "water": True,
            "sewage": False,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Manual transmission experience required. No off-road. Smoking forbidden.",
        "host_verified": False,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },

    # ---- LAND STAYS ----
    {
        "owner_id": "seed_user_11",
        "owner_name": "Hank R.",
        "category": "land_stay",
        "title": "Texas Hill Country Riverfront — 12 Private Acres",
        "description": "Camp on a pristine bend of the Guadalupe River. Twelve fenced acres with a private swimming hole, fire ring, picnic table, and a clean composting outhouse. Cell coverage available, dark sky for stargazing.\n\nGoats and chickens roam — kids love them. Wildflowers in spring, cool river breezes in summer. 30-amp electric hookup at site.",
        "price": 65.00,
        "location": "Wimberley, Texas",
        "latitude": 29.9974,
        "longitude": -98.0986,
        "images": [
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/6271392/pexels-photo-6271392.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "power": True,
            "water": True,
            "sewage": False,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Fire pit only — no ground fires. Quiet hours 10pm. Pets must be leashed. Pack out trash.",
        "host_verified": True,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_12",
        "owner_name": "Emily V.",
        "category": "land_stay",
        "title": "Olympic Peninsula Forest Cabin Site — Old Growth Cedars",
        "description": "Five forested acres bordering Olympic National Park. Pull your van or trailer onto a level, gravel pad ringed by 300-year-old cedars. Composting toilet, fresh-water spigot, and a covered cooking shelter on-site.\n\n10-minute drive to Lake Crescent. Bald eagles, deer, and the occasional black bear. No cell service — true digital detox.",
        "price": 85.00,
        "location": "Port Angeles, Washington",
        "latitude": 48.1181,
        "longitude": -123.4307,
        "images": [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop"
        ],
        "amenities": {
            "power": False,
            "water": True,
            "sewage": False,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Bear box mandatory. No drones. Pets allowed but no chasing wildlife.",
        "host_verified": False,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_13",
        "owner_name": "Carlos M.",
        "category": "land_stay",
        "title": "Sedona Red Rock Overlook — Sunrise Yoga Site",
        "description": "Two private acres perched above Oak Creek with unobstructed Cathedral Rock views. Level tent pad, RV-friendly pull-through, solar shower, and a flagstone meditation deck. Vortex country.\n\nHost is a certified yoga instructor — book a private sunrise session for an extra $50. Pet friendly (one dog max).",
        "price": 95.00,
        "location": "Sedona, Arizona",
        "latitude": 34.8697,
        "longitude": -111.7610,
        "images": [
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1455496231601-e6195da1f841?w=800&auto=format&fit=crop"
        ],
        "amenities": {
            "power": True,
            "water": True,
            "sewage": False,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Quiet hours strictly enforced. No glass at the overlook. One dog max, leashed.",
        "host_verified": True,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_14",
        "owner_name": "Patricia W.",
        "category": "land_stay",
        "title": "Outer Banks Beach Lot — 200ft from the Atlantic",
        "description": "Beach-access property on a quiet stretch of Hatteras Island. Pull your RV in or pitch a tent — the dunes are a 3-minute walk to your private beach access point. Outdoor shower, fish-cleaning station, and a small tackle shop on-site.\n\nGreat fall and spring rates. Hurricane season pricing flexible — we'll work with you.",
        "price": 78.00,
        "location": "Hatteras, North Carolina",
        "latitude": 35.2010,
        "longitude": -75.6905,
        "images": [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop"
        ],
        "amenities": {
            "power": True,
            "water": True,
            "sewage": True,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Surfcasting permits available on-site. No bonfires on beach without permit.",
        "host_verified": False,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },

    # ---- VEHICLE STORAGE ----
    {
        "owner_id": "seed_user_15",
        "owner_name": "Greg P.",
        "category": "vehicle_storage",
        "title": "Indoor Heated RV Garage — Up to 45ft, Concrete Floor",
        "description": "Brand-new 50x18 ft individual storage bay with 16ft clearance, 50-amp service, and heated floors. Wash bay on-site. 24/7 access via fob, on-camera, with a security guard nightly. Perfect for high-end coaches.\n\nBoat or trailer welcome too. Free initial walkthrough and dust cover.",
        "price": 425.00,
        "location": "Fort Collins, Colorado",
        "latitude": 40.5853,
        "longitude": -105.0844,
        "images": [
            "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "storage_type": "Indoor Climate-Controlled",
            "power": True,
            "water": True,
            "sewage": False,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Monthly lease only. Insurance certificate required at move-in. 30-day notice to vacate.",
        "host_verified": True,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_16",
        "owner_name": "Lisa F.",
        "category": "vehicle_storage",
        "title": "Outdoor Gravel Lot — Affordable RV & Boat Parking",
        "description": "Fenced, lit gravel lot with reserved 40x12 ft spaces. Camera-monitored entry, dog walks the perimeter at night. No frills, just safe and dry. 24/7 entry with personal gate code.\n\nGreat for snowbirds storing their rig off-season. Wash station available for $10/use.",
        "price": 95.00,
        "location": "Glendale, Arizona",
        "latitude": 33.5387,
        "longitude": -112.1859,
        "images": [
            "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&auto=format&fit=crop"
        ],
        "amenities": {
            "storage_type": "Outdoor Gravel",
            "power": False,
            "water": False,
            "sewage": False,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Vehicles must be operational. No working on engines on-site. No subletting.",
        "host_verified": False,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_17",
        "owner_name": "Mike D.",
        "category": "vehicle_storage",
        "title": "Marina Boat Slip — 32ft Covered, Freshwater",
        "description": "Covered slip in a private marina on Lake Travis. 32ft length, 12ft beam. Hardwired shore power (30A), water hookup, and a slip-side ladder. Marina has a fuel dock, ship store, and on-site mechanic.\n\nNo waitlist — immediate occupancy. Annual or seasonal leases.",
        "price": 350.00,
        "location": "Austin, Texas",
        "latitude": 30.3927,
        "longitude": -97.9214,
        "images": [
            "https://images.unsplash.com/photo-1599580546666-c5bd2cdde3a8?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/13297456/pexels-photo-13297456.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "storage_type": "Covered Marina Slip",
            "power": True,
            "water": True,
            "sewage": False,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Valid boat insurance required. No live-aboard. Marina rules apply.",
        "host_verified": False,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },

    # ---- RV / CAMPER SITE RENTALS (replacing the boat inventory) ----
    {
        "owner_id": "seed_user_18",
        "owner_name": "Nicole S.",
        "category": "land_stay",
        "title": "Cape Cod Pull-Through Camper Site — Walk to the Bay",
        "description": """Quiet, level pull-through pad on our half-acre lot in Brewster. Big enough for rigs up to 38 ft. The bay-side beach is a 9-minute walk through the neighborhood — perfect for sunsets and low-tide clam digging.

Site has 30A power, potable water, and a covered picnic table. Sewer dump station is 4 miles up Route 6A (we'll print you a map). We're old hippies, two retrievers on the porch, and a vegetable garden you're welcome to raid for tomatoes in August.

We do a no-frills check-in (just text us your ETA) and we leave a folder in the picnic table with WiFi password, beach permit info, and our favorite chowder spots. Weekly rate available — most of our guests stay 4-7 nights.""",
        "price": 62.00,
        "location": "Brewster, Massachusetts",
        "latitude": 41.7601,
        "longitude": -70.0820,
        "images": [
            "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "power": True,
            "water": True,
            "sewage": False,
            "hookup_type": "Water & Electric",
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Max 1 rig. Quiet hours 9pm. Leashed dogs welcome — please pick up. No generators after dark. Pack out all trash (we don't have curbside).",
        "max_rv_length": 38.0,
        "host_verified": False,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_19",
        "owner_name": "Tom B.",
        "category": "land_stay",
        "title": "Smoky Mountain Creekside Camper Pad — Off-Grid Friendly",
        "description": """Tucked back on 6 wooded acres off a gravel forest road, about 20 minutes from Asheville. Single graveled pad sized for trailers or vans up to 28 ft. Big oaks overhead, a small creek 50 yards behind the site — you'll fall asleep to it.

What's here: 30A power post, spring-fed spigot (we drink it but most folks filter), composting outhouse, fire ring with a stack of seasoned hickory you're welcome to. No sewer hookup — vault toilet is the bathroom. Cell is one bar of Verizon if you stand on the picnic table.

We run a small hobby farm next door (laying hens, two goats) and the kids will absolutely come introduce themselves. No big events, no generators after sundown, otherwise — make yourself at home.""",
        "price": 48.00,
        "location": "Weaverville, North Carolina",
        "latitude": 35.6957,
        "longitude": -82.5601,
        "images": [
            "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/2422588/pexels-photo-2422588.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "power": True,
            "water": True,
            "sewage": False,
            "hookup_type": "Water & Electric",
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Fire ring only — no ground fires. Leashed dogs OK (we have chickens). No firearms. Quiet hours 10pm. Be polite to the goats.",
        "max_rv_length": 28.0,
        "host_verified": True,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_20",
        "owner_name": "Sophia L.",
        "category": "land_stay",
        "title": "Joshua Tree High Desert RV Site — Dark Sky Stargazing",
        "description": """Five fenced acres of high desert just outside the north entrance to Joshua Tree National Park. Level decomposed-granite pad fits rigs up to 42 ft with one slide. Stunning Joshua tree and yucca all around you, and the milky way overhead almost every clear night.

Hookups: 30A and 50A pedestal, fresh water, and a dump station on-site (no sewer at the pad — short hose run to the dump). Outdoor solar shower in a privacy enclosure. Shaded steel ramada with picnic table. Trash drop-off included.

We live in the casita on the back of the property. We're quiet, we're around if you need a hand with anything, but we won't bother you. Ranger-led night sky tours at the park visitor center most weekends — we'll text you the schedule.

Summer note: it gets hot. We knock 20% off the rate June through August.""",
        "price": 55.00,
        "location": "Twentynine Palms, California",
        "latitude": 34.1356,
        "longitude": -116.0539,
        "images": [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop"
        ],
        "amenities": {
            "power": True,
            "water": True,
            "sewage": True,
            "hookup_type": "Full Hookup",
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "No outdoor amplified music. Generators OK until 9pm. Leashed dogs welcome — watch for snakes in warm months. Conserve water — we're on a well.",
        "max_rv_length": 42.0,
        "host_verified": True,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_21",
        "owner_name": "Brandon F.",
        "category": "vehicle_storage",
        "title": "Covered Carport Storage — Cement Slab, Murrells Inlet",
        "description": "Long driveway with a full-sized covered concrete carport — perfect for protecting your RV, boat, or trailer from coastal sun and salt. The cement slab is poured-and-rebar quality (parked vehicles up to ~12,000 lbs no problem), and the metal roof keeps rain, leaves, and tree sap off your rig.\n\nLocated in a quiet residential neighborhood 8 minutes from the MarshWalk and 12 minutes from Garden City Beach launches. 30A power outlet at the slab if you need to keep batteries trickle-charged. I live on-site and keep an eye on every vehicle parked here.\n\nAvailable monthly. Bring your own cover for extra dust protection. Snowbirds welcome — flexible long-term rates if you're storing more than 6 months.",
        "price": 165.00,
        "location": "Murrells Inlet, South Carolina",
        "latitude": 33.5520,
        "longitude": -79.0356,
        "images": [
            "https://images.pexels.com/photos/12171799/pexels-photo-12171799.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "storage_type": "Covered Driveway / Carport",
            "power": True,
            "water": False,
            "sewage": False,
            "insurance_proof": "data:image/jpeg;base64,seed"
        },
        "house_rules": "Monthly lease. Insurance certificate required. 30-day notice to vacate. No on-site repair work — quick fluid checks OK.",
        "host_verified": False,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    }
]


async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    print("🌱 Seeding Furrst CampTin with premium listings...")

    existing = await db.listings.count_documents({"owner_id": {"$regex": "^seed_user_"}})
    if existing > 0:
        print(f"⚠️  Found {existing} existing seed listings. Removing old seed data...")
        await db.listings.delete_many({"owner_id": {"$regex": "^seed_user_"}})

    result = await db.listings.insert_many(MOCK_LISTINGS)
    print(f"✅ Successfully inserted {len(result.inserted_ids)} listings:")
    for i, listing in enumerate(MOCK_LISTINGS, 1):
        print(f"   {i}. {listing['title']} — ${listing['price']}")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
