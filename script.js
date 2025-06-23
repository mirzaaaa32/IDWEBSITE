
document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('name');
    const gameIdInput = document.getElementById('gameId');
    const emailInput = document.getElementById('email');
    const generateBtn = document.getElementById('generateBtn');
    const resultContainer = document.getElementById('resultContainer');
    const idCanvas = document.getElementById('idCanvas');
    const idDisplay = document.getElementById('idDisplay');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');
    const finishBtn = document.getElementById('finishBtn');
    const endScreen = document.getElementById('endScreen');
    const finalId = document.getElementById('finalId');
    const restartBtn = document.getElementById('restartBtn');
    const customBgInput = document.getElementById('customBg');
    const customImagePreview = document.getElementById('customImagePreview');
    const customBgGroup = document.getElementById('customBgGroup');

    let selectedBg = 'default';
    let customBgImage = null;
    let generatedId = '';

    // Background selection
    document.querySelectorAll('.bg-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.bg-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedBg = this.dataset.bg;
            
            if (selectedBg === 'custom') {
                customBgGroup.style.display = 'block';
            } else {
                customBgGroup.style.display = 'none';
            }
        });
    });

    // Custom background upload
    customBgInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                customBgImage = new Image();
                customBgImage.onload = function() {
                    customImagePreview.src = e.target.result;
                    customImagePreview.style.display = 'block';
                };
                customBgImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Generate ID
    generateBtn.addEventListener('click', async function() {
        const name = nameInput.value.trim();
        const gameId = gameIdInput.value.trim();
        const email = emailInput.value.trim();

        if (!name || !gameId) {
            alert('Please enter both name and callsign');
            return;
        }

        generateBtn.textContent = 'GENERATING...';
        generateBtn.disabled = true;

        try {
            const response = await fetch('/generate_id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    gameId: gameId,
                    email: email,
                    bgType: selectedBg
                })
            });

            const data = await response.json();

            if (response.ok) {
                generatedId = data.id;
                idDisplay.textContent = generatedId;
                drawIdCard(data.name, data.gameId, data.id);
                resultContainer.style.display = 'block';
                
                if (email && data.emailSent) {
                    alert('ID generated successfully! Check your email for details.');
                } else if (email && !data.emailSent) {
                    alert('ID generated successfully! However, email sending failed.');
                } else {
                    alert('ID generated successfully!');
                }
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error generating ID: ' + error.message);
        }

        generateBtn.textContent = 'GENERATE ID';
        generateBtn.disabled = false;
    });

    function drawIdCard(name, gameId, id) {
        const canvas = idCanvas;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw background
        if (selectedBg === 'custom' && customBgImage) {
            ctx.globalAlpha = 0.3;
            ctx.drawImage(customBgImage, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0;
        }

        // Draw border
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

        // Draw title
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 32px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ELITE ID CARD', canvas.width / 2, 60);

        // Draw ID
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Orbitron, monospace';
        ctx.fillText(id, canvas.width / 2, 140);

        // Draw name
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('AGENT: ' + name.toUpperCase(), canvas.width / 2, 200);

        // Draw game ID
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('CALLSIGN: ' + gameId.toUpperCase(), canvas.width / 2, 240);

        // Draw classification
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('CLASSIFICATION: ELITE', canvas.width / 2, 280);

        // Draw footer
        ctx.fillStyle = '#888888';
        ctx.font = '14px Arial';
        ctx.fillText('AUTHORIZED PERSONNEL ONLY', canvas.width / 2, 320);

        canvas.style.display = 'block';
    }

    // Download functionality
    downloadBtn.addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = `elite-id-${generatedId}.png`;
        link.href = idCanvas.toDataURL();
        link.click();
    });

    // Copy ID functionality
    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(generatedId).then(function() {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'COPIED!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    // Finish button functionality
    finishBtn.addEventListener('click', function() {
        resultContainer.style.display = 'none';
        endScreen.style.display = 'block';
        finalId.textContent = generatedId;
    });

    // Restart button functionality
    restartBtn.addEventListener('click', function() {
        endScreen.style.display = 'none';
        resultContainer.style.display = 'none';
        nameInput.value = '';
        gameIdInput.value = '';
        emailInput.value = '';
        customBgInput.value = '';
        customImagePreview.style.display = 'none';
        customImagePreview.src = '';
        customBgImage = null;
        selectedBg = 'default';
        document.querySelectorAll('.bg-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.bg === 'default') {
                opt.classList.add('selected');
            }
        });
        customBgGroup.style.display = 'none';
    });
});
