#!/bin/bash

set -a
source .env
set +a

# Generate Caddyfile
cat > caddy/Caddyfile <<EOF
# -------- CADDY --------

www.${DOMAIN} {
    redir https://${DOMAIN}{uri}
}

${DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }

    @api path /api*
    reverse_proxy @api wireguard:4000

    reverse_proxy front:3000
}

# -------- AUTHELIA --------

${AUTHELIA_DOMAIN} {
    reverse_proxy authelia:${AUTHELIA_PORT}
}

# -------- PORTAINER --------

${PORTAINER_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy portainer:9000
}

# -------- GUACAMOLE --------

${GUACAMOLE_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }

    @root path /
    redir @root /guacamole/ 302

    reverse_proxy guacamole:8080 {
        header_up Remote-Email {http.request.header.Remote-Email}
        header_up Remote-Name {http.request.header.Remote-Name}
        header_up Remote-User {http.request.header.Remote-User}
        header_up Remote-Groups {http.request.header.Remote-Groups}
    }
}

# -------- OPEN WEBUI --------

${OPENWEBUI_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }

    reverse_proxy wireguard:${OPENWEBUI_PORT} {
        header_up Remote-Email {http.request.header.Remote-Email}
        header_up Remote-Name {http.request.header.Remote-Name}
        header_up Remote-User {http.request.header.Remote-User}
        header_up Remote-Groups {http.request.header.Remote-Groups}
    }
}

# -------- SEARXNG --------

${SEARXNG_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy searxng:${SEARXNG_PORT}
}

# -------- COMFYUI --------

${COMFYUI_DOMAIN} {
    encode zstd gzip

    @websockets {
        header Upgrade websocket
    }

    @assets {
        path /assets/*
    }

    handle @websockets {
        reverse_proxy wireguard:${COMFYUI_PORT} {
            flush_interval -1
        }
    }

    handle @assets {
        reverse_proxy wireguard:${COMFYUI_PORT} {
            flush_interval -1
        }
    }

    handle {
        forward_auth authelia:${AUTHELIA_PORT} {
            uri /api/authz/forward-auth
            copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
        }
        reverse_proxy wireguard:${COMFYUI_PORT} {
            flush_interval -1
        }
    }
}

# -------- OPENCLAW --------

${OPENCLAW_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
	reverse_proxy wireguard:18789
}

# -------- FILE BROWSER --------

${FILEBROWSER_VPS_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy filebrowser-vps:${FILEBROWSER_VPS_PORT}
}

${FILEBROWSER_PADRE_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy wireguard:${FILEBROWSER_PADRE_PORT}
}

${FILEBROWSER_RASPBERRY_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy wireguard:${FILEBROWSER_RASPBERRY_PORT}
}

# -------- TORRENT --------

${TORRENT_PADRE_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy wireguard:${TORRENT_PADRE_PORT}
}

${TORRENT_RASPBERRY_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy wireguard:${TORRENT_RASPBERRY_PORT}
}
EOF





# # Create Caddyfile
# sed \
#     -e "s/\${DOMAIN}/$DOMAIN/g" \
#     -e "s/\${AUTHELIA_DOMAIN}/$AUTHELIA_DOMAIN/g" \
# 	-e "s/\${AUTHELIA_PORT}/$AUTHELIA_PORT/g" \
# 	-e "s/\${PORTAINER_DOMAIN}/$PORTAINER_DOMAIN/g" \
# 	-e "s/\${PORTAINER_PORT}/$PORTAINER_PORT/g" \
# 	-e "s/\${GUACAMOLE_DOMAIN}/$GUACAMOLE_DOMAIN/g" \
# 	-e "s/\${GUACAMOLE_PORT}/$GUACAMOLE_PORT/g" \
#     -e "s/\${OPENWEBUI_DOMAIN}/$OPENWEBUI_DOMAIN/g" \
# 	-e "s/\${OPENWEBUI_PORT}/$OPENWEBUI_PORT/g" \
#     -e "s/\${SEARXNG_DOMAIN}/$SEARXNG_DOMAIN/g" \
# 	-e "s/\${SEARXNG_PORT}/$SEARXNG_PORT/g" \
#     -e "s/\${COMFYUI_DOMAIN}/$COMFYUI_DOMAIN/g" \
# 	-e "s/\${COMFYUI_PORT}/$COMFYUI_PORT/g" \
#     -e "s/\${FILEBROWSER_VPS_DOMAIN}/$FILEBROWSER_VPS_DOMAIN/g" \
# 	-e "s/\${FILEBROWSER_VPS_PORT}/$FILEBROWSER_VPS_PORT/g" \
#     -e "s/\${FILEBROWSER_PADRE_DOMAIN}/$FILEBROWSER_PADRE_DOMAIN/g" \
# 	-e "s/\${FILEBROWSER_PADRE_PORT}/$FILEBROWSER_PADRE_PORT/g" \
#     -e "s/\${FILEBROWSER_RASPBERRY_DOMAIN}/$FILEBROWSER_RASPBERRY_DOMAIN/g" \
# 	-e "s/\${FILEBROWSER_RASPBERRY_PORT}/$FILEBROWSER_RASPBERRY_PORT/g" \
#     -e "s/\${TORRENT_PADRE_DOMAIN}/$TORRENT_PADRE_DOMAIN/g" \
# 	-e "s/\${TORRENT_PADRE_PORT}/$TORRENT_PADRE_PORT/g" \
#     -e "s/\${TORRENT_RASPBERRY_DOMAIN}/$TORRENT_RASPBERRY_DOMAIN/g" \
# 	-e "s/\${TORRENT_RASPBERRY_PORT}/$TORRENT_RASPBERRY_PORT/g" \
#     caddy/Caddyfile.template > caddy/Caddyfile
