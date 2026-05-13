# LP2 – Module 2: Create, Configure, and Manage Identities

**Learning Path:** AZ-104 Manage Identities and Governance in Azure  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~75 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/create-configure-manage-identities/

---

## 📋 Module Overview

This module covers the lifecycle management of users, groups, and devices in Microsoft Entra ID. It includes configuring user types, group membership types (assigned vs dynamic), license management, custom security attributes, and automatic user provisioning.

---

## 🎯 Learning Objectives

- Create, configure, and manage users
- Create, configure, and manage groups
- Manage licenses
- Explain custom security attributes and automatic user provisioning

---

## 📖 Key Concepts & Detailed Notes

### 1. Users in Microsoft Entra ID

Every user who needs access to Azure resources requires a user account in Microsoft Entra ID. The account contains the information needed to authenticate the user and build an access token to authorise their actions.

**Management tool:** Microsoft Entra admin center  
**Note:** You can only work with one directory at a time — use the **Directory + Subscription** panel or **Switch directory** button to change directories.

#### Three Types of User Identities

| Type | Description | Source shown in portal |
|---|---|---|
| **Cloud identities** | Exist only in Microsoft Entra ID (e.g., admin accounts, manually managed users). Deleted when removed from the primary directory. | Microsoft Entra ID / External Microsoft Entra directory |
| **Directory-synchronised identities** | Originate from on-premises Active Directory, synced to Entra ID using Microsoft Entra Cloud Sync or Connect Sync. | Windows Server AD |
| **Guest users** | External accounts from other cloud providers, Microsoft accounts, or partner organisations (B2B). Invited users. | Invited user |

> 💡 **Microsoft Entra Cloud Sync** is the recommended synchronisation tool for most organisations — lightweight cloud-managed agent, supports multiple disconnected forests. **Microsoft Entra Connect Sync** remains available for complex scenarios (device sync, groups >50,000 members).

#### User Properties
- **User Principal Name (UPN)** — Primary sign-in identifier (e.g., user@contoso.com)
- **Display Name** — User's full name as shown in Entra
- **User Type** — Member or Guest
- **Object ID** — Unique identifier for the account in Entra ID

#### Managing Deleted Users
- Deleted users are **soft-deleted** and can be **restored within 30 days**
- After 30 days, the account is permanently deleted and cannot be recovered

---

### 2. Groups in Microsoft Entra ID

Groups simplify permission management by applying access rights to all group members rather than individually assigning them.

#### Two Types of Groups

| Group Type | Purpose | Who can create |
|---|---|---|
| **Security groups** | Manage access to shared resources (most common). Members can include users, devices, and service principals. | Requires Microsoft Entra administrator |
| **Microsoft 365 groups** | Collaboration (shared mailbox, calendar, files, SharePoint site). Can include external users. | Available to users and admins |

#### Three Membership Types

| Membership Type | How Members Are Added |
|---|---|
| **Assigned** | Members are manually added and maintained by an administrator |
| **Dynamic User** | Members are automatically added/removed based on rules that evaluate user attributes (e.g., department, job title, location) |
| **Dynamic Device** | Devices are automatically added/removed based on device attribute rules — **Security groups only** (Microsoft 365 groups do NOT support dynamic devices) |

#### Dynamic Groups (Detailed)

Dynamic membership uses **rules** to automatically maintain group membership. When a member's attributes change (e.g., department changes), Entra ID re-evaluates all dynamic rules and updates memberships accordingly.

**Licence requirement:** Dynamic membership requires **Microsoft Entra ID P1** (or Intune for Education for device-based rules)

**Example rule:** Add all users where `Department = "Marketing"` automatically to the Marketing Security Group.

> 💡 **Scenario:** Contoso needs all Marketing staff to have access to a SharePoint site. Instead of manually managing the group, they create a Dynamic User Security Group with the rule `Department = Marketing`. As employees join or leave Marketing, group membership updates automatically without admin intervention.

---

### 3. Device Registration and Management

Microsoft Entra ID supports three ways to integrate devices:

| Method | Description | Best for |
|---|---|---|
| **Microsoft Entra registered** | Personal devices registered to access work resources (BYOD). No full corporate management. | Personal phones, tablets (iOS, Android, Windows, macOS) |
| **Microsoft Entra joined** | Devices fully joined to Entra ID (replaces traditional domain join for cloud-first). | Corporate-owned Windows 10/11 devices |
| **Microsoft Entra hybrid joined** | Devices joined to both on-premises AD DS and Entra ID simultaneously. | Corporate devices in hybrid environments |

---

### 4. Managing Licences

Licences in Microsoft Entra ID can be assigned at:
- **User level** — directly to individual users
- **Group level** — to a group; all group members inherit the licence (**group-based licensing**)

**Group-based licensing** is the recommended approach for organisations with many users — it simplifies administration and ensures consistency.

**Licence requirements:**
- Microsoft Entra ID Free — included with Azure subscriptions
- Microsoft Entra ID P1 — required for dynamic groups, SSPR writeback, Conditional Access
- Microsoft Entra ID P2 — required for Identity Protection, PIM

> ⚠️ If you assign licences at the group level and a user joins that group, they automatically receive the licence. If they leave the group, the licence is automatically removed.

---

### 5. Custom Security Attributes

Custom security attributes are **business-specific attributes** that can be added to Entra ID objects (users, enterprise applications, service principals) to store additional information.

**Use cases:**
- Store additional employee data (e.g., employee ID, cost centre, clearance level)
- Use in Conditional Access policies
- Use in Azure attribute-based access control (ABAC) for storage

**Key characteristics:**
- Defined in an **attribute set** (a container for custom attributes)
- Can be single-valued or multi-valued
- Only certain roles can manage custom security attributes (e.g., Attribute Definition Administrator, Attribute Assignment Administrator)

---

### 6. Automatic User Provisioning (SCIM)

**Microsoft Entra Provisioning** automates the creation, maintenance, and removal of user identities in cloud applications using the **SCIM (System for Cross-domain Identity Management)** standard.

**How it works:**
- Entra ID acts as the identity source
- Changes to users in Entra ID are automatically provisioned (created/updated/deleted) in connected SaaS applications
- Reduces manual work and ensures users have access to the right apps throughout their lifecycle

**Common use cases:**
- Automatically create accounts in Salesforce, ServiceNow, Workday, etc., when a new employee is onboarded
- Automatically disable accounts in all connected apps when an employee leaves

> 💡 **Scenario:** When a new hire starts at Fabrikam, HR creates their account in Workday (HR system). Microsoft Entra ID Provisioning detects the new user via SCIM and automatically creates accounts in Microsoft 365, Salesforce, and ServiceNow — no IT tickets required.

---

## 🧪 Scenario-Based Examples

### Scenario 1: Three User Types (Beginner)
**Situation:** Contoso has employees managed in on-premises AD, admins managed only in Entra ID, and external consultants from a partner company.  
**Answer:** Employees = directory-synchronised identities; Admins = cloud identities; Consultants = guest users.  
**Key concept:** Three user identity types.

### Scenario 2: Group Membership for Compliance (Intermediate)
**Situation:** Contoso's compliance team requires all users in the Finance department to automatically be added to a compliance monitoring group.  
**Solution:** Create a **Dynamic User Security Group** with the rule `Department = Finance`. Users are automatically added/removed as their department attribute changes. Requires **P1** licence.  
**Key concept:** Dynamic groups, P1 licensing.

### Scenario 3: Dynamic Device Group (Intermediate)
**Situation:** An IT team wants to automatically group all corporate Windows devices running Windows 11 to deploy a software update.  
**Solution:** Create a **Dynamic Device Security Group** with a rule targeting the OS version attribute.  
**Important:** Dynamic device groups only work with **Security groups**, not Microsoft 365 groups.  
**Key concept:** Dynamic device membership.

### Scenario 4: Restoring a Deleted User (Beginner)
**Situation:** An admin accidentally deletes a user account. The user contacts the helpdesk within 2 weeks.  
**Solution:** Restore the soft-deleted account from the **Deleted Users** view in the Entra admin center (possible within 30 days of deletion).  
**Key concept:** Soft delete, 30-day restore window.

### Scenario 5: Group-Based Licensing (Intermediate)
**Situation:** Contoso assigns Microsoft 365 E3 licences to a group. A new user joins that group.  
**Question:** What happens?  
**Answer:** The user automatically inherits the Microsoft 365 E3 licence when they are added to the group. When they leave the group, the licence is automatically removed.  
**Key concept:** Group-based licensing inheritance.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** The **three user types** in Entra ID are: cloud identities, directory-synchronised identities, and guest users.

> 🎯 **[TESTABLE – Beginner]** Deleted users can be **restored within 30 days** before permanent deletion.

> 🎯 **[TESTABLE – Beginner]** **Security groups** can contain users, devices, and service principals. **Microsoft 365 groups** are for collaboration (mailbox, calendar, SharePoint).

> 🎯 **[TESTABLE – Intermediate]** **Dynamic membership** requires **Microsoft Entra ID P1** licence.

> 🎯 **[TESTABLE – Intermediate]** **Dynamic device membership** is only supported in **Security groups** — NOT Microsoft 365 groups.

> 🎯 **[TESTABLE – Intermediate]** **Microsoft Entra Cloud Sync** is the recommended sync tool for most organisations; Connect Sync is for complex scenarios (device sync, >50,000 group members).

> 🎯 **[TESTABLE – Intermediate]** **Group-based licensing** automatically assigns licences when users join a group and removes them when users leave.

> 🎯 **[TESTABLE – Intermediate]** **SCIM** is the protocol used by Microsoft Entra Provisioning for automatic user lifecycle management in SaaS applications.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Cloud identity** | A user account that exists only in Microsoft Entra ID |
| **Directory-synchronised identity** | A user synced from on-premises AD DS to Entra ID |
| **Guest user** | An external user invited via B2B collaboration |
| **Security group** | An Entra group for managing resource access permissions |
| **Microsoft 365 group** | An Entra group for collaboration (mailbox, calendar, SharePoint) |
| **Dynamic membership** | Group membership automatically managed by attribute-based rules |
| **Assigned membership** | Group membership manually managed by an administrator |
| **Microsoft Entra Cloud Sync** | Recommended lightweight agent for syncing on-premises AD to Entra ID |
| **Group-based licensing** | Assigning licences at the group level; members inherit licences automatically |
| **SCIM** | System for Cross-domain Identity Management — protocol for automatic user provisioning |
| **Custom security attributes** | Business-specific attributes added to Entra ID objects for additional metadata |
| **Microsoft Entra registered** | BYOD device registered for work access without full corporate management |
| **Microsoft Entra joined** | Corporate device fully joined to Entra ID (cloud-first domain join) |
| **Microsoft Entra hybrid joined** | Device joined to both on-premises AD DS and Microsoft Entra ID |

---

## 📝 Exam Tips

- **Dynamic groups require P1** — any scenario mentioning automatic group membership management implies P1 or P2
- **Dynamic device groups = Security groups only** — Microsoft 365 groups do not support device dynamic membership
- **30-day soft delete window** — users can be restored within 30 days
- **SCIM** is the standard for automatic provisioning to SaaS apps
- **Group-based licensing** is more scalable than per-user licence assignment
- Know the three device integration methods: Registered (BYOD), Joined (cloud-first corporate), Hybrid joined (on-premises + cloud)

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
