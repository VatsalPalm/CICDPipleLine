import React, { useState } from 'react'

// Simulated data for the pipeline stages
const STAGE_DETAILS = {
  build: {
    title: 'Code Compilation & Build',
    status: 'completed',
    duration: '1m 24s',
    logs: [
      '[08:00:01] Git clone completed successfully.',
      '[08:00:03] Installing dependencies using yarn...',
      '[08:01:12] Yarn install completed in 69s.',
      '[08:01:13] Running production build command...',
      '[08:01:25] Assets optimized. Build successful.'
    ]
  },
  test: {
    title: 'Unit & Integration Testing',
    status: 'completed',
    duration: '45s',
    logs: [
      '[08:01:26] Initiating test runners...',
      '[08:01:28] Running Jest suite (142 unit tests)...',
      '[08:01:45] Unit tests passed (142/142).',
      '[08:01:46] Running Cypress integration suite (24 tests)...',
      '[08:02:11] All integration tests passed (24/24).'
    ]
  },
  security: {
    title: 'SAST & Dependency Vulnerability Scan',
    status: 'running',
    duration: 'In Progress...',
    logs: [
      '[08:02:12] Starting SonarQube quality gate analysis...',
      '[08:02:15] Dependency vulnerability check in progress (npm audit / OWASP)...',
      '[08:02:22] [INFO] No critical vulnerabilities found in yarn.lock.',
      '[08:02:25] Running static analysis checks...',
      '[08:02:29] Scanning source code directories...'
    ]
  },
  deploy: {
    title: 'Production Blue/Green Deployment',
    status: 'pending',
    duration: 'Pending...',
    logs: [
      '[08:02:30] Waiting for upstream Security pipeline stage to complete...',
      '[08:02:30] Blue/Green deployment target cluster: aws-us-east-eks-01',
      '[08:02:30] Deployment pending...'
    ]
  }
}

function App() {
  const [selectedStage, setSelectedStage] = useState('security')
  const [logs, setLogs] = useState(STAGE_DETAILS[selectedStage].logs)
  const [isTriggered, setIsTriggered] = useState(false)

  const handleStageClick = (stageKey) => {
    setSelectedStage(stageKey)
    setLogs(STAGE_DETAILS[stageKey].logs)
  }

  const triggerPipeline = () => {
    setIsTriggered(true)
    setTimeout(() => {
      setIsTriggered(false)
    }, 2000)
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">F</div>
          <span className="logo-text">FlowOps</span>
        </div>
        <nav className="nav-links">
          <a href="#dashboard" className="nav-link active">Dashboard</a>
          <a href="#pipelines" className="nav-link">Pipelines</a>
          <a href="#infrastructure" className="nav-link">Infrastructure</a>
          <a href="#settings" className="nav-link">Settings</a>
        </nav>
        <div>
          <span className="status-badge success">
            <span className="pulse-dot success" style={{ marginRight: '6px' }}></span>
            API v1.0 Stable
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '6px' }}>
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            CI/CD Pipeline Center Active
          </div>
          <h1 className="hero-title">Automate Your Shipping Pipeline</h1>
          <p className="hero-subtitle">
            Welcome to FlowOps. Connect your repositories, construct visual pipelines, and monitor build-test-deploy automation in a single sleek dashboard.
          </p>
        </section>

        {/* Metrics Grid */}
        <section className="grid-container">
          {/* Card 1 */}
          <div className="glass-card">
            <div className="metric-header">
              <span className="metric-title">Pipeline Success Rate</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-emerald)' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="metric-value">99.42%</div>
            <div className="metric-desc">
              <span style={{ color: 'var(--color-emerald)', fontWeight: '600' }}>+0.2%</span> than last week (average 420 builds)
            </div>
            <div style={{ marginTop: '1rem', height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '99.42%', height: '100%', background: 'linear-gradient(90deg, var(--color-indigo), var(--color-emerald))' }}></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card">
            <div className="metric-header">
              <span className="metric-title">Average Build Time</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-cyan)' }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="metric-value">3m 42s</div>
            <div className="metric-desc">
              <span style={{ color: 'var(--color-cyan)', fontWeight: '600' }}>-12 seconds</span> compared to previous release
            </div>
            <div style={{ marginTop: '1rem', height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, var(--color-indigo), var(--color-cyan))' }}></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card">
            <div className="metric-header">
              <span className="metric-title">Production Releases</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-purple)' }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div className="metric-value">1,248</div>
            <div className="metric-desc">
              <span style={{ color: 'var(--color-purple)', fontWeight: '600' }}>3 deployments</span> currently active in sandbox environment
            </div>
            <div style={{ marginTop: '1rem', height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, var(--color-indigo), var(--color-purple))' }}></div>
            </div>
          </div>
        </section>

        {/* Visual Pipeline Card */}
        <section className="glass-card pipeline-visual-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: '700' }}>Active Release Workflow</h2>
              <p className="metric-desc" style={{ marginTop: '0.25rem' }}>Click pipeline stages to inspect execution logs</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={triggerPipeline} 
                className="action-button"
                disabled={isTriggered}
              >
                {isTriggered ? 'Triggering...' : 'Trigger Pipeline Run'}
              </button>
              <button className="secondary-button">Pipeline Settings</button>
            </div>
          </div>

          {/* Pipeline Map Diagram */}
          <div className="pipeline-diagram">
            {/* Pulsing connection line */}
            <div className="pipeline-connection"></div>

            {/* Stage: Build */}
            <div 
              className={`pipeline-node completed ${selectedStage === 'build' ? 'active' : ''}`}
              onClick={() => handleStageClick('build')}
            >
              <div className="pipeline-node-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
              <div className="pipeline-node-label">1. Build Package</div>
            </div>

            {/* Stage: Test */}
            <div 
              className={`pipeline-node completed ${selectedStage === 'test' ? 'active' : ''}`}
              onClick={() => handleStageClick('test')}
            >
              <div className="pipeline-node-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div className="pipeline-node-label">2. Run Tests</div>
            </div>

            {/* Stage: Security */}
            <div 
              className={`pipeline-node active ${selectedStage === 'security' ? 'active' : ''}`}
              onClick={() => handleStageClick('security')}
            >
              <div className="pipeline-node-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="pipeline-node-label">3. Security Scan</div>
            </div>

            {/* Stage: Deploy */}
            <div 
              className={`pipeline-node pending ${selectedStage === 'deploy' ? 'active' : ''}`}
              onClick={() => handleStageClick('deploy')}
            >
              <div className="pipeline-node-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className="pipeline-node-label">4. Deploy Prod</div>
            </div>
          </div>

          {/* Console / Terminal Log Output */}
          <div style={{
            background: '#040508',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginTop: '3.5rem',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              paddingBottom: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`status-badge ${STAGE_DETAILS[selectedStage].status === 'completed' ? 'success' : STAGE_DETAILS[selectedStage].status === 'running' ? 'running' : 'pending'}`}>
                  <span className={`pulse-dot ${STAGE_DETAILS[selectedStage].status === 'completed' ? 'success' : STAGE_DETAILS[selectedStage].status === 'running' ? 'running' : 'pending'}`} style={{ marginRight: '4px' }}></span>
                  {STAGE_DETAILS[selectedStage].status}
                </span>
                <span className="font-display" style={{ fontWeight: '600', fontSize: '0.9375rem' }}>
                  {STAGE_DETAILS[selectedStage].title}
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Duration: {STAGE_DETAILS[selectedStage].duration}
              </span>
            </div>
            <div className="font-mono" style={{ fontSize: '0.8125rem', lineHeight: '1.7', color: '#c1c7d6', maxHeight: '180px', overflowY: 'auto' }}>
              {logs.map((log, index) => (
                <div key={index} style={{
                  color: log.includes('[ERROR]') ? 'var(--color-rose)' : log.includes('[INFO]') ? 'var(--color-cyan)' : 'inherit'
                }}>
                  {log}
                </div>
              ))}
              {STAGE_DETAILS[selectedStage].status === 'running' && (
                <div style={{ color: 'var(--color-cyan)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>
                  <span>●</span> <span>Scanning components... analysis in progress</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">© {new Date().getFullYear()} FlowOps Pipeline Orchestrator. Engineered with React and Vite.</p>
      </footer>
    </div>
  )
}

export default App
