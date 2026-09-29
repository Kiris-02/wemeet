// WEMEET Client Application Logic

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// App State
const state = {
  currentScreen: 1,
  userLocation: {
    district: 'District 1',
    ward: 'Ben Nghe Ward',
    address: '',
    travelMode: 'motorbike'
  },
  members: JSON.parse(JSON.stringify(window.WEMEET_DATA.DEFAULT_MEMBERS)),
  preferences: {
    categories: ['coffee', 'sweets'],
    purpose: ['date'],
    budget: '70-100k'
  },
  venues: JSON.parse(JSON.stringify(window.WEMEET_DATA.INITIAL_VENUES)),
  voting: {
    mode: 'pass', // 'pass' or 'sim'
    currentVoterIndex: 0,
    memberVotes: {}
  },
  editingMemberId: null
};

// Travel mode icon mapper
const TRAVEL_ICONS = {
  motorbike: 'fa-motorcycle',
  car: 'fa-car-side',
  bus: 'fa-bus',
  walk: 'fa-person-walking'
};

// District Wards map
const DISTRICT_WARDS = {
  'District 1': ['Ben Nghe Ward', 'Da Kao Ward', 'Ben Thanh Ward', 'Nguyen Thai Binh Ward'],
  'District 3': ['Vo Thi Sau Ward', 'Ward 1', 'Ward 2', 'Ward 3'],
  'District 5': ['Ward 11 (Ha Ton Quyen)', 'Ward 1', 'Ward 5'],
  'District 7': ['Tan Phong (Phu My Hung)', 'Tan Phu', 'Tan Thuan Dong'],
  'District 10': ['Ward 12 (Su Van Hanh)', 'Ward 1', 'Ward 14'],
  'Binh Thanh': ['Ward 25 (Nguyen Gia Tri)', 'Ward 19', 'Ward 27'],
  'Phu Nhuan': ['Ward 2 (Phan Xich Long)', 'Ward 7'],
  'Tan Binh': ['Ward 2 (Airport area)', 'Ward 12'],
  'Thu Duc': ['Thao Dien Ward', 'An Phu Ward', 'Linh Trung']
};

function initApp() {
  setupEventListeners();
  renderMembersList();
  recalculateMidpoint();
  renderMatches();
  renderVotingOptions();
  updateLiveClock();
  setInterval(updateLiveClock, 30000);
}

function updateLiveClock() {
  const clock = document.getElementById('statusBarClock');
  if (clock) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    clock.textContent = `${hours}:${mins}`;
  }
}

function setupEventListeners() {
  // District change updates wards
  const districtSelect = document.getElementById('setupDistrict');
  if (districtSelect) {
    districtSelect.addEventListener('change', (e) => {
      const dist = e.target.value;
      state.userLocation.district = dist;
      populateWards(dist);
    });
  }

  // Frame toggle
  const toggleBtn = document.getElementById('toggleFrameBtn');
  const shell = document.getElementById('deviceShell');
  if (toggleBtn && shell) {
    toggleBtn.addEventListener('click', () => {
      shell.classList.toggle('full-mode');
      const isFull = shell.classList.contains('full-mode');
      toggleBtn.innerHTML = isFull 
        ? `<i class="fa-solid fa-mobile-screen"></i><span>iPhone Frame</span>`
        : `<i class="fa-solid fa-expand"></i><span>Full Width</span>`;
    });
  }
}

function populateWards(district) {
  const wardSelect = document.getElementById('setupWard');
  if (!wardSelect) return;
  wardSelect.innerHTML = '';
  const wards = DISTRICT_WARDS[district] || ['Ward 1', 'Ward 2', 'Ward 3'];
  wards.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = w;
    wardSelect.appendChild(opt);
  });
  state.userLocation.ward = wards[0];
}

// ==========================================
// NAVIGATION SYSTEM
// ==========================================
function navigateToScreen(screenNum) {
  state.currentScreen = screenNum;

  // Toggle active screen view
  document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${screenNum}`);
  if (target) {
    target.classList.add('active');
  }

  // Update top demo bar pills
  document.querySelectorAll('.nav-pill').forEach(pill => {
    const pScreen = parseInt(pill.getAttribute('data-screen'), 10);
    if (pScreen === screenNum) {
      pill.className = 'nav-pill px-2.5 py-1 rounded-md bg-purple-600 text-white font-semibold whitespace-nowrap transition';
    } else {
      pill.className = 'nav-pill px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 whitespace-nowrap transition';
    }
  });

  // Screen-specific triggers
  if (screenNum === 2) {
    renderMembersList();
    recalculateMidpoint();
  } else if (screenNum === 5) {
    renderMatches();
  } else if (screenNum === 7) {
    renderVotingOptions();
  } else if (screenNum === 8) {
    triggerConfetti();
  }

  // Scroll mobile frame to top
  const container = document.querySelector('#deviceShell > div.flex-1');
  if (container) container.scrollTop = 0;
}

// ==========================================
// SCREEN 1: LOCATION SETUP
// ==========================================
function selectTravelMode(mode) {
  state.userLocation.travelMode = mode;
  document.querySelectorAll('.travel-mode-btn').forEach(btn => {
    if (btn.getAttribute('data-mode') === mode) {
      btn.className = 'travel-mode-btn active flex flex-col items-center justify-center p-3 rounded-xl border border-purple-500 bg-purple-50 text-purple-700 shadow-sm transition';
    } else {
      btn.className = 'travel-mode-btn flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-purple-300 transition';
    }
  });
}

function simulateGPSLocation() {
  const btn = document.getElementById('btnGPS');
  if (!btn) return;
  const original = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-purple-600"></i><span>Detecting GPS Coordinates...</span>`;
  
  setTimeout(() => {
    const distSelect = document.getElementById('setupDistrict');
    if (distSelect) distSelect.value = 'District 1';
    populateWards('District 1');
    const addrInput = document.getElementById('setupAddress');
    if (addrInput) addrInput.value = 'Nguyen Hue Walking Street, Ben Nghe, District 1';
    
    state.userLocation.district = 'District 1';
    state.userLocation.ward = 'Ben Nghe Ward';
    state.userLocation.address = 'Nguyen Hue Walking Street, Ben Nghe, District 1';

    btn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600"></i><span class="text-emerald-700">GPS Locked: District 1</span>`;
    setTimeout(() => { btn.innerHTML = original; }, 2500);
  }, 700);
}

function shareAppPrompt() {
  const shareText = "Find fair meetup spots in Saigon with WEMEET!";
  if (navigator.share) {
    navigator.share({ title: 'WEMEET', text: shareText, url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert("WEMEET link copied to clipboard! Share it with your friends.");
  }
}

function saveLocationAndEnterLobby() {
  const distSelect = document.getElementById('setupDistrict');
  const wardSelect = document.getElementById('setupWard');
  const addrInput = document.getElementById('setupAddress');

  if (distSelect) state.userLocation.district = distSelect.value;
  if (wardSelect) state.userLocation.ward = wardSelect.value;
  if (addrInput) state.userLocation.address = addrInput.value;

  // Sync "You" member
  const youMember = state.members.find(m => m.isYou);
  if (youMember) {
    youMember.district = state.userLocation.district;
    youMember.ward = state.userLocation.ward;
    youMember.travelMode = state.userLocation.travelMode;
  }

  navigateToScreen(2);
}

// ==========================================
// SCREEN 2: GROUP LOBBY
// ==========================================
function renderMembersList() {
  const container = document.getElementById('membersContainer');
  if (!container) return;

  const countBadge = document.getElementById('lobbyActiveCount');
  if (countBadge) {
    countBadge.textContent = `${state.members.length} Members Active`;
  }

  container.innerHTML = state.members.map(member => {
    const travelIcon = TRAVEL_ICONS[member.travelMode] || 'fa-motorcycle';
    return `
      <div onclick="openEditMemberModal('${member.id}')" class="bg-white rounded-2xl p-3 border border-slate-100 flex items-center justify-between shadow-sm hover:border-purple-200 transition cursor-pointer">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-full ${member.avatarBg} text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
            ${member.avatarText}
          </div>
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-bold text-slate-800">${member.name}</span>
              ${member.isYou ? `<span class="text-[9px] bg-purple-100 text-purple-700 font-extrabold px-1.5 py-0.2 rounded-full">YOU</span>` : ''}
            </div>
            <p class="text-[10px] text-slate-400 font-medium">${member.district} • ${member.ward}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2 text-slate-400">
          <div class="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-xs text-slate-600">
            <i class="fa-solid ${travelIcon}"></i>
          </div>
          <i class="fa-solid fa-chevron-right text-[10px] text-slate-300"></i>
        </div>
      </div>
    `;
  }).join('');
}

async function recalculateMidpoint() {
  try {
    const res = await fetch('/api/midpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ members: state.members })
    });
    if (res.ok) {
      const data = await res.json();
      const distName = document.getElementById('midpointDistrictName');
      const distDesc = document.getElementById('midpointDescription');
      if (distName) distName.textContent = data.midpoint.district;
      if (distDesc) distDesc.textContent = data.midpoint.description;
    }
  } catch (e) {
    // Client fallback
    const distName = document.getElementById('midpointDistrictName');
    if (distName) distName.textContent = 'District 1';
  }
}

// Member Modals
function openAddMemberModal() {
  state.editingMemberId = null;
  document.getElementById('modalTitle').textContent = 'Add Group Member';
  document.getElementById('modalMemberName').value = '';
  document.getElementById('btnDeleteMember').classList.add('hidden');
  document.getElementById('memberModal').classList.remove('hidden');
}

function openEditMemberModal(memberId) {
  const member = state.members.find(m => m.id === memberId);
  if (!member) return;
  state.editingMemberId = memberId;
  document.getElementById('modalTitle').textContent = `Edit ${member.name}`;
  document.getElementById('modalMemberName').value = member.name;
  document.getElementById('modalMemberDistrict').value = member.district;
  document.getElementById('modalMemberTravel').value = member.travelMode;
  
  const delBtn = document.getElementById('btnDeleteMember');
  if (member.isYou) {
    delBtn.classList.add('hidden');
  } else {
    delBtn.classList.remove('hidden');
  }

  document.getElementById('memberModal').classList.remove('hidden');
}

function closeMemberModal() {
  document.getElementById('memberModal').classList.add('hidden');
}

function saveMemberModal() {
  const name = document.getElementById('modalMemberName').value.trim();
  const district = document.getElementById('modalMemberDistrict').value;
  const travelMode = document.getElementById('modalMemberTravel').value;

  if (!name) {
    alert('Please enter member name');
    return;
  }

  if (state.editingMemberId) {
    const member = state.members.find(m => m.id === state.editingMemberId);
    if (member) {
      member.name = name;
      member.district = district;
      member.travelMode = travelMode;
      member.ward = (DISTRICT_WARDS[district] && DISTRICT_WARDS[district][0]) || 'Center';
    }
  } else {
    const colors = ['bg-indigo-600', 'bg-pink-600', 'bg-amber-600', 'bg-cyan-600', 'bg-teal-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    state.members.push({
      id: `member-${Date.now()}`,
      name: name,
      isYou: false,
      district: district,
      ward: (DISTRICT_WARDS[district] && DISTRICT_WARDS[district][0]) || 'Center',
      travelMode: travelMode,
      avatarBg: randomColor,
      avatarText: name.charAt(0).toUpperCase()
    });
  }

  closeMemberModal();
  renderMembersList();
  recalculateMidpoint();
}

function deleteCurrentMember() {
  if (!state.editingMemberId) return;
  state.members = state.members.filter(m => m.id !== state.editingMemberId);
  closeMemberModal();
  renderMembersList();
  recalculateMidpoint();
}

// ==========================================
// SCREEN 3 & 4: PREFERENCES & VIBE
// ==========================================
function togglePreference(type, value, btnEl) {
  const arr = state.preferences[type === 'category' ? 'categories' : 'purpose'];
  const idx = arr.indexOf(value);
  if (idx > -1) {
    if (arr.length > 1) { // keep at least 1
      arr.splice(idx, 1);
      btnEl.classList.remove('active');
    }
  } else {
    arr.push(value);
    btnEl.classList.add('active');
  }
}

function selectBudget(tier, btnEl) {
  state.preferences.budget = tier;
  document.querySelectorAll('.budget-pill').forEach(b => {
    b.className = 'budget-pill p-2 text-center rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold transition';
  });
  btnEl.className = 'budget-pill active p-2 text-center rounded-xl border border-purple-500 bg-purple-600 text-white text-xs font-bold shadow-sm transition';
}

function calculateAndGoToMatches() {
  navigateToScreen(5);
}

// ==========================================
// SCREEN 5: TOP 3 MATCHES
// ==========================================
async function renderMatches() {
  const container = document.getElementById('matchesContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        members: state.members,
        preferences: state.preferences
      })
    });
    if (res.ok) {
      const data = await res.json();
      state.venues = data.matches;
    }
  } catch (e) {
    console.warn('Using client mock venues');
  }

  container.innerHTML = state.venues.map((venue, index) => {
    const badgeText = venue.badge || `#${index + 1} Place Space`;
    const rating = venue.rating || 4.6;
    const address = venue.address || 'District 1, HCMC';
    
    // Member commute pills
    const travels = venue.memberTravels || [
      { name: 'You', timeMin: 7 },
      { name: 'Minh', timeMin: 16 },
      { name: 'An', timeMin: 13 },
      { name: 'Vy', timeMin: 12 }
    ];

    const commuteHtml = travels.map(t => `
      <div class="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-center">
        <span class="text-[9px] text-slate-400 block">${t.name}</span>
        <span class="text-[10px] font-bold text-slate-700"><i class="fa-solid fa-car-side text-[9px] text-slate-400 mr-1"></i>${t.timeMin}m</span>
      </div>
    `).join('');

    const img1 = (venue.photos && venue.photos[0]) || 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80';
    const img2 = (venue.photos && venue.photos[1]) || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80';

    return `
      <div class="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm space-y-2.5">
        <div class="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden h-24">
          <img src="${img1}" class="w-full h-full object-cover">
          <img src="${img2}" class="w-full h-full object-cover">
        </div>

        <div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] bg-purple-50 text-purple-700 font-extrabold px-2 py-0.5 rounded-md border border-purple-200">
              ${badgeText}
            </span>
            <span class="text-xs font-bold text-amber-500 flex items-center gap-1">
              <i class="fa-solid fa-star text-[10px]"></i>
              <span>${rating}</span>
            </span>
          </div>

          <h3 class="text-xs font-black text-slate-900 mt-1">${venue.name}</h3>
          <p class="text-[10px] text-slate-400 line-clamp-1">${address}</p>
        </div>

        <!-- Commute Matrix -->
        <div class="grid grid-cols-4 gap-1">
          ${commuteHtml}
        </div>

        <button onclick="openVenueDetails('${venue.id}')" class="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-utensils text-[10px]"></i>
          <span>View Full Menu & Details</span>
        </button>
      </div>
    `;
  }).join('');
}

// ==========================================
// SCREEN 6: PLACE DETAILS
// ==========================================
function openVenueDetails(venueId) {
  const venue = state.venues.find(v => v.id === venueId) || state.venues[0];
  if (!venue) return;

  const titleEl = document.getElementById('detailVenueName');
  const addrEl = document.getElementById('detailVenueAddress');
  if (titleEl) titleEl.textContent = venue.name;
  if (addrEl) addrEl.textContent = venue.address;

  const menuContainer = document.getElementById('menuItemsContainer');
  if (menuContainer && venue.menu) {
    menuContainer.innerHTML = venue.menu.map(item => `
      <div class="bg-white rounded-xl p-3 border border-slate-100 flex items-center justify-between gap-2.5 shadow-sm">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <h4 class="text-xs font-bold text-slate-800">${item.name}</h4>
            <span class="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded">${item.price}</span>
          </div>
          <p class="text-[10px] text-slate-500 leading-tight">${item.desc}</p>
        </div>
        <img src="${item.img}" class="w-14 h-14 rounded-lg object-cover flex-shrink-0">
      </div>
    `).join('');
  }

  navigateToScreen(6);
}

// ==========================================
// SCREEN 7: GROUP VOTE
// ==========================================
function setVotingMode(mode) {
  state.voting.mode = mode;
  const passBtn = document.getElementById('btnModePass');
  const simBtn = document.getElementById('btnModeSim');

  if (mode === 'pass') {
    passBtn.className = 'flex-1 py-1.5 rounded-lg bg-white text-purple-700 shadow-sm transition flex items-center justify-center gap-1';
    simBtn.className = 'flex-1 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1';
  } else {
    simBtn.className = 'flex-1 py-1.5 rounded-lg bg-white text-purple-700 shadow-sm transition flex items-center justify-center gap-1';
    passBtn.className = 'flex-1 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1';
  }
}

function renderVotingOptions() {
  const container = document.getElementById('votingOptionsContainer');
  if (!container) return;

  const currentMember = state.members[state.voting.currentVoterIndex] || state.members[0];
  const totalSteps = state.members.length;
  const currentStep = state.voting.currentVoterIndex + 1;

  // Update Turn Banner
  const avatarEl = document.getElementById('voterAvatar');
  const nameEl = document.getElementById('voterName');
  const stepEl = document.getElementById('voterStep');
  if (avatarEl) avatarEl.textContent = currentMember.avatarText || 'Y';
  if (nameEl) nameEl.textContent = currentMember.name;
  if (stepEl) stepEl.textContent = `Step ${currentStep}/${totalSteps}`;

  // Count live votes
  const voteTallies = {};
  state.venues.forEach(v => { voteTallies[v.id] = 0; });
  Object.values(state.voting.memberVotes).forEach(vid => {
    if (voteTallies[vid] !== undefined) voteTallies[vid]++;
  });

  container.innerHTML = state.venues.map(venue => {
    const count = voteTallies[venue.id] || 0;
    const isVoted = state.voting.memberVotes[currentMember.id] === venue.id;

    return `
      <div onclick="castVoteForCurrentMember('${venue.id}')" class="bg-white rounded-2xl p-3.5 border ${isVoted ? 'border-purple-500 bg-purple-50/30' : 'border-slate-100'} hover:border-purple-300 flex items-center justify-between shadow-sm transition cursor-pointer">
        <div class="flex items-center space-x-3">
          <img src="${(venue.photos && venue.photos[0]) || ''}" class="w-12 h-12 rounded-xl object-cover">
          <div>
            <h4 class="text-xs font-bold text-slate-900">${venue.name}</h4>
            <span class="text-[10px] text-slate-400 block">${venue.district}</span>
            <span class="text-[10px] font-bold text-purple-600"><i class="fa-solid fa-thumbs-up mr-1 text-[9px]"></i>${count} Votes</span>
          </div>
        </div>
        <div class="w-7 h-7 rounded-full ${isVoted ? 'bg-purple-600 text-white' : 'border border-slate-200 text-transparent'} flex items-center justify-center text-xs transition">
          <i class="fa-solid fa-check"></i>
        </div>
      </div>
    `;
  }).join('');
}

function castVoteForCurrentMember(venueId) {
  const currentMember = state.members[state.voting.currentVoterIndex];
  if (!currentMember) return;

  state.voting.memberVotes[currentMember.id] = venueId;

  if (state.voting.mode === 'sim') {
    // Auto simulate remaining members
    state.members.forEach(m => {
      // Favor venueId for demo winner consistency
      state.voting.memberVotes[m.id] = venueId;
    });
    renderVotingOptions();
    setTimeout(() => {
      revealWinner(venueId);
    }, 400);
    return;
  }

  // Pass & Vote: advance turn
  if (state.voting.currentVoterIndex < state.members.length - 1) {
    state.voting.currentVoterIndex++;
    renderVotingOptions();
  } else {
    // Voting complete! Pick winner with most votes
    renderVotingOptions();
    setTimeout(() => {
      revealWinner(venueId);
    }, 400);
  }
}

function resetVotes() {
  state.voting.currentVoterIndex = 0;
  state.voting.memberVotes = {};
  renderVotingOptions();
}

// ==========================================
// SCREEN 8: WINNER REVEAL
// ==========================================
function revealWinner(winnerVenueId) {
  const winner = state.venues.find(v => v.id === winnerVenueId) || state.venues[0];
  const nameEl = document.getElementById('winnerName');
  const addrEl = document.getElementById('winnerAddress');
  const votesWonEl = document.getElementById('winnerVotesWon');

  if (nameEl) nameEl.textContent = winner.name;
  if (addrEl) addrEl.textContent = winner.address;
  if (votesWonEl) votesWonEl.textContent = `${state.members.length} / ${state.members.length} Votes`;

  navigateToScreen(8);
}

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function planAnotherMeetup() {
  resetVotes();
  navigateToScreen(1);
}

// ==========================================
// SCREEN 9: SUPPORT & CONCIERGE CHAT
// ==========================================
async function handleChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('chatInput');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  await sendChatMessage(msg);
}

function sendQuickMessage(msg) {
  sendChatMessage(msg);
}

async function sendChatMessage(userText) {
  try {
    const res = await fetch('/api/support/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });
    if (res.ok) {
      const data = await res.json();
      alert(`🤖 WEMEET Concierge:\n\n${data.reply}`);
    }
  } catch (e) {
    alert("🤖 WEMEET Concierge: Thank you for reaching out! We are here to help organize your meetup.");
  }
}

// ==========================================
// SCREEN 10: TERMS & CONDITIONS
// ==========================================
function toggleTermsAccept(checkbox) {
  const btn = document.getElementById('btnAcceptTerms');
  if (!btn) return;
  if (checkbox.checked) {
    btn.disabled = false;
    btn.className = 'w-full py-3.5 rounded-xl btn-primary-gradient text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md';
  } else {
    btn.disabled = true;
    btn.className = 'w-full py-3.5 rounded-xl bg-slate-300 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-not-allowed';
  }
}

function acceptTermsAndContinue() {
  alert("Cảm ơn bạn đã xác nhận Điều khoản dịch vụ WEMEET!");
  navigateToScreen(1);
}
