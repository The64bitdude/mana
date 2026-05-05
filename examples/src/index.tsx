import React from "react";
import {createRoot} from "react-dom/client";
import {UseCaseTest} from "./Examples";


// 1. Create a container element (or use one existing in your index.html)
const container = document.getElementById('root') || document.body.appendChild(document.createElement('div'));
container.id = 'root';

// 2. Initialize the root
const root = createRoot(container);

// 3. Render your example component
root.render(
    <React.StrictMode>
        <UseCaseTest/>
    </React.StrictMode>
);