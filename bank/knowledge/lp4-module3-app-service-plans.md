# LP4 – Module 3: Configure Azure App Service Plans

**Learning Path:** AZ-104 Deploy and Manage Azure Compute Resources  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~45 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/configure-app-service-plans/

---

## 📋 Module Overview

An Azure App Service plan defines the compute resources for running web apps. This module covers App Service plan tiers, scaling options, and how to choose the right plan for your workload.

---

## 🎯 Learning Objectives

- Select an appropriate Azure App Service plan pricing tier
- Scale an Azure App Service plan

---

## 📖 Key Concepts & Detailed Notes

### 1. What is an App Service Plan?

An **App Service plan** defines:
- **Operating system** — Linux or Windows
- **Region** — Where the compute resources are located
- **Pricing tier** — Determines features and cost
- **Number of VM instances** — How many instances to run
- **Size of VM instances** — CPU, memory, storage

Multiple applications can share a single App Service plan and run on the same compute resources. All apps in the plan scale together.

> 💡 **Analogy:** An App Service plan is like a server farm — the plan defines the hardware and all apps on that farm share it.

---

### 2. App Service Plan Pricing Tiers

Tiers are grouped into three categories:

#### Shared Compute (Free and Shared)
- Apps run on the **same Azure VMs as other customers' apps**
- CPU quotas allocated per app — **cannot scale out**
- **No SLA provided**
- Intended for **development and testing only**
- Billed per application (not per plan)

#### Dedicated Compute (Basic, Standard, Premium, PremiumV2, PremiumV3)
- Apps run on **dedicated Azure VMs**
- Only apps in the same plan share compute resources
- Higher tiers = more VM instances available for scale-out
- Includes features like **auto scale, deployment slots, daily backups**

#### Isolated (Isolated, IsolatedV2)
- Apps run on **dedicated VMs in dedicated Azure Virtual Networks**
- Provides **network isolation** on top of compute isolation
- **Maximum scale-out capabilities** (up to 200 instances with IsolatedV2)
- For **mission-critical, network-isolated workloads**

#### Tier Comparison Table

| Feature | Free F1 | Basic B1 | Standard S1 | Premium P1V3 | Isolated V2 |
|---|---|---|---|---|---|
| **Usage** | Dev/Test | Dev/Test | Production | Enhanced performance | Network-isolated |
| **SLA** | None | ✅ | ✅ | ✅ | ✅ |
| **Deployment slots** | None | None | 5 | 20 | 20 |
| **Auto scale** | None | Manual only | Rule-based | Rules + Elastic | Rule-based |
| **Max scale instances** | None | 3 | 10 | 30 | 200 |
| **Daily backups** | None | None | 10/day | 50/day | 50/day |
| **Custom domains** | ❌ | ✅ | ✅ | ✅ | ✅ |

> ⚠️ **Free and Shared tiers have no SLA** — do not use for production.
> ⚠️ Deployment slots require **Standard tier or higher**.
> ⚠️ Auto scale requires **Standard tier or higher**.

---

### 3. Scaling App Service Plans

#### Scale Up (Vertical Scaling)
- Move to a **higher pricing tier** to get more CPU, memory, disk space, and features
- Example: Basic B1 → Standard S1 to enable deployment slots

#### Scale Out (Horizontal Scaling)
- **Increase the number of VM instances** running your app
- Manual: Set a fixed instance count
- Automatic: Configure **autoscale rules** based on metrics (CPU, memory, HTTP queue length, custom metrics)
- Scheduled: Increase instances at specific times

**Autoscale configuration (Standard and above):**
- **Scale-out rule:** e.g., if CPU > 70% for 10 minutes, add 1 instance
- **Scale-in rule:** e.g., if CPU < 30% for 15 minutes, remove 1 instance
- **Minimum/maximum instances** — boundaries for autoscaling
- **Cooldown period** — wait time between scale operations

---

### 4. App Service Plan Considerations

| Consideration | Description |
|---|---|
| **Cost savings** | Multiple apps in one plan share compute — reduces per-app cost |
| **Multiple apps** | One plan can host many apps (as long as resources are sufficient) |
| **Plan capacity** | Monitor plan CPU, memory before adding apps — overloading causes downtime |
| **Application isolation** | Create a new plan when: app is resource-intensive; needs independent scaling; needs resources in a different region |

> ⚠️ **Overloading an App Service plan** (too many apps sharing resources) can cause downtime for all apps on that plan.

---

## 🧪 Scenario-Based Examples

### Scenario 1: Dev and Prod on the Same Plan (Beginner)
**Situation:** A developer wants to run both a dev and prod web app on the same App Service plan to save costs.  
**Risk:** If the dev app consumes excessive CPU/memory, it can degrade the production app.  
**Best Practice:** Keep production apps on a separate plan from dev/test.  
**Key concept:** App isolation, plan capacity management.

### Scenario 2: Enabling Deployment Slots (Intermediate)
**Situation:** A team wants to use deployment slots for staging before swapping to production.  
**Requirement:** The App Service plan must be **Standard tier or higher** — deployment slots are not available on Free or Basic tiers.  
**Key concept:** Deployment slots require Standard or above.

### Scenario 3: Autoscaling for Variable Traffic (Intermediate)
**Situation:** Contoso's web app receives 5x traffic during business hours (9am–5pm).  
**Solution:** Configure **scheduled autoscale** to increase to 5 instances at 9am and reduce to 1 instance at 6pm. Add **metric-based rules** as backup for unexpected spikes.  
**Key concept:** Autoscale (Standard+), scheduled + metric-based rules.

### Scenario 4: Mission-Critical Isolated App (Intermediate)
**Situation:** A financial services firm needs their trading app isolated on dedicated network infrastructure to meet regulatory requirements.  
**Solution:** Use the **Isolated V2 (IsolatedV2)** App Service plan — runs in a dedicated VNet with network isolation and supports up to 200 instances.  
**Key concept:** Isolated tier for network isolation, regulatory compliance.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** **Free and Shared** tiers have **no SLA** and cannot scale out — for dev/test only.

> 🎯 **[TESTABLE – Beginner]** All apps in an App Service plan **share the same compute resources** and **scale together**.

> 🎯 **[TESTABLE – Intermediate]** **Deployment slots** require **Standard tier or higher** (Standard = 5 slots, Premium = 20, Isolated = 20).

> 🎯 **[TESTABLE – Intermediate]** **Autoscale** requires **Standard tier or higher**.

> 🎯 **[TESTABLE – Intermediate]** **Isolated tier** provides network isolation via a dedicated VNet — for mission-critical, compliance-sensitive workloads.

> 🎯 **[TESTABLE – Intermediate]** **Maximum instances**: Basic = 3, Standard = 10, Premium = 30, Isolated V2 = **200**.

> 🎯 **[TESTABLE – Intermediate]** Scale **up** = move to higher tier (more power); Scale **out** = add more VM instances.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **App Service plan** | Defines the compute resources (OS, region, tier, instance count) for hosting web apps |
| **Shared compute tier** | Free/Shared — apps run on shared VMs with other customers; no SLA; dev/test only |
| **Dedicated compute tier** | Basic/Standard/Premium — apps run on dedicated VMs; SLA provided |
| **Isolated tier** | Apps run in dedicated VMs within a dedicated VNet; network + compute isolation |
| **Scale up** | Moving to a higher pricing tier for more CPU, memory, features |
| **Scale out** | Adding VM instances to the App Service plan |
| **Autoscale** | Automatically adjusting instance count based on metrics or schedules |
| **Deployment slot** | Live staging environment for zero-downtime deployments (Standard+ required) |

---

## 📝 Exam Tips

- **Free/Shared = no SLA, no scale out, dev/test only**
- **Deployment slots + autoscale = Standard tier minimum**
- **Isolated = dedicated VNet** for network isolation (regulatory compliance)
- All apps in a plan **scale together** — a single autoscale action affects all apps in the plan
- **Max instances**: Standard = 10, Premium = 30, Isolated V2 = 200
- Know the three tier categories: **Shared (Free/Shared) → Dedicated (Basic/Standard/Premium) → Isolated**

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
