# LP3 – Module 3: Configure Azure Storage Security

**Learning Path:** AZ-104 Implement and Manage Storage in Azure  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~60 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/configure-storage-security/

---

## 📋 Module Overview

Azure Storage provides multiple layers of security to protect data. This module covers shared access signatures (SAS), storage encryption, customer-managed keys, and security best practices.

---

## 🎯 Learning Objectives

- Configure a shared access signature (SAS) including URI and SAS parameters
- Configure Azure Storage encryption
- Implement customer-managed keys
- Recommend opportunities to improve Azure Storage security

---

## 📖 Key Concepts & Detailed Notes

### 1. Azure Storage Security Overview

Azure Storage supports multiple authorisation mechanisms:

| Method | Description | Best For |
|---|---|---|
| **Microsoft Entra ID (RBAC)** | Role-based access using Entra identities | Human users, service principals with full access management |
| **Shared Key (Account Key)** | Full account-level access using 512-bit account keys | Internal services; avoid exposing externally |
| **Shared Access Signature (SAS)** | Delegated, time-limited access with restricted permissions | Granting limited external access without sharing account keys |
| **Anonymous public access** | No authentication — publicly readable containers | Public static content only |

> ⚠️ Microsoft recommends using **Entra ID (RBAC)** where possible. Shared keys grant full account access and should be protected carefully.

---

### 2. Storage Account Access Keys

When a storage account is created, Azure generates **two 512-bit storage account access keys** (key1 and key2).

**Why two keys?**
- Allows **key rotation** without downtime — switch to key2, regenerate key1, switch back to key1, regenerate key2.
- Both keys provide **full access** to the storage account.

**Best practices for access keys:**
- Store keys in **Azure Key Vault** (not in application code)
- Configure **automatic key rotation** via Key Vault (e.g., every 90 days)
- Use **Entra ID + RBAC** as the preferred authentication method instead of keys
- In the portal, you can configure the **Default to Microsoft Entra ID authorization** setting for the portal experience

---

### 3. Shared Access Signatures (SAS)

A **SAS** is a URI that grants **restricted, time-limited** access to Azure Storage resources without sharing the full account key.

**Three types of SAS:**

| SAS Type | Secured By | Scope | Use Case |
|---|---|---|---|
| **User delegation SAS** | Microsoft Entra credentials + permissions | Blob Storage and Data Lake only | Most secure; recommended when possible |
| **Account-level SAS** | Account key | Storage account level | Access to multiple services or account-level operations (e.g., create containers) |
| **Service-level SAS** | Account key | Specific resource (container, blob, queue, table) | Granting access to a specific resource |

**Stored Access Policy:** An additional control layer for **service-level SAS** — groups SAS tokens and allows revocation without regenerating account keys.

#### Key SAS Parameters

A SAS URI contains several parameters:

| Parameter | Description |
|---|---|
| `sp` (signedPermissions) | Permissions: r=read, w=write, d=delete, l=list, etc. |
| `sv` (signedVersion) | Storage service version |
| `sr` (signedResource) | Resource type: b=blob, c=container, s=share, etc. |
| `se` (signedExpiry) | Expiry datetime |
| `st` (signedStart) | Start datetime (optional) |
| `sip` (signedIP) | IP address or range allowed to use the SAS |
| `spr` (signedProtocol) | Require HTTPS only |
| `sig` (signature) | HMAC signature for authentication |

#### SAS Security Recommendations

| Recommendation | Why |
|---|---|
| **Always use HTTPS** for SAS distribution | Prevents man-in-the-middle attacks intercepting the SAS token |
| **Use stored access policies** where possible | Allows revocation without regenerating account keys |
| **Set near-term expiry** for unplanned SAS | Limits damage window if a SAS is compromised |
| **Require clients to auto-renew** before expiry | Avoids service disruption when SAS expires |
| **Set start time 15 minutes in the past** | Accounts for clock skew between machines |
| **Define minimum required permissions** | Limits damage if SAS is compromised (principle of least privilege) |
| **Validate data written via SAS** | Prevents corrupt or malicious data from being written |
| **SAS isn't always the right choice** | For some high-risk operations, use a middle-tier service with full authentication instead |

---

### 4. Azure Storage Encryption

All Azure Storage data is **always encrypted at rest** — this cannot be disabled.

**Encryption details:**
- Encryption algorithm: **256-bit AES** (one of the strongest block ciphers available)
- Encryption and decryption are **transparent** — no code changes needed
- Applies to ALL new and existing storage accounts

**Two encryption options:**

| Option | Description |
|---|---|
| **Platform-managed keys (PMK)** | Keys generated, stored, and managed entirely by Microsoft. Default option. |
| **Customer-managed keys (CMK)** | Keys stored and managed by the customer in Azure Key Vault or a Hardware Security Module (HSM). |

**BYOK (Bring Your Own Key):** A CMK scenario where the customer imports keys from an external location into Azure Key Vault.

**Infrastructure encryption:** An optional additional layer — data is encrypted **twice**:
1. At the **service level** (standard Azure Storage encryption)
2. At the **infrastructure level** (different algorithm and keys)

> 💡 Use infrastructure encryption for **double encryption** to meet specific regulatory or compliance requirements.

---

### 5. Customer-Managed Keys (CMK)

CMKs give organisations control over their encryption keys:

**Benefits:**
- Revoking the key immediately prevents access to all encrypted data
- Audit key usage in Key Vault logs
- Bring Your Own Key (BYOK) from on-premises HSMs

**Requirements:**
- Azure Key Vault (or Managed HSM) must be in the **same region** as the storage account
- Key must be **RSA** type (2048, 3072, or 4096-bit)
- Key Vault must have **soft delete** and **purge protection** enabled

---

### 6. Storage Security Best Practices

| Practice | Description |
|---|---|
| **Enable secure transfer required** | Forces all connections to use HTTPS — rejects HTTP requests |
| **Use Entra ID + RBAC over access keys** | RBAC provides fine-grained access control without exposing master keys |
| **Enable firewall and VNet rules** | Restrict storage access to specific IP ranges or VNets |
| **Use private endpoints** | Route traffic through Azure Private Link — not the public internet |
| **Enable soft delete** | Protects against accidental blob/container deletion (recoverable within retention period) |
| **Enable versioning** | Maintain previous blob versions for recovery |
| **Enable Storage Analytics logging** | Log all read, write, and delete operations for auditing |
| **Rotate access keys regularly** | Use Key Vault for automatic key rotation |
| **Minimise anonymous access** | Disable public container access unless explicitly required |

---

## 🧪 Scenario-Based Examples

### Scenario 1: SAS for External Partner (Beginner)
**Situation:** Contoso needs to give a vendor read-only access to a specific blob container for 48 hours, without sharing the account key.  
**Solution:** Generate a **service-level SAS** with `r` (read) and `l` (list) permissions, scoped to the specific container, with an expiry 48 hours from now. Distribute the SAS URI via HTTPS only.  
**Key concept:** Service-level SAS, minimum permissions, expiry.

### Scenario 2: Revoking SAS Access (Intermediate)
**Situation:** A SAS token was accidentally leaked. The SAS was created using a service-level SAS backed by a **stored access policy**.  
**Solution:** Update or delete the **stored access policy** — all SAS tokens referencing that policy are immediately invalidated.  
**Alternative:** If no stored access policy was used, regenerate the storage account key used to sign the SAS. All SAS tokens signed with that key become invalid.  
**Key concept:** Stored access policies enable SAS revocation without key regeneration.

### Scenario 3: Encryption Key Control for Compliance (Intermediate)
**Situation:** A financial services company must demonstrate they have full control over encryption keys for regulatory compliance.  
**Solution:** Use **Customer-managed keys (CMK)** stored in Azure Key Vault. The company can revoke the key at any time, immediately preventing access to all data. Key usage is logged in Key Vault.  
**Key concept:** CMK, BYOK, compliance.

### Scenario 4: Clock Skew Issue with SAS (Intermediate)
**Situation:** A developer creates a SAS with a start time of "now" and distributes it. Some clients report that the SAS is invalid for the first few minutes.  
**Cause:** **Clock skew** — different machines have slightly different time settings. The storage service may think the SAS is not yet valid.  
**Solution:** Set the SAS **start time to 15 minutes in the past** to account for clock skew.  
**Key concept:** Clock skew, SAS start time best practice.

### Scenario 5: Forced HTTPS (Beginner)
**Situation:** Contoso discovers some legacy applications are connecting to their storage account over HTTP, transmitting data unencrypted in transit.  
**Solution:** Enable **Secure transfer required** on the storage account. This rejects all HTTP connections and forces HTTPS.  
**Key concept:** Secure transfer required, encryption in transit.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** Azure Storage data is always encrypted at rest using **256-bit AES** — cannot be disabled.

> 🎯 **[TESTABLE – Beginner]** Azure Storage generates **two 512-bit access keys** per account for key rotation without downtime.

> 🎯 **[TESTABLE – Beginner]** A **SAS** (Shared Access Signature) grants **restricted, time-limited** access without sharing the account key.

> 🎯 **[TESTABLE – Beginner]** **User delegation SAS** is secured by **Microsoft Entra credentials** — most secure SAS type.

> 🎯 **[TESTABLE – Intermediate]** **Stored access policies** allow SAS revocation without regenerating account keys.

> 🎯 **[TESTABLE – Intermediate]** Set SAS **start time 15 minutes in the past** to account for clock skew between client and server.

> 🎯 **[TESTABLE – Intermediate]** **Customer-managed keys (CMK)** are stored in **Azure Key Vault** — give the customer full control over encryption keys.

> 🎯 **[TESTABLE – Intermediate]** **Infrastructure encryption** encrypts data **twice** — at service level and infrastructure level using different algorithms and keys.

> 🎯 **[TESTABLE – Intermediate]** **Secure transfer required** forces all storage account connections to use **HTTPS** only.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **SAS (Shared Access Signature)** | A URI granting restricted, time-limited access to storage resources without the account key |
| **User delegation SAS** | SAS secured by Microsoft Entra credentials (most secure) |
| **Account-level SAS** | SAS signed with account key; grants access at account scope |
| **Service-level SAS** | SAS signed with account key; grants access to a specific service resource |
| **Stored access policy** | Server-side policy grouping SAS tokens; enables revocation without key regeneration |
| **Access key** | 512-bit key providing full account access; two keys per account for rotation |
| **PMK (Platform-managed keys)** | Encryption keys generated and managed by Microsoft |
| **CMK (Customer-managed keys)** | Encryption keys managed by the customer in Azure Key Vault |
| **BYOK (Bring Your Own Key)** | CMK scenario where customer imports external keys into Azure Key Vault |
| **Infrastructure encryption** | Double encryption at both service and infrastructure layers |
| **Secure transfer required** | Storage account setting forcing all connections to use HTTPS |
| **Azure Key Vault** | Managed service for storing and managing cryptographic keys and secrets |

---

## 📝 Exam Tips

- **Always AES-256 encryption at rest** — cannot be disabled, always on
- **Two access keys** = enables zero-downtime key rotation
- **User delegation SAS > Account SAS > Service SAS** in security strength
- **Stored access policies** = the way to revoke SAS without key regeneration
- **SAS start time = 15 minutes in the past** to handle clock skew
- **CMK = customer control over encryption keys** (stored in Key Vault)
- **Infrastructure encryption = double encryption** (extra compliance layer)
- Know all **SAS URI parameters**: sp (permissions), se (expiry), sr (resource), sig (signature)

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
