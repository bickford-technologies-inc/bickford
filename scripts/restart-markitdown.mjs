import { execSync } from 'node:child_process'

function sh(command, { stdio = 'inherit' } = {}) {
	return execSync(command, { stdio, env: process.env })
}

function shOut(command) {
	try {
		return execSync(command, {
			stdio: ['ignore', 'pipe', 'ignore'],
			encoding: 'utf8',
			env: process.env,
		}).trim()
	} catch {
		return ''
	}
}

function hasCommand(bin) {
	return shOut(`command -v ${bin} || true`) !== ''
}

function ensureUvx() {
	if (hasCommand('uvx')) return

	// Install Astral 'uv' (includes 'uvx') into ~/.local/bin.
	console.log('uvx not found; installing uv (provides uvx)…')
	sh('curl -LsSf https://astral.sh/uv/install.sh | sh')

	// Ensure current process can find it.
	const home = process.env.HOME || ''
	const localBin = home ? `${home}/.local/bin` : ''
	if (localBin && !process.env.PATH?.includes(localBin)) {
		process.env.PATH = `${localBin}:${process.env.PATH || ''}`
	}

	// Try to make it available from a global PATH location for VS Code-launched processes.
	if (hasCommand('sudo') && localBin) {
		try {
			sh(`sudo ln -sf ${localBin}/uv /usr/local/bin/uv || true`, { stdio: 'ignore' })
			sh(`sudo ln -sf ${localBin}/uvx /usr/local/bin/uvx || true`, { stdio: 'ignore' })
		} catch {
			// Ignore: some environments don't allow sudo.
		}
	}

	if (!hasCommand('uvx')) {
		throw new Error(
			"uvx is still not available on PATH after install. Try restarting your terminal, or ensure ~/.local/bin is on PATH.",
		)
	}
}

function restartMarkitdownProcesses() {
	const snapshot = shOut('ps -eo pid=,args=')
	const lines = snapshot ? snapshot.split('\n') : []
	const pids = []

	for (const line of lines) {
		const trimmed = line.trim()
		if (!trimmed) continue
		const firstSpace = trimmed.indexOf(' ')
		if (firstSpace <= 0) continue

		const pidStr = trimmed.slice(0, firstSpace).trim()
		const args = trimmed.slice(firstSpace + 1)
		const pid = Number(pidStr)
		if (!Number.isFinite(pid) || pid <= 0) continue
		if (pid === process.pid || pid === process.ppid) continue
		// Avoid killing our own restart helper invocation.
		if (/restart-markitdown\.mjs/i.test(args)) continue
		if (/restart:markitdown/i.test(args)) continue
		if (!/markitdown/i.test(args)) continue

		pids.push({ pid, args })
	}

	if (pids.length === 0) {
		console.log('No running markitdown processes found.')
		return
	}

	console.log('Found markitdown-related processes; stopping them…')
	for (const p of pids) console.log(`${p.pid} ${p.args}`)

	for (const p of pids) {
		try {
			process.kill(p.pid, 'SIGTERM')
		} catch {
			// ignore
		}
	}

	// Give processes a moment to exit.
	sh('sleep 0.4 || true', { stdio: 'ignore' })

	const afterSnap = shOut('ps -eo pid=,args=')
	const stillRunning = []
	for (const p of pids) {
		if (afterSnap.includes(String(p.pid))) stillRunning.push(p)
	}

	if (stillRunning.length > 0) {
		console.log('Some markitdown processes still appear to be running; force-killing…')
		for (const p of stillRunning) {
			try {
				process.kill(p.pid, 'SIGKILL')
			} catch {
				// ignore
			}
		}
		sh('sleep 0.2 || true', { stdio: 'ignore' })
	}

	console.log('Markitdown processes stopped (if any were running).')
}

function main() {
	ensureUvx()
	console.log(`uvx OK: ${shOut('uvx --version')}`)

	restartMarkitdownProcesses()

	console.log('\nNext: re-run the action that starts MarkItDown in VS Code.')
	console.log(
		"If VS Code still reports issues, it usually means the extension host needs a reload (can’t be fully automated from inside the container).",
	)
}

try {
	main()
} catch (err) {
	console.error(String(err?.message || err))
	process.exitCode = 1
}
