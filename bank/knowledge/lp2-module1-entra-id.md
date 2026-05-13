# LP2 – Module 1: Understand Microsoft Entra ID

**Learning Path:** AZ-104 Manage Identities and Governance in Azure  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~60 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/understand-azure-active-directory/

---

## 📋 Module Overview

Microsoft Entra ID (formerly Azure Active Directory) is Microsoft's cloud-based identity and access management service. This module compares Entra ID to on-premises Active Directory Domain Services (AD DS), covers its licensing tiers, and explores Microsoft Entra Domain Services.

---

## 🎯 Learning Objectives

- Describe Microsoft Entra ID
- Compare Microsoft Entra ID to Active Directory Domain Services (AD DS)
- Describe how Microsoft Entra ID is used as a directory for cloud apps
- Describe Microsoft Entra ID P1 and P2
- Describe Microsoft Entra Domain Services

---

## 📖 Key Concepts & Detailed Notes

### 1. What is Microsoft Entra ID?

Microsoft Entra ID is a **Platform as a Service (PaaS)** offering — a Microsoft-managed, cloud-based identity service. It is NOT part of the core infrastructure that customers own or manage, and it is not Infrastructure as a Service (IaaS).

**Key capabilities:**
- Configuring access to applications
- Single sign-on (SSO) for cloud-based SaaS applications
- Managing users and groups
- Provisioning users
- Enabling federation between organisations
- Identity management and protection
- Identifying irregular sign-in activity
- Configuring multi-factor authentication (MFA)
- Extending on-premises AD to the cloud
- Configuring Application Proxy for cloud and local apps
- Conditional Access for users and devices

**Tiers:**
- **Free tier** — Included automatically with any Azure subscription; no extra cost
- **Basic tier** — Additional features; paid
- **Premium P1 and P2** — Advanced identity management features; paid; also included with certain Microsoft 365 subscriptions

> 💡 By default, creating a new Azure subscription with a Microsoft account automatically creates a Microsoft Entra tenant named **Default Directory**.

---

### 2. Microsoft Entra Tenants

A **tenant** represents a company or organisation that signed up for a Microsoft cloud service (Microsoft 365, Intune, Azure). Technically, it is an individual Microsoft Entra instance.

**Key facts about tenants:**
- Microsoft Entra ID is **multi-tenant by design** — each tenant is isolated from others
- Microsoft Entra is the **world's largest multi-tenant directory** — over 1 million directory instances, billions of auth requests per week
- At any time, an **Azure subscription is associated with exactly ONE Microsoft Entra tenant**
- The **same Microsoft Entra tenant can be associated with multiple Azure subscriptions**
- Each tenant gets a default DNS domain: `<prefix>.onmicrosoft.com`
- Custom domain names can be added (e.g., `contoso.com`)

---

### 3. Microsoft Entra Schema

The Microsoft Entra schema differs significantly from AD DS:

- **Fewer object types** than AD DS — notably, no **Computer** class (only a **Device** class)
- Joining devices to Entra ID differs considerably from joining computers to AD DS
- **No Organisational Unit (OU) class** — objects cannot be arranged in hierarchical containers like in AD DS
- The schema is **easily extensible** and extensions are **fully reversible**
- **Application** and **servicePrincipal** classes represent applications:
  - **Application object** — contains the application definition (lives in one tenant)
  - **servicePrincipal object** — represents the application instance in each tenant where it's registered

---

### 4. Comparing Microsoft Entra ID vs. Active Directory Domain Services

| Feature | AD DS | Microsoft Entra ID |
|---|---|---|
| **Type** | Directory service (Windows Server) | Identity service (cloud PaaS) |
| **Structure** | Hierarchical X.500-based | Flat structure, no OUs or GPOs |
| **Resource location** | Uses DNS | REST API over HTTP/HTTPS |
| **Authentication** | Kerberos | SAML, WS-Federation, OpenID Connect |
| **Authorisation** | Kerberos, NTLM | OAuth |
| **Query method** | LDAP | REST API |
| **Management** | OUs and GPOs | Groups, Conditional Access, RBAC |
| **Computer objects** | Yes — traditional domain join | No — Device objects, modern management |
| **Multi-tenancy** | No | Yes — by design |
| **Federation** | AD Federation Services (AD FS) | Built-in federation with third parties (e.g., Facebook) |
| **Primary focus** | On-premises apps | Internet-based/cloud apps (HTTP/HTTPS) |

> ⚠️ Deploying AD DS on an Azure VM is **not** the same as using Microsoft Entra ID. Running domain controllers on Azure VMs uses IaaS and does not leverage Entra ID features.

---

### 5. Microsoft Entra ID P1 Features

| Feature | Description |
|---|---|
| **Self-service group management** | Users can create/manage groups; request to join others |
| **Advanced security reports & alerts** | Machine learning-based anomaly detection and inconsistent access pattern reports |
| **Multi-factor authentication (MFA)** | Works with on-premises apps (VPN, RADIUS), Azure, Microsoft 365, Dynamics 365, third-party apps |
| **Microsoft Identity Manager (MIM) licensing** | Bridges multiple on-premises auth stores (AD DS, LDAP, Oracle) with Entra ID |
| **Enterprise SLA of 99.9%** | Guaranteed availability |
| **Password reset with writeback** | SSPR syncs password changes back to on-premises AD following the local password policy |
| **Cloud App Discovery** | Discovers the most frequently used cloud applications |
| **Conditional Access (device, group, location)** | Controls access to critical resources based on conditions |
| **Microsoft Entra Connect Health** | Operational insight into Entra ID with alerts and performance metrics |

---

### 6. Microsoft Entra ID P2 Additional Features

P2 includes everything in P1, plus:

| Feature | Description |
|---|---|
| **Microsoft Entra ID Protection** | Enhanced monitoring; define user risk policies and sign-in risk policies; flag users for risk |
| **Microsoft Entra Privileged Identity Management (PIM)** | Configure additional security levels for privileged users (permanent vs. temporary admins); policy workflow for administrative privilege activation |

---

### 7. Microsoft Entra Domain Services

Microsoft Entra Domain Services (formerly Azure AD DS) is a managed domain service that provides:
- **Group Policy management**
- **Domain joining** for VMs
- **Kerberos authentication**
- **LDAP**, **NTLM** support

...all without deploying or managing domain controllers.

**How it fits in:**
- Runs as part of the **Microsoft Entra ID P1 or P2 tier**
- Integrates with on-premises AD DS via **Microsoft Entra Connect** — users can use the same credentials in both environments
- Can be used as a **cloud-only service** (no on-premises AD required)

**Benefits:**
- No need to manage, update, or monitor domain controllers
- No Active Directory replication management needed
- No Domain Admins or Enterprise Admins groups needed for Microsoft-managed domains

**Current Limitations:**
- Only the base **Computer AD object** is supported
- **Cannot extend the schema**
- OU structure is **flat** — nested OUs are not supported
- Only one built-in GPO exists for computer and user accounts
- Cannot target OUs with built-in GPOs, use WMI filters, or security-group filtering

> 💡 **Billing:** Microsoft Entra Domain Services charges per hour based on the size of your directory.

---

## 🧪 Scenario-Based Examples

### Scenario 1: Cloud vs. On-Premises Identity (Beginner)
**Situation:** Contoso has an on-premises AD DS deployment and is migrating to Microsoft 365. They want users to sign in once for both on-premises and cloud resources.  
**Solution:** Implement Microsoft Entra Connect to sync on-premises identities to Entra ID, enabling SSO across both environments.  
**Key concept:** Directory-synchronised identities, Microsoft Entra Connect.

### Scenario 2: Guest Access (Beginner)
**Situation:** Fabrikam needs to grant temporary access to an external contractor from a partner company.  
**Solution:** Invite the contractor as a **Guest user** in Microsoft Entra ID (B2B). When the contract ends, remove the guest account to revoke all access.  
**Key concept:** Guest users, B2B collaboration.

### Scenario 3: Choosing Between Entra ID and AD DS on Azure VM (Intermediate)
**Situation:** A team wants to use Kerberos authentication for an internal LOB app migrated to Azure VMs. They don't want to manage domain controllers.  
**Solution:** Enable **Microsoft Entra Domain Services** — provides Kerberos, LDAP, Group Policy without deploying or managing DCs.  
**Key concept:** Entra Domain Services vs. AD DS on Azure VM.

### Scenario 4: Privileged Identity Management (Intermediate)
**Situation:** A company's Global Administrator account is a permanent admin, raising security concerns about standing privilege.  
**Solution:** Use **Microsoft Entra Privileged Identity Management (PIM)** — requires P2. Configure the account as a *temporary* admin that activates with a justification and time limit.  
**Key concept:** PIM, P2 licensing, just-in-time access.

### Scenario 5: Tenant and Subscription Association (Intermediate)
**Situation:** Contoso has three Azure subscriptions across two business units. They want all subscriptions to use the same set of user accounts.  
**Solution:** Associate all three subscriptions with the same Microsoft Entra tenant. Users and groups in that tenant can be granted access across all subscriptions.  
**Key concept:** One-to-many relationship between tenant and subscriptions.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** Microsoft Entra ID is a **PaaS** service — Microsoft manages it; customers do not deploy domain controllers.

> 🎯 **[TESTABLE – Beginner]** An Azure subscription is associated with **exactly one** Microsoft Entra tenant.

> 🎯 **[TESTABLE – Beginner]** The **same Microsoft Entra tenant** can be associated with **multiple Azure subscriptions**.

> 🎯 **[TESTABLE – Beginner]** The three identity types in Entra ID are: **Cloud identities**, **Directory-synchronised identities**, and **Guest users**.

> 🎯 **[TESTABLE – Beginner]** Microsoft Entra ID uses **SAML, WS-Federation, OpenID Connect** for authentication — NOT Kerberos.

> 🎯 **[TESTABLE – Intermediate]** Microsoft Entra ID has **no OU class** and **no GPO support** — management uses groups and Conditional Access instead.

> 🎯 **[TESTABLE – Intermediate]** **Privileged Identity Management (PIM)** is a **P2-only** feature.

> 🎯 **[TESTABLE – Intermediate]** Microsoft Entra Domain Services provides **Kerberos, LDAP, Group Policy** without deploying domain controllers — requires P1 or P2.

> 🎯 **[TESTABLE – Intermediate]** **Password writeback** (SSPR syncing to on-premises AD) requires **P1 or P2**.

> 🎯 **[TESTABLE – Intermediate]** Microsoft Entra Domain Services does **NOT support** nested OUs, schema extensions, or WMI filter GPOs.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Microsoft Entra ID** | Microsoft's cloud-based identity and access management PaaS service (formerly Azure AD) |
| **Tenant** | An isolated instance of Microsoft Entra ID associated with an organisation |
| **Cloud identity** | A user that exists only in Microsoft Entra ID |
| **Directory-synchronised identity** | A user synchronised from on-premises AD DS via Microsoft Entra Connect |
| **Guest user** | An external user invited to access resources (B2B collaboration) |
| **Microsoft Entra Connect** | Tool to synchronise on-premises AD identities to Microsoft Entra ID |
| **Microsoft Entra Domain Services** | Managed domain services (Kerberos, LDAP, Group Policy) without deploying DCs |
| **PIM (Privileged Identity Management)** | P2 feature for just-in-time privileged access management |
| **Entra ID Protection** | P2 feature for detecting and responding to identity-based risks |
| **SSO (Single Sign-On)** | Capability allowing users to authenticate once to access multiple applications |
| **Federation** | Trust relationship between identity providers enabling cross-organisation authentication |

---

## 📝 Exam Tips

- Know the difference: **Entra ID ≠ AD DS** — different protocols, structure, and purpose
- Know the **four AD DS characteristics**: X.500 hierarchy, DNS, LDAP, Kerberos, OUs/GPOs
- Know the **Entra ID equivalents**: flat structure, REST API, SAML/OAuth, groups/Conditional Access
- **PIM and Identity Protection** = P2 only
- **SSPR with writeback** = requires P1 or P2
- **Entra Domain Services** = managed Kerberos/LDAP/Group Policy, no DCs needed, P1 or P2 required
- **One subscription → one tenant** but **one tenant → many subscriptions**

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
