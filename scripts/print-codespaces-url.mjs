const port = process.env.PORT_FORWARD || process.env.PORT || '5173';
const name = process.env.CODESPACE_NAME;
const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

if (!name || !domain) {
  console.log(
    'Codespaces URL cannot be derived from env in this shell. Open the Ports tab and copy the forwarded URL for port ' +
      port +
      '.'
  );
  process.exit(0);
}

console.log(`https://${name}-${port}.${domain}/`);
