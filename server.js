const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const DEFAULT_PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Geographic coordinates for HCMC districts
const DISTRICT_COORDINATES = {
  'District 1': { lat: 10.7769, lng: 106.7009 },
  'District 3': { lat: 10.7844, lng: 106.6844 },
  'District 4': { lat: 10.7578, lng: 106.7013 },
  'District 5': { lat: 10.7554, lng: 106.6669 },
  'District 6': { lat: 10.7475, lng: 106.6353 },
  'District 7': { lat: 10.7340, lng: 106.7218 },
  'District 10': { lat: 10.7672, lng: 106.6667 },
  'District 11': { lat: 10.7629, lng: 106.6503 },
  'Binh Thanh': { lat: 10.8031, lng: 106.7093 },
  'Phu Nhuan': { lat: 10.7992, lng: 106.6811 },
  'Tan Binh': { lat: 10.8015, lng: 106.6526 },
  'Thu Duc': { lat: 10.8500, lng: 106.7580 }
};

// District Wards map
const DISTRICT_WARDS = {
  'District 1': ['Ben Nghe Ward', 'Da Kao Ward', 'Ben Thanh Ward', 'Nguyen Thai Binh Ward', 'Pham Ngu Lao Ward'],
  'District 3': ['Vo Thi Sau Ward', 'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'],
  'District 4': ['Ward 1', 'Ward 4', 'Ward 9', 'Ward 13', 'Ward 18'],
  'District 5': ['Ward 1', 'Ward 5', 'Ward 11 (Ha Ton Quyen)', 'Ward 14'],
  'District 6': ['Ward 1 (Binh Tay)', 'Ward 2', 'Ward 6', 'Ward 11'],
  'District 7': ['Tan Phong (Phu My Hung)', 'Tan Phu', 'Tan Thuan Dong', 'Phu Thuan'],
  'District 10': ['Ward 1', 'Ward 6', 'Ward 12 (Su Van Hanh)', 'Ward 14'],
  'District 11': ['Ward 3 (Dam Sen)', 'Ward 5', 'Ward 15'],
  'Binh Thanh': ['Ward 25 (Nguyen Gia Tri)', 'Ward 19', 'Ward 21', 'Ward 27 (Thanh Da)'],
  'Phu Nhuan': ['Ward 2 (Phan Xich Long)', 'Ward 7', 'Ward 9'],
  'Tan Binh': ['Ward 2 (Airport area)', 'Ward 12', 'Ward 13'],
  'Thu Duc': ['Thao Dien Ward', 'An Phu Ward', 'Linh Trung Ward', 'Hiep Binh Chanh']
};

// Haversine distance in km
function calculateDistanceKm(coord1, coord2) {
  const R = 6371; // Earth radius in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
    Math.cos(coord2.lat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate commute time in minutes given distance and transport mode
function calculateTravelTimeMin(distanceKm, mode) {
  const speeds = {
    motorbike: 28, // km/h in city traffic
    car: 22,       // km/h (traffic & parking overhead)
    bus: 16,       // km/h (stops & walking)
    walk: 4.8      // km/h
  };
  const speed = speeds[mode] || 25;
  const timeHours = distanceKm / speed;
  const timeMin = Math.round(timeHours * 60) + 3; // +3 min base buffer
  return Math.max(3, timeMin);
}

// Mock Venue catalog
const VENUES = [
  {
    id: 'marou-calmette',
    name: 'Maison Marou Chocolate',
    district: 'District 1',
    address: '168 Calmette, Nguyen Thai Binh Ward, District 1, HCMC',
    rating: 4.6,
    reviewCount: 1420,
    categories: ['coffee', 'sweets'],
    purpose: ['date', 'photo', 'work'],
    budgetTier: '70-100k',
    avgCostPerPerson: 85000,
    photos: [
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=600&q=80'
    ],
    menu: [
      {
        name: 'Dark Chocolate Tartlet',
        price: '85,000 VND',
        desc: 'Single origin dark chocolate ganache in buttery artisan tart shell',
        img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80'
      },
      {
        name: 'Matcha Green Layer Cake',
        price: '75,000 VND',
        desc: 'Uji matcha sponge cake layered with fresh whipped Japanese cream',
        img: 'https://images.unsplash.com/photo-1579306194872-6463b7baa19b?auto=format&fit=crop&w=300&q=80'
      },
      {
        name: 'Signature Marou Mocha',
        price: '90,000 VND',
        desc: 'Lam Dong Arabica espresso blended with Maison Marou 65% dark chocolate',
        img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=300&q=80'
      }
    ],
    coordinates: { lat: 10.7695, lng: 106.6976 }
  },
  {
    id: 'che-ha-ton-quyen',
    name: 'Chè Hà Tôn Quyền',
    district: 'District 5',
    address: '105 Hà Tôn Quyền, Ward 11, District 5, HCMC',
    rating: 4.5,
    reviewCount: 980,
    categories: ['sweets', 'food'],
    purpose: ['fun', 'date'],
    budgetTier: '<50k',
    avgCostPerPerson: 45000,
    photos: [
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
    ],
    menu: [
      {
        name: 'Chè Mè Đen Hạnh Nhân',
        price: '35,000 VND',
        desc: 'Traditional warm black sesame sweet soup with fragrant roasted almond',
        img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&q=80'
      },
      {
        name: 'Chè Hột Gà Trà',
        price: '38,000 VND',
        desc: 'Cantonese herbal tea infused boiled egg delicacy',
        img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80'
      }
    ],
    coordinates: { lat: 10.7562, lng: 106.6578 }
  },
  {
    id: 'binh-tay-bakery',
    name: 'Bình Tây Traditional Bakery',
    district: 'District 6',
    address: '57 Tháp Mười, Ward 2, District 6, HCMC',
    rating: 4.4,
    reviewCount: 650,
    categories: ['sweets', 'coffee'],
    purpose: ['photo', 'fun'],
    budgetTier: '50-70k',
    avgCostPerPerson: 60000,
    photos: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'
    ],
    menu: [
      {
        name: 'Bánh Pía Trứng Muối Đậu Xanh',
        price: '48,000 VND',
        desc: 'Flaky pastry filled with rich mung bean paste and salted egg yolk',
        img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80'
      },
      {
        name: 'Cà Phê Sữa Đá Sài Gòn',
        price: '32,000 VND',
        desc: 'Traditional iced drip Vietnamese Robusta with sweetened condensed milk',
        img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80'
      }
    ],
    coordinates: { lat: 10.7490, lng: 106.6515 }
  },
  {
    id: 'the-workshop-coffee',
    name: 'The Workshop Coffee',
    district: 'District 1',
    address: '27 Ngô Đức Kế, Bến Nghé, District 1, HCMC',
    rating: 4.7,
    reviewCount: 2100,
    categories: ['coffee'],
    purpose: ['work', 'date'],
    budgetTier: '70-100k',
    avgCostPerPerson: 85000,
    photos: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80'
    ],
    menu: [
      {
        name: 'Pour Over Specialty Coffee',
        price: '95,000 VND',
        desc: 'Single origin beans brewed with precision V60 filter',
        img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80'
      }
    ],
    coordinates: { lat: 10.7745, lng: 106.7042 }
  },
  {
    id: 'morico-le-loi',
    name: 'Morico Contemporary Japanese Desserts',
    district: 'District 1',
    address: '30 Lê Lợi, Bến Nghé Ward, District 1, HCMC',
    rating: 4.6,
    reviewCount: 1120,
    categories: ['sweets', 'coffee', 'food'],
    purpose: ['date', 'photo'],
    budgetTier: '>100k',
    avgCostPerPerson: 125000,
    photos: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'
    ],
    menu: [
      {
        name: 'Matcha Parfait Royal',
        price: '135,000 VND',
        desc: 'Layered Kyoto matcha gelato, shiratama dango, and roasted azuki red beans',
        img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80'
      }
    ],
    coordinates: { lat: 10.7738, lng: 106.7001 }
  }
];

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'WEMEET',
    city: 'Ho Chi Minh City',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API: Get Districts & Wards
app.get('/api/districts', (req, res) => {
  res.json({
    districts: Object.keys(DISTRICT_COORDINATES),
    wards: DISTRICT_WARDS,
    coordinates: DISTRICT_COORDINATES
  });
});

// API: Calculate Midpoint from member list
app.post('/api/midpoint', (req, res) => {
  const { members } = req.body;
  if (!members || !members.length) {
    return res.status(400).json({ error: 'Members array is required' });
  }

  let totalLat = 0;
  let totalLng = 0;
  let validCount = 0;

  members.forEach(m => {
    const coords = DISTRICT_COORDINATES[m.district] || DISTRICT_COORDINATES['District 1'];
    totalLat += coords.lat;
    totalLng += coords.lng;
    validCount++;
  });

  const centerLat = totalLat / validCount;
  const centerLng = totalLng / validCount;
  const centerCoord = { lat: centerLat, lng: centerLng };

  // Find closest district to centroid
  let bestDistrict = 'District 1';
  let minDistance = Infinity;

  Object.entries(DISTRICT_COORDINATES).forEach(([distName, coord]) => {
    const dist = calculateDistanceKm(centerCoord, coord);
    if (dist < minDistance) {
      minDistance = dist;
      bestDistrict = distName;
    }
  });

  res.json({
    midpoint: {
      district: bestDistrict,
      coordinates: centerCoord,
      description: `Calculated central geographic midpoint for all ${validCount} active group members.`
    }
  });
});

// API: Recommendations with member commute time breakdown
app.post('/api/recommendations', (req, res) => {
  const { members, preferences } = req.body;
  const targetMembers = members && members.length > 0 ? members : [
    { name: 'You', district: 'District 1', travelMode: 'motorbike' },
    { name: 'Minh', district: 'District 7', travelMode: 'car' },
    { name: 'An', district: 'Binh Thanh', travelMode: 'car' },
    { name: 'Vy', district: 'District 10', travelMode: 'motorbike' }
  ];

  // Map venues with commute times for each member
  const ranked = VENUES.map(venue => {
    const memberTravels = targetMembers.map(m => {
      const memberCoord = DISTRICT_COORDINATES[m.district] || DISTRICT_COORDINATES['District 1'];
      const distKm = calculateDistanceKm(memberCoord, venue.coordinates);
      const timeMin = calculateTravelTimeMin(distKm, m.travelMode || 'motorbike');
      return {
        name: m.name,
        travelMode: m.travelMode || 'motorbike',
        distanceKm: Math.round(distKm * 10) / 10,
        timeMin: timeMin
      };
    });

    const avgTime = Math.round(memberTravels.reduce((acc, curr) => acc + curr.timeMin, 0) / memberTravels.length);
    const maxTime = Math.max(...memberTravels.map(m => m.timeMin));
    const minTime = Math.min(...memberTravels.map(m => m.timeMin));
    const fairnessSpread = maxTime - minTime;
    const fairnessScore = Math.max(60, 100 - (fairnessSpread * 2.5));

    return {
      ...venue,
      memberTravels,
      avgCommuteMin: avgTime,
      fairnessScore: Math.round(fairnessScore),
      fairnessLabel: fairnessScore >= 85 ? 'Optimal Midpoint Spot' : 'Good Compromise'
    };
  });

  // Sort by fairness score descending
  ranked.sort((a, b) => b.fairnessScore - a.fairnessScore);

  res.json({
    matches: ranked.slice(0, 3)
  });
});

// API: Support Bot Concierge
app.post('/api/support/chat', (req, res) => {
  const { message } = req.body;
  const lower = (message || '').toLowerCase();

  let reply = "Hello! I am your WEMEET Concierge. I can help coordinate group bookings, clarify fair midpoint travel math, or review service terms. How can I assist you?";

  if (lower.includes('booking') || lower.includes('reserve')) {
    reply = "To reserve a group table at Maison Marou or any top venue, select your winner and our booking concierge will verify table availability for your group size within 5 minutes!";
  } else if (lower.includes('terms') || lower.includes('điều khoản') || lower.includes('policy')) {
    reply = "WEMEET complies with Vietnamese E-Commerce and Digital Transactions Law No. 20/2023/QH15. All estimated commute times and midpoint suggestions are provided as advisory services.";
  } else if (lower.includes('midpoint') || lower.includes('fair') || lower.includes('trung tâm')) {
    reply = "WEMEET calculates the centroid coordinate across all group members and adjusts for selected travel modes (motorbike, car, bus, walk) so no friend has an unfair commute!";
  } else if (lower.includes('hi') || lower.includes('chào') || lower.includes('hello')) {
    reply = "Hi there! 👋 Glad to help you organize a frictionless meetup with your friends today!";
  }

  res.json({ reply, timestamp: new Date().toLocaleTimeString() });
});

// Start Server with Port Fallback
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🚀 WEMEET Server running at http://localhost:${port}`);
    console.log(`📱 Open your browser to experience all 10 prototype screens.`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);

module.exports = app;
