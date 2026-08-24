#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Cloudflare DNS automation for the kenzed.in cutover.
#
# Creates  erp.kenzed.in  ->  46.202.163.242
#
# The token is read from the environment and is NEVER written to disk or logged.
#
#   export CF_API_TOKEN='...'
#   ./02-cloudflare-dns.sh check      # read-only: verify token, show current DNS
#   ./02-cloudflare-dns.sh apply      # create erp record, DNS-only (grey cloud)
#   ./02-cloudflare-dns.sh proxy-on   # flip to proxied AFTER the TLS cert exists
#   ./02-cloudflare-dns.sh status     # what does the world see right now
#
# Why two phases: a proxied (orange-cloud) record breaks Let's Encrypt / cPanel
# AutoSSL HTTP-01 validation. We publish DNS-only, let the cert issue against the
# origin, then turn the proxy on. Doing it in one shot is the usual way this fails.
# ---------------------------------------------------------------------------
set -Eeuo pipefail

ZONE_NAME="${ZONE_NAME:-kenzed.in}"
RECORD="${RECORD:-erp}"
ORIGIN_IP="${ORIGIN_IP:-46.202.163.242}"
API="https://api.cloudflare.com/client/v4"

log()  { printf '\033[1;34m[cf]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[fail]\033[0m %s\n' "$*" >&2; exit 1; }

need_token() {
  [ -n "${CF_API_TOKEN:-}" ] || die "CF_API_TOKEN is not set.  export CF_API_TOKEN='...' first."
}

# --- portable JSON field extraction (uses jq when available) ----------------
jget() { # jget <json> <jq-filter> <sed-fallback-key>
  if command -v jq >/dev/null 2>&1; then printf '%s' "$1" | jq -r "$2"
  else printf '%s' "$1" | grep -o "\"$3\":\"[^\"]*\"" | head -1 | sed "s/.*\"$3\":\"\([^\"]*\)\".*/\1/"
  fi
}
ok() { printf '%s' "$1" | grep -q '"success":true'; }
errmsg() { printf '%s' "$1" | grep -o '"message":"[^"]*"' | head -3 | sed 's/"message":"/  - /;s/"$//'; }

cf() { # cf <METHOD> <path> [body]
  local m="$1" p="$2" b="${3:-}"
  if [ -n "$b" ]; then
    curl -sS -X "$m" "$API$p" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" --data "$b" --max-time 30
  else
    curl -sS -X "$m" "$API$p" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" --max-time 30
  fi
}

# --- resolve zone -----------------------------------------------------------
verify_token() {
  need_token
  local r; r="$(cf GET /user/tokens/verify)"
  ok "$r" || { warn "token verification failed:"; errmsg "$r"; die "bad or expired CF_API_TOKEN"; }
  log "token OK"
}

zone_id() {
  local r; r="$(cf GET "/zones?name=$ZONE_NAME")"
  ok "$r" || { errmsg "$r"; die "cannot list zones — token needs Zone:Read on $ZONE_NAME"; }
  local id; id="$(jget "$r" '.result[0].id' id)"
  [ -n "$id" ] && [ "$id" != "null" ] || die "zone $ZONE_NAME not found on this account"
  printf '%s' "$id"
}

record_id() { # record_id <zone>
  local r; r="$(cf GET "/zones/$1/dns_records?type=A&name=$RECORD.$ZONE_NAME")"
  local id; id="$(jget "$r" '.result[0].id' id)"
  [ "$id" = "null" ] && id=""
  printf '%s' "$id"
}

# --- commands ---------------------------------------------------------------
cmd_check() {
  verify_token
  local z; z="$(zone_id)"; log "zone $ZONE_NAME = $z"

  log "SSL/TLS encryption mode:"
  local s; s="$(cf GET "/zones/$z/settings/ssl")"
  local mode; mode="$(jget "$s" '.result.value' value)"
  printf '  mode = %s\n' "$mode"
  case "$mode" in
    flexible) warn "MODE IS 'flexible' — this causes infinite redirect loops with Laravel behind HTTPS. Switch to 'full' (or 'full (strict)') before cutover." ;;
    full|strict) log "  mode is safe for the ERP" ;;
  esac

  log "existing A/CNAME records:"
  local r; r="$(cf GET "/zones/$z/dns_records?per_page=100")"
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$r" | jq -r '.result[] | select(.type=="A" or .type=="CNAME") | "  \(.type)\t\(.name)\t-> \(.content)\tproxied=\(.proxied)"'
  else
    printf '%s' "$r" | tr ',' '\n' | grep -E '"(name|content|proxied|type)":' | sed 's/^/  /'
  fi

  local ex; ex="$(record_id "$z")"
  if [ -n "$ex" ]; then log "$RECORD.$ZONE_NAME already exists (id $ex) — apply will update it"
  else log "$RECORD.$ZONE_NAME does not exist yet — apply will create it"; fi
}

cmd_apply() {
  verify_token
  local z; z="$(zone_id)"
  local ex; ex="$(record_id "$z")"
  # proxied=false so AutoSSL / certbot HTTP-01 can validate against the origin.
  local body="{\"type\":\"A\",\"name\":\"$RECORD\",\"content\":\"$ORIGIN_IP\",\"ttl\":120,\"proxied\":false,\"comment\":\"ERP moved off apex during kenzed.in cutover\"}"
  local r
  if [ -n "$ex" ]; then
    log "updating existing record $ex -> $ORIGIN_IP (DNS-only)"
    r="$(cf PATCH "/zones/$z/dns_records/$ex" "$body")"
  else
    log "creating $RECORD.$ZONE_NAME -> $ORIGIN_IP (DNS-only)"
    r="$(cf POST "/zones/$z/dns_records" "$body")"
  fi
  ok "$r" || { errmsg "$r"; die "record write failed"; }
  log "record live. TTL 120s."
  echo
  echo "  Next: issue TLS on the server, then run:  ./02-cloudflare-dns.sh proxy-on"
}

cmd_proxy_on() {
  verify_token
  local z; z="$(zone_id)"
  local ex; ex="$(record_id "$z")"
  [ -n "$ex" ] || die "no $RECORD.$ZONE_NAME record — run 'apply' first"

  log "checking the origin serves HTTPS for $RECORD.$ZONE_NAME before enabling the proxy"
  local code
  code="$(curl -sk -o /dev/null -w '%{http_code}' --max-time 15 \
          --resolve "$RECORD.$ZONE_NAME:443:$ORIGIN_IP" "https://$RECORD.$ZONE_NAME/" || echo 000)"
  if [ "$code" = "000" ]; then
    die "origin is not answering HTTPS yet — issue the certificate first, or the proxy will serve 5xx"
  fi
  log "origin HTTPS -> $code"

  local r; r="$(cf PATCH "/zones/$z/dns_records/$ex" '{"proxied":true}')"
  ok "$r" || { errmsg "$r"; die "could not enable proxy"; }
  log "proxy enabled (orange cloud). Cloudflare now fronts $RECORD.$ZONE_NAME."
}

# Resolve A records portably. Windows nslookup and BIND nslookup print
# different shapes, and both echo the *server* address first -- start at
# the "Name:" line so we never report 1.1.1.1 as the answer.
resolve_a() {
  local h="$1"
  if command -v dig >/dev/null 2>&1; then
    { dig +short A "$h" @1.1.1.1 2>/dev/null | grep -E '^([0-9]{1,3}\.){3}[0-9]{1,3}$' | paste -sd' ' -; } || true
  else
    nslookup -type=A "$h" 1.1.1.1 2>/dev/null \
      | sed -n '/Name:/,$p' \
      | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | paste -sd' ' - || true
  fi
  return 0
}

cmd_status() {
  log "public resolution:"
  for host in "$ZONE_NAME" "www.$ZONE_NAME" "$RECORD.$ZONE_NAME"; do
    a="$(resolve_a "$host" || true)"
    printf '  %-22s %s\n' "$host" "${a:-NXDOMAIN}"
  done
  log "http:"
  for url in "https://$ZONE_NAME/" "https://$RECORD.$ZONE_NAME/"; do
    # curl already emits 000 on failure via -w; do not add a second one.
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 12 "$url" 2>/dev/null || true)"
    printf '  %-34s %s\n' "$url" "${code:-000}"
  done
}

case "${1:-check}" in
  check)    cmd_check ;;
  apply)    cmd_apply ;;
  proxy-on) cmd_proxy_on ;;
  status)   cmd_status ;;
  *) die "usage: $0 {check|apply|proxy-on|status}" ;;
esac
