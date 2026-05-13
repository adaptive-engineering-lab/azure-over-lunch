# LP1 – Module 1: Introduction to Azure Cloud Shell

**Learning Path:** AZ-104 Prerequisites for Azure Administrators  
**Difficulty:** 🟢 Beginner  
**Estimated Study Time:** ~30 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/intro-to-azure-cloud-shell/

---

## 📋 Module Overview

Azure Cloud Shell is a browser-accessible, Microsoft-managed command-line environment for managing Azure resources. It eliminates the need for local tool installation and is always up to date with the latest Azure CLI and PowerShell modules.

---

## 🎯 Learning Objectives

By the end of this module, you should be able to:
- Describe Azure Cloud Shell and the functionality it provides
- Determine whether Azure Cloud Shell meets the needs of your organisation
- Recognise how to use Azure Cloud Shell and persist files across multiple sessions

---

## 📖 Key Concepts & Detailed Notes

### 1. What is Azure Cloud Shell?

Azure Cloud Shell is a command-line environment accessible through a web browser. It allows you to manage Azure resources — including VMs, storage, and networking — just as you would with Azure CLI or Azure PowerShell installed locally.

**Key characteristics:**
- **Microsoft-managed:** Always has the latest Azure CLI and PowerShell modules — no manual updates required
- **Browser-based:** No local installation needed; accessible from any device with a browser
- **Secure by default:** Infrastructure is compliant with double encryption at rest by default
- **Persistent storage:** Provides cloud storage (CloudDrive) to persist files like SSH keys and scripts between sessions
- **Integrated editor:** Cloud Shell editor (based on Monaco) allows editing of files stored in CloudDrive

> 💡 **Scenario:** You are an IT admin on call during a weekend visit to family. You don't have your workstation, but using a borrowed laptop, you open Azure Cloud Shell from a browser, mount your Azure File Share, access your diagnostic scripts, and fix an unresponsive VM — all without installing anything.

---

### 2. How Azure Cloud Shell Works

#### Accessing Cloud Shell
There are three ways to access Azure Cloud Shell:

| Access Method | How |
|---|---|
| Direct URL | Navigate to https://shell.azure.com |
| Azure Portal | Click the Cloud Shell icon (>_) in the top toolbar |
| Microsoft Learn | Use the "Try it" code snippet buttons in docs |

#### Session Behaviour
- When you open a session, a **temporary host VM** is allocated, preconfigured with the latest Bash and PowerShell environments
- You choose your preferred shell experience: **Bash** or **PowerShell**
- Sessions **automatically terminate after 20 minutes of inactivity**
- Files stored on CloudDrive persist between sessions; local session state does not

#### CloudDrive and File Persistence
- **CloudDrive** is an Azure Files share mounted automatically in your Cloud Shell session
- Files stored here are accessible across sessions and from different machines
- You can also map a specific **Azure Storage File Share** to Cloud Shell, tied to a region

```bash
# Example: Open a file in the Cloud Shell editor
code temp.txt
```

> ⚠️ The `code` command only works in Classic mode. Enable it via: More (...) → Settings → Go to Classic version.

#### Pre-installed Tools

Cloud Shell comes with a rich set of pre-installed tools:

| Category | Tools |
|---|---|
| **Linux tools** | bash, zsh, sh, tmux, dig |
| **Azure tools** | Azure CLI, AzCopy, Azure Functions CLI, Service Fabric CLI, blobxfer |
| **Text editors** | code (Cloud Shell editor), vim, nano, emacs |
| **Source control** | git |
| **Build tools** | make, maven, npm, pip |
| **Containers** | Docker Machine, kubectl, Helm, DC/OS CLI |
| **Databases** | MySQL client, PostgreSQL client, sqlcmd, mssql-scripter |
| **Other** | Terraform, Ansible, Chef InSpec, Puppet Bolt, HashiCorp Packer, Office 365 CLI |

---

### 3. When to Use Azure Cloud Shell

#### ✅ Use Cloud Shell when you need to:
- Open a **secure command-line session from any browser-based device**
- Manage Azure resources **without installing plugins or add-ons**
- **Persist files** between sessions for later use
- Use **Bash or PowerShell** — whichever you prefer
- **Edit scripts** stored on CloudDrive via the integrated editor

#### ❌ Do NOT use Cloud Shell when:
- You need a **session open for more than 20 minutes** — it will disconnect without warning and current state is lost
- You require **admin permissions (sudo access)** within CLI or PowerShell
- You need to **install tools not supported** in the limited Cloud Shell environment (custom VMs or containers may be better)
- You need **storage from multiple regions** — Cloud Shell only allocates storage in one region
- You need **multiple concurrent sessions** — Cloud Shell only allows one instance at a time per user

---

## 🧪 Scenario-Based Examples

### Scenario 1: Remote Troubleshooting (Beginner)
**Situation:** An on-call admin is away from their workstation. A VM becomes unresponsive.  
**Solution:** The admin accesses Cloud Shell from any browser → mounts their Azure File Share containing diagnostic scripts → runs scripts → resolves the issue.  
**Key concept tested:** Cloud Shell accessibility, file persistence via CloudDrive.

### Scenario 2: Script Editing Across Devices (Beginner)
**Situation:** A developer writes a deployment script at the office and needs to refine it from home.  
**Solution:** The script is stored on CloudDrive → accessible from any device → edited with `code` command in the Cloud Shell editor.  
**Key concept tested:** CloudDrive persistence, Cloud Shell editor.

### Scenario 3: Tool Availability (Intermediate)
**Situation:** A DevOps engineer needs to deploy Terraform infrastructure from a corporate laptop with no local tools.  
**Solution:** Open Cloud Shell — Terraform is pre-installed. Run `terraform init` and `terraform apply` directly.  
**Key concept tested:** Pre-installed tools in Cloud Shell.

### Scenario 4: Choosing the Right Tool (Intermediate)
**Situation:** A team needs to run a long-running batch script that takes 45 minutes.  
**Solution:** Cloud Shell is NOT suitable (20-minute timeout). Use Azure CLI or PowerShell installed locally, or an Azure Automation Runbook.  
**Key concept tested:** Cloud Shell limitations — 20-minute session timeout.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** Azure Cloud Shell sessions terminate after **20 minutes** of inactivity.

> 🎯 **[TESTABLE – Beginner]** Cloud Shell can be accessed via **shell.azure.com**, the **Azure portal**, or **Microsoft Learn** code snippets.

> 🎯 **[TESTABLE – Beginner]** Cloud Shell supports both **Bash** and **PowerShell** — the user chooses at session start.

> 🎯 **[TESTABLE – Beginner]** Files persisted in **CloudDrive** remain available across sessions and across different devices.

> 🎯 **[TESTABLE – Intermediate]** Cloud Shell requires **no local installation** — Microsoft manages all tool versions.

> 🎯 **[TESTABLE – Intermediate]** Cloud Shell does **NOT support sudo access** or admin-level permissions.

> 🎯 **[TESTABLE – Intermediate]** Cloud Shell is **not suitable** for long-running scripts (>20 min), multiple concurrent sessions, or multi-region storage needs.

> 🎯 **[TESTABLE – Intermediate]** The infrastructure underlying Cloud Shell is compliant with **double encryption at rest** by default.

> 🎯 **[TESTABLE – Intermediate]** Pre-installed tools in Cloud Shell include: **Terraform, Ansible, kubectl, Helm, Docker Machine, Azure CLI, git**, and more.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Azure Cloud Shell** | A browser-accessible, Microsoft-managed command-line environment for managing Azure resources |
| **CloudDrive** | An Azure Files share automatically mounted in Cloud Shell sessions for persistent file storage |
| **Azure File Share** | A managed cloud file share that can be mounted in Cloud Shell, tied to a specific region |
| **Bash** | A Unix shell available within Cloud Shell for running scripts and CLI commands |
| **PowerShell** | A cross-platform task automation and configuration management shell available within Cloud Shell |
| **Cloud Shell Editor** | An integrated text editor (Monaco-based) available within Cloud Shell via the `code` command |
| **Session Timeout** | Cloud Shell terminates automatically after 20 minutes of inactivity |

---

## 📝 Exam Tips

- Remember the **three access points**: shell.azure.com, Azure portal, Microsoft Learn
- The **20-minute timeout** is a frequently tested limitation
- Cloud Shell is **NOT a replacement** for a full local development environment — it has constraints
- When a question asks about accessing Azure CLI/PowerShell **without local installation**, the answer is Cloud Shell
- Cloud Shell **does not support** sudo, multiple sessions, or multi-region storage

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
