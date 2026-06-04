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
        "title": "The Blue Water Pontoon — 24ft Premium w/ 150HP Mercury",
        "description": """Experience luxury on the water with our premium 24-foot pontoon boat. Meticulously maintained vessel with comfort, performance, and safety.

Specs:
• 24ft pontoon, 150HP Mercury outboard
• Capacity: 8 passengers
• Bimini top, Bluetooth audio, cooler, GPS fish finder
• Coast Guard safety equipment

Current: RESERVED FOR LONG-TERM LEASE (365-day corporate contract). Seasonal availability may open Q3.""",
        "price": 450.00,
        "location": "Lake Havasu, Arizona",
        "latitude": 34.4839,
        "longitude": -114.3225,
        "images": [
            "https://images.pexels.com/photos/12914427/pexels-photo-12914427.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/26838520/pexels-photo-26838520.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "boat_type": "Pontoon",
            "length": 24.0,
            "horsepower": 150,
            "capacity": 8,
            "has_dock": True,
            "insurance_proof": "data:image/jpeg;base64,placeholder",
            "security_deposit": 500.00,
            "life_jackets_count": 10,
            "add_ons": {
                "trailer": {"available": True, "price_per_day": 75.00, "included_free": False},
                "wakeboard_tower": {"available": True, "price_per_day": 50.00, "included_free": False},
                "fishing_gear": {"available": True, "price_per_day": 0.00, "included_free": True},
                "bimini_top": {"available": True, "price_per_day": 0.00, "included_free": True}
            }
        },
        "house_rules": "Life jackets required for all passengers. Boating license required. No alcohol for operator.",
        "status": "booked",
        "is_long_term": True,
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

    # ---- BOAT RENTALS ----
    {
        "owner_id": "seed_user_18",
        "owner_name": "Nicole S.",
        "category": "boat_rental",
        "title": "30ft Sea Ray Sundancer — Weekend Cruiser w/ Cabin",
        "description": "Twin Mercruiser 350 MAGs, fully serviced, with a sleeps-4 cabin, marine head, mini-galley, and a generator. Bluetooth marine audio, GPS chartplotter, and full safety gear.\n\nGreat for overnight trips around the Keys or down to Bimini (with proper licensing). Captain available for charter.",
        "price": 695.00,
        "location": "Key Largo, Florida",
        "latitude": 25.0865,
        "longitude": -80.4473,
        "images": [
            "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&auto=format&fit=crop",
            "https://images.pexels.com/photos/1117272/pexels-photo-1117272.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "amenities": {
            "boat_type": "Cabin Cruiser",
            "length": 30.0,
            "horsepower": 700,
            "capacity": 10,
            "has_dock": True,
            "insurance_proof": "data:image/jpeg;base64,seed",
            "security_deposit": 1500.00,
            "life_jackets_count": 12,
            "add_ons": {
                "captain": {"available": True, "price_per_day": 350.00, "included_free": False},
                "snorkel_gear": {"available": True, "price_per_day": 25.00, "included_free": False}
            }
        },
        "house_rules": "Boating license required (or hire our captain). Life jackets on at all times underway. Damage deposit reservation required.",
        "host_verified": True,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_19",
        "owner_name": "Tom B.",
        "category": "boat_rental",
        "title": "Bass Tracker Pro Team 175 — Tournament-Ready",
        "description": "Aluminum bass boat with Minn Kota trolling motor, Lowrance fish finder/GPS combo, livewell with timer, and a 75HP Mercury 4-stroke. Trolling motor batteries always fully charged.\n\nIncluded: 6 baitcasters, 4 spinning combos, full tackle box, and a cooler. Perfect for serious anglers.",
        "price": 215.00,
        "location": "Branson, Missouri",
        "latitude": 36.6437,
        "longitude": -93.2185,
        "images": [
            "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop"
        ],
        "amenities": {
            "boat_type": "Bass Boat",
            "length": 17.5,
            "horsepower": 75,
            "capacity": 3,
            "has_dock": True,
            "insurance_proof": "data:image/jpeg;base64,seed",
            "security_deposit": 400.00,
            "life_jackets_count": 4,
            "add_ons": {
                "fishing_gear": {"available": True, "price_per_day": 0.00, "included_free": True},
                "live_bait": {"available": True, "price_per_day": 20.00, "included_free": False}
            }
        },
        "house_rules": "Catch limits per Missouri DNR. No alcohol on board. Trolling motor must be raised in shallows.",
        "host_verified": False,
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "owner_id": "seed_user_20",
        "owner_name": "Sophia L.",
        "category": "boat_rental",
        "title": "Tahoe Crystal Cat — 21ft Wake Surf Boat",
        "description": "Wake-surf-specific Centurion Ri237 with Ramfill ballast, Surf System gates, and a Wetsounds audio rig. Pulls a perfect wave for surf or wakeboard. Stays at Tahoe Keys Marina — pick up dockside.\n\nSurfboards, wakeboards, ropes, and life jackets all included. Lessons available from a pro for an extra fee.",
        "price": 825.00,
        "location": "South Lake Tahoe, California",
        "latitude": 38.9399,
        "longitude": -119.9772,
        "images": [
            "https://images.unsplash.com/photo-1502743780242-f10d2ec5a96e?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop"
        ],
        "amenities": {
            "boat_type": "Wake Boat",
            "length": 21.0,
            "horsepower": 450,
            "capacity": 12,
            "has_dock": True,
            "insurance_proof": "data:image/jpeg;base64,seed",
            "security_deposit": 1200.00,
            "life_jackets_count": 14,
            "add_ons": {
                "wakeboard_tower": {"available": True, "price_per_day": 0.00, "included_free": True},
                "surfboards": {"available": True, "price_per_day": 0.00, "included_free": True},
                "pro_lesson": {"available": True, "price_per_day": 175.00, "included_free": False}
            }
        },
        "house_rules": "Surf-side passengers only when board is up. Wake surfer max 220 lbs. Sober operator at all times.",
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
