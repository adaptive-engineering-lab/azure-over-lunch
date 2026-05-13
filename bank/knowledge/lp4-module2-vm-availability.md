# LP4 – Module 2: Configure Virtual Machine Availability

**Learning Path:** AZ-104 Deploy and Manage Azure Compute Resources  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~75 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/configure-virtual-machine-availability/

---

## 📋 Module Overview

This module covers the strategies for building highly available VM deployments in Azure: availability sets (update and fault domains), availability zones, vertical vs. horizontal scaling, Virtual Machine Scale Sets (VMSS), and autoscaling.

---

## 🎯 Learning Objectives

- Implement availability sets and availability zones
- Implement update and fault domains
- Implement Azure Virtual Machine Scale Sets
- Autoscale virtual machines

---

## 📖 Key Concepts & Detailed Notes

### 1. Types of Planned and Unplanned Downtime

Azure protects VMs against two types of events:

| Event Type | Description | Protection Mechanism |
|---|---|---|
| **Planned maintenance** | Microsoft updates to the Azure platform (host OS patching, hardware updates) | Update domains — only one updated at a time |
| **Unplanned downtime** | Unexpected hardware failures, network outages, power interruptions | Fault domains — VMs spread across separate physical racks |

---

### 2. Availability Sets

An **availability set** is a logical grouping of VMs that ensures they are distributed across multiple physical servers, compute racks, storage units, and network switches within a single datacentre.

**Key characteristics:**
- All VMs in an availability set should perform the **same set of functions** and have the **same software installed**
- A VM can only be added to an availability set **at creation time** — cannot be added after
- To move a VM to an availability set, you must **delete and recreate** the VM
- Availability sets do **NOT** protect against datacenter-level (zone) failures
- Availability sets are **free** — you only pay for the VM instances themselves

**What availability sets protect against:** Single server/rack failures within a datacentre

**What they do NOT protect against:** Zone-wide or region-wide outages

#### Designing with Availability Sets
- **Consider redundancy:** Place multiple VMs in each availability set
- **Consider tier separation:** Each application tier (web, app, database) should have its own availability set
- **Consider load balancing:** Pair with Azure Load Balancer to distribute traffic
- **Consider managed disks:** Use managed disks for storage fault domain alignment

---

### 3. Update Domains and Fault Domains

Availability sets implement two mechanisms:

#### Update Domains
- A group of VMs and hardware that can be **updated and rebooted at the same time** during planned maintenance
- During maintenance, only **one update domain is rebooted at a time**
- Configurable: **1 to 20 update domains** (default: **5**)
- **Immutable after creation** — cannot be changed without deleting and recreating the availability set

#### Fault Domains
- Represents a **physical unit of failure** — a server rack sharing power and networking
- VMs in different fault domains are on different physical racks
- Default: **2 fault domains** (some regions support 3)
- Protects against hardware failures, network outages, power interruptions

**Visual concept:**
```
Availability Set
├── Fault Domain 0 (Rack A)     ├── Fault Domain 1 (Rack B)
│   ├── VM1 (Update Domain 0)   │   ├── VM2 (Update Domain 1)
│   └── VM3 (Update Domain 2)   │   └── VM4 (Update Domain 3)
```

---

### 4. Availability Zones

**Availability zones (AZs)** are physically separate datacentres within an Azure region, each with independent power, cooling, and networking. They protect against datacenter-level failures.

**Key differences from Availability Sets:**

| Feature | Availability Sets | Availability Zones |
|---|---|---|
| **Scope** | Within a single datacenter | Across separate datacentres in a region |
| **Protects against** | Single rack/server failures | Datacenter-level failures |
| **SLA** | 99.95% | 99.99% |
| **Cost** | Free (pay for VMs only) | Possible data transfer costs between zones |

> 💡 Deploy VMs across all 3 availability zones in a region for maximum resilience within that region.

---

### 5. Vertical vs. Horizontal Scaling

| Scaling Type | Description | Azure Implementation |
|---|---|---|
| **Vertical scaling (scale up/down)** | Increase or decrease the size (power) of a single VM | Change VM size (requires reboot) |
| **Horizontal scaling (scale out/in)** | Add or remove VM instances | Virtual Machine Scale Sets + autoscaling |

**Vertical scaling limits:**
- Limited by the maximum available VM size in the region
- Requires VM reboot

**Horizontal scaling advantages:**
- Unlimited scale (up to VMSS maximums)
- No single points of failure
- Elasticity — can reduce instances during low demand

---

### 6. Azure Virtual Machine Scale Sets (VMSS)

**VMSS** allows you to deploy and manage a set of **identical VMs** that can automatically scale based on demand.

**Key characteristics:**
- All instances created from the **same base OS image and configuration** (Uniform mode)
- Supports **Azure Load Balancer** (Layer 4) and **Azure Application Gateway** (Layer 7 with TLS termination)
- No need to pre-provision VMs — scale out and in automatically
- Suitable for: large-scale compute, big data, containerised workloads

**Two orchestration modes:**

| Mode | Description |
|---|---|
| **Uniform** | All VM instances from the same base image and configuration. Optimised for stateless workloads. |
| **Flexible** | VMs can use different images, sizes, or configurations within the same scale set. More flexibility for diverse workloads. |

> ⚠️ Orchestration mode must be **chosen at creation** — cannot be changed later.

---

### 7. Autoscaling

Autoscaling automatically adjusts the number of VM instances in a VMSS based on demand.

**Two autoscale mechanisms:**

| Type | Trigger | Example |
|---|---|---|
| **Rule-based autoscale** | Metrics (CPU%, memory, custom metrics) | Scale out when CPU > 80% for 5 minutes |
| **Scheduled autoscale** | Time-based schedule | Scale out to 10 instances every Monday 8am |

**Autoscale configuration includes:**
- **Minimum instances** — Never scale below this number
- **Maximum instances** — Never scale above this number
- **Default instances** — Starting count
- **Scale-out rules** — When/how to add instances (scale out)
- **Scale-in rules** — When/how to remove instances (scale in)
- **Cooldown period** — Wait time after a scale event before evaluating again (prevents thrashing)

**Benefits of autoscaling:**
- Adjusts capacity to match demand (cost efficiency)
- Scales in during low demand (cost savings)
- Scheduled events for predictable load patterns (e.g., business hours)
- Reduces management overhead

> 💡 **Scenario:** Contoso's e-commerce site experiences 10x traffic every Friday evening. They configure autoscale rules to scale out at 5pm Friday based on CPU load and scale in at midnight when traffic subsides.

---

## 🧪 Scenario-Based Examples

### Scenario 1: Web Tier with Availability Set (Beginner)
**Situation:** Contoso runs 3 web servers. They need to ensure planned Azure maintenance doesn't take all web servers offline simultaneously.  
**Solution:** Place all 3 VMs in an **availability set** with at least 3 update domains. During maintenance, only one update domain (one VM) is rebooted at a time — the other 2 remain available.  
**Key concept:** Availability sets, update domains.

### Scenario 2: Fault Domain Protection (Beginner)
**Situation:** Contoso has 2 VMs in an availability set. The power supply for one server rack fails.  
**Question:** What happens if both VMs are in the same fault domain?  
**Answer:** Both VMs go offline — they share the same physical rack and power. With 2 fault domains, each VM should be in a **different fault domain** (different racks) so one remains available.  
**Key concept:** Fault domains protect against single-rack failures.

### Scenario 3: Availability Zone SLA (Intermediate)
**Situation:** A product team requires a minimum 99.99% SLA for their VM deployment.  
**Solution:** Deploy VMs across multiple **Availability Zones** (at least 2 zones). Availability sets only achieve 99.95% SLA; AZs provide 99.99%.  
**Key concept:** AZ SLA = 99.99% vs. Availability Set SLA = 99.95%.

### Scenario 4: VMSS for Elastic Web App (Intermediate)
**Situation:** Fabrikam's web application needs to handle variable traffic — quiet at night (2 VMs), busy during the day (10 VMs).  
**Solution:** Deploy a **VMSS with autoscaling rules**: scale out when CPU > 70% sustained for 5 minutes; scale in when CPU < 30% for 10 minutes. Set minimum = 2, maximum = 10 instances.  
**Key concept:** VMSS autoscaling, scale-out/scale-in rules.

### Scenario 5: Adding VM to Availability Set After Creation (Intermediate)
**Situation:** A junior admin wants to add an existing VM to an availability set for better resilience.  
**Answer:** This is **not possible** — VMs can only be added to an availability set **at creation time**. The VM must be deleted and recreated within the availability set.  
**Key concept:** Availability set membership is set at VM creation only.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** A VM can only be added to an availability set **at creation time** — not after.

> 🎯 **[TESTABLE – Beginner]** Default availability set configuration: **5 update domains**, **2 fault domains**.

> 🎯 **[TESTABLE – Beginner]** Update domains: **1–20** configurable (default 5); **immutable after creation**.

> 🎯 **[TESTABLE – Beginner]** Availability sets protect against **single rack/server failures** but NOT datacenter-level outages.

> 🎯 **[TESTABLE – Intermediate]** **Availability Sets SLA = 99.95%**; **Availability Zones SLA = 99.99%**.

> 🎯 **[TESTABLE – Intermediate]** VMSS **orchestration mode** (Uniform or Flexible) must be chosen at creation — **cannot be changed later**.

> 🎯 **[TESTABLE – Intermediate]** VMSS supports **Azure Load Balancer** (Layer 4) and **Azure Application Gateway** (Layer 7).

> 🎯 **[TESTABLE – Intermediate]** Autoscale **cooldown period** prevents thrashing by waiting before evaluating rules after a scale event.

> 🎯 **[TESTABLE – Intermediate]** **Vertical scaling** = change VM size (requires reboot); **Horizontal scaling** = add/remove instances (VMSS).

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **Availability set** | Logical grouping ensuring VMs are distributed across fault and update domains within a datacenter |
| **Update domain** | Group of VMs rebooted together during planned maintenance; only one rebooted at a time |
| **Fault domain** | Group of VMs sharing a physical rack (single point of failure for power/networking) |
| **Availability zone** | Physically separate datacenter within a region with independent power, cooling, networking |
| **Vertical scaling** | Increasing or decreasing the size/power of a single VM |
| **Horizontal scaling** | Adding or removing VM instances |
| **VMSS (Virtual Machine Scale Sets)** | Azure service to deploy and manage a set of identical, auto-scaling VMs |
| **Autoscaling** | Automatically adjusting VM instance count based on metrics or schedules |
| **Uniform orchestration** | VMSS mode where all instances use the same base image and configuration |
| **Flexible orchestration** | VMSS mode allowing different images, sizes, or configurations within the same set |
| **Cooldown period** | Time to wait after a scale event before evaluating autoscale rules again |

---

## 📝 Exam Tips

- **Availability sets = same datacenter resilience** (racks); **Availability zones = cross-datacenter resilience**
- **SLA: Sets = 99.95%, Zones = 99.99%**
- Default fault domains = **2**, update domains = **5** (max 20)
- **VMs cannot be added to availability sets after creation** — must delete and recreate
- Update domain count is **immutable** after availability set creation
- VMSS orchestration mode is **immutable** after creation
- Know the difference: **scale up/down = vertical; scale out/in = horizontal**
- **Autoscale rules use metrics** (CPU, memory, custom); can also use **scheduled events**

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
