// SCRIPT START
import * as projectManager from './projectManager.js';
import * as ui from './uiManager.js';
import { generateUUID } from './utils.js';
import * as projectManagerCore from './projectManagerCore.js';
import * as sceneManager from './sceneManager.js';
import * as historyManager from './historyManager.js';
import * as toolManager from './toolManager.js';
import * as eventManager from './eventManager.js';

// --- Main IIFE ---
(function() {
    'use strict';
    console.log("ArchViz Pro Studio: Main script execution started, final cleanup phase.");

    window.onerror = function(message, source, lineno, colno, error) {
        console.error("Global error caught:", message, "at", source, lineno, colno, error);
        const displayMessage = `An unexpected error occurred: ${message}.`;
        if (ui && ui.showGlobalMessageBox) { ui.showGlobalMessageBox(displayMessage, 'error', 10000); }
        else { const el = document.getElementById('globalMessageBox'); if(el) el.textContent = displayMessage; }
        return true;
     };

    let currentProjectState = { id: null, name: "Untitled Project" };

    function sceneChangeCallbackForHistory() {
        if (sceneManager && historyManager) {
            historyManager.saveState(sceneManager.getCurrentSceneState());
        }
    }

    const mainAppInterface = {
        saveActiveProject: () => {
            if (projectManager && currentProjectState.id && sceneManager) {
                projectManager.saveCurrentProject(currentProjectState);
            } else {
                if (ui && ui.showEditorMessageBox) ui.showEditorMessageBox("No active project to save or system not ready.", "error");
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        console.log("ArchViz Pro Studio: DOM fully loaded. Initializing all managers and final event listeners...");

        ui.initUIManager();
        const canvas = ui.getCanvasElement();
        if (!canvas) { ui.showGlobalMessageBox("Critical: Canvas not found.", "error", 30000); return; }

        const editorInitialized = sceneManager.initSceneManager(canvas, ui, toolManager, sceneChangeCallbackForHistory, historyManager);
        if(!editorInitialized){ ui.showGlobalMessageBox("Critical: SceneManager failed.", "error", 30000); return; }

        historyManager.initHistoryManager(sceneManager, ui);
        toolManager.initToolManager(sceneManager, ui);

        const sceneFunctionsForPM = {
            isEditorInitialized: sceneManager.isEditorInitialized,
            applySceneState: sceneManager.applySceneState,
            clearHistoryAndSaveInitialState: sceneManager.clearHistoryAndSaveInitialSceneState,
            getInitialSceneState: sceneManager.getInitialSceneState,
            getCurrentSceneState: sceneManager.getCurrentSceneState,
            cancelActiveToolModes: sceneManager.cancelActiveToolModes,
            setTransformMode: sceneManager.setTransformMode,
            handleWindowResize: sceneManager.handleWindowResize,
            saveCurrentSceneToHistory: sceneManager.saveCurrentSceneToHistory
        };
        const mainUtilsForPM = { showGlobalMessageBox: ui.showGlobalMessageBox, switchEditorTab: ui.switchEditorTab, triggerSceneChangeForHistory: sceneChangeCallbackForHistory };

        projectManager.initializeProjectManagerDependencies(sceneFunctionsForPM, mainUtilsForPM, ui.getGlobalElements());
        projectManager.loadProjects(currentProjectState);

        eventManager.initEventManager({ mainAppInterface, sceneManager, uiManager: ui, historyManager, toolManager, projectManager });

        // --- Setup UI Event Listeners that remain in Main.js ---
        const pmControls = ui.getProjectControls();
        // ... (Project modal button listeners as before) ...
        if (pmControls.createNewProjectBtn) pmControls.createNewProjectBtn.addEventListener('click', ui.openNewProjectModal);
        if (pmControls.cancelNewProjectBtn) pmControls.cancelNewProjectBtn.addEventListener('click', ui.closeNewProjectModal);
        if (pmControls.confirmNewProjectBtn) {  /* ... (confirm new project logic as before, using generateUUID from utils) ... */ }
        if (pmControls.cancelDeleteBtn) { pmControls.cancelDeleteBtn.addEventListener('click', () => { ui.closeConfirmDeleteModal(); projectManager.clearProjectToDeleteIdPM(); });}
        if (pmControls.confirmDeleteBtn) { /* ... (confirm delete logic as before) ... */ }


        const sidebarControls = ui.getSidebarControls();
        // ... (sidebar toggle and tab click listeners as before) ...

        const topToolbar = document.getElementById('top-toolbar');
        if (topToolbar) { /* ... (as before, for backToProjectsBtn, etc. Undo/Redo now handled by EventManager) ... */ }

        const createPanel = document.getElementById('create-panel');
        if(createPanel) { /* ... (as before, for tool activation and simple object addition) ... */ }

        const editorModalCtrls = ui.getEditorModalControls();
        if (editorModalCtrls.createBoxConfirmBtnEditor) { /* ... (as before) ... */ }
        if (editorModalCtrls.createBoxCancelBtnEditor) { /* ... (as before) ... */ }

        const viewportToolbar = document.getElementById('viewport-toolbar');
        if(viewportToolbar) { /* ... (as before, calls sceneManager transform/view functions) ... */ }

        // Setup Viewport Overlay Button Listeners
        const viewportOverlayControls = ui.getViewportOverlayControls();
        if (viewportOverlayControls.toggleWireframeBtn) viewportOverlayControls.toggleWireframeBtn.addEventListener('click', () => sceneManager.toggleWireframe());
        if (viewportOverlayControls.toggleGridBtn) viewportOverlayControls.toggleGridBtn.addEventListener('click', () => sceneManager.toggleGrid());
        if (viewportOverlayControls.resetCameraBtn) viewportOverlayControls.resetCameraBtn.addEventListener('click', () => sceneManager.resetCamera());
        if (viewportOverlayControls.toggleStatsBtn) viewportOverlayControls.toggleStatsBtn.addEventListener('click', () => sceneManager.toggleStats());

        ui.updateUndoRedoButtons(historyManager.canUndo(), historyManager.canRedo());
        console.log("ArchViz Pro Studio: Main application fully initialized. Inline viewport overlay handlers removed.");
    });

    // Remove global window functions for viewport controls as they are now handled by event listeners
    // window.toggleWireframeGlobal = undefined; // Or delete window.toggleWireframeGlobal;
    // window.toggleGridGlobal = undefined;
    // window.resetCameraPositionGlobal = undefined;
    // window.toggleStatsGlobal = undefined;
    // Better to just ensure they are not defined/used anymore. The calls in index.html were removed.

    console.log("ArchViz Pro Studio: Main script processed. Globals for viewport overlay removed.");
})();
// SCRIPT END
