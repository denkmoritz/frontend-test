const backendUrl = "http://localhost:5001"; // Replace with your backend URL when deployed
let taskId = 0;
let loggedAngle = 0;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('circle-canvas');
    const ctx = canvas.getContext('2d');
    const taskInfo = document.getElementById('task-info');

    function drawCircle() {
        // Draw the circle
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(250, 250, 200, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw the upright line
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.lineTo(250, 50);
        ctx.stroke();
    }

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - 250;
        const y = e.clientY - rect.top - 250;

        // Compute the angle
        loggedAngle = (Math.atan2(y, x) * 180) / Math.PI;
        loggedAngle = (loggedAngle + 360) % 360;

        // Draw the line
        drawCircle();
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.lineTo(250 + 200 * Math.cos((loggedAngle * Math.PI) / 180), 250 + 200 * Math.sin((loggedAngle * Math.PI) / 180));
        ctx.strokeStyle = "orange";
        ctx.stroke();
    });

    document.getElementById('submit-button').addEventListener('click', () => {
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
    });

    function loadTask() {
        fetch(`${backendUrl}/get-task?task_id=${taskId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    taskInfo.textContent = "No more tasks available.";
                } else {
                    taskInfo.textContent = `Imagine you are standing at the ${data.standing_at}, facing the ${data.facing_to}, and pointing to the ${data.pointing_to}.`;
                    drawCircle();
                }
            });
    }

    loadTask();
});