// SPA 화면 상태
let currentScreen = 'dashboard';
let selectedPlace = null;
let history = [];
let map = null;
let markers = [];

const places = [
  {
    id: 1,
    name: '명륜동 더샵1단지 앞(제일교회)',
    time: '15:00~20:00',
    features: '전기, 수도, 주차',
    lat: 37.345,
    lng: 127.945
  },
  {
    id: 2,
    name: '단계주공아파트 앞',
    time: '10:00~16:00',
    features: '전기, 주차',
    lat: 37.347,
    lng: 127.943
  },
  {
    id: 3,
    name: '더샵원주센트럴파크2단지',
    time: '12:00~18:00',
    features: '수도, 주차',
    lat: 37.343,
    lng: 127.947
  }
];

const menuItems = [
  { name: '타코야끼', price: 5000, desc: '겉바속촉 정통 타코야끼', img: 'https://cdn.pixabay.com/photo/2017/06/02/18/24/takoyaki-2367023_1280.jpg' },
  { name: '핫도그', price: 3500, desc: '쫄깃한 수제 핫도그', img: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/hot-dog-1238716_1280.jpg' },
  { name: '음료', price: 2000, desc: '시원한 탄산음료', img: 'https://cdn.pixabay.com/photo/2017/01/20/15/06/cola-1995046_1280.jpg' }
];

function goHome() {
  currentScreen = 'dashboard';
  history = [];
  render();
}

function goTo(screen) {
  history.push(currentScreen);
  currentScreen = screen;
  render();
}

function goBack() {
  if (history.length > 0) {
    currentScreen = history.pop();
    render();
  } else {
    goHome();
  }
}

function initMap() {
  console.log('initMap 호출됨');
  
  // 카카오맵 API 로딩 확인
  if (typeof kakao === 'undefined' || !kakao.maps) {
    console.error('카카오맵 API가 로딩되지 않았습니다.');
    setTimeout(initMap, 1000);
    return;
  }
  
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('지도 컨테이너를 찾을 수 없습니다.');
    return;
  }
  
  console.log('지도 컨테이너 찾음:', mapContainer);
  
  try {
    const mapOption = {
      center: new kakao.maps.LatLng(37.345, 127.945),
      level: 3
    };
    
    map = new kakao.maps.Map(mapContainer, mapOption);
    console.log('지도 생성 완료');
    
    // 마커 생성
    places.forEach((place, index) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(place.lat, place.lng)
      });
      
      marker.setMap(map);
      markers.push(marker);
      
      // 마커 클릭 이벤트
      kakao.maps.event.addListener(marker, 'click', function() {
        console.log('마커 클릭됨:', place.name);
        showPlaceDetail(place);
      });
      
      console.log(`마커 ${index + 1} 생성 완료:`, place.name);
    });
    
  } catch (error) {
    console.error('지도 초기화 중 오류:', error);
  }
}

function searchPlaces(keyword) {
  if (!keyword) return;
  
  const places = new kakao.maps.services.Places();
  places.keywordSearch(keyword, function(data, status) {
    if (status === kakao.maps.services.Status.OK) {
      // 검색 결과로 지도 이동
      const bounds = new kakao.maps.LatLngBounds();
      data.forEach(item => {
        bounds.extend(new kakao.maps.LatLng(item.y, item.x));
      });
      map.setBounds(bounds);
    }
  });
}

function renderDashboard() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="toss-home">
      <header class="toss-header">
        <div class="toss-title">푸딩</div>
        <div class="toss-profile" onclick="goHome()"></div>
      </header>
      <div class="toss-greeting">안녕하세요, 사장님 👋</div>
      <div class="toss-card toss-main-card">
        <div class="toss-main-title">오늘의 예약</div>
        <div class="toss-main-info">
          <span>장소</span>
          <b>서울 광화문광장</b>
        </div>
        <div class="toss-main-info">
          <span>시간</span>
          <b>11:00 ~ 15:00</b>
        </div>
        <div class="toss-main-info">
          <span>고객 유입</span>
          <b>23명</b>
        </div>
        <button class="toss-btn-main" id="startWork">오늘 영업 시작하기</button>
      </div>
      <div class="toss-menu-row">
        <button class="toss-menu-btn" id="goPlace">장소 찾기</button>
        <button class="toss-menu-btn" id="goReserve">예약 확인</button>
        <button class="toss-menu-btn" id="goReport">분석 리포트</button>
        <button class="toss-menu-btn" id="goNotify">알림 보내기</button>
      </div>
      <div class="toss-menu-row" style="margin-top:12px;">
        <button class="toss-menu-btn" id="goMenu">메뉴/프로필</button>
        <button class="toss-menu-btn" id="goSales">매출 리포트</button>
        <button class="toss-menu-btn" id="goLocation">위치공유</button>
        <button class="toss-menu-btn" id="goSetting">설정</button>
      </div>
    </div>
  `;
  document.getElementById('goPlace').onclick = () => { goTo('placeList'); };
  document.getElementById('goReserve').onclick = () => { goTo('reserve'); };
  document.getElementById('goReport').onclick = () => { goTo('report'); };
  document.getElementById('goNotify').onclick = () => { goTo('notify'); };
  document.getElementById('goMenu').onclick = () => { goTo('menu'); };
  document.getElementById('goSales').onclick = () => { goTo('sales'); };
  document.getElementById('goLocation').onclick = () => { goTo('location'); };
  document.getElementById('goSetting').onclick = () => { goTo('setting'); };
  document.getElementById('startWork').onclick = () => { goTo('work'); };
}

function renderWork() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header">
      <button class="back-btn" id="backHome">←</button>
      <div class="toss-title">영업 중</div>
    </div>
    <div class="toss-card" style="margin-top:18px;">
      <div style="font-weight:600; font-size:1.13rem; margin-bottom:12px;">오늘의 메뉴판</div>
      <div class="work-menu-list">
        ${menuItems.map(item => `
          <div class="work-menu-item">
            <img src="${item.img}" alt="${item.name}" class="work-menu-img" />
            <div class="work-menu-info">
              <div class="work-menu-name">${item.name} <span class="work-menu-price">${item.price.toLocaleString()}원</span></div>
              <div class="work-menu-desc">${item.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="toss-card" style="margin-top:18px;">
      <div style="font-weight:600; font-size:1.13rem; margin-bottom:12px;">오늘의 장사 현황</div>
      <div class="work-status-row"><span>주문 수</span><b>17건</b></div>
      <div class="work-status-row"><span>매출</span><b>85,000원</b></div>
      <div class="work-status-row"><span>알림 발송</span><b>3건</b></div>
      <div class="work-status-row"><span>실시간 위치</span><b>원주종합운동장</b></div>
    </div>
    <div style="width:100vw;max-width:420px;margin:24px auto 0 auto;display:flex;gap:12px;">
      <button class="toss-btn-main" style="flex:1;" id="goMenu">메뉴 관리</button>
      <button class="toss-btn-main" style="flex:1;" id="goNotify">알림 보내기</button>
    </div>
  `;
  document.getElementById('backHome').onclick = goBack;
  document.getElementById('goMenu').onclick = () => { goTo('menu'); };
  document.getElementById('goNotify').onclick = () => { goTo('notify'); };
}

function renderPlaceList() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="map-header">
      <button class="back-btn" id="backDash">←</button>
      <input class="search-bar" id="searchInput" placeholder="장소, 주소 검색" />
      <button class="menu-btn" id="searchBtn">🔍</button>
    </div>
    <div id="map" class="map-area"></div>
  `;
  
  console.log('장소찾기 화면 렌더링 완료');
  
  // 지도 초기화 (약간의 지연 후)
  setTimeout(() => {
    console.log('지도 초기화 시작');
    initMap();
  }, 500);
  
  document.getElementById('backDash').onclick = goBack;
  document.getElementById('searchBtn').onclick = () => {
    const keyword = document.getElementById('searchInput').value;
    console.log('검색 키워드:', keyword);
    searchPlaces(keyword);
  };
  
  // 엔터키 검색
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const keyword = e.target.value;
      console.log('엔터키 검색:', keyword);
      searchPlaces(keyword);
    }
  });
}

function showPlaceDetail(place) {
  console.log('showPlaceDetail 호출됨, place:', place);
  
  if (!place) {
    console.error('place가 없습니다.');
    return;
  }
  
  // 기존 시트가 있다면 제거
  const existingSheet = document.querySelector('.place-sheet');
  if (existingSheet) {
    existingSheet.remove();
  }
  
  // 새로운 시트 생성
  const sheet = document.createElement('div');
  sheet.className = 'place-sheet toss-place-sheet';
  sheet.innerHTML = `
    <button class="back-btn abs" id="closeSheet">×</button>
    <div class="place-title">${place.name}</div>
    <div class="place-info">운영시간 : ${place.time}</div>
    <div class="place-info">${place.features}</div>
    <div class="place-actions">
      <button class="like-btn">❤</button>
      <button class="toss-btn-main" id="reserveBtn">예약하기</button>
    </div>
  `;
  
  document.body.appendChild(sheet);
  
  // 애니메이션으로 시트 표시
  setTimeout(() => {
    sheet.classList.add('show');
  }, 10);
  
  console.log('장소 상세 시트 표시 완료');
  
  // 선택된 장소로 지도 이동
  if (map) {
    const position = new kakao.maps.LatLng(place.lat, place.lng);
    map.setCenter(position);
    map.setLevel(2);
    console.log('지도 중심 이동 완료:', place.name);
  }
  
  // 이벤트 리스너
  document.getElementById('closeSheet').onclick = () => {
    sheet.classList.remove('show');
    setTimeout(() => {
      sheet.remove();
    }, 300);
  };
  
  document.getElementById('reserveBtn').onclick = () => { 
    alert('예약하기 기능 준비중'); 
  };
}

function renderReserve() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header"><button class="back-btn" id="backHome">←</button><div class="toss-title">예약 확인</div></div>
    <div class="toss-card">
      <div class="section-title">다가오는 예약</div>
      <div class="info-row">
        <div class="info-label">명륜동 더샵1단지 앞</div>
        <div class="info-value">2024-06-10</div>
      </div>
      <div class="info-sub" style="margin-bottom: 16px;">15:00~20:00</div>
      <div class="info-row">
        <div class="info-label">단계주공아파트 앞</div>
        <div class="info-value">2024-06-12</div>
      </div>
      <div class="info-sub" style="margin-bottom: 16px;">10:00~16:00</div>
      <div class="info-row">
        <div class="info-label">더샵원주센트럴파크2단지</div>
        <div class="info-value">2024-06-15</div>
      </div>
      <div class="info-sub">12:00~18:00</div>
    </div>
  `;
  document.getElementById('backHome').onclick = goBack;
}

function renderReport() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header"><button class="back-btn" id="backHome">←</button><div class="toss-title">분석 리포트</div></div>
    <div class="toss-card">
      <div style="font-weight:600; margin-bottom:10px;">AI 추천</div>
      <div style="margin-bottom:8px;">다음주 추천 장소: <b>원주종합운동장</b></div>
      <div style="margin-bottom:8px;">인기 메뉴: <b>타코야끼</b></div>
      <div style="margin-bottom:8px;">예상 매출: <b>1,200,000원</b></div>
      <div style="margin-top:18px; color:#888; font-size:0.98rem;">(샘플 데이터입니다)</div>
    </div>
  `;
  document.getElementById('backHome').onclick = goBack;
}

function renderNotify() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header"><button class="back-btn" id="backHome">←</button><div class="toss-title">알림 보내기</div></div>
    <div class="toss-card">
      <div style="font-weight:600; margin-bottom:10px;">근처 고객 자동 추천</div>
      <div style="margin-bottom:8px;">김푸드(010-1234-5678)</div>
      <div style="margin-bottom:8px;">이맛집(010-5678-1234)</div>
      <textarea style="width:100%;margin:12px 0 8px 0;padding:10px;border-radius:10px;border:1px solid #eee;resize:none;" rows="2" placeholder="푸시 메시지 작성"></textarea>
      <button class="toss-btn-main">보내기</button>
    </div>
  `;
  document.getElementById('backHome').onclick = goBack;
}

function renderMenu() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header"><button class="back-btn" id="backHome">←</button><div class="toss-title">메뉴/프로필</div></div>
    <div class="toss-card">
      <div style="font-weight:600; margin-bottom:10px;">내 메뉴</div>
      <div style="margin-bottom:8px;">타코야끼 <span style='color:#888'>5,000원</span></div>
      <div style="margin-bottom:8px;">핫도그 <span style='color:#888'>3,500원</span></div>
      <div style="margin-bottom:8px;">음료 <span style='color:#888'>2,000원</span></div>
      <button class="toss-btn-main" style="margin-top:18px;">메뉴 추가/수정</button>
    </div>
    <div class="toss-card" style="margin-top:18px;">
      <div style="font-weight:600; margin-bottom:10px;">프로필</div>
      <div>푸딩 타코야끼<br>010-1234-5678</div>
      <button class="toss-btn-main" style="margin-top:18px;">사진/정보 수정</button>
    </div>
  `;
  document.getElementById('backHome').onclick = goBack;
}

function renderSales() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header"><button class="back-btn" id="backHome">←</button><div class="toss-title">매출 리포트</div></div>
    <div class="toss-card">
      <div style="font-weight:600; margin-bottom:10px;">주간 매출</div>
      <div style="margin-bottom:8px;">₩1,200,000</div>
      <div style="font-weight:600; margin-bottom:10px;">월간 매출</div>
      <div style="margin-bottom:8px;">₩4,800,000</div>
      <div style="font-weight:600; margin-bottom:10px;">메뉴별 판매량</div>
      <div style="margin-bottom:8px;">타코야끼 120개</div>
      <div style="margin-bottom:8px;">핫도그 80개</div>
      <div style="margin-bottom:8px;">음료 60개</div>
      <div style="margin-top:18px; color:#888; font-size:0.98rem;">(샘플 데이터입니다)</div>
    </div>
  `;
  document.getElementById('backHome').onclick = goBack;
}

function renderLocation() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header"><button class="back-btn" id="backHome">←</button><div class="toss-title">실시간 위치공유</div></div>
    <div class="toss-card">
      <div style="font-weight:600; margin-bottom:10px;">현재 위치</div>
      <div style="margin-bottom:8px;">원주종합운동장 인근</div>
      <div style="margin-bottom:8px;">정확도: 10m</div>
      <div style="margin-bottom:8px;">공유 종료: 20:00</div>
      <button class="toss-btn-main" style="margin-top:18px;">위치 공유 종료</button>
    </div>
  `;
  document.getElementById('backHome').onclick = goBack;
}

function renderSetting() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header"><button class="back-btn" id="backHome">←</button><div class="toss-title">설정</div></div>
    <div class="toss-card">
      <div style="font-weight:600; margin-bottom:10px;">내 정보 관리</div>
      <div style="margin-bottom:8px;">비밀번호 변경</div>
      <div style="margin-bottom:8px;">연락처 변경</div>
      <div style="font-weight:600; margin:18px 0 10px 0;">알림 설정</div>
      <div style="margin-bottom:8px;">푸시 알림 ON</div>
      <div style="font-weight:600; margin:18px 0 10px 0;">기타</div>
      <div style="margin-bottom:8px;">이용약관</div>
      <div style="margin-bottom:8px;">고객센터</div>
    </div>
  `;
  document.getElementById('backHome').onclick = goBack;
}

function render() {
  if (currentScreen === 'dashboard') {
    renderDashboard();
  } else if (currentScreen === 'placeList') {
    renderPlaceList();
  } else if (currentScreen === 'placeDetail') {
    // renderPlaceDetail(); // 이 부분은 showPlaceDetail로 대체되었으므로 제거
  } else if (currentScreen === 'reserve') {
    renderReserve();
  } else if (currentScreen === 'report') {
    renderReport();
  } else if (currentScreen === 'notify') {
    renderNotify();
  } else if (currentScreen === 'menu') {
    renderMenu();
  } else if (currentScreen === 'sales') {
    renderSales();
  } else if (currentScreen === 'location') {
    renderLocation();
  } else if (currentScreen === 'setting') {
    renderSetting();
  } else if (currentScreen === 'work') {
    renderWork();
  } else {
    document.getElementById('app').innerHTML = '<div class="toss-home"><button class="toss-btn-main" onclick="location.reload()">홈으로</button></div>';
  }
}

window.goHome = goHome;
window.onload = render; 