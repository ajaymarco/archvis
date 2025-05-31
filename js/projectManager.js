import {
    LOCAL_STORAGE_PROJECTS_KEY,
    // generateUUID, // No longer directly from core, core uses utils' one
    getProjectsFromLocalStorage,
    saveProjectsToLocalStorage,
    setShowGlobalMessageBoxDependency
} from './projectManagerCore.js';
import { generateUUID } from './utils.js'; // Import generateUUID directly for use in this module
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

// Re-export functions from Core that might be used by main.js still (though ideally main.js uses PM functions)
export { LOCAL_STORAGE_PROJECTS_KEY, getProjectsFromLocalStorage, saveProjectsToLocalStorage };


export function handleCreateNewProject(projectName) {
    if (!projectName) {
        console.error("ProjectManager: Project name cannot be empty for handleCreateNewProject.");
        return null; // Or throw error
    }
    if (!sceneFunctions || !sceneFunctions.getInitialSceneState) {
        console.error("ProjectManager: sceneFunctions.getInitialSceneState is not available.");
        if(mainSystemFunctions.showGlobalMessageBox) mainSystemFunctions.showGlobalMessageBox("Error: Cannot get initial scene state to create project.", "error");
        return null;
    }

    try {
        const newId = generateUUID(); // Using imported generateUUID from utils.js
        const initialSceneStateString = JSON.stringify(sceneFunctions.getInitialSceneState());

        const newProjectObject = {
            id: newId,
            projectName: projectName,
            sceneData: initialSceneStateString,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        const projects = getProjectsFromLocalStorage();
        projects.push(newProjectObject);
        saveProjectsToLocalStorage(projects);

        console.log(`ProjectManager: New project created - Name: ${projectName}, ID: ${newId}`);
        return { id: newId, projectName: projectName, sceneData: initialSceneStateString }; // Return essential data
    } catch (error) {
        console.error("ProjectManager: Error in handleCreateNewProject:", error);
        if(mainSystemFunctions.showGlobalMessageBox) mainSystemFunctions.showGlobalMessageBox("An error occurred while creating the new project.", "error");
        return null;
    }
}


export function loadProjects(currentProjectState) {
    ui.showProjectManagerLoading(true);
    const projects = getProjectsFromLocalStorage();
    projects.sort((a, b) => (new Date(b.lastModified || 0).getTime()) - (new Date(a.lastModified || 0).getTime()));
    ui.clearProjectList();
    if (projects.length === 0) {
        ui.showNoProjectsMessage(true);
    } else {
        ui.showNoProjectsMessage(false);
        const openProjectCb = (projectId, projectName) => {
            // Pass currentProjectState by reference for openProject to modify
            openProject(projectId, projectName, currentProjectState, sceneFunctions, mainSystemFunctions);
        };
        const confirmDeleteCb = (projectId, projectName) => {
            confirmProjectDeletion(projectId, projectName);
        };
        ui.displayProjectList(projects, openProjectCb, confirmDeleteCb);
    }
    ui.showProjectManagerLoading(false);
}

export function confirmProjectDeletion(projectId, projectName) {
    projectToDeleteId = projectId;
    ui.openConfirmDeleteModal(projectName);
}

export function getProjectToDeleteIdPM() { return projectToDeleteId; }
export function clearProjectToDeleteIdPM() { projectToDeleteId = null; }

export function openProject(projectId, projectName, projectStateInOut, sf, mainSysFuncs) {
    console.log("ProjectManager: Opening project:", projectName, "ID:", projectId);

    projectStateInOut.id = projectId;
    projectStateInOut.name = projectName;

    ui.updateProjectNameDisplay(projectStateInOut.name);
    if (mainSysFuncs.showGlobalMessageBox) mainSysFuncs.showGlobalMessageBox(`Opening project "${projectStateInOut.name}"...`, "info", 1500);

    ui.setProjectManagerViewVisibility(false);
    ui.setEditorViewVisibility(true);

    const projects = getProjectsFromLocalStorage();
    const projectData = projects.find(p => p.id === projectStateInOut.id);

    if (projectData) {
        let sceneJSON = projectData.sceneData;
        try {
            // Validate sceneJSON (basic check)
            if (!sceneJSON || typeof sceneJSON !== 'string' || !JSON.parse(sceneJSON)) {
                 console.warn("Invalid sceneData in localStorage for project:", projectStateInOut.name, ". Resetting to initial state.");
                 sceneJSON = JSON.stringify(sf.getInitialSceneState());
                 const projectIndex = projects.findIndex(p => p.id === projectStateInOut.id);
                 if (projectIndex > -1) { projects[projectIndex].sceneData = sceneJSON; saveProjectsToLocalStorage(projects); }
            }
        } catch (e) {
            console.warn("Error parsing sceneData for project:", projectStateInOut.name, ". Resetting to initial state.", e);
            sceneJSON = JSON.stringify(sf.getInitialSceneState());
            const projectIndex = projects.findIndex(p => p.id === projectStateInOut.id);
            if (projectIndex > -1) { projects[projectIndex].sceneData = sceneJSON; saveProjectsToLocalStorage(projects); }
        }

        let editorReady = sf.isEditorInitialized();
        if (!editorReady) {
             console.warn("ProjectManager.openProject: Scene/Editor is not initialized. This should ideally be handled before calling openProject.");
             // Attempting to initialize here is risky as initSceneManager needs more context (canvas, other managers)
             // Main.js should ensure sceneManager is ready.
        }

        if (editorReady) {
            if(sf.applySceneState) sf.applySceneState(sceneJSON, false); // false: not from history
            if(sf.clearHistoryAndSaveInitialState) { // Ensure this function is passed correctly
                sf.clearHistoryAndSaveInitialState(sceneJSON); // Use the loaded sceneJSON as the initial state
            } else {
                console.warn("ProjectManager: clearHistoryAndSaveInitialState function not found in sceneFunctions.");
                // Fallback: try to save to history, though this might not clear previous project's history
                if (sf.saveCurrentSceneToHistory) sf.saveCurrentSceneToHistory();
            }
            if(mainSysFuncs.switchEditorTab) {
                mainSysFuncs.switchEditorTab('create-panel', 'left');
                mainSysFuncs.switchEditorTab('selection-props-panel', 'right');
            }
            if(sf.setTransformMode) sf.setTransformMode('translate');
            console.log("ProjectManager: Project", projectStateInOut.name, "opened.");
        } else {
            if(mainSysFuncs.showGlobalMessageBox) mainSysFuncs.showGlobalMessageBox(`Critical Error: Editor could not be initialized for ${projectStateInOut.name}.`, "error", 4000);
            switchToProjectManager(projectStateInOut, sf, mainSysFuncs);
        }
    } else {
        if(mainSysFuncs.showGlobalMessageBox) mainSysFuncs.showGlobalMessageBox(`Error: Project data not found for ${projectStateInOut.name}.`, "error", 4000);
        switchToProjectManager(projectStateInOut, sf, mainSysFuncs);
    }
}

export function switchToProjectManager(projectStateInOut, sf, mainSysFuncs) {
    if(sf.cancelActiveToolModes) sf.cancelActiveToolModes();
    ui.setEditorViewVisibility(false);
    ui.setProjectManagerViewVisibility(true);
    projectStateInOut.id = null;
    projectStateInOut.name = "Untitled Project";
    ui.updateProjectNameDisplay("No Project");
    loadProjects(projectStateInOut);
    if(sf.clearHistoryAndSaveInitialState && sf.getInitialSceneState) { // Ensure both are available
        sf.clearHistoryAndSaveInitialState(JSON.stringify(sf.getInitialSceneState()));
    }
}

export function saveCurrentProject(currentProjectState) {
    // ... (implementation from previous step, ensure generateUUID is not called here) ...
    if (!currentProjectState || !currentProjectState.id) { /* ... error ... */ return; }
    if (!sceneFunctions || !sceneFunctions.getCurrentSceneState) { /* ... error ... */ return; }
    try {
        const projects = getProjectsFromLocalStorage();
        const projectIndex = projects.findIndex(p => p.id === currentProjectState.id);
        if (projectIndex > -1) {
            const currentSceneDataString = sceneFunctions.getCurrentSceneState();
            projects[projectIndex].sceneData = currentSceneDataString;
            projects[projectIndex].lastModified = new Date().toISOString();
            saveProjectsToLocalStorage(projects);
            if (ui && ui.showEditorMessageBox) ui.showEditorMessageBox(`Project "${currentProjectState.name}" saved!`, "success");
            if (sceneFunctions.saveCurrentSceneToHistory) { sceneFunctions.saveCurrentSceneToHistory(); } // Save to history as well
        } else { /* ... error ... */ }
    } catch (error) { /* ... error ... */ }
}

console.log("projectManager.js updated with handleCreateNewProject.");
