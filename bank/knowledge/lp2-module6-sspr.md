# LP2 – Module 6: Self-Service Password Reset (SSPR)

**Learning Path:** AZ-104 Manage Identities and Governance in Azure  
**Difficulty:** 🟢 Beginner  
**Estimated Study Time:** ~40 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/allow-users-reset-their-password/

---

## 📋 Module Overview

Microsoft Entra Self-Service Password Reset (SSPR) allows users to reset their own passwords or unlock their accounts without calling the help desk. This module covers when to use SSPR, how it works, the authentication methods available, and configuration options.

---

## 🎯 Learning Objectives

- Decide whether to implement self-service password reset
- Implement SSPR to meet your requirements
- Configure SSPR to customise the experience

---

## 📖 Key Concepts & Detailed Notes

### 1. What is SSPR and Why Use It?

**Problem:** Users forget passwords, passwords expire, or they get locked out. Traditional process requires calling the help desk, which is slow and costly.

**SSPR solution:** Users reset their own passwords through a web browser or the Windows sign-in screen — without admin involvement.

**Benefits:**
- **Reduces help desk costs** — fewer password reset tickets
- **Reduces productivity impact** — users regain access immediately
- **Supports multiple entry points** — web browser, Windows sign-in screen

**Where SSPR works:** Azure, Microsoft 365, and any application using Microsoft Entra ID for authentication.

---

### 2. How SSPR Works — Step by Step

1. **Localization** — The portal detects the browser locale and displays the SSPR page in the correct language
2. **Verification** — The user enters their username and solves a CAPTCHA (proves they are human)
3. **Authentication** — The user proves their identity using one or more registered authentication methods
4. **Password reset** — The user enters and confirms a new password
5. **Notification** — A confirmation message is sent to the user

---

### 3. Authentication Methods for SSPR

Azure supports **six authentication methods** for SSPR. Administrators choose which methods to enable.

| Method | Registration | How Used for Reset |
|---|---|---|
| **Mobile app notification** | Install and register Microsoft Authenticator app | Azure sends a push notification; user approves or denies |
| **Mobile app code** | Install and register Microsoft Authenticator app | User enters the TOTP code shown in the app |
| **Email** | Provide external email address (not Microsoft 365 email) | Azure sends a code to the address; user enters it |
| **Mobile phone (SMS)** | Provide mobile number | Azure sends an SMS code; user enters it |
| **Office phone (call)** | Provide landline number | Azure makes an automated call; user presses # |
| **Security questions** | Choose and answer predefined questions | User answers the questions correctly |

> ⚠️ **Phone call options are not supported in trial Entra organisations.**

#### Minimum Number of Methods
Administrators configure the **minimum number of methods** users must register to be considered registered for SSPR:
- **1 method** — easier for users, less secure
- **2 methods** — recommended for better security

Users are **considered registered** when they've set up the minimum required number of methods.

#### Security Recommendations for Authentication Methods

| Priority | Method | Notes |
|---|---|---|
| ✅ Best | Mobile app notification / code | Strongest security; requires smartphone |
| ✅ Good | Email / Office phone | Good fallback for users without smartphones |
| ⚠️ Caution | Mobile phone (SMS) | Susceptible to SIM swapping and SMS spoofing |
| ❌ Weakest | Security questions | Answers may be known to others; only use in combination with another method |

> 🔒 **Administrator accounts** always require **two authentication methods** regardless of the general organisation configuration. Security questions are **NOT available** for administrator accounts.

---

### 4. SSPR Licence Requirements

| Scenario | Licence Required |
|---|---|
| Signed-in users changing their own password | Any Entra ID edition (Free) |
| SSPR for forgotten/expired passwords | **Entra ID P1 or P2**, or Microsoft 365 Apps for Business |
| SSPR with **password writeback** (hybrid environments) | **Entra ID P1 or P2**, or Microsoft 365 Apps for Business |

> 🔑 **Password writeback** synchronises password changes made in the cloud back to on-premises Active Directory, following the on-premises password policy.

---

### 5. SSPR Deployment Options (Hybrid Environments)

In hybrid environments (on-premises AD + Entra ID), password changes must be **written back** to the on-premises directory.

Two deployment options for password writeback:

| Option | Description | Best For |
|---|---|---|
| **Microsoft Entra Connect** | Traditional sync agent installed on-premises | Existing deployments, device sync, large groups (>50K) |
| **Cloud Sync** | Lightweight cloud-managed agent | Multi-forest, disconnected domains, higher availability (no single point of failure) |

Both options can run **side-by-side** in different domains — useful for organisations that have merged or split.

> 💡 **Scenario:** Contoso has a head office using Entra Connect for sync, and a recently acquired subsidiary in a separate disconnected domain. They deploy Cloud Sync for the subsidiary's domain while keeping Entra Connect for the head office.

---

### 6. Notifications Configuration

Administrators can configure two notification options:

| Option | Description |
|---|---|
| **Notify users on password resets** | The user receives a notification when their password is reset (alerts them if a malicious actor reset it) |
| **Notify all admins when other admins reset their password** | All administrators are notified when any admin resets a password |

---

### 7. Customisation Options

SSPR supports customisation:
- Add **company logo** to the sign-in/reset page
- Add **custom help text** or **custom help URL** (link to internal IT portal)
- On-premises **branded sign-in page** via Entra branding settings

---

## 🧪 Scenario-Based Examples

### Scenario 1: Reducing Help Desk Costs (Beginner)
**Situation:** Fabrikam's help desk handles 200 password reset tickets per month. Each ticket costs £10 in staff time.  
**Solution:** Implement SSPR — users reset their own passwords through the portal or Windows sign-in screen. Estimated reduction: 80%+ of password reset tickets.  
**Key concept:** SSPR business value, help desk cost reduction.

### Scenario 2: Choosing Authentication Methods (Beginner)
**Situation:** Contoso enables SSPR and wants to choose two methods. Their workforce is mixed — some have smartphones, some only have office phones.  
**Solution:** Enable **mobile app code** (for smartphone users) and **office phone** (for those without smartphones). Require a minimum of 1 method. Avoid security questions as the sole method.  
**Key concept:** Authentication methods, coverage for different user types.

### Scenario 3: Administrator Account SSPR (Intermediate)
**Situation:** A Global Administrator forgets their password. They've only registered one SSPR method.  
**Question:** Can they reset using SSPR?  
**Answer:** No. Administrator accounts always require **two authentication methods**, regardless of the general configuration. They must use the two methods they've registered. If only one is registered, they cannot use SSPR.  
**Key concept:** Administrator accounts require 2 methods; security questions not available for admins.

### Scenario 4: Hybrid Password Writeback (Intermediate)
**Situation:** A user resets their password via SSPR in the cloud. The next morning they try to sign in to their on-premises Windows workstation with the new password, but it fails.  
**Question:** What is the likely cause?  
**Answer:** **Password writeback** is not configured. The new password exists in Entra ID (cloud) but has not been written back to on-premises Active Directory. The workstation is authenticating against on-premises AD, which still has the old password.  
**Solution:** Enable password writeback via Entra Connect or Cloud Sync.  
**Key concept:** Password writeback, hybrid environment.

### Scenario 5: SMS vs. App Recommendation (Intermediate)
**Situation:** Contoso's CISO wants to maximise SSPR security. They ask whether SMS (mobile phone) is a good primary method.  
**Answer:** No — SMS is susceptible to SIM swapping and SMS spoofing attacks. The recommended primary method is **mobile app notification or code** (Microsoft Authenticator). SMS should only be used as a fallback.  
**Key concept:** Security recommendations for authentication methods.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** SSPR for forgotten/expired passwords requires **Entra ID P1, P2, or Microsoft 365 Apps for Business** — not the Free tier.

> 🎯 **[TESTABLE – Beginner]** A user is considered **registered for SSPR** when they've set up the **minimum number of required methods** (not just any one method).

> 🎯 **[TESTABLE – Beginner]** SSPR supports **six authentication methods**: mobile app notification, mobile app code, email, mobile phone (SMS), office phone, security questions.

> 🎯 **[TESTABLE – Beginner]** **Security questions** are the least recommended method — answers may be known to others.

> 🎯 **[TESTABLE – Intermediate]** **Administrator accounts** always require **two authentication methods** for SSPR, regardless of general policy.

> 🎯 **[TESTABLE – Intermediate]** **Security questions** are **NOT available** for administrator accounts.

> 🎯 **[TESTABLE – Intermediate]** **Password writeback** synchronises cloud password changes to on-premises AD — requires **P1 or P2**.

> 🎯 **[TESTABLE – Intermediate]** **Cloud Sync** provides higher availability than Entra Connect for writeback — no single instance dependency.

> 🎯 **[TESTABLE – Intermediate]** The **"Notify users on password resets"** notification alerts the user if someone else (e.g., a malicious actor) reset their password.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **SSPR (Self-Service Password Reset)** | Feature allowing users to reset passwords without help desk involvement |
| **Password writeback** | Synchronisation of cloud password changes back to on-premises Active Directory |
| **Microsoft Authenticator** | Mobile app used for MFA and SSPR authentication (notification and code methods) |
| **Authentication method** | A way users verify their identity for SSPR (app, email, SMS, phone, security questions) |
| **Minimum methods** | The number of authentication methods a user must register to be eligible for SSPR |
| **Microsoft Entra Connect** | On-premises sync agent connecting AD DS to Entra ID; supports password writeback |
| **Cloud Sync** | Lightweight cloud-managed agent for syncing AD DS to Entra ID; supports password writeback with higher availability |
| **CAPTCHA** | Challenge response used during SSPR to verify the user is human |
| **Notification** | Email alert sent to users or admins when a password reset occurs |

---

## 📝 Exam Tips

- **Free tier** does NOT support SSPR for forgotten passwords — requires **P1/P2** or Microsoft 365
- **Admin accounts = always 2 methods**, no exceptions, no security questions
- **Security questions** = weakest method; only use in combination with another method
- **Password writeback** = essential in hybrid environments; without it, cloud resets don't affect on-premises auth
- **Mobile app (notification/code)** = strongest methods; SMS = least recommended after security questions
- Know the **5 SSPR steps**: Localisation → Verification → Authentication → Reset → Notification

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
