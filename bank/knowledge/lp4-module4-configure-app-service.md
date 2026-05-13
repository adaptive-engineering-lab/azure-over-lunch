# LP4 – Module 4: Configure Azure App Service

**Learning Path:** AZ-104 Deploy and Manage Azure Compute Resources  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~75 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/configure-azure-app-services/

---

## 📋 Module Overview

Azure App Service is a fully managed PaaS for hosting web applications, REST APIs, and mobile backends. This module covers creating and configuring App Service apps, deployment slots, security, custom domains, backup/restore, and Application Insights monitoring.

---

## 🎯 Learning Objectives

- Identify features and usage cases for Azure App Service
- Create an app with Azure App Service
- Configure deployment settings and deployment slots
- Secure your Azure App Service app
- Configure custom domain names
- Back up and restore your App Service app
- Configure Azure Application Insights

---

## 📖 Key Concepts & Detailed Notes

### 1. What is Azure App Service?

Azure App Service is a **fully managed PaaS** platform for building, deploying, and scaling web apps. It handles infrastructure management — you focus on code.

**Supported workload types:**
- Web applications (ASP.NET, ASP.NET Core, Java, Ruby, Node.js, PHP, Python, Go)
- REST APIs
- Mobile backends
- Automated background tasks (WebJobs)

**Key features:**
- Fully managed infrastructure (no VMs to manage)
- Built-in auto-scaling and load balancing
- Supports Windows and Linux runtime environments
- CI/CD integration with GitHub, Azure DevOps, Bitbucket, Docker Hub
- Built-in authentication and authorisation (App Service Authentication)
- Custom domain and TLS/SSL certificate support
- Staging environments via deployment slots

---

### 2. Continuous Integration and Deployment

App Service supports multiple CI/CD sources:

| Source | Description |
|---|---|
| **Azure DevOps** | Build and deploy from Azure Pipelines |
| **GitHub** | GitHub Actions integration |
| **Bitbucket** | Deploy from Bitbucket repositories |
| **Local Git** | Push code directly via Git to App Service |
| **Docker Hub / ACR** | Deploy container images directly |
| **FTP/FTPS** | Direct file upload |

**Deployment methods:**
- **Manual** — ZIP deploy, FTP, Git push
- **Automated** — CI/CD pipeline triggers on code commit

---

### 3. Deployment Slots

Deployment slots are **live, independently hostnamed environments** within the same App Service app — allowing staging and testing before production.

**Requirements:** Standard, Premium, or Isolated tier (not Free or Basic)

**Slot counts by tier:**
- Standard: **5 slots** (including production)
- Premium/Isolated: **20 slots** (including production)

**Key slot capabilities:**

| Feature | Description |
|---|---|
| **Slot swap** | Swaps app content and configuration between two slots (e.g., staging → production) |
| **Validation** | Test changes in staging before swapping to production |
| **Zero downtime** | All instances are warmed up before swap; no requests dropped |
| **Rollback** | If swap causes issues, swap again to revert to previous production |
| **Auto swap** | Automatically swap to production when code is deployed to a slot (zero cold starts) |

**Slot-specific vs. swappable settings:**

| Slot-specific (NOT swapped) | Swappable (ARE swapped) |
|---|---|
| Scaling settings | App content |
| Custom domain bindings | Connection strings (if configured to swap) |
| TLS/SSL certificates | App settings (if configured to swap) |
| WebJobs schedulers | Handler mappings |

> 💡 **Scenario:** Contoso deploys a new version of their website to a **staging slot**. QA tests it for 30 minutes. When approved, the admin performs a **slot swap** — staging becomes production instantly with no downtime. If issues arise, a reverse swap restores the previous version immediately.

---

### 4. Securing App Service Apps

**App Service Authentication (Easy Auth):**
- Built-in authentication and authorisation module
- Can authenticate users without modifying app code
- Supports: Microsoft Entra ID, Facebook, Google, Twitter, any OpenID Connect provider

**HTTPS enforcement:**
- Redirect all HTTP traffic to HTTPS
- Configurable in TLS/SSL settings

**TLS/SSL certificates:**
- Upload custom certificates or use **App Service Managed Certificates** (free for custom domains)
- Enforce minimum TLS version (TLS 1.0, 1.1, 1.2, or 1.3)

**Network restrictions:**
- **Access restrictions** — Allow/deny traffic based on IP address, CIDR range, or virtual network
- **VNet integration** — Connect App Service to a VNet for outbound access to private resources
- **Private endpoints** — Expose App Service on a private IP for inbound traffic (not public internet)

**Managed Identity:**
- Assign a **system-assigned or user-assigned managed identity** to App Service
- Allows accessing Azure Key Vault, Storage, SQL Database without storing credentials in code

---

### 5. Custom Domain Names

Custom domains can be added to App Service apps:

**Steps:**
1. Purchase and configure domain with DNS registrar
2. Verify domain ownership (TXT or CNAME record)
3. Add a CNAME or A record mapping the domain to App Service
4. Add the custom domain in App Service settings

**Domain types:**
- **Apex domain** (e.g., `contoso.com`) — uses A record + TXT verification
- **Subdomain** (e.g., `www.contoso.com`) — uses CNAME record

---

### 6. Backup and Restore

App Service supports automated backup of app content, configuration, and connected databases.

**Backup requirements:** **Standard tier or higher**

**What is backed up:**
- App configuration
- File content
- Database connected to the app (SQL Database, MySQL, PostgreSQL)

**Backup storage:** Stored in an Azure Storage account (Blob Storage container)

**Backup types:**
- **Manual backups** — On-demand
- **Scheduled backups** — Configurable schedule (frequency, retention period)

**Limits by tier:**
- Standard: **10 backups per day**
- Premium/Isolated: **50 backups per day**

---

### 7. Application Insights (Monitoring)

**Azure Application Insights** is an Application Performance Monitoring (APM) service integrated with App Service.

**Key capabilities:**

| Feature | Description |
|---|---|
| **Request tracking** | Log all HTTP requests including URL, response time, status code |
| **Exception tracking** | Capture unhandled exceptions and stack traces |
| **Dependency tracking** | Track calls to databases, external APIs, storage |
| **Performance metrics** | CPU, memory, response times, throughput |
| **Availability tests** | Periodic tests to verify app is responding (ping tests, multi-step tests) |
| **Smart detection** | ML-based anomaly detection for performance degradation |
| **Live metrics** | Real-time stream of performance data |
| **Application Map** | Visual diagram of app components and their dependencies |

**Integration:** Enable Application Insights in App Service settings — no code changes required for basic telemetry.

---

## 🧪 Scenario-Based Examples

### Scenario 1: Zero-Downtime Deployment with Slots (Beginner)
**Situation:** Contoso needs to deploy a major update to their production web app without any downtime.  
**Solution:** Deploy to the **staging slot**. Validate the new version. Perform a **slot swap** to swap staging to production. All instances warm up before traffic is redirected — zero dropped requests.  
**Key concept:** Deployment slots, zero-downtime swap.

### Scenario 2: Rollback After Bad Deployment (Beginner)
**Situation:** After a slot swap, the team discovers a critical bug in the newly deployed production version.  
**Solution:** Perform another **slot swap** to swap production and staging back. The previous version is restored instantly — the old production app is still in the staging slot.  
**Key concept:** Slot swap rollback.

### Scenario 3: Managed Identity for Key Vault Access (Intermediate)
**Situation:** A developer stores a database password in the app code to connect to SQL Database.  
**Problem:** This is a security risk — secrets in code.  
**Solution:** Assign a **managed identity** to the App Service app. Grant the identity access to **Azure Key Vault**. The app retrieves the database connection string from Key Vault at runtime — no credentials in code.  
**Key concept:** Managed identity, Key Vault integration, no credentials in code.

### Scenario 4: Monitoring Failed Requests (Intermediate)
**Situation:** Users report intermittent errors on Contoso's web app. The development team wants to understand which requests are failing and why.  
**Solution:** Enable **Application Insights** on the App Service app. View the **Failures** blade to see failed requests, exception traces, and dependency failures. Use **Smart Detection** for anomaly alerts.  
**Key concept:** Application Insights, request tracking, exception tracking.

### Scenario 5: App Service Backup for Compliance (Intermediate)
**Situation:** A financial app must retain configuration and database backups for 30 days for compliance.  
**Solution:** Configure **scheduled backups** (Standard tier minimum) pointing to an Azure Storage account. Set retention to 30 days. Backup includes app configuration and connected SQL Database.  
**Key concept:** App Service backup, Standard tier requirement, storage account destination.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** Deployment slots require **Standard, Premium, or Isolated** tier — not Free or Basic.

> 🎯 **[TESTABLE – Beginner]** **Standard** tier supports **5 deployment slots**; **Premium/Isolated** supports **20**.

> 🎯 **[TESTABLE – Beginner]** **App Service backup** requires **Standard tier or higher**.

> 🎯 **[TESTABLE – Intermediate]** Slot swap provides **zero downtime** — all instances are warmed up before traffic redirection.

> 🎯 **[TESTABLE – Intermediate]** **Auto swap** automatically deploys to production when code is pushed to a slot — no manual swap needed.

> 🎯 **[TESTABLE – Intermediate]** **Managed Identity** allows App Service to access Azure services (Key Vault, Storage) without storing credentials.

> 🎯 **[TESTABLE – Intermediate]** **Application Insights** provides request tracking, exception tracking, dependency tracking, availability tests, and smart detection.

> 🎯 **[TESTABLE – Intermediate]** **App Service Authentication (Easy Auth)** provides built-in auth without code changes — supports Entra ID, Google, Facebook, Twitter.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Azure App Service** | Fully managed PaaS for hosting web apps, APIs, and mobile backends |
| **Deployment slot** | Live staging environment with its own hostname for testing before production |
| **Slot swap** | Swapping app content and configuration between two slots |
| **Auto swap** | Automatic slot-to-production swap when code is deployed to a slot |
| **App Service Authentication** | Built-in auth module (Easy Auth) supporting multiple identity providers |
| **Managed Identity** | Azure-managed identity for App Service to access other services without credentials |
| **Application Insights** | APM service for monitoring app performance, requests, exceptions, and dependencies |
| **VNet Integration** | Connects App Service to a VNet for outbound access to private resources |
| **Private endpoint** | Exposes App Service on a private IP for inbound traffic (no public internet access) |
| **WebJobs** | Background tasks running alongside web apps on App Service |

---

## 📝 Exam Tips

- **Deployment slots = Standard or higher** (Standard = 5, Premium/Isolated = 20)
- **Slot swap = zero downtime + rollback capability**
- **Auto swap = CI/CD continuous deployment** without manual intervention
- **Backup = Standard or higher**, stored in Azure Blob Storage
- **Managed Identity = no credentials in code** — use for Key Vault and other Azure service access
- **Application Insights = APM** — request, exception, dependency tracking, smart detection
- App Service supports **Windows and Linux** runtimes

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
