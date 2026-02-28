const sites = [
  'https://example.com',
  'https://www.wikipedia.org',
  'https://www.mozilla.org',
  'https://www.github.com',
  'https://news.ycombinator.com',
  'https://news.google.com',
  'https://www.reddit.com',
  'https://www.stackoverflow.com'
];

// authentication helpers (localStorage-backed)
function getUsers() {
  return JSON.parse(localStorage.getItem('AppBasicUsers') || '{}');
}
function saveUsers(u) {
  localStorage.setItem('AppBasicUsers', JSON.stringify(u));
}
function showAuthMsg(msg, success=false) {
  const el = document.getElementById('auth-msg');
  el.textContent = msg;
  el.style.color = success ? '#388e3c' : '#d32f2f';
}

function register(username, password) {
  const users = getUsers();
  if (users[username]) {
    showAuthMsg('user exists');
    return false;
  }
  users[username] = {
    pass: btoa(password),
    displayName: username,
    icon: null
  };
  saveUsers(users);
  showAuthMsg('registered', true);
  return true;
}

function login(username, password) {
  const users = getUsers();
  if (users[username] && users[username].pass === btoa(password)) {
    if (users[username].banned) {
      showAuthMsg('account is banned');
      return false;
    }
    showAuthMsg('logged in', true);
    return true;
  }
  showAuthMsg('invalid');
  return false;
}

let mode = 'login'; // 'login' or 'register'
let authenticated = false;
let currentUser = null;
let currentDisplayName = null;
let currentIcon = null;

function setCurrentUser(u) {
  currentUser = u;
  if (u) localStorage.setItem('AppBasicCurrentUser', u);
  else localStorage.removeItem('AppBasicCurrentUser');
}

function showMain() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('main-screen').style.display = 'block';
  document.getElementById('welcome-user').textContent = `Hello, ${currentDisplayName}`;
  const iconEl = document.getElementById('user-icon');
  if (currentIcon) {
    iconEl.src = currentIcon;
    iconEl.style.display = 'inline-block';
  } else {
    iconEl.style.display = 'none';
  }
}

document.getElementById('btn-go-signin').addEventListener('click', () => {
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
});

function updateMode() {
  document.getElementById('auth-title').textContent = mode === 'login' ? 'Sign In' : 'Register';
  document.getElementById('btn-submit').textContent = mode === 'login' ? 'Sign In' : 'Register';
  document.getElementById('toggle-text').innerHTML = mode === 'login'
    ? "Don't have an account? <a href='#' id='toggle-link'>Register</a>"
    : "Already have one? <a href='#' id='toggle-link'>Sign In</a>";
  document.getElementById('toggle-link').addEventListener('click', e => {
    e.preventDefault();
    mode = mode === 'login' ? 'register' : 'login';
    updateMode();
    setupSubmit();
  });
}

function setupSubmit() {
  document.getElementById('btn-submit').onclick = () => {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (!u || !p) return;
    if (mode === 'register') {
      if (register(u,p)) {
        mode = 'login';
        updateMode();
      }
    } else {
      if (login(u,p)) {
        authenticated = true;
        setCurrentUser(u);
        const user = getUsers()[u];
        currentDisplayName = user.displayName || u;
        currentIcon = user.icon;
        showMain();
      }
    }
  };
}

updateMode();
setupSubmit();

// edit account helpers
function openEdit() {
  const users = getUsers();
  const user = users[currentUser];
  document.getElementById('edit-name').value = user.displayName || '';
  document.getElementById('edit-msg').textContent = '';
  document.getElementById('edit-modal').style.display = 'flex';
}
function closeEdit() {
  document.getElementById('edit-modal').style.display = 'none';
}

document.getElementById('btn-edit').addEventListener('click', openEdit);
document.getElementById('btn-cancel').addEventListener('click', closeEdit);

document.getElementById('btn-save').addEventListener('click', () => {
  const name = document.getElementById('edit-name').value.trim();
  const file = document.getElementById('edit-icon').files[0];
  if (!currentUser) return;
  const users = getUsers();
  if (name) users[currentUser].displayName = name;
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      users[currentUser].icon = reader.result;
      saveUsers(users);
      currentDisplayName = users[currentUser].displayName;
      currentIcon = users[currentUser].icon;
      showMain();
      closeEdit();
    };
    reader.readAsDataURL(file);
  } else {
    saveUsers(users);
    currentDisplayName = users[currentUser].displayName;
    showMain();
    closeEdit();
  }
});

// logout button handler
// placed above delete for readability
const logoutBtn=document.getElementById('btn-logout');
logoutBtn.addEventListener('click',()=>{
  authenticated=false;
  setCurrentUser(null);
  currentUser=null;
  document.getElementById('main-screen').style.display='none';
  document.getElementById('home-screen').style.display='flex';
});

// delete account button handler
document.getElementById('btn-delete').addEventListener('click', () => {
  if (!currentUser) return;
  const users = getUsers();
  delete users[currentUser];
  saveUsers(users);
  authenticated = false;
  setCurrentUser(null);
  currentUser = null;
  document.getElementById('main-screen').style.display = 'none';
  document.getElementById('home-screen').style.display = 'flex';
});

const boxes = document.querySelectorAll('.box');
boxes.forEach((box, i) => {
  // site1 -> Ranks, site2 -> Snake, site3 -> uploader, site4 -> calculator, site5 -> Safe Search
  if (i === 0) box.textContent = 'Rankings';
  else if (i === 1) box.textContent = 'Snake';
  else if (i === 2) box.textContent = 'Uploader';
  else if (i === 3) box.textContent = 'Calculator';
  else if (i === 4) box.textContent = 'Safe Search';
  else box.textContent = `Site ${i+1}`;
  box.addEventListener('click', () => {
    if (!authenticated) {
      showAuthMsg('please log in first');
      return;
    }
    if (i === 0) {
      window.location.href = 'ranks.html';
      return;
    }
    if (i === 1) {
      window.location.href = 'snake.html';
      return;
    }
    if (i === 2) {
      window.location.href = 'uploader.html';
      return;
    }
    if (i === 3) {
      window.location.href = 'calculator.html';
      return;
    }
    if (i === 4) {
      window.location.href = 'safe.html';
      return;
    }
    const idx = Math.floor(Math.random() * sites.length);
    window.location.href = sites[idx];
  });
});