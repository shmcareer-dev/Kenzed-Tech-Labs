#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# kenzed.in cutover
#   - existing Laravel ERP  :  kenzed.in  ->  erp.kenzed.in
#   - new static site       :  kenzed.in
#
# Idempotent. Backs up before touching anything. DRY_RUN=1 by default.
#
#   Upload:  scp kenzed-web-dist.tar.gz 01-migrate-and-deploy.sh root@46.202.163.242:/root/
#   Dry run: ssh root@46.202.163.242 'bash /root/01-migrate-and-deploy.sh'
#   Apply:   ssh root@46.202.163.242 'DRY_RUN=0 bash /root/01-migrate-and-deploy.sh'
# ---------------------------------------------------------------------------
set -Eeuo pipefail

# ---- fill these in from 00-inspect.sh output ------------------------------
CPUSER="${CPUSER:-}"                       # e.g. kenzedin
ERP_BASE="${ERP_BASE:-}"                   # Laravel root (the dir holding artisan)
WEB_ROOT="${WEB_ROOT:-}"                   # docroot currently serving kenzed.in
ERP_DEST="${ERP_DEST:-/home/$CPUSER/erp.kenzed.in}"   # new Laravel home
ERP_DOCROOT="${ERP_DOCROOT:-$ERP_DEST/public}"
ARCHIVE="${ARCHIVE:-/root/kenzed-web-dist.tar.gz}"
BACKUP_DIR="${BACKUP_DIR:-/root/kenzed-cutover-backup}"
# --------------------------------------------------------------------------

DRY_RUN="${DRY_RUN:-1}"
STAMP="$(date +%Y%m%d-%H%M%S)"

log()  { printf '\033[1;34m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[fail]\033[0m %s\n' "$*" >&2; exit 1; }
run()  { if [ "$DRY_RUN" = "1" ]; then printf '  would run: %s\n' "$*"; else eval "$@"; fi; }

trap 'die "aborted at line $LINENO — nothing further was changed. Backups are in $BACKUP_DIR"' ERR

[ "$DRY_RUN" = "1" ] && warn "DRY RUN — no changes will be made. Re-run with DRY_RUN=0 to apply."

# ---------- preflight ------------------------------------------------------
log "preflight"
[ -n "$CPUSER"   ] || die "CPUSER not set (see 00-inspect.sh output)"
[ -n "$ERP_BASE" ] || die "ERP_BASE not set"
[ -n "$WEB_ROOT" ] || die "WEB_ROOT not set"
[ -f "$ERP_BASE/artisan" ] || die "no artisan at $ERP_BASE — wrong ERP_BASE"
[ -f "$ARCHIVE" ] || die "archive missing: $ARCHIVE"
[ -d "$WEB_ROOT" ] || die "docroot missing: $WEB_ROOT"
tar -tzf "$ARCHIVE" >/dev/null || die "archive is corrupt"
tar -tzf "$ARCHIVE" | grep -q '^\./index\.html$' || die "archive has no index.html at its root"

# A stale archive is the failure this gate exists to catch. The old one passed
# every check above — it HAD an index.html, and the post-deploy verifier only
# probed routes that existed in both builds — so it would have published the
# pre-rewrite site with two dead URLs and reported success. Name the routes that
# only exist in the current build; if any is absent, the archive predates it.
for want in ./live-projects.html ./product-studio.html ./industries.html; do
  tar -tzf "$ARCHIVE" | grep -qxF "$want"     || die "archive is stale (missing $want). Rebuild first: npm run build && tar -czf deploy/kenzed-web-dist.tar.gz -C dist ."
done
tar -tzf "$ARCHIVE" | grep -q '^\./\.htaccess$'   || die "archive has no .htaccess — clean URLs and the www redirect would both break" 
avail_kb=$(df -Pk /home | awk 'NR==2{print $4}')
[ "$avail_kb" -gt 2000000 ] || die "less than 2GB free on /home — aborting"
log "preflight OK  (user=$CPUSER  erp=$ERP_BASE  docroot=$WEB_ROOT)"

# ---------- 1. back up -----------------------------------------------------
log "1/6 backing up to $BACKUP_DIR"
run "mkdir -p '$BACKUP_DIR'"
run "tar -czf '$BACKUP_DIR/erp-files-$STAMP.tar.gz' -C '$(dirname "$ERP_BASE")' '$(basename "$ERP_BASE")'"
run "tar -czf '$BACKUP_DIR/webroot-$STAMP.tar.gz' -C '$WEB_ROOT' ."

DB_NAME=$(grep -E '^DB_DATABASE=' "$ERP_BASE/.env" 2>/dev/null | cut -d= -f2- | tr -d '"'"'"' ' || true)
if [ -n "${DB_NAME:-}" ]; then
  log "     dumping database $DB_NAME"
  run "mysqldump --single-transaction --routines --triggers '$DB_NAME' | gzip > '$BACKUP_DIR/erp-db-$DB_NAME-$STAMP.sql.gz'"
else
  warn "could not read DB_DATABASE from $ERP_BASE/.env — skipping DB dump. Take one manually before applying."
fi

# ---------- 2. create the erp.kenzed.in subdomain --------------------------
log "2/6 creating erp.kenzed.in subdomain"
if command -v uapi >/dev/null 2>&1; then
  run "uapi --user='$CPUSER' SubDomain addsubdomain domain=erp rootdomain=kenzed.in dir='$ERP_DOCROOT' || true"
else
  warn "no cPanel uapi — create the vhost for erp.kenzed.in manually with docroot $ERP_DOCROOT"
fi

# ---------- 3. move the Laravel app ---------------------------------------
log "3/6 moving ERP -> $ERP_DEST"
if [ "$ERP_BASE" != "$ERP_DEST" ]; then
  run "mkdir -p '$(dirname "$ERP_DEST")'"
  run "rsync -a --delete '$ERP_BASE/' '$ERP_DEST/'"
else
  log "     already in place"
fi

# ---------- 4. repoint the ERP at its new hostname -------------------------
log "4/6 updating Laravel config for erp.kenzed.in"
ENV="$ERP_DEST/.env"
run "cp '$ENV' '$BACKUP_DIR/erp-env-$STAMP.bak'"
run "sed -i -E 's#^APP_URL=.*#APP_URL=https://erp.kenzed.in#' '$ENV'"
run "grep -q '^SESSION_DOMAIN=' '$ENV' && sed -i -E 's#^SESSION_DOMAIN=.*#SESSION_DOMAIN=erp.kenzed.in#' '$ENV' || echo 'SESSION_DOMAIN=erp.kenzed.in' >> '$ENV'"
run "sed -i -E 's#^APP_ENV=.*#APP_ENV=production#' '$ENV'"
run "sed -i -E 's#^APP_DEBUG=.*#APP_DEBUG=false#' '$ENV'"

run "cd '$ERP_DEST' && php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear"
run "cd '$ERP_DEST' && php artisan storage:link || true"
run "cd '$ERP_DEST' && php artisan config:cache && php artisan route:cache"
run "chown -R '$CPUSER:$CPUSER' '$ERP_DEST'"
run "find '$ERP_DEST/storage' '$ERP_DEST/bootstrap/cache' -type d -exec chmod 775 {} +"

# ---------- 5. publish the static site to kenzed.in ------------------------
log "5/6 publishing static site to $WEB_ROOT"
STAGING="/root/kenzed-web-staging-$STAMP"
run "rm -rf '$STAGING' && mkdir -p '$STAGING'"
run "tar -xzf '$ARCHIVE' -C '$STAGING'"
run "[ -f '$STAGING/index.html' ] || { echo 'extract failed'; exit 1; }"
# Atomic-ish swap: stage beside the docroot, then rsync --delete into it.
run "rsync -a --delete --exclude 'cgi-bin' --exclude '.well-known' '$STAGING/' '$WEB_ROOT/'"
run "chown -R '$CPUSER:$CPUSER' '$WEB_ROOT'"
run "find '$WEB_ROOT' -type d -exec chmod 755 {} + && find '$WEB_ROOT' -type f -exec chmod 644 {} +"
run "rm -rf '$STAGING'"

# ---------- 6. TLS + verify ------------------------------------------------
log "6/6 issuing TLS for erp.kenzed.in and verifying"
if command -v /usr/local/cpanel/bin/autossl_check >/dev/null 2>&1; then
  run "/usr/local/cpanel/bin/autossl_check --user='$CPUSER' || true"
elif command -v certbot >/dev/null 2>&1; then
  run "certbot --non-interactive --agree-tos --expand -d erp.kenzed.in --webroot -w '$ERP_DOCROOT' || true"
else
  warn "no autossl/certbot found — issue the erp.kenzed.in certificate manually"
fi

if [ "$DRY_RUN" = "0" ]; then
  log "verifying origin responses"
  printf '  kenzed.in      -> %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: kenzed.in' http://127.0.0.1/)"
  printf '  kenzed.in/about-> %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: kenzed.in' http://127.0.0.1/about)"
  printf '  erp.kenzed.in  -> %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: erp.kenzed.in' http://127.0.0.1/)"
fi

log "done. Backups: $BACKUP_DIR"
cat <<'NOTE'

  REMAINING MANUAL STEP — DNS is on Cloudflare, not this server:
    add an A record   erp  ->  46.202.163.242   (proxied)
  The subdomain will not resolve publicly until that record exists.

  Rollback:
    tar -xzf BACKUP_DIR/webroot-STAMP.tar.gz -C WEB_ROOT
    tar -xzf BACKUP_DIR/erp-files-STAMP.tar.gz -C parent-of-ERP_BASE
NOTE
