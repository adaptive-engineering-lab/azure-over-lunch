# LP6 – Module 1: Introduction to Azure Backup

**Learning Path:** AZ-104 Monitor and Back Up Azure Resources  
**Difficulty:** 🟢 Beginner  
**Estimated Study Time:** ~40 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/intro-to-azure-backup/

---

## 📋 Module Overview

Azure Backup is a built-in, zero-infrastructure Azure service providing secure, cost-effective backup for Azure and on-premises workloads. This module covers what Azure Backup is, how it works, and when to use it.

---

## 🎯 Learning Objectives

- Evaluate whether Azure Backup is appropriate for your backup needs
- Describe how Azure Backup features provide backup solutions

---

## 📖 Key Concepts & Detailed Notes

### 1. What is Azure Backup?

**Azure Backup** is a **zero-infrastructure, cloud-native backup service** that provides secure backup for a wide range of Azure and on-premises data assets. It replaces traditional tape/disk backup solutions with a managed, scalable cloud-based approach.

**Key features:**

| Feature | Description |
|---|---|
| **Zero infrastructure** | No backup servers or storage to deploy/manage — Azure Backup auto-manages and scales storage |
| **At-scale management** | Centralised management via **Backup Center** — discover, govern, monitor, and optimise all backups from one console |
| **Built-in security** | Encryption in transit and at rest; soft delete (14-day retention after deletion); RBAC; private endpoints |
| **Long-term retention** | Retain backups for years; automatic lifecycle management prunes old recovery points |
| **No internet required for Azure VMs** | VM backup data transfers happen on the Azure backbone only — no public internet access needed |
| **RBAC for backups** | Segregate backup admin duties using Azure role-based access control |

---

### 2. Supported Workloads

Azure Backup supports backup for:
- **Azure Virtual Machines** (Windows and Linux)
- **Azure Managed Disks**
- **Azure Files shares**
- **SQL Server in Azure VMs**
- **SAP HANA databases in Azure VMs**
- **Azure Database for PostgreSQL** (standard and flexible server)
- **Azure Database for MySQL** (flexible server)
- **Azure Blobs**
- **Azure Kubernetes clusters**
- **On-premises files, folders, and system state** (via MARS agent)
- **On-premises VMs** (Hyper-V, VMware — via MABS or DPM)

---

### 3. RPO and RTO

| Term | Definition | Example |
|---|---|---|
| **RPO (Recovery Point Objective)** | Maximum acceptable data loss measured in time | RPO = 1 hour → backups run every hour; max 1 hour of data can be lost |
| **RTO (Recovery Time Objective)** | Maximum acceptable time to restore service after a disaster | RTO = 3 hours → must restore the system within 3 hours |

**Designing backup frequency** is driven by RPO — the shorter the RPO, the more frequent the backups.

---

### 4. Azure Backup vs. Azure Site Recovery

| | Azure Backup | Azure Site Recovery |
|---|---|---|
| **Primary goal** | Protect data copies — go back in time | Continuous replication — rapid failover |
| **Use case** | Accidental deletion, corruption, ransomware | Region-wide disasters, planned failovers |
| **Data freshness** | Point-in-time copies (scheduled) | Near-real-time replication |
| **Recovery type** | Restore specific items or entire workloads | Failover to secondary region |

---

### 5. Recovery Services Vault

**Recovery Services vault** is the Azure storage entity that stores backup data and recovery points.

**Key facts:**
- Must be in the **same region** as the resources it backs up
- Supports **geo-redundant storage (GRS)** for backup data — recommended for cross-region disaster recovery
- Also supports **locally redundant storage (LRS)** — for lower cost when geo-redundancy is not needed
- One vault can back up resources from multiple subscriptions

**Soft delete:**
- When a backup item is deleted, data is retained for **14 additional days** in a soft-deleted state
- Can be recovered during this window — protects against accidental or malicious deletion
- **Enhanced soft delete** allows configuring a longer retention period

---

### 6. Backup Policies

A **backup policy** defines:
- **What** to back up (workload type)
- **When** to back up (schedule: daily, weekly)
- **How long** to retain recovery points (retention rules)

---

## ✅ Testable Points (Azure Backup Intro)

> 🎯 **[TESTABLE – Beginner]** Azure Backup requires **zero infrastructure** — no backup servers to deploy or manage.

> 🎯 **[TESTABLE – Beginner]** **Backup Center** provides centralised management for all Azure Backup workloads.

> 🎯 **[TESTABLE – Beginner]** **RPO** = maximum acceptable data loss (time); **RTO** = maximum acceptable recovery time.

> 🎯 **[TESTABLE – Intermediate]** **Soft delete** retains deleted backup data for **14 additional days** before permanent deletion.

> 🎯 **[TESTABLE – Intermediate]** Azure Backup for Azure VMs transfers data over the **Azure backbone** — no internet connectivity required.

> 🎯 **[TESTABLE – Intermediate]** **Azure Backup** protects against data loss/corruption; **Azure Site Recovery** protects against regional disasters via replication.

---

---

# LP6 – Module 2: Protect Virtual Machines Using Azure Backup

**Difficulty:** 🟢 Beginner  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/protect-virtual-machines-with-azure-backup/

---

## 📖 Key Concepts & Detailed Notes

### 1. Azure Backup for Virtual Machines

Azure Backup provides **application-consistent backups** for Azure VMs using snapshots.

**How VM backup works:**
1. Azure Backup triggers a snapshot of the VM's disks
2. The snapshot is transferred to the Recovery Services vault
3. Recovery points are retained based on the backup policy

**Application-consistent backup:**
- For Windows VMs: Uses **VSS (Volume Shadow Copy Service)** to ensure applications are in a consistent state
- For Linux VMs: Uses **pre/post scripts** to quiesce the application before snapshot

**Backup replication options for vault:**
- **GRS (Geo-redundant)** — Default; replicates backup to secondary region; recommended
- **LRS (Locally redundant)** — Lower cost; data stays in one region
- **ZRS (Zone-redundant)** — Replicates across availability zones in the primary region

---

### 2. VM Backup Benefits

| Benefit | Description |
|---|---|
| **Independent and isolated** | Backups are isolated from the VM — protects against VM deletion |
| **Built-in management** | No backup infrastructure needed |
| **Multiple restore options** | Full VM restore, disk restore, or file-level restore |
| **Encrypted backups** | Supports VMs encrypted with Azure Disk Encryption |
| **Point-in-time recovery** | Restore VM to any recovery point in history |

---

### 3. Restore Options for Azure VMs

| Restore Option | Description | Use Case |
|---|---|---|
| **Create new VM** | Restore to a completely new VM | Full VM recovery |
| **Restore disk** | Restore a managed disk and attach to an existing/new VM | Custom recovery with configuration changes |
| **Replace existing disk** | Replace a disk in the existing VM | In-place disk recovery |
| **File recovery** | Mount recovery point as a disk and browse/restore individual files | Recover specific files without full VM restore |
| **Cross-region restore** | Restore VM to secondary paired region (GRS required) | Disaster recovery |

---

### 4. MARS Agent for On-Premises Backup

**MARS (Microsoft Azure Recovery Services) agent** enables backup of on-premises Windows machines:
- Backs up files, folders, and Windows System State
- No VM or server required — runs on the Windows machine directly
- Backed up to a Recovery Services vault in Azure
- Supports up to **3 backups per day**

---

## ✅ Testable Points (VM Backup)

> 🎯 **[TESTABLE – Beginner]** Azure VM backup uses **snapshots** — application-consistent via VSS (Windows) or pre/post scripts (Linux).

> 🎯 **[TESTABLE – Intermediate]** Recovery options include: **Create new VM, Restore disk, Replace existing disk, File recovery, Cross-region restore**.

> 🎯 **[TESTABLE – Intermediate]** **Cross-region restore** requires **GRS** replication on the Recovery Services vault.

> 🎯 **[TESTABLE – Intermediate]** **MARS agent** backs up on-premises Windows files/folders/System State to a Recovery Services vault.

---

---

# LP6 – Module 3: Monitor Azure Virtual Machines with Azure Monitor

**Learning Path:** AZ-104 Monitor and Back Up Azure Resources  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~60 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/monitor-azure-vm-using-diagnostic-data/

---

## 📋 Module Overview

Azure Monitor is the unified monitoring platform for Azure. This module covers monitoring VM host metrics, enabling VM Insights, collecting client-side performance counters and event logs, and configuring alerts.

---

## 🎯 Learning Objectives

- Understand which monitoring data to collect from VMs
- Enable and view recommended alerts and diagnostics
- Use Azure Monitor to collect and analyse VM host metrics
- Use Azure Monitor Agent to collect VM client performance metrics and event logs

---

## 📖 Key Concepts & Detailed Notes

### 1. Azure Monitor Overview

**Azure Monitor** is the full-stack monitoring service for Azure, collecting and analysing data from:
- **Azure resources** (host metrics, activity logs)
- **Applications** (Application Insights)
- **Operating systems** (Azure Monitor Agent, Log Analytics)
- **On-premises infrastructure** (Azure Monitor Agent, Log Analytics)

**Two primary data types:**

| Data Type | Description | Store |
|---|---|---|
| **Metrics** | Numerical time-series data (CPU%, memory, disk IOPS) | Azure Monitor Metrics (90-day retention by default) |
| **Logs** | Text-based records (events, errors, diagnostics) | Log Analytics Workspace (configurable retention) |

---

### 2. VM Host Metrics vs. Client Metrics

| | Host Metrics | Client Metrics |
|---|---|---|
| **Source** | Azure hypervisor (platform) | VM operating system |
| **Collection** | Automatic — no agent needed | Requires **Azure Monitor Agent (AMA)** |
| **Examples** | CPU% (host), network in/out, disk read/write | Memory usage, disk queue length, event logs |
| **Availability** | Available immediately after VM creation | Enabled via VM Insights or Data Collection Rules |

**Why both matter:**
- Host metrics tell you the Azure platform's view of the VM
- Client metrics provide OS-level detail (e.g., memory pressure, application event logs)

---

### 3. Azure Monitor Agent (AMA)

The **Azure Monitor Agent** replaces legacy agents (MMA/OMS, Diagnostics extension) and collects:
- Performance counters from the guest OS
- Windows Event Logs and Linux Syslog
- Custom log files

**Configuration:**
- Deployed via **Data Collection Rules (DCRs)** — specifies what data to collect and where to send it
- DCRs can be associated with multiple VMs — centralised configuration
- Sends data to **Log Analytics Workspace** and/or **Azure Monitor Metrics**

---

### 4. VM Insights

**VM Insights** is a curated monitoring experience in Azure Monitor for VMs that provides:
- **Performance charts** — Pre-built charts for CPU, memory, disk, network (requires AMA)
- **Map** — Visual topology of processes and connections running on the VM and to/from other services

**Enabling VM Insights:**
- Deploys the Azure Monitor Agent automatically
- Creates Data Collection Rules for performance counters

---

### 5. Azure Monitor Alerts

**Alerts** notify you or trigger actions when conditions are met.

**Alert components:**

| Component | Description |
|---|---|
| **Alert rule** | Defines the condition and target resource |
| **Condition** | The metric threshold or log query that triggers the alert |
| **Action group** | Who to notify and how (email, SMS, webhook, Azure Function, ITSM) |
| **Severity** | 0 (critical) to 4 (verbose) |

**Alert types:**
- **Metric alerts** — Triggered when a metric exceeds a threshold (e.g., CPU > 90%)
- **Log alerts** — Triggered by a Log Analytics query returning results
- **Activity log alerts** — Triggered by Azure Resource Manager events (e.g., VM deleted, policy assigned)
- **Smart detection alerts** — AI/ML-based anomaly detection (Application Insights)

**Recommended VM alerts (built-in):**
- VM availability (heartbeat lost)
- CPU % > 80% (sustained)
- Available memory < 1 GB
- Disk read/write latency > 30ms
- Network in/out saturation

---

### 6. Log Analytics Workspace

A **Log Analytics Workspace** is a unique environment for collecting, storing, and querying Azure Monitor log data.

**Query language:** **Kusto Query Language (KQL)**

**Example KQL query — find VMs with high CPU:**
```kusto
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| where CounterValue > 90
| summarize avg(CounterValue) by Computer, bin(TimeGenerated, 1h)
| order by avg_CounterValue desc
```

**Retention:** Configurable 30–730 days (default 90 days); archive for up to 7 years

---

## 🧪 Scenario-Based Examples (Monitor)

### Scenario 1: VM CPU Alert (Beginner)
**Situation:** Contoso wants to be alerted when any production VM's CPU stays above 90% for more than 5 minutes.  
**Solution:** Create a **metric alert** on the VM resource targeting `Percentage CPU` metric, condition `> 90%` evaluated over 5 minutes, with an **action group** sending an email to the on-call team.  
**Key concept:** Metric alert, action group.

### Scenario 2: Host vs. Client Memory Metric (Intermediate)
**Situation:** An admin checks Azure Monitor for a VM's memory usage but doesn't see a memory metric.  
**Cause:** **Memory is a client-side metric** — not available as a host metric from the hypervisor. Host metrics only include CPU, network, and disk I/O at the platform level.  
**Solution:** Enable **VM Insights** or deploy the **Azure Monitor Agent** with a Data Collection Rule to collect memory performance counters from the guest OS.  
**Key concept:** Host vs. client metrics; AMA required for guest OS metrics.

### Scenario 3: Log Query for Error Investigation (Intermediate)
**Situation:** Users report application errors on VMs. The team wants to search Windows Event Logs for Error events in the last hour.  
**Solution:** In Log Analytics, run a KQL query:
```kusto
Event
| where EventLevelName == "Error"
| where TimeGenerated > ago(1h)
| project TimeGenerated, Computer, EventID, RenderedDescription
```
**Key concept:** KQL queries in Log Analytics for log-based investigation.

---

## ✅ Testable Points (Azure Monitor)

> 🎯 **[TESTABLE – Beginner]** Azure Monitor collects two data types: **Metrics** (numerical time-series) and **Logs** (text-based records).

> 🎯 **[TESTABLE – Beginner]** **Host metrics** are collected automatically from the Azure hypervisor — no agent needed.

> 🎯 **[TESTABLE – Intermediate]** **Client metrics** (memory, event logs) require the **Azure Monitor Agent (AMA)**.

> 🎯 **[TESTABLE – Intermediate]** **Data Collection Rules (DCRs)** define what data the Azure Monitor Agent collects and where to send it.

> 🎯 **[TESTABLE – Intermediate]** **VM Insights** provides pre-built performance charts and a process map — requires AMA.

> 🎯 **[TESTABLE – Intermediate]** Azure Monitor **metric alerts** trigger when a metric crosses a threshold; **log alerts** trigger on Log Analytics query results.

> 🎯 **[TESTABLE – Intermediate]** **Log Analytics Workspace** uses **KQL (Kusto Query Language)** for querying log data.

> 🎯 **[TESTABLE – Intermediate]** Default Log Analytics Workspace retention is **90 days** (configurable to 730 days; archivable to 7 years).

---

## 🔑 Key Terms — LP6 Summary

| Term | Definition |
|---|---|
| **Azure Backup** | Zero-infrastructure cloud-native backup service for Azure and on-premises workloads |
| **Recovery Services Vault** | Azure storage entity for backup data and recovery points |
| **Backup Center** | Centralised management console for all Azure Backup workloads |
| **Soft delete** | Retains deleted backup data for 14 additional days before permanent deletion |
| **RPO** | Recovery Point Objective — maximum acceptable data loss (time) |
| **RTO** | Recovery Time Objective — maximum acceptable recovery time |
| **MARS agent** | Microsoft Azure Recovery Services agent for on-premises Windows backup |
| **Azure Site Recovery** | Replication service for VM failover to secondary regions (not backup) |
| **Azure Monitor** | Full-stack Azure monitoring service collecting metrics and logs |
| **Metrics** | Numerical time-series data (CPU%, memory, IOPS) — 90-day default retention |
| **Logs** | Text-based event records stored in Log Analytics Workspace |
| **Log Analytics Workspace** | Repository for Azure Monitor log data; queried with KQL |
| **Azure Monitor Agent (AMA)** | Agent for collecting guest OS performance counters and event logs from VMs |
| **Data Collection Rule (DCR)** | Configuration defining what AMA collects and where to send it |
| **VM Insights** | Pre-built Azure Monitor experience with performance charts and process map |
| **Alert rule** | Defines conditions that trigger Azure Monitor notifications |
| **Action group** | Defines how to notify (email, SMS, webhook) when an alert fires |
| **KQL** | Kusto Query Language — used for querying Log Analytics Workspace data |

---

## 📝 Exam Tips — LP6

**Backup:**
- **Zero infrastructure** — no backup servers; Azure manages storage automatically
- **Soft delete = 14 days** of recovery after deletion
- **RPO = data loss tolerance; RTO = recovery time tolerance**
- **GRS** recommended for vault replication (cross-region DR)
- **MARS agent** = on-premises Windows backup; **MABS/DPM** = on-premises VM backup
- **Azure Backup vs. Site Recovery**: Backup = data protection; Site Recovery = disaster recovery replication

**Monitoring:**
- **Host metrics = automatic** (no agent); **client metrics = AMA required**
- **VM Insights requires AMA** — deploys it automatically when enabled
- **Data Collection Rules (DCRs)** configure AMA centrally for multiple VMs
- **Metric alerts** = threshold-based; **Log alerts** = KQL query-based; **Activity log alerts** = ARM events
- **KQL** = Log Analytics query language — know basic syntax (where, project, summarize, order by)
- Log retention **default = 90 days**; configurable up to **730 days**; archivable to **7 years**

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
