# LP5 – Module 3: Host Your Domain on Azure DNS

**Learning Path:** AZ-104 Configure and Manage Virtual Networks for Azure Administrators  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~45 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/host-domain-azure-dns/

---

## 📋 Module Overview

Azure DNS allows you to host DNS zones and manage DNS records for your domains within Azure. This module covers creating DNS zones, adding records, and testing DNS resolution.

---

## 🎯 Learning Objectives

- Create a DNS zone for your domain name
- Create DNS records to map the domain to an IP address
- Test that the domain name resolves to your web server

---

## 📖 Key Concepts & Detailed Notes

### 1. What is Azure DNS?

**Azure DNS** is a hosting service for DNS domains that provides name resolution using Microsoft Azure infrastructure. By hosting your domains in Azure, you can manage DNS records using the same credentials, APIs, tools, and billing as other Azure services.

**Key features:**
- **Not a domain registrar** — Azure DNS hosts DNS zones; you must purchase domain names from a registrar (e.g., GoDaddy, Namecheap)
- **Global availability** — DNS zones are hosted using Azure's global anycast network for low latency
- **RBAC integration** — Use Azure RBAC to control who can manage DNS records
- **Private DNS zones** — Name resolution within Azure VNets without exposing DNS to the internet
- **Alias records** — Point DNS records to Azure resources (Public IPs, Traffic Manager, CDN profiles) and automatically update when the resource IP changes

---

### 2. Azure DNS Zone

A **DNS zone** hosts the DNS records for a domain.

**To host your domain on Azure DNS:**
1. Create a **DNS zone** in Azure (e.g., `contoso.com`)
2. Note the **four Azure name servers** assigned to the zone
3. Update your domain registrar to use these four Azure name servers as the authoritative nameservers
4. DNS queries for your domain are now served by Azure DNS

**Azure DNS zones use a unique set of four name servers** (anycast) — always use all four for redundancy.

---

### 3. DNS Record Types

| Record Type | Purpose | Example |
|---|---|---|
| **A** | Maps hostname to IPv4 address | `www → 20.0.0.1` |
| **AAAA** | Maps hostname to IPv6 address | `www → 2001:db8::1` |
| **CNAME** | Alias — maps hostname to another hostname | `blog → contoso.wordpress.com` |
| **MX** | Mail exchange — routes email | `@ → mail.contoso.com` |
| **NS** | Name server records — defines authoritative DNS servers | Automatically created |
| **SOA** | Start of Authority — zone meta information | Automatically created |
| **TXT** | Text records — used for verification, SPF, DKIM | `@ → "v=spf1 include:..."` |
| **PTR** | Reverse DNS — maps IP to hostname | Used in reverse lookup zones |
| **SRV** | Service locator records | Used by applications like Skype, SIP |
| **CAA** | Certificate Authority Authorization | Specifies which CAs can issue certs |

**Alias records:** Special Azure DNS records that point to Azure resources (Public IP, Traffic Manager, CDN). Unlike CNAME, alias records can be used at the **zone apex** (root of the domain, e.g., `contoso.com` not just `www.contoso.com`).

---

### 4. Private DNS Zones

**Azure Private DNS zones** provide name resolution within Azure VNets without requiring custom DNS servers or internet-exposed DNS.

**Key characteristics:**
- Resolves names only within linked VNets — not publicly accessible
- VNets are linked to a private DNS zone (can be auto-registration or manual)
- **Auto-registration** — VMs that join the VNet automatically get an A record in the private zone
- Supports split-horizon DNS — same domain name for different internal/external resolution

**Use cases:**
- Custom domain names for Azure resources (VMs, Load Balancers)
- Name resolution across peered VNets
- Avoiding custom DNS server deployment

---

## ✅ Testable Points (DNS)

> 🎯 **[TESTABLE – Beginner]** Azure DNS is a **DNS hosting service** — it is NOT a domain name registrar.

> 🎯 **[TESTABLE – Beginner]** To use Azure DNS, update your **registrar's nameservers** to the four Azure DNS name servers.

> 🎯 **[TESTABLE – Beginner]** **CNAME** records create aliases (hostname to hostname); **A** records map hostname to IPv4 address.

> 🎯 **[TESTABLE – Intermediate]** **Alias records** can be used at the **zone apex** (root domain) — unlike CNAME records which cannot.

> 🎯 **[TESTABLE – Intermediate]** **Private DNS zones** provide name resolution within Azure VNets without exposing DNS publicly.

> 🎯 **[TESTABLE – Intermediate]** **Auto-registration** in private DNS zones automatically creates A records for VMs joining the linked VNet.

---

---

# LP5 – Module 4: Configure Azure Virtual Network Peering

**Difficulty:** 🟡 Intermediate  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/configure-vnet-peering/

---

## 📖 Key Concepts & Detailed Notes

### 1. VNet Peering Overview

**VNet peering** enables seamless connectivity between two Azure VNets — after peering, they operate as a single network for connectivity.

**Two types:**
- **Regional peering** — Connects VNets in the **same Azure region**
- **Global peering** — Connects VNets in **different Azure regions**

**Peering key benefits:**

| Benefit | Description |
|---|---|
| **Private connectivity** | Traffic stays on the Microsoft Azure backbone — no public internet, no gateways, no encryption needed |
| **Low latency / high bandwidth** | Direct Azure backbone connection |
| **Cross-subscription / cross-tenant** | Peering works across subscriptions and AAD tenants |
| **No downtime** | Peering creation doesn't cause downtime |

**Requirements and limitations:**
- VNets must have **non-overlapping address spaces** — peering fails if ranges overlap
- **Address space changes require deleting and recreating peering**
- Azure **built-in DNS does not resolve names across peered VNets** — use Private DNS zones or custom DNS
- **Basic Internal Load Balancer IPs** cannot be accessed across global peering — use Standard LB

---

### 2. Peering is Non-Transitive

> ⚠️ VNet peering is **NOT transitive**.

If VNet-A is peered with VNet-B, and VNet-B is peered with VNet-C:
- VNet-A **cannot** communicate with VNet-C through VNet-B
- VNet-A and VNet-C must be **directly peered** with each other

**Hub and spoke topology with transitive routing:**
To allow transitive routing, use:
- **Azure VPN Gateway in the hub VNet** (with gateway transit enabled)
- **User-defined routes (UDRs)** — custom route tables to direct traffic through a hub VM/NVA
- **Azure Virtual WAN** — managed hub for large-scale connectivity

---

### 3. Gateway Transit

**Gateway transit** allows peered VNets to use a VPN Gateway or ExpressRoute circuit in the hub VNet for on-premises connectivity.

- **Hub VNet:** Has the gateway; enable **Allow gateway transit**
- **Spoke VNet:** Doesn't have a gateway; enable **Use remote gateways**

This means all spoke VNets can connect to on-premises through the single gateway in the hub — cost-efficient.

---

## ✅ Testable Points (VNet Peering)

> 🎯 **[TESTABLE – Beginner]** VNet peering requires **non-overlapping address spaces**.

> 🎯 **[TESTABLE – Beginner]** VNet peering uses the **Azure backbone** — no public internet, no gateway, no encryption required.

> 🎯 **[TESTABLE – Intermediate]** VNet peering is **NOT transitive** — VNet-A peered with VNet-B and B peered with C does not give A access to C.

> 🎯 **[TESTABLE – Intermediate]** **Gateway transit** allows spoke VNets to use the hub VNet's VPN Gateway for on-premises connectivity.

> 🎯 **[TESTABLE – Intermediate]** Azure built-in DNS does **NOT resolve names across peered VNets** — use Private DNS zones.

---

---

# LP5 – Module 5: Manage and Control Traffic Flow with Routes

**Difficulty:** 🟡 Intermediate  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/control-network-traffic-flow-with-routes/

---

## 📖 Key Concepts & Detailed Notes

### 1. Azure Route Tables and User-Defined Routes (UDRs)

Azure automatically routes traffic between subnets, VNets, the internet, and on-premises using **system routes**. You can override system routes using **User-Defined Routes (UDRs)** in a **route table**.

**System routes (automatic):**
- Traffic within the same VNet — routed automatically
- Traffic to peered VNets — via peering
- Traffic to internet — via default system route

**User-Defined Routes (UDRs):**
- Custom routes you define to override system routes
- Specify: Address prefix (destination) + Next hop type

**Next hop types:**

| Next Hop Type | Description |
|---|---|
| **Virtual network** | Route within the VNet (default for VNet traffic) |
| **Internet** | Route traffic to the internet via Azure's edge |
| **Virtual appliance** | Route through a specific IP (e.g., NVA, firewall VM) |
| **VPN gateway** | Route through the VPN gateway |
| **None** | Drop the traffic (blackhole route) |

**Common UDR use case — Force traffic through NVA (Network Virtual Appliance):**
- Add a UDR pointing `0.0.0.0/0` (all traffic) to the NVA's private IP as `Virtual appliance` next hop
- All internet-bound traffic from the subnet routes through the NVA for inspection/filtering

**Route table association:**
- A route table is associated to one or more **subnets**
- One subnet can only have **one route table** associated

---

### 2. Border Gateway Protocol (BGP)

BGP is a standard routing protocol used to exchange routing information between on-premises networks and Azure. Azure VPN Gateway supports BGP for dynamic routing, allowing on-premises routes to be automatically propagated to Azure.

---

## ✅ Testable Points (Routes)

> 🎯 **[TESTABLE – Beginner]** **UDRs (User-Defined Routes)** override Azure's system routes.

> 🎯 **[TESTABLE – Intermediate]** The **Virtual appliance** next hop type routes traffic through a specific IP (e.g., a firewall or NVA).

> 🎯 **[TESTABLE – Intermediate]** A subnet can only have **one route table** associated.

> 🎯 **[TESTABLE – Intermediate]** The **None** next hop type drops traffic (blackhole route — useful for denying access to specific destinations).

---

---

# LP5 – Module 6: Introduction to Azure Load Balancer

**Difficulty:** 🟢 Beginner  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/intro-to-azure-load-balancer/

---

## 📖 Key Concepts & Detailed Notes

### 1. What is Azure Load Balancer?

Azure Load Balancer is a **Layer 4 (transport layer)** load balancer that distributes incoming TCP/UDP traffic across multiple backend instances (VMs, VMSS).

**Two SKUs:**

| SKU | Scope | SLA | Features |
|---|---|---|---|
| **Basic** | Single availability set or VMSS | No SLA | Free; limited features; being phased out |
| **Standard** | Any VM in a region | 99.99% | Zone-redundant; more backend pools; better health probes; outbound rules |

> ⚠️ **Basic Load Balancer is being retired** — use Standard for all new deployments.

**Two types:**

| Type | Traffic Direction | Use Case |
|---|---|---|
| **Public Load Balancer** | Internet → backend VMs | Distributing internet traffic to web servers |
| **Internal (Private) Load Balancer** | Internal VNet traffic → backend VMs | Distributing internal traffic (e.g., from web tier to database tier) |

**Key components:**
- **Frontend IP configuration** — The IP address clients connect to
- **Backend pool** — The set of VMs/VMSS receiving traffic
- **Health probes** — Checks if backend instances are healthy (TCP or HTTP probes)
- **Load balancing rules** — Defines how traffic is distributed (frontend port → backend port)
- **Inbound NAT rules** — Forward specific ports to specific VMs (e.g., for RDP/SSH)
- **Outbound rules** (Standard only) — Configure outbound NAT for backend pool VMs

**Load balancing algorithms:** Hash-based (5-tuple hash: source IP, source port, destination IP, destination port, protocol) — ensures session affinity (same client → same backend) within a connection.

---

## ✅ Testable Points (Load Balancer)

> 🎯 **[TESTABLE – Beginner]** Azure Load Balancer operates at **Layer 4 (TCP/UDP)**.

> 🎯 **[TESTABLE – Beginner]** **Standard LB** requires a **Standard SKU public IP** — not compatible with Basic SKU.

> 🎯 **[TESTABLE – Intermediate]** **Health probes** determine which backend instances receive traffic — unhealthy instances are removed from rotation.

> 🎯 **[TESTABLE – Intermediate]** **Standard LB** is **zone-redundant** by default; provides **99.99% SLA**.

> 🎯 **[TESTABLE – Intermediate]** **Basic LB is being retired** — always recommend Standard for new deployments.

---

---

# LP5 – Module 7: Introduction to Azure Application Gateway

**Difficulty:** 🟡 Intermediate  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/intro-to-azure-application-gateway/

---

## 📖 Key Concepts & Detailed Notes

### 1. What is Azure Application Gateway?

Azure Application Gateway is a **Layer 7 (application layer)** load balancer and web traffic manager for HTTP/HTTPS traffic.

**Differences from Azure Load Balancer:**

| Feature | Load Balancer | Application Gateway |
|---|---|---|
| **Layer** | Layer 4 (TCP/UDP) | Layer 7 (HTTP/HTTPS) |
| **Routing** | IP/port based | URL path, hostname, headers |
| **TLS termination** | No | Yes — offloads TLS processing from backend servers |
| **WAF** | No | Yes — Web Application Firewall |
| **Cookie-based affinity** | No | Yes |
| **URL-based routing** | No | Yes |

**Key Application Gateway features:**

| Feature | Description |
|---|---|
| **URL path-based routing** | Route `/images/*` to image servers, `/video/*` to video servers |
| **Host-based routing** | Route based on hostname (contoso.com vs. fabrikam.com) |
| **TLS/SSL termination** | Decrypt HTTPS at the gateway; backend uses HTTP (reduces backend CPU) |
| **End-to-end TLS** | Re-encrypt traffic between gateway and backend |
| **Web Application Firewall (WAF)** | Protect against OWASP threats (SQL injection, XSS) — OWASP CRS ruleset |
| **Session affinity** | Cookie-based — route the same user to the same backend |
| **Autoscaling** | Automatically scale based on traffic load |
| **Multi-site hosting** | Host multiple websites behind a single gateway |
| **Redirection** | HTTP → HTTPS redirect; URL-based redirects |
| **Rewrite HTTP headers** | Modify request/response headers |

---

## ✅ Testable Points (Application Gateway)

> 🎯 **[TESTABLE – Beginner]** Azure Application Gateway operates at **Layer 7 (HTTP/HTTPS)**.

> 🎯 **[TESTABLE – Beginner]** Application Gateway supports **TLS termination** — decrypts HTTPS at the gateway, reducing backend CPU load.

> 🎯 **[TESTABLE – Intermediate]** Application Gateway **WAF** protects against OWASP top 10 threats (SQL injection, XSS, etc.).

> 🎯 **[TESTABLE – Intermediate]** **URL path-based routing** routes different URL paths to different backend pools.

> 🎯 **[TESTABLE – Intermediate]** **Cookie-based session affinity** ensures the same user is routed to the same backend server.

---

---

# LP5 – Module 8: Introduction to Azure Network Watcher

**Difficulty:** 🟢 Beginner  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/intro-to-azure-network-watcher/

---

## 📖 Key Concepts & Detailed Notes

### 1. What is Azure Network Watcher?

**Azure Network Watcher** is a regional service providing tools to monitor, diagnose, and gain insights into Azure IaaS network performance and connectivity.

**Key tools and features:**

| Tool | Description | Use Case |
|---|---|---|
| **IP flow verify** | Tests if traffic is allowed/denied based on NSG rules | Diagnose why a VM can't reach a specific IP/port |
| **Next hop** | Shows next hop for traffic from a VM | Verify routing for a VM's traffic |
| **Connection troubleshoot** | End-to-end connectivity test between two Azure endpoints | Test connectivity between two VMs or VNet and on-premises |
| **Connection monitor** | Continuous monitoring of connection health between endpoints | Monitor latency and packet loss over time |
| **NSG flow logs** | Logs all traffic flowing through an NSG (allowed and denied) | Audit network traffic; threat hunting; compliance |
| **Packet capture** | Capture network packets on a VM | Deep packet inspection for troubleshooting |
| **Traffic analytics** | Analysed NSG flow logs visualised in Azure Monitor | Identify hot flows, security threats, traffic patterns |
| **VPN troubleshoot** | Diagnose VPN Gateway and connection health | Troubleshoot site-to-site VPN connectivity issues |

**Network Watcher activation:**
- Automatically enabled when you create/update a VNet in a region
- One Network Watcher instance per region per subscription

---

## ✅ Testable Points (Network Watcher)

> 🎯 **[TESTABLE – Beginner]** **IP flow verify** tests if NSG rules allow or deny specific traffic to/from a VM.

> 🎯 **[TESTABLE – Intermediate]** **NSG flow logs** capture all traffic (allowed and denied) through an NSG — stored in Azure Storage.

> 🎯 **[TESTABLE – Intermediate]** **Connection monitor** provides continuous monitoring of connection health between endpoints.

> 🎯 **[TESTABLE – Intermediate]** **Packet capture** enables deep packet inspection on a VM for advanced troubleshooting.

> 🎯 **[TESTABLE – Intermediate]** **Traffic analytics** processes NSG flow logs to visualise network patterns and identify threats in Azure Monitor.

---

## 🔑 Key Terms — LP5 Summary

| Term | Definition |
|---|---|
| **VNet peering** | Direct connectivity between two Azure VNets via Azure backbone |
| **Gateway transit** | Allows spoke VNets to use a hub VNet's VPN gateway |
| **UDR** | User-Defined Route — custom route overriding Azure system routes |
| **NVA** | Network Virtual Appliance — a VM acting as a firewall or router |
| **Route table** | A set of UDRs associated to one or more subnets |
| **Azure DNS** | Azure-hosted DNS service for public and private domain resolution |
| **Private DNS zone** | Azure DNS zone for internal VNet name resolution |
| **Load Balancer** | Layer 4 (TCP/UDP) traffic distribution across backend VMs |
| **Application Gateway** | Layer 7 (HTTP/HTTPS) load balancer with URL routing, WAF, TLS termination |
| **Network Watcher** | Regional Azure service for IaaS network monitoring and diagnostics |
| **IP flow verify** | Network Watcher tool for testing NSG rule allow/deny for specific traffic |
| **NSG flow logs** | Network Watcher feature logging all NSG traffic flows |
| **WAF** | Web Application Firewall built into Application Gateway; protects against OWASP threats |

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
