resource "azurerm_network_interface" "nic" {
  name                = "myNICprudent"
  location            = var.location
  resource_group_name = var.rg_name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = var.public_ip_id
  }
}

resource "azurerm_linux_virtual_machine" "vm" {
  name                            = "myVM"
  location                        = var.location
  resource_group_name             = var.rg_name
  network_interface_ids           = [azurerm_network_interface.nic.id]
  size                            = "Standard_B1s"
  admin_username                  = var.username
  admin_password                  = var.password
  disable_password_authentication = false

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }

  provisioner "remote-exec" {
    inline = [
      "git clone https://github.com/sainadh99/nodejs.git",
      "cd nodejs",
      "echo 'Running docker-compose...' && sudo docker compose up -d || echo 'Docker failed!'"
    ]

    connection {
      type        = "ssh"
      user        = var.username
      password    = var.password
      host        = var.public_ip_address
      port        = 22
      timeout     = "5m"
    }
  }

  tags = {
    environment = "dev"
  }
}
