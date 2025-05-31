import {
    LOCAL_STORAGE_PROJECTS_KEY,
    generateUUID,
    getProjectsFromLocalStorage,
    saveProjectsToLocalStorage,
    setShowGlobalMessageBoxDependency
} from './projectManagerCore.js';

import * as ui from './uiManager.js';

let sceneFunctions = {};
let mainSystemFunctions = {};
let projectToDeleteId = null;

export function initializeProjectManagerDependencies(sf, mainUtils) {
    sceneFunctions = sf;
    mainSystemFunctions = mainUtils;
    if (mainSystemFunctions.showGlobalMessageBox) {
        setShowGlobalMessageBoxDependency(mainSystemFunctions.showGlobalMessageBox);
    }
    console.log("ProjectManager initialized with sceneFunctions and mainSystemFunctions dependencies.");
}

export { LOCAL_STORAGE_PROJECTS_KEY, generateUUID, getProjectsFromLocalStorage, saveProjectsToLocalStorage };

export function loadProjects(currentProjectState) { /* ... (as before) ... */ }
export function confirmProjectDeletion(projectId, projectName) { /* ... (as before) ... */ }
export function getProjectToDeleteIdPM() { return projectToDeleteId; }
export function clearProjectToDeleteIdPM() { projectToDeleteId = null; }
export function openProject(projectId, projectName, projectStateInOut, sf, mainSysFuncs) { /* ... (as before) ... */ }
export function switchToProjectManager(projectStateInOut, sf, mainSysFuncs) { /* ... (as before) ... */ }

export function saveCurrentProject(currentProjectState) {
    if (!currentProjectState || !currentProjectState.id) {
        if (ui && ui.showEditorMessageBox) ui.showEditorMessageBox("No active project to save.", "error");
        else console.error("ProjectManager: Cannot save, no active project state ID.");
        return;
    }
    if (!sceneFunctions || !sceneFunctions.getCurrentSceneState) {
        if (ui && ui.showEditorMessageBox) ui.showEditorMessageBox("Error: Scene functions not available to save project.", "error");
        else console.error("ProjectManager: Cannot save, sceneFunctions not available.");
        return;
    }

    console.log(`ProjectManager: Saving project ${currentProjectState.name} (ID: ${currentProjectState.id})`);
    try {
        const projects = getProjectsFromLocalStorage();
        const projectIndex = projects.findIndex(p => p.id === currentProjectState.id);

        if (projectIndex > -1) {
            const currentSceneDataString = sceneFunctions.getCurrentSceneState();
            projects[projectIndex].sceneData = currentSceneDataString;
            projects[projectIndex].lastModified = new Date().toISOString();
            saveProjectsToLocalStorage(projects);
            if (ui && ui.showEditorMessageBox) ui.showEditorMessageBox(`Project "${currentProjectState.name}" saved!`, "success");

            // Also ensure this state is saved in history
            // The sceneChangeCallback in main.js connected to historyManager.saveState
            // should ideally be triggered by any action that modifies the scene.
            // If getCurrentSceneState() itself doesn't trigger it, we might need an explicit history save.
            // However, if the action that led to saving (e.g. user pressing Ctrl+S)
            // happened AFTER a scene change that ALREADY saved to history, this might be redundant
            // or create an identical history state. HistoryManager's saveState has a check for identical states.
            if (sceneFunctions.saveCurrentSceneToHistory) { // If sceneManager has a dedicated func for this
                sceneFunctions.saveCurrentSceneToHistory();
            } else if (mainSystemFunctions.triggerSceneChangeForHistory) { // Or main provides a generic trigger
                 mainSystemFunctions.triggerSceneChangeForHistory();
            }

            console.log(`ProjectManager: Project ${currentProjectState.name} saved successfully.`);
        } else {
            if (ui && ui.showEditorMessageBox) ui.showEditorMessageBox("Error: Could not find current project in storage to save.", "error");
            else console.error("ProjectManager: Project ID not found in localStorage for saving:", currentProjectState.id);
        }
    } catch (error) {
        console.error("ProjectManager: Error during saveCurrentProject:", error);
        if (ui && ui.showEditorMessageBox) ui.showEditorMessageBox("An error occurred while saving the project.", "error");
    }
}


console.log("projectManager.js updated with saveCurrentProject function.");
