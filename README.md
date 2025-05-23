# Playground

A Vite HMR Playground and Grid Layout Playground for experimenting with HMR updates and responsive navigation.

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/srcdev/playground.git
   cd playground
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:md` - Run markdownlint to check and fix markdown files
- `npm run format` - Run Prettier to format all files

## Code Quality Tools

This project uses ESLint, Prettier, and markdownlint for code quality and formatting:

- **ESLint**: Checks JavaScript code for potential errors and enforces coding standards
- **Prettier**: Automatically formats code for consistent style
- **markdownlint**: Ensures markdown documents follow consistent standards

### Auto-formatting

Files will automatically be formatted when saved in VS Code, provided you have the following extensions installed:

- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)

## Project Structure

- `grid-layout-playground.html` - Main HTML file with CSS Grid examples
- `responsive-navigation.html` - Responsive navigation bar demo
- `assets/` - Scripts and styles
- `package.json` - Project configuration and dependencies
- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.markdownlint.json` - Markdown linting configuration

## License

MIT
