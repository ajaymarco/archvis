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
    uiElements.allSectionTitles = document.querySelectorAll('#editor-view .section-title');
    uiElements.leftSidebarTabs = document.querySelectorAll('#left-sidebar-tabs .sidebar-tab');
    uiElements.rightSidebarTabs = document.querySelectorAll('#right-sidebar-tabs .sidebar-tab');
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
    uiElements.toggleWireframeBtn = document.getElementById('toggleWireframeBtn');
    uiElements.toggleGridBtn = document.getElementById('toggleGridBtn');
    uiElements.resetCameraBtn = document.getElementById('resetCameraBtn');
    uiElements.toggleStatsBtn = document.getElementById('toggleStatsBtn');
    uiElements.addCubeBtn = document.getElementById('addCubeBtn');
    uiElements.addSphereBtn = document.getElementById('addSphereBtn');
    uiElements.addCylinderBtn = document.getElementById('addCylinderBtn');
    uiElements.addPlaneBtn = document.getElementById('addPlaneBtn');
    uiElements.addPointLightBtn = document.getElementById('addPointLightBtn');
    uiElements.addDirectionalLightBtn = document.getElementById('addDirectionalLightBtn');
    uiElements.addSpotLightBtn = document.getElementById('addSpotLightBtn');
    uiElements.addAmbientLightBtn = document.getElementById('addAmbientLightBtn');
    uiElements.toggleLightHelpersBtn = document.getElementById('toggleLightHelpersBtn');
    uiElements.createBoxBtn = document.getElementById('createBoxBtn');

    // --- Top Toolbar Elements ---
    uiElements.backToProjectsBtn = document.getElementById('backToProjectsBtn');
    uiElements.saveProjectBtn = document.getElementById('saveProjectBtn');
    uiElements.exportSceneJsonBtn = document.getElementById('exportSceneJsonBtn');
    uiElements.importSceneJsonBtn = document.getElementById('importSceneJsonBtn');
    // undoBtn, redoBtn already cached

    // --- JSON Editor Modal Elements ---
    uiElements.jsonMessageBoxEditor = document.getElementById('jsonMessageBoxEditor'); // The modal itself
    uiElements.jsonOutputEditor = document.getElementById('jsonOutputEditor'); // The textarea
    uiElements.copyJsonEditorBtn = document.getElementById('copyJsonEditorBtn');
    uiElements.loadJsonEditorBtn = document.getElementById('loadJsonEditorBtn');
    uiElements.closeJsonBoxEditorBtn = document.getElementById('closeJsonBoxEditorBtn');

    // --- Viewport Toolbar (Bottom) Elements ---
    // viewTranslateBtn, viewRotateBtn, viewScaleBtn already cached
    uiElements.viewTopBtn = document.getElementById('viewTopBtn');
    uiElements.viewFrontBtn = document.getElementById('viewFrontBtn');
    uiElements.viewSideBtn = document.getElementById('viewSideBtn');
    uiElements.viewIsoBtn = document.getElementById('viewIsoBtn');
    uiElements.viewResetBtn = document.getElementById('viewResetBtn'); // Distinct from resetCameraBtn
    uiElements.viewFrameBtn = document.getElementById('viewFrameBtn');
    uiElements.toggleSnappingBtn = document.getElementById('toggleSnappingBtn');

    // --- Light Properties Panel Elements ---
    uiElements.deleteLightBtn = document.getElementById('deleteLightBtn'); // In light properties
    // Specific light property inputs (like name, color, intensity) are dynamically generated, so not cached here.
    // lightName, lightColor, lightIntensity, lightDistanceGroup, lightDecayGroup, lightAngleGroup, lightPenumbraGroup are IDs for dynamic inputs.
    // However, the main delete button is static in the panel structure.

    // --- World/Environment Panel Elements ---
    uiElements.sceneBgColorInput = document.getElementById('sceneBgColor');
    uiElements.ambientLightColorInput = document.getElementById('ambientLightColor');
    uiElements.ambientLightIntensityInput = document.getElementById('ambientLightIntensity');

    // --- Camera Settings Panel Elements ---
    uiElements.cameraFOVInput = document.getElementById('cameraFOV');
    uiElements.cameraNearInput = document.getElementById('cameraNear');
    uiElements.cameraFarInput = document.getElementById('cameraFar');

    // Ensure all existing cached elements are still here... (they are, based on diff context)

    console.log("UI Manager initialized and DOM elements cached (including new additions for main.js listeners).");
}

export function getCanvasElement() { return uiElements.renderCanvas; }
export function updateUndoRedoButtons(canUndo, canRedo) { /* ... */ }
export function handleWindowResize() { /* ... */ }
export function showGlobalMessageBox(message, type = 'info', duration = 3000) { /* ... (full implementation from previous steps) ... */ }
export function showEditorMessageBox(message, type = 'info', duration = 2500) { /* ... (full implementation from previous steps) ... */ }
export function showEditorConfirmModal(message, yesCallback, noCallback) { /* ... (full implementation from previous steps) ... */ }
export function closeEditorConfirmModal() { /* ... (full implementation from previous steps) ... */ }
export function setCanvasCursor(cursorType = 'default') { if (uiElements.renderCanvas) uiElements.renderCanvas.style.cursor = cursorType; }

export function showExtrusionModal(confirmCallback, cancelCallback) { // Added cancelCallback
    if (uiElements.extrusionModalOverlayEditor && uiElements.confirmExtrusionBtnEditor && uiElements.cancelExtrusionBtnEditor && uiElements.extrusionHeightInput) {
        uiElements.extrusionHeightInput.value = '1';

        const newConfirmBtn = uiElements.confirmExtrusionBtnEditor.cloneNode(true);
        uiElements.confirmExtrusionBtnEditor.parentNode.replaceChild(newConfirmBtn, uiElements.confirmExtrusionBtnEditor);
        uiElements.confirmExtrusionBtnEditor = newConfirmBtn;

        const newCancelBtn = uiElements.cancelExtrusionBtnEditor.cloneNode(true);
        uiElements.cancelExtrusionBtnEditor.parentNode.replaceChild(newCancelBtn, uiElements.cancelExtrusionBtnEditor);
        uiElements.cancelExtrusionBtnEditor = newCancelBtn;

        uiElements.confirmExtrusionBtnEditor.onclick = () => {
            const height = parseFloat(uiElements.extrusionHeightInput.value);
            if (!isNaN(height) && height !== 0) { // Allow negative extrusion? For now, non-zero.
                if(confirmCallback) confirmCallback(height);
                closeExtrusionModal();
            } else {
                showEditorMessageBox("Invalid extrusion height (must be non-zero).", "error");
            }
        };
        uiElements.cancelExtrusionBtnEditor.onclick = () => {
            closeExtrusionModal();
            if (cancelCallback) cancelCallback(); // Call the cancel callback if provided
        };
        uiElements.extrusionModalOverlayEditor.classList.add('show');
        uiElements.extrusionHeightInput.focus();
    } else {
        console.error("Extrusion modal elements not found in uiManager cache.");
    }
}

export function closeExtrusionModal() { if (uiElements.extrusionModalOverlayEditor) uiElements.extrusionModalOverlayEditor.classList.remove('show'); }
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
export function showDimensionModal(confirmCallback) { // Added confirmCallback
    if (uiElements.dimensionModalOverlayEditor && uiElements.createBoxConfirmBtnEditor && uiElements.createBoxCancelBtnEditor) {
        // Clear previous values or set defaults
        if(uiElements.boxWidthInput) uiElements.boxWidthInput.value = "1";
        if(uiElements.boxHeightInput) uiElements.boxHeightInput.value = "1";
        if(uiElements.boxDepthInput) uiElements.boxDepthInput.value = "1";

        // Re-attach listeners to prevent multiple bindings if modal is reused
        const newConfirmBtn = uiElements.createBoxConfirmBtnEditor.cloneNode(true);
        uiElements.createBoxConfirmBtnEditor.parentNode.replaceChild(newConfirmBtn, uiElements.createBoxConfirmBtnEditor);
        uiElements.createBoxConfirmBtnEditor = newConfirmBtn;

        const newCancelBtn = uiElements.createBoxCancelBtnEditor.cloneNode(true);
        uiElements.createBoxCancelBtnEditor.parentNode.replaceChild(newCancelBtn, uiElements.createBoxCancelBtnEditor);
        uiElements.createBoxCancelBtnEditor = newCancelBtn;

        uiElements.createBoxConfirmBtnEditor.onclick = () => {
            const values = getDimensionModalValues();
            if (values.width > 0 && values.height > 0 && values.depth > 0) {
                if(confirmCallback) confirmCallback(values);
                closeDimensionModal();
            } else {
                showEditorMessageBox("Dimensions must be positive values.", "error");
            }
        };
        uiElements.createBoxCancelBtnEditor.onclick = closeDimensionModal;

        uiElements.dimensionModalOverlayEditor.classList.add('show');
        if(uiElements.boxWidthInput) uiElements.boxWidthInput.focus();
    }  else {
        console.error("Dimension modal elements not found in uiManager cache.");
    }
}
export function closeDimensionModal() { if (uiElements.dimensionModalOverlayEditor) uiElements.dimensionModalOverlayEditor.classList.remove('show'); }
export function getDimensionModalValues() {
    return {
        width: parseFloat(uiElements.boxWidthInput?.value) || 0,
        height: parseFloat(uiElements.boxHeightInput?.value) || 0,
        depth: parseFloat(uiElements.boxDepthInput?.value) || 0
    };
}
// export function switchEditorTab(tabName, sidebarKey) { /* ... */ } // Already defined below
// export function toggleEditorSection(titleElement) { /* ... */ } // Already defined below
export function populateObjectPropertiesPanel(object, transformControls, sceneApi) { /* ... (full implementation from previous steps) ... */ }
export function updateSelectedLightPropertiesPanel(light, sceneApi) { /* ... (full implementation from previous steps) ... */ }
export function updateEditorObjectList(objects, lights, selectObjectCallback, selectLightCallback, selectedObjectUUID, selectedLightUUID) { /* ... (full implementation from previous steps) ... */ }
export function updateEditorSelectionPropertiesVisibility(currentSelectedObject, currentSelectedLight) { /* ... (full implementation from previous steps) ... */ }
export function updateEditorTransformModeButtons(activeMode) {
    if(uiElements.viewTranslateBtn) uiElements.viewTranslateBtn.classList.toggle('active', activeMode === 'translate');
    if(uiElements.viewRotateBtn) uiElements.viewRotateBtn.classList.toggle('active', activeMode === 'rotate');
    if(uiElements.viewScaleBtn) uiElements.viewScaleBtn.classList.toggle('active', activeMode === 'scale');
}
export function showEditorExportSceneDialog(jsonData) {
    if (uiElements.jsonMessageBoxEditor && uiElements.jsonOutputEditor) {
        const titleElement = uiElements.jsonMessageBoxEditor.querySelector('.modal-title');
        if (titleElement) titleElement.textContent = "Export Scene (JSON)";

        uiElements.jsonOutputEditor.value = jsonData;
        uiElements.jsonOutputEditor.readOnly = true; // For export, it's read-only

        if(uiElements.loadJsonEditorBtn) uiElements.loadJsonEditorBtn.style.display = 'none'; // Hide load button
        if(uiElements.copyJsonEditorBtn) uiElements.copyJsonEditorBtn.style.display = 'inline-flex'; // Show copy

        uiElements.jsonMessageBoxEditor.classList.add('show');
    } else {
        console.error("JSON Editor Modal or textarea not found for export.");
    }
}
export function showEditorImportSceneDialog(importCallback) {
    if (uiElements.jsonMessageBoxEditor && uiElements.jsonOutputEditor && uiElements.loadJsonEditorBtn && uiElements.copyJsonEditorBtn) {
        const titleElement = uiElements.jsonMessageBoxEditor.querySelector('.modal-title');
        if (titleElement) titleElement.textContent = "Import Scene (JSON)";

        uiElements.jsonOutputEditor.value = ""; // Clear for import
        uiElements.jsonOutputEditor.readOnly = false;
        uiElements.jsonOutputEditor.placeholder = "Paste your scene JSON here...";

        uiElements.loadJsonEditorBtn.style.display = 'inline-flex'; // Show load button
        uiElements.copyJsonEditorBtn.style.display = 'none'; // Hide copy button

        // Re-attach listener for loadJsonEditorBtn to use the callback
        const newLoadBtn = uiElements.loadJsonEditorBtn.cloneNode(true);
        uiElements.loadJsonEditorBtn.parentNode.replaceChild(newLoadBtn, uiElements.loadJsonEditorBtn);
        uiElements.loadJsonEditorBtn = newLoadBtn;
        uiElements.loadJsonEditorBtn.onclick = () => {
            const jsonData = uiElements.jsonOutputEditor.value;
            try {
                JSON.parse(jsonData); // Validate
                if(importCallback) importCallback(jsonData); // Pass data to callback in main.js
                // main.js will handle applying scene, history, and closing dialog + messages
            } catch (e) {
                showEditorMessageBox("Invalid JSON data. Please check the format.", "error");
            }
        };

        uiElements.jsonMessageBoxEditor.classList.add('show');
        uiElements.jsonOutputEditor.focus();
    } else {
        console.error("JSON Editor Modal elements not found for import.");
    }
}
// getJsonFromEditorDialog is effectively replaced by the callback in showEditorImportSceneDialog
// export function getJsonFromEditorDialog() { /* ... (full implementation from previous steps) ... */ }
export function closeEditorJsonDialog() {
    if (uiElements.jsonMessageBoxEditor) {
        uiElements.jsonMessageBoxEditor.classList.remove('show');
    }
}

export function getProjectControls() { return uiElements; } // Contains project view specific elements
export function getEditorModalControls() { return uiElements; }
export function getSidebarControls() { return uiElements; }
export function getGlobalElements() { return uiElements; }
export function getCreationButtons() { /* ... (full implementation from previous steps) ... */ }
export function getViewportOverlayControls() { /* ... (full implementation from previous steps) ... */ }

export function initSidebarTabs() {
    const setupTabListener = (tabs) => {
        if (!tabs) return;
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                const sidebarKey = tab.dataset.sidebar; // 'left' or 'right'
                switchEditorTab(tabName, sidebarKey);
            });
        });
    };
    setupTabListener(uiElements.leftSidebarTabs);
    setupTabListener(uiElements.rightSidebarTabs);
    console.log("Sidebar tabs initialized.");
}

export function initCollapsibleSections() {
    if (uiElements.allSectionTitles) {
        uiElements.allSectionTitles.forEach(title => {
            // Initialize sections based on whether they have .collapsed class or not
            const content = title.nextElementSibling;
            if (title.classList.contains('collapsed')) {
                if (content && content.classList.contains('section-content')) {
                    content.style.maxHeight = '0';
                    content.style.opacity = '0';
                    content.style.paddingTop = '0';
                    content.style.paddingBottom = '0';
                    content.classList.add('collapsed'); // Ensure consistency
                }
                const icon = title.querySelector('i.fa-chevron-down');
                if (icon) icon.style.transform = 'rotate(-90deg)';
            } else {
                 if (content && content.classList.contains('section-content')) {
                    content.style.maxHeight = content.scrollHeight + "px"; // Or a default like '500px' if scrollHeight is complex
                    content.style.opacity = '1';
                    content.style.paddingTop = ''; // Reset to CSS default
                    content.style.paddingBottom = ''; // Reset to CSS default
                    content.classList.remove('collapsed');
                 }
                const icon = title.querySelector('i.fa-chevron-down');
                if (icon) icon.style.transform = 'rotate(0deg)';
            }

            title.addEventListener('click', () => {
                toggleEditorSection(title);
            });
        });
        console.log("Collapsible sections initialized.");
    }
}

export function initSidebarToggleButtons() {
    const setupToggle = (btn, sidebar) => {
        if (!btn || !sidebar) return;
        btn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const icon = btn.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                if (sidebar === uiElements.leftSidebar) icon.className = 'fas fa-chevron-right';
                else icon.className = 'fas fa-chevron-left';
            } else {
                if (sidebar === uiElements.leftSidebar) icon.className = 'fas fa-chevron-left';
                else icon.className = 'fas fa-chevron-right';
            }
        });
        // Initial icon state
        const icon = btn.querySelector('i');
         if (sidebar.classList.contains('collapsed')) {
            if (sidebar === uiElements.leftSidebar) icon.className = 'fas fa-chevron-right';
            else icon.className = 'fas fa-chevron-left';
        } else {
            if (sidebar === uiElements.leftSidebar) icon.className = 'fas fa-chevron-left';
            else icon.className = 'fas fa-chevron-right';
        }
    };

    setupToggle(uiElements.leftSidebarToggleBtn, uiElements.leftSidebar);
    setupToggle(uiElements.rightSidebarToggleBtn, uiElements.rightSidebar);
    console.log("Sidebar toggle buttons initialized.");
}

// Ensure toggleEditorSection correctly handles animation/styles
export function toggleEditorSection(titleElement) {
    if (!titleElement) return;
    const contentElement = titleElement.nextElementSibling;
    const icon = titleElement.querySelector('i.fa-chevron-down');

    titleElement.classList.toggle('collapsed');
    if (contentElement && contentElement.classList.contains('section-content')) {
        contentElement.classList.toggle('collapsed');
        if (contentElement.classList.contains('collapsed')) {
            contentElement.style.maxHeight = '0';
            contentElement.style.opacity = '0';
            contentElement.style.paddingTop = '0';
            contentElement.style.paddingBottom = '0';
            if (icon) icon.style.transform = 'rotate(-90deg)';
            titleElement.style.borderBottomColor = 'transparent'; // If it's a section title that should lose border
        } else {
            // Use scrollHeight to set max-height for smooth animation to content height
            contentElement.style.maxHeight = contentElement.scrollHeight + 'px';
            contentElement.style.opacity = '1';
            contentElement.style.paddingTop = ''; // Resets to CSS defined value
            contentElement.style.paddingBottom = ''; // Resets to CSS defined value
            if (icon) icon.style.transform = 'rotate(0deg)';
            titleElement.style.borderBottomColor = ''; // Resets to CSS or default
        }
    }
}


// Ensure switchEditorTab correctly handles panel display and tab active states
export function switchEditorTab(tabName, sidebarKey) {
    let tabs, contentContainer;
    if (sidebarKey === 'left') {
        tabs = uiElements.leftSidebarTabs;
        contentContainer = uiElements.leftSidebar.querySelector('#left-sidebar-content');
    } else if (sidebarKey === 'right') {
        tabs = uiElements.rightSidebarTabs;
        contentContainer = uiElements.rightSidebar.querySelector('#right-sidebar-content');
    } else {
        return; // Should not happen
    }

    if (!tabs || !contentContainer) return;

    // Deactivate all tabs and hide all panels for this sidebar
    tabs.forEach(t => t.classList.remove('active'));
    contentContainer.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none'; // Ensure it's hidden
    });

    // Activate the selected tab and show the corresponding panel
    const activeTab = Array.from(tabs).find(t => t.dataset.tab === tabName);
    const activePanel = contentContainer.querySelector(`#${tabName}`);

    if (activeTab) activeTab.classList.add('active');
    if (activePanel) {
        activePanel.classList.add('active');
        activePanel.style.display = 'block'; // Ensure it's shown
    }
}

export function updateCameraSettingsUI(cameraState) {
    if (!cameraState) return;
    if (uiElements.cameraFOVInput && cameraState.fov !== undefined) {
        uiElements.cameraFOVInput.value = cameraState.fov;
    }
    if (uiElements.cameraNearInput && cameraState.near !== undefined) {
        uiElements.cameraNearInput.value = cameraState.near;
    }
    if (uiElements.cameraFarInput && cameraState.far !== undefined) {
        uiElements.cameraFarInput.value = cameraState.far;
    }
    // Add zoom if a UI element for it exists:
    // if (uiElements.cameraZoomInput && cameraState.zoom !== undefined) {
    //     uiElements.cameraZoomInput.value = cameraState.zoom;
    // }
}

export function updateGridButtonState(isVisible) {
    if (uiElements.toggleGridBtn) { // Assuming toggleGridBtn is the ID for the top-right viewport overlay
        uiElements.toggleGridBtn.classList.toggle('active', isVisible);
    }
    // If there's a different button in a sidebar panel, update it as well or use a more specific function.
}

export function updateLightHelpersButtonState(isVisible) {
    if (uiElements.toggleLightHelpersBtn) { // This is the button in the "Create" panel
        // Assuming 'active' class or similar styling for button state
        // For now, let's just log, as the button itself might not have an 'active' state
        // but rather its text or icon might change, or it's just a trigger.
        // If it needs an active state:
        // uiElements.toggleLightHelpersBtn.classList.toggle('active', isVisible);
        console.log(`UI: Light helpers button state updated (visible: ${isVisible}) - actual button style change TBD.`);
    }
}

console.log("uiManager.js updated with initSidebarTabs, initCollapsibleSections, initSidebarToggleButtons, refined toggle/switch functions, and new UI updaters.");
