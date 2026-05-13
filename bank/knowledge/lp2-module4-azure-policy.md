# LP2 – Module 4: Azure Policy Initiatives

**Learning Path:** AZ-104 Manage Identities and Governance in Azure  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~60 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/sovereignty-policy-initiatives/

---

## 📋 Module Overview

This module covers Azure Policy — the service used to enforce organisational standards, assess compliance at scale, and govern Azure resources. It covers governance hierarchy, policy components (definitions, assignments, initiatives), and how resources are evaluated against policies.

---

## 🎯 Learning Objectives

- Understand cloud governance with Azure Policy
- Understand Azure Policy and its components
- Understand policy definitions, initiatives, and assignments
- Understand how resources are evaluated against policies

---

## 📖 Key Concepts & Detailed Notes

### 1. Azure Governance Hierarchy

Azure provides **four levels of management scope** for governance:

| Level | Description |
|---|---|
| **Management Groups** | Containers above subscriptions; apply policies across multiple subscriptions |
| **Subscriptions** | Units of billing, management, and scale |
| **Resource Groups** | Logical groupings of resources within a subscription |
| **Resources** | Individual Azure service instances |

**Inheritance:** Settings applied at a higher scope are automatically inherited by lower scopes. A policy applied to a Management Group flows down to all subscriptions, resource groups, and resources within it.

---

### 2. Azure Resource Manager — Control Plane vs. Data Plane

Azure Policy operates at the **control plane** through Azure Resource Manager (ARM).

| Plane | Description | Managed By |
|---|---|---|
| **Control plane** | Manages resources (create, update, delete). All API calls go through ARM → RBAC → Policy | Azure Resource Manager |
| **Data plane** | Interacts with data in resources (upload files, query databases). Bypasses ARM. | Individual service resource providers |

**Request flow for control plane operations:**
1. API call reaches ARM
2. ARM authenticates and authorises via **RBAC** (if RBAC fails, Policy is never evaluated)
3. ARM evaluates the request against **Azure Policy**
4. If compliant, ARM forwards to the resource provider
5. Resource provider completes the operation

> ⚠️ RBAC is evaluated BEFORE Azure Policy. If you lack RBAC permission, the policy is never reached.

**Data plane policy support:** Azure Policy can extend to data plane operations through specific resource provider modes:
- `Microsoft.Kubernetes.Data` — Kubernetes pods, containers, ingresses
- `Microsoft.KeyVault.Data` — Key Vault vaults and certificates
- `Microsoft.Network.Data` — Virtual Network Manager custom membership

---

### 3. Greenfield vs. Brownfield Policy Scenarios

| Scenario | Description | Evaluation Trigger |
|---|---|---|
| **Greenfield** (policy-first) | A policy exists when a new resource is being created or updated | Real-time during resource creation/update |
| **Brownfield** (resource-first) | Resources already exist when a new policy is assigned | Compliance scan (every 24 hours automatically, or manually triggered) |

**Brownfield detail:** Existing resources are NOT deleted when a policy is applied retroactively — they are flagged as **non-compliant**. Future resource creations/updates must comply with the policy.

> 💡 **Scenario:** Contoso assigns a new Azure Policy that denies creating resources outside West Europe. All existing storage accounts in North Europe remain in place but are flagged as non-compliant. No new storage accounts can be created outside West Europe.

---

### 4. Azure Policy Components

#### Policy Definition
A policy definition describes the **compliance condition** and the **effect** to take when the condition is met.

- Written in JSON
- Stored at management group, subscription, or resource group scope
- Built-in definitions are provided by Azure; custom definitions can be created

**Policy definition structure:**
- **Display name** — Human-readable name
- **Description** — What the policy does
- **Mode** — Which resource types are evaluated (`All`, `Indexed`, or resource provider mode)
- **Policy rule** — The condition (if/then logic)
- **Effect** — What happens when the condition is met

#### Policy Effects

| Effect | Description |
|---|---|
| **Deny** | Blocks the resource operation if it violates the policy |
| **Audit** | Logs a warning but allows the operation — good for monitoring |
| **Append** | Adds fields to a resource during creation/update (e.g., add a required tag) |
| **AuditIfNotExists** | Audits if a related resource doesn't exist |
| **DeployIfNotExists** | Deploys a related resource if it doesn't exist |
| **Disabled** | Policy is turned off; used for testing |
| **Modify** | Adds, updates, or removes properties or tags during creation/update |

#### Policy Assignment
An **assignment** applies a policy definition (or initiative) to a specific **scope** (management group, subscription, resource group, or resource).

- Includes the **scope** of enforcement
- Can include **exclusions** — specific child scopes exempt from the policy
- Policies take effect within approximately **30 minutes** of assignment

#### Policy Initiative (Policy Set)
An **initiative** is a **collection of policy definitions** grouped together to achieve a single governance goal.

- Simplifies managing related policies as one unit
- Assigned as a single unit to a scope
- Each policy in the initiative can have its own parameters

**Example:** The **Azure Security Benchmark** initiative contains dozens of individual policies all related to security best practices — assigned as one initiative rather than dozens of separate assignments.

> 💡 **Scenario:** Contoso wants to ensure all resources comply with data residency regulations (data must stay in West Europe). Instead of assigning 15 individual policies (one for each resource type), they group them into a **Data Residency Initiative** and assign it once to the management group.

---

### 5. Policy Evaluation & Compliance

#### Evaluation Triggers
- Resource creation or update (real-time)
- Policy assignment or update (~30 minutes)
- Compliance scan (every **24 hours** automatically)
- Manual trigger via API or Azure portal

#### Compliance States
- **Compliant** — The resource meets all assigned policy conditions
- **Non-compliant** — The resource violates at least one assigned policy
- **Exempt** — The resource is explicitly excluded from evaluation

#### Compliance View
The Azure Policy **compliance dashboard** shows:
- Overall compliance percentage
- Number of compliant/non-compliant resources per policy
- Per-resource compliance details

---

### 6. Cloud Adoption Framework (CAF) and Governance

The **Cloud Adoption Framework (CAF)** provides Microsoft's best practices for cloud governance. The governance pillars supported by Azure Policy include:
- **Cost management** — Enforcing resource tagging for cost allocation
- **Security baseline** — Enforcing encryption, MFA, network restrictions
- **Resource consistency** — Enforcing naming conventions and allowed SKUs
- **Identity baseline** — Enforcing RBAC assignments
- **Deployment acceleration** — Enforcing approved deployment patterns

---

## 🧪 Scenario-Based Examples

### Scenario 1: Deny Effect — Blocking Non-Compliant Resources (Beginner)
**Situation:** Contoso's policy team wants to ensure no VMs are created with public IP addresses.  
**Solution:** Create an Azure Policy with the **Deny** effect targeting `Microsoft.Network/publicIPAddresses` associated with VMs. Any attempt to create a VM with a public IP is blocked at the control plane.  
**Key concept:** Deny effect, control plane enforcement.

### Scenario 2: Audit vs. Deny (Beginner)
**Situation:** Fabrikam wants to start monitoring (but not blocking) storage accounts that don't have secure transfer enabled.  
**Solution:** Use the **Audit** effect. Non-compliant storage accounts are logged and flagged in the compliance dashboard but the operation is not blocked.  
**Key concept:** Audit effect for monitoring without enforcement.

### Scenario 3: Brownfield Compliance Scan (Intermediate)
**Situation:** Contoso assigns a new policy requiring all storage accounts to have geo-redundant storage (GRS). They have 200 existing storage accounts, many using LRS.  
**Question:** What happens to existing storage accounts?  
**Answer:** They are NOT deleted. They are flagged as **non-compliant** in the next compliance scan. Future storage accounts must use GRS. Existing accounts are given a non-compliant state until they are updated.  
**Key concept:** Brownfield, compliance scan, non-compliant state.

### Scenario 4: Policy Initiative for Regulatory Compliance (Intermediate)
**Situation:** Contoso must comply with ISO 27001. Compliance requires 40 individual security policies.  
**Solution:** Apply the built-in **ISO 27001:2013** policy initiative to the management group. All 40 policies are assigned together. The compliance dashboard shows aggregate compliance against the standard.  
**Key concept:** Policy initiatives (sets), compliance at scale.

### Scenario 5: Inheritance — Management Group Policy (Intermediate)
**Situation:** A policy is applied to a management group requiring all resources to have a `CostCentre` tag. A developer creates a VM in a subscription under that management group without the tag.  
**Question:** Does the policy apply?  
**Answer:** Yes — the policy is inherited from the management group. The VM creation is either denied (if Deny effect) or flagged as non-compliant (if Audit effect), depending on the policy configuration.  
**Key concept:** Policy inheritance, management group scope.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** Azure Policy **Deny** effect blocks operations; **Audit** effect logs but allows them.

> 🎯 **[TESTABLE – Beginner]** Azure Policy compliance scans run automatically every **24 hours**.

> 🎯 **[TESTABLE – Beginner]** An **initiative** is a collection of policy definitions grouped together to achieve a governance goal.

> 🎯 **[TESTABLE – Beginner]** Policies take effect within approximately **30 minutes** of assignment.

> 🎯 **[TESTABLE – Intermediate]** Azure Policy evaluates in the **control plane** via ARM — **RBAC is checked before Policy**.

> 🎯 **[TESTABLE – Intermediate]** In **Brownfield** scenarios, existing non-compliant resources are flagged but NOT deleted.

> 🎯 **[TESTABLE – Intermediate]** Policy assignments can include **exclusions** — specific child scopes exempt from the policy.

> 🎯 **[TESTABLE – Intermediate]** **DeployIfNotExists** effect automatically deploys a related resource if it doesn't exist (e.g., deploy a Log Analytics agent to a new VM).

> 🎯 **[TESTABLE – Intermediate]** Policies applied at a **management group** scope are **inherited** by all subscriptions, resource groups, and resources beneath it.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Azure Policy** | Azure service for enforcing organisational standards and assessing compliance at scale |
| **Policy definition** | JSON-based rule describing a compliance condition and its effect |
| **Policy effect** | Action taken when a condition is met (Deny, Audit, Append, Modify, DeployIfNotExists, etc.) |
| **Policy assignment** | Applying a policy definition or initiative to a specific scope |
| **Policy initiative** | A collection of policy definitions grouped to achieve a single governance goal (also called a policy set) |
| **Compliance scan** | Automated evaluation of resources against assigned policies (runs every 24 hours) |
| **Non-compliant** | A resource that violates an assigned policy condition |
| **Greenfield** | Scenario where policy exists before resources are created |
| **Brownfield** | Scenario where resources already exist when a new policy is applied |
| **Exclusion** | A child scope explicitly exempt from a policy assignment |
| **Control plane** | ARM-managed layer for resource creation/management where Azure Policy is enforced |

---

## 📝 Exam Tips

- **RBAC before Policy** — if RBAC denies access, Policy is never evaluated
- **Deny** blocks the action; **Audit** allows but logs — know when to use each
- **Initiatives** simplify managing many related policies as one unit — common in compliance frameworks
- **Brownfield** = existing resources flagged as non-compliant, NOT deleted
- Compliance scan frequency = **every 24 hours** (or triggered manually)
- **Policy scope hierarchy**: Management Group > Subscription > Resource Group > Resource
- **DeployIfNotExists** is used for automatic remediation (e.g., auto-deploy agents, diagnostics)

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
