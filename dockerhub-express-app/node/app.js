const express = require("express");
const { execSync } = require("child_process");
const app = express();
const port = 3000;

// Main page: displays a digital clock, the image being scanned, a button to trigger the scan, and vulnerability metrics.
app.get("/", (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Cool Web UI with CVE Metrics</title>
    <style>
      body {
        font-family: sans-serif;
        text-align: center;
        margin: 0;
        padding: 0;
        background: #6CEEFD;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container {
        background: rgba(255, 255, 255, 0.9);
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }
      h1 {
        font-size: 2.5em;
        margin-bottom: 0.5em;
      }
      p {
        font-size: 1.2em;
        margin: 0.5em;
      }
      button {
        font-size: 1em;
        padding: 0.5em 1em;
        margin: 1em 0;
        cursor: pointer;
        border: none;
        border-radius: 5px;
        background-color: #10002E;
        color: #fff;
      }
      button:hover {
        background-color: #2723F1;
      }
      #vuln p {
        text-align: left;
      }
    </style>
    <script>
      // Update the clock every second
      function updateTime() {
        const now = new Date();
        document.getElementById('time').textContent = now.toLocaleTimeString();
      }

      // Function to perform the vulnerability scan
      function runScan() {
        document.getElementById('vuln').textContent = 'Scanning for vulnerability metrics with grype...';
        fetch('/vulnerabilities')
          .then(response => response.json())
          .then(data => {
            document.getElementById('vuln').textContent = "";
            data.forEach(item => {
              p = document.createElement("p");
              p.textContent =
                item.image +
                " ==> Total CVEs: " + item.results.total +
                ", Critical: " + item.results.critical +
                ", High: " + item.results.high;
              document.getElementById('vuln').appendChild(p);
            });
          })
          .catch(err => {
            console.error(err);
            document.getElementById('vuln').textContent = 'Error scanning vulnerabilities';
          });
      }

      window.onload = function() {
        setInterval(updateTime, 1000);
        updateTime();

        // Add click event to the scan button
        document.getElementById('scanButton').addEventListener('click', runScan);
      }
    </script>
  </head>
  <body>
    <div class="container">
      <h1>Let's scan some containers!</h1>
      <p id="time">Loading time...</p>
      <p id="image">Scanning Docker Hub images: node, postgres, nginx</p>
      <button id="scanButton">Run Vulnerability Scan</button>
      <p id="vuln"></p>
    </div>
  </body>
  </html>
  `;
  res.send(html);
});

// Vulnerability endpoint: scan the base image "node:23.10.0" using Grype with jq for metrics.
app.get("/vulnerabilities", (req, res) => {
  node_result = runScan("node:24");
  nginx_result = runScan("nginx:1.29");
  postgres_result = runScan("postgres:17");
  try {
    const result = JSON.parse(
      `[${node_result}, ${nginx_result}, ${postgres_result}]`,
    );
    res.json(result);
  } catch (e) {
    console.error("Parsing error:", e);
    res.status(500).json({ error: "Failed to parse grype output" });
  }
});

app.listen(port, () => {
  console.log("App listening on port " + port);
});

const runScan = function (image) {
  console.log("Running scan for image:", image);
  const command = `grype ${image} --output json | jq '{image: "${image}", results: {total: (.matches | length), critical: (.matches | map(select(.vulnerability.severity=="Critical")) | length), high: (.matches | map(select(.vulnerability.severity=="High")) | length)}}'`;
  return execSync(command).toString();
};
