# Document Scanner App

A React-based document scanner application that allows users to upload images or PDFs, automatically detect document boundaries, apply perspective correction, and store the processed documents in Firebase.

## Features

- User authentication with email and password
- Upload images (PNG/JPEG) or PDFs (first page extraction)
- Automatic document detection and perspective correction
- Side-by-side before/after comparison view
- Personal gallery of uploaded documents
- Firebase integration for storage and database

## Tech Stack

- **Frontend**: React.js with TypeScript, Material UI
- **Backend/Services**: Firebase (Auth, Firestore, Storage, Hosting)
- **Libraries**: react-dropzone, pdf-lib, opencv.js, react-firebase-hooks

## Setup and Installation

1. Clone the repository

```bash
git clone <repository-url>
cd scanner-app
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm start
```

4. Build for production

```bash
npm run build
```

5. Deploy to Firebase

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

## Firebase Configuration

The app uses Firebase for authentication, storage, and database. The configuration is stored in `src/firebase.ts`.

## Project Structure

- `src/components/Auth`: Authentication components
- `src/components/Dashboard`: Main dashboard interface
- `src/components/Upload`: File upload and processing
- `src/components/ImageProcessor`: Document detection and correction
- `src/components/Gallery`: User's document gallery

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## License

MIT
