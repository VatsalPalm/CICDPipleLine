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
    
    // Target the SonarQube tab button specifically by its role
    const sonarTabButton = screen.getByRole('button', { name: /SonarQube Quality Gate/i });
    fireEvent.click(sonarTabButton);
    
    // Check if SonarQube contents are shown
    expect(screen.getByText('Quality Gate Status')).toBeInTheDocument();
    expect(screen.getByText('Active Code Quality Issues')).toBeInTheDocument();
    
    // Target the Pipeline tab button specifically by its role
    const pipelineTabButton = screen.getByRole('button', { name: /Pipeline Flow Chart/i });
    fireEvent.click(pipelineTabButton);
    
    // Check if Pipeline Flow content is restored
    expect(screen.getByText('Pipeline Success Rate')).toBeInTheDocument();
  });

  it('allows clicking different stages in the pipeline to update stage logs', () => {
    render(<App />);
    
    // Find the stage nodes from the diagram labels
    const buildStageNode = screen.getByText(/1\. Build Package/i);
    fireEvent.click(buildStageNode);
    
    // Verify it updates active stage title and logs
    expect(screen.getByText('Code Compilation & Build')).toBeInTheDocument();
    expect(screen.getByText(/Git clone completed successfully/i)).toBeInTheDocument();
    
    const testStageNode = screen.getByText(/2\. Run Tests/i);
    fireEvent.click(testStageNode);
    
    expect(screen.getByText('Unit & Integration Testing')).toBeInTheDocument();
    expect(screen.getByText(/Running Jest suite/i)).toBeInTheDocument();
  });

  it('simulates pipeline execution on trigger', () => {
    render(<App />);
    
    // Find the trigger button by its exact text label
    const triggerBtn = screen.getByRole('button', { name: /Trigger Pipeline Run/i });
    fireEvent.click(triggerBtn);
    
    // Verify pipeline button text changes to active state
    expect(screen.getByRole('button', { name: /Triggering\.\.\./i })).toBeInTheDocument();
    
    // Fast forward to complete the simulation
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // Verify it returns to normal status
    expect(screen.getByRole('button', { name: /Trigger Pipeline Run/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Triggering\.\.\./i })).not.toBeInTheDocument();
  });

  it('runs SonarQube scanner scan simulation successfully and updates metrics', () => {
    render(<App />);
    
    // Go to SonarQube tab
    const sonarTabButton = screen.getByRole('button', { name: /SonarQube Quality Gate/i });
    fireEvent.click(sonarTabButton);
    
    // Initially, there should be issues listed
    expect(screen.getByText('Active Code Quality Issues')).toBeInTheDocument();
    expect(screen.getByText('SQ-101')).toBeInTheDocument();
    
    // Click scan trigger
    const scanBtn = screen.getByRole('button', { name: /Trigger Quality Scan/i });
    fireEvent.click(scanBtn);
    
    // Button changes state and running analyzer text is displayed
    expect(screen.getByRole('button', { name: /Scanning Code\.\.\./i })).toBeInTheDocument();
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
