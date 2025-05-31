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
    clearHistoryAndSaveInitialState(sceneManagerInstance.getCurrentSceneState()); // Start with current (likely empty) scene state
    console.log("HistoryManager initialized and initial state saved.");
}

export function saveState(stateString) {
    // If stateString is null or undefined, don't save.
    if (stateString === null || typeof stateString === 'undefined') {
        console.warn("HistoryManager: Attempted to save a null or undefined state.");
        return;
    }
    // Prevent saving identical consecutive states
    if (historyStates.length > 0 && currentIndex >=0 && historyStates[currentIndex] === stateString) {
        console.log("History: State identical to current, not saving.");
        return;
    }

    if (currentIndex < historyStates.length - 1) {
        historyStates = historyStates.slice(0, currentIndex + 1);
    }

    historyStates.push(stateString);
    currentIndex++; // Increment current index as new state is pushed

    if (historyStates.length > MAX_HISTORY_STATES) {
        historyStates.shift();
        currentIndex--; // Adjust index because the array was shifted
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
            sceneManagerInstance.applySceneState(stateToApply, false); // false: applying history state, don't re-save
        }
        if (uiManagerInstance && uiManagerInstance.updateUndoRedoButtons) {
            uiManagerInstance.updateUndoRedoButtons(canUndo(), canRedo());
        }
        return stateToApply; // Though main.js might not use the return value if applySceneState is called here
    }
    console.log("History: Cannot undo.");
    return null;
}

export function redo() {
    if (canRedo()) {
        currentIndex++;
        const stateToApply = historyStates[currentIndex];
        console.log(`History: Redo. Index: ${currentIndex}, Total: ${historyStates.length}`);
         if (sceneManagerInstance && sceneManagerInstance.applySceneState) {
            sceneManagerInstance.applySceneState(stateToApply, false); // false: applying history state, don't re-save
        }
        if (uiManagerInstance && uiManagerInstance.updateUndoRedoButtons) {
            uiManagerInstance.updateUndoRedoButtons(canUndo(), canRedo());
        }
        return stateToApply;
    }
    console.log("History: Cannot redo.");
    return null;
}

export function canUndo() {
    return currentIndex > 0;
}

export function canRedo() {
    return currentIndex < historyStates.length - 1;
}

export function clearHistory() { // Might not be used if clearHistoryAndSaveInitialState is preferred
    historyStates = [];
    currentIndex = -1;
    if (uiManagerInstance && uiManagerInstance.updateUndoRedoButtons) {
        uiManagerInstance.updateUndoRedoButtons(false, false);
    }
    console.log("History: Cleared.");
}

export function clearHistoryAndSaveInitialState(initialStateString) {
    if (initialStateString === null || typeof initialStateString === 'undefined') {
        console.error("HistoryManager: Attempted to initialize with a null or undefined state.");
        historyStates = [];
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

console.log("historyManager.js loaded.");
