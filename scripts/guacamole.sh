#!/usr/bin/env bash

set -euo pipefail

# ─── Rutas ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"
KEYS_DIR="${SCRIPT_DIR}/keys"
OUTPUT_DIR="${SCRIPT_DIR}/../guacamole"
OUTPUT_FILE="${OUTPUT_DIR}/002-seed-connections.sql"
FORCE_REGEN="${1:-}"

# ─── Idempotencia ─────────────────────────────────────────────────────────────
if [[ -f "$OUTPUT_FILE" && "$FORCE_REGEN" != "--force" ]]; then
#   echo "[INFO] $OUTPUT_FILE ya existe, no se hace nada."
#   echo "[INFO] Usa --force para regenerarlo."
  exit 0
fi

if [[ -f "$OUTPUT_FILE" && "$FORCE_REGEN" == "--force" ]]; then
  echo "[INFO] Regenerando $OUTPUT_FILE (modo --force)..."
fi

# ─── Generar 001-initdb.sql si no existe ──────────────────────────────────────
INITDB_FILE="${OUTPUT_DIR}/001-initdb.sql"
if [[ ! -f "$INITDB_FILE" ]]; then
  echo "[INFO] Generando $INITDB_FILE..."
  [[ -d "$OUTPUT_DIR" ]] || mkdir -p "$OUTPUT_DIR"
  docker run --rm guacamole/guacamole:1.6.0 /opt/guacamole/bin/initdb.sh --postgresql > "$INITDB_FILE"
  echo "[INFO] $INITDB_FILE generado."
else
  echo "[INFO] $INITDB_FILE ya existe, no se regenera."
fi

# ─── Validaciones ─────────────────────────────────────────────────────────────
[[ -f "$ENV_FILE" ]]  || { echo "[ERROR] No se encuentra .env en $ENV_FILE";  exit 1; }

[[ -d "$OUTPUT_DIR" ]] || mkdir -p "$OUTPUT_DIR"

# ─── Carga el .env (ignora comentarios y líneas vacías) ───────────────────────
while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  key="${key//[[:space:]]/}"
  value="${value//[[:space:]]/}"
  export "$key=$value"
done < "$ENV_FILE"

# ─── Usuarios con acceso a conexiones (header auth + admin local) ───────────
ACCESS_USERS=("$ADMIN_USER")

if [[ -n "${AUTHELIA_USER:-}" ]]; then
  ACCESS_USERS+=("$AUTHELIA_USER")
fi

if [[ -n "${GUAC_ACCESS_USERS:-}" ]]; then
  IFS=',' read -r -a extra_users <<< "$GUAC_ACCESS_USERS"
  for u in "${extra_users[@]}"; do
    u="${u//[[:space:]]/}"
    [[ -n "$u" ]] && ACCESS_USERS+=("$u")
  done
fi

# Elimina duplicados preservando orden
deduped_users=()
for u in "${ACCESS_USERS[@]}"; do
  skip=false
  for seen in "${deduped_users[@]}"; do
    if [[ "$u" == "$seen" ]]; then
      skip=true
      break
    fi
  done
  [[ "$skip" == false ]] && deduped_users+=("$u")
done
ACCESS_USERS=("${deduped_users[@]}")

# Guacamole puede recibir el username normalizado en minúsculas desde header auth.
# Para evitar desajustes de permisos por casing, añadimos también la variante lowercase.
for u in "${ACCESS_USERS[@]}"; do
  lower_u="${u,,}"
  if [[ "$lower_u" != "$u" ]]; then
    exists=false
    for seen in "${ACCESS_USERS[@]}"; do
      if [[ "$seen" == "$lower_u" ]]; then
        exists=true
        break
      fi
    done
    [[ "$exists" == false ]] && ACCESS_USERS+=("$lower_u")
  fi
done

# ─── Función: escapar comillas simples para SQL ───────────────────────────────
sql_escape() {
  echo "${1//\'/\'\'}"
}

# ─── Función: leer clave privada y escaparla ──────────────────────────────────
read_key() {
  local keyfile="${KEYS_DIR}/${1}"
  if [[ ! -f "$keyfile" ]]; then
    echo "[WARN] Clave no encontrada: $keyfile — se omite la conexión." >&2
    return 1
  fi
  sql_escape "$(cat "$keyfile")"
}

# ─── Recopilar índices de conexiones definidas ────────────────────────────────
indices=()
while IFS='=' read -r key _; do
  [[ "$key" =~ ^CON([0-9]+)_TYPE$ ]] && indices+=("${BASH_REMATCH[1]}")
done < "$ENV_FILE"

[[ ${#indices[@]} -eq 0 ]] && { echo "[ERROR] No se encontraron conexiones CON[n] en .env"; exit 1; }

# ─── Generar SQL ──────────────────────────────────────────────────────────────
echo "[INFO] Generando $OUTPUT_FILE con ${#indices[@]} conexiones..."

{
cat <<'HEADER'
-- ============================================================
-- 002-seed-connections.sql
-- Generado automáticamente por generate-seed.sh
-- NO editar manualmente. Borrar y regenerar si hay cambios.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

HEADER

# ─── Usuario admin ────────────────────────────────────────────────────────────
cat <<SQL
-- ── Usuario admin ─────────────────────────────────────────────────────────────
INSERT INTO guacamole_entity (name, type)
SELECT '${ADMIN_USER}', 'USER'
WHERE NOT EXISTS (
  SELECT 1 FROM guacamole_entity WHERE name = '${ADMIN_USER}' AND type = 'USER'
);

INSERT INTO guacamole_user (entity_id, password_hash, password_salt, password_date)
SELECT entity_id,
  digest('${ADMIN_PASS}', 'sha256'),
  NULL,
  NOW()
FROM guacamole_entity
WHERE name = '${ADMIN_USER}' AND type = 'USER'
  AND NOT EXISTS (
    SELECT 1 FROM guacamole_user u
    JOIN guacamole_entity e ON u.entity_id = e.entity_id
    WHERE e.name = '${ADMIN_USER}' AND e.type = 'USER'
  );

-- Permisos de sistema para el admin
INSERT INTO guacamole_system_permission (entity_id, permission)
SELECT entity_id, permission::guacamole_system_permission_type
FROM guacamole_entity, (VALUES
  ('CREATE_CONNECTION'),
  ('CREATE_CONNECTION_GROUP'),
  ('CREATE_SHARING_PROFILE'),
  ('CREATE_USER'),
  ('CREATE_USER_GROUP'),
  ('ADMINISTER')
) AS perms(permission)
WHERE guacamole_entity.name = '${ADMIN_USER}' AND guacamole_entity.type = 'USER'
  AND NOT EXISTS (
    SELECT 1 FROM guacamole_system_permission sp
    JOIN guacamole_entity e ON sp.entity_id = e.entity_id
    WHERE e.name = '${ADMIN_USER}' AND e.type = 'USER'
      AND sp.permission = perms.permission::guacamole_system_permission_type
  );

SQL

# Cuentas locales para usuarios autenticados por header (sin permisos de sistema)
for access_user in "${ACCESS_USERS[@]}"; do
  [[ "$access_user" == "$ADMIN_USER" ]] && continue
  access_user_esc="$(sql_escape "$access_user")"
  cat <<SQL
-- Cuenta local para header-auth: ${access_user_esc}
INSERT INTO guacamole_entity (name, type)
SELECT '${access_user_esc}', 'USER'
WHERE NOT EXISTS (
  SELECT 1 FROM guacamole_entity WHERE name = '${access_user_esc}' AND type = 'USER'
);

INSERT INTO guacamole_user (entity_id, password_hash, password_salt, password_date)
SELECT entity_id,
  digest('header-auth', 'sha256'),
  NULL,
  NOW()
FROM guacamole_entity
WHERE name = '${access_user_esc}' AND type = 'USER'
  AND NOT EXISTS (
    SELECT 1 FROM guacamole_user u
    JOIN guacamole_entity e ON u.entity_id = e.entity_id
    WHERE e.name = '${access_user_esc}' AND e.type = 'USER'
  );

SQL
done

for n in "${indices[@]}"; do
  type_var="CON${n}_TYPE";  TYPE="${!type_var:-}"
  name_var="CON${n}_NAME";  NAME="${!name_var:-}"
  host_var="CON${n}_HOST";  HOST="${!host_var:-}"
  port_var="CON${n}_PORT";  PORT="${!port_var:-}"

  [[ -z "$TYPE" || -z "$NAME" || -z "$HOST" || -z "$PORT" ]] && {
    echo "[WARN] Conexión CON${n} incompleta (TYPE/NAME/HOST/PORT), se omite." >&2
    continue
  }

  PROTOCOL="${TYPE,,}"  # lowercase: ssh, vnc, rdp
  NAME_ESC="$(sql_escape "$NAME")"

  echo "-- ── CON${n}: ${NAME} (${TYPE}) ──────────────────────────────────────"
  echo "INSERT INTO guacamole_connection (connection_name, protocol)"
  echo "SELECT '${NAME_ESC}', '${PROTOCOL}'"
  echo "WHERE NOT EXISTS ("
  echo "  SELECT 1 FROM guacamole_connection WHERE connection_name = '${NAME_ESC}'"
  echo ");"
  echo ""

  # Función interna para insertar parámetros
  insert_param() {
    local param="$1" value="$2"
    cat <<SQL
INSERT INTO guacamole_connection_parameter (connection_id, parameter_name, parameter_value)
SELECT connection_id, '${param}', '$(sql_escape "$value")'
FROM guacamole_connection WHERE connection_name = '${NAME_ESC}'
AND NOT EXISTS (
  SELECT 1 FROM guacamole_connection_parameter cp
  JOIN guacamole_connection c ON cp.connection_id = c.connection_id
  WHERE c.connection_name = '${NAME_ESC}' AND cp.parameter_name = '${param}'
);
SQL
  }

  # Parámetros comunes
  insert_param "hostname" "$HOST"
  insert_param "port"     "$PORT"

  case "$TYPE" in
    SSH)
      key_var="CON${n}_KEY"; KEY="${!key_var:-}"
      user_var="CON${n}_USER"; USER="${!user_var:-}"
      pass_var="CON${n}_PASS"; PASS="${!pass_var:-}"

      [[ -n "$USER" ]] && insert_param "username" "$USER"

      if [[ -n "$KEY" ]]; then
        KEY_CONTENT="$(read_key "$KEY")" || continue
        insert_param "private-key" "$KEY_CONTENT"
      elif [[ -n "$PASS" ]]; then
        insert_param "password" "$PASS"
      else
        echo "[WARN] CON${n} SSH sin KEY ni PASS, se omite autenticación." >&2
      fi
      ;;

    VNC)
      pass_var="CON${n}_PASS"; PASS="${!pass_var:-}"
      [[ -n "$PASS" ]] && insert_param "password" "$PASS"
      ;;

    RDP)
      user_var="CON${n}_USER";     USER="${!user_var:-}"
      pass_var="CON${n}_PASS";     PASS="${!pass_var:-}"
      domain_var="CON${n}_DOMAIN"; DOMAIN="${!domain_var:-}"
      ignore_cert_var="CON${n}_IGNORE_CERT"; IGNORE_CERT="${!ignore_cert_var:-true}"

      [[ -n "$USER" ]]   && insert_param "username" "$USER"
      [[ -n "$PASS" ]]   && insert_param "password" "$PASS"
      [[ -n "$DOMAIN" ]] && insert_param "domain"   "$DOMAIN"
      [[ -n "$IGNORE_CERT" ]] && insert_param "ignore-cert" "$IGNORE_CERT"
      ;;

    *)
      echo "[WARN] Tipo desconocido '${TYPE}' en CON${n}, se omiten parámetros específicos." >&2
      ;;
  esac

  echo ""
  echo "-- Permisos READ para usuarios autorizados"
  for access_user in "${ACCESS_USERS[@]}"; do
    access_user_esc="$(sql_escape "$access_user")"
    cat <<SQL
INSERT INTO guacamole_connection_permission (entity_id, connection_id, permission)
SELECT e.entity_id, c.connection_id, 'READ'
FROM guacamole_entity e, guacamole_connection c
WHERE e.name = '${access_user_esc}' AND e.type = 'USER'
  AND c.connection_name = '${NAME_ESC}'
  AND NOT EXISTS (
    SELECT 1 FROM guacamole_connection_permission p
    WHERE p.entity_id = e.entity_id AND p.connection_id = c.connection_id
  );
SQL
  done
  echo ""

done

} > "$OUTPUT_FILE"

echo "[INFO] Hecho: $OUTPUT_FILE"