# Demo App

This directory contains the Vite + React + Tailwind app used to preview generated components and to render benchmark outputs.

## Run Locally

```bash
cd test
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

## Benchmark Rendering

The root benchmark scripts temporarily mount components from `benchmarks/results/<slug>/` through this app:

```bash
cd ..
npm run benchmark:diff -- ditto-battery-pro
```

Generated benchmark screenshots and reports are written under `benchmarks/results/<slug>/`.

## Manual Preview

To preview a generated component by hand, place it under `test/src/components/` and import it from `test/src/App.tsx`.
