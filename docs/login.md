---
layout: page
title: Sign In
---

<script setup>
import { ref, onMounted } from 'vue'

const email = ref('')
const name = ref('')
const loggedIn = ref(false)
const currentUser = ref(null)

onMounted(() => {
  const saved = localStorage.getItem('beppe-docs-user')
  if (saved) {
    currentUser.value = JSON.parse(saved)
    loggedIn.value = true
  }
})

function handleLogin() {
  if (!email.value || !name.value) return

  const user = {
    id: 'user-' + btoa(email.value).slice(0, 12),
    email: email.value,
    name: name.value,
  }

  localStorage.setItem('beppe-docs-user', JSON.stringify(user))
  currentUser.value = user
  loggedIn.value = true

  // Attach identity to ClickStack — separate from sessionID
  import('@hyperdx/browser').then((HyperDX) => {
    HyperDX.default.setGlobalAttributes({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
    })
    // Fire a custom event for the login action
    HyperDX.default.addAction('User-Login', {
      method: 'docs-login-form',
      userEmail: user.email,
    })
  })
}

function handleLogout() {
  localStorage.removeItem('beppe-docs-user')
  currentUser.value = null
  loggedIn.value = false
  email.value = ''
  name.value = ''

  import('@hyperdx/browser').then((HyperDX) => {
    HyperDX.default.setGlobalAttributes({
      userId: '',
      userEmail: '',
      userName: '',
    })
    HyperDX.default.addAction('User-Logout', {})
  })
}
</script>

# Sign In

<div v-if="!loggedIn" class="login-container">
  <p class="login-subtitle">Sign in to personalize your docs experience. Your identity is tracked <strong>separately from your session</strong> — demonstrating how ClickStack links user identity to anonymous session telemetry.</p>

  <div class="login-form">
    <div class="form-group">
      <label for="name">Name</label>
      <input id="name" v-model="name" type="text" placeholder="Joe Lanzone" class="login-input" />
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" placeholder="joe@servicelink.com" class="login-input" />
    </div>
    <button @click="handleLogin" class="login-button">Sign In</button>
  </div>

  <div class="info-box">
    <strong>What happens behind the scenes:</strong>
    <ol>
      <li>ClickStack generates a <code>sessionId</code> automatically on first page load (anonymous)</li>
      <li>When you sign in, <code>setGlobalAttributes({ userId, userEmail })</code> attaches your identity</li>
      <li>All subsequent events (page views, clicks, network requests) carry <strong>both</strong> sessionId and userId</li>
      <li>In the SQL console, you can <code>JOIN</code> sessions to users, or query each independently</li>
    </ol>
  </div>
</div>

<div v-else class="login-container">
  <div class="welcome-box">
    <h2>Welcome, {{ currentUser.name }}</h2>
    <p><strong>User ID:</strong> <code>{{ currentUser.id }}</code></p>
    <p><strong>Email:</strong> <code>{{ currentUser.email }}</code></p>
    <p class="session-note">Your session telemetry is now linked to this identity. Browse the docs — every page view, scroll, and click is captured with your userId attached.</p>
    <button @click="handleLogout" class="logout-button">Sign Out</button>
  </div>

  <div class="info-box">
    <strong>Try these for interesting telemetry:</strong>
    <ul>
      <li>Visit the <a href="/beppe-dotfiles-docs/ARCHITECTURE">Architecture</a> page</li>
      <li>Search for something in the search bar</li>
      <li>Open your browser console and type <code>console.log('test from console')</code></li>
      <li>Then check ClickStack — you'll see all of this in session replay + logs</li>
    </ul>
  </div>
</div>

<style>
.login-container {
  max-width: 480px;
  margin: 2rem auto;
}
.login-subtitle {
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}
.login-form {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
}
.login-input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 1rem;
}
.login-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}
.login-button {
  width: 100%;
  padding: 0.7rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}
.login-button:hover {
  background: var(--vp-c-brand-2);
}
.logout-button {
  padding: 0.5rem 1.2rem;
  background: var(--vp-c-danger-1, #e53e3e);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;
}
.welcome-box {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.welcome-box h2 {
  margin-top: 0;
  border-top: none;
}
.session-note {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
}
.info-box {
  background: var(--vp-c-default-soft);
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  font-size: 0.9rem;
  line-height: 1.6;
}
.info-box ol, .info-box ul {
  padding-left: 1.2rem;
  margin: 0.5rem 0 0 0;
}
</style>
