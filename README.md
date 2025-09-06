# GitMap: Visualize Your GitHub Repository

GitMap is a web application that provides an interactive visualization of the commit history and branch structure of any public GitHub repository. It's built with modern web technologies to offer a fast, intuitive, and insightful look into the evolution of a codebase.

## Features

- **Interactive Git Graph**: A dynamic 2D graph that visualizes commits and branches.
- **Pan and Zoom**: Easily navigate large and complex repository histories with smooth pan and zoom controls.
- **Branch Filtering & Pagination**: Handle repositories with hundreds of branches by filtering by a specific branch or paginating through all of them.
- **Detailed Commit Information**: Click on any commit to see its full message, author details, and date in a slide-out panel.
- **AI-Powered Summaries**: Generate a concise, human-readable summary of a commit's changes using generative AI.
- **Repository History**: A convenient sidebar keeps a history of the repositories you've viewed for quick access.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You'll need [Node.js](https://nodejs.org/) (version 20 or later) and npm installed on your computer.

### Installation

1.  Clone the repository to your local machine.
2.  Navigate to the project directory and install the dependencies:

    ```bash
    npm install
    ```

### Running the Development Server

Once the dependencies are installed, you can start the Next.js development server:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

### Using AI Features

The AI-powered commit summary feature uses Google's Gemini model via Genkit. To enable this feature, you will need an API key.

1.  Create a `.env` file in the root of the project.
2.  Obtain an API key for the Gemini API from [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  Add the key to your `.env` file:

    ```
    GEMINI_API_KEY=your_api_key_here
    ```

4.  To monitor your Genkit flows, you can start the Genkit developer UI in a separate terminal:

    ```bash
    npm run genkit:dev
    ```

    This will launch a local server, typically at [http://localhost:4000](http://localhost:4000), where you can inspect flow traces.
