# LP1 – Module 2: Deploy Azure Infrastructure Using JSON ARM Templates

**Learning Path:** AZ-104 Prerequisites for Azure Administrators  
**Difficulty:** 🟡 Intermediate  
**Estimated Study Time:** ~60 minutes  
**Microsoft Learn URL:** https://learn.microsoft.com/training/modules/create-azure-resource-manager-template-vs-code/

---

## 📋 Module Overview

Azure Resource Manager (ARM) templates are JSON files that define the infrastructure and configuration for Azure deployments. This module covers the structure of ARM templates, how to deploy them, and how to add flexibility using parameters and outputs.

---

## 🎯 Learning Objectives

By the end of this module, you should be able to:
- Implement a JSON ARM template using Visual Studio Code
- Declare resources and add flexibility using parameters and outputs

---

## 📖 Key Concepts & Detailed Notes

### 1. Infrastructure as Code (IaC)

**Infrastructure as code** is the practice of describing your infrastructure through code — in the same way you write application logic — and storing it in a central repository.

**Advantages of IaC:**
- **Consistent configurations** — eliminates configuration drift across environments
- **Improved scalability** — deploy identical environments quickly
- **Faster deployments** — parallel resource provisioning
- **Better traceability** — version-controlled infrastructure history

> 💡 **Scenario:** Contoso needs to deploy identical dev, test, and prod environments. Instead of clicking through the portal each time, they maintain a single ARM template in GitHub. Any change is tracked, reviewed, and deployed automatically.

---

### 2. What is an ARM Template?

An ARM template is a **JSON file** that uses **declarative syntax** to define what resources you want to deploy — without specifying the step-by-step commands to create them.

#### Declarative vs. Imperative
| Approach | Description | Example |
|---|---|---|
| **Declarative (ARM)** | Describe the desired end state | "I want a storage account with these properties" |
| **Imperative (scripts)** | List each step to achieve the state | "Create resource group, then create storage account, then configure settings..." |

#### Key Benefits of ARM Templates

| Benefit | Description |
|---|---|
| **Idempotent** | Deploy the same template multiple times — only changes are applied, existing unchanged resources are not recreated |
| **Parallel deployment** | Resources are created in parallel where possible, making deployments faster than scripted approaches |
| **Built-in validation** | ARM validates the template before deployment starts |
| **Modular** | Templates can be broken into smaller linked templates and nested inside each other |
| **CI/CD integration** | Integrates with Azure Pipelines and GitHub Actions for automated deployments |
| **Deployment history** | Azure portal records deployment history with parameter and output values |

---

### 3. ARM Template File Structure

An ARM template is a JSON file made up of the following elements:

| Element | Required | Description |
|---|---|---|
| **`$schema`** | ✅ Yes | Location of the JSON schema file describing the structure |
| **`contentVersion`** | ✅ Yes | Template version (e.g., `1.0.0.0`) — tracks significant changes |
| **`apiProfile`** | ❌ No | Collection of API versions for resource types — avoids specifying per resource |
| **`parameters`** | ❌ No | Values provided at deployment time (max 256 parameters) |
| **`variables`** | ❌ No | Values used to simplify template language expressions |
| **`functions`** | ❌ No | User-defined functions to simplify complex repeated expressions |
| **`resources`** | ✅ Yes | The actual items to deploy or update in a resource group or subscription |
| **`outputs`** | ❌ No | Values returned after a successful deployment |

#### Example: Minimal ARM Template (Storage Account)

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.1",
  "apiProfile": "",
  "parameters": {},
  "variables": {},
  "functions": [],
  "resources": [
    {
      "type": "Microsoft.Storage/storageAccounts",
      "apiVersion": "2025-01-01",
      "name": "learntemplatestorage123",
      "location": "westus",
      "sku": {
        "name": "Standard_LRS"
      },
      "kind": "StorageV2",
      "properties": {
        "supportsHttpsTrafficOnly": true
      }
    }
  ],
  "outputs": {}
}
```

#### Resource Type Syntax
Resources are identified using the format: `{resource-provider}/{resource-type}`  
Example: `Microsoft.Storage/storageAccounts`

---

### 4. Deploying an ARM Template

ARM templates can be deployed in three ways:
1. **Local template** — using Azure CLI or Azure PowerShell from your machine
2. **Linked template** — referencing a template stored remotely (e.g., Azure Blob Storage), secured with a SAS token
3. **CI/CD pipeline** — via Azure Pipelines or GitHub Actions for automated deployment

#### Deploy with Azure CLI

```azurecli
# Login
az login

# Create resource group
az group create \
  --name myResourceGroup \
  --location "eastus"

# Deploy template
templateFile="azuredeploy.json"
az deployment group create \
  --name myDeployment \
  --resource-group myResourceGroup \
  --template-file $templateFile
```

#### Deploy with PowerShell

```powershell
# Login
Connect-AzAccount

# Create resource group
New-AzResourceGroup `
  -Name myResourceGroup `
  -Location "eastus"

# Deploy template
$templateFile = "azuredeploy.json"
New-AzResourceGroupDeployment `
  -Name myDeployment `
  -ResourceGroupName myResourceGroup `
  -TemplateFile $templateFile
```

> ⚠️ Use `az deployment group create` (not the deprecated `az group deployment create`)

---

### 5. Parameters — Adding Flexibility

Parameters allow you to customise deployments for different environments (dev, test, prod) without modifying the template itself.

**Maximum parameters per template: 256**

#### Parameter Structure

```json
"parameters": {
  "<parameter-name>": {
    "type": "<string|secureString|int|bool|object|secureObject|array>",
    "defaultValue": "<default-value>",
    "allowedValues": ["<value1>", "<value2>"],
    "minValue": 1,
    "maxValue": 100,
    "minLength": 3,
    "maxLength": 24,
    "metadata": {
      "description": "<description>"
    }
  }
}
```

#### Allowed Parameter Types
- `string`
- `secureString` ← use for passwords/secrets
- `int`
- `bool`
- `object`
- `secureObject` ← use for sensitive JSON objects
- `array`

> 🔒 **Security Rule:** Never hardcode or provide default values for usernames/passwords. Always use `secureString` or `secureObject`. These values cannot be read or harvested after deployment.

#### Example: Parameterised Storage SKU

```json
"parameters": {
  "storageAccountType": {
    "type": "string",
    "defaultValue": "Standard_LRS",
    "allowedValues": [
      "Standard_LRS",
      "Standard_GRS",
      "Standard_ZRS",
      "Premium_LRS"
    ],
    "metadata": {
      "description": "Storage Account type"
    }
  }
}
```

Reference the parameter in resources using: `[parameters('storageAccountType')]`

#### Deploying with a Parameter Value

```azurecli
az deployment group create \
  --name testdeployment1 \
  --template-file azuredeploy.json \
  --parameters storageAccountType=Standard_LRS
```

---

### 6. Outputs — Returning Values After Deployment

Outputs return values after a successful deployment — useful for capturing dynamically assigned values (e.g., endpoints, IP addresses).

#### Output Structure

```json
"outputs": {
  "<output-name>": {
    "condition": "<boolean>",
    "type": "<type>",
    "value": "<expression>",
    "copy": {
      "count": "<number>",
      "input": "<values>"
    }
  }
}
```

#### Example: Output Storage Endpoint

```json
"outputs": {
  "storageEndpoint": {
    "type": "object",
    "value": "[reference('learntemplatestorage123').primaryEndpoints]"
  }
}
```

The `reference()` function retrieves the **runtime state** of a resource.

---

### 7. Idempotency

ARM templates are **idempotent** — you can safely deploy the same template to the same environment multiple times. Resources are:
- **Created** only if they don't already exist
- **Updated** only if a change is detected
- **Left unchanged** if nothing in the template has changed

This makes ARM templates safe to re-run after failures or updates.

---

## 🧪 Scenario-Based Examples

### Scenario 1: Environment Consistency (Beginner)
**Situation:** Contoso's dev and prod environments have configuration drift — prod has settings that dev doesn't.  
**Solution:** Create a single ARM template with parameters (`environment`, `sku`). Deploy with different parameter files for dev and prod. Drift is eliminated.  
**Key concept tested:** IaC benefits, parameters.

### Scenario 2: Sensitive Credentials (Intermediate)
**Situation:** A junior developer stores a SQL admin password as a string in an ARM template, committing it to GitHub.  
**Question:** What is wrong with this approach?  
**Answer:** Passwords must use `secureString` type, never hardcoded defaults. Secrets stored as plain string are visible in deployment history and version control.  
**Key concept tested:** secureString, security best practices.

### Scenario 3: Parallel vs. Sequential Deployment (Intermediate)
**Situation:** A team is choosing between a PowerShell script and an ARM template to deploy 10 resources.  
**Solution:** ARM template is preferred — it deploys resources in parallel where possible, while scripts typically deploy sequentially, making ARM faster.  
**Key concept tested:** ARM parallel deployment benefit.

### Scenario 4: Re-deploying a Template (Intermediate)
**Situation:** An admin deploys an ARM template to create a storage account. They later redeploy the same template without changes.  
**Question:** What happens to the existing storage account?  
**Answer:** Nothing — ARM templates are idempotent. No changes occur unless the template itself has changed.  
**Key concept tested:** Idempotency.

### Scenario 5: Linked Templates (Intermediate)
**Situation:** Contoso has a complex ARM deployment with 50+ resources. Managing it in a single template is becoming difficult.  
**Solution:** Break the main template into smaller, reusable linked templates stored in Azure Blob Storage. The main template references and triggers them at deployment time.  
**Key concept tested:** Linked templates, modular design.

---

## ✅ Testable Points

> 🎯 **[TESTABLE – Beginner]** ARM templates use **declarative JSON syntax** to define infrastructure — you describe the desired state, not the steps.

> 🎯 **[TESTABLE – Beginner]** ARM templates are **idempotent** — safe to deploy multiple times with the same result.

> 🎯 **[TESTABLE – Beginner]** The **three required** elements in an ARM template are: `$schema`, `contentVersion`, and `resources`.

> 🎯 **[TESTABLE – Beginner]** ARM templates can be deployed with **Azure CLI** (`az deployment group create`) or **PowerShell** (`New-AzResourceGroupDeployment`).

> 🎯 **[TESTABLE – Intermediate]** ARM templates support a maximum of **256 parameters**.

> 🎯 **[TESTABLE – Intermediate]** Passwords and secrets must use the **`secureString`** or **`secureObject`** parameter type — they cannot be read after deployment.

> 🎯 **[TESTABLE – Intermediate]** ARM deploys resources **in parallel** where dependencies allow, making it faster than imperative scripting.

> 🎯 **[TESTABLE – Intermediate]** The **`reference()`** function in an output retrieves the runtime state of a deployed resource.

> 🎯 **[TESTABLE – Intermediate]** **Linked templates** allow breaking complex deployments into smaller, reusable components secured with a SAS token.

> 🎯 **[TESTABLE – Intermediate]** ARM templates integrate with **Azure Pipelines** and **GitHub Actions** for CI/CD automation.

---

## 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| **ARM Template** | A JSON file using declarative syntax to define and deploy Azure infrastructure |
| **Infrastructure as Code (IaC)** | The practice of managing infrastructure through version-controlled code |
| **Declarative syntax** | Describing the desired end state without specifying steps to achieve it |
| **Idempotent** | A deployment that produces the same result regardless of how many times it is run |
| **Parameter** | A customisable input value provided at deployment time (max 256 per template) |
| **secureString** | A parameter type for sensitive values (e.g., passwords) that cannot be read after deployment |
| **Output** | A value returned by an ARM template after a successful deployment |
| **Linked template** | A referenced external template invoked from a main (parent) template |
| **`reference()` function** | ARM function that retrieves the runtime state of a deployed resource |
| **Resource provider** | A service that supplies Azure resources (e.g., `Microsoft.Storage`) |

---

## 📝 Exam Tips

- Know the **three required sections**: `$schema`, `contentVersion`, `resources`
- Know the **five optional sections**: `apiProfile`, `parameters`, `variables`, `functions`, `outputs`
- **Idempotency** is a core benefit — resources are only created/updated if needed
- `secureString` prevents secrets from appearing in logs/history — frequently tested
- `az deployment group create` is the current command (not the old `az group deployment create`)
- ARM templates are **faster** than scripts because they deploy resources in **parallel**

---

*Module notes generated from Microsoft Learn content for AZ-104 exam preparation.*
