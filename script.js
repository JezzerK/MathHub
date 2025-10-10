// Math Training Hub - Main JavaScript File

// Global state management
const state = {
    totalQuestions: 0,
    correctAnswers: 0,
    currentModule: null,
    currentQuestion: null,
    selectedAnswer: null
};

// Progress tracking
function updateProgress() {
    document.getElementById('total-questions').textContent = state.totalQuestions;
    document.getElementById('correct-answers').textContent = state.correctAnswers;
    const accuracy = state.totalQuestions > 0 ? Math.round((state.correctAnswers / state.totalQuestions) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
}

// Navigation functions
function showModule(moduleName) {
    // Hide all modules
    document.querySelectorAll('.module-content').forEach(module => {
        module.classList.add('hidden');
    });
    
    // Show selected module
    const module = document.getElementById(moduleName + '-module');
    if (module) {
        module.classList.remove('hidden');
        state.currentModule = moduleName;
        
        // Initialize module-specific functionality
        initializeModule(moduleName);
    }
}

function showMainMenu() {
    document.querySelectorAll('.module-content').forEach(module => {
        module.classList.add('hidden');
    });
    state.currentModule = null;
}

function initializeModule(moduleName) {
    switch(moduleName) {
        case 'arithmetic':
            generateArithmeticQuestion();
            break;
        case 'unit-circle':
            generateUnitCircleQuestion();
            break;
        case 'factoring':
            generateFactoringQuestion();
            break;
        case 'derivatives':
            generateDerivativesQuestion();
            break;
    }
}

// Arithmetic Module
function generateArithmeticQuestion() {
    const difficulty = document.getElementById('arithmetic-difficulty').value;
    let maxValue;
    
    switch(difficulty) {
        case 'easy': maxValue = 10; break;
        case 'medium': maxValue = 50; break;
        case 'hard': maxValue = 100; break;
    }
    
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer, question;
    
    switch(operation) {
        case '+':
            num1 = Math.floor(Math.random() * maxValue) + 1;
            num2 = Math.floor(Math.random() * maxValue) + 1;
            answer = num1 + num2;
            question = `${num1} + ${num2} = ?`;
            break;
        case '-':
            num1 = Math.floor(Math.random() * maxValue) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
            question = `${num1} - ${num2} = ?`;
            break;
        case '×':
            num1 = Math.floor(Math.random() * Math.min(maxValue, 12)) + 1;
            num2 = Math.floor(Math.random() * Math.min(maxValue, 12)) + 1;
            answer = num1 * num2;
            question = `${num1} × ${num2} = ?`;
            break;
        case '÷':
            num2 = Math.floor(Math.random() * Math.min(maxValue, 12)) + 1;
            answer = Math.floor(Math.random() * Math.min(maxValue, 12)) + 1;
            num1 = num2 * answer;
            question = `${num1} ÷ ${num2} = ?`;
            break;
    }
    
    state.currentQuestion = { question, answer, type: 'arithmetic' };
    document.getElementById('arithmetic-question').textContent = question;
    document.getElementById('arithmetic-answer').value = '';
    document.getElementById('arithmetic-feedback').textContent = '';
    document.getElementById('arithmetic-feedback').className = 'feedback';
}

function checkArithmeticAnswer() {
    const userAnswer = parseInt(document.getElementById('arithmetic-answer').value);
    const feedback = document.getElementById('arithmetic-feedback');
    
    state.totalQuestions++;
    
    if (userAnswer === state.currentQuestion.answer) {
        state.correctAnswers++;
        feedback.textContent = 'Correct!';
        feedback.className = 'feedback correct';
    } else {
        feedback.textContent = `Incorrect. The answer is ${state.currentQuestion.answer}.`;
        feedback.className = 'feedback incorrect';
    }
    
    updateProgress();
}

// Unit Circle Module
function generateUnitCircleQuestion() {
    const angleFormat = document.getElementById('angle-format').value;
    const answerFormat = document.getElementById('answer-format').value;
    
    // Define angles in both degrees and radians
    const degreeAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
    const radianAngles = [0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2, 2*Math.PI/3, 3*Math.PI/4, 5*Math.PI/6, Math.PI, 7*Math.PI/6, 5*Math.PI/4, 4*Math.PI/3, 3*Math.PI/2, 5*Math.PI/3, 7*Math.PI/4, 11*Math.PI/6];
    
    const questionTypes = ['sin', 'cos', 'tan'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let angle, angleDisplay, answer, question;
    
    if (angleFormat === 'degrees') {
        angle = degreeAngles[Math.floor(Math.random() * degreeAngles.length)];
        angleDisplay = `${angle}°`;
    } else {
        angle = radianAngles[Math.floor(Math.random() * radianAngles.length)];
        angleDisplay = formatRadians(angle);
    }
    
    const radians = angleFormat === 'degrees' ? angle * Math.PI / 180 : angle;
    
    // Get exact fraction values
    const trigValues = getExactTrigValues(radians, questionType);
    
    if (answerFormat === 'fractions') {
        answer = trigValues.fraction;
    } else {
        answer = Math.round(trigValues.decimal * 1000) / 1000;
    }
    
    question = `What is ${questionType}(${angleDisplay})?`;
    
    state.currentQuestion = { 
        question, 
        answer, 
        type: 'unit-circle', 
        angle: angleFormat === 'degrees' ? angle : angle * 180 / Math.PI, 
        questionType,
        angleFormat,
        answerFormat,
        exactValue: trigValues
    };
    
    document.getElementById('unit-circle-question').innerHTML = question;
    
    // Generate answer options
    generateAnswerOptions(answer, answerFormat, trigValues);
    
    // Draw unit circle if enabled
    const showCircle = document.getElementById('show-unit-circle').checked;
    if (showCircle) {
        drawUnitCircle(angleFormat === 'degrees' ? angle : angle * 180 / Math.PI);
    } else {
        clearUnitCircle();
    }
    
    document.getElementById('unit-circle-feedback').textContent = '';
    document.getElementById('unit-circle-feedback').className = 'feedback';
}

// Helper function to get exact trigonometric values
function getExactTrigValues(radians, trigFunction) {
    const angle = radians * 180 / Math.PI;
    let decimal, fraction;
    
    switch(trigFunction) {
        case 'sin':
            decimal = Math.sin(radians);
            fraction = getExactSinValue(angle);
            break;
        case 'cos':
            decimal = Math.cos(radians);
            fraction = getExactCosValue(angle);
            break;
        case 'tan':
            decimal = Math.tan(radians);
            fraction = getExactTanValue(angle);
            break;
    }
    
    return { decimal, fraction };
}

// Exact sin values for common angles
function getExactSinValue(angle) {
    const sinValues = {
        0: '0',
        30: '1/2',
        45: '√2/2',
        60: '√3/2',
        90: '1',
        120: '√3/2',
        135: '√2/2',
        150: '1/2',
        180: '0',
        210: '-1/2',
        225: '-√2/2',
        240: '-√3/2',
        270: '-1',
        300: '-√3/2',
        315: '-√2/2',
        330: '-1/2'
    };
    return sinValues[angle] || Math.round(Math.sin(angle * Math.PI / 180) * 1000) / 1000;
}

// Exact cos values for common angles
function getExactCosValue(angle) {
    const cosValues = {
        0: '1',
        30: '√3/2',
        45: '√2/2',
        60: '1/2',
        90: '0',
        120: '-1/2',
        135: '-√2/2',
        150: '-√3/2',
        180: '-1',
        210: '-√3/2',
        225: '-√2/2',
        240: '-1/2',
        270: '0',
        300: '1/2',
        315: '√2/2',
        330: '√3/2'
    };
    return cosValues[angle] || Math.round(Math.cos(angle * Math.PI / 180) * 1000) / 1000;
}

// Exact tan values for common angles
function getExactTanValue(angle) {
    const tanValues = {
        0: '0',
        30: '√3/3',
        45: '1',
        60: '√3',
        90: 'undefined',
        120: '-√3',
        135: '-1',
        150: '-√3/3',
        180: '0',
        210: '√3/3',
        225: '1',
        240: '√3',
        270: 'undefined',
        300: '-√3',
        315: '-1',
        330: '-√3/3'
    };
    return tanValues[angle] || Math.round(Math.tan(angle * Math.PI / 180) * 1000) / 1000;
}

// Format radians for display
function formatRadians(radians) {
    const commonRadians = {
        0: '0',
        [Math.PI/6]: 'π/6',
        [Math.PI/4]: 'π/4',
        [Math.PI/3]: 'π/3',
        [Math.PI/2]: 'π/2',
        [2*Math.PI/3]: '2π/3',
        [3*Math.PI/4]: '3π/4',
        [5*Math.PI/6]: '5π/6',
        [Math.PI]: 'π',
        [7*Math.PI/6]: '7π/6',
        [5*Math.PI/4]: '5π/4',
        [4*Math.PI/3]: '4π/3',
        [3*Math.PI/2]: '3π/2',
        [5*Math.PI/3]: '5π/3',
        [7*Math.PI/4]: '7π/4',
        [11*Math.PI/6]: '11π/6'
    };
    return commonRadians[radians] || `${radians.toFixed(3)}`;
}

function generateAnswerOptions(correctAnswer, answerFormat, trigValues) {
    const options = [correctAnswer];
    
    // Generate 3 incorrect options
    while (options.length < 4) {
        let option;
        if (answerFormat === 'fractions') {
            // Generate incorrect fraction options
            const commonFractions = ['0', '1/2', '√2/2', '√3/2', '1', '-1/2', '-√2/2', '-√3/2', '-1', '√3/3', '-√3/3'];
            option = commonFractions[Math.floor(Math.random() * commonFractions.length)];
        } else {
            // Generate incorrect decimal options
            option = Math.round((Math.random() * 2 - 1) * 1000) / 1000;
        }
        
        if (!options.includes(option)) {
            options.push(option);
        }
    }
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);
    
    const optionsContainer = document.getElementById('unit-circle-options');
    optionsContainer.innerHTML = '';
    
    options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        
        // Use clean CSS fractions for beautiful rendering
        if (answerFormat === 'fractions' && (option.includes('√') || option.includes('/'))) {
            // Create clean fraction display
            let fractionHTML = option;
            if (option.includes('√')) {
                // Convert √3/2 to clean fraction
                fractionHTML = option.replace(/√(\d+)\/(\d+)/g, '<span class="fraction"><span class="numerator">√$1</span><span class="denominator">$2</span></span>');
                fractionHTML = fractionHTML.replace(/√(\d+)/g, '√$1');
            } else if (option.includes('/')) {
                // Convert 1/2 to clean fraction
                fractionHTML = option.replace(/(\d+)\/(\d+)/g, '<span class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></span>');
            }
            optionElement.innerHTML = fractionHTML;
        } else {
            optionElement.textContent = option;
        }
        
        optionElement.onclick = () => selectAnswer(optionElement, option);
        optionsContainer.appendChild(optionElement);
    });
    
    // No need for MathJax re-rendering with CSS fractions
}

function selectAnswer(element, value) {
    // Remove previous selection
    document.querySelectorAll('.answer-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Select current option
    element.classList.add('selected');
    state.selectedAnswer = value;
}

function drawUnitCircle(angle) {
    const canvas = document.getElementById('unit-circle-canvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw main circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw coordinate axes
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    
    // Horizontal axis (x-axis)
    ctx.beginPath();
    ctx.moveTo(centerX - radius - 20, centerY);
    ctx.lineTo(centerX + radius + 20, centerY);
    ctx.stroke();
    
    // Vertical axis (y-axis)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX, centerY + radius + 20);
    ctx.stroke();
    
    // Draw angle line from center
    const radians = angle * Math.PI / 180;
    const endX = centerX + radius * Math.cos(radians);
    const endY = centerY - radius * Math.sin(radians);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Draw angle label
    ctx.fillStyle = '#4a9eff';
    ctx.font = 'bold 18px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`${angle}°`, centerX + 60, centerY - 30);
    
    // Draw coordinate labels
    ctx.fillStyle = '#b0b0b0';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('1', centerX + radius + 10, centerY - 5);
    ctx.fillText('-1', centerX - radius - 10, centerY - 5);
    ctx.fillText('1', centerX + 5, centerY - radius - 10);
    ctx.fillText('-1', centerX + 5, centerY + radius + 15);
    
    // Draw center point
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}

function clearUnitCircle() {
    const canvas = document.getElementById('unit-circle-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function checkUnitCircleAnswer() {
    const feedback = document.getElementById('unit-circle-feedback');
    
    state.totalQuestions++;
    
    if (state.selectedAnswer === state.currentQuestion.answer) {
        state.correctAnswers++;
        feedback.innerHTML = 'Correct!';
        feedback.className = 'feedback correct';
    } else {
        let correctAnswer = state.currentQuestion.answer;
        
        // Format the correct answer with clean CSS fractions
        if (state.currentQuestion.answerFormat === 'fractions' && (correctAnswer.includes('√') || correctAnswer.includes('/'))) {
            let fractionHTML = correctAnswer;
            if (correctAnswer.includes('√')) {
                // Convert √3/2 to clean fraction
                fractionHTML = correctAnswer.replace(/√(\d+)\/(\d+)/g, '<span class="fraction"><span class="numerator">√$1</span><span class="denominator">$2</span></span>');
                fractionHTML = fractionHTML.replace(/√(\d+)/g, '√$1');
            } else if (correctAnswer.includes('/')) {
                // Convert 1/2 to clean fraction
                fractionHTML = correctAnswer.replace(/(\d+)\/(\d+)/g, '<span class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></span>');
            }
            correctAnswer = fractionHTML;
        }
        
        feedback.innerHTML = `Incorrect. The answer is ${correctAnswer}.`;
        feedback.className = 'feedback incorrect';
    }
    
    updateProgress();
}

// Factoring Module
function generateFactoringQuestion() {
    const type = document.getElementById('factoring-type').value;
    let question, answer;
    
    switch(type) {
        case 'quadratic':
            const a = Math.floor(Math.random() * 3) + 1;
            const b = Math.floor(Math.random() * 10) - 5;
            const c = Math.floor(Math.random() * 10) - 5;
            const d = Math.floor(Math.random() * 10) - 5;
            
            // Generate (ax + b)(cx + d)
            const expanded = `${a * c}x² + ${a * d + b * c}x + ${b * d}`;
            question = `Factor: ${expanded}`;
            answer = `(${a}x + ${b})(${c}x + ${d})`;
            break;
            
        case 'difference-squares':
            const num = Math.floor(Math.random() * 10) + 1;
            question = `Factor: x² - ${num * num}`;
            answer = `(x + ${num})(x - ${num})`;
            break;
            
        case 'perfect-square':
            const coeff = Math.floor(Math.random() * 3) + 1;
            const constant = Math.floor(Math.random() * 10) + 1;
            question = `Factor: ${coeff * coeff}x² + ${2 * coeff * constant}x + ${constant * constant}`;
            answer = `(${coeff}x + ${constant})²`;
            break;
    }
    
    state.currentQuestion = { question, answer, type: 'factoring' };
    document.getElementById('factoring-question').textContent = question;
    document.getElementById('factoring-answer').value = '';
    document.getElementById('factoring-feedback').textContent = '';
    document.getElementById('factoring-feedback').className = 'feedback';
}

function checkFactoringAnswer() {
    const userAnswer = document.getElementById('factoring-answer').value.trim();
    const feedback = document.getElementById('factoring-feedback');
    
    state.totalQuestions++;
    
    // Normalize answers for comparison
    const normalizeAnswer = (ans) => ans.replace(/\s/g, '').toLowerCase();
    
    if (normalizeAnswer(userAnswer) === normalizeAnswer(state.currentQuestion.answer)) {
        state.correctAnswers++;
        feedback.textContent = 'Correct!';
        feedback.className = 'feedback correct';
    } else {
        feedback.textContent = `Incorrect. The answer is ${state.currentQuestion.answer}.`;
        feedback.className = 'feedback incorrect';
    }
    
    updateProgress();
}

// Derivatives Module
function generateDerivativesQuestion() {
    const type = document.getElementById('derivatives-type').value;
    let question, answer;
    
    switch(type) {
        case 'power':
            const power = Math.floor(Math.random() * 5) + 2;
            const coeff = Math.floor(Math.random() * 5) + 1;
            question = `Find the derivative: ${coeff}x^${power}`;
            if (power - 1 === 1) {
                answer = `${coeff * power}x`;
            } else {
                answer = `${coeff * power}x^${power - 1}`;
            }
            break;
            
        case 'product':
            const a = Math.floor(Math.random() * 3) + 1;
            const b = Math.floor(Math.random() * 3) + 1;
            question = `Find the derivative: (${a}x + 1)(${b}x + 2)`;
            answer = `${a * b * 2}x + ${a * 2 + b}`;
            break;
            
        case 'chain':
            const innerCoeff = Math.floor(Math.random() * 3) + 1;
            const outerPower = Math.floor(Math.random() * 3) + 2;
            question = `Find the derivative: (${innerCoeff}x + 1)^${outerPower}`;
            answer = `${outerPower * innerCoeff}(${innerCoeff}x + 1)^${outerPower - 1}`;
            break;
    }
    
    state.currentQuestion = { question, answer, type: 'derivatives' };
    document.getElementById('derivatives-question').textContent = question;
    document.getElementById('derivatives-answer').value = '';
    document.getElementById('derivatives-feedback').textContent = '';
    document.getElementById('derivatives-feedback').className = 'feedback';
}

function checkDerivativesAnswer() {
    const userAnswer = document.getElementById('derivatives-answer').value.trim();
    const feedback = document.getElementById('derivatives-feedback');
    
    state.totalQuestions++;
    
    // Normalize answers for comparison - handle x^1 = x
    const normalizeAnswer = (ans) => {
        return ans.replace(/\s/g, '').toLowerCase()
                  .replace(/x\^1/g, 'x')
                  .replace(/x\^1/g, 'x'); // Handle multiple occurrences
    };
    
    if (normalizeAnswer(userAnswer) === normalizeAnswer(state.currentQuestion.answer)) {
        state.correctAnswers++;
        feedback.textContent = 'Correct!';
        feedback.className = 'feedback correct';
    } else {
        feedback.textContent = `Incorrect. The answer is ${state.currentQuestion.answer}.`;
        feedback.className = 'feedback incorrect';
    }
    
    updateProgress();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Module navigation
    document.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('click', function() {
            const module = this.getAttribute('data-module');
            showModule(module);
        });
    });
    
    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', showMainMenu);
    });
    
    // Arithmetic module
    document.getElementById('check-arithmetic').addEventListener('click', checkArithmeticAnswer);
    document.getElementById('new-arithmetic').addEventListener('click', generateArithmeticQuestion);
    document.getElementById('arithmetic-difficulty').addEventListener('change', generateArithmeticQuestion);
    
    // Unit circle module
    document.getElementById('check-unit-circle').addEventListener('click', checkUnitCircleAnswer);
    document.getElementById('new-unit-circle').addEventListener('click', generateUnitCircleQuestion);
    document.getElementById('angle-format').addEventListener('change', generateUnitCircleQuestion);
    document.getElementById('answer-format').addEventListener('change', generateUnitCircleQuestion);
    document.getElementById('show-unit-circle').addEventListener('change', function() {
        if (this.checked) {
            const angle = state.currentQuestion ? state.currentQuestion.angle : 0;
            drawUnitCircle(angle);
        } else {
            clearUnitCircle();
        }
    });
    
    // Factoring module
    document.getElementById('check-factoring').addEventListener('click', checkFactoringAnswer);
    document.getElementById('new-factoring').addEventListener('click', generateFactoringQuestion);
    document.getElementById('factoring-type').addEventListener('change', generateFactoringQuestion);
    
    // Derivatives module
    document.getElementById('check-derivatives').addEventListener('click', checkDerivativesAnswer);
    document.getElementById('new-derivatives').addEventListener('click', generateDerivativesQuestion);
    document.getElementById('derivatives-type').addEventListener('change', generateDerivativesQuestion);
    
    // Enter key support for input fields
    document.getElementById('arithmetic-answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkArithmeticAnswer();
    });
    
    document.getElementById('factoring-answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkFactoringAnswer();
    });
    
    document.getElementById('derivatives-answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkDerivativesAnswer();
    });
    
    // Initialize progress
    updateProgress();
});
