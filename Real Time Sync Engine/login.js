/**
 * =====================================================
 * SyncEngine — Login Page Logic
 * login.js
 *
 * Features:
 *   1. Demo credential validation (admin/user)
 *   2. LocalStorage-based registered users
 *   3. Remember Me (persists last username)
 *   4. Password strength meter
 *   5. Show/hide password toggle
 *   6. Tab switch (Login / Register)
 *   7. Animated particles background
 *   8. Redirect to index.html on success
 * =====================================================
 */

// =====================================================
// 1. BUILT-IN DEMO USERS
//    (stored in memory — won't persist on refresh)
// =====================================================
const DEMO_USERS = [
  { username: 'admin', password: 'admin123', role: 'Admin',     name: 'Administrator' },
  { username: 'user',  password: 'user123',  role: 'Developer', name: 'Demo User'     },
];

// =====================================================
// 2. LOAD REGISTERED USERS FROM localStorage
// =====================================================
function getRegisteredUsers() {
  const raw = localStorage.getItem('syncengine_users');
  return raw ? JSON.parse(raw) : [];
}

function saveRegisteredUsers(users) {
  localStorage.setItem('syncengine_users', JSON.stringify(users));
}

// =====================================================
// 3. TAB SWITCHING
// =====================================================
function switchTab(tab) {
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin     = document.getElementById('tabLogin');
  const tabRegister  = document.getElementById('tabRegister');

  clearErrors();

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
  }
}

// =====================================================
// 4. LOGIN HANDLER
// =====================================================
function handleLogin(e) {
  e.preventDefault();
  clearErrors();

  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const remember = document.getElementById('rememberMe').checked;
  const btn      = document.getElementById('loginBtn');
  const loader   = document.getElementById('loginLoader');

  // Basic validation
  if (!username) { showError('loginError', '⚠️ Please enter your username.'); return; }
  if (!password) { showError('loginError', '⚠️ Please enter your password.'); return; }

  // Show loading state
  btn.classList.add('loading');
  document.querySelector('#loginBtn .btn-text').textContent = 'Signing in…';
  loader.style.display = 'inline';

  // Simulate network delay (realistic UX)
  setTimeout(() => {
    const allUsers = [...DEMO_USERS, ...getRegisteredUsers()];
    const match    = allUsers.find(
      u => u.username === username && u.password === password
    );

    if (match) {
      // Save session
      const session = {
        username:  match.username,
        name:      match.name || match.username,
        role:      match.role || 'User',
        loginTime: new Date().toISOString()
      };
      sessionStorage.setItem('syncengine_session', JSON.stringify(session));

      // Remember Me
      if (remember) {
        localStorage.setItem('syncengine_remember', username);
      } else {
        localStorage.removeItem('syncengine_remember');
      }

      // Success flash + redirect
      document.querySelector('#loginBtn .btn-text').textContent = '✅ Welcome, ' + session.name + '!';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);

    } else {
      btn.classList.remove('loading');
      document.querySelector('#loginBtn .btn-text').textContent = 'Sign In';
      loader.style.display = 'none';
      showError('loginError', '❌ Invalid username or password. Try: admin / admin123');
      document.getElementById('loginUser').classList.add('error');
      document.getElementById('loginPass').classList.add('error');
    }
  }, 900);
}

// =====================================================
// 5. REGISTER HANDLER
// =====================================================
function handleRegister(e) {
  e.preventDefault();
  clearErrors();

  const fullName = document.getElementById('regFullName').value.trim();
  const username = document.getElementById('regUser').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPass').value;
  const confirm  = document.getElementById('regConfirm').value;
  const role     = document.getElementById('regRole').value;

  // Validations
  if (!fullName)                         return showError('registerError', '⚠️ Full name is required.');
  if (username.length < 3)               return showError('registerError', '⚠️ Username must be at least 3 characters.');
  if (!/^\S+@\S+\.\S+$/.test(email))    return showError('registerError', '⚠️ Please enter a valid email address.');
  if (password.length < 6)              return showError('registerError', '⚠️ Password must be at least 6 characters.');
  if (password !== confirm)             return showError('registerError', '⚠️ Passwords do not match.');

  // Check if username already taken
  const allUsers = [...DEMO_USERS, ...getRegisteredUsers()];
  if (allUsers.find(u => u.username === username)) {
    return showError('registerError', '⚠️ That username is already taken. Choose another.');
  }

  // Save new user
  const newUser = { username, password, name: fullName, email, role };
  const existing = getRegisteredUsers();
  existing.push(newUser);
  saveRegisteredUsers(existing);

  // Show success
  const successBox = document.getElementById('registerSuccess');
  successBox.textContent = `✅ Account created for "${fullName}"! You can now sign in.`;
  successBox.classList.remove('hidden');
  document.getElementById('registerForm').reset();
  resetStrengthMeter();

  // Auto-switch to login tab after 1.5s
  setTimeout(() => {
    switchTab('login');
    document.getElementById('loginUser').value = username;
  }, 1500);
}

// =====================================================
// 6. PASSWORD STRENGTH METER
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  const regPass = document.getElementById('regPass');
  if (regPass) {
    regPass.addEventListener('input', updateStrength);
  }
});

function updateStrength() {
  const val   = document.getElementById('regPass').value;
  const bar   = document.getElementById('strengthBar');
  const label = document.getElementById('strengthLabel');

  let score = 0;
  if (val.length >= 6)              score++;
  if (val.length >= 10)             score++;
  if (/[A-Z]/.test(val))           score++;
  if (/[0-9]/.test(val))           score++;
  if (/[^a-zA-Z0-9]/.test(val))   score++;

  const levels = [
    { pct: '0%',   color: '',                 text: '' },
    { pct: '25%',  color: '#f85149',          text: '🔴 Weak' },
    { pct: '50%',  color: '#d29922',          text: '🟡 Fair' },
    { pct: '75%',  color: '#58a6ff',          text: '🔵 Good' },
    { pct: '90%',  color: '#3fb950',          text: '🟢 Strong' },
    { pct: '100%', color: '#3fb950',          text: '🟢 Very Strong' },
  ];

  const level = levels[Math.min(score, 5)];
  bar.style.width      = level.pct;
  bar.style.background = level.color;
  label.textContent    = level.text;
  label.style.color    = level.color;
}

function resetStrengthMeter() {
  document.getElementById('strengthBar').style.width = '0%';
  document.getElementById('strengthLabel').textContent = '';
}

// =====================================================
// 7. PASSWORD VISIBILITY TOGGLE
// =====================================================
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// =====================================================
// 8. FORGOT PASSWORD (simple alert demo)
// =====================================================
function showForgot() {
  showError('loginError',
    '💡 Demo mode: Use admin / admin123 or register a new account.'
  );
}

// =====================================================
// 9. ERROR / CLEAR HELPERS
// =====================================================
function showError(id, msg) {
  const box = document.getElementById(id);
  box.textContent = msg;
  box.classList.add('show');
}

function clearErrors() {
  document.querySelectorAll('.error-box').forEach(b => {
    b.classList.remove('show');
    b.textContent = '';
  });
  document.querySelectorAll('input').forEach(i => {
    i.classList.remove('error', 'valid');
  });
  const sBox = document.getElementById('registerSuccess');
  if (sBox) sBox.classList.add('hidden');
}

// =====================================================
// 10. REMEMBER ME — prefill username on load
// =====================================================
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('syncengine_remember');
  if (saved) {
    document.getElementById('loginUser').value = saved;
    document.getElementById('rememberMe').checked = true;
  }

  // Generate background particles
  spawnParticles();
});

// =====================================================
// 11. ANIMATED PARTICLES
// =====================================================
function spawnParticles() {
  const container = document.getElementById('particles');
  const count = 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left    = Math.random() * 100 + 'vw';
    p.style.bottom  = '-10px';
    p.style.setProperty('--dur',   (4 + Math.random() * 7) + 's');
    p.style.setProperty('--delay', (Math.random() * 8) + 's');
    p.style.opacity = (0.2 + Math.random() * 0.5).toString();
    // Some particles are larger / different tones
    const size = Math.random() < 0.3 ? '5px' : '3px';
    p.style.width  = size;
    p.style.height = size;
    container.appendChild(p);
  }
}
