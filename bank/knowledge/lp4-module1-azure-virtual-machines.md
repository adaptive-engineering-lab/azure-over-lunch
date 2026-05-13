# LP4 – Module 1: Introduction to Azure Virtual Machines

**Learning Path:** AZ-104 Deploy and Manage Azure Compute Resources  
**Difficulty:** 🟢 Beginner  
**Estimated Study Time:** ~75 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/intro-to-azure-virtual-machines/

---

## 📋 Module Overview

Azure Virtual Machines (VMs) are IaaS compute resources that provide full control over the OS, software, and configuration. This module covers the decisions required before creating a VM, VM components, sizing, OS selection, disk types, and pricing models.

---

## 🎯 Learning Objectives

- Compile a checklist for creating a virtual machine
- Describe options to create and manage virtual machines
- Describe additional services available to administer virtual machines

---

## 📖 Key Concepts & Detailed Notes

### 1. Pre-Deployment Checklist — What to Plan Before Creating a VM

When deploying a VM in Azure, several interconnected resources are created. Planning these upfront is essential:

| Resource | Notes |
|---|---|
| **Virtual Network (VNet)** | Private connectivity between Azure resources |
| **Subnet** | Logical segment of the VNet address space |
| **Network Interface Card (NIC)** | Connects the VM to the VNet |
| **Network Security Group (NSG)** | Software firewall for inbound/outbound traffic control |
| **Public IP address** (optional) | Required for direct internet connectivity |
| **OS Disk** | Stores the operating system (charged at regular disk rate) |
| **Data Disks** (optional) | Separate disks for application data |
| **Temporary disk** | Local, ephemeral storage — NOT charged, NOT persistent |

**Key planning items:**

#### Network Planning (Do This First!)
- Network addresses and subnets are not trivial to change after setup
- Use non-overlapping private IP ranges: `10.0.0.0/8`, `172.16.0.0/12`, or `192.168.0.0/16`
- If connecting to on-premises or other VNets, ensure **no address space overlap**
- Azure reserves the **first 4 and last 1 address** in each subnet

#### VM Naming Conventions
Recommended naming elements:

| Element | Example | Purpose |
|---|---|---|
| Environment | dev, prod, QA | Identifies environment |
| Location | eus (East US), jw (Japan West) | Identifies region |
| Instance | 01, 02 | Differentiates multiple VMs |
| Product/Service | service, web | Identifies workload |
| Role | sql, web, messaging | Identifies VM role |

**Example:** `deveus-webvm01` = Development, East US, Web VM, instance 1

> ⚠️ VM names: up to **64 characters on Linux**, up to **15 characters on Windows** (Windows computer name limit).

---

### 2. VM Sizes and Workload Types

Azure provides VM sizes grouped by workload type:

| VM Family | Description | Use Cases |
|---|---|---|
| **General purpose** | Balanced CPU-to-memory ratio | Dev/test, small databases, low-traffic web servers |
| **Compute optimised** | High CPU-to-memory ratio | Medium web servers, network appliances, batch processing |
| **Memory optimised** | High memory-to-CPU ratio | Relational databases, large caches, in-memory analytics |
| **Storage optimised** | High disk throughput and IOPS | Database VMs with heavy I/O |
| **GPU** | Specialised for graphics/video | Deep learning, model training/inference, video editing |
| **High performance compute** | Fastest CPU, optional high-throughput network | Scientific simulations, HPC workloads |

**Changing VM size:**
- Can be done while VM is running (if new size available on same hardware cluster) — causes a **reboot**
- **Stop and deallocate** first to access all available sizes in the region
- ⚠️ Resizing production VMs causes temporary outage and may change IP address

---

### 3. Disk Types for Azure VMs

All Azure VMs have at least two disks:
- **OS disk** — persistent, contains the operating system (charged at regular disk rate)
- **Temporary disk** — local, ephemeral storage (NOT persistent, NOT charged); data is lost on VM stop/deallocate or reboot to a different host

Additional **data disks** can be attached — maximum depends on VM size (typically 2 per vCPU).

**Five disk types:**

| Disk Type | Storage | Scenario | Max IOPS | Max Size |
|---|---|---|---|---|
| **Ultra disk** | SSD | IO-intensive: SAP HANA, top-tier databases | 160,000 | 65,536 GiB |
| **Premium SSD v2** | SSD | Production/performance-sensitive, low latency | 80,000 | 65,536 GiB |
| **Premium SSD** | SSD | Production/performance: databases, web servers | 20,000 | 32,767 GiB |
| **Standard SSD** | SSD | Web servers, lightly used enterprise apps | 6,000 | 32,767 GiB |
| **Standard HDD** | HDD | Backups, non-critical, infrequent access | 2,000 | 32,767 GiB |

> ⚠️ **Ultra disk and Premium SSD v2 cannot be used as the OS disk** — only Premium SSD, Standard SSD, and Standard HDD can be used as OS disks.

---

### 4. Operating System Options

- **Azure Marketplace images** — Pre-configured base OS images (Windows Server, Ubuntu, RHEL, Debian, etc.)
- **Marketplace images with software** — Combined OS + application stacks (e.g., WordPress, SQL Server on Linux)
- **Custom images** — Capture your own configured VM as an image; manage via **Azure Compute Gallery**

**Cost note:** Linux VMs are cheaper (no OS licence charge). Windows VMs include the Windows OS licence cost.

**Azure Hybrid Benefit:** Use existing on-premises Windows Server or SQL Server licences for Azure VMs to reduce licensing costs.

---

### 5. Pricing Models

**Two cost components:**
1. **Compute** — Charged per second (billed per minute); varies by VM size and OS
2. **Storage** — Charged separately for disks; continues even when VM is stopped/deallocated

**Two compute payment options:**

| Option | Description | Best For |
|---|---|---|
| **Pay-as-you-go** | Pay per second, no commitment; stop anytime | Short-term, unpredictable, dev/test workloads |
| **Reserved VM Instances (RI)** | 1 or 3-year commitment; up to **72% discount** vs. pay-as-you-go | Steady-state production workloads with predictable usage |

> 💡 Stopping and **deallocating** a VM stops compute charges. **Stopping** without deallocating still incurs compute charges (VM is still allocated to hardware).

---

### 6. VM Creation Options

Azure VMs can be created via:
- **Azure portal** — GUI-based, guided experience
- **Azure CLI** — Command-line scripting
- **Azure PowerShell** — PowerShell cmdlets
- **ARM templates / Bicep** — Infrastructure as code, repeatable deployments
- **Azure Marketplace** — Pre-configured images with software

---

## 🧪 Scenario-Based Examples

### Scenario 1: Naming Convention (Beginner)
**Situation:** Contoso is deploying 3 production SQL Server VMs in East US.  
**Naming:** `prodeus-sqlvm01`, `prodeus-sqlvm02`, `prodeus-sqlvm03`  
**Key concept:** Consistent naming convention elements: environment, location, role, instance.

### Scenario 2: Choosing VM Size (Beginner)
**Situation:** A team is deploying a high-memory SAP HANA database on Azure.  
**Solution:** **Memory optimised** VM family (e.g., M-series) — designed for high memory-to-CPU ratio workloads.  
**Key concept:** VM size families matched to workload types.

### Scenario 3: Temporary Disk Data Loss (Intermediate)
**Situation:** A developer stores application log files on the temporary disk (D: on Windows). After the VM is deallocated and restarted, the logs are gone.  
**Cause:** The temporary disk is **ephemeral** — data is lost on deallocation or host migration.  
**Solution:** Store persistent data on the OS disk or an attached data disk.  
**Key concept:** Temporary disk = not persistent; use data disks for persistent storage.

### Scenario 4: Reserved vs. Pay-as-you-go (Intermediate)
**Situation:** Contoso runs 10 production VMs 24/7 for the foreseeable 3 years. Should they use pay-as-you-go or reserved instances?  
**Solution:** **Reserved Instances (3-year)** — up to 72% savings vs. pay-as-you-go for consistently running VMs.  
**Key concept:** RI discount for predictable, long-running workloads.

### Scenario 5: OS Disk Type for Production Database (Intermediate)
**Situation:** A DBA needs an OS disk for a production SQL Server VM with consistent low latency.  
**Solution:** **Premium SSD** — supported as an OS disk, provides consistent SSD performance for production databases. Ultra disk and Premium SSD v2 cannot be used as OS disks.  
**Key concept:** Ultra and Premium SSD v2 cannot be OS disks.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** VM names: up to **64 characters on Linux**, **15 characters on Windows**.

> 🎯 **[TESTABLE – Beginner]** Azure reserves the **first 4 addresses and last 1 address** in each subnet.

> 🎯 **[TESTABLE – Beginner]** The **temporary disk** is ephemeral — data is lost when the VM is deallocated or moved to a new host.

> 🎯 **[TESTABLE – Beginner]** **Storage costs continue** even when a VM is stopped/deallocated — only compute costs stop.

> 🎯 **[TESTABLE – Intermediate]** **Ultra disk and Premium SSD v2 cannot be used as OS disks** — only Premium SSD, Standard SSD, Standard HDD.

> 🎯 **[TESTABLE – Intermediate]** **Reserved VM Instances** provide up to **72% discount** over pay-as-you-go for 1 or 3-year commitments.

> 🎯 **[TESTABLE – Intermediate]** **Memory optimised** VM families are designed for relational databases and in-memory analytics.

> 🎯 **[TESTABLE – Intermediate]** Resizing a running VM causes an **automatic reboot**. To access all sizes in a region, **stop and deallocate** first.

> 🎯 **[TESTABLE – Intermediate]** **Azure Hybrid Benefit** allows using existing Windows Server/SQL Server licences on Azure VMs to reduce costs.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Azure VM** | An IaaS compute resource providing virtualised server infrastructure |
| **VM size** | The combination of CPU, memory, storage, and network capacity for a VM |
| **Temporary disk** | Local ephemeral disk on a VM host; not persistent, not charged |
| **OS disk** | Persistent disk containing the VM's operating system |
| **Data disk** | Additional persistent disk attached to a VM for application data |
| **Ultra disk** | Highest-performance SSD disk type; cannot be used as OS disk |
| **Premium SSD** | High-performance SSD for production workloads; can be used as OS disk |
| **Pay-as-you-go** | Compute billing model with per-second charges and no commitment |
| **Reserved VM Instance (RI)** | 1 or 3-year commitment for up to 72% compute cost savings |
| **Azure Hybrid Benefit** | Cost-saving feature reusing existing on-premises Windows/SQL Server licences on Azure VMs |
| **Azure Compute Gallery** | Service for managing and distributing custom VM images across regions |
| **Deallocate** | Releasing VM compute resources; stops compute billing; storage billing continues |

---

## 📝 Exam Tips

- Know the **6 VM families**: General, Compute-optimised, Memory-optimised, Storage-optimised, GPU, HPC
- **Temporary disk = ephemeral** — not persistent, not charged
- **Ultra and Premium SSD v2 = cannot be OS disks**
- **Reserved Instances = up to 72% discount** for 1 or 3-year commitments
- **Deallocating stops compute charges; storage charges continue**
- VM name: **Linux = 64 chars, Windows = 15 chars**
- **Azure reserves 5 IPs per subnet** (first 4 + last 1)

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
