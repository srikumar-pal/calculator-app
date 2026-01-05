// ===== Select Elements =====
const display = document.getElementById("result");
const buttons = document.querySelectorAll(".buttons button");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

// ===== State =====
let currentInput = "";
let operatorUsed = false;
let history = JSON.parse(localStorage.getItem("calcHistory")) || [];

// ===== Button Click Handling (Single Source of Truth) =====
buttons.forEach(button => {
    button.addEventListener("click", () => {
        handleInput(button.textContent);
    });
});

// ===== Handle Input =====
function handleInput(value) {

    // Clear
    if (value === "C") {
        currentInput = "";
        display.value = "";
        operatorUsed = false;
        return;
    }

    // Equal
    if (value === "=") {
        if (currentInput === "") return;
        try {
            const expression = currentInput;
            const result = eval(expression).toString();

            display.value = result;
            addToHistory(`${expression} = ${result}`);

            currentInput = result;
            operatorUsed = false;
        } catch {
            display.value = "Error";
            currentInput = "";
        }
        return;
    }

    // Percentage
    if (value === "%") {
        handlePercentage();
        return;
    }

    // Operators
    if (["+", "-", "*", "/"].includes(value)) {
        if (currentInput === "" || operatorUsed) return;
        operatorUsed = true;
        currentInput += value;
        display.value = currentInput;
        return;
    }

    // Decimal
    if (value === ".") {
        handleDecimal();
        return;
    }

    // Numbers
    if (!isNaN(value)) {
        operatorUsed = false;
        currentInput += value;
        display.value = currentInput;
    }
}

// ===== Decimal Logic =====
function handleDecimal() {
    const parts = currentInput.split(/[+\-*/]/);
    const lastPart = parts[parts.length - 1];

    if (lastPart.includes(".")) return;

    if (currentInput === "" || operatorUsed) {
        currentInput += "0.";
    } else {
        currentInput += ".";
    }

    operatorUsed = false;
    display.value = currentInput;
}

// ===== Percentage Logic =====
function handlePercentage() {
    if (currentInput === "") return;

    const match = currentInput.match(/([+\-*/])(\d+\.?\d*)$/);

    if (match) {
        const operator = match[1];
        const number = parseFloat(match[2]);

        let percentValue = number / 100;

        if (operator === "+" || operator === "-") {
            const base = parseFloat(
                currentInput.slice(0, currentInput.lastIndexOf(operator))
            );
            percentValue = (base * number) / 100;
        }

        currentInput =
            currentInput.slice(0, currentInput.lastIndexOf(operator) + 1) +
            percentValue;
    } else {
        currentInput = (parseFloat(currentInput) / 100).toString();
    }

    display.value = currentInput;
    operatorUsed = false;
}

// ===== Keyboard Support =====
document.addEventListener("keydown", (e) => {
    if (e.repeat) return;

    const key = e.key;

    if (!isNaN(key)) {
        handleInput(key);
        return;
    }

    if (["+", "-", "*", "/"].includes(key)) {
        handleInput(key);
        return;
    }

    if (key === ".") {
        handleInput(".");
        return;
    }

    if (key === "%") {
        handleInput("%");
        return;
    }

    if (key === "Enter") {
        handleInput("=");
        return;
    }

    if (key === "Escape") {
        handleInput("C");
        return;
    }

    if (key === "Backspace") {
        currentInput = currentInput.slice(0, -1);
        display.value = currentInput;
        operatorUsed = false;
    }
});

// ===== History Functions =====
function addToHistory(item) {
    history.unshift(item);
    if (history.length > 10) history.pop();

    localStorage.setItem("calcHistory", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = "";
    history.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = entry;
        historyList.appendChild(li);
    });
}

clearHistoryBtn.addEventListener("click", () => {
    history = [];
    localStorage.removeItem("calcHistory");
    renderHistory();
});

// ===== Load History on Start =====
renderHistory();
