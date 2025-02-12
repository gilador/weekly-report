# Weekly Report

A web-based application designed to help you easily generate, manage, and organize weekly reports for your clients or projects. With a dynamic user interface featuring drag-and-drop reordering, on-page editing, and multiple export options, **Weekly Report** streamlines your reporting process.

**Note:** This is a small and simple application built using vanilla web technologies (HTML, CSS, and JavaScript). Approximately 85% of the code was generated using advanced AI tools, demonstrating the power of AI-assisted development.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Dynamic Client Management:**  
  Quickly add, edit, and remove client reports with an intuitive UI.
- **Drag and Drop Reordering:**  
  Easily change the order of client cards using drag-and-drop functionality.

- **Interactive Functionalities:**

  - **Copy to Clipboard:** Capture and copy a visual snapshot of your weekly report.
  - **Print Report:** Generate a print-friendly version (PDF) of your report.
  - **Export/Import JSON:** Seamlessly export your report data for backup or import existing data.

- **Edit Mode:**  
  Toggle edit mode to modify report details directly on the page.

- **Responsive Design:**  
  Optimized for both desktop and mobile use, with additional features like a scroll-to-top button.

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/weekly-report.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd weekly-report
   ```

3. **Dependencies:**

   The project relies on external libraries loaded via CDN (such as `dom-to-image` and `jsPDF`), so there is no need for additional local installations. However, you can install a static server if you prefer to run the project via a local web server.

4. **Run the Project:**

   Simply open the `index.html` file in your browser, or run a local server (e.g., using the Live Server extension in VSCode) for a smoother development experience.

## Usage

- **Adding a New Client:**  
  Click the "Add New Client" button to create a new client report card. You will be prompted to enter a client name if needed.

- **Editing Reports:**  
  Toggle the edit mode by clicking the edit icon. When in edit mode, you can modify client names, overall status values, and use case details. Click outside an input field to save your changes.

- **Export/Import Data:**  
  Use the JSON export/import functionality to back up your report data or load previously saved data.

- **Copy & Print:**  
  Take advantage of the "Copy to Clipboard" button to capture an image of your report or use the "Print" button to generate a printer-friendly view.

- **Reordering Clients:**  
  Rearrange client cards by dragging and dropping them into the desired order.

## Project Structure

Below is a breakdown of the main files and directories in the project:

```bash
├── index.html        # Main HTML file with the application UI.
├── README.md         # Project documentation.
├── LICENSE           # MIT License.
├── script.js         # Main JavaScript functionality.
├── styles.css        # CSS for styling the application.
└── public/
    └── favicon.svg   # Application favicon and public assets.
```

## Dependencies

The project relies on external libraries loaded via CDN (such as `dom-to-image` and `jsPDF`), so there is no need for additional local installations. However, you can install a static server if you prefer to run the project via a local web server.

## Contributing

Contributions are welcome! If you find a bug or want to add a new feature, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
