#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# FINAL CUTOVER — run on the VPS, only after erp.kenzed.in resolves publicly
# and has a valid certificate.
#
#   ssh kenzedvps 'DRY_RUN=0 bash /root/03-cutover.sh'
#
# Everything before this point was additive and invisible to users:
#   - erp.kenzed.in vhost created, already serving the ERP from the origin
#   - static site staged at /home/kenzed.in/site and fully verified
# This script performs the only user-visible change: repointing the apex.
# ---------------------------------------------------------------------------
set -Eeuo pipefail

DRY_RUN="${DRY_RUN:-1}"
SITE_DIR=/home/kenzed.in/site
LARAVEL=/home/kenzed.in/public_html
VHOST=/usr/local/lsws/conf/vhosts/kenzed.in/vhost.conf
BK=/root/kenzed-cutover-backup
STAMP="$(date +%Y%m%d-%H%M%S)"

log()  { printf '\033[1;34m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[fail]\033[0m %s\n' "$*" >&2; exit 1; }
run()  { if [ "$DRY_RUN" = "1" ]; then printf '  would run: %s\n' "$*"; else eval "$@"; fi; }

[ "$DRY_RUN" = "1" ] && warn "DRY RUN — re-run with DRY_RUN=0 to apply."

# ---------- gate: the ERP must be publicly reachable FIRST ----------------
# These gates are the only thing standing between a clean cutover and an ERP
# outage, so they resolve against a PUBLIC resolver -- never getent//etc/hosts,
# which happily answers ::1 for a name that does not exist on the internet.
resolve_public() {
  local h="$1"
  if command -v dig >/dev/null 2>&1; then
    dig +short A "$h" @1.1.1.1 2>/dev/null | grep -E '^([0-9]{1,3}\.){3}[0-9]{1,3}$' || true
  elif command -v host >/dev/null 2>&1; then
    host -t A "$h" 1.1.1.1 2>/dev/null | awk '/has address/{print $NF}' || true
  else
    die "no dig/host available — install bind-utils so the DNS gate can be trusted"
  fi
}

log "gate 1/3 — erp.kenzed.in must resolve publicly"
ips="$(resolve_public erp.kenzed.in | grep -vE '^(127\.|0\.|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)' | paste -sd' ' - || true)"
[ -n "${ips:-}" ] || die "erp.kenzed.in does not resolve publicly. Add the Cloudflare A record first — cutting over now would take the ERP offline."
log "  resolves to: $ips"

log "gate 2/3 — erp.kenzed.in must serve valid HTTPS"
# No '|| echo 000' here: curl already prints a code via -w, and appending a
# second one produced '000000', which silently passed a '!= 000' test.
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://erp.kenzed.in/ 2>/dev/null)"
code="${code:-000}"
case "$code" in
  2??|3??) log "  https -> $code" ;;
  *)       die "https://erp.kenzed.in returned '$code' (a valid certificate is required). Issue TLS before cutover." ;;
esac

log "gate 3/3 — the staged site must be intact"
[ -f "$SITE_DIR/index.html" ] || die "missing $SITE_DIR/index.html"
grep -q "Kenzed Tech Lab" "$SITE_DIR/index.html" \
  || die "$SITE_DIR/index.html is not the real homepage (CyberPanel placeholder?). Re-extract before cutover."
log "  staged site OK ($(find "$SITE_DIR" -type f | wc -l) files)"

# ---------- 1. point Laravel at its new hostname --------------------------
log "1/4 updating Laravel APP_URL -> https://erp.kenzed.in"
run "cp -a '$LARAVEL/.env' '$BK/erp-env-precutover-$STAMP.bak'"
run "sed -i -E 's#^APP_URL=.*#APP_URL=https://erp.kenzed.in#' '$LARAVEL/.env'"
run "cd '$LARAVEL' && /usr/local/lsws/lsphp83/bin/php artisan config:clear"
run "cd '$LARAVEL' && /usr/local/lsws/lsphp83/bin/php artisan cache:clear"
run "cd '$LARAVEL' && /usr/local/lsws/lsphp83/bin/php artisan config:cache"

# ---------- 2. repoint the apex at the static site ------------------------
log "2/4 repointing kenzed.in docRoot -> $SITE_DIR"
run "cp -a '$VHOST' '$BK/kenzed.in-vhost-precutover-$STAMP.conf'"
run "sed -i -E 's#^(docRoot[[:space:]]+).*#\1$SITE_DIR#' '$VHOST'"
# index.html first: the static site has no index.php
run "sed -i -E 's#^([[:space:]]*indexFiles[[:space:]]+).*#\1index.html#' '$VHOST'"
if ! grep -q "errorpage 404" "$VHOST"; then
  run "printf '\nerrorpage 404 {\n  url                     /404.html\n}\n' >> '$VHOST'"
fi

# ---------- 3. reload + flush every cache layer ---------------------------
log "3/4 reloading LiteSpeed and flushing caches"
run "/usr/local/lsws/bin/lswsctrl reload"
run "rm -rf /usr/local/lsws/cachedata/kenzed.in"
run "sleep 4"

# ---------- 4. verify -----------------------------------------------------
log "4/4 verifying"
if [ "$DRY_RUN" = "0" ]; then
  fail=0
  # Every route, not a sample. The old list happened to contain only routes that
  # existed in the previous build too, so it printed "all checks passed" against
  # an archive that was missing two pages entirely.
  for p in / /about /services /contact /technology /team /infrastructure /process /industries /product-studio /live-projects /services/ai-agent-development; do
    c="$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: kenzed.in' "http://127.0.0.1$p" --max-time 15)"
    printf '  kenzed.in%-38s %s\n' "$p" "$c"
    [ "$c" = "200" ] || fail=1
  done
  t="$(curl -s -H 'Host: kenzed.in' http://127.0.0.1/ --max-time 15 | grep -oE '<title>[^<]*' | head -1)"
  printf '  homepage title: %s\n' "$t"
  echo "$t" | grep -q "Kenzed Tech Lab" || fail=1

  c="$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: erp.kenzed.in' http://127.0.0.1/ --max-time 15)"
  printf '  erp.kenzed.in/  %s\n' "$c"
  [ "$c" = "200" ] || fail=1

  if [ "$fail" = "1" ]; then
    warn "VERIFICATION FAILED — rolling back is one command, see below"
    die "cutover verification failed"
  fi
  log "all checks passed"
fi

cat <<NOTE

  Post-cutover:
    - purge the Cloudflare cache for kenzed.in
    - remove the staging vhost:  cyberpanel deleteChild --childDomain stage.kenzed.in
    - the ERP's old bookmarks (kenzed.in/login etc.) now hit the marketing site;
      add redirects to $SITE_DIR/.htaccess if you want them forwarded.

  Rollback (restores the ERP on the apex in ~5 seconds):
    cp $BK/kenzed.in-vhost-precutover-$STAMP.conf $VHOST
    cp $BK/erp-env-precutover-$STAMP.bak $LARAVEL/.env
    cd $LARAVEL && /usr/local/lsws/lsphp83/bin/php artisan config:cache
    /usr/local/lsws/bin/lswsctrl reload && rm -rf /usr/local/lsws/cachedata/kenzed.in
NOTE
log "done."
