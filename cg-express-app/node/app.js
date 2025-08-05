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
    <title>Chainguard Scanning Demo</title>
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
      div#vuln div {
          display: inline;
          width: 200px;
          border: 1px solid black;
          margin: 0px 10px 0px 10px;
          background-color: #73ff8f;
      }
      div#vuln {
          display: flex;
          justify-content: center;
      }
      div#vuln a {
          font-size: 1.2em;
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
              let name = ""
              if (item.image.includes('node')) {
                name="node-fips";
              } else if (item.image.includes('nginx')) {
                name="nginx-fips";
              } else {
                name="postgres-fips";
              }

              div = document.createElement("div");
              span = document.createElement("span");
              a = document.createElement("a");
              p_total = document.createElement("p");
              p_critical = document.createElement("p");
              p_high = document.createElement("p");

              a.href = "https://images.chainguard.dev/directory/image/"+name+"/vulnerabilities";
              a.target = "_blank";
              a.textContent = name+":latest";
              span.appendChild(a);
              p_total.textContent = "Total CVEs: " + item.results.total;
              p_critical.textContent = "Critical: " + item.results.critical;
              p_high.textContent = "High: " + item.results.high;

              div.appendChild(span);
              div.appendChild(p_total);
              div.appendChild(p_critical);
              div.appendChild(p_high);
              document.getElementById('vuln').appendChild(div);
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
      <h1>Let's scan some <img src="https://images.icon-icons.com/3911/PNG/512/chainguard_logo_icon_247379.png" style="height:40px"/> containers!</h1>
      <p id="time">Loading time...</p>
      <p id="image">Scanning Chainguard images: node-fips, postgres-fips, nginx-fips</p>
      <button id="scanButton">Run Vulnerability Scan</button>
      <div id="vuln"></div>
    </div>
  </body>
  </html>
  `;
  res.send(html);
});

// Vulnerability endpoint: scan images using Grype with jq for metrics.
app.get("/vulnerabilities", (req, res) => {
  req.setTimeout(600000);
  node_result = runScan("cgr.dev/chainguard/node:latest");
  nginx_result = runScan("cgr.dev/chainguard/nginx:latest");
  postgres_result = runScan("cgr.dev/chainguard/postgres:latest");
  try {
    const result = JSON.parse(
      `[${node_result}, ${nginx_result}, ${postgres_result}]`,
    );
    console.log(result);
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
  const command = `grype ${image}  --output json | jq '{image: "${image}", results: {total: (.matches | length), critical: (.matches | map(select(.vulnerability.severity=="Critical")) | length), high: (.matches | map(select(.vulnerability.severity=="High")) | length)}}'`;
  return execSync(command).toString();
};
