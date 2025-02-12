// Global counter for use case cards
// let useCaseCount = document.querySelectorAll(".use-case-card").length;
// (Removed redundant global counter. Now count is calculated per client.)

// Update counter display per report container
function updateUseCaseCount() {
  // Loop through each report container (each client card)
  const reportContainers = document.querySelectorAll(".report-container");
  reportContainers.forEach((container) => {
    const useCasesContainer = container.querySelector(".use-cases-container");
    const count = useCasesContainer
      ? useCasesContainer.querySelectorAll(".use-case-card").length
      : 0;
    const header = container.querySelector(".section.cases h2");
    if (header) {
      header.textContent = `Use Cases (${count})`;
    }
  });
}

// Add observer to track DOM changes affecting use case cards
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (
      mutation.type === "childList" &&
      (mutation.target.classList.contains("use-cases-container") ||
        mutation.target.classList.contains("use-case-card"))
    ) {
      updateUseCaseCount();
    }
  });
});

// Start observing when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  updateUseCaseCount();
});

function importFromJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const clientsContainer = document.querySelector(".clients-container");
  clientsContainer.innerHTML = "";

  reader.onload = function (inputFile) {
    const json = JSON.parse(inputFile.target.result);

    json.clients.forEach((client) => {
      const overallStatus = {};
      Object.keys(client.overallStatus).forEach((key) => {
        const statusValue = client.overallStatus[key];

        if (
          typeof statusValue === "object" &&
          statusValue !== null &&
          !Array.isArray(statusValue)
        ) {
          // Handle nested objects by formatting as "key1: value1/key2: value2"
          const formattedParts = Object.entries(statusValue).map(
            ([subKey, subValue]) => {
              const value = Array.isArray(subValue)
                ? castToType(subValue[0], subValue[1])
                : subValue;
              return `${subKey}:${value}`;
            }
          );
          overallStatus[key] = formattedParts.join("|");
        } else if (Array.isArray(statusValue) && statusValue.length >= 2) {
          // Handle array values
          overallStatus[key] = castToType(statusValue[0], statusValue[1]);
        } else {
          // Handle primitive values
          overallStatus[key] = statusValue;
        }
      });

      addClient(true, client.client, overallStatus, client.useCases);
    });

    showToast("Imported from JSON");
  };

  reader.readAsText(file);

  // Reset the file input to ensure the `change` event is triggered next time
  event.target.value = "";
}

function exportToJson() {
  const clients = [];
  document.querySelectorAll(".report-container").forEach((container) => {
    const client = {};

    // Get client title
    const clientTitle = container.querySelector(".client-title");
    client.client = clientTitle ? clientTitle.textContent : "N/A";

    // Get overall status - only include non-removed items
    client.overallStatus = {};
    const overallStatusElements = container.querySelectorAll(
      ".section.overall ul li:not(.removed)" // Only select non-removed items
    );

    overallStatusElements.forEach((element) => {
      const keyText = element.textContent.split(":")[0].trim();
      const inputSpan = element.querySelector(".input-data");
      const cleanValue = inputSpan ? inputSpan.textContent.trim() : "N/A";

      if (cleanValue.includes("|")) {
        const parts = cleanValue.split("|").map((part) => {
          const [subKey, subValue] = part.split(":");
          return [subKey, subValue];
        });

        client.overallStatus[keyText] = Object.fromEntries(
          parts.map(([subKey, subValue]) => [
            subKey,
            [subValue, typeof subValue === "number" ? "number" : "string"],
          ])
        );
      } else {
        client.overallStatus[keyText] = [cleanValue, "string"];
      }
    });

    client.useCases = [];
    container.querySelectorAll(".use-case-card").forEach((card) => {
      const useCase = {};
      card.querySelectorAll(".use-case-field").forEach((field) => {
        const keyElement = field.querySelector("strong");
        const valueElement = field.querySelector(".input-data");
        if (keyElement && valueElement) {
          const key = keyElement.textContent.replace(":", "");
          const value = valueElement.textContent.trim();
          useCase[key] = value;
        }
      });
      client.useCases.push(useCase);
    });
    clients.push(client);
  });

  const json = JSON.stringify({ clients }, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "weekly_report.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Exported to JSON");
}

function createReportContainer(client) {
  const container = document.createElement("div");
  container.className = "report-container";
  container.draggable = true;
  container.dataset.clientId = client.name || "New Client";

  // Add the drag icon (smiley)
  const dragIcon = document.createElement("div");
  dragIcon.className = "drag-icon";
  container.appendChild(dragIcon);

  // Add the client content using the existing template
  container.innerHTML += createClientTemplate(
    true,
    client.name || "New Client",
    client.overallStatus || {},
    client.useCases || []
  );

  return container;
}

function addClient(
  fromJson = false,
  clientName = "New Client",
  overallStatus = {},
  useCases = [],
  promptForClientName = false
) {
  if (promptForClientName) {
    let input;
    do {
      input = prompt("Enter client name:", clientName);
    } while (input === "");
    if (input === null) return;
    clientName = input;
  }

  const clientsContainer = document.querySelector(".clients-container");
  const newClient = createReportContainer({
    name: clientName,
    overallStatus: overallStatus,
    useCases: useCases,
  });

  clientsContainer.appendChild(newClient);
  updateUseCaseCount();
  debouncedShowToast("New client added");
  initializeDragAndDrop();
}

function addUseCase(button) {
  const sectionCases = button.closest(".section.cases");
  const useCasesContainer = sectionCases.querySelector(".use-cases-container");
  const newUseCase = document.createElement("template");
  newUseCase.innerHTML = createUseCaseTemplate();
  useCasesContainer.appendChild(newUseCase.content);
}

function createClientTemplate(
  fromJson = false,
  clientName = "New Client",
  overallStatus = {},
  useCases = []
) {
  // Only apply default values if NOT importing from JSON
  if (!fromJson) {
    overallStatus = {
      "Active usecases": 0,
      Users: { Total: 0, Active: 0 },
      "Voice adoption": "N/A",
      Satisfaction: "N/A",
      "Next milestone": "N/A",
      ...overallStatus,
    };
  }

  // Ensure useCases is always an array
  useCases = Array.isArray(useCases) ? useCases : [];

  const useCasesHTML = useCases
    .map((useCase) => createUseCaseTemplate(useCase))
    .join("");

  // Create HTML for overall status items
  const overallStatusHTML = Object.entries(overallStatus)
    .map(([key, value]) => {
      const val =
        typeof value === "object" && value !== null
          ? Object.entries(value)
              .map(([k, v]) => `${k}:${v}`)
              .join(" | ")
          : value;
      return `
        <li>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="flex-grow: 1">${key}: <span class="input-data short active-use-cases"> ${val}</span></span>
            <button class="remove-button client-button" onclick="removeStatus(this)" style="padding: 2px; margin-left: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6l-12 12"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </li>`;
    })
    .join("");

  return `
  <div style="position: absolute;top: 10px;right: 10px; display: flex; align-items: center; width: 20%; justify-content: space-between;">
    <button class="remove-button client-button" onclick="deleteClient(this)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2"> <path d="M4 7h16"></path> <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path> <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path> <path d="M10 12l4 4m0 -4l-4 4"></path> </svg> 
    </button>
    <button class="add-button client-button" onclick="addOverallStatus(this)">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>
     <button class="edit-button client-button" onclick="toggleEdit(this)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
            <path d="M13.5 6.5l4 4" />
        </svg>
    </button>
  </div>

    <div class="client-title">${clientName}</div>
    <div class="content">
        <div class="section overall">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <h2>Overall Status</h2>
            </div>
            <ul>
            ${overallStatusHTML}
            </ul>
        </div>
        <div class="section cases">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <h2>Use Cases (${
                  useCases && Array.isArray(useCases) && useCases.length > 0
                    ? useCases.length
                    : 1
                })</h2>
                <button class="add-button client-button" onclick="addUseCase(this)">
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-table-plus">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M12.5 21h-7.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v7.5" />
                        <path d="M3 10h18" />
                        <path d="M10 3v18" />
                        <path d="M16 19h6" />
                        <path d="M19 16v6" />
                    </svg>
                </button>
            </div>
            <div class="use-cases-container">
                ${useCasesHTML || createUseCaseTemplate()}
            </div>
        </div>
    </div>`;
}

function createUseCaseTemplate(
  items = {
    Status: "N/A",
    Name: "N/A",
    Phase: "N/A",
    Timing: "N/A",
    Users: "N/A",
    RisksOrBlockers: "N/A",
    Notes: "N/A",
  }
) {
  return `
    <div class="use-case-card" style="position: relative;">
      <div style="position: absolute;top: 10px;right: 10px; display: flex; align-items: center; width: 15%; justify-content: space-between;">
        <button class="remove-button client-button" onclick="deleteUseCase(this)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2"> <path d="M4 7h16"></path> <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path> <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path> <path d="M10 12l4 4m0 -4l-4 4"></path> </svg> 
        </button>
        <button class="add-button client-button" onclick="addItemToUseCase(this.closest('.use-case-card'))">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-plus">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 5l0 14" />
            <path d="M5 12l14 0" />
          </svg>
        </button>
      </div>
      <div class="use-case-fields">
        ${Object.keys(items)
          .map(
            (key) =>
              `<div class="use-case-field">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="flex-grow: 1"><strong>${
                    key.charAt(0) + key.slice(1)
                  }:</strong> <span class="input-data long">${
                items[key]
              }</span></span>
                  <button class="remove-button client-button" onclick="removeUseCaseField(this)" style="padding: 2px; margin-left: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 6l-12 12"></path>
                      <path d="M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>`
          )
          .join("")}
      </div>
    </div>`;
}

function removeUseCaseField(button) {
  const fieldContainer = button.closest(".use-case-field");
  if (fieldContainer) {
    fieldContainer.remove();
  }
}

function deleteClient(button) {
  const container = button.closest(".report-container");
  container.remove();
}

function deleteUseCase(button) {
  const container = button.closest(".use-case-card");
  container.remove();
}

function copyToClipboard() {
  reportToImage((blob) => {
    const item = new ClipboardItem({ "image/png": blob });
    navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    debouncedShowToast("Copied to clipboard");
  });
}

function printReport() {
  reportToImage((blob) => {
    const url = URL.createObjectURL(blob);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Weekly Report.pdf</title>
          <style>
            body { 
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: start;
            }
            img { 
              max-width: 100%;
              max-height: 100vh; /* Ensure image fits viewport height */
              width: auto;
              height: auto;
              object-fit: contain;
              page-break-inside: avoid;
            }
            @media print {
              body { 
                margin: 0; 
                height: 100vh;
              }
              img { 
                max-height: 100vh;
                page-break-inside: avoid;
              }
              @page {
                size: auto;
                margin: 0mm; /* Remove default page margins */
              }
            }
          </style>
        </head>
        <body>
          <img src="${url}" />
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast("Report sent to printer");

    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
      buttons.forEach((button) => (button.style.display = "block"));
    }, 1000);
  });
}

function reportToImage(callback) {
  exitEditMode();

  const clientsContainer = document.querySelector(".clients-container");
  const originalHeight = clientsContainer.style.height;
  clientsContainer.style.height = "auto";

  domtoimage
    .toBlob(clientsContainer, { bgcolor: "#f4f4f9" })
    .then((blob) => {
      clientsContainer.style.height = originalHeight;
      callback(blob);
    })
    .catch((error) => {
      clientsContainer.style.height = originalHeight;
      buttons.forEach((button) => (button.style.display = "block"));
    });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.className = toast.className.replace("show", "");
  toast.textContent = message;
  toast.style.cssText = `
    visibility: visible;
    min-width: 250px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    padding: 16px;
    position: fixed;
    z-index: 1000;
    left: 50%;
    bottom: 30px;
    transform: translateX(-50%);
    font-size: 14px;
  `;
  toast.className = "toast show";

  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
    toast.style.visibility = "hidden";
  }, 3000);
}

function confirmClearClients() {
  if (confirm("Are you sure you want to clear all clients?")) {
    clearClients();
  }
}

function clearClients() {
  const clientsContainer = document.querySelector(".clients-container");
  clientsContainer.innerHTML = "";
}

function toggleEmptyState(show) {
  const emptyState = document.getElementById("empty-state");
  const clientsContainer = document.querySelector(".clients-container");

  if (show) {
    emptyState.style.display = "flex";
    clientsContainer.style.display = "none";
  } else {
    emptyState.style.display = "none";
    clientsContainer.style.display = "flex";
  }
}

function DOMListener() {
  const handleEmptyState = () => {
    const clientsContainer = document.querySelector(".clients-container");
    if (clientsContainer.children.length === 0) {
      toggleEmptyState(true);
    } else {
      toggleEmptyState(false);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    const clientsContainer = document.querySelector(".clients-container");
    handleEmptyState();

    // More specific mutation observer
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          shouldUpdate = true;
          break;
        }
      }
      if (shouldUpdate) {
        handleEmptyState();
      }
    });

    observer.observe(clientsContainer, {
      childList: true,
      subtree: false, // Only observe direct children
    });
  });

  initializeDragAndDrop();

  // Initialize edit mode as disabled
  const editButton = document.querySelector(".toggle-edit");
  if (editButton) {
    editButton.setAttribute("data-edit-mode", "false");
    document.body.classList.remove("edit-mode");
  }
}

function toggleEditMode(force = null) {
  const editButton = document.querySelector(".toggle-edit");
  const currentState = editButton.getAttribute("data-edit-mode") === "true";

  // If force is provided, use that value, otherwise toggle
  const newState = force !== null ? force : !currentState;

  editButton.setAttribute("data-edit-mode", String(newState));
  editModeEnabled = newState;

  if (newState) {
    document.body.classList.add("edit-mode");
  } else {
    document.body.classList.remove("edit-mode");
  }
}

function addItemToUseCase(useCaseCard) {
  const key = prompt("Enter the key for the new item:", "New Key");
  if (!key) return;

  const newField = document.createElement("div");
  newField.className = "use-case-field";
  newField.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <span style="flex-grow: 1"><strong>${key}:</strong> <span class="input-data long">N/A</span></span>
      <button class="remove-button client-button" onclick="removeUseCaseField(this)" style="padding: 2px; margin-left: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6l-12 12"></path>
          <path d="M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
  useCaseCard.querySelector(".use-case-fields").appendChild(newField);
}

function exitEditMode() {
  const clientsContainer = document.querySelector(".clients-container");
  const toggleEditButton = document.querySelector(".toggle-edit");
  const inputDataElements = clientsContainer.querySelectorAll(".input-data");

  inputDataElements.forEach((element) => {
    const input = element.querySelector("input, textarea");
    if (input) {
      element.textContent = input.value;
    }
  });

  clientsContainer.classList.remove("edit-mode");
  toggleEditButton.classList.remove("edit-mode");
}

function toggleEdit(button) {
  const container = button.closest(".report-container");
  const inputDataElements = container.querySelectorAll(
    ".input-data, .client-title"
  );

  const handleInputConversion = (elements) => {
    elements.forEach((element) => {
      const input = element.querySelector("input, textarea");

      if (input) {
        const value = input.value;
        element.textContent = value;
      } else {
        const value = element.textContent;
        let input = document.createElement("input");
        input.type = "text";
        if (element.classList.contains("client-title")) {
          input.className = "editable-input med";
        } else if (element.classList.contains("short")) {
          input.className = "editable-input short";
        } else if (element.classList.contains("med")) {
          input.className = "editable-input med";
        } else {
          input = document.createElement("textarea");
          input.className = "editable-input long";
          input.spellcheck = true;
        }
        input.value = value;
        element.textContent = "";
        element.appendChild(input);
      }
    });
  };

  document.addEventListener("click", function handleClickOutside(event) {
    if (!container.contains(event.target) && container.querySelector("input")) {
      handleInputConversion(inputDataElements);
      document.removeEventListener("click", handleClickOutside);
    }
  });

  handleInputConversion(inputDataElements);
}

function castToType(value, type) {
  switch (type) {
    case "number":
      return Number(value);
    case "string":
      return String(value);
    case "boolean":
      return value === "true";
    default:
      return value;
  }
}

function addOverallStatus(button) {
  const statusKey = prompt("Enter the name for the new status:", "New Status");
  if (!statusKey) return;

  // Find the overall section by first getting the report container, then finding the overall section within it
  const reportContainer = button.closest(".report-container");
  const overallSection = reportContainer.querySelector(".section.overall");
  const statusList = overallSection.querySelector("ul");

  const newStatusItem = document.createElement("li");
  newStatusItem.innerHTML = `${statusKey}: <span class="input-data short">N/A</span>`;
  statusList.appendChild(newStatusItem);
}

function removeStatus(button) {
  const listItem = button.closest("li");
  if (listItem) {
    // Instead of removing, add a class and hide it
    listItem.classList.add("removed");
    listItem.style.display = "none";
  }
}

function handleDragStart(e) {
  // Only start drag if we're clicking on the report container or drag icon
  const reportContainer = e.target.closest(".report-container");
  if (!reportContainer) return;

  reportContainer.classList.add("dragging");
  e.dataTransfer.setData("text/plain", reportContainer.dataset.clientId);
}

function handleDragEnter(e) {
  const targetContainer = e.target.closest(".report-container");
  if (targetContainer && !targetContainer.classList.contains("dragging")) {
    // Remove drop-target class from any other containers
    document.querySelectorAll(".drop-target").forEach((container) => {
      if (container !== targetContainer) {
        container.classList.remove("drop-target");
      }
    });
    targetContainer.classList.add("drop-target");
  }
}

function handleDragLeave(e) {
  const targetContainer = e.target.closest(".report-container");
  const relatedTarget = e.relatedTarget?.closest(".report-container");

  // Only remove the drop-target class if we're actually leaving the container
  // and not just moving between elements within the same container
  if (
    targetContainer &&
    !targetContainer.contains(e.relatedTarget) &&
    targetContainer !== relatedTarget
  ) {
    targetContainer.classList.remove("drop-target");
  }
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();

  const sourceId = e.dataTransfer.getData("text/plain");
  const sourceElement = document.querySelector(
    `[data-client-id="${sourceId}"]`
  );
  const targetElement = e.target.closest(".report-container");

  if (!sourceElement || !targetElement || sourceElement === targetElement) {
    return;
  }

  // Remove drop target styling from all containers
  document.querySelectorAll(".drop-target").forEach((container) => {
    container.classList.remove("drop-target");
  });

  // Get the content elements (everything inside except the drag icon)
  const sourceContent = sourceElement.querySelector(".content");
  const targetContent = targetElement.querySelector(".content");
  const sourceTitle = sourceElement.querySelector(".client-title");
  const targetTitle = targetElement.querySelector(".client-title");

  // Store the HTML content
  const sourceContentHTML = sourceContent.innerHTML;
  const targetContentHTML = targetContent.innerHTML;
  const sourceTitleText = sourceTitle.textContent;
  const targetTitleText = targetTitle.textContent;

  // Swap the content
  sourceContent.innerHTML = targetContentHTML;
  targetContent.innerHTML = sourceContentHTML;
  sourceTitle.textContent = targetTitleText;
  targetTitle.textContent = sourceTitleText;

  // Remove dragging class
  sourceElement.classList.remove("dragging");

  // Update client order in storage
  debouncedUpdateClientOrder();
}

function initializeDragAndDrop() {
  const reportContainers = document.querySelectorAll(".report-container");

  reportContainers.forEach((container) => {
    container.setAttribute("draggable", "true");
    container.addEventListener("dragstart", handleDragStart);
    container.addEventListener("dragenter", handleDragEnter);
    container.addEventListener("dragleave", handleDragLeave);
    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("drop", handleDrop);
  });
}

function updateClientOrder() {
  const containers = document.querySelectorAll(".report-container");
  const newOrder = Array.from(containers).map(
    (container) => container.dataset.clientId
  );
  const clients = JSON.parse(localStorage.getItem("clients") || "{}");

  // Create new ordered object
  const orderedClients = {};
  newOrder.forEach((clientId) => {
    if (clients[clientId]) {
      orderedClients[clientId] = clients[clientId];
    }
  });

  localStorage.setItem("clients", JSON.stringify(orderedClients));
}

// Add at the top of the file
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounce the updateClientOrder function
const debouncedUpdateClientOrder = debounce(updateClientOrder, 250);

// Debounce the showToast function
const debouncedShowToast = debounce(showToast, 100);

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Show/hide scroll button based on scroll position
window.addEventListener("scroll", function () {
  const scrollButton = document.getElementById("scroll-to-top");
  if (window.scrollY > 300) {
    scrollButton.style.display = "block";
  } else {
    scrollButton.style.display = "none";
  }
});
