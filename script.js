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
  <button class="edit-button" onclick="toggleEdit(this)">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pencil">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
          <path d="M13.5 6.5l4 4" />
      </svg>
  </button>
  <button class="remove-button" onclick="deleteClient(this)">
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
                <button class="button" onclick="addUseCase(this)" style="padding: 2px 5px; font-size: 10px;">+</button>
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
    <div class="use-case-card">
      <p><strong>Use Case Name: ${name}</strong></p>
      <p><strong>Phase: ${phase}</strong></p>
      <p><strong>Users: ${users}</strong></p>
      <p><strong>Risks: ${risksOrBlockers}</strong></p>
    </div>`;
}

function addClient(
  clientName = "New Client",
  overallStatus = {},
  useCases = []
) {
  const clientsContainer = document.querySelector(".clients-container");
  const newClient = document.createElement("div");
  newClient.className = "report-container";
  newClient.innerHTML = createClientTemplate(
    clientName,
    overallStatus,
    useCases
  );
  clientsContainer.appendChild(newClient);
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
  console.log("importFromJson");

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

    console.log("Import complete");
  };

  reader.readAsText(file);

  // Reset the file input to ensure the `change` event is triggered next time
  event.target.value = "";
}
function copyToClipboard() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => (button.style.display = "none"));

  const clientsContainer = document.querySelector(".clients-container");
  const originalHeight = clientsContainer.style.height;
  clientsContainer.style.height = "auto";
  reportToImage((blob) => {
    const item = new ClipboardItem({ "image/png": blob });
    navigator.clipboard.write([item]).then(() => {
      alert("Report copied to clipboard as an image.");
    });
  });
}

function printReport() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => (button.style.display = "none"));

  const clientsContainer = document.querySelector(".clients-container");
  const originalHeight = clientsContainer.style.height;
  clientsContainer.style.height = "auto";

  reportToImage((blob) => {
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "white");
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
        URL.revokeObjectURL(url);
      };
    };
    clientsContainer.style.height = originalHeight;
    buttons.forEach((button) => (button.style.display = "block"));
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
