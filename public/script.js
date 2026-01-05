// "kimchies"의 SHA-256 해시값입니다.
const ADMIN_HASH = "8f4f66453914a2745369c765f042e616f731c34a1740ec671158674d86419e7a";

function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    if (id === 'gallery') loadGallery();
    if (id === 'post') loadPost(); // timetable에서 post로 변경

    // 관리자 페이지 진입 시 체크 로직
    if (id === 'admin' && localStorage.getItem('isAdmin') === 'true') {
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('upload-area').style.display = 'block';
    }
}

async function loadGallery() {
    const list = document.getElementById('gallery-list');
    try {
        const res = await fetch('/api/images');
        const images = await res.json();
        list.innerHTML = images.length
            ? images.map(img => `<div class="img-card"><img src="${img.url}"><p>${img.name}</p></div>`).join('')
            : "이미지가 없습니다.";
    } catch (e) {
        list.innerText = "로딩 실패";
    }
}

async function savePost() { // saveTimetable -> savePost
    // 보안: 저장 전 권한 확인
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert("권한이 없습니다.");
        return;
    }

    const content = document.getElementById('post-input').value; // timetable-input -> post-input
    try {
        await fetch('/api/posts', { // /api/timetable -> /api/posts
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        alert("저장 완료!");
        loadPost();
    } catch (e) {
        alert("저장 실패");
    }
}

async function loadPost() { // loadTimetable -> loadPost
    try {
        const res = await fetch('/api/posts'); // /api/timetable -> /api/posts
        const data = await res.json();
        document.getElementById('post-input').value = data.content || "";
        document.getElementById('post-display').innerText = data.content || "내용 없음";
    } catch (e) {
        console.error("게시글 로드 실패");
    }
}

// 비밀번호 검증 함수 (암호화 적용)
function checkLogin() {
    const inputPw = document.getElementById('admin-pw').value;

    // 사용자가 입력한 비번을 해싱함 (CryptoJS 라이브러리 필요)
    const hashedInput = CryptoJS.SHA256(inputPw).toString();

    // 해시값끼리 비교
    if (hashedInput === ADMIN_HASH) {
        document.getElementById('login-area').style.display = 'none';
        document.getElementById('upload-area').style.display = 'block';
        localStorage.setItem('isAdmin', 'true');
        alert("로그인 성공!");
    } else {
        alert("비밀번호가 틀렸습니다.");
        document.getElementById('admin-pw').value = "";
    }
}

function logout() {
    localStorage.removeItem('isAdmin');
    location.reload();
}