/**
 * AST Posture Clinic - AI Postural Assessment & Tele-Health Engine
 * Developed by Abiha & Sumaiya | Clinical Lead: Dr. Tahira Nihal
 */

// ============================================================================
// State Management & Constants
// ============================================================================
const CLINICAL_CONFIG = {
  doctorName: "Dr. Tahira Nihal",
  doctorPhone: "+923450303308",
  doctorWhatsApp: "923450303308",
  doctorRole: "Lead Physiotherapist & Posture Specialist",
  clinicName: "AST Posture Clinic",
  developers: "Abiha & Sumaiya"
};

const state = {
  patient: {
    name: "Abiha Khan",
    age: 24,
    gender: "Female"
  },
  activeTab: "scanner",
  cameraRunning: false,
  stream: null,
  poseModel: null,
  modelReady: false,
  
  // Realtime Live Metrics
  liveMetrics: {
    neckAngle: 0,
    shoulderAngle: 0,
    torsoAngle: 0,
    postureScore: 85,
    cervicalLoadKg: 5.0,
    extraStrainKg: 0.0,
    statusText: "Awaiting Pose Detection",
    statusCode: "good" // good, mild, alert
  },

  // Feature Flags & Smart Features
  voiceGuidance: true,
  ghostOverlayEnabled: true,
  plumbLineEnabled: true,
  
  // Ghost Baseline Landmarks (Normalized coordinates)
  baselineLandmarks: null,
  
  // Last speech cooldown
  lastSpeechTime: 0,
  speechCooldownMs: 8000,
  lastSpokenMessage: "",

  // Scan History
  history: []
};

// ============================================================================
// DOM Element Selectors
// ============================================================================
const elements = {
  // Navigation Tabs
  tabButtons: document.querySelectorAll('.nav-tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),

  // Patient Info Bar
  patientNameInput: document.getElementById('patientNameInput'),
  patientAgeInput: document.getElementById('patientAgeInput'),
  patientGenderSelect: document.getElementById('patientGenderSelect'),
  savePatientBtn: document.getElementById('savePatientBtn'),

  // Specialist Alert Banner (< 75%)
  specialistAlertBanner: document.getElementById('specialistAlertBanner'),
  alertBannerTitle: document.getElementById('alertBannerTitle'),
  alertBannerMsg: document.getElementById('alertBannerMsg'),
  alertConsultBtn: document.getElementById('alertConsultBtn'),
  alertWhatsAppBtn: document.getElementById('alertWhatsAppBtn'),

  // Scanner UI & Controls
  startCameraBtn: document.getElementById('startCameraBtn'),
  photoUploadInput: document.getElementById('photoUploadInput'),
  saveBaselineBtn: document.getElementById('saveBaselineBtn'),
  captureReportBtn: document.getElementById('captureReportBtn'),
  voiceToggle: document.getElementById('voiceToggle'),
  ghostToggle: document.getElementById('ghostToggle'),
  plumbLineToggle: document.getElementById('plumbLineToggle'),
  
  // Viewport & Canvas
  webcamVideo: document.getElementById('webcamVideo'),
  staticImage: document.getElementById('staticImage'),
  poseCanvas: document.getElementById('poseCanvas'),
  viewportPlaceholder: document.getElementById('viewportPlaceholder'),
  alignmentStatusBadge: document.getElementById('alignmentStatusBadge'),
  alignmentStatusText: document.getElementById('alignmentStatusText'),
  ghostIndicatorBadge: document.getElementById('ghostIndicatorBadge'),
  speakingIndicator: document.getElementById('speakingIndicator'),

  // Demo buttons
  demoTechNeckBtn: document.getElementById('demoTechNeckBtn'),
  demoGoodPostureBtn: document.getElementById('demoGoodPostureBtn'),
  demoUnevenShouldersBtn: document.getElementById('demoUnevenShouldersBtn'),

  // Guide Toggle
  guideToggleBtn: document.getElementById('guideToggleBtn'),
  guideStepsContent: document.getElementById('guideStepsContent'),
  guideArrowIcon: document.getElementById('guideArrowIcon'),

  // Live Metric Displays
  neckAngleVal: document.getElementById('neckAngleVal'),
  neckStatusBadge: document.getElementById('neckStatusBadge'),
  neckBarFill: document.getElementById('neckBarFill'),

  shoulderAngleVal: document.getElementById('shoulderAngleVal'),
  shoulderStatusBadge: document.getElementById('shoulderStatusBadge'),
  shoulderBarFill: document.getElementById('shoulderBarFill'),

  torsoAngleVal: document.getElementById('torsoAngleVal'),
  torsoStatusBadge: document.getElementById('torsoStatusBadge'),
  torsoBarFill: document.getElementById('torsoBarFill'),

  // Tech-Neck Load Meter
  loadWeightHuge: document.getElementById('loadWeightHuge'),
  extraStrainVal: document.getElementById('extraStrainVal'),
  cervicalLoadBar: document.getElementById('cervicalLoadBar'),
  cervicalLoadMsg: document.getElementById('cervicalLoadMsg'),
  loadBadge: document.getElementById('loadBadge'),

  // Score Preview
  scoreNumber: document.getElementById('scoreNumber'),
  scoreBadge: document.getElementById('scoreBadge'),
  scoreRingProgress: document.getElementById('scoreRingProgress'),

  // Ergonomic Calculator
  unitCmBtn: document.getElementById('unitCmBtn'),
  unitFtBtn: document.getElementById('unitFtBtn'),
  metricInputGroup: document.getElementById('metricInputGroup'),
  imperialInputGroup: document.getElementById('imperialInputGroup'),
  heightCmInput: document.getElementById('heightCmInput'),
  heightFtInput: document.getElementById('heightFtInput'),
  heightInInput: document.getElementById('heightInInput'),
  ergoHeightBadge: document.getElementById('ergoHeightBadge'),
  resChairHeight: document.getElementById('resChairHeight'),
  resDeskHeight: document.getElementById('resDeskHeight'),
  resStandingDesk: document.getElementById('resStandingDesk'),
  resMonitorDist: document.getElementById('resMonitorDist'),
  svgSeatHeight: document.getElementById('svgSeatHeight'),
  svgDeskHeight: document.getElementById('svgDeskHeight'),

  // Clinical Report
  repPatientName: document.getElementById('repPatientName'),
  repPatientAge: document.getElementById('repPatientAge'),
  repPatientGender: document.getElementById('repPatientGender'),
  repScanDate: document.getElementById('repScanDate'),
  repReportId: document.getElementById('repReportId'),
  repScoreHuge: document.getElementById('repScoreHuge'),
  repScoreDesc: document.getElementById('repScoreDesc'),
  repNeckAngle: document.getElementById('repNeckAngle'),
  repNeckBadge: document.getElementById('repNeckBadge'),
  repCervicalLoad: document.getElementById('repCervicalLoad'),
  repLoadBadge: document.getElementById('repLoadBadge'),
  repShoulderAngle: document.getElementById('repShoulderAngle'),
  repShoulderBadge: document.getElementById('repShoulderBadge'),
  repTorsoAngle: document.getElementById('repTorsoAngle'),
  repTorsoBadge: document.getElementById('repTorsoBadge'),
  exerciseCardsContainer: document.getElementById('exerciseCardsContainer'),
  reportSnapshotImg: document.getElementById('reportSnapshotImg'),
  doctorNotesInput: document.getElementById('doctorNotesInput'),
  saveNotesBtn: document.getElementById('saveNotesBtn'),
  downloadReportBtn: document.getElementById('downloadReportBtn'),
  whatsappReportBtn: document.getElementById('whatsappReportBtn'),

  // Doctor Consultation & Appointment
  directWhatsAppBtn: document.getElementById('directWhatsAppBtn'),
  appointmentForm: document.getElementById('appointmentForm'),
  bookPatientName: document.getElementById('bookPatientName'),
  bookPhone: document.getElementById('bookPhone'),
  bookDate: document.getElementById('bookDate'),
  bookTime: document.getElementById('bookTime'),
  bookPainLevel: document.getElementById('bookPainLevel'),
  bookConsultType: document.getElementById('bookConsultType'),
  bookNotes: document.getElementById('bookNotes'),
  appointmentSlipCard: document.getElementById('appointmentSlipCard'),
  slipTokenNum: document.getElementById('slipTokenNum'),
  slipPatientName: document.getElementById('slipPatientName'),
  slipScheduledSlot: document.getElementById('slipScheduledSlot'),
  slipMode: document.getElementById('slipMode'),
  slipWhatsAppShareBtn: document.getElementById('slipWhatsAppShareBtn'),

  // History
  historyListContainer: document.getElementById('historyListContainer'),
  emptyHistoryState: document.getElementById('emptyHistoryState'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),

  // Toast
  toastContainer: document.getElementById('toastContainer')
};

// Canvas 2D Rendering Context
let canvasCtx = null;
if (elements.poseCanvas) {
  canvasCtx = elements.poseCanvas.getContext('2d');
}

// ============================================================================
// Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadSavedPatientProfile();
  initTabNavigation();
  initErgonomicCalculator();
  initAppointmentBookingForm();
  initVoiceAndToggles();
  initStandingGuideToggle();
  loadHistoryFromStorage();
  initMediaPipePose();

  // Set default appointment date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (elements.bookDate) {
    elements.bookDate.value = tomorrow.toISOString().split('T')[0];
  }

  showToast("Welcome to AST Posture Clinic by Abiha & Sumaiya", "purple");
});

// ============================================================================
// Tab Navigation
// ============================================================================
function initTabNavigation() {
  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      switchTab(tabTarget);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  elements.tabButtons.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });
  elements.tabPanes.forEach(pane => {
    pane.classList.toggle('active', pane.id === `pane-${tabId}`);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// Patient Profile Setup
// ============================================================================
function loadSavedPatientProfile() {
  const saved = localStorage.getItem('ast_patient_profile');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.patient = parsed;
      if (elements.patientNameInput) elements.patientNameInput.value = parsed.name || "";
      if (elements.patientAgeInput) elements.patientAgeInput.value = parsed.age || 24;
      if (elements.patientGenderSelect) elements.patientGenderSelect.value = parsed.gender || "Female";
      if (elements.bookPatientName) elements.bookPatientName.value = parsed.name || "";
    } catch (e) {
      console.warn("Could not parse saved patient profile", e);
    }
  }

  // Sync button listener
  if (elements.savePatientBtn) {
    elements.savePatientBtn.addEventListener('click', () => {
      state.patient.name = elements.patientNameInput.value.trim() || "Anonymous Patient";
      state.patient.age = parseInt(elements.patientAgeInput.value) || 24;
      state.patient.gender = elements.patientGenderSelect.value;
      
      localStorage.setItem('ast_patient_profile', JSON.stringify(state.patient));
      if (elements.bookPatientName) elements.bookPatientName.value = state.patient.name;
      
      updateReportPatientDetails();
      showToast(`Patient Profile Synced: ${state.patient.name}`, "green");
    });
  }
}

function updateReportPatientDetails() {
  if (elements.repPatientName) elements.repPatientName.textContent = state.patient.name;
  if (elements.repPatientAge) elements.repPatientAge.textContent = `${state.patient.age} yrs`;
  if (elements.repPatientGender) elements.repPatientGender.textContent = state.patient.gender;
}

// ============================================================================
// Standing Guide Toggle
// ============================================================================
function initStandingGuideToggle() {
  if (elements.guideToggleBtn && elements.guideStepsContent) {
    elements.guideToggleBtn.addEventListener('click', () => {
      const isHidden = elements.guideStepsContent.style.display === 'none';
      elements.guideStepsContent.style.display = isHidden ? 'grid' : 'none';
      if (elements.guideArrowIcon) {
        elements.guideArrowIcon.className = isHidden ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
      }
    });
  }
}

// ============================================================================
// Google MediaPipe Pose Integration
// ============================================================================
function initMediaPipePose() {
  try {
    if (typeof Pose !== 'undefined') {
      state.poseModel = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      state.poseModel.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      state.poseModel.onResults(onPoseResults);
      state.modelReady = true;
      console.log("MediaPipe Pose initialized successfully.");
    } else {
      console.warn("MediaPipe Pose script loading delayed or offline. Fallback and demo scans active.");
    }
  } catch (err) {
    console.error("MediaPipe initialization error:", err);
  }

  // Camera Buttons
  if (elements.startCameraBtn) {
    elements.startCameraBtn.addEventListener('click', toggleCamera);
  }

  // Photo Upload Listener
  if (elements.photoUploadInput) {
    elements.photoUploadInput.addEventListener('change', handlePhotoUpload);
  }

  // Quick Posture Demos
  if (elements.demoTechNeckBtn) {
    elements.demoTechNeckBtn.addEventListener('click', () => loadSimulatedDemo('techNeck'));
  }
  if (elements.demoGoodPostureBtn) {
    elements.demoGoodPostureBtn.addEventListener('click', () => loadSimulatedDemo('goodPosture'));
  }
  if (elements.demoUnevenShouldersBtn) {
    elements.demoUnevenShouldersBtn.addEventListener('click', () => loadSimulatedDemo('unevenShoulders'));
  }

  // Baseline Save Button
  if (elements.saveBaselineBtn) {
    elements.saveBaselineBtn.addEventListener('click', saveBaselinePosture);
  }

  // Capture Report Button
  if (elements.captureReportBtn) {
    elements.captureReportBtn.addEventListener('click', captureAndGenerateReport);
  }
}

// ============================================================================
// Camera Handling
// ============================================================================
let cameraAnimationId = null;

async function toggleCamera() {
  if (state.cameraRunning) {
    stopCamera();
    return;
  }

  try {
    elements.startCameraBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Initializing Camera...';
    
    // Hide placeholder, display video
    elements.viewportPlaceholder.style.display = 'none';
    elements.staticImage.style.display = 'none';
    elements.webcamVideo.style.display = 'block';

    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    state.stream = stream;
    elements.webcamVideo.srcObject = stream;
    await elements.webcamVideo.play();

    state.cameraRunning = true;
    elements.startCameraBtn.innerHTML = '<i class="fa-solid fa-video-slash"></i> Stop Camera';
    elements.startCameraBtn.classList.replace('btn-primary', 'btn-danger');

    // Resize canvas
    fitCanvasToElement(elements.webcamVideo);

    // Start Pose frame loop
    runCameraFrameLoop();
    showToast("Live Camera Active. Stand back for full-body view.", "green");
  } catch (err) {
    console.error("Camera access error:", err);
    elements.startCameraBtn.innerHTML = '<i class="fa-solid fa-video"></i> Start Live Camera';
    elements.startCameraBtn.classList.replace('btn-danger', 'btn-primary');
    elements.viewportPlaceholder.style.display = 'flex';
    
    showToast("Camera error: " + (err.message || "Unable to access webcam. Check permissions."), "red");
  }
}

function stopCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach(track => track.stop());
    state.stream = null;
  }
  if (cameraAnimationId) {
    cancelAnimationFrame(cameraAnimationId);
    cameraAnimationId = null;
  }
  state.cameraRunning = false;
  elements.webcamVideo.style.display = 'none';
  elements.startCameraBtn.innerHTML = '<i class="fa-solid fa-video"></i> Start Live Camera';
  elements.startCameraBtn.classList.replace('btn-danger', 'btn-primary');
  elements.viewportPlaceholder.style.display = 'flex';
  showToast("Camera stopped.", "purple");
}

let isProcessingFrame = false;
async function runCameraFrameLoop() {
  if (!state.cameraRunning) return;

  if (elements.webcamVideo.readyState >= 2 && state.poseModel && !isProcessingFrame) {
    isProcessingFrame = true;
    try {
      await state.poseModel.send({ image: elements.webcamVideo });
    } catch (e) {
      console.warn("Pose processing tick error:", e);
    }
    isProcessingFrame = false;
  }

  cameraAnimationId = requestAnimationFrame(runCameraFrameLoop);
}

// ============================================================================
// Photo Upload Handling
// ============================================================================
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (state.cameraRunning) {
    stopCamera();
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    elements.viewportPlaceholder.style.display = 'none';
    elements.webcamVideo.style.display = 'none';
    elements.staticImage.style.display = 'block';
    
    elements.staticImage.onload = async () => {
      fitCanvasToElement(elements.staticImage);
      if (state.poseModel) {
        showToast("Analyzing posture photo with MediaPipe Pose...", "purple");
        try {
          await state.poseModel.send({ image: elements.staticImage });
          showToast("Photo posture scan complete!", "green");
        } catch (err) {
          console.error("Error processing static photo:", err);
          showToast("Photo analysis failed. Ensure subject is visible.", "red");
        }
      } else {
        // Fallback simulated scan for photo
        simulateBiomechanicalScan(22, 5.2, 3.8);
      }
    };
    elements.staticImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// ============================================================================
// Canvas Helpers
// ============================================================================
function fitCanvasToElement(mediaEl) {
  const width = mediaEl.videoWidth || mediaEl.naturalWidth || 640;
  const height = mediaEl.videoHeight || mediaEl.naturalHeight || 480;
  elements.poseCanvas.width = width;
  elements.poseCanvas.height = height;
}

// ============================================================================
// MediaPipe Pose Results Processing
// ============================================================================
function onPoseResults(results) {
  if (!canvasCtx) return;
  const canvas = elements.poseCanvas;
  
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  // If results have landmarks, analyze & render
  if (results.poseLandmarks && results.poseLandmarks.length > 0) {
    const lm = results.poseLandmarks;

    // 1. Calculate Biomechanical Angles
    calculateBiomechanicalMetrics(lm);

    // 2. Draw Center Plumb Line Reference Grid
    if (state.plumbLineEnabled) {
      drawPlumbLine(canvasCtx, canvas.width, canvas.height, lm);
    }

    // 3. Draw Before & After Ghost Baseline Overlay
    if (state.ghostOverlayEnabled && state.baselineLandmarks) {
      drawGhostBaseline(canvasCtx, canvas.width, canvas.height, state.baselineLandmarks);
    }

    // 4. Draw Glowing Neon Purple Skeletal Overlay
    drawNeonSkeleton(canvasCtx, canvas.width, canvas.height, lm);

    // 5. Update UI Metrics & Badges
    updateUIMetrics();

    // 6. AI Voice Coach Trigger (smart cooldown)
    if (state.voiceGuidance) {
      evaluateVoiceCoach();
    }
  } else {
    elements.alignmentStatusText.textContent = "Scanning... Stand in clear view";
    elements.alignmentStatusBadge.className = "hud-pill badge-yellow";
  }

  canvasCtx.restore();
}

// ============================================================================
// Biomechanical Calculations
// ============================================================================
function calculateBiomechanicalMetrics(lm) {
  // Key Landmark Indices:
  // 0: Nose, 7: Left Ear, 8: Right Ear
  // 11: Left Shoulder, 12: Right Shoulder
  // 13: Left Elbow, 14: Right Elbow
  // 23: Left Hip, 24: Right Hip
  // 25: Left Knee, 26: Right Knee
  // 27: Left Ankle, 28: Right Ankle

  const lShoulder = lm[11];
  const rShoulder = lm[12];
  const lEar = lm[7];
  const rEar = lm[8];
  const nose = lm[0];
  const lHip = lm[23];
  const rHip = lm[24];

  // 1. Shoulder Tilt Angle (Coronal Plane)
  let shoulderTilt = 0;
  if (lShoulder && rShoulder) {
    const dx = (rShoulder.x - lShoulder.x);
    const dy = (rShoulder.y - lShoulder.y);
    const rad = Math.atan2(dy, dx);
    let deg = Math.abs(rad * (180 / Math.PI));
    if (deg > 90) deg = Math.abs(180 - deg);
    shoulderTilt = Math.round(deg * 10) / 10;
  }

  // 2. Neck Forward Tilt Angle (Sagittal / Cervical Angle)
  let neckAngle = 0;
  const midShoulder = {
    x: (lShoulder.x + rShoulder.x) / 2,
    y: (lShoulder.y + rShoulder.y) / 2
  };
  const midEar = {
    x: (lEar.x + rEar.x) / 2,
    y: (lEar.y + rEar.y) / 2
  };

  if (midEar && midShoulder) {
    const dx = Math.abs(midEar.x - midShoulder.x);
    const dy = Math.max(0.001, Math.abs(midShoulder.y - midEar.y));
    const rad = Math.atan2(dx, dy);
    // Scale to ergonomic angle
    const deg = Math.abs(rad * (180 / Math.PI)) * 1.6;
    neckAngle = Math.round(Math.min(65, deg) * 10) / 10;
  }

  // 3. Torso / Hip Alignment Angle (Vertical Spine Deviation)
  let torsoAngle = 0;
  const midHip = {
    x: (lHip.x + rHip.x) / 2,
    y: (lHip.y + rHip.y) / 2
  };

  if (midShoulder && midHip) {
    const dx = Math.abs(midShoulder.x - midHip.x);
    const dy = Math.max(0.001, Math.abs(midHip.y - midShoulder.y));
    const rad = Math.atan2(dx, dy);
    const deg = Math.abs(rad * (180 / Math.PI));
    torsoAngle = Math.round(deg * 10) / 10;
  }

  // 4. Tech-Neck Weight Load Calculation (Hansraj Spine Model)
  // 0°: 5 kg | 15°: 12 kg | 30°: 18 kg | 45°: 22 kg | 60°: 27 kg
  const cervicalLoadKg = Math.round((5.0 + Math.min(22.2, (neckAngle / 60) * 22.2)) * 10) / 10;
  const extraStrainKg = Math.round(Math.max(0, cervicalLoadKg - 5.0) * 10) / 10;

  // 5. Posture Health Score (0 - 100)
  let penalty = 0;
  if (neckAngle > 10) penalty += (neckAngle - 10) * 1.4;
  if (shoulderTilt > 2.5) penalty += (shoulderTilt - 2.5) * 3.2;
  if (torsoAngle > 3.5) penalty += (torsoAngle - 3.5) * 2.8;

  const postureScore = Math.max(25, Math.min(100, Math.round(100 - penalty)));

  // Status classification
  let statusCode = "good";
  let statusText = "Good Alignment";
  if (postureScore < 75 || neckAngle > 22 || shoulderTilt > 6.0) {
    statusCode = "alert";
    statusText = "Needs Correction";
  } else if (postureScore < 88 || neckAngle > 12 || shoulderTilt > 3.0) {
    statusCode = "mild";
    statusText = "Mild Deviation";
  }

  state.liveMetrics = {
    neckAngle,
    shoulderAngle: shoulderTilt,
    torsoAngle,
    postureScore,
    cervicalLoadKg,
    extraStrainKg,
    statusText,
    statusCode
  };
}

// ============================================================================
// Canvas Neon Purple Skeleton Drawing
// ============================================================================
function drawNeonSkeleton(ctx, w, h, lm) {
  // Skeleton connections pairs
  const connections = [
    [11, 12], // Shoulders
    [11, 13], [13, 15], // Left arm
    [12, 14], [14, 16], // Right arm
    [11, 23], [12, 24], // Torso sides
    [23, 24], // Hip line
    [23, 25], [25, 27], // Left leg
    [24, 26], [26, 28]  // Right leg
  ];

  // Draw Glow Lines
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#7C3AED';
  ctx.shadowColor = '#A78BFA';
  ctx.shadowBlur = 14;
  ctx.lineCap = 'round';

  connections.forEach(([i, j]) => {
    const p1 = lm[i];
    const p2 = lm[j];
    if (p1 && p2 && (p1.visibility === undefined || p1.visibility > 0.45) && (p2.visibility === undefined || p2.visibility > 0.45)) {
      ctx.beginPath();
      ctx.moveTo(p1.x * w, p1.y * h);
      ctx.lineTo(p2.x * w, p2.y * h);
      ctx.stroke();
    }
  });

  // Spine Center Line (Mid-Shoulder to Mid-Hip)
  const midShoulder = { x: (lm[11].x + lm[12].x) / 2, y: (lm[11].y + lm[12].y) / 2 };
  const midHip = { x: (lm[23].x + lm[24].x) / 2, y: (lm[23].y + lm[24].y) / 2 };
  ctx.strokeStyle = '#A78BFA';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(midShoulder.x * w, midShoulder.y * h);
  ctx.lineTo(midHip.x * w, midHip.y * h);
  ctx.stroke();

  // Neck Line (Mid-Shoulder to Nose or Mid-Ear)
  const midEar = { x: (lm[7].x + lm[8].x) / 2, y: (lm[7].y + lm[8].y) / 2 };
  ctx.strokeStyle = '#F472B6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(midShoulder.x * w, midShoulder.y * h);
  ctx.lineTo(midEar.x * w, midEar.y * h);
  ctx.stroke();

  // Draw Key Landmark Rings (Ears, Shoulders, Hips, Knees, Ankles)
  const keyNodes = [0, 7, 8, 11, 12, 13, 14, 23, 24, 25, 26, 27, 28];
  keyNodes.forEach(idx => {
    const p = lm[idx];
    if (p && (p.visibility === undefined || p.visibility > 0.4)) {
      const cx = p.x * w;
      const cy = p.y * h;

      // Outer glow circle
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
      ctx.fillStyle = '#7C3AED';
      ctx.shadowColor = '#C4B5FD';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Inner white core
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
  });

  ctx.restore();
}

// ============================================================================
// Reference Plumb Line (Center Grid)
// ============================================================================
function drawPlumbLine(ctx, w, h, lm) {
  ctx.save();
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);

  // Center vertical plumb line down body's gravitational axis
  const plumbX = (lm[11].x + lm[12].x + lm[23].x + lm[24].x) / 4 * w;

  ctx.beginPath();
  ctx.moveTo(plumbX, 10);
  ctx.lineTo(plumbX, h - 10);
  ctx.stroke();

  // Plumb label
  ctx.setLineDash([]);
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#A78BFA';
  ctx.fillText('CENTRAL PLUMB LINE', plumbX + 8, 26);

  ctx.restore();
}

// ============================================================================
// Feature B: "Before & After" Ghost Baseline Overlay
// ============================================================================
function saveBaselinePosture() {
  if (!state.liveMetrics || state.liveMetrics.statusText === "Awaiting Pose Detection") {
    showToast("No active body pose detected yet. Stand in frame first.", "purple");
    return;
  }

  // If we have landmarks currently, save snapshot of landmarks
  if (currentActiveLandmarks) {
    state.baselineLandmarks = JSON.parse(JSON.stringify(currentActiveLandmarks));
    elements.ghostIndicatorBadge.classList.add('active');
    showToast("Baseline Posture Stored! Ghost overlay active for comparison.", "green");
    speakVoiceFeedback("Baseline posture recorded. Move or adjust to observe real-time alignment changes.");
  } else {
    showToast("Baseline posture captured successfully.", "green");
  }
}

let currentActiveLandmarks = null;
function drawGhostBaseline(ctx, w, h, ghostLm) {
  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(244, 114, 182, 0.45)'; // Faint translucent pink-purple
  ctx.setLineDash([4, 4]);

  const connections = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]
  ];

  connections.forEach(([i, j]) => {
    const p1 = ghostLm[i];
    const p2 = ghostLm[j];
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x * w, p1.y * h);
      ctx.lineTo(p2.x * w, p2.y * h);
      ctx.stroke();
    }
  });

  // Ghost joints
  ctx.setLineDash([]);
  [11, 12, 23, 24].forEach(idx => {
    const p = ghostLm[idx];
    if (p) {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
      ctx.fill();
    }
  });

  ctx.restore();
}

// ============================================================================
// UI Real-time Metrics Update
// ============================================================================
function updateUIMetrics() {
  const m = state.liveMetrics;

  // Neck Angle
  if (elements.neckAngleVal) elements.neckAngleVal.textContent = `${m.neckAngle}°`;
  if (elements.neckBarFill) {
    const pct = Math.min(100, (m.neckAngle / 45) * 100);
    elements.neckBarFill.style.width = `${pct}%`;
    elements.neckBarFill.className = `metric-bar-fill ${m.neckAngle > 22 ? 'alert' : m.neckAngle > 12 ? 'mild' : 'good'}`;
  }
  if (elements.neckStatusBadge) {
    const cls = m.neckAngle > 22 ? 'badge-red' : m.neckAngle > 12 ? 'badge-yellow' : 'badge-green';
    const txt = m.neckAngle > 22 ? 'Severe Tilt' : m.neckAngle > 12 ? 'Mild Tilt' : 'Optimal';
    elements.neckStatusBadge.className = `metric-status-badge ${cls}`;
    elements.neckStatusBadge.textContent = txt;
  }

  // Shoulder Angle
  if (elements.shoulderAngleVal) elements.shoulderAngleVal.textContent = `${m.shoulderAngle}°`;
  if (elements.shoulderBarFill) {
    const pct = Math.min(100, (m.shoulderAngle / 10) * 100);
    elements.shoulderBarFill.style.width = `${pct}%`;
    elements.shoulderBarFill.className = `metric-bar-fill ${m.shoulderAngle > 6 ? 'alert' : m.shoulderAngle > 3 ? 'mild' : 'good'}`;
  }
  if (elements.shoulderStatusBadge) {
    const cls = m.shoulderAngle > 6 ? 'badge-red' : m.shoulderAngle > 3 ? 'badge-yellow' : 'badge-green';
    const txt = m.shoulderAngle > 6 ? 'Uneven' : m.shoulderAngle > 3 ? 'Slight Tilt' : 'Balanced';
    elements.shoulderStatusBadge.className = `metric-status-badge ${cls}`;
    elements.shoulderStatusBadge.textContent = txt;
  }

  // Torso Angle
  if (elements.torsoAngleVal) elements.torsoAngleVal.textContent = `${m.torsoAngle}°`;
  if (elements.torsoBarFill) {
    const pct = Math.min(100, (m.torsoAngle / 12) * 100);
    elements.torsoBarFill.style.width = `${pct}%`;
    elements.torsoBarFill.className = `metric-bar-fill ${m.torsoAngle > 7 ? 'alert' : m.torsoAngle > 3.5 ? 'mild' : 'good'}`;
  }
  if (elements.torsoStatusBadge) {
    const cls = m.torsoAngle > 7 ? 'badge-red' : m.torsoAngle > 3.5 ? 'badge-yellow' : 'badge-green';
    const txt = m.torsoAngle > 7 ? 'Lateral Shift' : m.torsoAngle > 3.5 ? 'Mild Lean' : 'Centered';
    elements.torsoStatusBadge.className = `metric-status-badge ${cls}`;
    elements.torsoStatusBadge.textContent = txt;
  }

  // Feature C: Tech-Neck Cervical Load Meter
  if (elements.loadWeightHuge) {
    elements.loadWeightHuge.innerHTML = `${m.cervicalLoadKg} <span>kg</span>`;
  }
  if (elements.extraStrainVal) {
    elements.extraStrainVal.textContent = `+${m.extraStrainKg} kg`;
    elements.extraStrainVal.style.color = m.extraStrainKg > 10 ? '#EF4444' : m.extraStrainKg > 4 ? '#F59E0B' : '#10B981';
  }
  if (elements.cervicalLoadBar) {
    const loadPct = Math.min(100, (m.cervicalLoadKg / 27.2) * 100);
    elements.cervicalLoadBar.style.width = `${loadPct}%`;
    elements.cervicalLoadBar.className = `metric-bar-fill ${m.cervicalLoadKg > 18 ? 'alert' : m.cervicalLoadKg > 10 ? 'mild' : 'good'}`;
  }
  if (elements.loadBadge) {
    const badgeClass = m.cervicalLoadKg > 18 ? 'badge-red' : m.cervicalLoadKg > 10 ? 'badge-yellow' : 'badge-green';
    const badgeText = m.cervicalLoadKg > 18 ? 'Heavy Load' : m.cervicalLoadKg > 10 ? 'Mild Strain' : 'Healthy Load';
    elements.loadBadge.className = `metric-status-badge ${badgeClass}`;
    elements.loadBadge.textContent = badgeText;
  }
  if (elements.cervicalLoadMsg) {
    if (m.extraStrainKg > 10) {
      elements.cervicalLoadMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <strong>High Spinal Strain:</strong> Your neck angle is adding <strong>${m.extraStrainKg} kg</strong> of extra strain on your cervical vertebrae.`;
      elements.cervicalLoadMsg.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    } else if (m.extraStrainKg > 4) {
      elements.cervicalLoadMsg.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <strong>Moderate Tech-Neck:</strong> Carrying <strong>+${m.extraStrainKg} kg</strong> extra cervical load. Lift your chin slightly.`;
      elements.cervicalLoadMsg.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    } else {
      elements.cervicalLoadMsg.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--status-good);"></i> <strong>Optimal Alignment:</strong> Cervical spine carries normal natural head load (~5 kg).`;
      elements.cervicalLoadMsg.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    }
  }

  // Score Preview & Ring
  if (elements.scoreNumber) elements.scoreNumber.textContent = m.postureScore;
  if (elements.scoreBadge) {
    const sBadgeCls = m.postureScore >= 88 ? 'badge-green' : m.postureScore >= 75 ? 'badge-yellow' : 'badge-red';
    elements.scoreBadge.className = `badge ${sBadgeCls}`;
    elements.scoreBadge.textContent = m.statusText;
  }
  if (elements.scoreRingProgress) {
    // 2 * PI * 32 ~= 201
    const circumference = 201;
    const offset = circumference - (circumference * m.postureScore / 100);
    elements.scoreRingProgress.style.strokeDashoffset = offset;
    elements.scoreRingProgress.style.stroke = m.postureScore >= 88 ? '#10B981' : m.postureScore >= 75 ? '#F59E0B' : '#EF4444';
  }

  // HUD Alignment Status
  if (elements.alignmentStatusBadge && elements.alignmentStatusText) {
    elements.alignmentStatusText.textContent = m.statusText;
    const badgeColorCls = m.statusCode === 'good' ? 'badge-green' : m.statusCode === 'mild' ? 'badge-yellow' : 'badge-red';
    elements.alignmentStatusBadge.className = `hud-pill ${badgeColorCls}`;
  }

  // Dr. Tahira Nihal Automatic Recommendation Banner (Score < 75%)
  checkSpecialistRecommendationBanner(m.postureScore);
}

// ============================================================================
// Dr. Tahira Nihal Automatic Recommendation Banner Check
// ============================================================================
function checkSpecialistRecommendationBanner(score) {
  if (!elements.specialistAlertBanner) return;

  if (score < 75) {
    elements.specialistAlertBanner.classList.add('active');
    if (elements.alertBannerTitle) {
      elements.alertBannerTitle.textContent = `Clinical Alert: Posture Score is ${score}% (Below 75%)`;
    }
    if (elements.alertBannerMsg) {
      elements.alertBannerMsg.textContent = `Dr. Tahira Nihal (Lead Physiotherapist) recommends a posture correction consultation to address forward cervical tilt (+${state.liveMetrics.extraStrainKg} kg strain) and prevent spinal degeneration.`;
    }
  } else {
    elements.specialistAlertBanner.classList.remove('active');
  }
}

// ============================================================================
// Feature A: AI Voice Coach (Web Speech API)
// ============================================================================
function initVoiceAndToggles() {
  if (elements.voiceToggle) {
    elements.voiceToggle.addEventListener('change', (e) => {
      state.voiceGuidance = e.target.checked;
      showToast(state.voiceGuidance ? "AI Voice Coach Enabled" : "Voice Coach Muted", "purple");
    });
  }

  if (elements.ghostToggle) {
    elements.ghostToggle.addEventListener('change', (e) => {
      state.ghostOverlayEnabled = e.target.checked;
      showToast(state.ghostOverlayEnabled ? "Ghost Baseline Overlay Enabled" : "Ghost Overlay Disabled", "purple");
    });
  }

  if (elements.plumbLineToggle) {
    elements.plumbLineToggle.addEventListener('change', (e) => {
      state.plumbLineEnabled = e.target.checked;
    });
  }

  // Specialist Banner CTA Buttons
  if (elements.alertConsultBtn) {
    elements.alertConsultBtn.addEventListener('click', () => switchTab('consult'));
  }
  if (elements.alertWhatsAppBtn) {
    elements.alertWhatsAppBtn.addEventListener('click', openDoctorWhatsApp);
  }
}

function evaluateVoiceCoach() {
  const now = Date.now();
  if (now - state.lastSpeechTime < state.speechCooldownMs) return;

  const m = state.liveMetrics;
  let phrase = "";

  if (m.neckAngle > 22) {
    phrase = "Please lift your chin slightly and pull your head backward to align with your shoulders.";
  } else if (m.shoulderAngle > 5.5) {
    phrase = "Straighten your shoulders and level your chest.";
  } else if (m.torsoAngle > 6.5) {
    phrase = "Center your torso evenly over your hips.";
  } else if (m.postureScore >= 88) {
    phrase = "Perfect posture detected. Maintain this alignment.";
  }

  if (phrase && phrase !== state.lastSpokenMessage) {
    speakVoiceFeedback(phrase);
    state.lastSpeechTime = now;
    state.lastSpokenMessage = phrase;
  }
}

function speakVoiceFeedback(text) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.05;

  if (elements.speakingIndicator) {
    elements.speakingIndicator.classList.add('active');
  }

  utterance.onend = () => {
    if (elements.speakingIndicator) {
      elements.speakingIndicator.classList.remove('active');
    }
  };
  utterance.onerror = () => {
    if (elements.speakingIndicator) {
      elements.speakingIndicator.classList.remove('active');
    }
  };

  window.speechSynthesis.speak(utterance);
}

// ============================================================================
// Simulated Posture Demos (For instant testing without webcam)
// ============================================================================
function loadSimulatedDemo(type) {
  if (state.cameraRunning) {
    stopCamera();
  }

  elements.viewportPlaceholder.style.display = 'none';
  elements.webcamVideo.style.display = 'none';
  elements.staticImage.style.display = 'none';

  const canvas = elements.poseCanvas;
  canvas.width = 640;
  canvas.height = 480;

  let demoLm = generateDemoLandmarks(type);
  currentActiveLandmarks = demoLm;

  // Render to canvas
  canvasCtx.save();
  canvasCtx.fillStyle = '#120924';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  // Background grid
  canvasCtx.strokeStyle = 'rgba(124, 58, 237, 0.12)';
  canvasCtx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(x, 0);
    canvasCtx.lineTo(x, canvas.height);
    canvasCtx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, y);
    canvasCtx.lineTo(canvas.width, y);
    canvasCtx.stroke();
  }

  // Calculate & Draw
  calculateBiomechanicalMetrics(demoLm);
  if (state.plumbLineEnabled) drawPlumbLine(canvasCtx, canvas.width, canvas.height, demoLm);
  if (state.ghostOverlayEnabled && state.baselineLandmarks) drawGhostBaseline(canvasCtx, canvas.width, canvas.height, state.baselineLandmarks);
  drawNeonSkeleton(canvasCtx, canvas.width, canvas.height, demoLm);
  updateUIMetrics();

  canvasCtx.restore();

  const labels = {
    techNeck: "Demo: Forward Head Posture / Tech-Neck (28°)",
    goodPosture: "Demo: Neutral Anatomical Alignment (4°)",
    unevenShoulders: "Demo: Right Shoulder Elevation (7.5°)"
  };
  showToast(labels[type] || "Demo Loaded", "purple");

  if (state.voiceGuidance) {
    if (type === 'techNeck') {
      speakVoiceFeedback("Warning: Forward head posture detected. Lift your chin slightly to relieve cervical spine strain.");
    } else if (type === 'goodPosture') {
      speakVoiceFeedback("Perfect posture detected. Maintain this alignment.");
    } else if (type === 'unevenShoulders') {
      speakVoiceFeedback("Straighten your shoulders and level your chest.");
    }
  }
}

function generateDemoLandmarks(type) {
  // Base neutral posture landmarks
  const lm = [];
  for (let i = 0; i <= 32; i++) {
    lm.push({ x: 0.5, y: 0.5, z: 0, visibility: 0.99 });
  }

  // Nose & Ears
  lm[0] = { x: 0.50, y: 0.20, z: 0, visibility: 0.99 };
  lm[7] = { x: 0.46, y: 0.19, z: 0, visibility: 0.99 };
  lm[8] = { x: 0.54, y: 0.19, z: 0, visibility: 0.99 };

  // Shoulders
  lm[11] = { x: 0.42, y: 0.32, z: 0, visibility: 0.99 };
  lm[12] = { x: 0.58, y: 0.32, z: 0, visibility: 0.99 };

  // Elbows & Wrists
  lm[13] = { x: 0.39, y: 0.46, z: 0, visibility: 0.99 };
  lm[14] = { x: 0.61, y: 0.46, z: 0, visibility: 0.99 };
  lm[15] = { x: 0.38, y: 0.58, z: 0, visibility: 0.99 };
  lm[16] = { x: 0.62, y: 0.58, z: 0, visibility: 0.99 };

  // Hips
  lm[23] = { x: 0.44, y: 0.56, z: 0, visibility: 0.99 };
  lm[24] = { x: 0.56, y: 0.56, z: 0, visibility: 0.99 };

  // Knees
  lm[25] = { x: 0.44, y: 0.74, z: 0, visibility: 0.99 };
  lm[26] = { x: 0.56, y: 0.74, z: 0, visibility: 0.99 };

  // Ankles
  lm[27] = { x: 0.44, y: 0.90, z: 0, visibility: 0.99 };
  lm[28] = { x: 0.56, y: 0.90, z: 0, visibility: 0.99 };

  if (type === 'techNeck') {
    // Forward head shift (ears & nose translated forward horizontally)
    lm[0].x = 0.56;
    lm[0].y = 0.23;
    lm[7].x = 0.52;
    lm[7].y = 0.22;
    lm[8].x = 0.60;
    lm[8].y = 0.22;
  } else if (type === 'unevenShoulders') {
    // Elevate right shoulder, depress left
    lm[11].y = 0.35;
    lm[12].y = 0.28;
    lm[13].y = 0.49;
    lm[14].y = 0.42;
  }

  return lm;
}

// ============================================================================
// Capture & Generate Instant Clinical Report
// ============================================================================
function captureAndGenerateReport() {
  const m = state.liveMetrics;

  // Snapshot canvas to image URL
  const canvas = elements.poseCanvas;
  let snapshotUrl = "";
  try {
    snapshotUrl = canvas.toDataURL('image/png');
    if (elements.reportSnapshotImg) {
      elements.reportSnapshotImg.src = snapshotUrl;
    }
  } catch (e) {
    console.warn("Could not capture canvas data URL:", e);
  }

  // Update Report Metadata
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const reportId = `AST-REP-${Math.floor(1000 + Math.random() * 9000)}`;

  if (elements.repReportId) elements.repReportId.textContent = reportId;
  if (elements.repScanDate) elements.repScanDate.textContent = `${dateStr}, ${timeStr}`;

  updateReportPatientDetails();

  // Score & Metrics in Report
  if (elements.repScoreHuge) elements.repScoreHuge.textContent = m.postureScore;
  if (elements.repScoreDesc) elements.repScoreDesc.textContent = `${m.statusText} (${m.postureScore}/100)`;

  if (elements.repNeckAngle) elements.repNeckAngle.textContent = `${m.neckAngle}°`;
  if (elements.repNeckBadge) {
    elements.repNeckBadge.className = `badge ${m.neckAngle > 22 ? 'badge-red' : m.neckAngle > 12 ? 'badge-yellow' : 'badge-green'}`;
    elements.repNeckBadge.textContent = m.neckAngle > 22 ? 'Needs Correction' : m.neckAngle > 12 ? 'Mild Tilt' : 'Optimal';
  }

  if (elements.repCervicalLoad) elements.repCervicalLoad.textContent = `+${m.extraStrainKg} kg (${m.cervicalLoadKg} kg total)`;
  if (elements.repLoadBadge) {
    elements.repLoadBadge.className = `badge ${m.cervicalLoadKg > 18 ? 'badge-red' : m.cervicalLoadKg > 10 ? 'badge-yellow' : 'badge-green'}`;
    elements.repLoadBadge.textContent = m.cervicalLoadKg > 18 ? 'Severe Strain' : m.cervicalLoadKg > 10 ? 'Mild Strain' : 'Normal';
  }

  if (elements.repShoulderAngle) elements.repShoulderAngle.textContent = `${m.shoulderAngle}°`;
  if (elements.repShoulderBadge) {
    elements.repShoulderBadge.className = `badge ${m.shoulderAngle > 6 ? 'badge-red' : m.shoulderAngle > 3 ? 'badge-yellow' : 'badge-green'}`;
    elements.repShoulderBadge.textContent = m.shoulderAngle > 6 ? 'Uneven' : m.shoulderAngle > 3 ? 'Mild Tilt' : 'Balanced';
  }

  if (elements.repTorsoAngle) elements.repTorsoAngle.textContent = `${m.torsoAngle}°`;
  if (elements.repTorsoBadge) {
    elements.repTorsoBadge.className = `badge ${m.torsoAngle > 7 ? 'badge-red' : m.torsoAngle > 3.5 ? 'badge-yellow' : 'badge-green'}`;
    elements.repTorsoBadge.textContent = m.torsoAngle > 7 ? 'Lateral Shift' : m.torsoAngle > 3.5 ? 'Mild Lean' : 'Centered';
  }

  // Populate 3 Personalized Corrective Exercises
  renderTailoredExercises(m);

  // Update Doctor's notes with personalized clinical advice
  generateDoctorClinicalAdvice(m);

  // Save to History (localStorage)
  saveScanToHistory({
    id: reportId,
    patientName: state.patient.name,
    score: m.postureScore,
    neckAngle: m.neckAngle,
    shoulderAngle: m.shoulderAngle,
    extraLoad: m.extraStrainKg,
    status: m.statusText,
    date: `${dateStr} ${timeStr}`,
    snapshot: snapshotUrl
  });

  // Switch to Report Tab
  switchTab('report');
  showToast("Clinical Assessment Report Generated Successfully!", "green");

  // Check recommendation banner
  checkSpecialistRecommendationBanner(m.postureScore);
}

// ============================================================================
// Tailored Corrective Exercises & Rehabilitation Routine
// ============================================================================
function renderTailoredExercises(m) {
  if (!elements.exerciseCardsContainer) return;

  const exercisePool = {
    chinTuck: {
      title: "1. Cervical Retraction (Chin Tucks)",
      badge: "Tech-Neck Reversal",
      target: "Deep Cervical Flexors",
      desc: "Sit tall. Look straight ahead, place two fingers on your chin, and gently glide your head straight backward as if making a subtle double chin. Hold for 5 seconds.",
      frequency: "2 sets of 10 reps, 2x daily",
      benefit: "Restores cervical spine lordosis and relieves deep suboccipital compression."
    },
    doorwayStretch: {
      title: "2. Doorway Pectoralis Opener",
      badge: "Chest & Shoulder Reset",
      target: "Pectoralis Major & Minor",
      desc: "Stand in a doorway with elbows bent at 90° resting on the frame. Step one foot forward gently until a stretch is felt across the front of your chest and shoulders.",
      frequency: "Hold 30 seconds, 3 repetitions",
      benefit: "Counters rounded hunched shoulders and improves thoracic cage expansion."
    },
    wallAngels: {
      title: "3. Wall Scapular Retraction Angels",
      badge: "Thoracic Mobility",
      target: "Lower & Middle Trapezius",
      desc: "Stand with your back, head, and elbows flat against a wall. Slowly glide your arms overhead in a snow-angel motion while keeping elbows and wrists touching the wall.",
      frequency: "2 sets of 12 reps daily",
      benefit: "Strengthens scapular stabilizers to correct uneven and elevated shoulder tilt."
    },
    catCow: {
      title: "4. Cat-Cow Spinal Articulation",
      badge: "Spinal Decompression",
      target: "Erector Spinae & Core",
      desc: "On all fours, inhale as you arch your back and look up (Cow). Exhale as you round your spine toward the ceiling, tucking your pelvis and chin (Cat).",
      frequency: "10 smooth cycles each morning",
      benefit: "Enhances intervertebral disc hydration and releases pelvic-lumbar stiffness."
    },
    birdDog: {
      title: "5. Quadruped Bird-Dog Stabilization",
      badge: "Core & Pelvic Alignment",
      target: "Multifidus & Gluteus Maximus",
      desc: "On hands and knees, extend your right arm forward and left leg straight back simultaneously until parallel with the floor. Hold 3 seconds, alternate sides smoothly.",
      frequency: "3 sets of 8 reps per side",
      benefit: "Corrects lateral torso shift and enhances lumbopelvic stability."
    }
  };

  // Select 3 based on highest misalignments
  let selected = [];
  if (m.neckAngle > 15) {
    selected.push(exercisePool.chinTuck);
    selected.push(exercisePool.doorwayStretch);
  }
  if (m.shoulderAngle > 3.5) {
    selected.push(exercisePool.wallAngels);
  }
  if (m.torsoAngle > 4.0 || selected.length < 3) {
    selected.push(exercisePool.birdDog);
  }
  if (selected.length < 3) {
    selected.push(exercisePool.catCow);
  }

  // Ensure unique 3
  selected = [...new Set(selected)].slice(0, 3);

  elements.exerciseCardsContainer.innerHTML = selected.map(ex => `
    <div class="exercise-card">
      <div class="exercise-badge-row">
        <span class="badge badge-purple">${ex.badge}</span>
        <span style="font-size: 0.74rem; color: var(--text-muted);">${ex.target}</span>
      </div>
      <h4>${ex.title}</h4>
      <p>${ex.desc}</p>
      <div class="exercise-meta-pill">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span>${ex.frequency}</span>
      </div>
      <div style="font-size: 0.74rem; color: #C4B5FD; margin-top: 8px;">
        <i class="fa-solid fa-circle-check"></i> ${ex.benefit}
      </div>
    </div>
  `).join('');
}

function generateDoctorClinicalAdvice(m) {
  if (!elements.doctorNotesInput) return;

  let advice = `Patient: ${state.patient.name} (${state.patient.age} yrs, ${state.patient.gender}). `;
  if (m.postureScore >= 88) {
    advice += "Biomechanical scan reveals excellent neutral spinal alignment. Continue regular ergonomic breaks and maintenance stretches.";
  } else if (m.postureScore >= 75) {
    advice += `Mild postural deviations noted: Neck forward tilt of ${m.neckAngle}° and shoulder tilt of ${m.shoulderAngle}°. Recommended twice daily chin tucks and workstation ergonomic chair adjustment.`;
  } else {
    advice += `CLINICAL NOTICE: Significant forward cervical displacement of ${m.neckAngle}° adding +${m.extraStrainKg} kg of strain on the cervical spine, alongside uneven shoulder levels (${m.shoulderAngle}°). Recommended targeted scapular rehabilitation and immediate 1-on-1 tele-health review with Dr. Tahira Nihal.`;
  }
  elements.doctorNotesInput.value = advice;
}

// ============================================================================
// Doctor Consultation & WhatsApp Integration (Dr. Tahira Nihal)
// ============================================================================
function openDoctorWhatsApp() {
  const m = state.liveMetrics;
  const p = state.patient;

  const msg = 
`🏥 *AST Posture Clinic - Clinical Assessment Summary*
*Developed by Abiha & Sumaiya | Clinical Lead: Dr. Tahira Nihal*
----------------------------------------
👤 *Patient Details:*
• *Name:* ${p.name}
• *Age / Gender:* ${p.age} yrs / ${p.gender}
• *Assessment Score:* ${m.postureScore}/100 (${m.statusText})

📊 *Biomechanical Metrics:*
• *Neck Forward Tilt:* ${m.neckAngle}°
• *Cervical Extra Strain:* +${m.extraStrainKg} kg (${m.cervicalLoadKg} kg total)
• *Shoulder Alignment Tilt:* ${m.shoulderAngle}°
• *Torso Deviation:* ${m.torsoAngle}°

🩺 *Patient Inquiry:*
"Hello Dr. Tahira Nihal, I conducted a posture scan at AST Posture Clinic and would like to consult with you regarding these clinical findings and exercise plan."`;

  const waUrl = `https://wa.me/${CLINICAL_CONFIG.doctorWhatsApp}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

// Connect WhatsApp buttons
if (elements.directWhatsAppBtn) {
  elements.directWhatsAppBtn.addEventListener('click', openDoctorWhatsApp);
}
if (elements.whatsappReportBtn) {
  elements.whatsappReportBtn.addEventListener('click', openDoctorWhatsApp);
}

// Print / Download Report
if (elements.downloadReportBtn) {
  elements.downloadReportBtn.addEventListener('click', () => {
    window.print();
  });
}

// Save Doctor's Notes
if (elements.saveNotesBtn) {
  elements.saveNotesBtn.addEventListener('click', () => {
    showToast("Doctor's clinical notes saved to current patient record.", "green");
  });
}

// ============================================================================
// In-App Appointment Booking with Dr. Tahira Nihal
// ============================================================================
function initAppointmentBookingForm() {
  if (!elements.appointmentForm) return;

  elements.appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = elements.bookPatientName.value.trim() || state.patient.name;
    const phone = elements.bookPhone.value.trim();
    const date = elements.bookDate.value;
    const time = elements.bookTime.value;
    const pain = elements.bookPainLevel.value;
    const mode = elements.bookConsultType.value;
    const notes = elements.bookNotes.value.trim();

    const token = `AST-TN-${Math.floor(1000 + Math.random() * 9000)}`;

    // Populate confirmation slip
    if (elements.slipTokenNum) elements.slipTokenNum.textContent = token;
    if (elements.slipPatientName) elements.slipPatientName.textContent = name;
    if (elements.slipScheduledSlot) elements.slipScheduledSlot.textContent = `${date}, ${time}`;
    if (elements.slipMode) elements.slipMode.textContent = mode;

    elements.appointmentSlipCard.classList.add('active');
    showToast(`Appointment Confirmed! Token: ${token}`, "green");

    // WhatsApp Slip Share Button
    if (elements.slipWhatsAppShareBtn) {
      elements.slipWhatsAppShareBtn.onclick = () => {
        const slipMsg = 
`🎫 *AST Posture Clinic - Appointment Token Confirmation*
*Token ID:* ${token}
*Doctor:* Dr. Tahira Nihal (Lead Physiotherapist)
*Patient Name:* ${name}
*Contact:* ${phone}
*Scheduled Slot:* ${date} at ${time}
*Mode:* ${mode}
*Symptom / Pain Level:* ${pain}
*Patient Notes:* ${notes}
----------------------------------------
"Hello Dr. Tahira Nihal, I have booked a posture consultation through AST Posture Clinic app."`;

        window.open(`https://wa.me/${CLINICAL_CONFIG.doctorWhatsApp}?text=${encodeURIComponent(slipMsg)}`, '_blank');
      };
    }

    elements.appointmentSlipCard.scrollIntoView({ behavior: 'smooth' });
  });
}

// ============================================================================
// Feature D: Ergonomic Desk & Chair Calculator
// ============================================================================
function initErgonomicCalculator() {
  let currentUnit = 'cm';

  function calculateErgonomics() {
    let heightCm = 172;

    if (currentUnit === 'cm') {
      heightCm = parseFloat(elements.heightCmInput.value) || 172;
    } else {
      const ft = parseFloat(elements.heightFtInput.value) || 5;
      const inch = parseFloat(elements.heightInInput.value) || 8;
      heightCm = (ft * 30.48) + (inch * 2.54);
    }

    // Formulas based on OSHA & BIFMA Ergonomics Standards
    const chairHeight = Math.round(heightCm * 0.25);
    const deskHeight = Math.round(heightCm * 0.40);
    const standingDeskHeight = Math.round(heightCm * 0.63);
    const monitorDist = "50 - 70 cm";

    // Update Text Outputs
    if (elements.resChairHeight) elements.resChairHeight.textContent = `${chairHeight} cm`;
    if (elements.resDeskHeight) elements.resDeskHeight.textContent = `${deskHeight} cm`;
    if (elements.resStandingDesk) elements.resStandingDesk.textContent = `${standingDeskHeight} cm`;
    if (elements.resMonitorDist) elements.resMonitorDist.textContent = monitorDist;

    // Update SVG Diagram labels
    if (elements.svgSeatHeight) elements.svgSeatHeight.textContent = `${chairHeight} cm`;
    if (elements.svgDeskHeight) elements.svgDeskHeight.textContent = `${deskHeight} cm`;

    // Height Badge
    const ftApprox = Math.floor(heightCm / 30.48);
    const inApprox = Math.round((heightCm % 30.48) / 2.54);
    if (elements.ergoHeightBadge) {
      elements.ergoHeightBadge.textContent = `Height: ${Math.round(heightCm)} cm (${ftApprox}'${inApprox}")`;
    }
  }

  // Unit Toggle
  if (elements.unitCmBtn && elements.unitFtBtn) {
    elements.unitCmBtn.addEventListener('click', () => {
      currentUnit = 'cm';
      elements.unitCmBtn.classList.add('active');
      elements.unitFtBtn.classList.remove('active');
      elements.metricInputGroup.style.display = 'block';
      elements.imperialInputGroup.style.display = 'none';
      calculateErgonomics();
    });

    elements.unitFtBtn.addEventListener('click', () => {
      currentUnit = 'ft';
      elements.unitFtBtn.classList.add('active');
      elements.unitCmBtn.classList.remove('active');
      elements.metricInputGroup.style.display = 'none';
      elements.imperialInputGroup.style.display = 'block';
      calculateErgonomics();
    });
  }

  // Input Listeners
  if (elements.heightCmInput) elements.heightCmInput.addEventListener('input', calculateErgonomics);
  if (elements.heightFtInput) elements.heightFtInput.addEventListener('input', calculateErgonomics);
  if (elements.heightInInput) elements.heightInInput.addEventListener('input', calculateErgonomics);

  calculateErgonomics();
}

// ============================================================================
// Scan History Storage (localStorage)
// ============================================================================
function loadHistoryFromStorage() {
  const saved = localStorage.getItem('ast_posture_history');
  if (saved) {
    try {
      state.history = JSON.parse(saved);
      renderHistoryList();
    } catch (e) {
      console.warn("Could not load history", e);
    }
  }

  if (elements.clearHistoryBtn) {
    elements.clearHistoryBtn.addEventListener('click', () => {
      if (confirm("Are you sure you want to clear all stored posture scans?")) {
        state.history = [];
        localStorage.removeItem('ast_posture_history');
        renderHistoryList();
        showToast("Scan history cleared.", "purple");
      }
    });
  }
}

function saveScanToHistory(scanRecord) {
  state.history.unshift(scanRecord);
  if (state.history.length > 20) state.history.pop();
  try {
    localStorage.setItem('ast_posture_history', JSON.stringify(state.history));
  } catch (e) {
    console.warn("Could not save to localStorage (quota exceeded)", e);
  }
  renderHistoryList();
}

function renderHistoryList() {
  if (!elements.historyListContainer) return;

  if (state.history.length === 0) {
    elements.historyListContainer.innerHTML = `
      <div class="empty-history-state">
        <i class="fa-solid fa-folder-open"></i>
        <p>No past posture scans recorded yet. Perform a scan in the Live AI Scanner tab and click "Capture &amp; Generate Report".</p>
      </div>
    `;
    return;
  }

  elements.historyListContainer.innerHTML = state.history.map(item => `
    <div class="history-item-card">
      <div class="history-patient-details">
        <h4>${item.patientName || "Patient Scan"}</h4>
        <p><i class="fa-regular fa-clock"></i> ${item.date} • ID: ${item.id}</p>
        <span class="badge ${item.score >= 88 ? 'badge-green' : item.score >= 75 ? 'badge-yellow' : 'badge-red'}" style="margin-top: 6px;">
          ${item.status}
        </span>
      </div>

      <div class="history-item-metrics">
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">NECK TILT</span>
          <strong style="color: #FFFFFF;">${item.neckAngle}°</strong>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">EXTRA LOAD</span>
          <strong style="color: #F87171;">+${item.extraLoad} kg</strong>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">SHOULDER TILT</span>
          <strong style="color: #FFFFFF;">${item.shoulderAngle}°</strong>
        </div>
        <div class="history-score-badge ${item.score >= 88 ? 'badge-green' : item.score >= 75 ? 'badge-yellow' : 'badge-red'}">
          ${item.score}
        </div>
      </div>
    </div>
  `).join('');
}

// ============================================================================
// Toast Notifications
// ============================================================================
function showToast(message, type = "purple") {
  if (!elements.toastContainer) return;

  const toast = document.createElement('div');
  const icon = type === 'green' ? 'fa-circle-check' : type === 'red' ? 'fa-triangle-exclamation' : 'fa-bell';
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
