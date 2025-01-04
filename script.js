const backendUrl = "http://localhost:5001"; // Replace with your backend URL when deployed
let taskId = 0;
let loggedAngle = 0;
let currentTask = null;

document.addEventListener('DOMContentLoaded', () => {
    // Sections
    const instructionSection = document.getElementById("instruction");
    const exampleSection = document.getElementById("example-section");
    const taskSection = document.getElementById("task-section");

    // Buttons
    const exampleButton = document.getElementById("example-button");
    const startTasksButton = document.getElementById("start-tasks-button");
    const submitButton = document.getElementById("submit-button");

    // Task Info
    const taskInfoExample = document.getElementById("task-info");
    const taskInfoTask = document.getElementById("task-info-task");

    // Canvases
    const exampleCanvas = document.getElementById("circle-canvas");
    const taskCanvas = document.getElementById("circle-canvas-task");
    const exampleCtx = exampleCanvas.getContext("2d");
    const taskCtx = taskCanvas.getContext("2d");

    // Display Instruction Section First
    instructionSection.style.display = "block";

    // Handle Navigation to Example
    exampleButton.addEventListener("click", () => {
        instructionSection.style.display = "none";
        exampleSection.style.display = "block";
        loadExample();
    });

    // Handle Navigation to Tasks
    startTasksButton.addEventListener("click", () => {
        exampleSection.style.display = "none";
        taskSection.style.display = "block";
        taskId = 1; // Move to first real task
        loadTask();
    });

    // Handle Task Submission
    submitButton.addEventListener("click", () => {
        fetch(`${backendUrl}/submit-task`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task_id: taskId, logged_angle: loggedAngle })
        }).then(() => {
            taskId++;
            loadTask();
        });
    });

    function drawCircle(ctx, standingAt, facingTo, pointingTo, angle) {
        // Clear the canvas
        ctx.clearRect(0, 0, 500, 500);

        // Draw the circle
        ctx.beginPath();
        ctx.arc(250, 250, 200, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw the upright line (facing direction)
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.lineTo(250, 50);
        ctx.stroke();

        // Draw the pointing line
        const radians = (angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.lineTo(250 + 200 * Math.cos(radians), 250 + 200 * Math.sin(radians));
        ctx.strokeStyle = "orange";
        ctx.stroke();

        // Draw labels
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(standingAt, 250, 270); // Center label
        ctx.fillText(facingTo, 250, 40); // Top label

        // Draw dynamic pointing label
        const x = 250 + 200 * Math.cos(radians);
        const y = 250 + 200 * Math.sin(radians);
        ctx.fillText(pointingTo, x, y);
    }

    function loadExample() {
        fetch(`${backendUrl}/get-task?task_id=0`)
            .then((response) => response.json())
            .then((data) => {
                currentTask = data;
                loggedAngle = data.correct_angle || 301; // Example line pre-set
                taskInfoExample.textContent = `Imagine you are standing at the ${data.standing_at}, facing the ${data.facing_to}, and pointing to the ${data.pointing_to}.`;
                drawCircle(exampleCtx, data.standing_at, data.facing_to, data.pointing_to, loggedAngle);
            });
    }

    function loadTask() {
        fetch(`${backendUrl}/get-task?task_id=${taskId}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    taskInfoTask.textContent = "No more tasks available.";
                    submitButton.style.display = "none";
                } else {
                    currentTask = data;
                    loggedAngle = 0; // Reset the angle
                    taskInfoTask.textContent = `Imagine you are standing at the ${data.standing_at}, facing the ${data.facing_to}, and pointing to the ${data.pointing_to}.`;
                    drawCircle(taskCtx, data.standing_at, data.facing_to, data.pointing_to, loggedAngle);

                    taskCanvas.addEventListener("mousedown", (e) => {
                        const rect = taskCanvas.getBoundingClientRect();
                        const x = e.clientX - rect.left - 250;
                        const y = e.clientY - rect.top - 250;

                        // Compute the angle
                        loggedAngle = (Math.atan2(y, x) * 180) / Math.PI;
                        loggedAngle = (loggedAngle + 360) % 360;

                        // Update the drawing
                        drawCircle(taskCtx, data.standing_at, data.facing_to, data.pointing_to, loggedAngle);
                    });
                }
            });
    }
});