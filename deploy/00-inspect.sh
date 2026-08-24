#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# READ-ONLY. Changes nothing. Run this on the VPS first and send me the output.
#   ssh root@46.202.163.242 'bash -s' < 00-inspect.sh
# ---------------------------------------------------------------------------
set -uo pipefail
line() { printf '\n=== %s ===\n' "$1"; }

line "host"
hostname; cat /etc/os-release 2>/dev/null | head -2; uptime

line "control panel"
for p in /usr/local/cpanel/cpanel /usr/local/hestia /usr/local/CyberCP /usr/local/lsws; do
  [ -e "$p" ] && echo "FOUND: $p"
done
command -v whmapi1 >/dev/null && echo "whmapi1 available (cPanel/WHM)"
command -v uapi   >/dev/null && echo "uapi available"

line "web server"
(systemctl is-active lsws httpd apache2 nginx 2>/dev/null) | paste -d' ' - -
command -v /usr/local/lsws/bin/lshttpd >/dev/null && /usr/local/lsws/bin/lshttpd -v 2>/dev/null | head -2

line "cPanel accounts / docroots"
[ -f /etc/userdomains ] && cat /etc/userdomains
[ -f /etc/localdomains ] && echo "--- localdomains ---" && cat /etc/localdomains

line "what is serving kenzed.in"
grep -rl "kenzed.in" /etc/apache2/conf/httpd.conf /usr/local/apache/conf/httpd.conf \
  /etc/nginx/ /usr/local/lsws/conf/ 2>/dev/null | head -10

line "docroot candidates"
for d in /home/*/public_html /var/www/html /home/*/domains/*/public_html; do
  [ -d "$d" ] && echo "--- $d ---" && ls -la "$d" | head -12
done

line "laravel app detection"
for d in /home/*/public_html /home/*/*/public_html /var/www/html; do
  if [ -f "$d/../artisan" ] || [ -f "$d/artisan" ]; then
    echo "LARAVEL near: $d"
    base="$d"; [ -f "$d/../artisan" ] && base="$(dirname "$d")"
    echo "  base: $base"
    grep -E '^(APP_NAME|APP_ENV|APP_URL|APP_DEBUG|DB_DATABASE|DB_USERNAME|SESSION_DOMAIN|SESSION_DRIVER)=' "$base/.env" 2>/dev/null
    php -r 'echo "  php: ".PHP_VERSION."\n";' 2>/dev/null
  fi
done

line "existing subdomains"
[ -d /var/cpanel/userdata ] && ls /var/cpanel/userdata/*/ 2>/dev/null | head -30

line "disk + free space"
df -h / /home 2>/dev/null

line "ssl certs present"
ls /etc/letsencrypt/live/ 2>/dev/null || echo "no letsencrypt dir"

line "DONE — nothing was modified"
