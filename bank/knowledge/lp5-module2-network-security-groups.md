# LP5 – Module 2: Configure Network Security Groups

**Learning Path:** AZ-104 Configure and Manage Virtual Networks for Azure Administrators  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~60 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/configure-network-security-groups/

---

## 📋 Module Overview

Network Security Groups (NSGs) are the primary mechanism for filtering network traffic in Azure VNets. This module covers NSG rules, effective rules, association with subnets and NICs, and Application Security Groups.

---

## 🎯 Learning Objectives

- Determine when to use network security groups
- Create network security groups
- Implement and evaluate network security group rules
- Describe the function of application security groups

---

## 📖 Key Concepts & Detailed Notes

### 1. What is a Network Security Group?

An **NSG** is a software firewall containing a list of **security rules** that allow or deny inbound or outbound network traffic to/from Azure resources.

**NSG association:**
- Associated to a **subnet** — applies rules to all resources in the subnet
- Associated to a **network interface (NIC)** — applies rules to the specific VM
- Can be associated to **multiple subnets and NICs**

**NSG limits:**
- Each subnet: maximum **1 NSG**
- Each NIC: zero or **1 NSG**
- Same NSG can be associated to multiple subnets and NICs

**Subnet NSG use:** Create a **DMZ (demilitarized zone)** — screened subnet acting as a buffer between resources and the internet.

---

### 2. Default Security Rules

Azure automatically creates **default rules** in every NSG that cannot be removed. They can be overridden by creating rules with higher priority (lower priority number).

**Default Inbound Rules:**

| Priority | Name | Source | Destination | Action |
|---|---|---|---|---|
| 65000 | AllowVNetInbound | VirtualNetwork | VirtualNetwork | **Allow** |
| 65001 | AllowAzureLoadBalancerInbound | AzureLoadBalancer | Any | **Allow** |
| 65500 | DenyAllInbound | Any | Any | **Deny** |

**Default Outbound Rules:**

| Priority | Name | Source | Destination | Action |
|---|---|---|---|---|
| 65000 | AllowVNetOutbound | VirtualNetwork | VirtualNetwork | **Allow** |
| 65001 | AllowInternetOutbound | Any | Internet | **Allow** |
| 65500 | DenyAllOutbound | Any | Any | **Deny** |

> 🔑 Default behaviour: **All inbound traffic is denied** except from within the VNet and Azure Load Balancer. **Outbound internet traffic is allowed** by default.

---

### 3. Security Rule Properties

Each NSG rule has the following configurable properties:

| Property | Description |
|---|---|
| **Name** | Unique name within the NSG |
| **Priority** | Number between **100 and 4096** — lower = higher priority; rules processed in priority order |
| **Source** | Any, IP address(es)/CIDR, My IP, Service Tag, Application Security Group |
| **Source port ranges** | Port(s) the rule applies to on the source side |
| **Destination** | Any, IP address(es)/CIDR, Service Tag, Application Security Group |
| **Destination port ranges** | Port(s) the rule targets on the destination side |
| **Protocol** | TCP, UDP, ICMP, ESP, AH, or Any |
| **Action** | Allow or Deny |

**Priority processing:**
- Rules processed from lowest priority number (highest priority) to highest number
- The first matching rule is applied — subsequent rules are NOT evaluated
- You cannot remove default rules, but you CAN override them with a rule that has a lower priority number

**Example:** To block all outbound internet traffic (override the default `AllowInternetOutbound` rule at priority 65001):
- Create a rule: Priority **1000**, Direction Outbound, Destination Internet, Action **Deny**
- This rule (1000) is processed before 65001, effectively blocking outbound internet

---

### 4. Effective NSG Rules

When an NSG is associated to both a **subnet** and a **NIC**, traffic must pass through **both NSGs**:

**Inbound traffic flow:**
1. Traffic arrives at the **subnet NSG** first
2. If allowed, traffic proceeds to the **NIC NSG**
3. If both allow, traffic reaches the VM

**Outbound traffic flow:**
1. Traffic from the VM goes through the **NIC NSG** first
2. If allowed, traffic proceeds to the **subnet NSG**
3. If both allow, traffic leaves the subnet

> 🔑 **For traffic to reach a VM, it must be allowed by BOTH the subnet NSG AND the NIC NSG.**

**Viewing effective rules:**
- In the Azure portal: VM → Networking → Effective Security Rules
- Shows the combined rules from both the NIC NSG and subnet NSG
- Useful for troubleshooting connectivity issues

---

### 5. Service Tags

A **service tag** represents a group of IP address prefixes from a specific Azure service — automatically managed by Microsoft. Use service tags instead of specific IP addresses in rules.

**Common service tags:**

| Service Tag | Represents |
|---|---|
| `VirtualNetwork` | All VNet address spaces (current + peered + on-premises) |
| `AzureLoadBalancer` | Azure's health probing infrastructure IP |
| `Internet` | All public internet addresses |
| `AzureCloud` | All Azure datacenter public IPs |
| `Storage` | Azure Storage service IPs |
| `Sql` | Azure SQL Database IPs |
| `AppService` | Azure App Service outbound IPs |

---

### 6. Application Security Groups (ASGs)

**ASGs** allow you to group VMs logically and define NSG rules based on group membership rather than specific IP addresses.

**Benefits:**
- Rules use ASG names instead of IP addresses — scales better
- As VMs are added/removed from ASGs, rules automatically apply/unapply
- Simplifies managing complex multi-tier applications

**Example without ASGs:**
- Deny all traffic from internet to SQL servers on port 1433
- Rule uses specific IP addresses of SQL servers → must update whenever IPs change

**Example with ASGs:**
- Create ASG: `SQLServers`
- Create NSG rule: Source = Internet, Destination = ASG `SQLServers`, Port 1433, Deny
- Add SQL Server VMs to the `SQLServers` ASG → rule automatically applies

**ASG constraints:**
- ASGs must be in the **same region** as the VNet
- VMs can be members of multiple ASGs
- All NICs assigned to an ASG must be in the **same VNet**

---

## 🧪 Scenario-Based Examples

### Scenario 1: Default Inbound Deny (Beginner)
**Situation:** Contoso deploys a web server VM with a public IP. Users cannot reach the website on port 80.  
**Cause:** The default NSG rule `DenyAllInbound` (priority 65500) blocks all inbound traffic. No rule allows port 80.  
**Solution:** Add an NSG inbound rule: priority 100, source Any, destination port 80, protocol TCP, action **Allow**.  
**Key concept:** Default DenyAllInbound — must explicitly allow inbound traffic.

### Scenario 2: Subnet + NIC NSG (Intermediate)
**Situation:** A subnet NSG allows RDP (port 3389) from the admin's IP. The VM's NIC NSG denies all inbound traffic.  
**Question:** Can the admin RDP to the VM?  
**Answer:** No — traffic must be allowed by BOTH the subnet NSG AND the NIC NSG. The NIC NSG denies all inbound, so RDP is blocked even though the subnet NSG allows it.  
**Key concept:** Both NSGs must allow traffic for it to reach the VM (inbound).

### Scenario 3: Overriding Default Outbound Internet Rule (Intermediate)
**Situation:** For security reasons, Contoso wants to prevent all VMs in a subnet from accessing the internet.  
**Solution:** In the subnet's NSG, create a new outbound rule: Priority **100**, Destination = `Internet` service tag, Action = **Deny**. This overrides the default `AllowInternetOutbound` rule (priority 65001) because 100 < 65001.  
**Key concept:** Override default rules with a lower priority number.

### Scenario 4: Application Security Groups for Multi-Tier App (Intermediate)
**Situation:** Contoso has 3 web servers and 2 database servers. They want to allow the web servers to access the databases on port 1433, but block everything else.  
**Solution using ASGs:**
1. Create ASG `WebServers` — add web server VMs
2. Create ASG `DBServers` — add database VMs
3. NSG rule: Source = ASG `WebServers`, Destination = ASG `DBServers`, Port 1433, Allow
4. NSG rule: Source = Any, Destination = ASG `DBServers`, Port 1433, Deny (lower priority = evaluated first)  
**Key concept:** ASGs for clean, scalable multi-tier security rules without IP management.

### Scenario 5: Service Tag for Storage Access (Intermediate)
**Situation:** VMs in a private subnet need outbound access to Azure Storage but not to the general internet.  
**Solution:** Create outbound NSG rules:
- Allow: Destination = `Storage` service tag, Port 443
- Deny: Destination = `Internet` service tag (override default allow)  
**Key concept:** Service tags for Azure service-specific traffic control.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** Default inbound rule: **DenyAllInbound** (priority 65500) — all inbound traffic blocked by default.

> 🎯 **[TESTABLE – Beginner]** Default outbound rule: **AllowInternetOutbound** (priority 65001) — outbound internet allowed by default.

> 🎯 **[TESTABLE – Beginner]** Default NSG rules **cannot be removed** — but can be overridden with rules of lower priority number.

> 🎯 **[TESTABLE – Beginner]** NSG rule priority range: **100 to 4096** — lower number = higher priority.

> 🎯 **[TESTABLE – Intermediate]** For inbound traffic to reach a VM: must be allowed by **subnet NSG first, then NIC NSG**.

> 🎯 **[TESTABLE – Intermediate]** For outbound traffic from a VM: must be allowed by **NIC NSG first, then subnet NSG**.

> 🎯 **[TESTABLE – Intermediate]** Each subnet can have a maximum of **1 NSG**; each NIC can have **0 or 1 NSG**.

> 🎯 **[TESTABLE – Intermediate]** **Application Security Groups (ASGs)** allow grouping VMs to apply NSG rules by group membership instead of IP addresses.

> 🎯 **[TESTABLE – Intermediate]** All NICs in an ASG must be in the **same VNet**; ASGs must be in the **same region** as the VNet.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **NSG (Network Security Group)** | A software firewall with rules controlling inbound and outbound traffic for subnets or NICs |
| **Security rule** | An allow/deny rule within an NSG with priority, source, destination, port, protocol, and action |
| **Priority** | Rule processing order (100–4096); lower = processed first |
| **Service tag** | A Microsoft-managed group of IP address prefixes for Azure services |
| **Application Security Group (ASG)** | A logical group of VMs used as source or destination in NSG rules |
| **DMZ (Demilitarized Zone)** | A screened subnet using NSGs as a buffer between the internet and internal resources |
| **Effective rules** | The combined NSG rules from both the NIC NSG and subnet NSG affecting a VM |
| **DenyAllInbound** | Default NSG rule blocking all inbound traffic (priority 65500) |
| **AllowInternetOutbound** | Default NSG rule allowing all outbound internet traffic (priority 65001) |

---

## 📝 Exam Tips

- **Default = deny all inbound, allow all outbound internet** — must explicitly add allow rules for inbound
- **Priority**: lower number = higher priority = processed first
- **Cannot delete defaults** — override with a lower priority number rule
- **Both NSGs must allow traffic** (subnet NSG + NIC NSG) for inbound to reach VM
- **Service tags** = managed IP groups for Azure services (Storage, Internet, VirtualNetwork, AzureCloud)
- **ASGs** = group VMs for cleaner rules — scales without IP management
- **NSG on subnet** = maximum 1; **NSG on NIC** = 0 or 1

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
