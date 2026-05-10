#!/bin/bash

export DOMAIN=mydomain.net
export AUTHELIA_USER=user
export AUTHELIA_PASS=pass
export AUTHELIA_DOMAIN=auth.${DOMAIN}

if [ ! -f authelia/configuration.yml ]; then
    mkdir -p authelia
    cat > authelia/configuration.yml <<EOF
server:
  address: tcp://0.0.0.0:9091
  endpoints:
    authz:
      forward-auth:
        implementation: ForwardAuth

log:
  level: info

session:
  secret: $(openssl rand -base64 64 | tr -d '\n')
  remember_me: 1M
  cookies:
    - domain: $DOMAIN
      authelia_url: https://$AUTHELIA_DOMAIN
      default_redirection_url: https://$DOMAIN
      expiration: 24h
      inactivity: 8h
      remember_me: 1M

identity_validation:
  reset_password:
    jwt_secret: $(openssl rand -base64 64 | tr -d '\n')

authentication_backend:
  file:
    path: /config/users.yml
    password:
      algorithm: bcrypt
      iterations: 12

access_control:
  default_policy: deny
  rules:
    - domain: $AUTHELIA_DOMAIN
      policy: bypass
    - domain: $DOMAIN
      resources:
        - '^/manifest\\.json$'
        - '^/icons/.*$'
        - '^\\.well-known/.*$'
      policy: bypass
    - domain: $DOMAIN
      policy: one_factor
    - domain: '*.$DOMAIN'
      policy: one_factor

storage:
  encryption_key: $(openssl rand -base64 64 | tr -d '\n')
  local:
    path: /config/db.sqlite3

notifier:
  filesystem:
    filename: /config/notifications.txt
EOF
fi

if [ ! -f authelia/users.yml ]; then
	HASH=$(docker run --rm authelia/authelia:4.39 authelia crypto hash generate bcrypt --password "$AUTHELIA_PASS" | grep 'Digest:' | awk '{print $2}')

	# Generate users.yml
	cat > authelia/users.yml <<EOF
users:
  $AUTHELIA_USER:
    displayname: "$AUTHELIA_USER"
    password: "$HASH"
    email: $AUTHELIA_USER@authelia.local
    groups: []
EOF
fi
