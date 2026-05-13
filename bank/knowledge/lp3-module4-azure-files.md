# LP3 – Module 4: Configure Azure Files

**Learning Path:** AZ-104 Implement and Manage Storage in Azure  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~60 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/configure-azure-files-file-sync/

---

## 📋 Module Overview

Azure Files provides fully managed cloud file shares accessible via SMB, NFS, and HTTP protocols. This module covers creating and managing file shares, snapshots, soft delete, Azure File Sync, and when to choose Azure Files over Blob Storage.

---

## 🎯 Learning Objectives

- Identify storage for file shares versus blob data
- Configure Azure file shares and file share snapshots
- Identify features and use cases of Azure File Sync

---

## 📖 Key Concepts & Detailed Notes

### 1. What is Azure Files?

Azure Files is a **PaaS offering** of fully managed cloud file shares — no VMs, operating systems, or patching required.

**Protocol support:**
- **SMB (Server Message Block)** — Windows, Linux, macOS
- **NFS (Network File System)** — Linux, macOS
- **HTTP/REST** — anywhere via browser or REST calls

**Key characteristics:**
- Single Azure file share: up to **100 TiB** of files
- Individual file size: up to **4 TiB**
- Files organised in **hierarchical folder structure** (like a traditional file server)
- Data encrypted **at rest** and **in transit**
- Access controlled via **Microsoft Entra identities** or **AD DS identities** synced to Entra ID
- Clients connect from **anywhere with internet connectivity** (by default)
- Integrates with **Azure Backup** and supports **Previous Versions** (via snapshots) in File Explorer

---

### 2. Azure Files vs. Azure Blob Storage

| Feature | Azure Files | Azure Blob Storage |
|---|---|---|
| **Access protocols** | SMB, NFS, HTTP/REST | HTTP/REST only |
| **Namespace** | True hierarchical directory structure | Flat namespace (containers/blobs) |
| **Object type** | True directory objects and files | Blob objects |
| **Multi-VM access** | Yes — shared access from multiple VMs simultaneously | Accessed per container; not designed for multi-VM concurrent writes |
| **Ideal for** | Lift-and-shift of apps using native file system APIs; shared dev tools | Streaming, random-access, massive unstructured data at scale |
| **Integration** | Existing AD/Entra identity-based access | Entra ID, SAS, access keys, anonymous |

**When to choose Azure Files:**
- Replacing or supplementing on-premises file servers/NAS devices
- Lift-and-shift applications that expect a traditional file share
- Shared development tools accessible from multiple VMs
- Configuration files shared across app instances
- Diagnostics: logs, metrics, crash dumps in a shared location

**When to choose Azure Blob Storage:**
- Massive unstructured data (images, videos, backups)
- Streaming or random-access workloads
- Data that doesn't require file-system semantics

---

### 3. Managing Azure File Shares

Azure file shares are created within a storage account and support:
- **Standard** (HDD-backed, GPv2 account) or **Premium** (SSD-backed, Premium File Shares account)
- **Quota** — maximum size limit for the share
- **Authentication:** SMB with Entra ID or on-premises AD DS credentials

**Mounting an Azure file share (Windows):**
```powershell
net use Z: \\<storageaccount>.file.core.windows.net\<sharename> /user:Azure\<storageaccount> <accountkey>
```

**Mounting on Linux (SMB):**
```bash
sudo mount -t cifs //<storageaccount>.file.core.windows.net/<sharename> /mnt/<mountpoint> \
  -o vers=3.0,username=<storageaccount>,password=<accountkey>,serverino
```

---

### 4. File Share Snapshots

Azure Files supports **share-level snapshots** — point-in-time read-only copies of the entire file share.

**Key facts:**
- Snapshots capture the state of the entire share at a moment in time
- Incremental — only the changes since the last snapshot are stored
- Up to **200 snapshots** per file share
- Accessible via the **Previous Versions** feature in Windows File Explorer
- Can be used to restore individual files or the entire share
- Snapshots are stored within the file share (same storage account)

> 💡 **Scenario:** A user accidentally overwrites an important spreadsheet. With snapshots enabled, the IT team can restore the previous version directly from File Explorer → Previous Versions without any admin intervention.

---

### 5. Soft Delete for Azure Files

**Soft delete** protects file shares from accidental deletion:
- When a file share is deleted, it enters a **soft-deleted state** for a configurable retention period
- Default retention period: **7 days** (configurable from 1 to 365 days)
- Soft-deleted shares can be **restored** during the retention period
- After the retention period, the share is permanently deleted

---

### 6. Azure File Sync

**Azure File Sync** extends Azure Files to on-premises by caching Azure file shares on Windows Servers — transforming them into fast local caches.

**Core capabilities:**
- Cache frequently accessed files locally; less-used files stored only in Azure (cloud tiering)
- Sync the same files across multiple on-premises locations
- Access local data using any protocol available on Windows Server: SMB, NFS, FTPS

#### Five Components of Azure File Sync

| Component | Description |
|---|---|
| **Storage Sync Service** | Primary Azure resource; manages sync. Supports up to **100 sync groups** and up to **99 registered Windows Servers** per service; must be in the same Azure region |
| **Sync group** | Defines the sync relationship. Contains **1 cloud endpoint** + up to **50 server endpoints** |
| **Cloud endpoint** | An Azure file share participating in sync. **Only 1 cloud endpoint per sync group** |
| **Server endpoint** | A specific NTFS path on a registered Windows Server. Cannot be the system volume |
| **Azure File Sync agent** | A background Windows service installed on each Windows Server |

#### Cloud Tiering
- Frequently accessed files are cached locally on the Windows Server
- Infrequently accessed files are stored only in Azure (the cloud)
- When a tiered file is accessed, it's automatically recalled from Azure
- **Cannot be enabled on the system volume**

**Key limits:**
- 100 sync groups per Storage Sync Service
- 50 server endpoints per sync group
- 1 cloud endpoint per sync group
- 99 registered Windows Servers per Storage Sync Service

---

## 🧪 Scenario-Based Examples

### Scenario 1: Replacing On-Premises File Server (Beginner)
**Situation:** Contoso's on-premises file server is end-of-life. Users in the London office share files using UNC paths (\\server\share).  
**Solution:** Create an Azure Files share. Mount it on users' Windows workstations using SMB. Users continue accessing files using the familiar UNC path, now pointing to Azure Files.  
**Key concept:** Azure Files as on-premises file server replacement.

### Scenario 2: Azure Files vs. Blob Storage (Beginner)
**Situation:** A developer needs shared storage for application configuration files that multiple VMs read simultaneously. Another team needs to store 10 TB of log archive files that are rarely accessed.  
**Solution:** Configuration files → **Azure Files** (SMB share, multi-VM concurrent access). Log archive → **Azure Blob Storage** (massive unstructured data, low-cost storage).  
**Key concept:** Azure Files for shared concurrent access; Blob for large unstructured archives.

### Scenario 3: File Share Snapshot for Recovery (Intermediate)
**Situation:** A contractor accidentally deletes a folder of 500 project files from an Azure Files share.  
**Solution:** The IT admin restores the deleted folder from the most recent **file share snapshot** using the Azure portal or Previous Versions in File Explorer. Individual files or the entire share can be restored.  
**Key concept:** File share snapshots, Previous Versions recovery.

### Scenario 4: Branch Office with Azure File Sync (Intermediate)
**Situation:** Contoso has 5 branch offices that need access to the same set of project files. Currently, files are replicated inconsistently across each office's local server.  
**Solution:** Deploy **Azure File Sync** with an Azure file share (cloud endpoint). Each branch office has a Windows Server with the File Sync agent (server endpoints) in the same sync group. All locations stay in sync automatically. Cloud tiering stores the full dataset in Azure; only recently accessed files are cached locally at each office.  
**Key concept:** Azure File Sync, sync groups, cloud tiering for branch offices.

### Scenario 5: File Sync Limits (Intermediate)
**Situation:** A large enterprise needs to sync files with 60 server endpoints (Windows Servers across all offices) using Azure File Sync.  
**Question:** Can this be done in a single sync group?  
**Answer:** No — a sync group supports a maximum of **50 server endpoints**. The enterprise needs at least 2 sync groups (or 2 Storage Sync Service instances).  
**Key concept:** Azure File Sync limits — 50 server endpoints per sync group.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** Azure Files supports **SMB, NFS, and HTTP** protocols.

> 🎯 **[TESTABLE – Beginner]** A single Azure file share can store up to **100 TiB**, with individual files up to **4 TiB**.

> 🎯 **[TESTABLE – Beginner]** Azure Files provides a **hierarchical directory structure**; Azure Blob Storage uses a **flat namespace**.

> 🎯 **[TESTABLE – Intermediate]** File share snapshots are **incremental** and a share supports up to **200 snapshots**.

> 🎯 **[TESTABLE – Intermediate]** Azure **Soft delete** retention for file shares is configurable from **1 to 365 days** (default 7 days).

> 🎯 **[TESTABLE – Intermediate]** Azure File Sync **Storage Sync Service** supports up to **100 sync groups** and **99 registered Windows Servers**.

> 🎯 **[TESTABLE – Intermediate]** A sync group contains exactly **1 cloud endpoint** and up to **50 server endpoints**.

> 🎯 **[TESTABLE – Intermediate]** Azure File Sync **server endpoint** cannot be the **system volume**.

> 🎯 **[TESTABLE – Intermediate]** **Cloud tiering** in Azure File Sync stores only frequently accessed files locally; less-used files are stored only in Azure and recalled on demand.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Azure Files** | Fully managed cloud file shares accessible via SMB, NFS, HTTP |
| **SMB (Server Message Block)** | Protocol for Windows, Linux, macOS file share access |
| **NFS (Network File System)** | Protocol for Linux/macOS file share access |
| **File share snapshot** | Point-in-time, incremental, read-only copy of an Azure file share |
| **Soft delete** | Protection against accidental file share deletion; shares are recoverable during retention period |
| **Azure File Sync** | Service that caches Azure file shares on Windows Servers for local performance with cloud-backed storage |
| **Storage Sync Service** | Primary Azure resource for Azure File Sync management |
| **Sync group** | Defines the sync relationship between a cloud endpoint and server endpoints |
| **Cloud endpoint** | An Azure file share participating in a sync group (1 per sync group) |
| **Server endpoint** | An NTFS path on a registered Windows Server in a sync group (up to 50 per sync group) |
| **Cloud tiering** | Feature that keeps frequently accessed files local; rarely accessed files stored only in Azure |
| **Previous Versions** | Windows File Explorer feature that exposes file share snapshots for self-service file recovery |

---

## 📝 Exam Tips

- **Azure Files = SMB/NFS, hierarchical, multi-VM access; Blob = flat, REST, massive unstructured**
- **100 TiB per share, 4 TiB per file** — key size limits
- Snapshots: up to **200 per share**, **incremental**, support **Previous Versions** in File Explorer
- Soft delete: default **7 days**, configurable **1–365 days**
- File Sync limits: **100 sync groups, 50 server endpoints, 1 cloud endpoint** per sync group; **99 servers** per Storage Sync Service
- **Cloud tiering = only hot data cached locally**, rest recalled from Azure on demand
- **Server endpoint cannot be the system volume** (C:)

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
