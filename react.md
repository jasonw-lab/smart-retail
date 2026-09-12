# React Application Architecture Guide & AI Instructions

You are an expert React developer. When generating, modifying, or refactoring code in this project, you MUST strictly adhere to the following architectural rules and design principles.

## 1. Project Structure (Feature-Based Architecture)
We organize code by domain features rather than by technical roles [3, 4].

*   **Required**: Place all new feature code inside `src/features/<feature-name>/`. Each feature folder should contain its own `components/`, `api/`, `hooks/`, `types/`, and `stores/` [4, 5]. Use `src/components/` and `src/lib/` ONLY for globally shared utilities [6].
*   **Forbidden**: Do NOT organize files flatly by type (e.g., do not put all API calls in a global `src/api/` folder) [3]. Do NOT import internal files from one feature directly into another feature to prevent circular dependencies [7, 8].
*   **Why**: Feature-based routing ensures high cohesion, reduces merge conflicts, and scales better as the application grows [3, 9].

## 2. Data Fetching & API Calls
API interactions must be strictly separated from UI components [1, 2].

*   **Required**: Abstract all API calls into dedicated files inside `src/features/<feature-name>/api/`. Use **TanStack Query (React Query)** to manage server state, caching, and loading/error states [10-12].
*   **Forbidden**: NEVER call `fetch()` or `axios` directly inside components or generic hooks [2]. NEVER use the `useEffect` + `useState` pattern for fetching server data [13, 14].
*   **Why**: Separating data fetching from the UI makes components easier to test, and TanStack Query correctly handles caching, invalidation, and race conditions that manual `useEffect` approaches miss [10, 15].

## 3. State Management (Multi-tier Strategy)
We use a multi-tier approach to state management. Treat all state as immutable and apply the right tool for the job [11, 16, 17].

*   **Required**: Follow this exact tooling for state [11]:
    *   **Local UI State**: Use `useState` or `useReducer` and keep it as close to the component as possible (Colocation) [9, 18].
    *   **Global Application State**: Use **Zustand** (do not use React Context for frequently changing data) [11, 19].
    *   **Server State**: Use **TanStack Query** [11, 15].
    *   **Form State & Validation**: Use **React Hook Form** with **Zod** [11, 20].
    *   **URL State** (Search, Filters, Pagination): Use **Nuqs** [11, 21].
*   **Forbidden**: Do NOT put all state into a single global store. Do NOT use global state managers (like Zustand) to manage server data [10, 22].
*   **Why**: Specialized tools solve specific problems efficiently. Globalizing everything makes data flow untrackable, while localizing state prevents unnecessary re-renders [10, 23].

## 4. Component Design
Build small, focused, and pure components [24, 25].

*   **Required**: Write components as pure functions (Same inputs = Same output). Extract complex logic into custom hooks. Use Composition (passing JSX as `children`) to avoid prop drilling [25-27].
*   **Forbidden**: Do NOT create "God components" that handle UI, state, API calls, and business logic all in one place. Do NOT mutate existing state objects directly [24, 28, 29].
*   **Why**: Small components are easier to reason about, test, and fit neatly within your AI context window. Pure components prevent confusing rendering bugs [25, 28].

## 5. Styling
*   **Required**: Use **Tailwind CSS** for utility-first styling. Use **Base UI** (or Shadcn UI) for accessible component primitives [11, 30].
*   **Forbidden**: Do NOT use inline styles (`style={{...}}`) for complex layouts [31].
*   **Why**: Tailwind ensures design token consistency and small CSS bundle sizes, while accessible component libraries handle complex ARIA attributes and keyboard navigation [11, 30].

## AI Output Guidelines
1.  Always use TypeScript with strict typing. Avoid `any` [32].
2.  Format output code beautifully and concisely. Omit unnecessary imports or boilerplate unless requested.
3.  If a user's request violates these architectural rules, kindly inform them of the correct pattern defined in this document before providing the code.
