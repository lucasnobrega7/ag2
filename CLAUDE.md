# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an OpenAI website clone adapted for "Agentes de Conversão" brand. It features a premium design with dark theme aesthetics inspired by OpenAI, using the same Söhne font family and meticulous attention to matching OpenAI's visual style.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# CSS Processing
npm run css                # Generate CSS from Tailwind
npm run css:watch          # Watch mode for CSS changes

# Font Operations
npm run fonts:check        # Check if required font files exist
npm run fonts:convert      # Convert OTF fonts to WOFF2
```

## Deployment Commands

```bash
# Quick Railway deployment (recommended)
npm run deploy

# Initial Railway setup and deployment (interactive)
npm run setup

# Railway deployment with UX/UI checks
npm run deploy:railway
```

## UX/UI Review Commands

```bash
# Format code with Prettier
npm run format

# Check accessibility (a11y)
npm run check:a11y

# Check responsiveness across devices
npm run check:responsive

# Run Lighthouse performance audit
npm run check:lighthouse

# Run all checks
npm run check:all

# Pre-deployment checks
npm run pre-deploy
```

## Project Architecture

### Core Technologies

- **Next.js**: Uses App Router architecture (not Pages Router)
- **React**: Modern React with functional components and hooks
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Styling with utility classes
- **Framer Motion**: Animations for UI elements

### Key Components Structure

- **app/**: Next.js App Router structure with main layout and page components
- **components/**: React components for UI elements
  - `Hero.tsx`: Main landing section with typing animation
  - `Features.tsx`: Product features display
  - `CTA.tsx`: Call-to-action section
  - `Navbar.tsx`: Navigation bar
  - `Footer.tsx`: Page footer
- **styles/**: CSS styling
  - `globals.css`: Global styles, including Söhne font configuration
  - `output.css`: Processed Tailwind CSS (auto-generated)

### Font System

The project uses Söhne fonts (same as OpenAI) which require conversion from OTF to WOFF2 format before deployment:

1. Original fonts must be in `/public/fonts/original/` directory
2. Converted fonts are stored in `/public/fonts/` directory
3. Conversion is handled by the `convert-fonts.js` script
4. Font files must be present for proper website appearance

## Important Notes

1. **Font Processing**: Always run `npm run fonts:check` and `npm run fonts:convert` before deployment.

2. **CSS Processing**: Run `npm run css` before building to ensure Tailwind processes all styles.

3. **Railway Deployment**: The project is configured for Railway deployment with Docker support.

4. **Strict App Router**: The codebase exclusively uses Next.js App Router, not Pages Router.

5. **Styling Approach**: CSS variables are used throughout the project to match OpenAI's color scheme exactly.

6. **Animation Details**: The Hero component has a typing effect that cycles through examples.

7. **UX/UI Review**: Before deployment, run the simplified UX/UI check suite with `npm run deploy:railway` to ensure all pre-deployment checks are performed.

8. **Performance Standards**: The site aims for high performance scores (>90 in Lighthouse metrics) and responsive design across all device sizes.

9. **Accessibility**: The project aims for WCAG 2.1 AA compliance, with checks for common accessibility issues like alt text, contrast, and semantic HTML.