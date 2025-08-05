# Example Node Web App Deployments

This repository demonstrates two different deployment versions of our Node web application. The Node Web application allows us to run a Grype scan on the base image our application is built on top of to illustrate how important it is to start from a secure and minimal base image.

## Folder Overview

1. **dockerhub-express-app**
   Runs the Node web app using Docker Compose with images pulled from Docker Hub.

2. **cg-express-app**
   Runs the Node web app using Docker Compose with images pulled from Chainguard.

---

## 1. dockerhub-express-app

**Description:**
This version uses Docker Compose to run our Node web application. It pulls the Node base image from Docker Hub (`docker.io/node:23.10.0`).

**Usage:**

```bash
cd dockerhub-express-app
docker-compose up --build
```
---

## 2. cg-express-app

**Description:**
This version uses Docker Compose to run our Node web application. It pulls the Node base image from Chainguard (`cgr.dev/chainguard-private node:23.10.0`).

**Usage:**

```bash
cd cg-express-app
docker-compose up --build
```
