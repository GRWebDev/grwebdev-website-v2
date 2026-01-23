# GrWebDev Website

## 🚀 Project Structure

This project is using [Astro](https:/astro.build)

Inside this project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── images referenced in the code
│   ├── components
│   │   └── reusable components
│   ├── content
│   │   └── Board
│   │   │   └── One file per board member 
│   │   └── Presentations
│   │   │   └── One file per presentation 
│   │   └── Sponsors
│   │   │   └── One file per sponsor  
│   ├── layouts
│   │   └── Layout.astro -- Items that are on ever page go here
│   └── pages
│   └── content.config.ts -- This file configures the types for the content and helps with IDE typeahead
│       └── index.astro
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                                    |
|:--------------------------|:----------------------------------------------------------|
| `npm install`             | Installs dependencies                                     |
| `npm run dev`             | Starts local dev server at `localhost:4321`               |
| `npm run build`           | Build your production site to `./dist/`                   |
| `npm run preview`         | Preview your build locally, before deploying              |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check`          |
| `npm run astro -- --help` | Get help using the Astro CLI                              |
| `npm run lint`            | List out linting issues                                   |
| `npm run lint:fix`        | Correct automatically fixable lint issues and list others |
