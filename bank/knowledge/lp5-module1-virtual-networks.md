# LP5 – Module 1: Configure Virtual Networks

**Learning Path:** AZ-104 Configure and Manage Virtual Networks for Azure Administrators  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~75 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/configure-virtual-networks/

---

## 📋 Module Overview

Azure Virtual Networks (VNets) are the foundation of Azure networking, providing private connectivity between Azure resources. This module covers VNet planning, subnet design, IP addressing (public and private), and creating VNets.

---

## 🎯 Learning Objectives

- Describe Azure virtual network features and components
- Identify features and usage cases for subnets and subnetting
- Identify usage cases for private and public IP addresses
- Create a virtual network and assign IP addresses

---

## 📖 Key Concepts & Detailed Notes

### 1. What is an Azure Virtual Network?

An **Azure Virtual Network (VNet)** is a logical isolation of the Azure cloud — a private network in Azure that enables Azure resources to securely communicate with each other, the internet, and on-premises networks.

**Key characteristics:**
- Each VNet has its own **CIDR block** (IP address range)
- VNets can be **linked to other VNets** (peering) and on-premises networks (VPN/ExpressRoute) — but address spaces must NOT overlap
- You control **DNS settings** and **subnet segmentation**
- VNets are **region-scoped** — a VNet exists in one Azure region
- VNets can span multiple **availability zones** within a region

**Common VNet use cases:**

| Scenario | Description |
|---|---|
| **Cloud-only VNet** | Private connectivity between Azure resources without internet exposure |
| **Hybrid (site-to-site VPN)** | Securely extend on-premises datacenter to Azure via IPSEC VPN |
| **Hybrid (ExpressRoute)** | Dedicated private connection from on-premises to Azure (faster, more reliable than VPN) |

---

### 2. Subnets

Subnets segment a VNet into smaller, manageable address ranges.

**Key subnet facts:**
- Azure **reserves 5 IP addresses** per subnet (first 4 + last 1):
  - `.0` — Network address
  - `.1` — Default gateway (Azure reserved)
  - `.2` and `.3` — Azure DNS mapping
  - Last address — Broadcast address
- A subnet's address range must be within the VNet's address space
- Subnets within a VNet must have **non-overlapping address ranges**
- By default, all subnets within a VNet can communicate with each other (controlled with NSGs)

**Subnet planning example:**
- VNet: `10.1.0.0/16`
  - Subnet for VMs: `10.1.0.0/24`
  - Subnet for back-end services: `10.1.1.0/24`
  - Subnet for databases: `10.1.2.0/24`

**Special subnets:**
- **GatewaySubnet** — Required for VPN Gateway and ExpressRoute; must be named exactly `GatewaySubnet`
- **AzureBastionSubnet** — Required for Azure Bastion; must be named exactly `AzureBastionSubnet`
- **AzureFirewallSubnet** — Required for Azure Firewall

> ⚠️ NSGs cannot be applied to the **GatewaySubnet**.

---

### 3. IP Addressing

Azure resources can have two types of IP addresses:

| Type | Description | Communication |
|---|---|---|
| **Private IP** | Assigned from the VNet address space | Internal (within VNet, on-premises via VPN/ExpressRoute) |
| **Public IP** | Internet-routable address from Azure's public IP pool | Internet communication |

#### Private IP Addresses
- Assigned from the **subnet's address range**
- **Dynamic** — Assigned by DHCP; can change when VM is stopped/deallocated
- **Static** — Fixed address that doesn't change; required for:
  - DNS servers and domain controllers
  - Firewall rules based on IP
  - TLS/SSL certificates linked to IP
  - IP-based security models

#### Public IP Addresses
- **Dynamic** — Changes on resource stop/start (except VMs that are stopped without deallocating... wait, dynamic IPs change on deallocate/start)
- **Static** — Fixed public IP; incurs additional cost; required for:
  - DNS name resolution where IP must not change
  - Firewall rules whitelisting specific IPs
  - VPN gateways
  - Internet-facing load balancers

**Public IP SKUs:**

| SKU | Availability | Default Method | Notes |
|---|---|---|---|
| **Basic** | No zone support | Dynamic or Static | Being phased out; not recommended for new deployments |
| **Standard** | Zone-redundant by default | Static only | Required for Standard Load Balancer, zones; recommended |

> ⚠️ **Standard SKU public IPs are static only** — dynamic is not supported.

> ⚠️ **Basic and Standard SKU public IPs are not compatible** — you cannot associate a Basic IP with a Standard Load Balancer.

---

### 4. Creating a Virtual Network

**Key configuration settings when creating a VNet:**
- **Name** — Must be unique within the resource group
- **Region** — VNet exists in one region (resources in that VNet must be in the same region)
- **Address space** — One or more CIDR blocks (e.g., `10.0.0.0/16`)
- **Subnets** — At least one subnet; define name and CIDR block
- **DNS servers** — Custom or Azure-provided (default)
- **DDoS protection** — Basic (free, default) or Standard (paid, enhanced)

---

### 5. VNet Scenarios and Connectivity

| Connectivity Type | Description |
|---|---|
| **VNet peering** | Connect two VNets within or across regions |
| **VPN Gateway** | Site-to-site VPN to on-premises over public internet |
| **ExpressRoute** | Dedicated private connection to on-premises (not over public internet) |
| **Service Endpoints** | Extend VNet to Azure PaaS services (Storage, SQL) over Azure backbone |
| **Private Endpoints** | Bring Azure PaaS services into your VNet with a private IP |

---

## 🧪 Scenario-Based Examples

### Scenario 1: Address Space Overlap Preventing Peering (Beginner)
**Situation:** Contoso wants to peer VNet-A (`10.0.0.0/16`) with VNet-B (`10.0.0.0/24`).  
**Problem:** The address spaces **overlap** — VNet-B's range is within VNet-A's range. VNet peering requires non-overlapping address spaces.  
**Solution:** Redesign VNet-B to use a non-overlapping range (e.g., `10.1.0.0/16`).  
**Key concept:** Non-overlapping address spaces required for VNet peering.

### Scenario 2: Reserved Subnet IPs (Beginner)
**Situation:** An admin creates a `/28` subnet (16 addresses). How many are available for resources?  
**Answer:** 16 - 5 (Azure reserved) = **11 usable IPs**.  
**Key concept:** Azure reserves 5 IPs per subnet (first 4 + last 1).

### Scenario 3: Static vs. Dynamic Private IP (Intermediate)
**Situation:** Contoso deploys a DNS server VM. After a maintenance weekend, the VM is deallocated and restarted. Other VMs can no longer resolve DNS.  
**Cause:** The DNS server VM had a **dynamic private IP** that changed after deallocation.  
**Solution:** Assign a **static private IP** to the DNS server VM. Static IPs don't change on deallocation.  
**Key concept:** Static IP required for servers that must have a consistent address (DNS, DCs).

### Scenario 4: Standard vs. Basic Public IP (Intermediate)
**Situation:** A team deploys a Standard Load Balancer and tries to associate a Basic SKU public IP.  
**Problem:** Basic and Standard SKU public IPs are **not compatible** — Standard Load Balancer requires a Standard SKU public IP.  
**Solution:** Use a **Standard SKU static public IP** with the Standard Load Balancer.  
**Key concept:** Standard Load Balancer requires Standard SKU public IP.

### Scenario 5: GatewaySubnet for VPN (Intermediate)
**Situation:** Contoso wants to set up a VPN Gateway to connect their on-premises network to Azure.  
**Requirement:** The VNet must have a subnet named exactly **`GatewaySubnet`** for the VPN Gateway to be deployed. NSGs cannot be applied to GatewaySubnet.  
**Key concept:** GatewaySubnet naming requirement, no NSG on GatewaySubnet.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** Azure reserves **5 IP addresses per subnet**: network address (.0), gateway (.1), DNS mapping (.2 and .3), and broadcast (last).

> 🎯 **[TESTABLE – Beginner]** VNets must use **non-overlapping address spaces** to be peered or connected via VPN.

> 🎯 **[TESTABLE – Beginner]** VNets are **region-scoped** — resources in a VNet must be in the same region.

> 🎯 **[TESTABLE – Intermediate]** **Static private IPs** are required for DNS servers, domain controllers, firewall rules, and IP-based security models.

> 🎯 **[TESTABLE – Intermediate]** **Standard SKU public IPs are static only** — no dynamic option.

> 🎯 **[TESTABLE – Intermediate]** **Basic and Standard SKU public IPs are not interchangeable** — Standard LB requires Standard IP.

> 🎯 **[TESTABLE – Intermediate]** The VPN Gateway subnet must be named exactly **`GatewaySubnet`** — NSGs cannot be applied to it.

> 🎯 **[TESTABLE – Intermediate]** **AzureBastionSubnet** and **AzureFirewallSubnet** are reserved subnet names for specific Azure services.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **VNet (Virtual Network)** | A private, isolated network in Azure for connecting Azure resources |
| **CIDR** | Classless Inter-Domain Routing — notation for defining IP address ranges (e.g., 10.0.0.0/16) |
| **Subnet** | A segment of a VNet's address space for organising and isolating resources |
| **Private IP** | IP address from the VNet address space for internal communication |
| **Public IP** | Internet-routable IP for external communication |
| **Dynamic IP** | IP address that may change when a resource is stopped/deallocated |
| **Static IP** | Fixed IP address that does not change |
| **GatewaySubnet** | Reserved subnet required for VPN Gateway and ExpressRoute; no NSGs allowed |
| **Basic SKU** | Older public IP SKU; being phased out; supports dynamic and static |
| **Standard SKU** | Recommended public IP SKU; static only; zone-redundant by default |
| **VPN Gateway** | Azure resource for site-to-site VPN connectivity to on-premises |
| **ExpressRoute** | Dedicated private connection from on-premises to Azure (not over internet) |

---

## 📝 Exam Tips

- **5 IPs reserved per subnet** — remember: .0 network, .1 gateway, .2/.3 DNS, last broadcast
- **Non-overlapping address spaces** required for peering and VPN connections
- **Static IPs** for DNS servers, DCs, firewall rules
- **Standard SKU = static only**; **Basic SKU = static or dynamic** (but Basic is being deprecated)
- **Standard LB requires Standard IP** — know this compatibility rule
- **GatewaySubnet** = exact name required; no NSG allowed
- VNets are **regional** — one VNet = one region

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
