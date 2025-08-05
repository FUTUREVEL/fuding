// SPA 화면 상태
let currentScreen = 'dashboard';
let selectedPlace = null;
let history = [];
let map = null;
let markers = [];
let places = []; // 전역 변수로 선언

const menuItems = [
  { name: '타코야끼', price: 5000, desc: '겉바속촉 정통 타코야끼', img: 'https://cdn.pixabay.com/photo/2017/06/02/18/24/takoyaki-2367023_1280.jpg' },
  { name: '핫도그', price: 3500, desc: '쫄깃한 수제 핫도그', img: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/hot-dog-1238716_1280.jpg' },
  { name: '음료', price: 2000, desc: '시원한 탄산음료', img: 'https://cdn.pixabay.com/photo/2017/01/20/15/06/cola-1995046_1280.jpg' }
];

let userMenus = [...menuItems]; // 기본 메뉴로 초기화

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
      center: new kakao.maps.LatLng(37.566826, 126.9786567),
      level: 10
    };
    
    map = new kakao.maps.Map(mapContainer, mapOption);
    console.log('지도 생성 완료');

    const geocoder = new kakao.maps.services.Geocoder();

    places.forEach((place, index) => {
      if (place.address) {
        geocoder.addressSearch(place.address, function(result, status) {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            const marker = new kakao.maps.Marker({
              map: map,
              position: coords
            });

            kakao.maps.event.addListener(marker, 'click', function() {
              showPlaceInfoSheet(place);
            });
          }
        });
      }
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
        <button class="toss-profile-btn" onclick="logoutUser()">로그아웃</button>
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
  
  // 지도 초기화
  initMap();
  
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

function showPlaceInfoSheet(place) {
  console.log('showPlaceInfoSheet 호출됨, place:', place);

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
  sheet.className = 'place-sheet toss-place-sheet'; // 기존 스타일 재사용
  sheet.innerHTML = `
    <button class="back-btn abs" id="closeSheet">×</button>
    <div class="place-name-large">${place.name}</div>
    <div class="place-info">운영시간: ${place.time}</div>
    <div class="place-info">지번주소: ${place.jibunAddress}</div>
    <div class="place-actions">
      <button class="toss-btn-main" id="roadviewBtn">로드뷰</button>
      <button class="toss-btn-main" id="reserveBtn">예약하기</button>
    </div>
  `;

  document.body.appendChild(sheet);

  // 애니메이션으로 시트 표시
  setTimeout(() => {
    sheet.classList.add('show');
  }, 10);

  console.log('장소 정보 시트 표시 완료');

  // 이벤트 리스너
  document.getElementById('closeSheet').onclick = () => {
    sheet.classList.remove('show');
    setTimeout(() => {
      sheet.remove();
    }, 300);
  };

  document.getElementById('roadviewBtn').onclick = () => {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(place.address, function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        const lat = result[0].y;
        const lng = result[0].x;

        const roadviewContainer = document.createElement('div');
        roadviewContainer.id = 'roadviewContainer';
        roadviewContainer.style.width = '100%';
        roadviewContainer.style.height = '100%';
        roadviewContainer.style.position = 'fixed';
        roadviewContainer.style.top = '0';
        roadviewContainer.style.left = '0';
        roadviewContainer.style.zIndex = '1001';
        document.body.appendChild(roadviewContainer);

        const roadviewClient = new kakao.maps.RoadviewClient();
        roadviewClient.getNearestPanoId(new kakao.maps.LatLng(lat, lng), 50, function(panoId) {
          if (panoId) {
            const roadview = new kakao.maps.Roadview(roadviewContainer);
            roadview.setPanoId(panoId, new kakao.maps.LatLng(lat, lng));

            // 'esc를 눌러 돌아가기' 메시지 창 생성
            const escMessage = document.createElement('div');
            escMessage.innerText = 'esc를 눌러 돌아가기';
            escMessage.style.position = 'absolute';
            escMessage.style.top = '50%';
            escMessage.style.left = '50%';
            escMessage.style.transform = 'translate(-50%, -50%)';
            escMessage.style.zIndex = '1002';
            escMessage.style.background = 'rgba(0,0,0,0.6)'; // 반투명 검은색 배경
            escMessage.style.color = 'white';
            escMessage.style.padding = '10px 20px';
            escMessage.style.borderRadius = '5px';
            escMessage.style.fontSize = '16px';
            escMessage.style.opacity = '1';
            escMessage.style.transition = 'opacity 0.5s ease-in-out';
            roadviewContainer.appendChild(escMessage);

            // 2초 후 메시지 사라지게 하기
            setTimeout(() => {
              escMessage.style.opacity = '0';
              setTimeout(() => escMessage.remove(), 500); // 투명도 전환 후 제거
            }, 2000);

            // Esc 키로 로드뷰 닫기
            const handleEscKey = (e) => {
              if (e.key === 'Escape') {
                roadviewContainer.remove();
                document.removeEventListener('keydown', handleEscKey);
              }
            };
            document.addEventListener('keydown', handleEscKey);
          } else {
            alert('해당 위치의 로드뷰를 찾을 수 없습니다.');
            roadviewContainer.remove();
          }
        });
      } else {
        alert('주소를 좌표로 변환할 수 없습니다.');
      }
    });
  };

  document.getElementById('reserveBtn').onclick = () => {
    showPlaceDetail(place);
    sheet.remove(); // 현재 시트 닫기
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
      <div id="menuList">
        ${userMenus.map(menu => `
          <div class="menu-item" style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span>${menu.name} <span style='color:#888'>${menu.price.toLocaleString()}원</span></span>
            <button class="edit-btn" data-name="${menu.name}">수정</button>
          </div>
        `).join('')}
      </div>
      <button class="toss-btn-main" style="margin-top:18px;" id="addMenuBtn">메뉴 추가</button>
    </div>
    <div class="toss-card" style="margin-top:18px;">
      <div style="font-weight:600; margin-bottom:10px;">프로필</div>
      <div>푸딩 타코야끼<br>010-1234-5678</div>
      <button class="toss-btn-main" style="margin-top:18px;">사진/정보 수정</button>
    </div>
  `;

  document.getElementById('backHome').onclick = goBack;
  document.getElementById('addMenuBtn').onclick = showMenuForm;
  
  // 수정 버튼 이벤트 리스너
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = (e) => {
      const menuName = e.target.dataset.name;
      const menu = userMenus.find(m => m.name === menuName);
      showMenuForm(menu);
    };
  });
}

function showMenuForm(existingMenu = null) {
  const sheet = document.createElement('div');
  sheet.className = 'place-sheet toss-place-sheet';
  sheet.innerHTML = `
    <button class="back-btn abs" id="closeSheet">×</button>
    <div class="place-title">${existingMenu ? '메뉴 수정' : '새 메뉴 추가'}</div>
    <div style="padding:20px;">
      <input type="text" id="menuName" placeholder="메뉴명" value="${existingMenu?.name || ''}" 
        style="width:100%;padding:8px;margin-bottom:10px;border-radius:8px;border:1px solid #ddd;">
      <input type="number" id="menuPrice" placeholder="가격" value="${existingMenu?.price || ''}"
        style="width:100%;padding:8px;margin-bottom:10px;border-radius:8px;border:1px solid #ddd;">
      <input type="text" id="menuDesc" placeholder="설명" value="${existingMenu?.desc || ''}"
        style="width:100%;padding:8px;margin-bottom:10px;border-radius:8px;border:1px solid #ddd;">
      <input type="text" id="menuImg" placeholder="이미지 URL" value="${existingMenu?.img || ''}"
        style="width:100%;padding:8px;margin-bottom:20px;border-radius:8px;border:1px solid #ddd;">
      ${existingMenu ? 
        `<button class="toss-btn-main" id="deleteMenu" style="width:100%;margin-bottom:10px;background:#ff4444;">삭제</button>` 
        : ''}
      <button class="toss-btn-main" id="saveMenu" style="width:100%;">저장</button>
    </div>
  `;

  document.body.appendChild(sheet);
  setTimeout(() => sheet.classList.add('show'), 10);

  document.getElementById('closeSheet').onclick = () => {
    sheet.classList.remove('show');
    setTimeout(() => sheet.remove(), 300);
  };

  document.getElementById('saveMenu').onclick = async () => {
    const name = document.getElementById('menuName').value;
    const price = document.getElementById('menuPrice').value;
    
    if (!name || !price) {
      alert('메뉴명과 가격은 필수입니다.');
      return;
    }

    const { data: { user } } = await window.supabaseClient.auth.getUser();

    if (!user) {
      alert('메뉴를 저장하려면 로그인이 필요합니다.');
      goTo('login');
      return;
    }

    const menuData = {
      name: name,
      price: parseInt(price),
      description: document.getElementById('menuDesc').value || '',
      img: document.getElementById('menuImg').value || 'https://via.placeholder.com/150',
      user_id: user.id
    };

    try {
      if (existingMenu) {
        // 기존 메뉴 수정
        const { error } = await window.supabaseClient
          .from('menus')
          .update(menuData)
          .eq('id', existingMenu.id);
        
        if (error) throw error;
      } else {
        // 새 메뉴 추가
        const { error } = await window.supabaseClient
          .from('menus')
          .insert([menuData]);
        
        if (error) throw error;
      }

      await loadUserMenus(); // 메뉴 목록 새로고침
      sheet.remove();
    } catch (error) {
      console.error('메뉴 저장 오류:', error);
      alert('메뉴 저장 중 오류가 발생했습니다.');
    }
  };

  if (existingMenu) {
    document.getElementById('deleteMenu').onclick = async () => {
      if (confirm('이 메뉴를 삭제하시겠습니까?')) {
        try {
          const { error } = await window.supabaseClient
            .from('menus')
            .delete()
            .eq('id', existingMenu.id);
          
          if (error) throw error;
          
          await loadUserMenus(); // 메뉴 목록 새로고침
          sheet.remove();
        } catch (error) {
          console.error('메뉴 삭제 오류:', error);
          alert('메뉴 삭제 중 오류가 발생했습니다.');
        }
      }
    };
  }
}

// 앱 시작시 저장된 메뉴 불러오기
async function loadUserMenus() {
  try {
    const { data, error } = await window.supabaseClient
      .from('menus')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    userMenus = data || [...menuItems]; // 데이터가 없으면 기본 메뉴 사용
  } catch (error) {
    console.error('메뉴 로딩 오류:', error);
    userMenus = [...menuItems]; // 오류 시 기본 메뉴 사용
  }
  renderMenu(); // 메뉴 화면 새로고침
}

// 앱 초기화 시 호출
loadUserMenus();

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
  } else if (currentScreen === 'signup') {
    renderSignupScreen();
  } else if (currentScreen === 'login') {
    renderLoginScreen();
  } else if (currentScreen === 'csvUpload') {
    renderCsvUploadScreen();
  } else if (currentScreen === 'menuManagement') {
    renderMenuManagementScreen();
  } else {
    document.getElementById('app').innerHTML = '<div class="toss-home"><button class="toss-btn-main" onclick="location.reload()">홈으로</button></div>';
  }
}

function renderSignupScreen() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header">
      <div class="toss-title">환영합니다!</div>
    </div>
    <div class="toss-card" style="margin-top: 22px;">
      <div class="section-title">회원가입</div>
      <input type="text" id="businessName" class="toss-input" placeholder="업소명">
      <input type="email" id="email" class="toss-input" placeholder="이메일 주소">
      <input type="password" id="password" class="toss-input" placeholder="비밀번호 (6자 이상)">
      <button class="toss-btn-main" id="signupBtn" style="margin-top: 16px;">가입하고 시작하기</button>
      <button class="toss-btn-text" id="goToLoginBtn" style="margin-top: 24px;">이미 계정이 있으신가요? 로그인</button>
    </div>
  `;

  document.getElementById('signupBtn').onclick = signUpUser;
  document.getElementById('goToLoginBtn').onclick = () => goTo('login');
}

function renderLoginScreen() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header">
      <button class="back-btn" id="backBtn">←</button>
      <div class="toss-title">로그인</div>
    </div>
    <div class="toss-card" style="margin-top: 22px;">
      <div class="section-title">다시 만나서 반가워요!</div>
      <input type="email" id="email" class="toss-input" placeholder="이메일 주소">
      <input type="password" id="password" class="toss-input" placeholder="비밀번호">
      <button class="toss-btn-main" id="loginBtn" style="margin-top: 16px;">로그인</button>
    </div>
  `;

  document.getElementById('backBtn').onclick = goBack;
  document.getElementById('loginBtn').onclick = loginUser;
}

async function signUpUser() {
  const businessName = document.getElementById('businessName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!businessName || !email || !password) {
    alert('업소명, 이메일, 비밀번호를 모두 입력해주세요.');
    return;
  }

  const { user, error } = await window.supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        business_name: businessName
      }
    }
  });

  if (error) {
    alert('회원가입 중 오류가 발생했습니다: ' + error.message);
  } else {
    alert('회원가입 성공! 이메일을 확인하여 계정을 활성화해주세요.');
    // 로그인 페이지로 유지하거나, 자동 로그인 후 대시보드로 이동할 수 있습니다.
  }
}

async function loginUser() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('이메일과 비밀번호를 모두 입력해주세요.');
    return;
  }

  const { data, error } = await window.supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    alert('로그인 중 오류가 발생했습니다: ' + error.message);
  } else {
    // 로그인이 성공하면 onAuthStateChange 리스너가 감지하여
    // 대시보드로 화면을 전환합니다.
    console.log('로그인 성공!', data.user);
  }
}

async function logoutUser() {
  const { error } = await window.supabaseClient.auth.signOut();
  if (error) {
    alert('로그아웃 중 오류가 발생했습니다: ' + error.message);
  }
  // 로그아웃이 성공하면 onAuthStateChange 리스너가 감지하여
  // 로그인 화면으로 전환합니다.
}


if (typeof window !== 'undefined') {
  window.goHome = goHome;

  // 앱 시작 시 사용자 세션을 확인하고 첫 화면을 렌더링하는 함수
  async function checkUserSessionAndRender() {
    if (!window.supabaseClient) {
      console.error("Supabase 클라이언트가 초기화되지 않았습니다. supabase-client.js 파일을 확인해주세요.");
      document.getElementById('app').innerHTML = `
        <div style="padding: 40px 20px; text-align: center; font-family: 'Pretendard', sans-serif;">
            <h1 style="font-size: 1.5rem; color: #d92b2b;">설정 오류</h1>
            <p style="font-size: 1rem; color: #333; line-height: 1.6;">
                Supabase 클라이언트가 올바르게 초기화되지 않았습니다.<br>
                <strong>supabase-client.js</strong> 파일에<br>
                정확한 Supabase 프로젝트 URL과 anon 키를 입력했는지 확인해주세요.
            </p>
        </div>
      `;
      return;
    }

    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session && session.user) {
        console.log('로그인 상태:', session.user.email);
        currentScreen = 'dashboard';
      } else {
        console.log('로그아웃 상태');
        currentScreen = 'signup';
      }
    } catch (e) {
      console.error('세션 확인 중 오류:', e);
      currentScreen = 'signup'; // 오류 발생 시 회원가입 화면으로
    } finally {
      render();
    }
  }

  // 인증 상태 변경(로그인, 로그아웃) 시 화면을 다시 렌더링
  if (window.supabaseClient) {
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        currentScreen = 'dashboard';
        render();
      } else if (event === 'SIGNED_OUT') {
        currentScreen = 'signup';
        render();
      }
    });
  }

  // 앱 시작
  checkUserSessionAndRender();
  loadAndParseCsv();
}

function renderCsvUploadScreen() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header">
      <button class="back-btn" id="backHome">←</button>
      <div class="toss-title">CSV 업로드</div>
    </div>
    <div class="toss-card" style="margin-top: 22px;">
      <div class="section-title">'places' 테이블에 데이터 추가</div>
      <p style="font-size: 0.95rem; color: #6b7280; margin-bottom: 16px;">
        UTF-8로 인코딩된 CSV 파일을 선택해주세요. 첫 번째 행은 헤더(열 이름)여야 합니다.
      </p>
      <input type="file" id="csvFile" accept=".csv" class="toss-input">
      <button class="toss-btn-main" id="uploadCsvBtn" style="margin-top: 16px;">업로드 시작</button>
    </div>
  `;

  document.getElementById('backHome').onclick = goBack;
  document.getElementById('uploadCsvBtn').onclick = handleCsvUpload;
}

async function handleCsvUpload() {
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('CSV 파일을 먼저 선택해주세요.');
    return;
  }

  Papa.parse(file, {
    header: true,
    encoding: "UTF-8",
    complete: async function(results) {
      const data = results.data;
      if (!data || data.length === 0) {
        alert('CSV 파일이 비어있거나 형식이 잘못되었습니다.');
        return;
      }

      // lat, lng와 같이 숫자여야 하는 필드는 명시적으로 변환하고, is_readonly 플래그를 추가합니다.
      const processedData = data.map(item => ({
        ...item,
        lat: parseFloat(item.lat) || null,
        lng: parseFloat(item.lng) || null,
        is_readonly: true // CSV로 업로드된 데이터는 수정 불가
      }));

      alert(`총 ${processedData.length}개의 데이터를 'places' 테이블에 업로드합니다.`);

      try {
        const { error } = await window.supabaseClient
          .from('places')
          .insert(processedData);

        if (error) {
          console.error('Supabase insert error:', error);
          alert('데이터 업로드 중 오류가 발생했습니다: ' + error.message);
        } else {
          alert('데이터 업로드가 성공적으로 완료되었습니다!');
          goHome(); // 성공 시 대시보드로 이동
        }
      } catch (e) {
        console.error('Upload error:', e);
        alert('데이터 업로드 중 예기치 않은 오류가 발생했습니다.');
      }
    },
    error: function(error) {
      console.error('CSV 파싱 오류:', error);
      alert('CSV 파일을 읽는 중 오류가 발생했습니다: ' + error.message);
    }
  });
}

function renderMenuManagementScreen() {
  document.getElementById('app').innerHTML = `
    <div class="toss-header">
      <button class="back-btn" id="backHome">←</button>
      <div class="toss-title">메뉴 관리</div>
    </div>
    <div class="toss-card" style="margin-top: 22px;">
      <div class="section-title">내 메뉴 목록</div>
      <p style="font-size: 0.95rem; color: #6b7280; margin-bottom: 16px;">
        여기에 현재 메뉴 목록이 표시됩니다.
      </p>
      <button class="toss-btn-main" id="addMenuItemBtn">새 메뉴 추가</button>
    </div>
  `;
  document.getElementById('backHome').onclick = goBack;
  document.getElementById('addMenuItemBtn').onclick = () => alert('메뉴 추가 기능 준비중!');
}

function loadAndParseCsv() {
  Papa.parse('전국푸드트럭허가구역표준데이터_UTF8.csv', {
    download: true,
    header: true,
    encoding: "UTF-8",
    complete: function(results) {
      const data = results.data;
      if (!data || data.length === 0) {
        alert('CSV 파일이 비어있거나 형식이 잘못되었습니다.');
        return;
      }
      places = data.map(item => ({
        name: item.허가구역명,
        address: item.소재지도로명주소,
        time: `${item.허가구역평일운영시작시각 || '시간정보없음'} - ${item.허가구역평일운영종료시각 || ''}`,
        jibunAddress: item.소재지지번주소 || '정보없음'
      }));
      console.log('CSV 데이터 로드 및 파싱 완료:', places);
    },
    error: function(error) {
      console.error('CSV 파싱 오류:', error);
      alert('CSV 파일을 읽는 중 오류가 발생했습니다: ' + error.message);
    }
  });
}
