// --- Tool Manager ---
// Manages the active tool and its interaction with the scene and UI.

let sceneApi;
let uiApi;
let THREE; // To be set during init if needed, or assume global

let activeTool = null;
let toolState = {};

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
            if(!sceneApi || !uiApi || !THREE) { console.error("RectangleTool: Dependencies missing (THREE?)."); return; }

            const intersection = new THREE.Vector3(); // Requires THREE
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(groundPlane, intersection);

            if (!toolState.startPoint) {
                toolState.startPoint = intersection.clone();
                const points = [toolState.startPoint.clone(), toolState.startPoint.clone(), toolState.startPoint.clone(), toolState.startPoint.clone(), toolState.startPoint.clone()];
                const lineGeom = new THREE.BufferGeometry().setFromPoints(points); // Requires THREE
                const lineMat = new THREE.LineBasicMaterial({ color: 0x82aaff, transparent:true, opacity:0.7}); // Requires THREE
                toolState.previewLine = new THREE.Line(lineGeom, lineMat); // Requires THREE
                toolState.previewLine.name = "RectanglePreviewLine";
                if (sceneApi.addSceneObject) sceneApi.addSceneObject(toolState.previewLine);
                else console.error("RectangleTool: sceneApi.addSceneObject is missing.");
                if (uiApi.showEditorMessageBox) uiApi.showEditorMessageBox("Move to define size, click to set second corner.", "info");
            } else {
                const width = Math.abs(intersection.x - toolState.startPoint.x);
                const depth = Math.abs(intersection.z - toolState.startPoint.z);
                if (width > 0.01 && depth > 0.01) {
                    const centerX = (toolState.startPoint.x + intersection.x) / 2;
                    const centerZ = (toolState.startPoint.z + intersection.z) / 2;
                    if (sceneApi.addObject) {
                        sceneApi.addObject('Plane', {
                            name: "Drawn Rectangle",
                            width: width, height: depth,
                            position: [centerX, 0.01, centerZ],
                            rotation: [-Math.PI / 2, 0, 0]
                        });
                    } else { console.error("RectangleTool: sceneApi.addObject is missing."); }
                } else {
                    if (uiApi.showEditorMessageBox) uiApi.showEditorMessageBox("Rectangle too small.", "error");
                }
                deactivateCurrentTool();
            }
        },
        handleCanvasMouseMove: (event, mouse, raycaster, camera, groundPlane) => {
            if (!toolState.startPoint || !toolState.previewLine || !THREE) return;
            const intersection = new THREE.Vector3(); // Requires THREE
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(groundPlane, intersection);

            const p1 = toolState.startPoint;
            const p2 = intersection;
            const points = [ p1.x, 0.01, p1.z,  p2.x, 0.01, p1.z, p2.x, 0.01, p2.z, p1.x, 0.01, p2.z, p1.x, 0.01, p1.z ];
            toolState.previewLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); // Requires THREE
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
            toolState.pushPullFaceNormal = null;
            if(sceneApi && sceneApi.setOrbitControlsEnabled) sceneApi.setOrbitControlsEnabled(false);
        },
        deactivate: () => {
            if(uiApi && uiApi.setCanvasCursor) uiApi.setCanvasCursor('default');
            console.log("PushPullTool deactivated");
            if(sceneApi && sceneApi.setOrbitControlsEnabled) sceneApi.setOrbitControlsEnabled(true);
        },
        handleCanvasClick: (event, mouse, raycaster, camera) => {
            if(!sceneApi || !uiApi) { console.error("PushPullTool: Dependencies missing."); return; }

            const intersection = sceneApi.raycastForObjectAndFace(raycaster, mouse, camera);

            if (intersection && intersection.object && intersection.face) {
                const objectGeomType = intersection.object.geometry?.type;
                if (objectGeomType === 'PlaneGeometry' || objectGeomType === 'BoxGeometry') {
                    toolState.selectedObjectForPushPull = intersection.object;
                    toolState.selectedFaceIndexForPushPull = intersection.faceIndex;
                    toolState.pushPullFaceNormal = intersection.face.normal.clone(); // Already world normal

                    uiApi.showExtrusionModal((height) => {
                        if (toolState.selectedObjectForPushPull && toolState.selectedFaceIndexForPushPull !== -1 && toolState.pushPullFaceNormal) {
                            sceneApi.extrudeFace(toolState.selectedObjectForPushPull, toolState.selectedFaceIndexForPushPull, toolState.pushPullFaceNormal, height);
                            // Deactivate after successful extrusion or if modal is cancelled by other means
                            // deactivateCurrentTool(); // Deactivate on modal confirm/cancel instead
                        } else {
                            uiApi.showEditorMessageBox("No valid face/object state for push/pull.", "error");
                        }
                    }, () => deactivateCurrentTool()); // Pass cancel callback for extrusion modal
                } else {
                    uiApi.showEditorMessageBox("Push/Pull only works on selectable planes or boxes.", "info");
                }
            } else {
                uiApi.showEditorMessageBox("No face found for Push/Pull. Click on a plane or box face.", "info");
            }
        },
        handleCanvasMouseMove: () => {},
        handleKeyDown: (event) => { if (event.key === 'Escape') { deactivateCurrentTool(); return true; } return false; }
    }
};

export function initToolManager(sceneManagerInstance, uiManagerInstance, threeInstance = null) { // Accept THREE
    sceneApi = sceneManagerInstance;
    uiApi = uiManagerInstance;
    if (threeInstance) THREE = threeInstance; // Allow THREE to be injected if not global
    else if (typeof window.THREE !== 'undefined') THREE = window.THREE; // Fallback to global THREE
    else console.error("ToolManager: THREE.js instance not provided or found globally.");
    activeTool = null;
    toolState = {};
    console.log("ToolManager initialized.");
}

export function activateTool(toolName, options = {}) { /* ... (as before) ... */ }
export function deactivateCurrentTool() { /* ... (as before) ... */ }
export function handleCanvasClick(event, mouse, raycaster, camera, groundPlane) { /* ... (as before) ... */ }
export function handleCanvasMouseMove(event, mouse, raycaster, camera, groundPlane) { /* ... (as before) ... */ }
export function handleKeyDown(event) { /* ... (as before) ... */ }
export function isToolActive() { return activeTool !== null; }

console.log("toolManager.js loaded.");
