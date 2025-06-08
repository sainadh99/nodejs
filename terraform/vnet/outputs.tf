output "subnet_id" {
  value = azurerm_subnet.subnet.id
}


output "public_ip_id" {
  value = azurerm_public_ip.ip.id
}

output "public_ip_address" {
  value = azurerm_public_ip.ip.ip_address 
}


