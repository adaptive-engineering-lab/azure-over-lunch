# LP3 – Module 1: Configure Storage Accounts

**Learning Path:** AZ-104 Implement and Manage Storage in Azure  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~75 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/configure-storage-accounts/

---

## 📋 Module Overview

Azure Storage is Microsoft's cloud storage solution for modern data storage scenarios. This module covers the types of Azure Storage, storage account types (Standard vs. Premium), replication strategies, access methods, and how to secure storage endpoints.

---

## 🎯 Learning Objectives

- Identify features and usage cases for Azure storage accounts
- Select between different types of Azure Storage and create storage accounts
- Select a storage replication strategy
- Configure secure network access to storage endpoints

---

## 📖 Key Concepts & Detailed Notes

### 1. What is Azure Storage?

Azure Storage is a massively scalable, durable, and highly available cloud storage service supporting:
- Object storage (Blob)
- File system service (Azure Files)
- Messaging (Queue Storage)
- NoSQL (Table Storage)
- Virtual machine disks (Managed Disks)

**Three categories of data stored in Azure Storage:**

| Category | Description | Storage Services |
|---|---|---|
| **Virtual machine data** | Disks and files for Azure VMs | Azure Managed Disks, Azure Files |
| **Unstructured data** | Non-relational, schema-less data | Azure Blob Storage, Azure Data Lake Storage |
| **Structured data** | Relational format with schema | Azure Table Storage, Azure Cosmos DB, Azure SQL Database |

#### Azure Storage Services Overview

| Service | Description | Use Cases |
|---|---|---|
| **Blob Storage** | Object storage for unstructured data | Images, videos, backups, logs, big data |
| **Azure Files** | Fully managed cloud file shares (SMB/NFS) | Shared file access for apps and users |
| **Queue Storage** | Messaging store for reliable async messaging | Decoupling application components |
| **Table Storage** | NoSQL key-value store | Semi-structured data, simple datasets |
| **Azure Data Lake Storage** | HDFS-compatible scalable storage | Big data analytics workloads |

---

### 2. Core Features of Azure Storage

| Feature | Description |
|---|---|
| **Durability and availability** | Redundancy options protect against hardware failures; geo-replication for regional outages |
| **Secure access** | All data encrypted at rest; fine-grained access control |
| **Massive scalability** | Scales to petabytes; designed for modern application demands |
| **Managed service** | Microsoft handles hardware maintenance, updates, and critical issues |
| **Global accessibility** | Data accessible worldwide over HTTP/HTTPS; SDKs for .NET, Java, Python, Node.js, PHP, Ruby, Go |
| **SFTP support** | Blob Storage supports SFTP (requires hierarchical namespace enabled) |
| **NFSv3 protocol** | Blob Storage accessible via NFSv3 for Linux clients (simplifies Linux file workload migrations) |
| **Entra ID default auth** | Portal can default to Microsoft Entra ID (RBAC) instead of shared access keys for improved security |

---

### 3. Storage Account Types

All storage account types are encrypted using **Storage Service Encryption (SSE)** for data at rest.

| Account Type | Supported Services | Redundancy Options | Recommended Use |
|---|---|---|---|
| **Standard general-purpose v2 (GPv2)** | Blob, Queue, Table, Azure Files, Data Lake | LRS, GRS, RA-GRS, ZRS, GZRS, RA-GZRS | Default choice for most scenarios |
| **Premium block blobs** | Blob Storage (incl. Data Lake) | LRS, ZRS | High transaction rates, small objects, low-latency blobs |
| **Premium file shares** | Azure Files only | LRS, ZRS | Enterprise/high-performance file shares; supports SMB and NFS |
| **Premium page blobs** | Page blobs only | LRS only | OS disks, data disks, index-based data structures for VMs |

**Standard vs. Premium:**

| | Standard | Premium |
|---|---|---|
| **Backing storage** | Magnetic HDD | Solid-state drive (SSD) |
| **Cost** | Lowest cost per GB | Higher cost |
| **Performance** | Good for bulk/infrequent access | Consistent low-latency, high IOPS |
| **Use case** | General purpose, archives, backups | Databases, I/O-intensive applications |

> ⚠️ You **cannot convert** a Standard account to Premium or vice versa. You must create a new account and migrate data.

> 💡 Legacy account types (GPv1, BlobStorage) still exist in older subscriptions. Microsoft recommends upgrading to GPv2 in-place via portal, CLI, or PowerShell.

---

### 4. Storage Replication Strategies

Azure Storage always replicates data for durability and high availability. Choose your replication strategy based on cost, performance, and resilience requirements.

#### Locally Redundant Storage (LRS)
- **Copies:** 3 copies within a single datacenter
- **Protects against:** Single server/rack failures
- **Does NOT protect against:** Datacenter-level disasters (fire, flooding)
- **Cost:** Lowest
- **Durability:** 11 nines (99.999999999%)
- **Use when:** Data can be reconstructed if lost; data governance limits replication to a single location

#### Zone Redundant Storage (ZRS)
- **Copies:** 3 copies synchronously across 3 availability zones in the same region
- **Protects against:** Zone-level (datacenter) failures
- **Does NOT protect against:** Regional-wide disasters
- **Availability:** Data remains accessible if one zone goes offline
- **Note:** Not available in all regions; migrating to ZRS requires physical data movement

#### Geo-Redundant Storage (GRS)
- **Copies:** 6 copies total — 3 in primary region (via LRS), 3 in secondary region (asynchronous)
- **Protects against:** Regional outages and disasters
- **Durability:** 16 nines (99.9999999999999 9%)
- **Secondary region:** Data readable only if Microsoft initiates failover
- **Secondary storage:** Uses LRS within the secondary region

#### Read-Access Geo-Redundant Storage (RA-GRS)
- Same as GRS but secondary region data is **always readable** (no failover needed)
- Use when applications must be able to read from the secondary during a primary region outage

#### Geo-Zone Redundant Storage (GZRS)
- Combines ZRS in the primary region (3 zones) + GRS replication to a secondary region
- **Durability:** 16 nines
- Best of both: zone redundancy + geo-redundancy
- Microsoft's recommended option for maximum resilience

#### Read-Access Geo-Zone Redundant Storage (RA-GZRS)
- Same as GZRS + read access to secondary region
- Highest availability option

#### Replication Comparison Table

| Replication | Copies | Node failure | Datacenter failure | Regional failure | Read access in secondary |
|---|---|---|---|---|---|
| **LRS** | 3 (1 datacenter) | ✅ | ❌ | ❌ | ❌ |
| **ZRS** | 3 (3 zones) | ✅ | ✅ | ❌ | ❌ |
| **GRS** | 6 (2 regions) | ✅ | ✅ | ✅ | ❌ (failover only) |
| **RA-GRS** | 6 (2 regions) | ✅ | ✅ | ✅ | ✅ |
| **GZRS** | 6 (zones + geo) | ✅ | ✅ | ✅ | ❌ (failover only) |
| **RA-GZRS** | 6 (zones + geo) | ✅ | ✅ | ✅ | ✅ |

> 💡 Microsoft recommends **GZRS** for applications requiring maximum durability, consistency, and disaster recovery resilience. Enable **RA-GZRS** if read access to secondary is needed during regional outages.

---

### 5. Accessing Azure Storage

Azure Storage accounts have unique endpoints for each service:

| Service | Endpoint format |
|---|---|
| Blob Storage | `https://<accountname>.blob.core.windows.net` |
| Azure Files | `https://<accountname>.file.core.windows.net` |
| Queue Storage | `https://<accountname>.queue.core.windows.net` |
| Table Storage | `https://<accountname>.table.core.windows.net` |

**Custom domain names** can be mapped to storage endpoints.

---

### 6. Securing Storage Endpoints

By default, Azure Storage accepts connections from all networks. You can restrict access using:

- **Firewall rules** — Allow access only from specific IP addresses or IP ranges
- **Virtual network service endpoints** — Allow access only from specific Azure virtual networks and subnets
- **Private endpoints** — Assign a private IP address from your VNet to the storage account, routing traffic over a private link (not the public internet)
- **Default Entra ID authorization** — In the portal, make RBAC (not access keys) the default for storage operations

> 🔒 **Best practice:** Enable the storage firewall and add only required network exceptions. Use private endpoints for maximum network isolation.

---

## 🧪 Scenario-Based Examples

### Scenario 1: Choosing a Replication Strategy (Beginner)
**Situation:** Contoso needs to store financial archive data. Data loss is unacceptable, and they need protection against regional disasters. The secondary region does not need to be readable during normal operations.  
**Solution:** **GRS** — 16 nines durability, geo-redundant protection, secondary available only on failover. If read access during regional outage was also required, use **RA-GRS**.  
**Key concept:** GRS vs. RA-GRS.

### Scenario 2: Cost-Optimised Replication (Beginner)
**Situation:** A startup stores temporary image processing outputs that can be regenerated if lost. They need the cheapest storage option.  
**Solution:** **LRS** — lowest cost, acceptable for easily-reconstructable data. No need for zone or geo-redundancy.  
**Key concept:** LRS for low-cost, easily-reconstructable data.

### Scenario 3: Premium Storage for Database Disks (Intermediate)
**Situation:** Contoso runs a high-transaction SQL Server on an Azure VM and experiences slow disk I/O.  
**Solution:** Migrate the VM's data disks to **Premium page blob storage** (backed by SSD). This provides consistent low-latency, high-IOPS performance suitable for database workloads.  
**Key concept:** Premium page blobs for VM disks, SSD backing.

### Scenario 4: Upgrading Legacy Storage Account (Intermediate)
**Situation:** An administrator finds a GPv1 storage account in a subscription. The team wants to use Data Lake Storage Gen2 (hierarchical namespace).  
**Solution:** Upgrade the GPv1 account to **Standard GPv2** in-place. Only GPv2 accounts support all current Azure Storage features including Data Lake Storage.  
**Key concept:** GPv2 as the recommended standard account type; in-place upgrade from GPv1.

### Scenario 5: Securing Storage with VNet Rules (Intermediate)
**Situation:** Contoso's storage account holds sensitive HR data. It should only be accessible from the HR department's Azure VNet subnet.  
**Solution:** Configure the storage account's **firewall** to deny all public internet access, and add a **VNet service endpoint rule** allowing only the HR subnet.  
**Key concept:** Storage firewall, VNet service endpoints.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** All Azure Storage data is encrypted at rest using **Storage Service Encryption (SSE)**.

> 🎯 **[TESTABLE – Beginner]** **Standard GPv2** is the recommended account type for most scenarios, supporting Blob, Files, Queue, and Table Storage.

> 🎯 **[TESTABLE – Beginner]** You **cannot convert** a Standard storage account to Premium — a new account must be created.

> 🎯 **[TESTABLE – Beginner]** **LRS** stores 3 copies in a single datacenter — cheapest but no protection against datacenter failures.

> 🎯 **[TESTABLE – Intermediate]** **GRS** provides **16 nines** (99.9999999999999 9%) durability with geo-replication.

> 🎯 **[TESTABLE – Intermediate]** **RA-GRS** vs. **GRS** — RA-GRS allows reading from the secondary region **without** a failover event.

> 🎯 **[TESTABLE – Intermediate]** **GZRS** combines **ZRS** (zone redundancy in primary) + **GRS** (geo-redundancy) — Microsoft's recommended option for maximum resilience.

> 🎯 **[TESTABLE – Intermediate]** **Premium page blobs** only support **LRS** redundancy.

> 🎯 **[TESTABLE – Intermediate]** **SFTP access** to Blob Storage requires **hierarchical namespace (HNS)** to be enabled.

> 🎯 **[TESTABLE – Intermediate]** **Private endpoints** assign a private IP to the storage account, routing traffic over Azure Private Link (not the public internet).

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Azure Storage account** | A unique namespace in Azure for all storage data objects |
| **Standard GPv2** | General-purpose v2 storage account — recommended for most scenarios |
| **LRS** | Locally Redundant Storage — 3 copies in one datacenter |
| **ZRS** | Zone Redundant Storage — 3 copies across 3 availability zones in one region |
| **GRS** | Geo-Redundant Storage — 6 copies across 2 regions; secondary readable only on failover |
| **RA-GRS** | Read-Access GRS — secondary region always readable |
| **GZRS** | Geo-Zone Redundant Storage — ZRS + geo-replication |
| **RA-GZRS** | Read-Access GZRS — always readable secondary + zone redundancy |
| **SSE** | Storage Service Encryption — encryption at rest for all Azure Storage data |
| **Blob Storage** | Object storage for unstructured data |
| **Azure Files** | Managed cloud file shares accessible via SMB/NFS |
| **Private endpoint** | Private IP assigned to storage account for VNet-only access over Private Link |
| **SFTP** | SSH File Transfer Protocol — supported by Blob Storage with HNS enabled |
| **HNS** | Hierarchical Namespace — required for Data Lake Storage Gen2 and SFTP on Blob |

---

## 📝 Exam Tips

- Know the **6 replication types** and what each protects against
- **LRS = 1 datacenter; ZRS = 3 zones; GRS/RA-GRS = 2 regions; GZRS/RA-GZRS = zones + geo**
- **Premium page blobs = LRS only** (no ZRS, GRS)
- **Cannot convert Standard ↔ Premium** — must create new and migrate
- **GZRS** = Microsoft's recommended maximum resilience option
- **RA-** prefix means secondary region is readable without failover
- **SFTP on Blob** requires hierarchical namespace (HNS) enabled
- **All Azure Storage is encrypted at rest (SSE)** — always enabled by default

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
