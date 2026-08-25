import { useEffect, useState } from 'react'
import './App.css'

const REQUEST_KEY = 'password-reset-requests'
const FORGOT_PASSWORD_ROUTE = '/forgot-password'
const HOME_ROUTE = '/'
const UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE_LETTERS = 'abcdefghijklmnopqrstuvwxyz'
const LETTERS = `${UPPERCASE_LETTERS}${LOWERCASE_LETTERS}`

function getRandomIndex(max) {
  const values = new Uint32Array(1)
  globalThis.crypto.getRandomValues(values)
  return values[0] % max
}

function getRandomLetter(source) {
  return source[getRandomIndex(source.length)]
}

function shuffleCharacters(characters) {
  const shuffled = [...characters]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = getRandomIndex(index + 1)
    const currentCharacter = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = currentCharacter
  }

  return shuffled.join('')
}

function generatePassword(length = 14) {
  const values = new Uint32Array(length)
  globalThis.crypto.getRandomValues(values)
  const characters = Array.from(values, (value) => LETTERS[value % LETTERS.length])

  characters[0] = getRandomLetter(UPPERCASE_LETTERS)
  characters[1] = getRandomLetter(LOWERCASE_LETTERS)

  return shuffleCharacters(characters)
}

function getTodayKey() {
  const date = new Date()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

function readResetRequests() {
  try {
    return JSON.parse(localStorage.getItem(REQUEST_KEY) || '{}')
  } catch {
    return {}
  }
}

function normalizeContact(value) {
  const trimmedValue = value.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (emailPattern.test(trimmedValue)) {
    return `email:${trimmedValue.toLowerCase()}`
  }

  const phoneDigits = trimmedValue.replace(/\D/g, '')

  if (phoneDigits.length >= 7 && /^[+\d\s()-]+$/.test(trimmedValue)) {
    return `phone:${phoneDigits}`
  }

  return ''
}

function SignInPage({ onNavigate }) {
  return (
    <main className="auth-shell">
      <section className="welcome-panel">
        <div className="brand-mark">E</div>
        <p className="eyebrow">Elevence account</p>
        <h1>Welcome back.</h1>
        <p className="welcome-copy">A calmer way to keep your account secure and moving forward.</p>
      </section>
      <section className="signin-panel">
        <div className="panel-content">
          <p className="eyebrow">Sign in</p>
          <h2>Good to see you.</h2>
          <p className="muted">Enter your details to continue to your workspace.</p>
          <form className="signin-form" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="signin-email"> Enter Email address</label>
            <input id="signin-email" type="email" placeholder="you@example.com" />
            <label htmlFor="signin-password"> Enter Password</label>
            <input id="signin-password" type="password" placeholder="Enter your password" />
            <button className="primary-button" type="submit">
              Sign in <span aria-hidden="true">-&gt;</span>
            </button>
          </form>
          <a
            className="text-link"
            href={FORGOT_PASSWORD_ROUTE}
            onClick={(event) => {
              event.preventDefault()
              onNavigate(FORGOT_PASSWORD_ROUTE)
            }}
          >
            Forgot your password?
          </a>
        </div>
      </section>
    </main>
  )
}

function ForgotPasswordPage({ onNavigate }) {
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    const contactKey = normalizeContact(contact)

    if (!contactKey) {
      setError('Enter a valid registered email address or phone number.')
      return
    }

    const requests = readResetRequests()
    const todayKey = getTodayKey()

    if (requests[contactKey] === todayKey) {
      setError('You can use this option only one time per day.')
      return
    }

    requests[contactKey] = todayKey
    localStorage.setItem(REQUEST_KEY, JSON.stringify(requests))
    setPassword(generatePassword())
    setSubmitted(true)
    setError('')
  }

  return (
    <main className="reset-shell">
      <a
        className="back-link"
        href={HOME_ROUTE}
        onClick={(event) => {
          event.preventDefault()
          onNavigate(HOME_ROUTE)
        }}
      >
        &lt;- Back to sign in
      </a>
      <section className="reset-card" aria-labelledby="reset-title">
        <div className="brand-mark">N</div>
        <p className="eyebrow">Account recovery</p>
        <h1 id="reset-title">Reset your password</h1>
        {!submitted ? (
          <>
            <p className="muted intro">Use the email address or phone number registered to your account. We will create a new password for you.</p>
            <form className="reset-form" onSubmit={handleSubmit}>
              <label htmlFor="contact">Email or phone number</label>
              <input
                id="contact"
                value={contact}
                onChange={(event) => {
                  setContact(event.target.value)
                  setError('')
                }}
                placeholder="you@example.com or +1 555..."
                autoComplete="username"
              />
              {error && <p className="form-message error" role="alert">{error}</p>}
              <button className="primary-button" type="submit">
                Generate new password <span aria-hidden="true">-&gt;</span>
              </button>
            </form>
            <p className="fine-print">For your security policies, password recovery can be requested only  once per day.</p>
          </>
        ) : (
          <div className="success-state" role="status">
            <div className="success-icon" aria-hidden="true">OK</div>
            <h2>Your new password is ready</h2>
            <p className="muted">Use this password to sign in, then update it from your account settings.</p>
            <div className="password-output">
              <span>{password}</span>
              <button
                type="button"
                className="copy-button"
                title="Copy password"
                aria-label="Copy password"
                onClick={() => navigator.clipboard?.writeText(password)}
              >
                Copy
              </button>
            </div>
            <p className="fine-print">Password uses letters only and is available to copy now.</p>
          </div>
        )}
      </section>
      <p className="security-note">Your information stays private and protected.</p>
    </main>
  )
}

function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname)

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextPath) => {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  if (path === FORGOT_PASSWORD_ROUTE) {
    return <ForgotPasswordPage onNavigate={navigate} />
  }

  return <SignInPage onNavigate={navigate} />
}

export default App
