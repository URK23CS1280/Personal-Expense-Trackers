let expenses = [];
let incomeList = [];
let totalIncome = 0;
let totalExpenses = 0;
let budgetLimit = 0;

const expenseTable = document.querySelector("#expenseTable tbody");
const ctxPie = document.getElementById("expenseChart");
const ctxLine = document.getElementById("trendChart");

// ---------- CHARTS ----------
let pieChart = new Chart(ctxPie, {
  type: "pie",
  data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
  options: { plugins: { legend: { position: "bottom" } } },
});

let lineChart = new Chart(ctxLine, {
  type: "line",
  data: { labels: [], datasets: [{ label: "Expenses", data: [], borderColor: "#764ba2", fill: false }] },
  options: { responsive: true },
});

// ---------- UPDATE UI ----------
function updateDashboard() {
  totalIncome = incomeList.reduce((sum, i) => sum + i.amount, 0);
  totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savings = totalIncome - totalExpenses;

  document.getElementById("totalIncome").innerText = `₹${totalIncome}`;
  document.getElementById("totalExpenses").innerText = `₹${totalExpenses}`;
  document.getElementById("savings").innerText = `₹${savings}`;
  document.getElementById("budgetLimit").innerText = `₹${budgetLimit}`;

  // Budget Alert
  if (budgetLimit > 0 && totalExpenses > budgetLimit) {
    alert("⚠️ You’ve exceeded your monthly budget!");
  }

  // Update Pie Chart
  const grouped = {};
  expenses.forEach(e => (grouped[e.category] = (grouped[e.category] || 0) + e.amount));

  pieChart.data.labels = Object.keys(grouped);
  pieChart.data.datasets[0].data = Object.values(grouped);
  pieChart.data.datasets[0].backgroundColor = Object.keys(grouped).map(
    () => `hsl(${Math.random() * 360}, 70%, 60%)`
  );
  pieChart.update();

  // Update Line Chart (trend)
  lineChart.data.labels = Object.keys(grouped);
  lineChart.data.datasets[0].data = Object.values(grouped);
  lineChart.update();

  renderTable();
}

// ---------- RENDER EXPENSE TABLE ----------
function renderTable() {
  expenseTable.innerHTML = "";
  expenses.forEach((exp, i) => {
    const row = `
      <tr>
        <td>${exp.category}</td>
        <td>₹${exp.amount}</td>
        <td>${exp.recurring === "yes" ? "Recurring" : "One-time"}</td>
        <td><button onclick="deleteExpense(${i})">❌</button></td>
      </tr>`;
    expenseTable.insertAdjacentHTML("beforeend", row);
  });
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  updateDashboard();
}

// ---------- FORMS ----------
document.getElementById("incomeForm").addEventListener("submit", e => {
  e.preventDefault();
  const source = document.getElementById("incomeSource").value;
  const amount = parseFloat(document.getElementById("incomeAmount").value);
  incomeList.push({ source, amount });
  e.target.reset();
  updateDashboard();
});

document.getElementById("expenseForm").addEventListener("submit", e => {
  e.preventDefault();
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const recurring = document.getElementById("recurring").value;
  expenses.push({ category, amount, recurring });
  e.target.reset();
  updateDashboard();
});

document.getElementById("budgetForm").addEventListener("submit", e => {
  e.preventDefault();
  budgetLimit = parseFloat(document.getElementById("budgetInput").value);
  e.target.reset();
  updateDashboard();
});

// ---------- EXPORT CSV ----------
document.getElementById("exportBtn").addEventListener("click", () => {
  const rows = [["Category", "Amount", "Type"]];
  expenses.forEach(e => rows.push([e.category, e.amount, e.recurring]));
  let csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.csv";
  a.click();
});

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

updateDashboard();
