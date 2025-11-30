// Math Training Hub - Main JavaScript File

// Global state management
const state = {
    totalQuestions: 0,
    correctAnswers: 0,
    currentModule: null,
    currentQuestion: null,
    selectedAnswer: null,
    unitCircleRange: { min: 0, max: 360 },
    unitCircleAngleFormat: 'degrees'
};

const UNIT_CIRCLE_DEGREES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
const UNIT_CIRCLE_MAX_BOUNDARY_DEGREES = 360;

// Progress tracking
function updateProgress() {
    document.getElementById('total-questions').textContent = state.totalQuestions;
    document.getElementById('correct-answers').textContent = state.correctAnswers;
    const accuracy = state.totalQuestions > 0 ? Math.round((state.correctAnswers / state.totalQuestions) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
}

// Cookie helpers and stats persistence
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length));
        }
    }
    return null;
}

function saveStatsToCookies() {
    // Persist to cookies (for HTTPS hosting) and localStorage (for file:// testing)
    const tq = String(state.totalQuestions);
    const ca = String(state.correctAnswers);
    setCookie('mth_totalQuestions', tq, 365);
    setCookie('mth_correctAnswers', ca, 365);
    try {
        localStorage.setItem('mth_totalQuestions', tq);
        localStorage.setItem('mth_correctAnswers', ca);
    } catch (e) {
        // ignore storage errors
    }
}

function loadStatsFromCookies() {
    let tq = parseInt(getCookie('mth_totalQuestions'));
    let ca = parseInt(getCookie('mth_correctAnswers'));
    // If cookies are unavailable (common on file://), fall back to localStorage
    if ((isNaN(tq) || tq < 0) || (isNaN(ca) || ca < 0)) {
        try {
            const lsTq = parseInt(localStorage.getItem('mth_totalQuestions'));
            const lsCa = parseInt(localStorage.getItem('mth_correctAnswers'));
            if (!isNaN(lsTq) && lsTq >= 0) tq = lsTq;
            if (!isNaN(lsCa) && lsCa >= 0) ca = lsCa;
        } catch (e) {
            // ignore storage errors
        }
    }
    if (!isNaN(tq) && tq >= 0) state.totalQuestions = tq;
    if (!isNaN(ca) && ca >= 0) state.correctAnswers = ca;
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
            // Ensure unit circle shows immediately if enabled
            setTimeout(() => {
                const showCircle = document.getElementById('show-unit-circle').checked;
                if (showCircle && state.currentQuestion) {
                    const angle = state.currentQuestion.angle; // degrees
                    drawUnitCircle(angle, state.currentQuestion.angleFormat);
                }
            }, 50);
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
    let minValue = parseInt(document.getElementById('min-number').value);
    let maxValue = parseInt(document.getElementById('max-number').value);
    
    // Validate and fix range
    if (minValue > maxValue) {
        [minValue, maxValue] = [maxValue, minValue];
        document.getElementById('min-number').value = minValue;
        document.getElementById('max-number').value = maxValue;
    }
    
    // Ensure minimum values
    if (minValue < 1) minValue = 1;
    if (maxValue < 1) maxValue = 1;
    
    // Get selected operators
    const selectedOperators = [];
    document.querySelectorAll('input[name="operators"]:checked').forEach(checkbox => {
        selectedOperators.push(checkbox.value);
    });
    
    // If no operators selected, default to addition
    if (selectedOperators.length === 0) {
        selectedOperators.push('addition');
    }
    
    const operation = selectedOperators[Math.floor(Math.random() * selectedOperators.length)];
    
    let num1, num2, answer, question;
    
    switch(operation) {
        case 'addition':
            num1 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            num2 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            answer = num1 + num2;
            question = `${num1} + ${num2} = ?`;
            break;
            
        case 'subtraction':
            num1 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            num2 = Math.floor(Math.random() * (num1 - minValue + 1)) + minValue;
            answer = num1 - num2;
            question = `${num1} - ${num2} = ?`;
            break;
            
        case 'multiplication':
            num1 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            num2 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            answer = num1 * num2;
            question = `${num1} × ${num2} = ?`;
            break;
            
        case 'division':
            num2 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            answer = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            num1 = num2 * answer;
            question = `${num1} ÷ ${num2} = ?`;
            break;
            
        case 'squaring':
            num1 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            answer = num1 * num1;
            question = `${num1}² = ?`;
            break;
            
        case 'square-root':
            // Generate perfect squares for square root problems
            const perfectSquare = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            answer = perfectSquare;
            num1 = perfectSquare * perfectSquare;
            question = `√${num1} = ?`;
            break;
    }
    
    state.currentQuestion = { question, answer, type: 'arithmetic', operation };
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
        
        // Auto-advance to next question after 0.5 seconds
        setTimeout(() => {
            generateArithmeticQuestion();
        }, 500);
    } else {
        feedback.textContent = `Incorrect. The answer is ${state.currentQuestion.answer}.`;
        feedback.className = 'feedback incorrect';
    }
    
    updateProgress();
    saveStatsToCookies();
}

// Unit Circle Module
function getNearestUnitCircleAngle(value) {
    if (!UNIT_CIRCLE_DEGREES.length) return null;
    return UNIT_CIRCLE_DEGREES.reduce((closest, angle) => {
        const currentDiff = Math.abs(angle - value);
        const bestDiff = Math.abs(closest - value);
        if (currentDiff < bestDiff) return angle;
        if (currentDiff === bestDiff) return Math.min(closest, angle);
        return closest;
    }, UNIT_CIRCLE_DEGREES[0]);
}

function formatAngleLabel(degrees) {
    const radiansLabel = formatRadians(degrees * Math.PI / 180);
    if (!radiansLabel) return `${degrees}°`;
    if (radiansLabel.includes('π') || radiansLabel === '0' || radiansLabel === '2π') {
        return `${degrees}° (${radiansLabel})`;
    }
    return `${degrees}° (${radiansLabel})`;
}

function parseAngleInputValue(value, format) {
    if (format === 'degrees') {
        const parsed = parseFloat(value);
        return isFinite(parsed) ? parsed : NaN;
    }
    if (typeof value !== 'string') return NaN;
    const cleaned = value.replace(/\s+/g, '').toLowerCase().replace(/π/g, 'pi');
    if (!cleaned) return NaN;
    if (/[^0-9+\-*/().pi]/.test(cleaned)) {
        const numeric = parseFloat(cleaned);
        return isFinite(numeric) ? numeric * (180 / Math.PI) : NaN;
    }
    const expr = cleaned.replace(/pi/g, 'Math.PI');
    try {
        const radians = Function('"use strict";return (' + expr + ');')();
        return typeof radians === 'number' && isFinite(radians) ? radians * (180 / Math.PI) : NaN;
    } catch (err) {
        return NaN;
    }
}

function formatDegreesForInput(degrees, format) {
    const clamped = Math.max(0, Math.min(degrees, UNIT_CIRCLE_MAX_BOUNDARY_DEGREES));
    if (format === 'radians') {
        return formatRadians(clamped * Math.PI / 180);
    }
    const rounded = Math.round(clamped * 1000) / 1000;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function setAngleRangeInputsFromDegrees(minDeg, maxDeg, format) {
    const minInput = document.getElementById('unit-angle-min-input');
    const maxInput = document.getElementById('unit-angle-max-input');
    if (minInput) minInput.value = formatDegreesForInput(minDeg, format);
    if (maxInput) maxInput.value = formatDegreesForInput(maxDeg, format);
}

function updateAngleRangeDisplay() {
    const display = document.getElementById('unit-angle-range-display');
    if (!display) return;
    const { minAngle, maxAngle } = getUnitCircleRangeBounds();
    display.textContent = `${formatAngleLabel(minAngle)} → ${formatAngleLabel(maxAngle)}`;
}

function getUnitCircleRangeBounds(forceFormat) {
    const format = forceFormat || document.getElementById('angle-format').value || 'degrees';
    const minInput = document.getElementById('unit-angle-min-input');
    const maxInput = document.getElementById('unit-angle-max-input');
    let minAngle = parseAngleInputValue(minInput ? minInput.value : '', format);
    let maxAngle = parseAngleInputValue(maxInput ? maxInput.value : '', format);
    if (!isFinite(minAngle)) minAngle = 0;
    if (!isFinite(maxAngle)) maxAngle = UNIT_CIRCLE_MAX_BOUNDARY_DEGREES;
    minAngle = Math.max(0, Math.min(minAngle, UNIT_CIRCLE_MAX_BOUNDARY_DEGREES));
    maxAngle = Math.max(0, Math.min(maxAngle, UNIT_CIRCLE_MAX_BOUNDARY_DEGREES));
    if (minAngle > maxAngle) {
        [minAngle, maxAngle] = [maxAngle, minAngle];
        setAngleRangeInputsFromDegrees(minAngle, maxAngle, format);
    }
    state.unitCircleRange = { min: minAngle, max: maxAngle };
    setAngleRangeInputsFromDegrees(minAngle, maxAngle, format);
    return { minAngle, maxAngle };
}

function getUnitCircleAnglesWithinRange() {
    const { minAngle, maxAngle } = getUnitCircleRangeBounds();
    let withinRange = UNIT_CIRCLE_DEGREES.filter(deg => deg >= minAngle && deg <= maxAngle);
    if (!withinRange.length) {
        const nearest = getNearestUnitCircleAngle(minAngle);
        if (nearest !== null) {
            const format = document.getElementById('angle-format').value || 'degrees';
            state.unitCircleRange = { min: nearest, max: nearest };
            setAngleRangeInputsFromDegrees(nearest, nearest, format);
            withinRange = [nearest];
            updateAngleRangeDisplay();
        } else {
            withinRange = UNIT_CIRCLE_DEGREES.slice();
        }
    }
    return withinRange;
}

function generateUnitCircleQuestion() {
    const angleFormat = document.getElementById('angle-format').value;
    const answerFormat = document.getElementById('answer-format').value;
    
    const questionTypes = ['sin', 'cos', 'tan'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    const anglesPool = getUnitCircleAnglesWithinRange();
    const angleDegrees = anglesPool[Math.floor(Math.random() * anglesPool.length)];
    const radians = angleDegrees * Math.PI / 180;
    const angleDisplay = angleFormat === 'degrees' ? `${angleDegrees}°` : formatRadians(radians);
    
    let answer, question;
    
    // Get exact fraction values
    const trigValues = getExactTrigValues(radians, questionType);
    
    if (answerFormat === 'fractions') {
        // If fraction is a number (decimal), convert it to a fraction string
        if (typeof trigValues.fraction === 'number') {
            // Convert decimal to fraction string for display
            answer = trigValues.fraction.toString();
        } else {
            answer = trigValues.fraction;
        }
    } else {
        answer = Math.round(trigValues.decimal * 1000) / 1000;
    }
    
    question = `What is ${questionType}(${angleDisplay})?`;
    
    state.currentQuestion = { 
        question, 
        answer, 
        type: 'unit-circle', 
        angle: angleDegrees, 
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
        // Use setTimeout to ensure the canvas is ready
        setTimeout(() => {
            drawUnitCircle(angleDegrees, angleFormat);
        }, 10);
    } else {
        clearUnitCircle();
    }
    
    document.getElementById('unit-circle-feedback').textContent = '';
    document.getElementById('unit-circle-feedback').className = 'feedback';
}

// Helper function to get exact trigonometric values
function getExactTrigValues(radians, trigFunction) {
    // Round to the nearest integer degree to avoid floating point drift (e.g., 29.9999999)
    const angle = Math.round((radians * 180) / Math.PI);
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
    // Convert to nearest degree from our supported set to avoid float key issues
    const degrees = Math.round((radians * 180) / Math.PI);
    const degreeToPi = {
        0: '0',
        30: 'π/6',
        45: 'π/4',
        60: 'π/3',
        90: 'π/2',
        120: '2π/3',
        135: '3π/4',
        150: '5π/6',
        180: 'π',
        210: '7π/6',
        225: '5π/4',
        240: '4π/3',
        270: '3π/2',
        300: '5π/3',
        315: '7π/4',
        330: '11π/6',
        360: '2π'
    };
    return degreeToPi[degrees] || `${radians.toFixed(3)}`;
}

function generateAnswerOptions(correctAnswer, answerFormat, trigValues) {
    // Ensure option format matches selection strictly
    const isFractionFormat = answerFormat === 'fractions';
    
    const options = [correctAnswer];
    
    // Always ensure we have exactly 4 options
    const commonFractions = ['0', '1/2', '√2/2', '√3/2', '1', '-1/2', '-√2/2', '-√3/2', '-1', '√3/3', '-√3/3', '2', '-2', '1/√2', '-1/√2', '√2', '-√2', '√3', '-√3'];
    const commonDecimals = [0, 0.5, 0.707, 0.866, 1, -0.5, -0.707, -0.866, -1, 0.577, -0.577, 2, -2, 0.707, -0.707, 1.414, -1.414, 1.732, -1.732];
    
    // Generate 3 incorrect options
    let attempts = 0;
    while (options.length < 4 && attempts < 50) {
        let option;
        if (isFractionFormat) {
            // Only use fraction options
            option = commonFractions[Math.floor(Math.random() * commonFractions.length)];
        } else {
            // Only use decimal options
            option = commonDecimals[Math.floor(Math.random() * commonDecimals.length)];
        }
        
        if (!options.includes(option)) {
            options.push(option);
        }
        attempts++;
    }
    
    // Force exactly 4 options - add defaults if needed
    while (options.length < 4) {
        let newOption;
        if (isFractionFormat) {
            const defaults = ['0', '1', '-1', '1/2', '√2/2', '√3/2', '1/√2', '√3/3'];
            newOption = defaults[options.length - 1] || '0';
        } else {
            const defaults = [0, 1, -1, 0.5, 0.707, 0.866, 0.707, 0.577];
            newOption = defaults[options.length - 1] || 0;
        }
        
        if (!options.includes(newOption)) {
            options.push(newOption);
        } else {
            // If we're still stuck, just add a unique option with proper format
            if (isFractionFormat) {
                options.push(`${newOption}_${options.length}`);
            } else {
                options.push(parseFloat(newOption) + options.length * 0.001);
            }
        }
    }
    
    // Ensure we have exactly 4 options
    if (options.length !== 4) {
        console.warn('Unit circle options count:', options.length, 'Expected: 4');
        // Force 4 options with proper format
        while (options.length < 4) {
            if (isFractionFormat) {
                options.push(`Option${options.length + 1}`);
            } else {
                options.push(0.001 * (options.length + 1));
            }
        }
    }
    
    console.log('Final options array:', options);
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);
    
    const optionsContainer = document.getElementById('unit-circle-options');
    console.log('Options container found:', !!optionsContainer);
    
    if (!optionsContainer) {
        console.error('unit-circle-options element not found!');
        return;
    }
    
    optionsContainer.innerHTML = '';
    
    // Always create exactly 4 options
    for (let i = 0; i < 4; i++) {
        const option = (typeof options[i] !== 'undefined') ? options[i] : `Option${i + 1}`;
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        
        // Render as text; ensure no decimals leak into fraction mode
        if (isFractionFormat && typeof option === 'number') {
            // Convert any accidental numeric into a reasonable fraction label
            // Fallback map for common decimals
            const decimalToFraction = {
                '0': '0',
                '0.5': '1/2',
                '0.707': '√2/2',
                '0.866': '√3/2',
                '1': '1',
                '-0.5': '-1/2',
                '-0.707': '-√2/2',
                '-0.866': '-√3/2',
                '-1': '-1',
                '0.577': '√3/3',
                '-0.577': '-√3/3'
            };
            const key = option.toString();
            optionElement.textContent = decimalToFraction[key] || '0';
        } else {
            optionElement.textContent = option;
        }
        
        optionElement.onclick = () => selectAnswer(optionElement, option);
        optionsContainer.appendChild(optionElement);
    }
    
    console.log('Created', optionsContainer.children.length, 'answer options');
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

function drawUnitCircle(angleDegrees, angleFormat = 'degrees') {
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
    const radians = angleDegrees * Math.PI / 180;
    const endX = centerX + radius * Math.cos(radians);
    const endY = centerY - radius * Math.sin(radians);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#ff8c42';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Draw angle label
    ctx.fillStyle = '#ff8c42';
    ctx.font = 'bold 18px Inter';
    ctx.textAlign = 'center';
    const angleLabel = angleFormat === 'degrees' ? `${angleDegrees}°` : formatRadians(radians);
    ctx.fillText(angleLabel, centerX + 60, centerY - 30);
    
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
        
        // Auto-advance to next question after 0.5 seconds
        setTimeout(() => {
            generateUnitCircleQuestion();
        }, 500);
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
    saveStatsToCookies();
}

// Factoring Module
function generateFactoringQuestion() {
    const type = document.getElementById('factoring-type').value;
    let question, answer;
    
    switch(type) {
        case 'quadratic-a1': {
            // (x + b)(x + d), with b,d non-zero
            const b = randomNonZeroInt(-9, 9);
            const d = randomNonZeroInt(-9, 9);
            const A = 1;
            const B = b + d;
            const C = b * d;
            const expanded = formatQuadratic(A, B, C);
            question = `Factor: ${expanded}`;
            answer = `${formatLinearFactor(1, b)}${formatLinearFactor(1, d)}`;
            break;
        }
        case 'quadratic-a-gt-1': {
            // (ax + b)(cx + d) with a,c >= 2 and b,d non-zero
            const a = randomInt(2, 4);
            const c = randomInt(2, 4);
            const b = randomNonZeroInt(-9, 9);
            const d = randomNonZeroInt(-9, 9);
            const A = a * c;
            const B = a * d + b * c;
            const C = b * d;
            const expanded = formatQuadratic(A, B, C);
            question = `Factor: ${expanded}`;
            answer = `${formatLinearFactor(a, b)}${formatLinearFactor(c, d)}`;
            break;
        }
            
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

// Helpers for factoring randomization
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomNonZeroInt(min, max) {
    let n = 0;
    while (n === 0) {
        n = randomInt(min, max);
    }
    return n;
}

// Formatting helpers for clean polynomial display
function formatSign(value) {
    return value < 0 ? '-' : '+';
}

function formatQuadratic(A, B, C) {
    const parts = [];
    // Ax^2
    parts.push(`${A === 1 ? 'x²' : A + 'x²'}`);
    // Bx
    if (B !== 0) {
        parts.push(`${B > 0 ? ' + ' : ' - '}${Math.abs(B)}x`);
    }
    // C
    if (C !== 0) {
        parts.push(`${C > 0 ? ' + ' : ' - '}${Math.abs(C)}`);
    }
    return parts.join('');
}

function formatLinearFactor(aCoeff, constant) {
    const xPart = aCoeff === 1 ? 'x' : `${aCoeff}x`;
    const sign = constant < 0 ? ' - ' : ' + ';
    const absC = Math.abs(constant);
    return `(${xPart}${sign}${absC})`;
}

function checkFactoringAnswer() {
    const userAnswer = document.getElementById('factoring-answer').value.trim();
    const feedback = document.getElementById('factoring-feedback');
    
    state.totalQuestions++;
    
    // Normalize answers for comparison
    const normalizeAnswer = (ans) => {
        if (!ans) return '';
        let s = ans.replace(/\s/g, '').toLowerCase();
        // Clean up sign sequences
        s = s.replace(/\+\-/g, '-').replace(/-\+/g, '-').replace(/--/g, '+');
        // Normalize multiplication symbol variants
        s = s.replace(/×/g, '*');
        // Expand squared parenthetical factors: (expr)^2 or (expr)² -> (expr)(expr)
        // Run repeatedly in case there are multiple squared factors
        const expandSquared = (input) => input.replace(/\(([^()]+)\)\^2/g, '($1)($1)')
                                             .replace(/\(([^()]+)\)²/g, '($1)($1)');
        let prev;
        do { prev = s; s = expandSquared(s); } while (s !== prev);
        // Sort factors so order does not matter
        const factors = s.match(/\([^()]+\)/g);
        if (factors && factors.length >= 1) {
            const cleaned = factors.map(f => f)
                                   .sort()
                                   .join('');
            return cleaned;
        }
        return s;
    };
    
    if (normalizeAnswer(userAnswer) === normalizeAnswer(state.currentQuestion.answer)) {
        state.correctAnswers++;
        feedback.textContent = 'Correct!';
        feedback.className = 'feedback correct';
        
        // Auto-advance to next question after 0.5 seconds
        setTimeout(() => {
            generateFactoringQuestion();
        }, 500);
    } else {
        feedback.textContent = `Incorrect. The answer is ${state.currentQuestion.answer}.`;
        feedback.className = 'feedback incorrect';
    }
    
    updateProgress();
    saveStatsToCookies();
}

// Derivatives Module
function generateDerivativesQuestion() {
    const type = document.getElementById('derivatives-type').value;
    let question, answer;
    
    switch(type) {
        case 'power':
            const power = Math.floor(Math.random() * 5) + 2;
            const coeff = Math.floor(Math.random() * 5) + 1;
            question = `Find the derivative: ${formatSuperscript(`${coeff}x^${power}`)}`;
            if (power - 1 === 1) {
                answer = `${coeff * power}x`;
            } else {
                answer = `${coeff * power}x^${power - 1}`;
            }
            break;
            
        case 'product':
            const a = Math.floor(Math.random() * 3) + 1;
            const b = Math.floor(Math.random() * 3) + 1;
            question = `Find the derivative: ${formatSuperscript(`(${a}x + 1)(${b}x + 2)`)}`;
            answer = `${a * b * 2}x + ${a * 2 + b}`;
            break;
            
        case 'chain':
            const innerCoeff = Math.floor(Math.random() * 3) + 1;
            const outerPower = Math.floor(Math.random() * 3) + 2;
            question = `Find the derivative: ${formatSuperscript(`(${innerCoeff}x + 1)^${outerPower}`)}`;
            answer = `${outerPower * innerCoeff}(${innerCoeff}x + 1)^${outerPower - 1}`;
            break;
    }
    
    state.currentQuestion = { question, answer, type: 'derivatives' };
    document.getElementById('derivatives-question').innerHTML = question;
    document.getElementById('derivatives-answer').value = '';
    document.getElementById('derivatives-feedback').textContent = '';
    document.getElementById('derivatives-feedback').className = 'feedback';
}

function sanitizeForDerivativeEval(expr) {
    if (!expr) return null;
    let sanitized = expr.replace(/\s+/g, '')
                        .toLowerCase()
                        .replace(/×/g, '*')
                        .replace(/÷/g, '/');
    if (/[^0-9x+\-*/().^]/.test(sanitized)) {
        return null;
    }
    sanitized = sanitized.replace(/\^/g, '**');
    sanitized = sanitized.replace(/(\d)(x)/g, '$1*$2')
                         .replace(/(\d)(\()/g, '$1*$2')
                         .replace(/(x)(\d)/g, '$1*$2')
                         .replace(/(x)(\()/g, '$1*$2')
                         .replace(/(\))([0-9x])/g, '$1*$2')
                         .replace(/(\))(\()/g, '$1*$2');
    return sanitized;
}

function derivativeExpressionsMatch(exprA, exprB) {
    const sanitizedA = sanitizeForDerivativeEval(exprA);
    const sanitizedB = sanitizeForDerivativeEval(exprB);
    if (!sanitizedA || !sanitizedB) return false;
    try {
        const fnA = new Function('x', `return ${sanitizedA};`);
        const fnB = new Function('x', `return ${sanitizedB};`);
        const testValues = [-3, -1, 0, 1, 2];
        for (const x of testValues) {
            const valA = Number(fnA(x));
            const valB = Number(fnB(x));
            if (!isFinite(valA) || !isFinite(valB) || Math.abs(valA - valB) > 1e-6) {
                return false;
            }
        }
        return true;
    } catch (err) {
        console.warn('Derivative expression comparison failed:', err);
        return false;
    }
}

function checkDerivativesAnswer() {
    const userAnswer = document.getElementById('derivatives-answer').value.trim();
    const feedback = document.getElementById('derivatives-feedback');
    
    state.totalQuestions++;
    
    // Normalize answers for comparison so algebraically equivalent strings match
    const normalizeAnswer = (ans) => {
        if (!ans) return '';
        let normalized = ans.replace(/\s+/g, '').toLowerCase();
        normalized = normalized
            .replace(/([a-z])\^1(?![0-9/\.])/g, '$1')      // collapse variable^1 -> variable
            .replace(/([\)\]\}])\^1(?![0-9/\.])/g, '$1')   // collapse (expr)^1 -> expr
            .replace(/(^|[^0-9])1([a-z])/g, '$1$2')        // collapse 1x -> x (respect multi-digit coeffs)
            .replace(/(^|[^0-9])1([\(\[\{])/g, '$1$2');    // collapse 1(expr) -> (expr)
        return normalized;
    };
    
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(state.currentQuestion.answer);
    
    if (normalizedUser === normalizedCorrect || derivativeExpressionsMatch(userAnswer, state.currentQuestion.answer)) {
        state.correctAnswers++;
        feedback.innerHTML = 'Correct!';
        feedback.className = 'feedback correct';
        
        // Auto-advance to next question after 0.5 seconds
        setTimeout(() => {
            generateDerivativesQuestion();
        }, 500);
    } else {
        // Render answer with superscripts for display
        const formatted = formatSuperscript(state.currentQuestion.answer);
        feedback.innerHTML = `Incorrect. The answer is ${formatted}.`;
        feedback.className = 'feedback incorrect';
    }
    
    updateProgress();
    saveStatsToCookies();
}

// Utility: convert caret exponents like x^2 and (...)^3 into superscripts for display
function formatSuperscript(expr) {
    if (!expr) return '';
    let html = expr
        // Replace ^number with superscript number
        .replace(/\^(\d+)/g, (_, p1) => `<sup>${p1}</sup>`)
        // Replace ^(digits) too if present
        .replace(/\^\((\d+)\)/g, (_, p1) => `<sup>${p1}</sup>`)
        // Keep parentheses and operators as-is
        ;
    return html;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load saved stats first
    loadStatsFromCookies();
    updateProgress();
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
    document.getElementById('min-number').addEventListener('change', generateArithmeticQuestion);
    document.getElementById('max-number').addEventListener('change', generateArithmeticQuestion);
    
    // Add event listeners for operator checkboxes
    document.querySelectorAll('input[name="operators"]').forEach(checkbox => {
        checkbox.addEventListener('change', generateArithmeticQuestion);
    });
    
    // Unit circle module
    document.getElementById('check-unit-circle').addEventListener('click', checkUnitCircleAnswer);
    document.getElementById('new-unit-circle').addEventListener('click', generateUnitCircleQuestion);
    const angleFormatSelect = document.getElementById('angle-format');
    if (angleFormatSelect) {
        state.unitCircleAngleFormat = angleFormatSelect.value || 'degrees';
        angleFormatSelect.addEventListener('change', function() {
            const previousFormat = state.unitCircleAngleFormat || 'degrees';
            const { minAngle, maxAngle } = getUnitCircleRangeBounds(previousFormat);
            state.unitCircleAngleFormat = this.value;
            setAngleRangeInputsFromDegrees(minAngle, maxAngle, this.value);
            updateAngleRangeDisplay();
            generateUnitCircleQuestion();
        });
    }
    document.getElementById('answer-format').addEventListener('change', generateUnitCircleQuestion);
    ['unit-angle-min-input', 'unit-angle-max-input'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', () => {
                const format = document.getElementById('angle-format').value || 'degrees';
                const { minAngle, maxAngle } = getUnitCircleRangeBounds(format);
                setAngleRangeInputsFromDegrees(minAngle, maxAngle, format);
                updateAngleRangeDisplay();
                generateUnitCircleQuestion();
            });
        }
    });
    document.getElementById('show-unit-circle').addEventListener('change', function() {
        if (this.checked) {
            const angle = state.currentQuestion ? state.currentQuestion.angle : 0; // degrees
            const angleFormat = state.currentQuestion ? state.currentQuestion.angleFormat : 'degrees';
            // Use setTimeout to ensure immediate display
            setTimeout(() => {
                drawUnitCircle(angle, angleFormat);
            }, 10);
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
    
    // Progress was initialized above from cookies
    updateAngleRangeDisplay();
});
