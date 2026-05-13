# LP2 – Module 3: Describe Core Architectural Components of Azure

**Learning Path:** AZ-104 Manage Identities and Governance in Azure  
**Difficulty:** 🟢 Beginner  
**Estimated Study Time:** ~45 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/describe-core-architectural-components-of-azure/

---

## 📋 Module Overview

This module covers the foundational physical and logical infrastructure of Microsoft Azure — including datacentres, regions, availability zones, and the management hierarchy (resources, resource groups, subscriptions, management groups).

---

## 🎯 Learning Objectives

- Describe Azure regions, region pairs, and sovereign regions
- Describe Azure availability zones
- Describe Azure datacentres
- Describe Azure resources, resource groups, subscriptions, and management groups
- Describe the hierarchy of resource groups, subscriptions, and management groups

---

## 📖 Key Concepts & Detailed Notes

### 1. Azure Physical Infrastructure

#### Datacentres
Azure is built on a global network of **datacentres** — physical facilities housing racks of servers with dedicated power, cooling, and networking. Individual datacentres are not directly accessible to customers.

#### Regions
A **region** is a geographic area containing at least one (usually multiple) datacentre(s) connected by a low-latency network.

- When you deploy a resource, you choose the region
- Some services are **global** (e.g., Microsoft Entra ID, Azure DNS) and not region-specific
- Some services are **region-specific** and only available in certain regions

#### Region Pairs
Most Azure regions are **paired** with another region within the same geography (at least 300 miles apart).

**Benefits of region pairs:**
- If an Azure outage affects multiple regions, at least one region in each pair will be prioritised for recovery
- Azure updates are rolled out to one region in a pair at a time — reducing downtime risk
- Data continues to reside within the same geography for compliance and legal purposes

**Examples of region pairs:**
| Region | Paired With |
|---|---|
| UK South | UK West |
| East US | West US |
| North Europe | West Europe |

#### Sovereign Regions
Sovereign regions are Azure instances **isolated from the main Azure deployment** for compliance or legal reasons:
- **Azure US Government** — for US government agencies and partners; physically/logically isolated
- **Azure China** — operated by 21Vianet; Microsoft does not directly maintain the datacentres

---

### 2. Availability Zones

**Availability zones (AZs)** are physically separate datacentres within an Azure region. Each zone has:
- Independent power
- Independent cooling
- Independent networking

**Minimum:** At least 3 availability zones per enabled region (not all regions support AZs)

**Purpose:** Protect against datacenter-level failures (e.g., power outage in one building)

#### Service Categories by Zone Support

| Category | Description | Example |
|---|---|---|
| **Zonal services** | Deployed to a specific zone (you choose which zone) | VMs, Managed Disks, IP addresses |
| **Zone-redundant services** | Platform replicates automatically across zones | Azure SQL Database, Zone-redundant storage (ZRS) |
| **Non-regional services** | Resilient to zone and region-wide outages; always available | Microsoft Entra ID, Azure DNS |

> 💡 **Scenario:** Contoso deploys production VMs across all three availability zones in East US. If Zone 1 suffers a power failure, Zones 2 and 3 continue operating — maintaining application availability without manual failover.

---

### 3. Azure Management Hierarchy

Azure organises resources into a **four-level hierarchy**:

```
Tenant Root Group (Management Groups level)
  └── Management Groups
        └── Subscriptions
              └── Resource Groups
                    └── Resources
```

#### Resources
- The **basic building block** of Azure
- Instances of Azure services: VMs, storage accounts, databases, virtual networks, etc.
- Each resource belongs to exactly **one resource group**

#### Resource Groups
- **Logical containers** for related resources
- A resource group can hold resources from different regions
- A resource can only be in **one resource group** at a time
- Actions applied to a resource group apply to all resources within it (delete, access control, tagging)
- Resource groups cannot be nested

> ⚠️ Deleting a resource group deletes ALL resources inside it.

#### Subscriptions
- A unit of **management, billing, and scale**
- Resources in a subscription can be in different resource groups and regions
- **Limits and quotas** apply per subscription (e.g., maximum VMs per region)
- Provides **authenticated and authorised access** to Azure services
- An Azure subscription links to exactly **one Microsoft Entra tenant**
- One organisation can have **multiple subscriptions** (e.g., per department, per project)

**Subscription types:**
- **Dev/Test** — Discounted pricing for development and testing workloads
- **Pay-as-you-go** — Billed for what you use
- **Enterprise Agreement (EA)** — Negotiated pricing for large organisations

#### Management Groups
- Provide **scope above subscriptions** — for managing multiple subscriptions together
- Apply **policies, access, and compliance** settings at scale across subscriptions
- Can be **nested** up to **six levels** beneath the root management group
- All subscriptions within a management group **automatically inherit** conditions applied to the group

**Management group hierarchy example:**
```
Tenant Root Group
  ├── Corp Management Group (policy: enforce MFA)
  │     ├── HR Subscription
  │     └── Finance Subscription
  └── Dev Management Group (policy: block production SKUs)
        └── Dev Subscription
```

---

### 4. Azure Resource Manager (ARM)

**Azure Resource Manager (ARM)** is the deployment and management service for Azure — it provides the management layer for creating, updating, and deleting resources.

**All Azure operations go through ARM:**
- Azure portal
- Azure CLI
- Azure PowerShell
- REST APIs
- SDKs

**ARM provides:**
- Template-based deployments (ARM templates / Bicep)
- Role-based access control (RBAC)
- Tagging
- Monitoring and auditing
- Locking resources

#### Control Plane vs. Data Plane

| Type | Description | Example |
|---|---|---|
| **Control plane** | Manage resources (create, update, delete) — goes through ARM | Creating a storage account, assigning RBAC |
| **Data plane** | Interact with data inside resources — bypasses ARM | Uploading a file to Blob Storage, querying SQL |

> 🔑 Azure Policy operates in the **control plane** — it evaluates resource operations before they complete.

---

## 🧪 Scenario-Based Examples

### Scenario 1: Availability Zone Failure (Beginner)
**Situation:** Contoso runs 3 VMs all in Availability Zone 1 in West Europe. Zone 1 goes offline.  
**Question:** What is the impact and how could it have been prevented?  
**Answer:** All 3 VMs go offline. Prevention: distribute VMs across all 3 AZs (e.g., 1 VM per zone). Zone-redundant deployment ensures high availability.  
**Key concept:** Availability zones, zonal vs. zone-redundant services.

### Scenario 2: Resource Group Deletion (Beginner)
**Situation:** An admin deletes a resource group containing a VM, a storage account, and a virtual network.  
**Question:** What happens to the resources?  
**Answer:** All resources — the VM, storage account, and VNet — are deleted along with the resource group.  
**Key concept:** Resource group as a management boundary; deletion cascades to all contained resources.

### Scenario 3: Policy Inheritance via Management Groups (Intermediate)
**Situation:** Contoso wants to enforce a policy that all VMs must use a specific VM SKU across 10 subscriptions.  
**Solution:** Apply the Azure Policy to the **Management Group** that contains all 10 subscriptions. The policy automatically inherits to all subscriptions, resource groups, and resources beneath it.  
**Key concept:** Management group policy inheritance.

### Scenario 4: Subscription Limits (Intermediate)
**Situation:** A development team is hitting the VM limit in their production subscription.  
**Solution:** Create a separate **Dev/Test subscription** for development workloads. This provides separate limits, billing, and access control.  
**Key concept:** Subscriptions as unit of scale, separate limits per subscription.

### Scenario 5: Control Plane vs. Data Plane (Intermediate)
**Situation:** An admin creates an Azure Policy that denies creating storage accounts outside the West Europe region. A developer attempts to upload a file to an existing storage account in North Europe.  
**Question:** Is the upload blocked by the policy?  
**Answer:** No. Uploading a file is a **data plane** operation — Azure Policy operates in the **control plane** only. The policy blocks the creation of new storage accounts outside West Europe, not data access to existing ones.  
**Key concept:** Control plane vs. data plane.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** A resource can only be in **one resource group** at a time, but a resource group can contain resources from **multiple regions**.

> 🎯 **[TESTABLE – Beginner]** Deleting a resource group **deletes all resources** within it.

> 🎯 **[TESTABLE – Beginner]** An Azure subscription is associated with **exactly one** Microsoft Entra tenant.

> 🎯 **[TESTABLE – Beginner]** **Availability zones** are physically separate datacentres within a region, each with independent power, cooling, and networking.

> 🎯 **[TESTABLE – Beginner]** **Region pairs** are at least **300 miles apart** within the same geography.

> 🎯 **[TESTABLE – Intermediate]** Management groups can be **nested up to 6 levels** beneath the Tenant Root Group.

> 🎯 **[TESTABLE – Intermediate]** Subscriptions within a management group **automatically inherit** policies applied to the management group.

> 🎯 **[TESTABLE – Intermediate]** **Azure Resource Manager** is the control plane for all Azure operations — portal, CLI, PowerShell, REST APIs all go through ARM.

> 🎯 **[TESTABLE – Intermediate]** **Azure Policy** operates in the **control plane** — it does not block data plane operations.

> 🎯 **[TESTABLE – Intermediate]** **Sovereign regions** (Azure Government, Azure China) are isolated from the main Azure deployment for compliance reasons.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Region** | A geographic area containing one or more datacentres connected by a low-latency network |
| **Region pair** | Two Azure regions in the same geography paired for disaster recovery (≥300 miles apart) |
| **Availability zone** | A physically separate datacentre within a region with independent power, cooling, networking |
| **Resource** | A basic deployable instance of an Azure service (VM, storage account, VNet) |
| **Resource group** | A logical container grouping related Azure resources |
| **Subscription** | A unit of management, billing, and scale; linked to one Entra tenant |
| **Management group** | A container for multiple subscriptions enabling centralised governance |
| **Azure Resource Manager (ARM)** | The deployment and management control plane for Azure |
| **Control plane** | Management operations (create, update, delete resources) — go through ARM |
| **Data plane** | Data operations within a resource (upload file, query database) — bypass ARM |
| **Sovereign region** | An Azure region isolated for compliance/legal reasons (e.g., Azure Government, Azure China) |
| **Zonal service** | A service deployed to a specific availability zone |
| **Zone-redundant service** | A service automatically replicated across all availability zones |

---

## 📝 Exam Tips

- Know the **4-level hierarchy**: Resources → Resource Groups → Subscriptions → Management Groups
- **One resource = one resource group** (no dual membership)
- **One subscription = one Entra tenant** (but one tenant can have many subscriptions)
- **Management group inheritance** — policies flow down from parent to child
- Management groups can be nested **6 levels** deep (not counting the root)
- **AZs** protect against datacenter failures; **region pairs** protect against region-wide failures
- Know the difference between **control plane** (ARM, Policy) and **data plane** (file uploads, queries)

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
