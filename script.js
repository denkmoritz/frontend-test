const backendUrl = "http://localhost:5001"; // Replace with your backend URL when deployed
let taskId = 0;
let loggedAngle = 0;
let currentTask = null;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('circle-canvas');
    const ctx = canvas.getContext('2d');
    const taskInfo = document.getElementById('task-info');
    const instruction = document.getElementById('instruction');

    function drawCircle(standingAt, facingTo, pointingTo) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the circle
        ctx.beginPath();
        ctx.arc(250, 250, 200, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw the upright line (facing direction)
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.lineTo(250, 50);
        ctx.stroke();

        // Draw labels
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(standingAt, 250, 270); // Center label
        ctx.fillText(facingTo, 250, 40); // Top label

        // Draw dynamic pointing label
        const angleRadians = (loggedAngle * Math.PI) / 180;
        const x = 250 + 200 * Math.cos(angleRadians);
        const y = 250 + 200 * Math.sin(angleRadians);
        ctx.fillText(pointingTo, x, y);
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - 250;
        const y = e.clientY - rect.top - 250;

        // Compute the angle
        loggedAngle = (Math.atan2(y, x) * 180) / Math.PI;
        loggedAngle = (loggedAngle + 360) % 360;

        // Update the drawing
        drawCircle(currentTask.standing_at, currentTask.facing_to, currentTask.pointing_to);
    });

    document.getElementById('submit-button').addEventListener('click', () => {
        if (taskId === 0) {
            // Move from Task 0 to Task 1
            taskId++;
            instruction.style.display = "none";
        } else {
            fetch(`${backendUrl}/submit-task`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: taskId, logged_angle: loggedAngle })
            })
                .then(response => response.json())
                .then(data => {
                    alert(`Task Submitted! Error: ${data.error}`);
                    taskId++;
                    loadTask();
                });
        }
    });

    function loadTask() {
        fetch(`${backendUrl}/get-task?task_id=${taskId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    taskInfo.textContent = "No more tasks available.";
                } else {
                    currentTask = data;
                    if (taskId === 0) {
                        // Example line for Task 0
                        loggedAngle = data.correct_angle || 301;
                    }
                    taskInfo.textContent = `Imagine you are standing at the ${data.standing_at}, facing the ${data.facing_to}, and pointing to the ${data.pointing_to}.`;
                    drawCircle(data.standing_at, data.facing_to, data.pointing_to);
                }
            });
    }

    loadTask();
});
