import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "./App";

describe("FlowOps Dashboard App Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the FlowOps header and developer section title", () => {
    render(<App />);
    expect(screen.getByText("FlowOps")).toBeInTheDocument();
    expect(screen.getByText("Steve's Development")).toBeInTheDocument();
    expect(screen.getByText("Pipeline Success Rate")).toBeInTheDocument();
    expect(screen.getByText("Average Build Duration")).toBeInTheDocument();
    expect(screen.getByText("Production Releases")).toBeInTheDocument();
  });

  it("allows navigation between tabs", () => {
    render(<App />);

    // Default active tab should be pipeline flow
    expect(screen.getByText("Pipeline Flow Chart")).toBeInTheDocument();

    // Target the SonarQube tab button specifically by its role
    const sonarTabButton = screen.getByRole("button", {
      name: /SonarQube Quality Gate/i,
    });
    fireEvent.click(sonarTabButton);

    // Check if SonarQube contents are shown
    expect(screen.getByText("Quality Gate Status")).toBeInTheDocument();
    expect(screen.getByText("Active Code Quality Issues")).toBeInTheDocument();

    // Target the Pipeline tab button specifically by its role
    const pipelineTabButton = screen.getByRole("button", {
      name: /Pipeline Flow Chart/i,
    });
    fireEvent.click(pipelineTabButton);

    // Check if Pipeline Flow content is restored
    expect(screen.getByText("Pipeline Success Rate")).toBeInTheDocument();
  });

  it("allows clicking different stages in the pipeline to update stage logs", () => {
    render(<App />);

    // Find the stage nodes from the diagram labels
    const buildStageNode = screen.getByText(/1\. Build Package/i);
    fireEvent.click(buildStageNode);

    // Verify it updates active stage title and logs
    expect(screen.getByText("Code Compilation & Build")).toBeInTheDocument();
    expect(
      screen.getByText(/Git clone completed successfully/i),
    ).toBeInTheDocument();

    const testStageNode = screen.getByText(/2\. Run Tests/i);
    fireEvent.click(testStageNode);

    expect(screen.getByText("Unit & Integration Testing")).toBeInTheDocument();
    expect(screen.getByText(/Running Jest suite/i)).toBeInTheDocument();
  });

  it("simulates pipeline execution on trigger", () => {
    render(<App />);

    // Find the trigger button by its exact text label
    const triggerBtn = screen.getByRole("button", {
      name: /Trigger Pipeline Run/i,
    });
    fireEvent.click(triggerBtn);

    // Verify pipeline button text changes to active state
    expect(
      screen.getByRole("button", { name: /Triggering\.\.\./i }),
    ).toBeInTheDocument();

    // Fast forward to complete the simulation
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Verify it returns to normal status
    expect(
      screen.getByRole("button", { name: /Trigger Pipeline Run/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Triggering\.\.\./i }),
    ).not.toBeInTheDocument();
  });

  it("runs SonarQube scanner scan simulation successfully and updates metrics", () => {
    render(<App />);

    // Go to SonarQube tab
    const sonarTabButton = screen.getByRole("button", {
      name: /SonarQube Quality Gate/i,
    });
    fireEvent.click(sonarTabButton);

    // Initially, there should be issues listed
    expect(screen.getByText("Active Code Quality Issues")).toBeInTheDocument();
    expect(screen.getByText("SQ-101")).toBeInTheDocument();

    // Click scan trigger
    const scanBtn = screen.getByRole("button", {
      name: /Trigger Quality Scan/i,
    });
    fireEvent.click(scanBtn);

    // Button changes state and running analyzer text is displayed
    expect(
      screen.getByRole("button", { name: /Scanning Code\.\.\./i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Running analyzer process/i)).toBeInTheDocument();

    // Fast forward scanner phases (3.2 seconds total delay)
    act(() => {
      vi.advanceTimersByTime(3200);
    });

    // Check if scan finishes and displays clean state
    expect(
      screen.getByText(
        /Excellent! No code quality issues found in active codebase/i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("SQ-101")).not.toBeInTheDocument();
  });

  describe("Pipeline Settings Form Integration Tests", () => {
    it("opens and closes the settings modal", () => {
      render(<App />);

      // Settings modal should not be present initially
      expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();

      // Click "Pipeline Settings" button
      const settingsBtn = screen.getByRole("button", {
        name: /Pipeline Settings/i,
      });
      fireEvent.click(settingsBtn);

      // Modal should now be open
      expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
      expect(
        screen.getByText("Pipeline Settings Configuration"),
      ).toBeInTheDocument();

      // Click "Cancel" button
      const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      // Modal should close
      expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();
    });

    it("renders default form values and handles input changes", () => {
      render(<App />);

      // Open settings modal
      const settingsBtn = screen.getByRole("button", {
        name: /Pipeline Settings/i,
      });
      fireEvent.click(settingsBtn);

      // Check form fields
      const envSelect = screen.getByLabelText(/Target Environment/i);
      const timeoutInput = screen.getByLabelText(/Build Timeout/i);
      const securityCheckbox = screen.getByLabelText(/Run Security Scan/i);
      const dockerCheckbox = screen.getByLabelText(/Push Docker Image/i);
      const webhookInput = screen.getByLabelText(
        /Slack Notification Webhook URL/i,
      );

      // Check defaults
      expect(envSelect.value).toBe("production");
      expect(timeoutInput.value).toBe("10");
      expect(securityCheckbox.checked).toBe(true);
      expect(dockerCheckbox.checked).toBe(true);
      expect(webhookInput.value).toBe("");

      // Edit fields
      fireEvent.change(envSelect, { target: { value: "staging" } });
      fireEvent.change(timeoutInput, { target: { value: "45" } });
      fireEvent.click(dockerCheckbox); // Uncheck push docker
      fireEvent.change(webhookInput, {
        target: { value: "https://hooks.slack.com/services/123" },
      });

      expect(envSelect.value).toBe("staging");
      expect(timeoutInput.value).toBe("45");
      expect(dockerCheckbox.checked).toBe(false);
      expect(webhookInput.value).toBe("https://hooks.slack.com/services/123");
    });

    it("displays validation errors for invalid timeout values", () => {
      render(<App />);

      // Open settings
      fireEvent.click(
        screen.getByRole("button", { name: /Pipeline Settings/i }),
      );

      // Set timeout to 0 (invalid)
      const timeoutInput = screen.getByLabelText(/Build Timeout/i);
      fireEvent.change(timeoutInput, { target: { value: "0" } });

      // Click submit
      const submitBtn = screen.getByRole("button", { name: /Save Changes/i });
      fireEvent.click(submitBtn);

      // Verify validation error
      expect(
        screen.getByText("Timeout must be between 1 and 120 minutes"),
      ).toBeInTheDocument();

      // Set timeout to 150 (invalid)
      fireEvent.change(timeoutInput, { target: { value: "150" } });
      fireEvent.click(submitBtn);

      expect(
        screen.getByText("Timeout must be between 1 and 120 minutes"),
      ).toBeInTheDocument();

      // Modal remains open on validation failure
      expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
    });

    it("displays validation errors for invalid Slack Webhook format", () => {
      render(<App />);

      // Open settings
      fireEvent.click(
        screen.getByRole("button", { name: /Pipeline Settings/i }),
      );

      // Enter invalid webhook URL
      const webhookInput = screen.getByLabelText(
        /Slack Notification Webhook URL/i,
      );
      fireEvent.change(webhookInput, {
        target: { value: "https://invalid-url.com/webhook" },
      });

      // Click submit
      fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

      // Verify validation error
      expect(
        screen.getByText("Webhook must start with https://hooks.slack.com/"),
      ).toBeInTheDocument();

      // Modal remains open
      expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
    });

    it("submits successfully and updates active configuration panel on the dashboard", () => {
      render(<App />);

      // Open settings
      fireEvent.click(
        screen.getByRole("button", { name: /Pipeline Settings/i }),
      );

      // Modify values
      fireEvent.change(screen.getByLabelText(/Target Environment/i), {
        target: { value: "development" },
      });
      fireEvent.change(screen.getByLabelText(/Build Timeout/i), {
        target: { value: "15" },
      });
      fireEvent.click(screen.getByLabelText(/Run Security Scan/i)); // Disable security scan
      fireEvent.change(
        screen.getByLabelText(/Slack Notification Webhook URL/i),
        {
          target: { value: "https://hooks.slack.com/services/ABC" },
        },
      );

      // Click submit
      fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

      // Shows success message inside modal
      expect(
        screen.getByText("Settings saved successfully!"),
      ).toBeInTheDocument();

      // Fast forward success timeout (1.2 seconds delay)
      act(() => {
        vi.advanceTimersByTime(1200);
      });

      // Modal should be closed
      expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();

      // Verify dashboard active config panel updated
      expect(screen.getByTestId("settings-env").textContent).toBe(
        "development",
      );
      expect(screen.getByTestId("settings-timeout").textContent).toBe(
        "15 mins",
      );
      expect(screen.getByTestId("settings-security").textContent).toBe(
        "Disabled",
      );
      expect(screen.getByTestId("settings-docker").textContent).toBe("Enabled"); // Unchanged
      expect(screen.getByTestId("settings-webhook").textContent).toBe(
        "https://hooks.slack.com/services/ABC",
      );
    });
  });

  describe("Secrets & Variables Manager Page Tests", () => {
    it("navigates to Secrets Manager tab and renders the initial list and form", () => {
      render(<App />);

      // Secrets Manager page should not be present initially
      expect(
        screen.queryByText("Active Environment Variables & Secrets"),
      ).not.toBeInTheDocument();

      // Click "Secrets Manager" tab button
      const secretsTabBtn = screen.getAllByRole("button", {
        name: /Secrets Manager/i,
      })[0];
      fireEvent.click(secretsTabBtn);

      // Verification
      expect(
        screen.getByText("Active Environment Variables & Secrets"),
      ).toBeInTheDocument();
      expect(screen.getByText("Add Variable / Secret")).toBeInTheDocument();
      expect(screen.getByText("DOCKER_USERNAME")).toBeInTheDocument();
      expect(screen.getByText("SONAR_TOKEN")).toBeInTheDocument();
    });

    it("verifies default secrets are masked and toggle show/hide reveal works", () => {
      render(<App />);

      // Open page
      fireEvent.click(
        screen.getAllByRole("button", { name: /Secrets Manager/i })[0],
      );

      // DOCKER_USERNAME is plain (revealed) by default
      expect(
        screen.getByTestId("secret-value-DOCKER_USERNAME").textContent,
      ).toBe("vatsalpalm");
      expect(
        screen.queryByTestId("reveal-btn-DOCKER_USERNAME"),
      ).not.toBeInTheDocument(); // no reveal button for plain type

      // SONAR_TOKEN is secret (masked) by default
      expect(screen.getByTestId("secret-value-SONAR_TOKEN").textContent).toBe(
        "••••••••",
      );
      const revealBtn = screen.getByTestId("reveal-btn-SONAR_TOKEN");
      expect(revealBtn.textContent).toBe("Show");

      // Reveal the secret
      fireEvent.click(revealBtn);
      expect(screen.getByTestId("secret-value-SONAR_TOKEN").textContent).toBe(
        "sqa_987654321abcdef0123456789",
      );
      expect(revealBtn.textContent).toBe("Hide");

      // Hide the secret again
      fireEvent.click(revealBtn);
      expect(screen.getByTestId("secret-value-SONAR_TOKEN").textContent).toBe(
        "••••••••",
      );
      expect(revealBtn.textContent).toBe("Show");
    });

    it("validates invalid variable name format", () => {
      render(<App />);

      // Open page
      fireEvent.click(
        screen.getAllByRole("button", { name: /Secrets Manager/i })[0],
      );

      const nameInput = screen.getByLabelText(/Variable Name/i);
      const submitBtn = screen.getByRole("button", { name: /Add Variable/i });

      // Lowercase name (invalid)
      fireEvent.change(nameInput, { target: { value: "lower_case_name" } });
      fireEvent.click(submitBtn);

      expect(
        screen.getByText(
          "Variable Name must only contain uppercase letters, numbers, and underscores, and start with a letter",
        ),
      ).toBeInTheDocument();

      // Starting with number (invalid)
      fireEvent.change(nameInput, { target: { value: "1_VAR_NAME" } });
      fireEvent.click(submitBtn);

      expect(
        screen.getByText(
          "Variable Name must only contain uppercase letters, numbers, and underscores, and start with a letter",
        ),
      ).toBeInTheDocument();

      // Hyphens inside name (invalid)
      fireEvent.change(nameInput, { target: { value: "VAR-NAME" } });
      fireEvent.click(submitBtn);

      expect(
        screen.getByText(
          "Variable Name must only contain uppercase letters, numbers, and underscores, and start with a letter",
        ),
      ).toBeInTheDocument();
    });

    it("validates duplicate variable name check", () => {
      render(<App />);

      // Open page
      fireEvent.click(
        screen.getAllByRole("button", { name: /Secrets Manager/i })[0],
      );

      const nameInput = screen.getByLabelText(/Variable Name/i);
      const submitBtn = screen.getByRole("button", { name: /Add Variable/i });

      // Try duplicate
      fireEvent.change(nameInput, { target: { value: "DOCKER_USERNAME" } });
      fireEvent.click(submitBtn);

      expect(
        screen.getByText("Variable Name already exists"),
      ).toBeInTheDocument();
    });

    it("validates empty inputs validation checks", () => {
      render(<App />);

      // Open page
      fireEvent.click(
        screen.getAllByRole("button", { name: /Secrets Manager/i })[0],
      );

      const submitBtn = screen.getByRole("button", { name: /Add Variable/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText("Variable name is required")).toBeInTheDocument();
      expect(
        screen.getByText("Variable value is required"),
      ).toBeInTheDocument();
    });

    it("adds new variable/secret successfully and clears form inputs", () => {
      render(<App />);

      // Open page
      fireEvent.click(
        screen.getAllByRole("button", { name: /Secrets Manager/i })[0],
      );

      const nameInput = screen.getByLabelText(/Variable Name/i);
      const valueInput = screen.getByLabelText(/Variable Value/i);
      const submitBtn = screen.getByRole("button", { name: /Add Variable/i });

      // Input details
      fireEvent.change(nameInput, { target: { value: "SLACK_TOKEN" } });
      fireEvent.change(valueInput, {
        target: { value: "xoxb-slack-secret-token-key" },
      });

      // Radio buttons are already checked as "secret" by default, scope All Environments by default.
      fireEvent.click(submitBtn);

      // Success alert
      expect(
        screen.getByText("Variable added successfully!"),
      ).toBeInTheDocument();

      // Fields are cleared
      expect(nameInput.value).toBe("");
      expect(valueInput.value).toBe("");

      // Added row appears in table and is masked
      expect(screen.getByText("SLACK_TOKEN")).toBeInTheDocument();
      expect(screen.getByTestId("secret-value-SLACK_TOKEN").textContent).toBe(
        "••••••••",
      );

      // Test toggle reveal on it
      const revealBtn = screen.getByTestId("reveal-btn-SLACK_TOKEN");
      fireEvent.click(revealBtn);
      expect(screen.getByTestId("secret-value-SLACK_TOKEN").textContent).toBe(
        "xoxb-slack-secret-token-key",
      );
    });

    it("allows deleting an environment variable/secret", () => {
      render(<App />);

      // Open page
      fireEvent.click(
        screen.getAllByRole("button", { name: /Secrets Manager/i })[0],
      );

      // API_URL should be visible initially
      expect(screen.getByText("API_URL")).toBeInTheDocument();

      // Click delete button on API_URL
      const deleteBtn = screen.getByTestId("delete-btn-API_URL");
      fireEvent.click(deleteBtn);

      // API_URL should be removed from the document list
      expect(screen.queryByText("API_URL")).not.toBeInTheDocument();
    });
  });
});
