# LP4 – Module 5: Configure Azure Container Instances

**Learning Path:** AZ-104 Deploy and Manage Azure Compute Resources  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~45 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/configure-azure-container-instances/

---

## 📋 Module Overview

Azure Container Instances (ACI) provides a fast, serverless way to run containers in Azure without managing VMs or orchestrators. This module covers containers vs VMs, ACI features, and container group configuration.

---

## 🎯 Learning Objectives

- Identify when to use containers versus virtual machines
- Identify features and usage cases of Azure Container Instances
- Implement Azure container groups

---

## 📖 Key Concepts & Detailed Notes

### 1. Containers vs. Virtual Machines

Both provide isolation for running applications, but with key differences:

| Feature | Containers | Virtual Machines |
|---|---|---|
| **Isolation** | Lightweight OS-level isolation — shares host OS kernel | Full hardware-level isolation — separate OS kernel per VM |
| **Security boundary** | Weaker — shares kernel with host | Stronger — complete isolation from host OS |
| **OS** | Virtualises user-mode OS — contains only what the app needs | Runs a complete OS including the kernel |
| **Resources** | Uses fewer CPU, memory, storage resources | Requires more resources (complete OS overhead) |
| **Deployment** | Docker CLI for single containers; AKS/orchestrators for multi-container | Azure portal, PowerShell, ARM templates |
| **Persistent storage** | Azure Disks (single node) or Azure Files (multi-node SMB shares) | Virtual Hard Disk (VHD) or SMB file shares |
| **Fault tolerance** | Orchestrator recreates containers on another node on failure | VM fails over to another host; OS restarts |
| **Start time** | Seconds | Minutes |
| **Portability** | High — same container runs on dev, test, prod | Lower — requires VM config matching |

**When to choose containers:**
- Need fast startup and lightweight deployment
- Developing and testing in isolated environments
- Streamlined, consistent application deployment
- Higher workload density on same hardware

**When to choose VMs:**
- Need strong security isolation (e.g., hosting apps from competing companies)
- Need full OS control (kernel settings, drivers)
- Running legacy apps requiring specific OS components

---

### 2. Azure Container Instances (ACI)

**ACI** provides the fastest and simplest way to run a container in Azure — **serverless containers** with no VM management.

**Key characteristics:**
- **Serverless** — No VM provisioning or management required
- **Fast startup** — Containers start in seconds
- **Per-second billing** — Pay only for compute used (CPU and memory per second)
- **Custom CPU and memory** — Specify exact resource requirements
- **Persistent storage** — Mount Azure Files shares for persistent data
- **Public and private connectivity** — Expose via public IP or deploy in a VNet
- **Linux and Windows containers** — Both supported
- **Co-located container groups** — Multiple containers on the same host

**ACI is NOT a full orchestration platform** — for complex multi-container microservices with auto-scaling, use **Azure Kubernetes Service (AKS)**.

---

### 3. Container Groups

The top-level resource in ACI is the **container group** — a collection of containers scheduled on the **same host machine** that share a lifecycle, resources, local network, and storage volumes.

> 🔑 A container group is analogous to a **pod in Kubernetes**.

**Resource sharing in a container group:**
- ACI allocates resources by adding together the requests of all containers in the group
- All containers in a group share the same external IP address and port namespace

**Port namespace sharing:**
- Containers in a group **share a port namespace** — port mapping is NOT supported
- Each container listens on a unique port; external clients access via the group's shared IP

**IP and DNS behaviour:**
- Container groups expose a **single public IP address**
- Optional **DNS name label** (FQDN: `<label>.<region>.azurecontainer.io`)
- When a container group is deleted, its **IP address and FQDN are released**

---

### 4. Deploying Multi-Container Groups

Three deployment methods for multi-container groups:

| Method | Format | Best For |
|---|---|---|
| **ARM template** | JSON | Deploying alongside other Azure resources |
| **Bicep** | Bicep (Microsoft's IaC language) | Concise, IntelliSense-supported infrastructure as code |
| **YAML file** | YAML | Container-focused deployments without other Azure resources |

---

### 5. Use Cases for Multi-Container Groups

| Use Case | Description |
|---|---|
| **Web app + content puller** | One container serves the web app; another pulls latest content from source control |
| **Log data collection** | App container outputs logs; logging container writes to long-term storage |
| **App monitoring** | App container runs the application; monitoring container periodically checks health and raises alerts |
| **Front-end + back-end** | Front-end container serves the web UI; back-end container retrieves data |

---

### 6. Azure Container Apps vs. ACI

| Feature | Azure Container Instances (ACI) | Azure Container Apps |
|---|---|---|
| **Best for** | Single containers, short tasks, dev/test | Microservices, event-driven apps, long-running services |
| **Scaling** | Manual (no auto-scaling) | Built-in auto-scaling (KEDA-based) |
| **Orchestration** | None | Managed Kubernetes-based |
| **Ingress** | Manual IP/port configuration | Built-in HTTP ingress |
| **Pricing** | Per-second CPU/memory | Per vCPU-second and per request |

---

## 🧪 Scenario-Based Examples

### Scenario 1: Containers vs. VMs for Security Isolation (Beginner)
**Situation:** A cloud provider hosts apps for two competing companies (Company A and Company B) on the same infrastructure.  
**Question:** Should they use containers or VMs?  
**Answer:** **VMs** — containers provide weaker isolation (shared kernel). VMs provide complete OS isolation with a separate kernel per customer.  
**Key concept:** VM security boundary stronger than containers for multi-tenant, security-sensitive isolation.

### Scenario 2: Simple Batch Job (Beginner)
**Situation:** Contoso needs to run a nightly data processing script. They don't want to manage VMs or a Kubernetes cluster.  
**Solution:** Use **Azure Container Instances** — deploy the script as a container, it runs and exits. Pay only for the seconds it runs. No infrastructure to manage.  
**Key concept:** ACI for short-lived, serverless container workloads.

### Scenario 3: Sidecar Container Pattern (Intermediate)
**Situation:** A team deploys a web app that generates logs. A separate team manages log collection and storage. They want both to run together.  
**Solution:** Create a **container group** with two containers: the web app container (port 80) and a log collection sidecar container (listening on a different port). Both share the same host and local network.  
**Key concept:** Multi-container group, sidecar pattern.

### Scenario 4: Container Group Port Conflict (Intermediate)
**Situation:** Two containers in a group both try to listen on port 80.  
**Question:** What happens?  
**Answer:** This is a conflict — containers in a group **share a port namespace**. Both cannot listen on port 80 simultaneously. One must use a different port (e.g., port 8080).  
**Key concept:** Shared port namespace in container groups; port mapping not supported.

### Scenario 5: Choosing ACI vs. AKS (Intermediate)
**Situation:** Contoso needs to deploy 20 microservices that auto-scale independently based on load and communicate with each other via service discovery.  
**Solution:** **Azure Kubernetes Service (AKS)** — ACI doesn't provide auto-scaling or service discovery for complex microservice architectures. ACI is best for simple, isolated, short-lived container workloads.  
**Key concept:** ACI for simple/short workloads; AKS for complex orchestration and auto-scaling.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** Containers provide **weaker security isolation** than VMs — they share the host OS kernel.

> 🎯 **[TESTABLE – Beginner]** ACI provides **serverless container** execution — no VM management required.

> 🎯 **[TESTABLE – Beginner]** ACI billing is **per second** based on CPU and memory allocated.

> 🎯 **[TESTABLE – Intermediate]** A **container group** is the top-level ACI resource — analogous to a **Kubernetes pod**.

> 🎯 **[TESTABLE – Intermediate]** Containers in a group **share a port namespace** — port mapping is NOT supported.

> 🎯 **[TESTABLE – Intermediate]** When a container group is deleted, its **IP address and FQDN are released**.

> 🎯 **[TESTABLE – Intermediate]** Multi-container groups can be deployed via **ARM template, Bicep, or YAML**.

> 🎯 **[TESTABLE – Intermediate]** ACI does NOT support **auto-scaling** — use AKS or Azure Container Apps for that.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Container** | A lightweight, isolated runtime environment sharing the host OS kernel |
| **Container image** | A read-only template used to create containers |
| **Azure Container Instances (ACI)** | Serverless Azure service for running containers without managing VMs |
| **Container group** | A collection of containers on the same host sharing lifecycle, network, and storage |
| **Pod** | Kubernetes equivalent of a container group (ACI container groups are similar to pods) |
| **Sidecar container** | A secondary container in a group supporting the primary container (e.g., log collector, health monitor) |
| **Azure Container Apps** | Managed serverless container platform with built-in auto-scaling and microservice support |
| **AKS (Azure Kubernetes Service)** | Managed Kubernetes service for complex container orchestration |
| **YAML** | Deployment format for container-focused ACI deployments |
| **FQDN** | Fully Qualified Domain Name — DNS label + region for ACI container group |

---

## 📝 Exam Tips

- **Containers = OS-level isolation (lighter); VMs = hardware-level isolation (stronger security)**
- **ACI = serverless, per-second billing, fast startup, no orchestration**
- **Container group = pod equivalent** — same host, shared resources, network, storage
- **Shared port namespace** in a group — no port mapping, containers must use unique ports
- **ACI deleted = IP and FQDN released** — not preserved
- **ACI vs. AKS**: ACI for simple/short tasks; AKS for complex, scalable microservices
- Deployment methods: **ARM template, Bicep, YAML**

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
