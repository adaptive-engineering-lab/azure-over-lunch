# LP2 – Module 5: Secure Azure Resources with Azure RBAC

**Learning Path:** AZ-104 Manage Identities and Governance in Azure  
**Difficulty:** 🟢 Beginner  
**Estimated Study Time:** ~45 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/secure-azure-resources-with-rbac/

---

## 📋 Module Overview

Azure Role-Based Access Control (Azure RBAC) is an authorisation system built on Azure Resource Manager that provides fine-grained access management for Azure resources. This module covers how to grant, verify, and revoke access using RBAC.

---

## 🎯 Learning Objectives

- Verify access to resources for yourself and others
- Grant access to resources
- View activity logs of Azure RBAC changes

---

## 📖 Key Concepts & Detailed Notes

### 1. What is Azure RBAC?

Azure RBAC is an **authorisation system** built on Azure Resource Manager. It provides fine-grained access management so you can grant users, groups, and applications exactly the access they need — no more, no less.

**Two primary concerns Azure RBAC addresses:**
1. Ensuring that when people leave the organisation, they automatically lose access to cloud resources (by disabling the linked Entra ID account)
2. Balancing **autonomy** (project teams managing their own VMs) with **central governance** (networking controlled centrally)

**How subscriptions link to Entra ID for RBAC:**
- Each Azure subscription is associated with one Microsoft Entra directory
- Users, groups, and applications in that directory manage subscription resources
- Disabling an on-premises AD account (synced via Entra Connect) automatically removes access to all connected Azure subscriptions

---

### 2. How Azure RBAC Works — The Three Elements

A **role assignment** = combining three elements: **Who + What + Where**

#### Element 1: Security Principal (Who)
The **security principal** is the identity to which access is being granted:

| Security Principal Type | Description |
|---|---|
| **User** | An individual with a profile in Microsoft Entra ID (including guests) |
| **Group** | A set of users (Security group or Microsoft 365 group) |
| **Service principal** | An application identity used by apps or services to access Azure resources |
| **Managed identity** | An identity automatically managed by Azure for Azure services (no credential management needed) |

#### Element 2: Role Definition (What)
A **role definition** is a collection of permissions defining what actions a security principal can perform.

**Four fundamental built-in roles:**

| Role | Permissions | Notes |
|---|---|---|
| **Owner** | Full access to all resources + right to delegate access | Can assign roles to others |
| **Contributor** | Create and manage all resource types | Cannot grant access to others |
| **Reader** | View existing resources | Read-only access |
| **User Access Administrator** | Manage user access to Azure resources | Can assign roles but cannot manage resources |

> 💡 Custom roles can be created when built-in roles don't meet specific needs.

**Role definition structure (Actions / NotActions):**
- **Actions** — Permitted operations (e.g., `*` = all operations)
- **NotActions** — Operations excluded from the allowed set
- **Effective permissions** = Actions minus NotActions

**Contributor role example:**
- Actions: `*` (all)
- NotActions (excluded from permissions):
  - Delete roles and role assignments
  - Create roles and role assignments
  - Grant User Access Administrator access at tenant scope
  - Create/update/delete blueprint artifacts

#### Element 3: Scope (Where)
**Scope** is the level at which the access applies. Azure RBAC scopes form a **parent-child hierarchy**:

```
Management Group
  └── Subscription
        └── Resource Group
              └── Resource
```

- **Permissions are inherited** — access granted at a parent scope applies to all child scopes
- Example: Contributor at the subscription level = Contributor on all resource groups and resources in that subscription

---

### 3. Role Assignments

A **role assignment** binds a security principal + role definition + scope to grant access.

- **To grant access:** Create a role assignment
- **To revoke access:** Remove a role assignment
- Multiple role assignments combine — permissions are **additive**

**Example:**
- User A is assigned **Reader** on a resource group → can view resources
- User A is also assigned **Contributor** on a specific storage account in that group → can manage the storage account
- Effective permissions: Reader on resource group + Contributor on storage account

---

### 4. Azure RBAC is an Allow Model

RBAC uses an **allow model** — permissions are explicitly granted; everything else is implicitly denied.

**Key behaviour:**
- If two role assignments grant different levels of access to the same scope, the **more permissive** combined permission applies
- `NotActions` do NOT create explicit "deny" rules — they just subtract from the allowed set
- **Explicit deny assignments** (Azure Deny Assignments) can override allow assignments — these are separate from role assignments

> ⚠️ Unlike AWS IAM deny policies, Azure RBAC `NotActions` are simply exclusions from the wildcard — not explicit denials. However, Azure **Deny Assignments** (typically applied through Azure Blueprints) can explicitly deny even if a role would otherwise allow the action.

---

### 5. Accessing RBAC in the Azure Portal

In the Azure portal, RBAC is managed through the **Access control (IAM)** pane, available on:
- Management groups
- Subscriptions
- Resource groups
- Individual resources

**IAM pane capabilities:**
- **Check access** — Verify what access a specific user, group, or service principal has
- **Role assignments** — View and manage all role assignments at that scope
- **Roles** — Browse and view built-in and custom role definitions
- **Add role assignment** — Grant access to a security principal

---

### 6. Viewing Activity Logs for RBAC Changes

Azure records all RBAC role assignment changes in the **Azure Activity Log**:

- Located in **Monitor → Activity Log** or on the **Access control (IAM) → Activity log** tab
- Shows who made the change, what was changed, and when
- Retention: **90 days** by default (archive to storage account or Log Analytics for longer retention)
- Useful for auditing access changes and investigating security incidents

---

## 🧪 Scenario-Based Examples

### Scenario 1: Principle of Least Privilege (Beginner)
**Situation:** Contoso's junior developer needs to view (but not modify) resources in the Production resource group.  
**Solution:** Assign the **Reader** role to the developer at the **Production resource group** scope. They can view all resources in that group but cannot create, modify, or delete anything.  
**Key concept:** Role assignment, Reader role, resource group scope.

### Scenario 2: Delegation vs. Management (Beginner)
**Situation:** The IT manager wants a team lead to be able to grant access to other team members for a specific resource group, but not manage the resources themselves.  
**Solution:** Assign the **User Access Administrator** role (not Contributor or Owner) at the resource group scope. This allows managing access without resource management permissions.  
**Key concept:** User Access Administrator role, separation of duties.

### Scenario 3: Scope Inheritance (Intermediate)
**Situation:** A user is assigned the **Contributor** role at the subscription level. The subscription has 5 resource groups.  
**Question:** What is the user's effective permission on each resource group?  
**Answer:** Contributor on all 5 resource groups and all resources within them — permissions are inherited from parent (subscription) to children (resource groups and resources).  
**Key concept:** Scope inheritance.

### Scenario 4: Additive Permissions (Intermediate)
**Situation:** User B has **Reader** on subscription A, and **Contributor** on Resource Group RG1 (which is in subscription A).  
**Question:** What can User B do in RG1 vs. other resource groups?  
**Answer:** In RG1 — Contributor (can create/manage resources). In all other resource groups — Reader (read-only). Permissions are additive; the more specific (lower scope) Contributor doesn't reduce the Reader permission elsewhere.  
**Key concept:** Additive permissions, scope specificity.

### Scenario 5: Auditing Access Changes (Intermediate)
**Situation:** A security incident occurs — someone may have been granted inappropriate access to a production storage account last week.  
**Solution:** Open the **Activity Log** on the storage account's Access control (IAM) pane. Filter for "role assignment" operations in the past 7 days to see who granted access, when, and to whom.  
**Key concept:** Activity Log, RBAC audit trail.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** The three elements of a role assignment are: **Security principal (Who) + Role definition (What) + Scope (Where)**.

> 🎯 **[TESTABLE – Beginner]** The four fundamental built-in roles are: **Owner, Contributor, Reader, User Access Administrator**.

> 🎯 **[TESTABLE – Beginner]** **Owner** can grant access to others; **Contributor** cannot.

> 🎯 **[TESTABLE – Beginner]** RBAC is an **allow model** — permissions are explicitly granted; everything else is implicitly denied.

> 🎯 **[TESTABLE – Intermediate]** RBAC scope hierarchy (highest to lowest): **Management Group → Subscription → Resource Group → Resource**.

> 🎯 **[TESTABLE – Intermediate]** Role permissions are **inherited** — a role granted at a parent scope applies to all child scopes.

> 🎯 **[TESTABLE – Intermediate]** Multiple role assignments are **additive** — overlapping permissions combine to grant more access.

> 🎯 **[TESTABLE – Intermediate]** **NotActions** in a role definition subtract from the wildcard Actions — they are NOT explicit deny rules.

> 🎯 **[TESTABLE – Intermediate]** RBAC changes are recorded in the **Azure Activity Log** with 90-day default retention.

> 🎯 **[TESTABLE – Intermediate]** RBAC is managed through the **Access control (IAM)** pane in the Azure portal.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Azure RBAC** | Role-based access control — an authorisation system for fine-grained access management in Azure |
| **Role assignment** | The binding of a security principal + role definition + scope to grant access |
| **Security principal** | An identity (user, group, service principal, managed identity) assigned a role |
| **Role definition** | A collection of permissions defining allowed (Actions) and excluded (NotActions) operations |
| **Scope** | The level at which a role assignment applies (management group, subscription, resource group, resource) |
| **Owner** | Built-in role with full resource access including the right to delegate access |
| **Contributor** | Built-in role for managing all resources but not granting access to others |
| **Reader** | Built-in role for read-only access to existing resources |
| **User Access Administrator** | Built-in role for managing user access to Azure resources |
| **Allow model** | RBAC grants permissions explicitly; ungranted permissions are implicitly denied |
| **NotActions** | Permissions excluded from a role's Actions; not explicit deny rules |
| **Activity Log** | Azure audit log recording all control plane operations including RBAC changes |
| **Access control (IAM)** | Azure portal pane for managing RBAC role assignments at any scope |

---

## 📝 Exam Tips

- Know the **4 fundamental roles** and their key differences (especially Owner vs. Contributor)
- **Owner = manage resources + delegate access; Contributor = manage resources only**
- Permissions flow **downward** (parent scope → child scope)
- Multiple assignments are **additive** — combine to give more access
- **NotActions ≠ explicit deny** — they simply exclude from the wildcard
- RBAC changes are auditable via the **Activity Log** (90-day retention)
- The **Access control (IAM)** pane is the portal location for all RBAC management

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
