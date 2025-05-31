// --- Tool Manager ---
// Manages the active tool and its interaction with the scene and UI.

let sceneApi; // Reference to sceneManager functions/instance
let uiApi;    // Reference to uiManager functions/instance

let activeTool = null;
let toolState = {}; // Holds state for the currently active tool

// --- Tool Definitions ---
// We need THREE to be available for groundPlane, Vector3 etc.
// This implies that if toolManager is loaded, THREE should also be available.
// This is usually handled by import maps or module bundling in a real setup.
// For now, we assume THREE is globally available when these methods are called.
const tools = {
    'rectangle': {
        activate: () => {
            console.log("ToolManager: Activating Rectangle Tool");
            if (uiApi && uiApi.setCanvasCursor) uiApi.setCanvasCursor('crosshair');
            toolState.startPoint = null;
            toolState.previewLine = null;
            if(sceneApi && sceneApi.setOrbitControlsEnabled) sceneApi.setOrbitControlsEnabled(false);
        },
        deactivate: () => {
            console.log("ToolManager: Deactivating Rectangle Tool");
            if (uiApi && uiApi.setCanvasCursor) uiApi.setCanvasCursor('default');
            if (toolState.previewLine && sceneApi && sceneApi.removeSceneObject) {
                sceneApi.removeSceneObject(toolState.previewLine);
                if (toolState.previewLine.geometry) toolState.previewLine.geometry.dispose();
                if (toolState.previewLine.material) toolState.previewLine.material.dispose();
                toolState.previewLine = null;
            }
            if(sceneApi && sceneApi.setOrbitControlsEnabled) sceneApi.setOrbitControlsEnabled(true);
        },
        handleCanvasClick: (event, mouse, raycaster, camera, groundPlane) => {
            if(!sceneApi || !uiApi || !THREE) { console.error("Dependencies not loaded for rectangle tool click"); return; }

            const intersection = new THREE.Vector3();
            raycaster.setFromCamera(mouse, camera); // camera is THREE.PerspectiveCamera instance
            raycaster.ray.intersectPlane(groundPlane, intersection); // groundPlane is THREE.Plane instance

            if (!toolState.startPoint) {
                toolState.startPoint = intersection.clone();
                const points = [toolState.startPoint.clone(), toolState.startPoint.clone(), toolState.startPoint.clone(), toolState.startPoint.clone(), toolState.startPoint.clone()];
                const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
                const lineMat = new THREE.LineBasicMaterial({ color: 0x82aaff, transparent:true, opacity:0.7});
                toolState.previewLine = new THREE.Line(lineGeom, lineMat);
                toolState.previewLine.name = "RectanglePreviewLine";
                sceneApi.addSceneObject(toolState.previewLine);
                uiApi.showEditorMessageBox("Move to define size, click to set second corner.", "info");
            } else {
                const width = Math.abs(intersection.x - toolState.startPoint.x);
                const depth = Math.abs(intersection.z - toolState.startPoint.z);
                if (width > 0.01 && depth > 0.01) {
                    const centerX = (toolState.startPoint.x + intersection.x) / 2;
                    const centerZ = (toolState.startPoint.z + intersection.z) / 2;
                    sceneApi.addObject('Plane', {
                        name: "Drawn Rectangle",
                        width: width, height: depth,
                        position: [centerX, 0.01, centerZ], // Slightly above ground
                        rotation: [-Math.PI / 2, 0, 0]
                    }); // sceneApi.addObject will handle history via onSceneChange
                } else {
                    uiApi.showEditorMessageBox("Rectangle too small.", "error");
                }
                deactivateCurrentTool();
            }
        },
        handleCanvasMouseMove: (event, mouse, raycaster, camera, groundPlane) => {
            if (!toolState.startPoint || !toolState.previewLine || !THREE) return;
            const intersection = new THREE.Vector3();
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(groundPlane, intersection);

            const p1 = toolState.startPoint;
            const p2 = intersection;
            const points = [ p1.x, 0.01, p1.z,  p2.x, 0.01, p1.z, p2.x, 0.01, p2.z, p1.x, 0.01, p2.z, p1.x, 0.01, p1.z ];
            toolState.previewLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
            toolState.previewLine.geometry.attributes.position.needsUpdate = true;
        },
        handleKeyDown: (event) => { if (event.key === 'Escape') { deactivateCurrentTool(); return true; } return false; }
    },
    'pushPull': {
        activate: () => {
            if(uiApi && uiApi.setCanvasCursor) uiApi.setCanvasCursor('crosshair');
            console.log("PushPullTool activated");
            toolState.selectedObjectForPushPull = null;
            toolState.selectedFaceIndexForPushPull = -1;
             if(sceneApi && sceneApi.setOrbitControlsEnabled) sceneApi.setOrbitControlsEnabled(false);
        },
        deactivate: () => {
            if(uiApi && uiApi.setCanvasCursor) uiApi.setCanvasCursor('default');
            console.log("PushPullTool deactivated");
            if(sceneApi && sceneApi.setOrbitControlsEnabled) sceneApi.setOrbitControlsEnabled(true);
        },
        handleCanvasClick: (event, mouse, raycaster, camera) => {
            if(!sceneApi || !uiApi) return;
            // 1. Perform raycast to find intersected object and face
            const intersection = sceneApi.raycastForObjectAndFace(raycaster, mouse, camera); // sceneManager needs this

            if (intersection && intersection.object && intersection.face) {
                // Only allow push/pull on certain geometry types for now
                if (intersection.object.geometry && (intersection.object.geometry.type === 'PlaneGeometry' || intersection.object.geometry.type === 'BoxGeometry')) {
                    toolState.selectedObjectForPushPull = intersection.object;
                    toolState.selectedFaceIndexForPushPull = intersection.faceIndex;
                    toolState.pushPullFaceNormal = intersection.face.normal.clone();

                    uiApi.showExtrusionModal((height) => { // Callback for when height is entered
                        if (toolState.selectedObjectForPushPull && toolState.selectedFaceIndexForPushPull !== -1) {
                            // sceneManager needs a more robust extrude function
                            sceneApi.extrudeFace(toolState.selectedObjectForPushPull, toolState.selectedFaceIndexForPushPull, toolState.pushPullFaceNormal, height);
                            deactivateCurrentTool();
                        } else {
                            uiApi.showEditorMessageBox("No valid face selected for push/pull.", "error");
                        }
                    });
                } else {
                    uiApi.showEditorMessageBox("Push/Pull only works on planes or boxes.", "info");
                }
            } else {
                uiApi.showEditorMessageBox("No face found for Push/Pull. Click on a plane or box face.", "info");
            }
        },
        handleCanvasMouseMove: () => {},
        handleKeyDown: (event) => { if (event.key === 'Escape') { deactivateCurrentTool(); return true; } return false; }
    }
};

export function initToolManager(sceneManagerInstance, uiManagerInstance) {
    sceneApi = sceneManagerInstance;
    uiApi = uiManagerInstance;
    activeTool = null;
    toolState = {};
    console.log("ToolManager initialized.");
}

export function activateTool(toolName, options = {}) {
    if (activeTool && tools[activeTool] && tools[activeTool].deactivate) {
        tools[activeTool].deactivate();
    }
    activeTool = null;

    if (tools[toolName] && tools[toolName].activate) {
        activeTool = toolName;
        toolState = { ...options };
        tools[activeTool].activate();
        if (uiApi && uiApi.updateActiveToolButton) uiApi.updateActiveToolButton(toolName);
    } else {
        console.warn(`ToolManager: Tool "${toolName}" not found or has no activate method.`);
    }
}

export function deactivateCurrentTool() {
    if (activeTool && tools[activeTool] && tools[activeTool].deactivate) {
        tools[activeTool].deactivate();
    }
    const previouslyActive = activeTool;
    activeTool = null;
    toolState = {};
    if (uiApi && uiApi.updateActiveToolButton && previouslyActive) uiApi.updateActiveToolButton(null);
    console.log("ToolManager: Active tool deactivated:", previouslyActive);
}

export function handleCanvasClick(event, mouse, raycaster, camera, groundPlane) {
    if (activeTool && tools[activeTool] && tools[activeTool].handleCanvasClick) {
        tools[activeTool].handleCanvasClick(event, mouse, raycaster, camera, groundPlane);
        return true;
    }
    return false;
}

export function handleCanvasMouseMove(event, mouse, raycaster, camera, groundPlane) {
    if (activeTool && tools[activeTool] && tools[activeTool].handleCanvasMouseMove) {
        tools[activeTool].handleCanvasMouseMove(event, mouse, raycaster, camera, groundPlane);
        return true;
    }
    return false;
}

export function handleKeyDown(event) {
    if (activeTool && tools[activeTool] && tools[activeTool].handleKeyDown) {
        return tools[activeTool].handleKeyDown(event);
    }
    return false;
}

export function isToolActive() {
    return activeTool !== null;
}

console.log("toolManager.js loaded.");
