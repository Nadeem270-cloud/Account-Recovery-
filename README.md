# ELEVENCE Account Recovery

ELEVENCE Account Recovery is a React + Vite authentication screen with a dedicated forgot-password flow. The app lets users request a generated reset password using either their registered email address or phone number.

## Features

- Sign-in page with a link to password recovery.
- Dedicated `/forgot-password` route.
- Email or phone number input for account recovery.
- One forgot-password request per day for each normalized email or phone number.
- Warning message for repeat same-day requests: `You can use this option only one time per day.`
- Random password generator that creates letter-only passwords.
- Generated passwords contain uppercase and lowercase letters only, with no numbers or special characters.
- Copy button for the generated password.

## Screenshots

| Screen | Route | Preview |
| --- | --- | --- |
| Sign in | `/` | ![Sign-in page](SCREENSHOTS/Screenshot%20(38).png) |
| Forgot password form | `/forgot-password` | ![Forgot password form](SCREENSHOTS/Screenshot%20(39).png) |
| Generated password | `/forgot-password` | ![Generated password](SCREENSHOTS/Screenshot%20(40).png) |

## Password Reset Rules

The reset request history is stored in `localStorage` under the `password-reset-requests` key. Each contact value is normalized before it is saved:

- Email addresses are lowercased and stored with an `email:` prefix.
- Phone numbers are reduced to digits and stored with a `phone:` prefix.
- Requests are compared against the current local date in `YYYY-MM-DD` format.

## Password Generator

The password generator uses the browser `crypto.getRandomValues()` API and the following character set:

```txt
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
```

The generated password is 14 characters long and always includes at least one uppercase letter and one lowercase letter.

## Routes

| Route | Description |
| --- | --- |
| `/` | Sign-in screen |
| `/forgot-password` | Password recovery screen |

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```
