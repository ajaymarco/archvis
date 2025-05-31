// --- Event Manager ---
// Centralizes global event listeners (keyboard, window resize, etc.)
// and delegates actions to appropriate managers.

let deps = { // Dependencies: instances of other managers
    mainAppInterface: null,
    sceneManager: null,
    uiManager: null,
    historyManager: null,
    toolManager: null,
    projectManager: null,
};

function _handleKeyDown(event) {
    if (!deps.sceneManager || !deps.historyManager || !deps.toolManager) {
        console.warn("EventManager: Dependencies not fully initialized for keydown.");
        return;
    }

    const activeElement = document.activeElement;
    const isInputField = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT');

    // Ctrl/Cmd + S for Save
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (deps.mainAppInterface && deps.mainAppInterface.saveActiveProject) {
            console.log("EventManager: Ctrl+S detected, calling saveActiveProject.");
            deps.mainAppInterface.saveActiveProject();
        } else {
            console.warn("EventManager: saveActiveProject not configured in mainAppInterface.");
        }
        return;
    }

    // Ctrl/Cmd + Z for Undo
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (deps.historyManager && deps.historyManager.canUndo && deps.historyManager.canUndo()) {
            console.log("EventManager: Ctrl+Z detected, calling historyManager.undo().");
            deps.historyManager.undo();
        } else {
            // console.log("EventManager: Cannot undo or historyManager not fully ready.");
        }
        return;
    }

    // Ctrl/Cmd + Y for Redo
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        if (deps.historyManager && deps.historyManager.canRedo && deps.historyManager.canRedo()) {
            console.log("EventManager: Ctrl+Y detected, calling historyManager.redo().");
            deps.historyManager.redo();
        } else {
            // console.log("EventManager: Cannot redo or historyManager not fully ready.");
        }
        return;
    }

    if (isInputField && event.key.toLowerCase() !== 'escape') {
        return;
    }

    if (deps.toolManager.isToolActive && deps.toolManager.isToolActive()) {
        if (deps.toolManager.handleKeyDown && deps.toolManager.handleKeyDown(event)) {
            return;
        }
    }

    if (deps.sceneManager.handleKeyDown) {
        deps.sceneManager.handleKeyDown(event);
    }
}

function _handleWindowResize() {
    if (deps.sceneManager && deps.sceneManager.handleWindowResize) {
        deps.sceneManager.handleWindowResize();
    }
    if (deps.uiManager && deps.uiManager.handleWindowResize) {
        // For now, just a log. Implement if UI needs specific resize logic beyond CSS.
        // deps.uiManager.handleWindowResize();
        // console.log("EventManager: Window resize detected, uiManager.handleWindowResize called (if implemented).");
    }
}

export function initEventManager(dependencies) {
    deps = dependencies; // Store all passed manager instances/interfaces

    window.removeEventListener('keydown', _handleKeyDown);
    window.addEventListener('keydown', _handleKeyDown);

    window.removeEventListener('resize', _handleWindowResize);
    window.addEventListener('resize', _handleWindowResize);

    console.log("EventManager initialized and global listeners attached.");
}

console.log("eventManager.js loaded.");
