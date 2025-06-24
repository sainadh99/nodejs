vault policy write myapp-policy - <<EOF
path "secret/myapp/config" {
  capabilities = ["read"]
}
EOF

