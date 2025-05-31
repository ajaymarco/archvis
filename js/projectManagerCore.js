// --- Project Management Core Logic ---
// Contains base functionalities for project data management without direct UI or editor dependencies.

import { generateUUID } from './utils.js'; // Import from utils.js

export const LOCAL_STORAGE_PROJECTS_KEY = 'archVizProProjects_v3';

// generateUUID() is now imported from utils.js

let showGlobalMessageBoxDependency = (message, type, duration) => {
    console.warn("showGlobalMessageBoxDependency not set in projectManagerCore:", message, type, duration);
};

export function setShowGlobalMessageBoxDependency(fn) {
    showGlobalMessageBoxDependency = fn;
}


export function getProjectsFromLocalStorage() {
    const projectsJSON = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    try {
        return projectsJSON ? JSON.parse(projectsJSON) : [];
    } catch (e) {
        console.error("Error parsing projects from localStorage:", e);
        showGlobalMessageBoxDependency("Error loading projects. Data might be corrupted.", "error", 5000);
        localStorage.removeItem(LOCAL_STORAGE_PROJECTS_KEY);
        return [];
    }
}

export function saveProjectsToLocalStorage(projects) {
    try {
        localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch (e) {
        console.error("Error saving projects to localStorage:", e);
        showGlobalMessageBoxDependency("Could not save projects. Storage might be full or unavailable.", "error", 5000);
    }
}

console.log("projectManagerCore.js loaded, uses generateUUID from utils.js.");
