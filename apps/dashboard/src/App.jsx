import React, { useState, useEffect } from "react";

// Simulated data for the pipeline stages
const STAGE_DETAILS = {
  build: {
    title: "Code Compilation & Build",
    status: "completed",
    duration: "1m 24s",
    logs: [
      "[08:00:01] Git clone completed successfully.",
      "[08:00:03] Installing dependencies using yarn...",
      "[08:01:12] Yarn install completed in 69s.",
      "[08:01:13] Running production build command...",
      "[08:01:25] Assets compiled. Build successful.",
    ],
  },
  test: {
    title: "Unit & Integration Testing",
    status: "completed",
    duration: "45s",
    logs: [
      "[08:01:26] Initiating test runners...",
      "[08:01:28] Running Jest suite (142 unit tests)...",
      "[08:01:45] Unit tests passed (142/142).",
      "[08:01:46] Running Cypress integration suite (24 tests)...",
      "[08:02:11] All integration tests passed (24/24).",
    ],
  },
  security: {
    title: "SAST & Dependency Vulnerability Scan",
    status: "running",
    duration: "In Progress...",
    logs: [
      "[08:02:12] Starting SonarQube quality gate analysis...",
      "[08:02:15] Dependency vulnerability check in progress (npm audit / OWASP)...",
      "[08:02:22] [INFO] No critical vulnerabilities found in yarn.lock.",
      "[08:02:25] Running static analysis checks...",
      "[08:02:29] Scanning source code directories...",
    ],
  },
  deploy: {
    title: "Production Blue/Green Deployment",
    status: "pending",
    duration: "Pending...",
    logs: [
      "[08:02:30] Waiting for upstream Security pipeline stage to complete...",
      "[08:02:30] Blue/Green deployment target cluster: aws-us-east-eks-01",
      "[08:02:30] Deployment pending...",
    ],
  },
};

// Initial SonarQube Mock Report Data
const INITIAL_SONAR_REPORT = {
  status: "passed",
  lastScan: "4 minutes ago",
  metrics: {
    bugs: { value: 0, rating: "A", status: "Passed" },
    vulnerabilities: { value: 0, rating: "A", status: "Passed" },
    securityHotspots: { value: 0, rating: "A", status: "0 Reviewed" },
    codeSmells: { value: 4, rating: "A", status: "15m Debt" },
    coverage: { value: "94.2%", rating: "A", status: "Passed" },
    duplications: { value: "0.0%", rating: "A", status: "Passed" },
  },
  issues: [
    {
      id: "SQ-101",
      severity: "minor",
      type: "Code Smell",
      message: 'Remove unused import "reactLogo" in App.jsx',
      file: "src/App.jsx",
      line: 2,
    },
    {
      id: "SQ-102",
      severity: "minor",
      type: "Code Smell",
      message: 'Remove unused import "viteLogo" in App.jsx',
      file: "src/App.jsx",
      line: 3,
    },
    {
      id: "SQ-103",
      severity: "major",
      type: "Code Smell",
      message: "Define static constants outside component function scope",
      file: "src/App.jsx",
      line: 8,
    },
    {
      id: "SQ-104",
      severity: "minor",
      type: "Code Smell",
      message: "Add alt text descriptive tag to SVG icons for accessibility",
      file: "src/App.jsx",
      line: 95,
    },
  ],
};

function App() {
  const appEnv = import.meta.env.VITE_APP_ENV || "production";
  const [activeTab, setActiveTab] = useState("pipeline"); // 'pipeline' or 'sonar'
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pipeline state
  const [selectedStage, setSelectedStage] = useState("security");
  const [pipelineLogs, setPipelineLogs] = useState(
    STAGE_DETAILS[selectedStage].logs,
  );
  const [isPipelineTriggered, setIsPipelineTriggered] = useState(false);

  // SonarQube state
  const [sonarReport, setSonarReport] = useState(INITIAL_SONAR_REPORT);
  const [isSonarScanning, setIsSonarScanning] = useState(false);
  const [sonarScanPhase, setSonarScanPhase] = useState("");
  const [sonarScanLogs, setSonarScanLogs] = useState([]);

  // Secrets and Variables state
  const [secretsList, setSecretsList] = useState([
    {
      id: "s1",
      name: "DOCKER_USERNAME",
      value: "vatsalpalm",
      type: "plain",
      scope: "All Environments",
      isRevealed: true,
    },
    {
      id: "s2",
      name: "DOCKER_PASSWORD",
      value: "docker-pass-12345",
      type: "secret",
      scope: "All Environments",
      isRevealed: false,
    },
    {
      id: "s3",
      name: "SONAR_TOKEN",
      value: "sqa_987654321abcdef0123456789",
      type: "secret",
      scope: "All Environments",
      isRevealed: false,
    },
    {
      id: "s4",
      name: "API_URL",
      value: "https://api.vatsalpalm.com/v1",
      type: "plain",
      scope: "Production",
      isRevealed: true,
    },
  ]);

  const [secretForm, setSecretForm] = useState({
    name: "",
    value: "",
    type: "secret",
    scope: "All Environments",
  });

  const [secretErrors, setSecretErrors] = useState({});
  const [showSecretSuccess, setShowSecretSuccess] = useState(false);

  const handleSecretFormChange = (e) => {
    const { name, value } = e.target;
    setSecretForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleSecretReveal = (id) => {
    setSecretsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isRevealed: !s.isRevealed } : s)),
    );
  };

  const handleDeleteSecret = (id) => {
    setSecretsList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSecretSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    const nameRegex = /^[A-Z][A-Z0-9_]*$/;
    if (!secretForm.name) {
      errors.name = "Variable name is required";
    } else if (!nameRegex.test(secretForm.name)) {
      errors.name =
        "Variable Name must only contain uppercase letters, numbers, and underscores, and start with a letter";
    } else if (secretsList.some((s) => s.name === secretForm.name)) {
      errors.name = "Variable Name already exists";
    }

    if (!secretForm.value) {
      errors.value = "Variable value is required";
    }

    if (Object.keys(errors).length > 0) {
      setSecretErrors(errors);
      return;
    }

    const newSecret = {
      id: "s_" + Date.now(),
      name: secretForm.name,
      value: secretForm.value,
      type: secretForm.type,
      scope: secretForm.scope,
      isRevealed: secretForm.type === "plain",
    };

    setSecretsList((prev) => [...prev, newSecret]);
    setSecretForm({
      name: "",
      value: "",
      type: "secret",
      scope: "All Environments",
    });
    setSecretErrors({});
    setShowSecretSuccess(true);
    setTimeout(() => {
      setShowSecretSuccess(false);
    }, 2000);
  };

  // Pipeline Settings configuration states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pipelineSettings, setPipelineSettings] = useState({
    environment: "production",
    timeout: 10,
    runSecurity: true,
    pushDocker: true,
    slackWebhook: "",
  });
  const [formState, setFormState] = useState({
    environment: "production",
    timeout: 10,
    runSecurity: true,
    pushDocker: true,
    slackWebhook: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showSettingsSuccess, setShowSettingsSuccess] = useState(false);

  const handleOpenSettings = () => {
    setFormState({ ...pipelineSettings });
    setFormErrors({});
    setShowSettingsSuccess(false);
    setIsSettingsOpen(true);
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? parseInt(value, 10) || 0
            : value,
    }));
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (formState.timeout < 1 || formState.timeout > 120) {
      errors.timeout = "Timeout must be between 1 and 120 minutes";
    }
    if (
      formState.slackWebhook &&
      !formState.slackWebhook.startsWith("https://hooks.slack.com/")
    ) {
      errors.slackWebhook = "Webhook must start with https://hooks.slack.com/";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setPipelineSettings({ ...formState });
    setFormErrors({});
    setShowSettingsSuccess(true);
    setTimeout(() => {
      setShowSettingsSuccess(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

  const handleStageClick = (stageKey) => {
    setSelectedStage(stageKey);
    setPipelineLogs(STAGE_DETAILS[stageKey].logs);
  };

  const triggerPipeline = () => {
    setIsPipelineTriggered(true);
    setTimeout(() => {
      setIsPipelineTriggered(false);
    }, 2000);
  };

  // Simulator for running SonarQube Scanner
  const triggerSonarScan = () => {
    setIsSonarScanning(true);
    setSonarScanLogs([]);

    const phases = [
      { msg: "Initializing SonarQube scanner...", delay: 0 },
      { msg: "Loading sonar-project.properties config...", delay: 500 },
      { msg: "Scanning directories: ./src...", delay: 1000 },
      { msg: "Running ESLint integrations...", delay: 1500 },
      { msg: "Uploading coverage report: coverage/lcov.info...", delay: 2000 },
      { msg: "Publishing quality gate analysis to dashboard...", delay: 2500 },
    ];

    phases.forEach((p) => {
      setTimeout(() => {
        setSonarScanPhase(p.msg);
        setSonarScanLogs((prev) => [...prev, `[INFO] ${p.msg}`]);
      }, p.delay);
    });

    setTimeout(() => {
      setIsSonarScanning(false);
      // Update report to look like code smells were fixed!
      setSonarReport((prev) => ({
        ...prev,
        lastScan: "Just now",
        metrics: {
          ...prev.metrics,
          codeSmells: { value: 0, rating: "A", status: "0m Debt" },
        },
        issues: [], // Issues resolved!
      }));
    }, 3200);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">F</div>
          <span className="logo-text">FlowOps</span>
        </div>
        <nav className="nav-links">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`nav-link ${activeTab === "pipeline" ? "active" : ""}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("sonar")}
            className={`nav-link ${activeTab === "sonar" ? "active" : ""}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            Quality Gate
          </button>
          <button
            onClick={() => setActiveTab("secrets")}
            className={`nav-link ${activeTab === "secrets" ? "active" : ""}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            {isMobile ? "Secrets" : "Secrets Manager"}
          </button>
          <button
            onClick={handleOpenSettings}
            className="nav-link"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            Settings
          </button>
          <span style={{ color: "var(--text-secondary)", opacity: 0.5 }}>|</span>
          <button
            onClick={() => setActiveTab("live-pipeline")}
            className={`nav-link ${activeTab === "live-pipeline" ? "active" : ""}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            Pipeline API
          </button>
          <button
            onClick={() => setActiveTab("live-sonar")}
            className={`nav-link ${activeTab === "live-sonar" ? "active" : ""}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            Sonar API
          </button>
          <button
            onClick={() => setActiveTab("live-secrets")}
            className={`nav-link ${activeTab === "live-secrets" ? "active" : ""}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            Secrets API
          </button>
        </nav>
        <div>
          {appEnv === "staging" ? (
            <span
              className="status-badge"
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                color: "#fbbf24",
                padding: "6px 12px",
                borderRadius: "9999px",
                fontSize: "14px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  marginRight: "6px",
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#fbbf24",
                  boxShadow: "0 0 8px #fbbf24",
                }}
              ></span>
              Staging: Active
            </span>
          ) : (
            <span className="status-badge success">
              <span
                className="pulse-dot success"
                style={{ marginRight: "6px" }}
              ></span>
              Production: Stable
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-tag">
            <svg
              width="15"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              style={{ marginRight: "6px" }}
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            CI/CD Pipeline Center Active
          </div>
          <h1 className="hero-title">Steve's Development</h1>
          <p className="hero-subtitle">
            Configure integration actions, view live build status flow charts,
            and analyze deep code-quality metrics powered by SonarQube scanner.
          </p>
        </section>

        {/* View Switcher Tabs */}
        <div className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === "pipeline" ? "active" : ""}`}
            onClick={() => setActiveTab("pipeline")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            {isMobile ? "Pipeline" : "Pipeline Flow Chart"}
          </button>
          <button
            className={`tab-btn ${activeTab === "sonar" ? "active" : ""}`}
            onClick={() => setActiveTab("sonar")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
            {isMobile ? "SonarQube" : "SonarQube Quality Gate"}
            {sonarReport.issues.length > 0 && (
              <span
                style={{
                  background: "var(--color-rose)",
                  color: "white",
                  fontSize: "0.6875rem",
                  fontWeight: "700",
                  borderRadius: "99px",
                  padding: "1px 6px",
                  marginLeft: "4px",
                }}
              >
                {sonarReport.issues.length}
              </span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === "secrets" ? "active" : ""}`}
            onClick={() => setActiveTab("secrets")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {isMobile ? "Secrets" : "Secrets Manager"}
          </button>
        </div>

        {/* Tab content: Pipeline Flow */}
        {activeTab === "pipeline" && (
          <>
            {/* Metrics Grid */}
            <section className="grid-container" style={{ marginTop: "0" }}>
              <div className="glass-card">
                <div className="metric-header">
                  <span className="metric-title">Pipeline Success Rate</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: "var(--color-emerald)" }}
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="metric-value">99.42%</div>
                <div className="metric-desc">
                  <span
                    style={{ color: "var(--color-emerald)", fontWeight: "600" }}
                  >
                    +0.2%
                  </span>{" "}
                  than last week (average 420 builds)
                </div>
                <div
                  style={{
                    marginTop: "1rem",
                    height: "4px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "99.42%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, var(--color-indigo), var(--color-emerald))",
                    }}
                  ></div>
                </div>
              </div>

              <div className="glass-card">
                <div className="metric-header">
                  <span className="metric-title">Average Build Duration</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: "var(--color-cyan)" }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="metric-value">3m 42s</div>
                <div className="metric-desc">
                  <span
                    style={{ color: "var(--color-cyan)", fontWeight: "600" }}
                  >
                    -12 seconds
                  </span>{" "}
                  compared to previous release
                </div>
                <div
                  style={{
                    marginTop: "1rem",
                    height: "4px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "75%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, var(--color-indigo), var(--color-cyan))",
                    }}
                  ></div>
                </div>
              </div>

              <div className="glass-card">
                <div className="metric-header">
                  <span className="metric-title">Production Releases</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: "var(--color-purple)" }}
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div className="metric-value">1,248</div>
                <div className="metric-desc">
                  <span
                    style={{ color: "var(--color-purple)", fontWeight: "600" }}
                  >
                    3 deployments
                  </span>{" "}
                  currently active in sandbox environment
                </div>
                <div
                  style={{
                    marginTop: "1rem",
                    height: "4px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "85%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, var(--color-indigo), var(--color-purple))",
                    }}
                  ></div>
                </div>
              </div>
            </section>

            {/* Visual Pipeline Map */}
            <section className="glass-card pipeline-visual-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2
                    className="font-display"
                    style={{ fontSize: "1.25rem", fontWeight: "700" }}
                  >
                    Active Release Workflow
                  </h2>
                  <p className="metric-desc" style={{ marginTop: "0.25rem" }}>
                    Click pipeline stages to inspect execution logs
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={triggerPipeline}
                    className="action-button"
                    disabled={isPipelineTriggered}
                  >
                    {isPipelineTriggered
                      ? "Triggering..."
                      : "Trigger Pipeline Run"}
                  </button>
                  <button
                    className="secondary-button"
                    onClick={handleOpenSettings}
                  >
                    Pipeline Settings
                  </button>
                </div>
              </div>

              {/* Active Config Summary Bar */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  padding: "0.75rem 1rem",
                  marginBottom: "2rem",
                  display: "flex",
                  gap: "1.5rem",
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <strong>Environment:</strong>{" "}
                  <span
                    style={{ color: "white", textTransform: "capitalize" }}
                    data-testid="settings-env"
                  >
                    {pipelineSettings.environment}
                  </span>
                </div>
                <div>
                  <strong>Timeout:</strong>{" "}
                  <span
                    style={{ color: "white" }}
                    data-testid="settings-timeout"
                  >
                    {pipelineSettings.timeout} mins
                  </span>
                </div>
                <div>
                  <strong>Security Scan:</strong>{" "}
                  <span
                    style={{
                      color: pipelineSettings.runSecurity
                        ? "var(--color-emerald)"
                        : "var(--color-rose)",
                    }}
                    data-testid="settings-security"
                  >
                    {pipelineSettings.runSecurity ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div>
                  <strong>Docker Push:</strong>{" "}
                  <span
                    style={{
                      color: pipelineSettings.pushDocker
                        ? "var(--color-emerald)"
                        : "var(--color-rose)",
                    }}
                    data-testid="settings-docker"
                  >
                    {pipelineSettings.pushDocker ? "Enabled" : "Disabled"}
                  </span>
                </div>
                {pipelineSettings.slackWebhook && (
                  <div
                    style={{
                      maxWidth: "250px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <strong>Webhook:</strong>{" "}
                    <span
                      style={{ color: "white" }}
                      title={pipelineSettings.slackWebhook}
                      data-testid="settings-webhook"
                    >
                      {pipelineSettings.slackWebhook}
                    </span>
                  </div>
                )}
              </div>

              {/* Pipeline Map Diagram */}
              <div className="pipeline-diagram">
                {/* Pulsing connection line */}
                <div className="pipeline-connection"></div>

                {/* Stage: Build */}
                <div
                  className={`pipeline-node completed ${selectedStage === "build" ? "active" : ""}`}
                  onClick={() => handleStageClick("build")}
                >
                  <div className="pipeline-node-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  </div>
                  <div className="pipeline-node-label">1. Build Package</div>
                </div>

                {/* Stage: Test */}
                <div
                  className={`pipeline-node completed ${selectedStage === "test" ? "active" : ""}`}
                  onClick={() => handleStageClick("test")}
                >
                  <div className="pipeline-node-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <div className="pipeline-node-label">2. Run Tests</div>
                </div>

                {/* Stage: Security */}
                <div
                  className={`pipeline-node active ${selectedStage === "security" ? "active" : ""}`}
                  onClick={() => handleStageClick("security")}
                >
                  <div className="pipeline-node-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className="pipeline-node-label">3. Security Scan</div>
                </div>

                {/* Stage: Deploy */}
                <div
                  className={`pipeline-node pending ${selectedStage === "deploy" ? "active" : ""}`}
                  onClick={() => handleStageClick("deploy")}
                >
                  <div className="pipeline-node-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <div className="pipeline-node-label">4. Deploy Prod</div>
                </div>
              </div>

              {/* Console / Terminal Log Output */}
              <div
                style={{
                  background: "#040508",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  marginTop: "3.5rem",
                  boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.8)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    paddingBottom: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <span
                      className={`status-badge ${STAGE_DETAILS[selectedStage].status === "completed" ? "success" : STAGE_DETAILS[selectedStage].status === "running" ? "running" : "pending"}`}
                    >
                      <span
                        className={`pulse-dot ${STAGE_DETAILS[selectedStage].status === "completed" ? "success" : STAGE_DETAILS[selectedStage].status === "running" ? "running" : "pending"}`}
                        style={{ marginRight: "4px" }}
                      ></span>
                      {STAGE_DETAILS[selectedStage].status}
                    </span>
                    <span
                      className="font-display"
                      style={{ fontWeight: "600", fontSize: "0.9375rem" }}
                    >
                      {STAGE_DETAILS[selectedStage].title}
                    </span>
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    Duration: {STAGE_DETAILS[selectedStage].duration}
                  </span>
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: "0.8125rem",
                    lineHeight: "1.7",
                    color: "#c1c7d6",
                    maxHeight: "180px",
                    overflowY: "auto",
                  }}
                >
                  {pipelineLogs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        color: log.includes("[ERROR]")
                          ? "var(--color-rose)"
                          : log.includes("[INFO]")
                            ? "var(--color-cyan)"
                            : "inherit",
                      }}
                    >
                      {log}
                    </div>
                  ))}
                  {STAGE_DETAILS[selectedStage].status === "running" && (
                    <div
                      style={{
                        color: "var(--color-cyan)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "0.25rem",
                      }}
                    >
                      <span>●</span>{" "}
                      <span>Scanning components... analysis in progress</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Tab content: SonarQube Quality Report */}
        {activeTab === "sonar" && (
          <section className="sonar-container">
            {/* Scanner Status Banner */}
            <div
              className={`sonar-status-banner ${isSonarScanning ? "scanning" : sonarReport.status === "passed" ? "passed" : "failed"}`}
            >
              <div>
                <h2 className="sonar-status-title">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{
                      color: isSonarScanning
                        ? "var(--color-cyan)"
                        : "var(--color-emerald)",
                    }}
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {isSonarScanning
                    ? "SonarQube Analysis in Progress..."
                    : "Quality Gate Status"}
                </h2>
                <p
                  className="metric-desc"
                  style={{
                    marginTop: "0.5rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {isSonarScanning
                    ? `Executing phase: ${sonarScanPhase}`
                    : `Project scanned ${sonarReport.lastScan} on main branch.`}
                </p>
              </div>
              <div>
                {isSonarScanning ? (
                  <span className="sonar-gate-badge scanning">SCANNING</span>
                ) : (
                  <span
                    className={`sonar-gate-badge ${sonarReport.status === "passed" ? "passed" : "failed"}`}
                  >
                    {sonarReport.status.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Quality Metrics Grid */}
            <div className="sonar-metrics-grid">
              {/* Bugs */}
              <div
                className="glass-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "140px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span className="metric-title">Bugs</span>
                  <div className="rating-circle a">A</div>
                </div>
                <div>
                  <div className="metric-value">
                    {isSonarScanning ? "--" : sonarReport.metrics.bugs.value}
                  </div>
                  <span
                    className="metric-desc"
                    style={{ color: "var(--color-emerald)" }}
                  >
                    {isSonarScanning ? "Calculating..." : "Reliability rating"}
                  </span>
                </div>
              </div>

              {/* Vulnerabilities */}
              <div
                className="glass-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "140px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span className="metric-title">Vulnerabilities</span>
                  <div className="rating-circle a">A</div>
                </div>
                <div>
                  <div className="metric-value">
                    {isSonarScanning
                      ? "--"
                      : sonarReport.metrics.vulnerabilities.value}
                  </div>
                  <span
                    className="metric-desc"
                    style={{ color: "var(--color-emerald)" }}
                  >
                    {isSonarScanning ? "Calculating..." : "Security rating"}
                  </span>
                </div>
              </div>

              {/* Security Hotspots */}
              <div
                className="glass-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "140px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span className="metric-title">Hotspots</span>
                  <div className="rating-circle a">A</div>
                </div>
                <div>
                  <div className="metric-value">
                    {isSonarScanning
                      ? "--"
                      : sonarReport.metrics.securityHotspots.value}
                  </div>
                  <span className="metric-desc">
                    {isSonarScanning
                      ? "Reviewing..."
                      : sonarReport.metrics.securityHotspots.status}
                  </span>
                </div>
              </div>

              {/* Code Smells */}
              <div
                className="glass-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "140px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span className="metric-title">Code Smells</span>
                  <div className="rating-circle a">A</div>
                </div>
                <div>
                  <div
                    className="metric-value"
                    style={{
                      color:
                        !isSonarScanning &&
                        sonarReport.metrics.codeSmells.value > 0
                          ? "var(--color-amber)"
                          : "inherit",
                    }}
                  >
                    {isSonarScanning
                      ? "--"
                      : sonarReport.metrics.codeSmells.value}
                  </div>
                  <span className="metric-desc">
                    {isSonarScanning
                      ? "Checking debt..."
                      : sonarReport.metrics.codeSmells.status}
                  </span>
                </div>
              </div>

              {/* Coverage */}
              <div
                className="glass-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "140px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span className="metric-title">Coverage</span>
                  <div className="rating-circle a">A</div>
                </div>
                <div>
                  <div
                    className="metric-value"
                    style={{ color: "var(--color-emerald)" }}
                  >
                    {isSonarScanning
                      ? "--"
                      : sonarReport.metrics.coverage.value}
                  </div>
                  <span className="metric-desc">
                    {isSonarScanning
                      ? "Compiling tests..."
                      : "Unit test pathways"}
                  </span>
                </div>
              </div>

              {/* Duplications */}
              <div
                className="glass-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "140px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span className="metric-title">Duplications</span>
                  <div className="rating-circle a">A</div>
                </div>
                <div>
                  <div className="metric-value">
                    {isSonarScanning
                      ? "--"
                      : sonarReport.metrics.duplications.value}
                  </div>
                  <span className="metric-desc">
                    {isSonarScanning
                      ? "Checking clones..."
                      : "Zero duplicated blocks"}
                  </span>
                </div>
              </div>
            </div>

            {/* Run scanner & Logs block */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                alignItems: "start",
              }}
              className="responsive-split"
            >
              {/* Scan controller block */}
              <div className="glass-card" style={{ height: "100%" }}>
                <h3
                  className="font-display"
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "700",
                    marginBottom: "0.75rem",
                  }}
                >
                  Trigger Quality Scan
                </h3>
                <p className="metric-desc" style={{ marginBottom: "1.5rem" }}>
                  Pushing code to GitHub triggers the pipeline scan
                  automatically. You can also trigger a manual scan analysis of
                  your local directories here.
                </p>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={triggerSonarScan}
                    className="action-button"
                    disabled={isSonarScanning}
                  >
                    {isSonarScanning
                      ? "Scanning Code..."
                      : "Trigger Quality Scan"}
                  </button>
                  <button
                    onClick={() => {
                      setSonarReport(INITIAL_SONAR_REPORT);
                    }}
                    className="secondary-button"
                    disabled={isSonarScanning}
                  >
                    Reset Report
                  </button>
                </div>
              </div>

              {/* Console log from analysis */}
              <div
                style={{
                  background: "#040508",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.8)",
                  minHeight: "200px",
                }}
              >
                <h4
                  className="font-mono"
                  style={{
                    fontSize: "0.875rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    paddingBottom: "0.5rem",
                    marginBottom: "1rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Scanner Logs
                </h4>
                <div
                  className="font-mono"
                  style={{
                    fontSize: "0.75rem",
                    lineHeight: "1.8",
                    color: "#a1a7b5",
                    maxHeight: "140px",
                    overflowY: "auto",
                  }}
                >
                  {sonarScanLogs.length === 0 ? (
                    <span style={{ color: "var(--text-muted)" }}>
                      Idle. Trigger scan to review analyzer execution logs.
                    </span>
                  ) : (
                    sonarScanLogs.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))
                  )}
                  {isSonarScanning && (
                    <div
                      style={{
                        color: "var(--color-cyan)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          animation: "sonar-pulse 1.2s infinite ease-in-out",
                          display: "inline-block",
                        }}
                      >
                        ●
                      </span>
                      <span>Running analyzer process...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Code Quality Issues Table */}
            <div className="glass-card sonar-issues-card">
              <h3
                className="font-display"
                style={{ fontSize: "1.125rem", fontWeight: "700" }}
              >
                Active Code Quality Issues
              </h3>
              <p className="metric-desc" style={{ marginTop: "0.25rem" }}>
                Fixing these issues in your codebase and pushing again will
                clear the quality gate.
              </p>

              {sonarReport.issues.length === 0 ? (
                <div
                  style={{
                    padding: "3rem 1rem",
                    textAlign: "center",
                    color: "var(--color-emerald)",
                    fontWeight: "600",
                    fontSize: "0.9375rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      padding: "8px",
                      borderRadius: "50%",
                    }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>
                    Excellent! No code quality issues found in active codebase.
                  </span>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="sonar-issues-table">
                    <thead>
                      <tr>
                        <th>Rule ID</th>
                        <th>Severity</th>
                        <th>Type</th>
                        <th>Issue Message</th>
                        <th>File Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sonarReport.issues.map((issue) => (
                        <tr key={issue.id}>
                          <td
                            className="font-mono"
                            style={{
                              color: "var(--color-indigo)",
                              fontSize: "0.8125rem",
                              fontWeight: "600",
                            }}
                          >
                            {issue.id}
                          </td>
                          <td>
                            <span
                              className={`issue-severity ${issue.severity}`}
                            >
                              {issue.severity.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontWeight: "500" }}>{issue.type}</td>
                          <td style={{ color: "white" }}>{issue.message}</td>
                          <td
                            className="font-mono"
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {issue.file}#L{issue.line}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab content: Secrets & Variables Manager */}
        {activeTab === "secrets" && (
          <section
            className="secrets-container"
            style={{ animation: "fade-in 0.2s ease-out", marginTop: "2rem" }}
          >
            <div
              className="grid-container"
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr",
                gap: "2rem",
                marginTop: 0,
              }}
            >
              {/* Left Panel: Variables list */}
              <div className="glass-card" style={{ padding: "2rem" }}>
                <h3
                  className="font-display"
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    marginBottom: "0.25rem",
                  }}
                >
                  Active Environment Variables & Secrets
                </h3>
                <p className="metric-desc" style={{ marginBottom: "1.5rem" }}>
                  These key-value pairs are injected into your build container
                  and runtime environments during deployment.
                </p>

                <div style={{ overflowX: "auto" }}>
                  <table
                    className="sonar-issues-table"
                    style={{ width: "100%" }}
                  >
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Scope</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {secretsList.map((secret) => (
                        <tr
                          key={secret.id}
                          data-testid={`secret-row-${secret.name}`}
                        >
                          <td
                            className="font-mono"
                            style={{
                              color: "var(--color-indigo)",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                            }}
                          >
                            {secret.name}
                          </td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.05)",
                              }}
                            >
                              {secret.scope}
                            </span>
                          </td>
                          <td
                            style={{
                              textTransform: "capitalize",
                              fontWeight: "500",
                            }}
                          >
                            {secret.type === "secret" ? "Secret" : "Plain Text"}
                          </td>
                          <td
                            className="font-mono"
                            style={{ fontSize: "0.875rem", color: "white" }}
                          >
                            <span data-testid={`secret-value-${secret.name}`}>
                              {secret.isRevealed ? secret.value : "••••••••"}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "0.5rem",
                              }}
                            >
                              {secret.type === "secret" && (
                                <button
                                  onClick={() =>
                                    handleToggleSecretReveal(secret.id)
                                  }
                                  className="secondary-button"
                                  style={{
                                    padding: "4px 10px",
                                    fontSize: "0.75rem",
                                  }}
                                  data-testid={`reveal-btn-${secret.name}`}
                                >
                                  {secret.isRevealed ? "Hide" : "Show"}
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteSecret(secret.id)}
                                className="action-button secondary"
                                style={{
                                  padding: "4px 10px",
                                  fontSize: "0.75rem",
                                  background: "rgba(239, 68, 68, 0.1)",
                                  border: "1px solid rgba(239, 68, 68, 0.2)",
                                  color: "var(--color-rose)",
                                }}
                                data-testid={`delete-btn-${secret.name}`}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Panel: Add Form */}
              <div className="glass-card" style={{ padding: "2rem" }}>
                <h3
                  className="font-display"
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    marginBottom: "0.25rem",
                  }}
                >
                  Add Variable / Secret
                </h3>
                <p className="metric-desc" style={{ marginBottom: "1.5rem" }}>
                  Define a new parameter to inject.
                </p>

                {showSecretSuccess && (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid var(--color-emerald)",
                      borderRadius: "6px",
                      padding: "0.75rem",
                      color: "var(--color-emerald)",
                      fontSize: "0.8125rem",
                      fontWeight: "600",
                      marginBottom: "1.25rem",
                    }}
                  >
                    Variable added successfully!
                  </div>
                )}

                <form onSubmit={handleSecretSubmit}>
                  {/* Name Input */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label
                      htmlFor="secret-name-input"
                      style={{
                        display: "block",
                        fontSize: "0.8125rem",
                        fontWeight: "600",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Variable Name
                    </label>
                    <input
                      id="secret-name-input"
                      type="text"
                      name="name"
                      value={secretForm.name}
                      placeholder="e.g. AWS_SECRET_ACCESS_KEY"
                      onChange={handleSecretFormChange}
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: `1px solid ${secretErrors.name ? "var(--color-rose)" : "rgba(255, 255, 255, 0.1)"}`,
                        color: "white",
                        outline: "none",
                        fontSize: "0.8125rem",
                        fontFamily: "monospace",
                      }}
                    />
                    {secretErrors.name && (
                      <span
                        style={{
                          display: "block",
                          color: "var(--color-rose)",
                          fontSize: "0.75rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        {secretErrors.name}
                      </span>
                    )}
                  </div>

                  {/* Value Input */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label
                      htmlFor="secret-value-input"
                      style={{
                        display: "block",
                        fontSize: "0.8125rem",
                        fontWeight: "600",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Variable Value
                    </label>
                    <textarea
                      id="secret-value-input"
                      name="value"
                      rows="3"
                      value={secretForm.value}
                      placeholder="Enter the parameter value..."
                      onChange={handleSecretFormChange}
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: `1px solid ${secretErrors.value ? "var(--color-rose)" : "rgba(255, 255, 255, 0.1)"}`,
                        color: "white",
                        outline: "none",
                        fontSize: "0.8125rem",
                        fontFamily: "monospace",
                        resize: "vertical",
                      }}
                    />
                    {secretErrors.value && (
                      <span
                        style={{
                          display: "block",
                          color: "var(--color-rose)",
                          fontSize: "0.75rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        {secretErrors.value}
                      </span>
                    )}
                  </div>

                  {/* Type Radio Toggles */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8125rem",
                        fontWeight: "600",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Variable Type
                    </label>
                    <div style={{ display: "flex", gap: "1.5rem" }}>
                      <label
                        htmlFor="type-secret-radio"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.8125rem",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          id="type-secret-radio"
                          type="radio"
                          name="type"
                          value="secret"
                          checked={secretForm.type === "secret"}
                          onChange={handleSecretFormChange}
                        />
                        Secret (Masked)
                      </label>
                      <label
                        htmlFor="type-plain-radio"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.8125rem",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          id="type-plain-radio"
                          type="radio"
                          name="type"
                          value="plain"
                          checked={secretForm.type === "plain"}
                          onChange={handleSecretFormChange}
                        />
                        Plain Text
                      </label>
                    </div>
                  </div>

                  {/* Environment Scope */}
                  <div style={{ marginBottom: "1.75rem" }}>
                    <label
                      htmlFor="secret-scope-select"
                      style={{
                        display: "block",
                        fontSize: "0.8125rem",
                        fontWeight: "600",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Environment Scope
                    </label>
                    <select
                      id="secret-scope-select"
                      name="scope"
                      value={secretForm.scope}
                      onChange={handleSecretFormChange}
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "white",
                        outline: "none",
                        fontSize: "0.8125rem",
                      }}
                    >
                      <option
                        value="All Environments"
                        style={{ background: "#0a0c10" }}
                      >
                        All Environments
                      </option>
                      <option
                        value="Production"
                        style={{ background: "#0a0c10" }}
                      >
                        Production
                      </option>
                      <option value="Staging" style={{ background: "#0a0c10" }}>
                        Staging
                      </option>
                      <option
                        value="Development"
                        style={{ background: "#0a0c10" }}
                      >
                        Development
                      </option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="action-button primary"
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      fontSize: "0.8125rem",
                    }}
                  >
                    Add Variable
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* Tab content: Live Pipeline API */}
        {activeTab === "live-pipeline" && (
          <section style={{ animation: "fade-in 0.2s ease-out", marginTop: "2rem" }}>
            <div className="glass-card" style={{ padding: "0", overflow: "hidden", borderRadius: "16px", height: "80vh", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <iframe
                src="/services/pipeline-service/"
                style={{ width: "100%", height: "100%", border: "none", background: "#0b0f19" }}
                title="Live Pipeline Service"
              />
            </div>
          </section>
        )}

        {/* Tab content: Live Sonar API */}
        {activeTab === "live-sonar" && (
          <section style={{ animation: "fade-in 0.2s ease-out", marginTop: "2rem" }}>
            <div className="glass-card" style={{ padding: "0", overflow: "hidden", borderRadius: "16px", height: "80vh", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <iframe
                src="/services/sonar-service/"
                style={{ width: "100%", height: "100%", border: "none", background: "#09090e" }}
                title="Live Sonar Service"
              />
            </div>
          </section>
        )}

        {/* Tab content: Live Secrets API */}
        {activeTab === "live-secrets" && (
          <section style={{ animation: "fade-in 0.2s ease-out", marginTop: "2rem" }}>
            <div className="glass-card" style={{ padding: "0", overflow: "hidden", borderRadius: "16px", height: "80vh", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <iframe
                src="/services/secrets-service/"
                style={{ width: "100%", height: "100%", border: "none", background: "#0b0709" }}
                title="Live Secrets Service"
              />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          © {new Date().getFullYear()} FlowOps Pipeline Orchestrator. with
          GitHub Actions & SonarQube.
        </p>
      </footer>
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          data-testid="settings-modal"
        >
          <div
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "2rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
              color: "white",
            }}
          >
            <h3
              className="font-display"
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                marginBottom: "1.5rem",
              }}
            >
              Pipeline Settings Configuration
            </h3>

            {showSettingsSuccess ? (
              <div
                style={{
                  padding: "2rem 1rem",
                  textAlign: "center",
                  color: "var(--color-emerald)",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Settings saved successfully!
              </div>
            ) : (
              <form onSubmit={handleSettingsSubmit}>
                {/* Target Environment */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    htmlFor="env-select"
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Target Environment
                  </label>
                  <select
                    id="env-select"
                    name="environment"
                    value={formState.environment}
                    onChange={handleSettingsChange}
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      outline: "none",
                    }}
                  >
                    <option
                      value="production"
                      style={{ background: "#0a0c10" }}
                    >
                      Production
                    </option>
                    <option value="staging" style={{ background: "#0a0c10" }}>
                      Staging
                    </option>
                    <option
                      value="development"
                      style={{ background: "#0a0c10" }}
                    >
                      Development
                    </option>
                  </select>
                </div>

                {/* Build Timeout */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    htmlFor="timeout-input"
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Build Timeout (Minutes)
                  </label>
                  <input
                    id="timeout-input"
                    type="number"
                    name="timeout"
                    value={formState.timeout}
                    onChange={handleSettingsChange}
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: `1px solid ${formErrors.timeout ? "var(--color-rose)" : "rgba(255, 255, 255, 0.1)"}`,
                      color: "white",
                      outline: "none",
                    }}
                  />
                  {formErrors.timeout && (
                    <span
                      style={{
                        display: "block",
                        color: "var(--color-rose)",
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {formErrors.timeout}
                    </span>
                  )}
                </div>

                {/* Toggles */}
                <div
                  style={{
                    display: "flex",
                    gap: "2rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <label
                    htmlFor="security-checkbox"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.8125rem",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      id="security-checkbox"
                      type="checkbox"
                      name="runSecurity"
                      checked={formState.runSecurity}
                      onChange={handleSettingsChange}
                      style={{ cursor: "pointer" }}
                    />
                    Run Security Scan
                  </label>
                  <label
                    htmlFor="docker-checkbox"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.8125rem",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      id="docker-checkbox"
                      type="checkbox"
                      name="pushDocker"
                      checked={formState.pushDocker}
                      onChange={handleSettingsChange}
                      style={{ cursor: "pointer" }}
                    />
                    Push Docker Image
                  </label>
                </div>

                {/* Slack Webhook */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <label
                    htmlFor="webhook-input"
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Slack Notification Webhook URL (Optional)
                  </label>
                  <input
                    id="webhook-input"
                    type="text"
                    name="slackWebhook"
                    value={formState.slackWebhook}
                    placeholder="https://hooks.slack.com/services/..."
                    onChange={handleSettingsChange}
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: `1px solid ${formErrors.slackWebhook ? "var(--color-rose)" : "rgba(255, 255, 255, 0.1)"}`,
                      color: "white",
                      outline: "none",
                      fontSize: "0.8125rem",
                    }}
                  />
                  {formErrors.slackWebhook && (
                    <span
                      style={{
                        display: "block",
                        color: "var(--color-rose)",
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {formErrors.slackWebhook}
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.75rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="secondary-button"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="action-button"
                    style={{ padding: "0.5rem 1.25rem", fontSize: "0.8125rem" }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
