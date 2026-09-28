/**
 * =============================================================================
 * PERSONAL EXPENSE TRACKER - Phase 6: Sorting, Filtering & Final Polish
 * =============================================================================
 * LEARNER NOTE - WHAT ARE WE ADDING HERE?
 * In this final phase, we make our data table interactive:
 * 1. Sorting State: Tracking which column is active ('date' or 'amount') and 
 *    in which direction ('asc' for ascending, 'desc' for descending).
 * 2. Array Comparator Functions: How JavaScript's Array.prototype.sort() works, 
 *    and why numeric sorting requires a custom comparator.
 * 3. Dynamic UI Indicators: Showing ▲, ▼, and ⇅ arrows on table headers.
 * 4. Keyboard Accessibility: Allowing users to sort by pressing Enter on headers.
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// 1. CONSTANTS & STORAGE KEY
// -----------------------------------------------------------------------------
const STORAGE_KEY = "personal_expense_tracker_data";

const DEFAULT_SAMPLE_EXPENSES = [
  {
    id: "sample-1",
    date: "2026-09-20",
    description: "Organic Groceries",
    category: "Food & Dining",
    amount: 42.50
  },
  {
    id: "sample-2",
    date: "2026-09-19",
    description: "Subway Metro Pass",
    category: "Transportation",
    amount: 15.00
  },
  {
    id: "sample-3",
    date: "2026-09-18",
    description: "Gym Membership",
    category: "Health & Wellness",
    amount: 130.00
  }
];

// Master in-memory state
let expenses = [];

// -----------------------------------------------------------------------------
// 2. SORTING STATE (Phase 6)
// -----------------------------------------------------------------------------
// Tracks which column is currently sorted, and in what direction.
// By default, we sort by date in descending order (newest first).
// -----------------------------------------------------------------------------
let currentSort = {
  column: "date",     // 'date' | 'amount'
  direction: "desc"   // 'asc' (ascending) | 'desc' (descending)
};

// -----------------------------------------------------------------------------
// 3. DOM ELEMENT SELECTORS
// -----------------------------------------------------------------------------
// Form Elements
const expenseForm = document.getElementById("expense-form");
const dateInput = document.getElementById("expense-date");
const descriptionInput = document.getElementById("expense-description");
const categoryInput = document.getElementById("expense-category");
const amountInput = document.getElementById("expense-amount");

// Table & Empty State Elements
const tableBody = document.getElementById("expenses-table-body");
const emptyState = document.getElementById("empty-state");
const expensesTable = document.getElementById("expenses-table");

// Summary Card Elements
const totalSpendDisplay = document.getElementById("total-spend-display");
const totalCountDisplay = document.getElementById("total-count-display");
const topCategoryDisplay = document.getElementById("top-category-display");
const categoryBreakdownList = document.getElementById("category-breakdown-list");

// Sortable Table Header Elements (Phase 6)
const colDate = document.getElementById("col-date");
const colAmount = document.getElementById("col-amount");
const dateSortIcon = document.getElementById("date-sort-icon");
const amountSortIcon = document.getElementById("amount-sort-icon");
const sortIndicator = document.getElementById("sort-indicator");

// -----------------------------------------------------------------------------
// 4. STORAGE FUNCTIONS: Saving and Loading
// -----------------------------------------------------------------------------
function saveExpensesToStorage() {
  try {
    const jsonString = JSON.stringify(expenses);
    localStorage.setItem(STORAGE_KEY, jsonString);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

function loadExpensesFromStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }
  return null;
}

// -----------------------------------------------------------------------------
// 5. CATEGORY STYLING HELPERS
// -----------------------------------------------------------------------------
function getCategoryBadgeClass(category) {
  switch (category) {
    case "Food & Dining":
      return "badge-food";
    case "Transportation":
      return "badge-transport";
    case "Housing & Utilities":
      return "badge-housing";
    case "Entertainment":
      return "badge-entertainment";
    case "Health & Wellness":
      return "badge-health";
    default:
      return "badge-misc";
  }
}

function getCategoryColor(category) {
  switch (category) {
    case "Food & Dining":
      return "var(--cat-food)";
    case "Transportation":
      return "var(--cat-transport)";
    case "Housing & Utilities":
      return "var(--cat-housing)";
    case "Entertainment":
      return "var(--cat-entertainment)";
    case "Health & Wellness":
      return "var(--cat-health)";
    default:
      return "var(--cat-misc)";
  }
}

// -----------------------------------------------------------------------------
// 6. SECURITY HELPER: HTML Escaping
// -----------------------------------------------------------------------------
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// -----------------------------------------------------------------------------
// 7. ARRAY SORTING LOGIC (Phase 6)
// -----------------------------------------------------------------------------
// CRITICAL JAVASCRIPT GOTCHA:
// By default, [100, 25].sort() outputs [100, 25]!
// Why? Because JavaScript converts values to strings by default, and "1" < "2"!
//
// To sort properly, we MUST pass a "comparator function" (a, b) => number:
// - If the comparator returns a negative number (< 0), 'a' comes before 'b'.
// - If the comparator returns a positive number (> 0), 'b' comes before 'a'.
// - If it returns 0, their order remains unchanged.
// -----------------------------------------------------------------------------
function applySorting() {
  expenses.sort((a, b) => {
    if (currentSort.column === "date") {
      // String comparison works for ISO dates ("2026-09-20")
      // a.localeCompare(b) returns negative if a comes before b alphabetically
      if (currentSort.direction === "asc") {
        return a.date.localeCompare(b.date); // Oldest first
      } else {
        return b.date.localeCompare(a.date); // Newest first
      }
    }

    if (currentSort.column === "amount") {
      // Numeric subtraction comparator
      if (currentSort.direction === "asc") {
        return a.amount - b.amount; // Lowest price first
      } else {
        return b.amount - a.amount; // Highest price first
      }
    }

    return 0;
  });
}

/**
 * Updates the visual indicators in the table headers (arrows, aria-sort, subtitle).
 */
function updateSortHeadersUI() {
  // Update Date Header
  if (currentSort.column === "date") {
    colDate.classList.add("active");
    colDate.setAttribute("aria-sort", currentSort.direction === "asc" ? "ascending" : "descending");
    dateSortIcon.textContent = currentSort.direction === "asc" ? "▲" : "▼";
  } else {
    colDate.classList.remove("active");
    colDate.setAttribute("aria-sort", "none");
    dateSortIcon.textContent = "⇅";
  }

  // Update Amount Header
  if (currentSort.column === "amount") {
    colAmount.classList.add("active");
    colAmount.setAttribute("aria-sort", currentSort.direction === "asc" ? "ascending" : "descending");
    amountSortIcon.textContent = currentSort.direction === "asc" ? "▲" : "▼";
  } else {
    colAmount.classList.remove("active");
    colAmount.setAttribute("aria-sort", "none");
    amountSortIcon.textContent = "⇅";
  }

  // Update descriptive subtitle
  const colName = currentSort.column === "date" ? "Date" : "Amount";
  let dirDescription = "";
  if (currentSort.column === "date") {
    dirDescription = currentSort.direction === "desc" ? "Newest first" : "Oldest first";
  } else {
    dirDescription = currentSort.direction === "desc" ? "Highest first" : "Lowest first";
  }

  if (sortIndicator) {
    sortIndicator.textContent = `Sorted by ${colName} (${dirDescription})`;
  }
}

/**
 * Toggles column sorting when a header is clicked.
 */
function handleSortClick(columnName) {
  if (currentSort.column === columnName) {
    // If clicking the currently active column, flip direction: asc <-> desc
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    // If switching to a new column, default to descending
    currentSort.column = columnName;
    currentSort.direction = "desc";
  }

  // 1. Sort the data array
  applySorting();

  // 2. Update visual indicators
  updateSortHeadersUI();

  // 3. Re-draw the table with the newly ordered rows
  renderExpenses();
}

// -----------------------------------------------------------------------------
// 8. SUMMARY COMPUTATIONS
// -----------------------------------------------------------------------------
function updateSummary() {
  const totalCount = expenses.length;
  totalCountDisplay.textContent = totalCount.toString();

  if (totalCount === 0) {
    totalSpendDisplay.textContent = "$0.00";
    topCategoryDisplay.textContent = "—";
    categoryBreakdownList.innerHTML = `<p class="empty-hint">Add expenses below to see your spending breakdown by category.</p>`;
    return;
  }

  // Calculate total spend using reduce
  const totalSpend = expenses.reduce((accumulator, item) => accumulator + item.amount, 0);
  totalSpendDisplay.textContent = `$${totalSpend.toFixed(2)}`;

  // Group spending by category
  const categoryTotals = {};
  for (const item of expenses) {
    const cat = item.category;
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = 0;
    }
    categoryTotals[cat] += item.amount;
  }

  // Sort categories by highest spend
  const categoryEntries = Object.entries(categoryTotals);
  categoryEntries.sort((a, b) => b[1] - a[1]);

  const [topCategoryName] = categoryEntries[0];
  topCategoryDisplay.textContent = topCategoryName;

  // Render category breakdown progress bars
  const breakdownHTML = categoryEntries.map(([category, amount]) => {
    const percentage = totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0;
    const barColor = getCategoryColor(category);

    return `
      <div class="category-item">
        <div class="category-item-header">
          <span class="category-item-name">
            <span class="badge ${getCategoryBadgeClass(category)}">${escapeHTML(category)}</span>
          </span>
          <span class="category-item-meta">
            $${amount.toFixed(2)}
            <span class="category-item-pct">(${percentage}%)</span>
          </span>
        </div>
        <div class="category-bar-track">
          <div 
            class="category-bar-fill" 
            style="width: ${percentage}%; background-color: ${barColor};"
            aria-valuenow="${percentage}"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    `;
  }).join("");

  categoryBreakdownList.innerHTML = breakdownHTML;
}

// -----------------------------------------------------------------------------
// 9. RENDER FUNCTION
// -----------------------------------------------------------------------------
function renderExpenses() {
  updateSummary();

  if (expenses.length === 0) {
    tableBody.innerHTML = "";
    emptyState.style.display = "block";
    expensesTable.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  expensesTable.style.display = "table";

  const rowsHTML = expenses.map(expense => {
    const badgeClass = getCategoryBadgeClass(expense.category);
    const formattedAmount = `$${expense.amount.toFixed(2)}`;

    return `
      <tr data-id="${expense.id}">
        <td>${expense.date}</td>
        <td>${escapeHTML(expense.description)}</td>
        <td><span class="badge ${badgeClass}">${escapeHTML(expense.category)}</span></td>
        <td class="text-right amount-col">${formattedAmount}</td>
        <td class="text-center">
          <button 
            type="button" 
            class="btn-delete" 
            data-id="${expense.id}" 
            title="Delete this expense"
            aria-label="Delete ${escapeHTML(expense.description)}"
          >✕</button>
        </td>
      </tr>
    `;
  }).join("");

  tableBody.innerHTML = rowsHTML;
}

// -----------------------------------------------------------------------------
// 10. FORM SUBMISSION HANDLER
// -----------------------------------------------------------------------------
function handleFormSubmit(event) {
  event.preventDefault();

  const dateValue = dateInput.value;
  const descValue = descriptionInput.value.trim();
  const categoryValue = categoryInput.value;
  const amountValue = parseFloat(amountInput.value);

  if (!dateValue || !descValue || !categoryValue || isNaN(amountValue) || amountValue <= 0) {
    alert("Please fill in all fields with valid details.");
    return;
  }

  const newExpense = {
    id: Date.now().toString(),
    date: dateValue,
    description: descValue,
    category: categoryValue,
    amount: amountValue
  };

  // 1. Add to state array
  expenses.push(newExpense);

  // 2. Re-apply current sort order so new item lands in its correct sorted position
  applySorting();

  // 3. Persist to localStorage
  saveExpensesToStorage();

  // 4. Update UI
  renderExpenses();

  // 5. Reset form
  expenseForm.reset();
  setDefaultDate();
  descriptionInput.focus();
}

// -----------------------------------------------------------------------------
// 11. DELETE EXPENSE HANDLER (Event Delegation)
// -----------------------------------------------------------------------------
function handleTableClick(event) {
  const deleteBtn = event.target.closest(".btn-delete");
  
  if (!deleteBtn) {
    return;
  }

  const expenseIdToDelete = deleteBtn.getAttribute("data-id");

  expenses = expenses.filter(expense => expense.id !== expenseIdToDelete);
  saveExpensesToStorage();
  renderExpenses();
}

// -----------------------------------------------------------------------------
// 12. HELPER: Set Default Date to Today
// -----------------------------------------------------------------------------
function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
}

// -----------------------------------------------------------------------------
// 13. INITIALIZATION
// -----------------------------------------------------------------------------
function init() {
  // 1. Load data
  const savedExpenses = loadExpensesFromStorage();

  if (savedExpenses && savedExpenses.length > 0) {
    expenses = savedExpenses;
  } else {
    expenses = [...DEFAULT_SAMPLE_EXPENSES];
    saveExpensesToStorage();
  }

  // 2. Set default date
  setDefaultDate();

  // 3. Apply initial sort & update header indicators
  applySorting();
  updateSortHeadersUI();

  // 4. Render UI
  renderExpenses();

  // 5. Attach event listeners
  expenseForm.addEventListener("submit", handleFormSubmit);
  tableBody.addEventListener("click", handleTableClick);

  // Sorting header click listeners
  colDate.addEventListener("click", () => handleSortClick("date"));
  colAmount.addEventListener("click", () => handleSortClick("amount"));

  // Keyboard accessibility: allow pressing Enter or Space to sort
  colDate.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSortClick("date");
    }
  });

  colAmount.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSortClick("amount");
    }
  });
}

// Start application
init();
