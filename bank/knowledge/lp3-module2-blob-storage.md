# LP3 – Module 2: Configure Azure Blob Storage

**Learning Path:** AZ-104 Implement and Manage Storage in Azure  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~75 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/configure-blob-storage/

---

## 📋 Module Overview

Azure Blob Storage is Microsoft's object storage solution for unstructured data. This module covers blob types, access tiers, lifecycle management policies, object replication, and pricing considerations.

---

## 🎯 Learning Objectives

- Understand the purpose and benefits of Azure Blob Storage
- Create and configure Azure Blob Storage accounts
- Manage containers and blobs
- Implement lifecycle management policies
- Determine pricing plans for Blob Storage

---

## 📖 Key Concepts & Detailed Notes

### 1. Blob Storage Overview

Azure Blob Storage stores **unstructured data** as binary large objects (blobs) within **containers** in a storage account.

**Hierarchy:**
```
Storage Account
  └── Container (like a directory/bucket)
        └── Blob (individual file/object)
```

**Three blob types:**

| Type | Description | Use Cases |
|---|---|---|
| **Block blob** | Made of blocks; optimised for sequential reads; up to ~190 TiB | Documents, images, videos, backups, log files |
| **Append blob** | Like block blob but optimised for append operations only | Logging operations (e.g., VM logs written continuously) |
| **Page blob** | Made of 512-byte pages; optimised for random read/write | Azure VM OS and data disks, databases |

---

### 2. Blob Access Tiers

Azure Blob Storage offers **four access tiers** to balance cost vs. access speed:

| Tier | Optimised For | Min Storage Duration | Latency | Availability | Cost Profile |
|---|---|---|---|---|---|
| **Hot** | Frequent reads and writes | None | Milliseconds | 99.9% | Highest storage cost, lowest access cost |
| **Cool** | Infrequent access, stored ≥30 days | 30 days | Milliseconds | 99% | Lower storage cost, higher access cost than Hot |
| **Cold** | Infrequent access, stored ≥90 days | 90 days | Milliseconds | 99% | Lower storage cost than Cool |
| **Archive** | Rarely accessed, tolerates hours of retrieval delay | 180 days | Hours | 99% | Lowest storage cost, highest access cost; offline tier |

> ⚠️ **Early deletion charges apply** if data is removed before the minimum storage duration (30/90/180 days).

> ⚠️ **Archive tier is offline** — data must be **rehydrated** before it can be accessed.

#### Rehydrating from Archive
When data in the Archive tier needs to be accessed, it must first be rehydrated (moved) to an online tier:
- **Copy Blob** (recommended) — creates a new blob in an online tier (Hot, Cool, or Cold)
- **Set Blob Tier** — changes the tier in place
- **Priority options:**
  - **Standard priority** — up to 15 hours
  - **High priority** — within 1 hour for blobs under 10 GB (higher cost)

> 💡 Use **High priority rehydration** for urgent disaster recovery scenarios.

#### Setting Tiers
- Tiers can be set at the **account level** (default tier for new blobs) or at the **individual blob level**
- Blobs can be moved to a **cooler** tier at any time (no charge other than early deletion if applicable)
- Moving a blob to a **warmer** tier may incur a rehydration fee

---

### 3. Blob Lifecycle Management

Lifecycle management allows you to **automatically transition blobs** between tiers or **delete them** based on rules you define — reducing manual effort and optimising costs as data ages.

**Supported accounts:** GPv2 accounts and Premium block blob accounts

#### How Lifecycle Rules Work (If-Then Logic)

```
IF (blob was last modified/accessed N days ago)
THEN (transition to cool / cold / archive / delete)
```

**Available transitions:**
- Hot → Cool
- Hot → Cold
- Hot → Archive
- Cool → Cold
- Cool → Archive
- Cold → Archive
- Any tier → Delete

#### Example Business Scenario:
- Week 1–2: Data frequently accessed → **Hot** tier
- Week 3–4: Data occasionally accessed → **Cool** tier
- Month 2+: Data rarely accessed → **Archive** tier

Create a lifecycle policy with two rules:
1. IF `last modified > 14 days` THEN move to Cool
2. IF `last modified > 30 days` THEN move to Archive

**Filtering options for rules:**
- Apply to an entire storage account
- Apply to specific containers
- Apply to blobs matching a **name prefix**
- Apply to blobs with specific **blob index tags**

> 💡 Lifecycle policies can also automatically transition blobs from **Cool back to Hot** when accessed, optimising for unpredictable access patterns.

---

### 4. Blob Object Replication

**Blob object replication** asynchronously copies blobs between a **source** and **destination** storage account based on a replication policy.

**What is replicated:** Blob content, metadata, blob versions

**Requirements:**
- **Blob versioning must be enabled** on both source and destination accounts
- Source and destination can be in different regions, different tiers (Hot, Cool, Cold)

**Limitations:**
- Blob **snapshots** are NOT replicated
- Replication is **asynchronous** — there is some lag between source write and destination copy
- Source and destination cannot be in Archive tier during replication

**Use cases:**
- **Latency reduction** — replicate to a region closer to read clients
- **Compute efficiency** — process the same dataset in multiple regions
- **Data distribution** — process in one location, replicate results to others
- **Cost optimisation** — after replication, archive the source blobs with lifecycle management

---

### 5. Blob Storage Pricing

Pricing is based on:
1. **Storage volume** — amount of data stored per GB per month (lower for cooler tiers)
2. **Access operations** — read, write, delete, list operations (more expensive for cooler tiers)
3. **Data retrieval** — additional cost per GB retrieved from Cool, Cold, Archive
4. **Early deletion** — charge for removing data before minimum duration

**General rule:** Cooler tiers cost less to store but more to access. Choose based on how often data is accessed.

---

## 🧪 Scenario-Based Examples

### Scenario 1: Choosing the Right Blob Type (Beginner)
**Situation:** A developer needs to store continuously written VM diagnostic logs.  
**Solution:** Use **Append blobs** — optimised for append-only operations; ideal for log streaming.  
**Key concept:** Append blob use case.

### Scenario 2: Selecting Blob Access Tier (Beginner)
**Situation:** Contoso stores CCTV footage. Footage is actively reviewed for the first week, then rarely accessed, but must be retained for 2 years for legal compliance.  
**Solution:** Start in **Hot** tier for week 1, then use lifecycle management to move to **Cool** at day 7, then **Archive** at day 30 (minimum cost for long-term legal retention).  
**Key concept:** Lifecycle management, access tier selection.

### Scenario 3: Archive Rehydration for DR (Intermediate)
**Situation:** During an incident, a team needs archived backup data urgently — within 30 minutes.  
**Question:** What rehydration priority should be used and what method?  
**Answer:** **High priority** rehydration (within 1 hour for <10 GB blobs). Use **Copy Blob** to create a copy in Hot tier while preserving the archived original.  
**Key concept:** High priority rehydration, Copy Blob method.

### Scenario 4: Early Deletion Charge (Intermediate)
**Situation:** A developer stores a blob in the Cool tier and deletes it after 10 days.  
**Question:** Is there a charge?  
**Answer:** Yes — the **minimum storage duration for Cool is 30 days**. The developer is charged for the remaining 20 days of the minimum period.  
**Key concept:** Early deletion penalty for Cool (30 days), Cold (90 days), Archive (180 days).

### Scenario 5: Object Replication for Global Reads (Intermediate)
**Situation:** Contoso has blob data in East US that European users also need to read frequently, experiencing high latency.  
**Solution:** Configure **blob object replication** with East US as source and West Europe as destination. European users read from the closer West Europe replica.  
**Requirements to configure:** Enable **blob versioning** on both accounts.  
**Key concept:** Object replication, latency reduction, versioning requirement.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** The three blob types are: **block blob, append blob, page blob**.

> 🎯 **[TESTABLE – Beginner]** **Append blobs** are optimised for write-only append operations — ideal for logging.

> 🎯 **[TESTABLE – Beginner]** **Page blobs** are used for **Azure VM OS and data disks**.

> 🎯 **[TESTABLE – Beginner]** **Archive tier** is offline — data must be **rehydrated** before access; retrieval can take **up to 15 hours** (standard priority).

> 🎯 **[TESTABLE – Intermediate]** The minimum storage durations are: Cool = **30 days**, Cold = **90 days**, Archive = **180 days**.

> 🎯 **[TESTABLE – Intermediate]** **Blob object replication requires Blob versioning** to be enabled on both source and destination accounts.

> 🎯 **[TESTABLE – Intermediate]** **High priority rehydration** from Archive retrieves blobs under 10 GB within **1 hour** (at higher cost).

> 🎯 **[TESTABLE – Intermediate]** Blob lifecycle rules use **If-Then logic**: IF (days since last modified/accessed) THEN (transition or delete).

> 🎯 **[TESTABLE – Intermediate]** **Blob snapshots are NOT replicated** in blob object replication.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Blob** | A binary large object — a file stored in Azure Blob Storage |
| **Container** | A grouping of blobs within a storage account (like a directory) |
| **Block blob** | Blob type made of blocks; optimised for sequential data (documents, videos, backups) |
| **Append blob** | Blob type optimised for append-only writes (logging) |
| **Page blob** | Blob type made of 512-byte pages; used for VM disks and databases |
| **Access tier** | Storage tier classification (Hot, Cool, Cold, Archive) balancing cost vs. access performance |
| **Rehydration** | Moving data from the offline Archive tier to an online tier (Hot, Cool, Cold) |
| **Lifecycle management** | Automated rules to transition or delete blobs based on age or access patterns |
| **Object replication** | Asynchronous copying of blobs between storage accounts based on policy rules |
| **Blob versioning** | Feature that maintains previous versions of a blob; required for object replication |
| **Early deletion charge** | Penalty for removing data before the minimum storage duration of a tier |

---

## 📝 Exam Tips

- Know the **4 tiers**: Hot, Cool, Cold, Archive and their minimum durations (none, 30, 90, 180 days)
- **Archive = offline** — must rehydrate first (up to 15 hours standard, ~1 hour high priority)
- **Object replication requires versioning** on both accounts — frequently tested
- **Append blobs for logging; Page blobs for VM disks; Block blobs for everything else**
- **Lifecycle rules = If-Then logic** on days since last modified or last accessed
- **Snapshots are NOT replicated** in object replication

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
