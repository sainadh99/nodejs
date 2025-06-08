provider "azurerm" {
  features {}

  subscription_id = "2cc62b7d-7cda-42d7-890f-ba7279ca35c2"
}

module "vnet" {
  source   = "./vnet"
  rg_name  = var.rg_name
  location = var.location
}

module "vm" {
  source        = "./vm"
  rg_name       = var.rg_name
  location      = var.location
  username      = var.username
  password      = var.password
  subnet_id     = module.vnet.subnet_id
  public_ip_id  = module.vnet.public_ip_id
  public_ip_address = module.vnet.public_ip_address
  
}

