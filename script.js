function importFromJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const clientsContainer = document.querySelector(".clients-container");
  clientsContainer.innerHTML = "";

  reader.onload = function (e) {
    const json = JSON.parse(e.target.result);

    json.clients.forEach((client) => {
      const overallStatus = {};
      Object.keys(client.overallStatus).forEach((key) => {
        if (key === "users") {
          overallStatus[key] = {
            total: castToType(
              client.overallStatus[key].total[0],
              client.overallStatus[key].total[1]
            ),
            active: castToType(
              client.overallStatus[key].active[0],
              client.overallStatus[key].active[1]
            ),
          };
        } else {
          overallStatus[key] = castToType(
            client.overallStatus[key][0],
            client.overallStatus[key][1]
          );
        }
      });

      addClient(client.client, overallStatus, client.useCases);
    });

    showToast("Imported from JSON");
  };

  reader.readAsText(file);

  // Reset the file input to ensure the `change` event is triggered next time
  event.target.value = "";
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

function exportToJson() {
  const clients = [];
  document.querySelectorAll(".report-container").forEach((container) => {
    const client = {};
    const clientTitle = container.querySelector(".client-title");
    client.client = clientTitle ? clientTitle.textContent : "N/A";
    const overallStatusElements = container.querySelectorAll("ul li");
    const overallStatusKeys = Array.from(overallStatusElements).map(
      (element) => {
        const key = element.textContent
          .split(": ")[0]
          .toLowerCase()
          .replace(/ /g, "");
        return key === "users" ? "users" : key;
      }
    );
    client.overallStatus = {};

    overallStatusElements.forEach((element, index) => {
      const value = element.textContent.split(": ")[1] || "N/A";
      if (index === 1) {
        const usersTotalElement = element.querySelector(".users-total");
        const usersActiveElement = element.querySelector(".users-active");
        const total = usersTotalElement
          ? parseInt(usersTotalElement.textContent) || "N/A"
          : "N/A";
        const active = usersActiveElement
          ? parseInt(usersActiveElement.textContent) || "N/A"
          : "N/A";
        client.overallStatus[overallStatusKeys[index]] = {
          total: [total, "number"],
          active: [active, "number"],
        };
      } else {
        client.overallStatus[overallStatusKeys[index]] = [value, typeof value];
      }
    });

    client.overallStatus.nextMilestone =
      container.querySelector(".next-milestone")?.textContent || "N/A";
    client.useCases = [];
    container.querySelectorAll(".use-case-card").forEach((card) => {
      const useCase = {};
      card.querySelectorAll("p").forEach((p) => {
        const key = p.querySelector("strong").textContent.replace(":", "");
        const value = p.querySelector(".input-data").textContent;
        useCase[key] = value;
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

function toggleEdit(button) {
  const container = button.closest(".report-container");
  const inputDataElements = container.querySelectorAll(".input-data");

  const handleInputConversion = (elements) => {
    elements.forEach((element) => {
      const input = element.querySelector("input, textarea"); // Fix selector

      if (input) {
        const value = input.value;
        element.textContent = value;
      } else {
        const value = element.textContent;
        let input = document.createElement("input");
        input.type = "text";
        if (element.classList.contains("short")) {
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

function createClientTemplate(
  clientName = "New Client",
  overallStatus = {},
  useCases = []
) {
  const {
    activeusecases = 0,
    users = { total: 0, active: 0 },
    voiceadoption = "N/A",
    satisfaction = "N/A",
    nextmilestone = "N/A",
  } = overallStatus;

  const useCasesHTML = useCases
    .map((useCase) => createUseCaseTemplate(useCase))
    .join("");

  return `
  <button class="edit-button client-button" onclick="toggleEdit(this)">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
          <path d="M13.5 6.5l4 4" />
      </svg>
  </button>
  <button class="remove-button client-button" onclick="deleteClient(this)">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2"> <path d="M4 7h16"></path> <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path> <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path> <path d="M10 12l4 4m0 -4l-4 4"></path> </svg> 
  </button>

    <div class="client-title">${clientName}</div>
    <div class="content">
        <div class="section overall">
            <h2>Overall Status</h2>
            <ul>
                <li>Active Use Cases: <span class="input-data short active-use-cases">${activeusecases}</span></li>
                <li>Users: <span class="input-data short users-total">${
                  users.total
                }</span> (Active: <span class="input-data short users-active">${
    users.active
  }</span>)</li>
                <li>Voice Adoption: <span class="input-data med voice-adoption">${voiceadoption}</span></li>
                <li>Satisfaction: <span class="input-data med satisfaction">${satisfaction}</span></li>
                <li>Next Milestone: <span class="input-data long next-milestone">${nextmilestone}</span></li>
            </ul>
        </div>
        <div class="section cases">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <h2>Use Cases</h2>
                <button class="add-button client-button" onclick="addUseCase(this)">
<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-table-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.5 21h-7.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v7.5" /><path d="M3 10h18" /><path d="M10 3v18" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>                </button>
            </div>
            <div class="use-cases-container">
                ${useCasesHTML || createUseCaseTemplate()}
            </div>
        </div>
    </div>`;
}

function deleteClient(button) {
  const container = button.closest(".report-container");
  container.remove();
}

function deleteUseCase(button) {
  const container = button.closest(".use-case-card");
  container.remove();
}

function createUseCaseTemplate(
  items = {
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
      <button class="remove-button client-button delete-use-case" onclick="deleteUseCase(this)">
        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
      </button>
      <button class="add-button client-button add-use-case" onclick="addItemToUseCase(this.closest('.use-case-card'))">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-plus">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 5l0 14" />
          <path d="M5 12l14 0" />
        </svg>
      </button>
      ${Object.keys(items)
        .map(
          (key) =>
            `<p><strong>${
              key.charAt(0) + key.slice(1)
            }:</strong> <span class="input-data long">${items[key]}</span></p>`
        )
        .join("")}
    </div>`;
}

function addClient(
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
  const newClient = document.createElement("div");
  newClient.className = "report-container";
  newClient.innerHTML = createClientTemplate(
    clientName,
    overallStatus,
    useCases
  );
  clientsContainer.appendChild(newClient);
  showToast("New client added");
}

function addUseCase(button) {
  const sectionCases = button.closest(".section.cases");
  const useCasesContainer = sectionCases.querySelector(".use-cases-container");
  const newUseCase = document.createElement("template");
  newUseCase.innerHTML = createUseCaseTemplate();
  useCasesContainer.appendChild(newUseCase.content);
}

function copyToClipboard() {
  reportToImage((blob) => {
    const item = new ClipboardItem({ "image/png": blob });
    navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    showToast("Copied to clipboard");
  });
}

function printReport() {
  reportToImage((blob) => {
    // Create temporary URL
    const url = URL.createObjectURL(blob);

    // Create print window
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Weekly Report.pdf</title>
          <style>
            img { 
              max-width: 100%;
              height: auto;
            }
            @media print {
              body { margin: 0; }
              img { width: 100%; }
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
  toast.className = toast.className.replace("show", "");
  toast.textContent = message;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
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
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "childList") {
          handleEmptyState();
        }
      });
    });
    observer.observe(clientsContainer, { childList: true });
  });
}

function toggleEditMode() {
  const clientsContainer = document.querySelector(".clients-container");
  const toggleEditButton = document.querySelector(".toggle-edit");
  clientsContainer.classList.toggle("edit-mode");
  toggleEditButton.classList.toggle("edit-mode");
}
function addItemToUseCase(useCaseCard) {
  const key = prompt("Enter the key for the new item:", "New Key");
  const newItem = document.createElement("p");
  newItem.innerHTML = `<strong>${key}:</strong> <span class="input-data long">...</span>`;
  useCaseCard.appendChild(newItem);
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
