// --- History Manager ---
// Manages undo/redo functionality by storing scene states.

let historyStates = [];
let currentIndex = -1;
const MAX_HISTORY_STATES = 50;

let sceneManagerInstance; // To get current state and apply state
let uiManagerInstance;    // To update undo/redo buttons

export function initHistoryManager(sceneApi, uiApi) {
    sceneManagerInstance = sceneApi;
    uiManagerInstance = uiApi;
    // Initialize with current scene state from sceneManager, ensuring it's a string
    const initialState = sceneManagerInstance.getCurrentSceneState();
    clearHistoryAndSaveInitialState(typeof initialState === 'string' ? initialState : JSON.stringify(initialState));
    console.log("HistoryManager initialized and initial state saved.");
}

export function saveState(stateString) {
    if (stateString === null || typeof stateString === 'undefined') {
        console.warn("HistoryManager: Attempted to save a null or undefined state.");
        return;
    }
    if (historyStates.length > 0 && currentIndex >=0 && currentIndex < historyStates.length && historyStates[currentIndex] === stateString) {
        // console.log("History: State identical to current, not saving."); // Can be noisy
        return;
    }

    if (currentIndex < historyStates.length - 1) {
        historyStates = historyStates.slice(0, currentIndex + 1);
    }

    historyStates.push(stateString);
    currentIndex++;

    if (historyStates.length > MAX_HISTORY_STATES) {
        historyStates.shift();
        currentIndex--;
    }

    if (uiManagerInstance && uiManagerInstance.updateUndoRedoButtons) {
        uiManagerInstance.updateUndoRedoButtons(canUndo(), canRedo());
    }
    // console.log(`History: State saved. Index: ${currentIndex}, Total: ${historyStates.length}`);
}

export function undo() {
    if (canUndo()) {
        currentIndex--;
        const stateToApply = historyStates[currentIndex];
        console.log(`History: Undo. Index: ${currentIndex}, Total: ${historyStates.length}`);
        if (sceneManagerInstance && sceneManagerInstance.applySceneState) {
            sceneManagerInstance.applySceneState(stateToApply, true); // Pass true: this state is from history
        }
        if (uiManagerInstance && uiManagerInstance.updateUndoRedoButtons) {
            uiManagerInstance.updateUndoRedoButtons(canUndo(), canRedo());
        }
        // return stateToApply; // Not strictly needed if applySceneState is called here
    } else {
        console.log("History: Cannot undo.");
    }
    return null; // Or return stateToApply if the caller needs it for some reason
}

export function redo() {
    if (canRedo()) {
        currentIndex++;
        const stateToApply = historyStates[currentIndex];
        console.log(`History: Redo. Index: ${currentIndex}, Total: ${historyStates.length}`);
         if (sceneManagerInstance && sceneManagerInstance.applySceneState) {
            sceneManagerInstance.applySceneState(stateToApply, true); // Pass true: this state is from history
        }
        if (uiManagerInstance && uiManagerInstance.updateUndoRedoButtons) {
            uiManagerInstance.updateUndoRedoButtons(canUndo(), canRedo());
        }
        // return stateToApply;
    } else {
        console.log("History: Cannot redo.");
    }
    return null;
}

export function canUndo() {
    return currentIndex > 0;
}

export function canRedo() {
    return currentIndex < historyStates.length - 1;
}

export function clearHistory() {
    historyStates = [];
    currentIndex = -1;
    if (uiManagerInstance && uiManagerInstance.updateUndoRedoButtons) {
        uiManagerInstance.updateUndoRedoButtons(false, false);
    }
    console.log("History: Cleared.");
}

export function clearHistoryAndSaveInitialState(initialStateString) {
    if (initialStateString === null || typeof initialStateString === 'undefined') {
        console.error("HistoryManager: Attempted to initialize with a null or undefined state string.");
        historyStates = []; // Ensure it's an array
        currentIndex = -1;
    } else {
        historyStates = [initialStateString];
        currentIndex = 0;
    }

    if (uiManagerInstance && uiManagerInstance.updateUndoRedoButtons) {
        uiManagerInstance.updateUndoRedoButtons(canUndo(), canRedo());
    }
    console.log("History: Cleared and initial state processed.");
}

console.log("historyManager.js loaded and updated for applySceneState flag.");
