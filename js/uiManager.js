// --- UI Manager ---

const uiElements = {};

export function initUIManager() {
    // ... (all previously cached elements) ...
    uiElements.projectManagerView = document.getElementById('project-manager-view');
    uiElements.projectManagerLoading = document.getElementById('project-manager-loading');
    uiElements.projectListUI = document.getElementById('project-list');
    uiElements.noProjectsMessageUI = document.getElementById('no-projects-message');
    uiElements.createNewProjectBtn = document.getElementById('createNewProjectBtn');
    uiElements.newProjectModal = document.getElementById('newProjectModal');
    uiElements.projectNameInput = document.getElementById('projectNameInput');
    uiElements.cancelNewProjectBtn = document.getElementById('cancelNewProjectBtn');
    uiElements.confirmNewProjectBtn = document.getElementById('confirmNewProjectBtn');
    uiElements.confirmDeleteModal = document.getElementById('confirmDeleteModal');
    uiElements.confirmDeleteMessageUI = document.getElementById('confirmDeleteMessage');
    uiElements.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    uiElements.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    uiElements.globalMessageBox = document.getElementById('globalMessageBox');
    uiElements.editorView = document.getElementById('editor-view');
    uiElements.currentProjectNameDisplay = document.getElementById('currentProjectNameDisplay');
    uiElements.editorMessageBox = document.getElementById('editorMessageBox');
    uiElements.confirmModalOverlayEditor = document.getElementById('confirmModalOverlayEditor');
    uiElements.confirmModalMessageEditor = document.getElementById('confirmModalMessageEditor');
    uiElements.confirmModalYesEditorBtn = document.getElementById('confirmModalYesEditor');
    uiElements.confirmModalNoEditorBtn = document.getElementById('confirmModalNoEditor');
    uiElements.dimensionModalOverlayEditor = document.getElementById('dimensionModalOverlayEditor');
    uiElements.boxWidthInput = document.getElementById('boxWidth');
    uiElements.boxHeightInput = document.getElementById('boxHeight');
    uiElements.boxDepthInput = document.getElementById('boxDepth');
    uiElements.createBoxConfirmBtnEditor = document.getElementById('createBoxConfirmBtnEditor');
    uiElements.createBoxCancelBtnEditor = document.getElementById('createBoxCancelBtnEditor');
    uiElements.extrusionModalOverlayEditor = document.getElementById('extrusionModalOverlayEditor');
    uiElements.extrusionHeightInput = document.getElementById('extrusionHeightInput');
    uiElements.confirmExtrusionBtnEditor = document.getElementById('confirmExtrusionBtnEditor');
    uiElements.cancelExtrusionBtnEditor = document.getElementById('cancelExtrusionBtnEditor');
    uiElements.leftSidebar = document.getElementById('left-sidebar');
    uiElements.rightSidebar = document.getElementById('right-sidebar');
    uiElements.leftSidebarToggleBtn = document.getElementById('left-sidebar-toggle');
    uiElements.rightSidebarToggleBtn = document.getElementById('right-sidebar-toggle');
    uiElements.leftSidebarTabs = document.querySelectorAll('#left-sidebar-tabs .sidebar-tab');
    uiElements.rightSidebarTabs = document.querySelectorAll('#right-sidebar-tabs .sidebar-tab');
    uiElements.allSectionTitles = document.querySelectorAll('#editor-view .section-title');
    uiElements.renderCanvas = document.getElementById('renderCanvas');
    uiElements.undoBtn = document.getElementById('undoBtn');
    uiElements.redoBtn = document.getElementById('redoBtn');
    uiElements.addRectangleBtn = document.getElementById('addRectangleBtn');
    uiElements.pushPullBtn = document.getElementById('pushPullBtn');
    uiElements.objectPropertiesContainer = document.getElementById('objectProperties');
    uiElements.lightPropertiesDisplayContainer = document.getElementById('lightPropertiesDisplay');
    uiElements.noSelectionMessage = document.getElementById('noSelectionMessage');
    uiElements.viewTranslateBtn = document.getElementById('viewTranslateBtn');
    uiElements.viewRotateBtn = document.getElementById('viewRotateBtn');
    uiElements.viewScaleBtn = document.getElementById('viewScaleBtn');

    // Cache Viewport Overlay Buttons
    uiElements.toggleWireframeBtn = document.getElementById('toggleWireframeBtn');
    uiElements.toggleGridBtn = document.getElementById('toggleGridBtn');
    uiElements.resetCameraBtn = document.getElementById('resetCameraBtn');
    uiElements.toggleStatsBtn = document.getElementById('toggleStatsBtn');

    console.log("UI Manager initialized and DOM elements cached (including viewport overlay buttons).");
}

export function getCanvasElement() { return uiElements.renderCanvas; }
export function updateUndoRedoButtons(canUndo, canRedo) { /* ... */ }
export function handleWindowResize() { /* ... */ }
export function showGlobalMessageBox(message, type = 'info', duration = 3000) { /* ... */ }
export function showEditorMessageBox(message, type = 'info', duration = 2500) { /* ... */ }
export function showEditorConfirmModal(message, yesCallback, noCallback) { /* ... */ }
export function closeEditorConfirmModal() { /* ... */ }
export function setCanvasCursor(cursorType = 'default') { if (uiElements.renderCanvas) uiElements.renderCanvas.style.cursor = cursorType; }
export function showExtrusionModal(confirmCallback) { /* ... */ }
export function closeExtrusionModal() { /* ... */ }
export function getExtrusionHeight() { /* ... */ }
export function updateActiveToolButton(activeToolName) { /* ... */ }
export function renderProjectListItem(project, openProjectCallback, confirmDeleteCallback) { /* ... */ }
export function displayProjectList(projects, openProjectCb, confirmDeleteCb) { /* ... */ }
export function clearProjectList() { /* ... */ }
export function showNoProjectsMessage(show) { /* ... */ }
export function showProjectManagerLoading(show) { /* ... */ }
export function updateProjectNameDisplay(name) { /* ... */ }
export function setProjectManagerViewVisibility(visible) { /* ... */ }
export function setEditorViewVisibility(visible) { /* ... */ }
export function openNewProjectModal() { /* ... */ }
export function closeNewProjectModal() { /* ... */ }
export function getNewProjectName() { /* ... */ }
export function setConfirmNewProjectButtonState(isLoading) { /* ... */ }
export function openConfirmDeleteModal(projectName) { /* ... */ }
export function closeConfirmDeleteModal() { /* ... */ }
export function setConfirmDeleteButtonState(isLoading) { /* ... */ }
export function showDimensionModal() { /* ... */ }
export function closeDimensionModal() { /* ... */ }
export function getDimensionModalValues() { /* ... */ }
export function switchEditorTab(tabName, sidebarKey) { /* ... */ }
export function toggleEditorSection(titleElement) { /* ... */ }
export function populateObjectPropertiesPanel(object, transformControls) { /* ... */ }
export function updateSelectedLightPropertiesPanel(light) { /* ... */ }
export function updateEditorObjectList(objects, lights, selectObjectCallback, selectLightCallback) { /* ... */ }
export function updateEditorSelectionPropertiesVisibility(currentSelectedObject, currentSelectedLight) { /* ... */ }
export function updateEditorTransformModeButtons(activeMode) { /* ... */ }
export function showEditorExportSceneDialog(jsonData) { /* ... */ }
export function showEditorImportSceneDialog() { /* ... */ }
export function getJsonFromEditorDialog() { /* ... */ }
export function closeEditorJsonDialog() { /* ... */ }

// Getters
export function getProjectControls() { return uiElements; }
export function getEditorModalControls() { return uiElements; }
export function getSidebarControls() { return uiElements; }
export function getGlobalElements() { return uiElements; } // Exposes all, including new overlay buttons if needed by main
export function getViewportOverlayControls() {
    return {
        toggleWireframeBtn: uiElements.toggleWireframeBtn,
        toggleGridBtn: uiElements.toggleGridBtn,
        resetCameraBtn: uiElements.resetCameraBtn,
        toggleStatsBtn: uiElements.toggleStatsBtn,
    };
}

console.log("uiManager.js updated with viewport overlay button caching and getter.");
