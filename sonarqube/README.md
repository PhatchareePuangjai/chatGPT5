# SonarQube Setup for Project Analysis

This folder contains a Docker-based setup to run SonarQube locally and a helper script to scan the different project versions in this repository.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

## 1. Start SonarQube Server

Open a terminal in this directory (`sonarqube`) and run:

```bash
docker compose up -d
```

Wait for a minute or two for the server to fully start.

## 2. Initial Configuration

1. Open your browser and go to [http://localhost:9000](http://localhost:9000).
2. Log in with the default credentials:
   - **Login:** `admin`
   - **Password:** `admin`
3. You will be prompted to change the password. Set a new secure password.
4. **Generate a User Token** (Required for scanning):
   - Click on your profile icon (top right) > **My Account** > **Security**.
   - Under **Generate Tokens**, enter a name (e.g., `local-scan`), select **User Token**, and click **Generate**.
   - **Copy the token immediately**. You won't be able to see it again.

## 3. Scanning Projects

Use the provided `scan.sh` script to analyze code. You need to run this from the `sonarqube` directory.

**Usage:**
```bash
./scan.sh <relative_path_to_project_root> <your_sonar_token>
```

### Examples

**Scan Version 2 (Inventory Full):**
```bash
./scan.sh ../src/versions/v.2/inventory_full_version sqp_YOUR_GENERATED_TOKEN
```

**Scan Version 3 (Online Shop):**
*Note: Use quotes if the path contains spaces.*
```bash
./scan.sh "../src/versions/v.3/online-shop-inventory 2" sqp_YOUR_GENERATED_TOKEN
```

**Scan Version 4 (Shopping Cart):**
```bash
./scan.sh ../src/versions/v.4/shopping-cart-app sqp_YOUR_GENERATED_TOKEN
```

## 4. View Results

After the scan completes, refresh your SonarQube dashboard at [http://localhost:9000](http://localhost:9000) to see the analysis reports, bugs, vulnerabilities, and code smells.

## 5. Stop Server

To stop the SonarQube server and free up resources:

```bash
docker compose down
```
