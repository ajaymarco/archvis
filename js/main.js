// SCRIPT START
import * as projectManager from './projectManager.js';
import * as ui from './uiManager.js';
import * as sceneManager from './sceneManager.js';
import * as historyManager from './historyManager.js';
import * as toolManager from './toolManager.js';
import * as eventManager from './eventManager.js';
// Removed direct import of projectManagerCore and utils/generateUUID

// --- Main IIFE ---
(function() {
    'use strict';
    console.log("ArchViz Pro Studio: Main script execution, final toolManager THREE dependency wiring.");

    window.onerror = function(message, source, lineno, colno, error) {
        console.error("Global error caught:", message, "at", source, lineno, colno, error);
        const displayMessage = `An unexpected error occurred: ${message}.`;
        if (ui && ui.showGlobalMessageBox) { ui.showGlobalMessageBox(displayMessage, 'error', 10000); }
        else { const el = document.getElementById('globalMessageBox'); if(el) el.textContent = displayMessage; }
        return true;
     };

    let currentProjectState = { id: null, name: "Untitled Project" };

    function sceneChangeCallbackForHistory() {
        if (sceneManager && historyManager && sceneManager.isEditorInitialized()) {
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
        console.log("ArchViz Pro Studio: DOM fully loaded. Initializing all managers.");

        ui.initUIManager();
        const canvas = ui.getCanvasElement();
        if (!canvas) { ui.showGlobalMessageBox("Critical: Canvas not found.", "error", 30000); return; }

        // toolManager needs to be initialized before sceneManager if sceneManager's init depends on toolManager being ready
        // (which it does, as sceneManager's event handlers call toolManager)
        // However, toolManager also needs sceneManager. So we pass THREE to toolManager here.
        // The actual sceneApi for toolManager is set up in its init.
        toolManager.initToolManager(sceneManager, ui, THREE); // Pass global THREE

        const editorInitialized = sceneManager.initSceneManager(canvas, ui, toolManager, sceneChangeCallbackForHistory, historyManager);
        if(!editorInitialized){ ui.showGlobalMessageBox("Critical: SceneManager failed.", "error", 30000); return; }

        historyManager.initHistoryManager(sceneManager, ui);
        // toolManager.initToolManager(sceneManager, ui, THREE); // Moved up

        const sceneFunctionsForPM = {
            isEditorInitialized: sceneManager.isEditorInitialized,
            applySceneState: sceneManager.applySceneState,
            clearHistoryAndSaveInitialState: historyManager.clearHistoryAndSaveInitialState,
            getInitialSceneState: sceneManager.getInitialSceneState,
            getCurrentSceneState: sceneManager.getCurrentSceneState,
            cancelActiveToolModes: sceneManager.cancelActiveToolModes,
            setTransformMode: sceneManager.setTransformMode,
            handleWindowResize: sceneManager.handleWindowResize,
            saveCurrentSceneToHistory: sceneManager.saveCurrentSceneToHistory
        };
        const mainUtilsForPM = {
            showGlobalMessageBox: ui.showGlobalMessageBox,
            switchEditorTab: ui.switchEditorTab,
        };

        projectManager.initializeProjectManagerDependencies(sceneFunctionsForPM, mainUtilsForPM, ui.getGlobalElements());
        projectManager.loadProjects(currentProjectState);

        eventManager.initEventManager({ mainAppInterface, sceneManager, uiManager: ui, historyManager, toolManager, projectManager });

        // Initialize UI components managed by uiManager
        ui.initSidebarTabs();
        ui.initCollapsibleSections();
        ui.initSidebarToggleButtons();

        // --- Setup UI Event Listeners ---
        const pmControls = ui.getProjectControls();
        if (pmControls.createNewProjectBtn) pmControls.createNewProjectBtn.addEventListener('click', ui.openNewProjectModal);
        if (pmControls.cancelNewProjectBtn) pmControls.cancelNewProjectBtn.addEventListener('click', ui.closeNewProjectModal);

        if (pmControls.confirmNewProjectBtn) {
            pmControls.confirmNewProjectBtn.addEventListener('click', () => {
                const name = ui.getNewProjectName();
                if (!name) { ui.showGlobalMessageBox("Project name cannot be empty.", "error"); return; }
                ui.setConfirmNewProjectButtonState(true);
                try {
                    const newProjectData = projectManager.handleCreateNewProject(name);
                    if (newProjectData && newProjectData.id) {
                        currentProjectState.id = newProjectData.id;
                        currentProjectState.name = newProjectData.projectName;
                        ui.closeNewProjectModal();
                        ui.showGlobalMessageBox(`Project "${currentProjectState.name}" created! Opening...`, "success", 2000);
                        setTimeout(() => {
                            projectManager.openProject(
                                currentProjectState.id, currentProjectState.name,
                                currentProjectState, sceneFunctionsForPM, mainUtilsForPM
                            );
                        }, 100);
                    } else {
                        if(!newProjectData && ui) ui.showGlobalMessageBox("Failed to create project. Please check logs.", "error");
                    }
                } catch (e) { console.error("Error creating new project:", e); if(ui) ui.showGlobalMessageBox("An error occurred.", "error");
                } finally { ui.setConfirmNewProjectButtonState(false); }
            });
        }
        const deleteControls = ui.getProjectControls();
        if (deleteControls.cancelDeleteBtn) { deleteControls.cancelDeleteBtn.addEventListener('click', () => { ui.closeConfirmDeleteModal(); projectManager.clearProjectToDeleteIdPM(); });}
        if (deleteControls.confirmDeleteBtn) {
             deleteControls.confirmDeleteBtn.addEventListener('click', () => {
                const projectId = projectManager.getProjectToDeleteIdPM();
                if (!projectId) return;
                ui.setConfirmDeleteButtonState(true);
                try {
                    let projects = projectManager.getProjectsFromLocalStorage(); // from projectManager module
                    projects = projects.filter(p => p.id !== projectId);
                    projectManager.saveProjectsToLocalStorage(projects); // from projectManager module
                    ui.closeConfirmDeleteModal();
                    ui.showGlobalMessageBox("Project deleted.", "success");
                    projectManager.clearProjectToDeleteIdPM();
                    projectManager.loadProjects(currentProjectState);
                } catch (e) { console.error("Error deleting project:", e); ui.showGlobalMessageBox("Failed to delete project.", "error");
                } finally { ui.setConfirmDeleteButtonState(false); }
            });
         }

        // const sidebarControls = ui.getSidebarControls(); // No longer needed here, handled by ui.initSidebarTabs etc.

        const topToolbar = document.getElementById('top-toolbar');
        // Event listeners for topToolbar buttons (if any not covered by other managers)
        // Example: backToProjectsBtn, saveProjectBtn, export/import JSON, undo/redo, settings, help
        // These are mostly covered by projectManager, historyManager, or are placeholders.
        // For example, backToProjectsBtn:
        const editorControls = ui.getGlobalElements(); // getGlobalElements() should provide access to these
        if (editorControls.backToProjectsBtn) {
            editorControls.backToProjectsBtn.addEventListener('click', () => {
                // Add confirmation if there are unsaved changes
                projectManager.switchToProjectManager(currentProjectState);
            });
        }
        if (editorControls.saveProjectBtn) { // Already handled by Ctrl+S via eventManager, but direct click too
            editorControls.saveProjectBtn.addEventListener('click', () => mainAppInterface.saveActiveProject());
        }
        if (editorControls.exportSceneJsonBtn) {
            editorControls.exportSceneJsonBtn.addEventListener('click', () => {
                const sceneData = sceneManager.getCurrentSceneState();
                ui.showEditorExportSceneDialog(sceneData);
            });
        }
        if (editorControls.importSceneJsonBtn) {
            editorControls.importSceneJsonBtn.addEventListener('click', () => {
                 ui.showEditorImportSceneDialog((jsonData) => {
                    if(jsonData) {
                        sceneManager.applySceneState(jsonData, false); // false: not from history
                        historyManager.clearHistoryAndSaveInitialState(jsonData); // Reset history with new state
                        ui.showGlobalMessageBox("Scene imported successfully.", "success");
                    }
                 });
            });
        }
        if (editorControls.undoBtn) editorControls.undoBtn.addEventListener('click', () => historyManager.undo());
        if (editorControls.redoBtn) editorControls.redoBtn.addEventListener('click', () => historyManager.redo());

        // Listeners for JSON editor modal (copy, load, close)
        if (editorControls.copyJsonEditorBtn) {
            editorControls.copyJsonEditorBtn.addEventListener('click', () => {
                if (editorControls.jsonOutputEditor) {
                    navigator.clipboard.writeText(editorControls.jsonOutputEditor.value)
                        .then(() => ui.showEditorMessageBox("Copied to clipboard!", "success", 1500))
                        .catch(err => ui.showEditorMessageBox("Failed to copy.", "error", 1500));
                }
            });
        }
        if (editorControls.loadJsonEditorBtn) {
             editorControls.loadJsonEditorBtn.addEventListener('click', () => {
                if (editorControls.jsonOutputEditor) {
                    const jsonData = editorControls.jsonOutputEditor.value;
                     try {
                        JSON.parse(jsonData); // Validate JSON
                        sceneManager.applySceneState(jsonData, false);
                        historyManager.clearHistoryAndSaveInitialState(jsonData);
                        ui.closeEditorJsonDialog();
                        ui.showGlobalMessageBox("Scene loaded from JSON.", "success");
                    } catch (e) {
                        ui.showEditorMessageBox("Invalid JSON data. Could not load.", "error");
                    }
                }
            });
        }
        if (editorControls.closeJsonBoxEditorBtn) {
            editorControls.closeJsonBoxEditorBtn.addEventListener('click', ()_ => ui.closeEditorJsonDialog());
        }


        // Viewport toolbar buttons (transform modes, camera views)
        if (editorControls.viewTranslateBtn) editorControls.viewTranslateBtn.addEventListener('click', () => sceneManager.setTransformMode('translate'));
        if (editorControls.viewRotateBtn) editorControls.viewRotateBtn.addEventListener('click', () => sceneManager.setTransformMode('rotate'));
        if (editorControls.viewScaleBtn) editorControls.viewScaleBtn.addEventListener('click', () => sceneManager.setTransformMode('scale'));

        if (editorControls.viewTopBtn) editorControls.viewTopBtn.addEventListener('click', () => sceneManager.setCameraView('top'));
        if (editorControls.viewFrontBtn) editorControls.viewFrontBtn.addEventListener('click', () => sceneManager.setCameraView('front'));
        if (editorControls.viewSideBtn) editorControls.viewSideBtn.addEventListener('click', () => sceneManager.setCameraView('side'));
        if (editorControls.viewIsoBtn) editorControls.viewIsoBtn.addEventListener('click', () => sceneManager.setCameraView('perspective'));
        if (editorControls.viewResetBtn) editorControls.viewResetBtn.addEventListener('click', () => sceneManager.resetCamera());
        if (editorControls.viewFrameBtn) editorControls.viewFrameBtn.addEventListener('click', () => sceneManager.frameSelected());
        if (editorControls.toggleSnappingBtn) editorControls.toggleSnappingBtn.addEventListener('click', () => sceneManager.toggleSnapping());


        // Light properties panel main delete button (specific to selected light)
        // This listener is better placed inside uiManager's updateSelectedLightPropertiesPanel,
        // or sceneManager should expose a generic deleteSelectedLight function.
        // For now, assuming sceneManager.deleteSelected() handles selected lights too.
        if (editorControls.deleteLightBtn) { // This ID is for the button in light props panel
             editorControls.deleteLightBtn.addEventListener('click', () => {
                toolManager.deactivateCurrentTool(); // Deactivate any active tool
                sceneManager.deleteSelected(); // sceneManager should handle if it's a light or object
            });
        }

        // Object/Light specific properties (e.g., name, color, intensity) are handled dynamically
        // within uiManager's populateObjectPropertiesPanel and updateSelectedLightPropertiesPanel,
        // which directly call sceneApi methods. This is good.

        // General editor environment settings (like background color, ambient light)
        // These should have IDs and be cached in uiManager if not already.
        // Example for scene background color:
        if (editorControls.sceneBgColorInput) { // Assuming id="sceneBgColor" from HTML
            editorControls.sceneBgColorInput.addEventListener('input', (event) => {
                if(sceneManager.setClearColor) sceneManager.setClearColor(event.target.value);
                // Potentially trigger history save if this is a significant change
                // sceneChangeCallbackForHistory();
            });
        }
        if (editorControls.ambientLightColorInput && editorControls.ambientLightIntensityInput) {
             const updateAmbientLight = () => {
                const color = editorControls.ambientLightColorInput.value;
                const intensity = parseFloat(editorControls.ambientLightIntensityInput.value);
                if(sceneManager.updateAmbientLight) sceneManager.updateAmbientLight(color, intensity);
                // sceneChangeCallbackForHistory();
             };
            editorControls.ambientLightColorInput.addEventListener('input', updateAmbientLight);
            editorControls.ambientLightIntensityInput.addEventListener('input', updateAmbientLight);
        }

        // Camera properties (FOV, Near, Far)
        if (editorControls.cameraFOVInput) editorControls.cameraFOVInput.addEventListener('input', (e) => sceneManager.updateCameraProperty('fov', parseFloat(e.target.value)));
        if (editorControls.cameraNearInput) editorControls.cameraNearInput.addEventListener('input', (e) => sceneManager.updateCameraProperty('near', parseFloat(e.target.value)));
        if (editorControls.cameraFarInput) editorControls.cameraFarInput.addEventListener('input', (e) => sceneManager.updateCameraProperty('far', parseFloat(e.target.value)));


        // Ensure all other topToolbar buttons are connected if they are not placeholders
        // e.g., settingsBtn, helpBtn, measureToolBtn (if they become active)
        // For now, they are marked disabled or coming soon.

        const topToolbar = document.getElementById('top-toolbar'); // This redeclares, ensure it's not an issue.

        const creationBtns = ui.getCreationButtons();
        if (creationBtns.addCubeBtn) creationBtns.addCubeBtn.addEventListener('click', () => { toolManager.deactivateCurrentTool(); sceneManager.addObject('Cube'); });
        if (creationBtns.addSphereBtn) creationBtns.addSphereBtn.addEventListener('click', () => { toolManager.deactivateCurrentTool(); sceneManager.addObject('Sphere'); });
        if (creationBtns.addCylinderBtn) creationBtns.addCylinderBtn.addEventListener('click', () => { toolManager.deactivateCurrentTool(); sceneManager.addObject('Cylinder'); });
        if (creationBtns.addPlaneBtn) creationBtns.addPlaneBtn.addEventListener('click', () => { toolManager.deactivateCurrentTool(); sceneManager.addObject('Plane'); });

        if (creationBtns.addPointLightBtn) creationBtns.addPointLightBtn.addEventListener('click', () => { toolManager.deactivateCurrentTool(); sceneManager.addLight('PointLight'); });
        if (creationBtns.addDirectionalLightBtn) creationBtns.addDirectionalLightBtn.addEventListener('click', () => { toolManager.deactivateCurrentTool(); sceneManager.addLight('DirectionalLight'); });
        if (creationBtns.addSpotLightBtn) creationBtns.addSpotLightBtn.addEventListener('click', () => { toolManager.deactivateCurrentTool(); sceneManager.addLight('SpotLight'); });
        if (creationBtns.addAmbientLightBtn) creationBtns.addAmbientLightBtn.addEventListener('click', () => { toolManager.deactivateCurrentTool(); sceneManager.addLight('AmbientLight'); });

        if (creationBtns.toggleLightHelpersBtn) creationBtns.toggleLightHelpersBtn.addEventListener('click', () => sceneManager.toggleLightHelpers());

        if (creationBtns.addRectangleBtn) creationBtns.addRectangleBtn.addEventListener('click', () => toolManager.activateTool('rectangle'));
        if (creationBtns.pushPullBtn) creationBtns.pushPullBtn.addEventListener('click', () => toolManager.activateTool('pushPull'));
        if (creationBtns.createBoxBtn) { // This is the "Box (Dim)" button
            creationBtns.createBoxBtn.addEventListener('click', () => {
                toolManager.deactivateCurrentTool();
                ui.showDimensionModal((dimensions) => { // Pass callback to showDimensionModal
                    if (dimensions) {
                        sceneManager.addObject('Box', dimensions); // Assuming addObject can take dimensions
                    }
                });
            });
        }

        // The dimension modal's confirm/cancel are now handled via the callback to showDimensionModal
        // So, direct listeners for createBoxConfirmBtnEditor/createBoxCancelBtnEditor might not be needed here
        // if showDimensionModal in uiManager sets them up. Let's assume showDimensionModal takes a confirm callback.

        // Viewport Overlay Buttons (already handled in previous subtask, but verify they are using ui.getViewportOverlayControls())
        const viewportOverlayControls = ui.getViewportOverlayControls();
        if (viewportOverlayControls.toggleWireframeBtn) viewportOverlayControls.toggleWireframeBtn.addEventListener('click', () => sceneManager.toggleWireframe());
        if (viewportOverlayControls.toggleGridBtn) viewportOverlayControls.toggleGridBtn.addEventListener('click', () => sceneManager.toggleGrid());
        if (viewportOverlayControls.resetCameraBtn) viewportOverlayControls.resetCameraBtn.addEventListener('click', () => sceneManager.resetCamera());
        if (viewportOverlayControls.toggleStatsBtn) viewportOverlayControls.toggleStatsBtn.addEventListener('click', () => sceneManager.toggleStats());

        ui.updateUndoRedoButtons(historyManager.canUndo(), historyManager.canRedo());
        console.log("ArchViz Pro Studio: Main application fully initialized.");
    });

    console.log("ArchViz Pro Studio: Main script processed.");
})();
// SCRIPT END
