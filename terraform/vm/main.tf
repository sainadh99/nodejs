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
      "echo STEP 1: Updating...",
    "sudo apt-get update -y",

    "echo STEP 2: Installing Docker and Git...",
    "sudo apt-get install -y docker.io docker-compose git",

    "echo STEP 3: Enabling and starting Docker...",
    "sudo systemctl enable docker",
    "sudo systemctl start docker",

    "echo STEP 4: Cloning GitHub repo...",
    "rm -rf nodejs",
    "git clone https://github.com/sainadh99/nodejs.git",

    "echo STEP 5: Running docker-compose...",
    "cd nodejs && sudo docker-compose up -d"
  ]

  connection {
    type        = "ssh"
    user        = var.username
    password    = var.password
    host        = var.public_ip_address
    port        = 22
    timeout     = "5m"
    script_path = "/tmp/terraform.sh"
    }
  }

  tags = {
    environment = "dev"
  }
}
