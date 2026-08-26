#!/usr/bin/env bash
#
# Publish a built release to the kenzed.in web root.
#
#   ./deploy/push-to-vps.sh deploy/kenzed-<commit>-dist.tar.gz [webroot]
#
# Run it from the repo root. It asks for the root password once (SSH prompts;
# nothing is stored, nothing is passed on a command line where it would show up
# in the process list).
#
# What it does, in order:
#   1. copies the bundle to /tmp on the server
#   2. unpacks it into a NEW timestamped directory next to the web root
#   3. takes a backup of what is currently live
#   4. swaps the new release in, and only then removes the staging copy
#
# The swap is two moves rather than an unpack-over-the-top, so the site is
# never half-old and half-new while files are being written, and the previous
# release is still on disk if it has to go back.

set -euo pipefail

BUNDLE="${1:-}"
WEBROOT="${2:-}"   # empty = detect it on the server, same rule CI uses
HOST="root@46.202.163.242"

if [[ -z "$BUNDLE" || ! -f "$BUNDLE" ]]; then
  echo "usage: $0 <bundle.tar.gz> [webroot]" >&2
  echo "       the bundle is built by: npm run build && tar czf deploy/kenzed-\$(git rev-parse --short HEAD)-dist.tar.gz -C dist ." >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
REMOTE_TMP="/tmp/kenzed-$STAMP.tar.gz"

echo "==> bundle : $BUNDLE ($(du -h "$BUNDLE" | cut -f1))"
echo "==> host   : $HOST"
echo "==> webroot: (detected on the server)"
echo

# One connection for the whole run, so the password is entered once.
CTL="$(mktemp -u /tmp/kzctl-XXXXXX)"
ssh -o ControlMaster=yes -o ControlPath="$CTL" -o ControlPersist=300 -fN "$HOST"
trap 'ssh -o ControlPath="$CTL" -O exit "$HOST" 2>/dev/null || true' EXIT
SSH=(ssh -o ControlPath="$CTL" "$HOST")

# Find the web root rather than guessing at one. Whatever comes back has to
# already hold a Kenzed index.html before anything is allowed to touch it, so a
# wrong answer refuses instead of overwriting some other site on the same box.
echo "==> locating the web root"
WEBROOT="$("${SSH[@]}" "WANT='$WEBROOT' bash -s" <<'FIND' | tr -d '\r' | tail -n1
set -eu
if [ -n "${WANT:-}" ]; then echo "$WANT"; exit 0; fi
for cfg in /usr/local/lsws/conf/vhosts/kenzed.in/vhost.conf /usr/local/lsws/conf/vhosts/*/vhost.conf; do
  [ -f "$cfg" ] || continue
  d="$(awk '/^[[:space:]]*docRoot/{print $2; exit}' "$cfg")"
  [ -n "$d" ] || continue
  vh="$(dirname "$cfg")"
  d="$(printf '%s' "$d" | sed "s|\$VH_ROOT|$vh|g; s|\$SERVER_ROOT|/usr/local/lsws|g")"
  if [ -f "$d/index.html" ] && grep -qi kenzed "$d/index.html"; then echo "$d"; exit 0; fi
done
for d in /home/*/public_html /home/*/domains/kenzed.in/public_html /var/www/kenzed.in/html /var/www/kenzed.in /var/www/html /usr/local/lsws/kenzed.in/html; do
  if [ -f "$d/index.html" ] && grep -qi kenzed "$d/index.html"; then echo "$d"; exit 0; fi
done
echo NOTFOUND
FIND
)"
if [ "$WEBROOT" = "NOTFOUND" ] || [ -z "$WEBROOT" ]; then
  echo "Could not find the web root. Pass it explicitly:" >&2
  echo "  $0 $BUNDLE /path/to/docroot" >&2
  "${SSH[@]}" 'ls -d /home/*/public_html /var/www/* /usr/local/lsws/*/html 2>/dev/null | head -20' || true
  exit 1
fi
echo "    $WEBROOT"
"${SSH[@]}" "echo \"currently \$(find '$WEBROOT' -maxdepth 1 -type f | wc -l) files at the top level\""

echo "==> uploading"
scp -o ControlPath="$CTL" "$BUNDLE" "$HOST:$REMOTE_TMP"

echo "==> unpacking, backing up, swapping"
"${SSH[@]}" bash -s -- "$WEBROOT" "$REMOTE_TMP" "$STAMP" <<'REMOTE'
set -euo pipefail
WEBROOT="$1"; BUNDLE="$2"; STAMP="$3"
PARENT="$(dirname "$WEBROOT")"
NAME="$(basename "$WEBROOT")"
STAGE="$PARENT/.$NAME-new-$STAMP"
BACKUP="$PARENT/$NAME-backup-$STAMP"

rm -rf "$STAGE"; mkdir -p "$STAGE"
tar xzf "$BUNDLE" -C "$STAGE"

# The export ships .htaccess; if the live root has one the bundle does not,
# carry it across rather than dropping it.
if [[ -f "$WEBROOT/.htaccess" && ! -f "$STAGE/.htaccess" ]]; then
  cp -p "$WEBROOT/.htaccess" "$STAGE/.htaccess"
  echo "    carried the existing .htaccess forward"
fi

test -f "$STAGE/index.html" || { echo "bundle has no index.html — refusing to swap" >&2; exit 1; }

mv "$WEBROOT" "$BACKUP"
mv "$STAGE" "$WEBROOT"
chown -R --reference="$BACKUP" "$WEBROOT" 2>/dev/null || true
chmod -R u=rwX,go=rX "$WEBROOT"
rm -f "$BUNDLE"

echo "    previous release kept at: $BACKUP"
echo "    live now: $(find "$WEBROOT" -maxdepth 1 -type f | wc -l) files at the top level"
REMOTE

echo
echo "==> verifying over HTTP"
for path in / /product-studio /privacy /terms; do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://kenzed.in$path" || echo ERR)"
  printf '    %-16s %s\n' "$path" "$code"
done

echo
echo "Done. If anything looks wrong, roll back with:"
echo "  ssh $HOST 'rm -rf \"$WEBROOT\" && mv \"$(dirname "$WEBROOT")/$(basename "$WEBROOT")-backup-$STAMP\" \"$WEBROOT\"'"
