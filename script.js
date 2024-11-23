function toggleEdit(button) {
  const container = button.closest(".report-container");
  const overallStatusElements = container.querySelectorAll(
    ".section ul li span, .section ul li"
  );
  const useCaseElements = container.querySelectorAll(".use-case-card p strong");

  const handleInputConversion = (elements) => {
    elements.forEach((element) => {
      const input = element.querySelector("input");
      if (input) {
        const value = input.value;
        element.innerHTML = element.innerHTML.split(": ")[0] + ": " + value;
      } else {
        const value = element.textContent.split(": ")[1];
        const input = document.createElement("input");
        input.type = "text";
        input.className = "editable-input";
        input.value = value;
        element.innerHTML = element.innerHTML.split(": ")[0] + ": ";
        element.appendChild(input);
      }
    });
  };

  document.addEventListener("click", function handleClickOutside(event) {
    if (!container.contains(event.target) && container.querySelector("input")) {
      handleInputConversion(overallStatusElements);
      handleInputConversion(useCaseElements);
      document.removeEventListener("click", handleClickOutside);
    }
  });

  handleInputConversion(overallStatusElements);
  handleInputConversion(useCaseElements);
}

function createClientTemplate(
  clientName = "New Client",
  overallStatus = {},
  useCases = []
) {
  const {
    activeUseCases = 0,
    users = { total: 0, active: 0 },
    voiceAdoption = "N/A",
    satisfaction = "N/A",
    nextMilestone = "N/A",
  } = overallStatus;

  const useCasesHTML = useCases
    .map((useCase) =>
      createUseCaseTemplate(
        useCase.name,
        useCase.phase,
        useCase.users,
        useCase.risksOrBlockers
      )
    )
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
        <div class="section">
            <h2>Overall Status</h2>
            <ul>
                <li>Active Use Cases: ${activeUseCases}</li>
                <li>Users: ${users.total} (Active: ${users.active})</li>
                <li>Voice Adoption: ${voiceAdoption}</li>
                <li>Satisfaction: ${satisfaction}</li>
                <li>Next Milestone: <span class="next-milestone">${nextMilestone}</span></li>
            </ul>
        </div>
        <div class="section">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <h2>Use Cases</h2>
                <button class="add-button client-button" onclick="addUseCase(this)">
                  <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>
                </button>
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

function deleteUsecase(button) {
  const container = button.closest(".report-container");
  container.remove();
}

function createUseCaseTemplate(
  name = "N/A",
  phase = "N/A",
  users = "N/A",
  risksOrBlockers = "N/A"
) {
  return `
    <div class="use-case-card" style="position: relative;">
      <button class="remove-button client-button" onclick="deleteUsecase(this)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
          <path d="M4 7h16"></path>
          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
          <path d="M10 12l4 4m0 -4l-4 4"></path>
        </svg>
      </button>
      <p><strong>Use Case Name: ${name}</strong></p>
      <p><strong>Phase: ${phase}</strong></p>
      <p><strong>Users: ${users}</strong></p>
      <p><strong>Risks: ${risksOrBlockers}</strong></p>
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
    console.log(input);
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
  const useCasesContainer = button
    .closest(".section")
    .querySelector(".use-cases-container");
  const newUseCase = document.createElement("div");
  newUseCase.innerHTML = createUseCaseTemplate();
  useCasesContainer.appendChild(newUseCase);
}

function importFromJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const clientsContainer = document.querySelector(".clients-container");
  clientsContainer.innerHTML = "";

  reader.onload = function (e) {
    const json = JSON.parse(e.target.result);

    json.clients.forEach((client) => {
      addClient(client.client, client.overallStatus, client.useCases);
    });

    showToast("Imported from JSON");
  };

  reader.readAsText(file);

  // Reset the file input to ensure the `change` event is triggered next time
  event.target.value = "";
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
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => (button.style.display = "none"));

  const clientsContainer = document.querySelector(".clients-container");
  const originalHeight = clientsContainer.style.height;
  clientsContainer.style.height = "auto";

  domtoimage
    .toBlob(clientsContainer)
    .then((blob) => {
      callback(blob);
      clientsContainer.style.height = originalHeight;
      buttons.forEach((button) => (button.style.display = "block"));
    })
    .catch((error) => {
      console.error("Error capturing the image:", error);
      clientsContainer.style.height = originalHeight;
      buttons.forEach((button) => (button.style.display = "block"));
    });
}

function exportToJson() {
  const clients = [];
  document.querySelectorAll(".report-container").forEach((container) => {
    const client = {};
    client.client = container.querySelector(".client-title").textContent;
    client.overallStatus = {
      activeUseCases: parseInt(
        container.querySelector("ul li:nth-child(1)").textContent.split(": ")[1]
      ),
      users: {
        total: parseInt(
          container
            .querySelector("ul li:nth-child(2)")
            .textContent.split(": ")[1]
            .split(" ")[0]
        ),
        active: parseInt(
          container
            .querySelector("ul li:nth-child(2)")
            .textContent.split(": ")[2]
            ?.replace("(", "")
            .replace(")", "")
            .replace("Active: ", "") || 0
        ),
      },
      voiceAdoption: container
        .querySelector("ul li:nth-child(3)")
        .textContent.split(": ")[1],
      satisfaction: container
        .querySelector("ul li:nth-child(4)")
        .textContent.split(": ")[1],
      nextMilestone: container.querySelector(".next-milestone").textContent,
    };
    client.useCases = [];
    container.querySelectorAll(".use-case-card").forEach((card) => {
      const useCase = {};
      useCase.name = card
        .querySelector("p:nth-child(1) strong")
        .textContent.split(": ")[1];
      useCase.phase = card
        .querySelector("p:nth-child(2) strong")
        .textContent.split(": ")[1];
      useCase.users = card
        .querySelector("p:nth-child(3) strong")
        .textContent.split(": ")[1];
      useCase.risksOrBlockers = card
        .querySelector("p:nth-child(4) strong")
        .textContent.split(": ")[1];
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