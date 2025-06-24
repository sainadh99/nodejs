listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

api_addr = "http://34.134.95.91:8200"

storage "inmem" {}

ui = true
