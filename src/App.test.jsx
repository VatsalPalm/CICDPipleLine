import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

describe('FlowOps Dashboard App Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the FlowOps header and developer section title', () => {
    render(<App />);
    expect(screen.getByText('FlowOps')).toBeInTheDocument();
    expect(screen.getByText("Trushar's Development")).toBeInTheDocument();
    expect(screen.getByText('Pipeline Success Rate')).toBeInTheDocument();
    expect(screen.getByText('Average Build Duration')).toBeInTheDocument();
    expect(screen.getByText('Production Releases')).toBeInTheDocument();
  });

  it('allows navigation between tabs', () => {
    render(<App />);
    
    // Default active tab should be pipeline flow
    expect(screen.getByText('Pipeline Flow Chart')).toBeInTheDocument();
    
    const sonarTabButton = screen.getByText(/SonarQube Quality Gate/i);
    fireEvent.click(sonarTabButton);
    
    // Check if SonarQube contents are shown
    expect(screen.getByText('SonarQube Quality Gate Analysis')).toBeInTheDocument();
    expect(screen.getByText('Active Code Quality Issues')).toBeInTheDocument();
    
    const pipelineTabButton = screen.getByText(/Pipeline Flow Chart/i);
    fireEvent.click(pipelineTabButton);
    
    // Check if Pipeline Flow content is restored
    expect(screen.getByText('Pipeline Success Rate')).toBeInTheDocument();
  });

  it('allows clicking different stages in the pipeline to update stage logs', () => {
    render(<App />);
    
    // Let's find the stage button or container
    const buildStage = screen.getByText('Code Compilation & Build');
    fireEvent.click(buildStage);
    
    // Verify it updates active stage
    expect(screen.getByText(/Git clone completed successfully/)).toBeInTheDocument();
    
    const testStage = screen.getByText('Unit & Integration Testing');
    fireEvent.click(testStage);
    
    expect(screen.getByText(/Running Jest suite/)).toBeInTheDocument();
  });

  it('simulates pipeline execution on trigger', () => {
    render(<App />);
    
    const triggerBtn = screen.getByText(/Trigger Pipeline Execution/i);
    fireEvent.click(triggerBtn);
    
    // Verify pipeline is triggered / running state
    expect(screen.getByText(/Pipeline Triggered Successfully/i)).toBeInTheDocument();
    
    // Fast forward to complete the simulation
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // Verify it returns to normal status
    expect(screen.queryByText(/Pipeline Triggered Successfully/i)).not.toBeInTheDocument();
  });

  it('runs SonarQube scanner scan simulation successfully and updates metrics', () => {
    render(<App />);
    
    // Go to SonarQube tab
    const sonarTabButton = screen.getByText(/SonarQube Quality Gate/i);
    fireEvent.click(sonarTabButton);
    
    // Initially, there should be issues listed
    expect(screen.getByText('Active Code Quality Issues')).toBeInTheDocument();
    expect(screen.getByText('SQ-101')).toBeInTheDocument();
    
    // Click scan trigger
    const scanBtn = screen.getByText(/Trigger SonarQube Scanner Scan/i);
    fireEvent.click(scanBtn);
    
    // Running analyzer text should display
    expect(screen.getByText(/Running analyzer process/i)).toBeInTheDocument();
    
    // Fast forward scanner phases (3.2 seconds total delay)
    act(() => {
      vi.advanceTimersByTime(3200);
    });
    
    // Check if scan finishes and displays clean state
    expect(screen.getByText(/Excellent! No code quality issues found in active codebase/i)).toBeInTheDocument();
    expect(screen.queryByText('SQ-101')).not.toBeInTheDocument();
  });
});
