// Initial Mock Data and Definitions for WEMEET HCMC

const DEFAULT_MEMBERS = [
  {
    id: 'member-you',
    name: 'You',
    isYou: true,
    district: 'District 1',
    ward: 'Ben Nghe Ward',
    travelMode: 'motorbike',
    avatarBg: 'bg-purple-600',
    avatarText: 'Y'
  },
  {
    id: 'member-minh',
    name: 'Minh',
    isYou: false,
    district: 'District 7',
    ward: 'Tan Phong (Phu My Hung)',
    travelMode: 'car',
    avatarBg: 'bg-emerald-600',
    avatarText: 'M'
  },
  {
    id: 'member-an',
    name: 'An',
    isYou: false,
    district: 'Binh Thanh',
    ward: 'Ward 25 (Nguyen Gia Tri)',
    travelMode: 'car',
    avatarBg: 'bg-indigo-600',
    avatarText: 'A'
  },
  {
    id: 'member-vy',
    name: 'Vy',
    isYou: false,
    district: 'District 10',
    ward: 'Ward 12 (Su Van Hanh)',
    travelMode: 'motorbike',
    avatarBg: 'bg-pink-600',
    avatarText: 'V'
  }
];

const INITIAL_VENUES = [
  {
    id: 'marou-calmette',
    name: 'Maison Marou Chocolate',
    badge: '#1 Place Space',
    district: 'District 1',
    address: '168 Calmette, Nguyen Thai Binh Ward, District 1, HCMC',
    rating: 4.6,
    reviews: '1.4k+ reviews',
    category: 'Desserts & Sweets / Café',
    fairnessLabel: 'Optimal Midpoint Spot',
    fairnessPercent: 98,
    votes: 0,
    times: { You: '7m', Minh: '16m', An: '13m', Vy: '12m' },
    photos: [
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=600&q=80'
    ],
    menu: [
      {
        name: 'Dark Chocolate Tartlet',
        price: '85,000 VND',
        desc: 'Single origin dark chocolate ganache in buttery tart shell',
        img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80'
      },
      {
        name: 'Matcha Green Layer Cake',
        price: '75,000 VND',
        desc: 'Uji matcha sponge cake layered with fresh whipped cream',
        img: 'https://images.unsplash.com/photo-1579306194872-6463b7baa19b?auto=format&fit=crop&w=300&q=80'
      },
      {
        name: 'Signature Marou Mocha',
        price: '90,000 VND',
        desc: 'Lam Dong Arabica espresso blended with Maison Marou 65% dark chocolate',
        img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=300&q=80'
      }
    ]
  },
  {
    id: 'che-ha-ton-quyen',
    name: 'Chè Hà Tôn Quyền',
    badge: '#2 Place Space',
    district: 'District 5',
    address: '105 Hà Tôn Quyền, Ward 11, District 5, HCMC',
    rating: 4.5,
    reviews: '980 reviews',
    category: 'Desserts & Sweets / Traditional',
    fairnessLabel: 'Balanced Spot',
    fairnessPercent: 91,
    votes: 0,
    times: { You: '14m', Minh: '18m', An: '19m', Vy: '8m' },
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
    ]
  },
  {
    id: 'binh-tay-bakery',
    name: 'Bình Tây Traditional Bakery',
    badge: '#3 Place Space',
    district: 'District 6',
    address: '57 Tháp Mười, Ward 2, District 6, HCMC',
    rating: 4.4,
    reviews: '650 reviews',
    category: 'Food & Meals / Bakery',
    fairnessLabel: 'Midpoint Alternative',
    fairnessPercent: 86,
    votes: 0,
    times: { You: '18m', Minh: '22m', An: '21m', Vy: '14m' },
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
    ]
  }
];

window.WEMEET_DATA = {
  DEFAULT_MEMBERS,
  INITIAL_VENUES
};
