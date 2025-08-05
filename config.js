// 이 파일은 .env의 값을 복사하여 채워넣어야 합니다.
// Git에 커밋되지 않도록 .gitignore에 추가해주세요.

const KAKAO_MAP_API_KEY = "fa63f82a273ffc75f4210eacbf5437dd";
const PUBLIC_DATA_API_KEY = "5NIGXKGAMRE06PJSWUCyWgtfVv8w/rvivSbI/2P59MbbiaNYv3rCDLx7wzALI3mPZzxQbE8SSVsnQyHreR1z3Q==";

// window 객체에 할당하여 다른 스크립트에서 사용할 수 있도록 합니다.
window.config = {
    kakaoMapApiKey: KAKAO_MAP_API_KEY,
    publicDataApiKey: PUBLIC_DATA_API_KEY,
};
