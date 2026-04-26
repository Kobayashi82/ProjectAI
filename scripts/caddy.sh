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

    reverse_proxy front:80
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

${FILEBROWSER_PC_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy wireguard:${FILEBROWSER_PC_PORT}
}

${FILEBROWSER_RPI_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy wireguard:${FILEBROWSER_RPI_PORT}
}

# -------- TORRENT --------

${TORRENT_PC_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy wireguard:${TORRENT_PC_PORT}
}

${TORRENT_RPI_DOMAIN} {
    forward_auth authelia:${AUTHELIA_PORT} {
        uri /api/authz/forward-auth
        copy_headers Remote-User Remote-Groups Remote-Name Remote-Email
    }
    reverse_proxy wireguard:${TORRENT_RPI_PORT}
}
EOF
